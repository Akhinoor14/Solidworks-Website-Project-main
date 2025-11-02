"""
Railway Entry Point
===================
This file ensures Railway can find and start the Flask app.
"""

import os
import sys

# The actual Flask app is defined in secure-proxy-server.py
# Since Python can't import files with hyphens, we load it directly

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Load and execute secure-proxy-server.py
with open('secure-proxy-server.py', 'r', encoding='utf-8') as f:
    code = f.read()
    exec(code, {'__name__': '__main__'})

