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

# Enable CORS
CORS(app, origins=ALLOWED_ORIGINS)

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

def get_next_token():
    """Get next token from rotation pool"""
    if token_pool and GITHUB_TOKENS:
        return next(token_pool)
    return None

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
    try:
        github_url = f'https://api.github.com/{github_path}'
        params = request.args.to_dict()
        
        # Use token rotation automatically
        headers = get_headers()
        response = requests.get(github_url, headers=headers, params=params, timeout=10)
        
        # Update rate limit tracking
        if 'X-RateLimit-Remaining' in response.headers:
            rate_limit_info['remaining'] = int(response.headers['X-RateLimit-Remaining'])
            rate_limit_info['limit'] = int(response.headers['X-RateLimit-Limit'])
            rate_limit_info['reset'] = int(response.headers['X-RateLimit-Reset'])
        
        # Auto-fallback if rate limited
        if response.status_code == 403 and 'rate limit' in response.text.lower():
            print("⚠️  Rate limit hit, trying public access...")
            headers = get_headers(use_token=False)
            response = requests.get(github_url, headers=headers, params=params, timeout=10)
        
        return jsonify(response.json()), response.status_code
        
    except Exception as e:
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
        
        # Reinitialize token pool
        token_pool = cycle(GITHUB_TOKENS)
        
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
    
    return jsonify({
        'tokens': {
            'count': len(GITHUB_TOKENS),
            'effective_limit': len(GITHUB_TOKENS) * 5000,
            'per_token_limit': 5000
        },
        'current_rate_limit': rate_limit_info,
        'reset_time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(rate_limit_info['reset']))
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
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
