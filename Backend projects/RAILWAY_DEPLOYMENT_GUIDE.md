# 🚀 Backend Deployment Guide - Railway.app (Free!)

## ✅ What You're Deploying:

একটা **Professional Backend Proxy Server** যেটা:
- ✅ Public users এর জন্য GitHub API proxy করে (no token needed)
- ✅ Admin panel এ multiple tokens manage করতে পারো
- ✅ Auto token rotation
- ✅ Live analytics & rate limit tracking
- ✅ 24/7 running, no need to keep computer on!

---

## 🎯 Step-by-Step Deployment (10 minutes)

### Step 1: Create Railway Account
1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (free account)
4. ✅ Free tier: 500 hours/month (enough for 24/7!)

---

### Step 2: Deploy Backend

#### Option A: GitHub Repo (Recommended ✅)
1. Push your code to GitHub first:
   ```bash
   cd "Backend projects"
   git init
   git add .
   git commit -m "Backend proxy server"
   git remote add origin https://github.com/Akhinoor14/portfolio-backend.git
   git push -u origin main
   ```

2. In Railway:
   - Click **"Deploy from GitHub repo"**
   - Select `portfolio-backend` repository
   - Railway auto-detects Python
   - Click **Deploy**

#### Option B: Railway CLI (Alternative)
1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Deploy:
   ```bash
   cd "Backend projects"
   railway init
   railway up
   ```

---

### Step 3: Configure Environment Variables

Railway dashboard এ:

1. Go to **Variables** tab
2. Add these:

```env
SECRET_KEY=<generate-random-key>
ADMIN_PASSWORD=<your-secure-password>
ALLOWED_ORIGINS=*
PORT=5000
HOST=0.0.0.0
```

**Generate SECRET_KEY:**
```python
# Run in Python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
# Copy output and paste as SECRET_KEY
```

**ADMIN_PASSWORD:**
- Choose a strong password
- You'll use this in admin portal
- Example: `MySecurePass123!@#`

---

### Step 4: Get Your Backend URL

1. Railway এ deployment complete হলে
2. **Settings** → **Domains**
3. Click **"Generate Domain"**
4. You'll get: `https://your-app-name.up.railway.app`
5. ✅ **Copy this URL!**

---

### Step 5: Update Frontend Config

Open `github-proxy-config.js`:

```javascript
const GITHUB_PROXY_CONFIG = {
    USE_PROXY: true,
    
    // Update this line with your Railway URL:
    PROXY_URL: 'https://your-app-name.up.railway.app',
    
    AUTO_FALLBACK: true,
    ENABLE_CACHE: true,
    CACHE_DURATION: 300000
};
```

Commit and push:
```bash
git add github-proxy-config.js
git commit -m "Update backend URL"
git push
```

---

### Step 6: Add GitHub Tokens

1. Open: `https://your-app-name.up.railway.app/admin`
   - Or use `backend-token-manager.html` (update PROXY_URL first)

2. Enter **ADMIN_PASSWORD**

3. Add your GitHub tokens (one per line)

4. Click **"Add Tokens"**

5. ✅ Done! Backend is live with tokens!

---

## 🧪 Testing

### Test 1: Health Check
```bash
curl https://your-app-name.up.railway.app/health
```

**Expected:**
```json
{
  "status": "healthy",
  "tokens_active": true,
  "effective_limit": 5000
}
```

### Test 2: Proxy API Call
```bash
curl https://your-app-name.up.railway.app/api/github/users/Akhinoor14
```

**Expected:** Your GitHub profile data

### Test 3: Admin Panel
Open: `https://your-app-name.up.railway.app/admin`

Enter admin password → Should see token management interface

---

## 📊 Monitoring

### Railway Dashboard
- **Metrics** tab: CPU, Memory, Network
- **Logs** tab: Real-time server logs
- **Deployments** tab: Deployment history

### Server Logs
In Railway logs, you'll see:
```
✅ Backend Proxy Server Ready!
📡 Host: 0.0.0.0
📡 Port: 5000
🔑 Tokens Loaded: 3
⚡ Effective Rate Limit: 15000 req/hour
```

### Live Analytics
Use `backend-token-manager.html`:
- Token usage statistics
- Rate limits remaining
- Request history
- Token rotation status

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ Yes | Auto-generated | Encryption key for tokens |
| `ADMIN_PASSWORD` | ✅ Yes | - | Admin portal password |
| `ALLOWED_ORIGINS` | No | `*` | CORS origins (comma-separated) |
| `PORT` | No | `5000` | Server port |
| `HOST` | No | `0.0.0.0` | Server host |

### Production Settings

For production, set:
```env
ALLOWED_ORIGINS=https://akhinoor14.github.io,https://your-custom-domain.com
```

This restricts API access to only your websites.

---

## 💰 Cost & Limits

### Railway Free Tier:
- ✅ **500 hours/month** (20.8 days of 24/7 running)
- ✅ **500MB RAM**
- ✅ **1GB storage**
- ✅ **Custom domain support**
- ✅ **HTTPS included**

**More than enough for portfolio website!**

### If Exceeds Free Tier:
- **Hobby Plan:** $5/month
- **Unlimited hours**
- Better for high-traffic sites

---

## 🔄 Updates & Maintenance

### Deploy New Changes:
```bash
cd "Backend projects"
git add .
git commit -m "Update backend"
git push
```

Railway auto-deploys on push! ✅

### Restart Server:
Railway Dashboard → **Settings** → **Restart**

### View Logs:
Railway Dashboard → **Logs** tab

---

## 🛡️ Security Best Practices

### 1. Strong Admin Password
```env
ADMIN_PASSWORD=VeryStr0ng!Pass@2025
```

### 2. Rotate Tokens Regularly
Add new tokens monthly, remove old ones

### 3. Monitor Usage
Check analytics for suspicious activity

### 4. Restrict CORS
In production:
```env
ALLOWED_ORIGINS=https://akhinoor14.github.io
```

### 5. HTTPS Only
Railway provides free HTTPS automatically ✅

---

## ❓ Troubleshooting

### Problem: "Application failed to respond"

**Solution:**
- Check Railway logs for errors
- Verify `PORT` environment variable
- Ensure `requirements.txt` is complete

### Problem: "Admin password incorrect"

**Solution:**
- Check `ADMIN_PASSWORD` in Railway variables
- Password is case-sensitive
- No extra spaces

### Problem: "CORS error"

**Solution:**
- Check `ALLOWED_ORIGINS` includes your website URL
- Or set to `*` for development

### Problem: "Tokens not loading"

**Solution:**
- Re-add tokens via admin portal
- Check Railway storage persistence
- Verify `SECRET_KEY` hasn't changed

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Railway URL accessible
- [ ] `/health` endpoint returns `"status": "healthy"`
- [ ] Admin portal opens (requires password)
- [ ] Can add tokens via admin panel
- [ ] Frontend `github-proxy-config.js` updated with Railway URL
- [ ] Website API calls work (check browser console)
- [ ] Token analytics showing data
- [ ] No CORS errors in browser console

---

## 🚀 Next Steps

### 1. Add Tokens
- Generate 3-5 GitHub tokens
- Add via admin portal
- Verify rotation working

### 2. Test Website
- Open your portfolio website
- Check browser console for proxy usage
- Verify projects load without errors

### 3. Monitor Performance
- Check Railway metrics
- View token analytics
- Monitor rate limits

### 4. Optional: Custom Domain
- Railway supports custom domains
- Add CNAME record: `your-domain.com` → Railway URL
- Update `ALLOWED_ORIGINS`

---

## 📝 Deployment Summary

### What You Did:
1. ✅ Created Railway account
2. ✅ Deployed backend to Railway
3. ✅ Set environment variables
4. ✅ Got backend URL
5. ✅ Updated frontend config
6. ✅ Added GitHub tokens

### What You Get:
- ✅ **24/7 running backend** (no local server needed!)
- ✅ **Professional API proxy** (users don't see tokens)
- ✅ **Auto token rotation** (unlimited API calls)
- ✅ **Live analytics dashboard** (monitor everything)
- ✅ **Free hosting** (Railway free tier)
- ✅ **HTTPS included** (secure by default)

---

## 🎓 Alternative Platforms

### Render.com (Also Free!)
- Similar to Railway
- 750 hours/month free
- Auto-deploy from GitHub
- Deploy: https://render.com

### Heroku (Paid)
- $7/month minimum
- More established
- Good documentation
- Deploy: https://heroku.com

### Replit (Easiest!)
- Click "Run" and it's live
- Free with limitations
- Good for testing
- Deploy: https://replit.com

---

## 💡 Pro Tips

### 1. Use Multiple Tokens
Add 5-10 tokens for best performance

### 2. Monitor Rate Limits
Check analytics regularly to avoid hitting limits

### 3. Keep Admin Password Safe
Don't share it publicly

### 4. Test Before Production
Use Railway staging environment for testing

### 5. Set Up Alerts
Railway can email you if server goes down

---

## 🔗 Useful Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **GitHub Tokens:** https://github.com/settings/tokens
- **Your Backend (after deploy):** `https://your-app.up.railway.app`
- **Admin Portal:** `https://your-app.up.railway.app/admin`

---

## ✅ You're Done!

Backend deployed এবং professional setup complete! 🎉

এখন:
- 🌐 Public users: Visit website → No token needed
- 👑 You: Admin portal → Manage tokens → See analytics
- 🔄 System: Auto-rotate tokens → Unlimited API access
- 📊 Monitor: Real-time stats → Track everything

**Perfect professional setup!** 🚀
