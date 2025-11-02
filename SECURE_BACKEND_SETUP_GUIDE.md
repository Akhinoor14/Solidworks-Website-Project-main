# 🔐 Secure Backend Proxy - Complete Setup Guide

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  PUBLIC USERS (Visitors)                     │
│              → View projects WITHOUT tokens                 │
│              → No configuration needed                      │
│              → Clean & simple experience                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               FRONTEND (Portfolio Website)                   │
│         → Auto-connects to backend proxy                    │
│         → NO token UI for visitors                          │
│         → Shows "Connected to backend proxy" status         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│          PYTHON BACKEND PROXY (Your Server)                 │
│         → Handles ALL GitHub API calls                      │
│         → Automatic token rotation                          │
│         → Encrypted token storage                           │
│         → Admin-only token management                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB API ✅                            │
│         → Rate limit: 5000/hr × Number of tokens            │
│         → Unlimited access with 4+ tokens                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Key Benefits

### For Visitors (Public Users):
- ✅ **Zero configuration** - just visit and browse
- ✅ **No tokens visible** - clean interface
- ✅ **Fast & smooth** - backend handles everything
- ✅ **Professional experience** - no technical barriers

### For You (Admin):
- 🔒 **Secure** - Tokens encrypted on backend
- 🔄 **Automatic rotation** - unlimited API access
- 🎛️ **Easy management** - web-based admin panel
- 📊 **Monitoring** - track usage and health
- 🚀 **Scalable** - add/remove tokens anytime

---

## 🚀 Part 1: Backend Setup (Admin - One Time)

### Step 1: Install Dependencies

```bash
cd "Backend projects"
pip install -r requirements.txt
```

**Packages installed:**
- `flask` - Web server
- `flask-cors` - Cross-origin requests
- `requests` - HTTP client
- `python-dotenv` - Environment variables
- `cryptography` - Token encryption
- `gunicorn` - Production server

---

### Step 2: Generate GitHub Tokens (Recommended: 4-5 tokens)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes:
   - ✅ `public_repo` (for public repositories)
   - ✅ `repo` (if you have private repos)
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)
6. Repeat 3-5 times to get multiple tokens

**Token naming tip:**
- Token-Portfolio-1
- Token-Portfolio-2
- Token-Portfolio-3
- etc.

---

### Step 3: Run Admin Setup Script

```bash
python setup-tokens.py
```

**What it does:**
1. Generates encryption key (random, secure)
2. Asks for admin password (your choice)
3. Asks for GitHub tokens (paste them one by one)
4. Encrypts tokens using strong encryption
5. Saves to `tokens.enc` (encrypted file)
6. Creates `.env` configuration file
7. Creates `.gitignore` (prevents committing secrets)

**Example interaction:**
```
🔐 SECURE TOKEN SETUP - Admin Configuration

📝 Set Admin Password
Enter admin password: ********
Confirm admin password: ********

🔑 Add GitHub Tokens
Token 1: ghp_xxxxxxxxxxxx ✅ Token 1 added
Token 2: ghp_yyyyyyyyyyyy ✅ Token 2 added
Token 3: ghp_zzzzzzzzzzzz ✅ Token 3 added
Token 4: (press Enter to finish)

✅ Encrypted and saved 3 tokens to tokens.enc
⚡ Effective rate limit: 15,000 requests/hour

🌐 Server Configuration
Server port (default 5000): 5000
Enter origins: http://localhost:8000, https://yourdomain.com

✅ SETUP COMPLETE!
```

---

### Step 4: Start Backend Server

```bash
python secure-proxy-server.py
```

**You should see:**
```
======================================================================
🔐 SECURE GitHub API Proxy Server
======================================================================
📡 Port: 5000
🔑 Tokens Loaded: 3
⚡ Effective Rate Limit: 15000 req/hour
🌐 CORS Origins: http://localhost:8000, https://yourdomain.com
🔒 Admin Endpoints Protected: YES
======================================================================

📌 Public Endpoints:
   GET  /api/github/<path>  - Proxy GitHub API
   GET  /health             - Health check

🔐 Admin Endpoints (require X-Admin-Password header):
   GET    /admin/tokens - View tokens
   POST   /admin/tokens - Add tokens
   DELETE /admin/tokens - Clear tokens
   GET    /admin/stats  - View statistics
======================================================================
```

**Test server health:**
```
Visit: http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "tokens_active": true,
  "effective_limit": 15000,
  "version": "2.0"
}
```

---

## 🌐 Part 2: Frontend Configuration (Simple!)

### Step 1: Include Proxy Config in HTML

Add this line to `projects.html` (BEFORE script.js):

```html
<!-- GitHub Proxy Configuration -->
<script src="github-proxy-config.js"></script>

<!-- Main Script -->
<script src="script.js"></script>
```

### Step 2: Enable Proxy (Edit github-proxy-config.js)

**For local development:**
```javascript
const GITHUB_PROXY_CONFIG = {
    USE_PROXY: true,  // Enable proxy
    PROXY_URL: 'http://localhost:5000',  // Local server
    AUTO_FALLBACK: true,
    ENABLE_CACHE: true
};
```

**For production (after deploying backend):**
```javascript
const GITHUB_PROXY_CONFIG = {
    USE_PROXY: true,
    PROXY_URL: 'https://your-backend.railway.app',  // Your deployed URL
    AUTO_FALLBACK: true,
    ENABLE_CACHE: true
};
```

**That's it!** Frontend will automatically use backend proxy. ✅

---

## 🎛️ Part 3: Token Management (Admin Panel)

### Option 1: Use Web-Based Admin Panel

1. Open `backend-token-manager.html` in browser
2. Enter admin password (set in Step 3)
3. Add/view/manage tokens via UI
4. Real-time server health monitoring

**Features:**
- ✅ Add new tokens
- ✅ View current tokens (masked)
- ✅ Clear all tokens
- ✅ Check server health
- ✅ Monitor rate limits

### Option 2: Use API Directly (Advanced)

**Add tokens:**
```bash
curl -X POST http://localhost:5000/admin/tokens \
  -H "X-Admin-Password: your_password" \
  -H "Content-Type: application/json" \
  -d '{"tokens": ["ghp_xxx", "ghp_yyy"]}'
```

**View tokens:**
```bash
curl -X GET http://localhost:5000/admin/tokens \
  -H "X-Admin-Password: your_password"
```

**Check stats:**
```bash
curl -X GET http://localhost:5000/admin/stats \
  -H "X-Admin-Password: your_password"
```

---

## 🚀 Part 4: Production Deployment

### Option A: Deploy to Railway (Recommended - Free Tier)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → Deploy from GitHub
3. **Select Backend folder** or use root with `cd Backend\ projects && python secure-proxy-server.py`
4. **Add Environment Variables:**
   ```
   SECRET_KEY=<your_encryption_key_from_.env>
   ADMIN_PASSWORD=<your_admin_password>
   PORT=5000
   ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:8000
   ```
5. **Deploy!** Railway will auto-deploy
6. **Get deployment URL**: `https://your-app.railway.app`
7. **Update frontend config** with deployed URL

### Option B: Deploy to Heroku

1. Create `Procfile` in Backend projects folder:
   ```
   web: gunicorn secure-proxy-server:app
   ```

2. Deploy:
   ```bash
   heroku create your-proxy-server
   heroku config:set SECRET_KEY=xxx
   heroku config:set ADMIN_PASSWORD=xxx
   heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
   git push heroku main
   ```

3. Update frontend with Heroku URL

### Option C: Self-Hosted VPS (Ubuntu)

1. Install dependencies:
   ```bash
   sudo apt update
   sudo apt install python3-pip nginx
   pip3 install -r requirements.txt
   ```

2. Create systemd service:
   ```bash
   sudo nano /etc/systemd/system/github-proxy.service
   ```

   ```ini
   [Unit]
   Description=GitHub API Proxy
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/github-proxy
   ExecStart=/usr/bin/python3 secure-proxy-server.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start:
   ```bash
   sudo systemctl enable github-proxy
   sudo systemctl start github-proxy
   ```

4. Configure nginx as reverse proxy

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use strong admin password (12+ characters)
- ✅ Keep `.env` file SECRET (never commit to git)
- ✅ Keep `tokens.enc` file SECRET
- ✅ Use HTTPS in production
- ✅ Regenerate tokens periodically
- ✅ Monitor token usage
- ✅ Limit CORS origins to your domain

### ❌ DON'T:
- ❌ Commit `.env` or `tokens.enc` to git
- ❌ Share admin password
- ❌ Use weak passwords
- ❌ Allow wildcard CORS (*) in production
- ❌ Expose tokens in frontend
- ❌ Use same tokens for other projects

---

## 📊 Monitoring & Maintenance

### Check Server Health
```bash
curl http://localhost:5000/health
```

### Check Admin Stats (with password)
```bash
curl -H "X-Admin-Password: your_password" \
     http://localhost:5000/admin/stats
```

### View Logs
```bash
# In terminal running the server
# Logs show all requests and token rotations
```

### Add More Tokens (Anytime)
1. Generate new GitHub tokens
2. Use `backend-token-manager.html`
3. Or use API to add tokens
4. No server restart needed!

---

## 🎯 Rate Limit Calculator

| Tokens | Rate Limit/Hour | Daily Capacity | Cost |
|--------|-----------------|----------------|------|
| 1 | 5,000 | 120,000 | FREE |
| 2 | 10,000 | 240,000 | FREE |
| 3 | 15,000 | 360,000 | FREE |
| 4 | 20,000 | 480,000 | FREE |
| 5 | 25,000 | 600,000 | FREE |

**Recommendation**: 3-4 tokens = **15,000-20,000 req/hour** (perfect for portfolio!)

---

## 🐛 Troubleshooting

### Problem: Backend server won't start
**Solution:**
- Check if port 5000 is already in use
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check `.env` file exists and has valid values

### Problem: "Unauthorized" errors in admin panel
**Solution:**
- Verify admin password matches `.env` file
- Check `ADMIN_PASSWORD` environment variable

### Problem: Frontend can't connect to backend
**Solution:**
- Check backend server is running
- Verify `PROXY_URL` in `github-proxy-config.js`
- Check CORS origins in backend `.env`
- Verify firewall allows port 5000

### Problem: Tokens not working
**Solution:**
- Regenerate tokens on GitHub
- Verify tokens have correct scopes (`public_repo`)
- Check tokens.enc file exists
- Re-run `setup-tokens.py` if needed

---

## 📁 File Structure

```
Backend projects/
├── secure-proxy-server.py    ← Main backend server
├── setup-tokens.py            ← One-time token setup
├── requirements.txt           ← Python dependencies
├── .env                       ← Configuration (KEEP SECRET!)
├── tokens.enc                 ← Encrypted tokens (KEEP SECRET!)
├── .gitignore                 ← Prevents committing secrets
└── README.md                  ← Documentation

Root/
├── github-proxy-config.js     ← Frontend proxy configuration
├── backend-token-manager.html ← Web-based token management UI
├── script.js                  ← Main frontend (NO token UI for users)
└── projects.html              ← Portfolio page
```

---

## 🎉 Summary

### What You Have Now:

✅ **Secure Backend Proxy**
- Encrypted token storage
- Admin-only token management
- Automatic token rotation
- Production-ready with monitoring

✅ **Clean Frontend**
- No token UI for visitors
- Auto-connects to backend
- Shows connection status
- Professional experience

✅ **Admin Panel**
- Web-based token management
- Real-time health monitoring
- Easy add/remove tokens
- Password-protected

✅ **Complete Documentation**
- Setup guides
- Deployment options
- Security best practices
- Troubleshooting

---

## 🚀 Quick Start Checklist

### One-Time Setup (Admin):
- [ ] Install Python dependencies
- [ ] Generate 3-5 GitHub tokens
- [ ] Run `setup-tokens.py`
- [ ] Start backend server
- [ ] Test health endpoint
- [ ] Enable proxy in frontend config
- [ ] Test portfolio access
- [ ] Deploy to production (optional)

### Daily Usage:
- ✅ Visitors browse freely (zero config)
- ✅ Backend handles all API calls
- ✅ Tokens rotate automatically
- ✅ Monitor via admin panel
- ✅ Add/remove tokens as needed

---

**আপনার portfolio এখন enterprise-level security সহ production-ready!** 🎊

Visitors পুরোপুরি freely access করতে পারবে, কোন token দেখবে না, এবং আপনি admin হিসেবে সব কিছু control করবেন! 🔐🚀
