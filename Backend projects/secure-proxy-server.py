"""
Secure GitHub API Proxy with Encrypted Token Management
========================================================
Production-ready proxy server with encrypted token storage.

Features:
- Encrypted token storage (not plain text)
- Admin portal for token management
- No tokens exposed to frontend
- Automatic rotation
- CORS protection
- Rate limit handling

Setup:
    pip install -r requirements.txt
    python setup-tokens.py  # One-time setup (admin only)
    python secure-proxy-server.py
"""

import os
import json
import base64
import hashlib
from itertools import cycle
from cryptography.fernet import Fernet
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import requests
import time
from functools import lru_cache

app = Flask(__name__)

# Configuration
SECRET_KEY = os.getenv('SECRET_KEY', Fernet.generate_key().decode())
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'your_secure_admin_password_here')
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')  # Allow external access in production

# Enable CORS (Allow all origins for public API, but protect admin routes)
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# Encryption setup
cipher = Fernet(SECRET_KEY.encode() if isinstance(SECRET_KEY, str) else SECRET_KEY)

# Token storage file (encrypted)
TOKENS_FILE = 'tokens.enc'

def encrypt_tokens(tokens):
    """Encrypt list of tokens"""
    tokens_json = json.dumps(tokens)
    return cipher.encrypt(tokens_json.encode()).decode()

def decrypt_tokens():
    """Decrypt and return list of tokens"""
    try:
        if not os.path.exists(TOKENS_FILE):
            print("⚠️  No tokens file found. Run setup-tokens.py first!")
            return []
        
        with open(TOKENS_FILE, 'r') as f:
            encrypted_data = f.read()
        
        decrypted = cipher.decrypt(encrypted_data.encode())
        tokens = json.loads(decrypted.decode())
        return tokens
    except Exception as e:
        print(f"❌ Error decrypting tokens: {e}")
        return []

# Load tokens on startup
GITHUB_TOKENS = decrypt_tokens()
if GITHUB_TOKENS:
    token_pool = cycle(GITHUB_TOKENS)
    print(f"✅ Loaded {len(GITHUB_TOKENS)} encrypted tokens")
else:
    token_pool = None
    print("⚠️  No tokens loaded. Running in public mode only.")

# Rate limit tracking
rate_limit_info = {
    'remaining': 60,
    'limit': 60,
    'reset': time.time() + 3600
}

# Token usage tracking (detailed analytics)
token_usage_stats = {}
request_log = []  # Track recent requests

def initialize_token_stats():
    """Initialize statistics for each token"""
    global token_usage_stats
    for i, token in enumerate(GITHUB_TOKENS):
        token_id = f"{token[:8]}...{token[-4:]}" if len(token) > 12 else f"Token-{i+1}"
        if token_id not in token_usage_stats:
            token_usage_stats[token_id] = {
                'token_masked': token_id,
                'token_full': token,  # Keep for verification
                'usage_count': 0,
                'endpoints_used': {},  # Track which endpoints
                'last_used': None,
                'rate_limit': {'remaining': 5000, 'limit': 5000, 'reset': None},
                'status': 'active',
                'error_count': 0,
                'success_count': 0
            }

# Initialize stats on startup
initialize_token_stats()

def get_next_token():
    """Get next token from rotation pool"""
    if token_pool and GITHUB_TOKENS:
        return next(token_pool)
    return None

def track_token_usage(token, endpoint, success=True):
    """Track token usage for analytics"""
    if not token:
        return
    
    token_id = f"{token[:8]}...{token[-4:]}" if len(token) > 12 else "Unknown"
    
    if token_id in token_usage_stats:
        stats = token_usage_stats[token_id]
        stats['usage_count'] += 1
        stats['last_used'] = time.time()
        
        # Track endpoints
        if endpoint not in stats['endpoints_used']:
            stats['endpoints_used'][endpoint] = 0
        stats['endpoints_used'][endpoint] += 1
        
        # Track success/error
        if success:
            stats['success_count'] += 1
        else:
            stats['error_count'] += 1

def update_token_rate_limit(token, headers):
    """Update rate limit info for specific token"""
    if not token or not headers:
        return
    
    token_id = f"{token[:8]}...{token[-4:]}" if len(token) > 12 else "Unknown"
    
    if token_id in token_usage_stats:
        if 'X-RateLimit-Remaining' in headers:
            token_usage_stats[token_id]['rate_limit'] = {
                'remaining': int(headers.get('X-RateLimit-Remaining', 0)),
                'limit': int(headers.get('X-RateLimit-Limit', 5000)),
                'reset': int(headers.get('X-RateLimit-Reset', 0))
            }
        
        # Check if token is expired/invalid
        if headers.get('status') == '401':
            token_usage_stats[token_id]['status'] = 'invalid'
        elif int(headers.get('X-RateLimit-Remaining', 5000)) == 0:
            token_usage_stats[token_id]['status'] = 'rate_limited'
        else:
            token_usage_stats[token_id]['status'] = 'active'

def log_request(endpoint, token_used, status_code):
    """Log recent requests for monitoring"""
    global request_log
    request_log.append({
        'timestamp': time.time(),
        'endpoint': endpoint,
        'token': token_used,
        'status': status_code,
        'time_str': time.strftime('%Y-%m-%d %H:%M:%S')
    })
    
    # Keep only last 100 requests
    if len(request_log) > 100:
        request_log = request_log[-100:]

def get_headers(use_token=True):
    """Get headers for GitHub API request"""
    headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Proxy/2.0'
    }
    
    if use_token:
        token = get_next_token()
        if token:
            headers['Authorization'] = f'Bearer {token}'
            headers['X-Current-Token'] = f"{token[:8]}...{token[-4:]}"  # For tracking
    
    return headers

def verify_admin(password):
    """Verify admin password"""
    return password == ADMIN_PASSWORD

# ============================================
# PUBLIC ENDPOINTS (No authentication needed)
# ============================================

@app.route('/api/github/<path:github_path>', methods=['GET'])
def proxy_github(github_path):
    """
    Public endpoint - Proxy GitHub API requests
    No authentication required
    """
    current_token = None
    try:
        github_url = f'https://api.github.com/{github_path}'
        params = request.args.to_dict()
        
        # Use token rotation automatically
        headers = get_headers()
        current_token = headers.get('X-Current-Token', 'No token')
        
        response = requests.get(github_url, headers=headers, params=params, timeout=10)
        
        # Extract actual token for tracking
        auth_header = headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            actual_token = auth_header.replace('Bearer ', '')
            
            # Track usage
            track_token_usage(actual_token, github_path, success=(response.status_code == 200))
            
            # Update rate limit
            update_token_rate_limit(actual_token, response.headers)
        
        # Log request
        log_request(github_path, current_token, response.status_code)
        
        # Update global rate limit tracking
        if 'X-RateLimit-Remaining' in response.headers:
            rate_limit_info['remaining'] = int(response.headers['X-RateLimit-Remaining'])
            rate_limit_info['limit'] = int(response.headers['X-RateLimit-Limit'])
            rate_limit_info['reset'] = int(response.headers['X-RateLimit-Reset'])
        
        # Auto-fallback if rate limited
        if response.status_code == 403 and 'rate limit' in response.text.lower():
            print(f"⚠️  Rate limit hit for {current_token}, trying public access...")
            headers = get_headers(use_token=False)
            response = requests.get(github_url, headers=headers, params=params, timeout=10)
            log_request(github_path, 'Public (no token)', response.status_code)
        
        return jsonify(response.json()), response.status_code
        
    except Exception as e:
        log_request(github_path, current_token, 500)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Public health check"""
    return jsonify({
        'status': 'healthy',
        'tokens_active': len(GITHUB_TOKENS) > 0,
        'effective_limit': len(GITHUB_TOKENS) * 5000 if GITHUB_TOKENS else 60,
        'version': '2.0'
    })

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'name': 'Secure GitHub API Proxy',
        'version': '2.0',
        'status': 'running',
        'endpoints': {
            'public': {
                '/api/github/<path>': 'Proxy GitHub API',
                '/health': 'Health check'
            },
            'admin': {
                '/admin/tokens': 'Manage tokens (requires auth)',
                '/admin/stats': 'View statistics (requires auth)'
            }
        }
    })

# ============================================
# ADMIN ENDPOINTS (Authentication required)
# ============================================

@app.route('/admin/tokens', methods=['GET', 'POST', 'DELETE'])
def manage_tokens():
    """
    Admin endpoint - Manage tokens
    Requires admin password in header
    """
    # Check authentication
    auth_header = request.headers.get('X-Admin-Password')
    if not auth_header or not verify_admin(auth_header):
        abort(401, description='Unauthorized - Invalid admin password')
    
    global token_pool, GITHUB_TOKENS
    
    if request.method == 'GET':
        # Return masked tokens (for security)
        masked = [f"{t[:8]}...{t[-4:]}" if len(t) > 12 else "***" for t in GITHUB_TOKENS]
        return jsonify({
            'count': len(GITHUB_TOKENS),
            'tokens': masked,
            'effective_limit': len(GITHUB_TOKENS) * 5000
        })
    
    elif request.method == 'POST':
        # Add new tokens
        data = request.get_json()
        new_tokens = data.get('tokens', [])
        
        if not new_tokens:
            return jsonify({'error': 'No tokens provided'}), 400
        
        # Validate tokens (basic check)
        valid_tokens = [t.strip() for t in new_tokens if len(t.strip()) > 20]
        
        if not valid_tokens:
            return jsonify({'error': 'No valid tokens provided'}), 400
        
        # Merge with existing (avoid duplicates)
        GITHUB_TOKENS.extend([t for t in valid_tokens if t not in GITHUB_TOKENS])
        
        # Save encrypted
        encrypted_data = encrypt_tokens(GITHUB_TOKENS)
        with open(TOKENS_FILE, 'w') as f:
            f.write(encrypted_data)
        
        # Reinitialize token pool and stats
        token_pool = cycle(GITHUB_TOKENS)
        initialize_token_stats()
        
        return jsonify({
            'success': True,
            'total_tokens': len(GITHUB_TOKENS),
            'new_tokens_added': len(valid_tokens)
        })
    
    elif request.method == 'DELETE':
        # Clear all tokens
        GITHUB_TOKENS.clear()
        if os.path.exists(TOKENS_FILE):
            os.remove(TOKENS_FILE)
        token_pool = None
        
        return jsonify({'success': True, 'message': 'All tokens cleared'})

@app.route('/admin/stats', methods=['GET'])
def admin_stats():
    """
    Admin endpoint - View statistics
    Requires admin password
    """
    auth_header = request.headers.get('X-Admin-Password')
    if not auth_header or not verify_admin(auth_header):
        abort(401, description='Unauthorized')
    
    # Calculate total requests
    total_requests = sum(stats['usage_count'] for stats in token_usage_stats.values())
    total_success = sum(stats['success_count'] for stats in token_usage_stats.values())
    total_errors = sum(stats['error_count'] for stats in token_usage_stats.values())
    
    # Get active/inactive tokens
    active_tokens = [t for t in token_usage_stats.values() if t['status'] == 'active']
    rate_limited_tokens = [t for t in token_usage_stats.values() if t['status'] == 'rate_limited']
    invalid_tokens = [t for t in token_usage_stats.values() if t['status'] == 'invalid']
    
    return jsonify({
        'tokens': {
            'count': len(GITHUB_TOKENS),
            'effective_limit': len(GITHUB_TOKENS) * 5000,
            'per_token_limit': 5000,
            'active': len(active_tokens),
            'rate_limited': len(rate_limited_tokens),
            'invalid': len(invalid_tokens)
        },
        'current_rate_limit': rate_limit_info,
        'reset_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(rate_limit_info['reset'])),
        'total_requests': total_requests,
        'success_count': total_success,
        'error_count': total_errors,
        'recent_requests': request_log[-20:]  # Last 20 requests
    })

@app.route('/admin/token-details', methods=['GET'])
def token_details():
    """
    Admin endpoint - Detailed token analytics
    Shows usage per token, endpoints used, rate limits, etc.
    """
    auth_header = request.headers.get('X-Admin-Password')
    if not auth_header or not verify_admin(auth_header):
        abort(401, description='Unauthorized')
    
    # Prepare detailed stats (remove full token for security)
    detailed_stats = []
    for token_id, stats in token_usage_stats.items():
        token_info = {
            'token_id': stats['token_masked'],
            'usage_count': stats['usage_count'],
            'success_count': stats['success_count'],
            'error_count': stats['error_count'],
            'status': stats['status'],
            'rate_limit': {
                'remaining': stats['rate_limit']['remaining'],
                'limit': stats['rate_limit']['limit'],
                'reset': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(stats['rate_limit']['reset'])) if stats['rate_limit']['reset'] else 'Unknown'
            },
            'last_used': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(stats['last_used'])) if stats['last_used'] else 'Never',
            'endpoints_used': stats['endpoints_used'],
            'top_endpoints': sorted(stats['endpoints_used'].items(), key=lambda x: x[1], reverse=True)[:5]
        }
        detailed_stats.append(token_info)
    
    # Sort by usage count
    detailed_stats.sort(key=lambda x: x['usage_count'], reverse=True)
    
    return jsonify({
        'tokens': detailed_stats,
        'total_tokens': len(detailed_stats),
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
    })

@app.route('/admin/test', methods=['GET'])
def admin_test():
    """Test admin authentication"""
    auth_header = request.headers.get('X-Admin-Password')
    if not auth_header or not verify_admin(auth_header):
        return jsonify({'authenticated': False}), 401
    
    return jsonify({'authenticated': True, 'message': 'Admin access granted'})

# Error handlers
@app.errorhandler(401)
def unauthorized(e):
    return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Server error', 'message': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🔐 SECURE GitHub API Proxy Server")
    print("="*70)
    print(f"📡 Host: {HOST}")
    print(f"📡 Port: {PORT}")
    print(f"🔑 Tokens Loaded: {len(GITHUB_TOKENS)}")
    print(f"⚡ Effective Rate Limit: {len(GITHUB_TOKENS) * 5000 if GITHUB_TOKENS else 60} req/hour")
    print(f"🌐 CORS Origins: {', '.join(ALLOWED_ORIGINS)}")
    print(f"🔒 Admin Endpoints Protected: YES")
    print("="*70)
    print("\n📌 Public Endpoints:")
    print("   GET  /api/github/<path>  - Proxy GitHub API")
    print("   GET  /health             - Health check")
    print("\n🔐 Admin Endpoints (require X-Admin-Password header):")
    print("   GET    /admin/tokens - View tokens")
    print("   POST   /admin/tokens - Add tokens")
    print("   DELETE /admin/tokens - Clear tokens")
    print("   GET    /admin/stats  - View statistics")
    print("   GET    /admin/token-details - Detailed token analytics")
    print("="*70 + "\n")
    
    # Use HOST from config (0.0.0.0 for production, 127.0.0.1 for local)
    app.run(host=HOST, port=PORT, debug=False)
