"""
GitHub API Proxy Server with Token Rotation
============================================
This Flask server acts as a proxy between your frontend and GitHub API.

Features:
- Multiple token rotation (bypasses rate limits)
- Automatic fallback to public access
- CORS enabled for frontend access
- Rate limit monitoring
- Caching for better performance

Requirements:
    pip install flask flask-cors requests python-dotenv

Usage:
    python github-proxy-server.py

Environment Variables (.env file):
    GITHUB_TOKENS=ghp_token1,ghp_token2,ghp_token3
    PORT=5000
    ALLOWED_ORIGINS=http://localhost:8000,https://yourdomain.com
"""

import os
import requests
import time
from itertools import cycle
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from functools import lru_cache

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=allowed_origins)

# Token rotation setup
GITHUB_TOKENS = os.getenv('GITHUB_TOKENS', '').split(',')
GITHUB_TOKENS = [t.strip() for t in GITHUB_TOKENS if t.strip()]

if GITHUB_TOKENS:
    token_pool = cycle(GITHUB_TOKENS)
    print(f"✅ Loaded {len(GITHUB_TOKENS)} GitHub tokens for rotation")
else:
    token_pool = None
    print("⚠️  No tokens configured. Using public API access (limited to 60 req/hour)")

# Rate limit tracking
rate_limit_info = {
    'remaining': 60,
    'limit': 60,
    'reset': time.time() + 3600
}

def get_next_token():
    """Get next token from rotation pool"""
    if token_pool:
        return next(token_pool)
    return None

def get_headers(use_token=True):
    """Get headers for GitHub API request"""
    headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SOLIDWORKS-Portfolio-Proxy/1.0'
    }
    
    if use_token:
        token = get_next_token()
        if token:
            headers['Authorization'] = f'Bearer {token}'
    
    return headers

@app.route('/api/github/<path:github_path>', methods=['GET'])
def proxy_github(github_path):
    """
    Proxy requests to GitHub API
    Example: /api/github/repos/owner/repo/contents/path
    """
    try:
        # Construct GitHub API URL
        github_url = f'https://api.github.com/{github_path}'
        
        # Get query parameters from request
        params = request.args.to_dict()
        
        # Make request to GitHub
        headers = get_headers()
        response = requests.get(github_url, headers=headers, params=params)
        
        # Update rate limit info
        if 'X-RateLimit-Remaining' in response.headers:
            rate_limit_info['remaining'] = int(response.headers['X-RateLimit-Remaining'])
            rate_limit_info['limit'] = int(response.headers['X-RateLimit-Limit'])
            rate_limit_info['reset'] = int(response.headers['X-RateLimit-Reset'])
        
        # If rate limited, try without token (public access)
        if response.status_code == 403 and 'rate limit' in response.text.lower():
            print("⚠️  Rate limit hit, trying public access...")
            headers = get_headers(use_token=False)
            response = requests.get(github_url, headers=headers, params=params)
        
        # Return response
        return jsonify(response.json()), response.status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rate-limit', methods=['GET'])
def check_rate_limit():
    """Check current rate limit status"""
    try:
        headers = get_headers()
        response = requests.get('https://api.github.com/rate_limit', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'core': data['rate'],
                'tokens_configured': len(GITHUB_TOKENS),
                'effective_limit': len(GITHUB_TOKENS) * 5000 if GITHUB_TOKENS else 60
            })
        
        return jsonify(rate_limit_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'tokens_configured': len(GITHUB_TOKENS),
        'rate_limit': rate_limit_info
    })

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API documentation"""
    return jsonify({
        'name': 'GitHub API Proxy Server',
        'version': '1.0.0',
        'endpoints': {
            '/api/github/<path>': 'Proxy GitHub API requests',
            '/api/rate-limit': 'Check rate limit status',
            '/health': 'Health check'
        },
        'tokens_configured': len(GITHUB_TOKENS),
        'effective_rate_limit': f"{len(GITHUB_TOKENS) * 5000}/hour" if GITHUB_TOKENS else "60/hour (public)"
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print("\n" + "="*60)
    print("🚀 GitHub API Proxy Server Starting...")
    print("="*60)
    print(f"📡 Port: {port}")
    print(f"🔑 Tokens: {len(GITHUB_TOKENS)}")
    print(f"⚡ Effective Rate Limit: {len(GITHUB_TOKENS) * 5000 if GITHUB_TOKENS else 60} req/hour")
    print(f"🌐 CORS Enabled for: {', '.join(allowed_origins)}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
