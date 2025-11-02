# 🚀 Backend Server Quick Start Guide

## ⚠️ "Failed to fetch" Error এর Solution

যদি **backend-token-manager.html** এ **"Error connecting to backend: Failed to fetch"** error আসে, তাহলে backend server run করা নেই। নিচের steps follow করো:

---

## 📋 Step-by-Step Instructions

### Step 1: Terminal Open করো
1. VS Code এ **Terminal → New Terminal** (অথবা `` Ctrl+` ``)
2. Terminal এ নিচের command run করো:

```powershell
cd "Backend projects"
```

### Step 2: Python Dependencies Install (প্রথমবার শুধু)
যদি প্রথমবার setup করছো, তাহলে:

```powershell
pip install -r requirements.txt
```

**Installs:** Flask, flask-cors, cryptography

### Step 3: Admin Setup (প্রথমবার শুধু)
প্রথমবার admin password set করতে হবে:

```powershell
python setup-tokens.py
```

**এটা করবে:**
- Admin password তৈরি করবে
- Encryption key generate করবে
- `.env` file create করবে

**Important:** Password টা মনে রাখবে! এটা দিয়ে tokens add/view/delete করবে।

### Step 4: Backend Server Start করো
```powershell
python secure-proxy-server.py
```

**Success হলে দেখবে:**
```
✅ Backend Proxy Server Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Server:     http://localhost:5000
   Admin:      http://localhost:5000/admin
   Health:     http://localhost:5000/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Running on http://127.0.0.1:5000
```

### Step 5: Token Manager Open করো
Browser এ:
```
backend-token-manager.html
```

এখন "Check Server Status" button click করলে **"Online ✓"** দেখাবে!

---

## 🔧 Common Issues & Solutions

### Issue 1: "Python not found"
**Solution:**
```powershell
python --version  # Check if Python installed
# If not, download from python.org
```

### Issue 2: "pip not found"
**Solution:**
```powershell
python -m pip install -r requirements.txt
```

### Issue 3: Port 5000 already in use
**Solution:**
```powershell
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue 4: "ModuleNotFoundError"
**Solution:**
```powershell
pip install flask flask-cors cryptography
```

### Issue 5: Server runs but "Failed to fetch" still shows
**Solution:**
- Check if server URL is `http://localhost:5000` (not https)
- Check browser console for CORS errors
- Make sure `USE_PROXY: true` in `github-proxy-config.js`

---

## ✅ Quick Test

1. **Start Server:**
   ```powershell
   cd "Backend projects"
   python secure-proxy-server.py
   ```

2. **Test Health Endpoint:**
   Browser এ যাও: http://localhost:5000/health
   
   **Expected response:**
   ```json
   {
     "status": "healthy",
     "tokens_active": false,
     "effective_limit": 60
   }
   ```

3. **Open Token Manager:**
   `backend-token-manager.html` open করো
   
4. **Check Status:**
   "Check Server Status" button click করো
   
   **Expected:** "Server Status: Online ✓"

---

## 📝 Full Workflow

```
1. Terminal open → cd "Backend projects"
2. python setup-tokens.py (first time only)
3. python secure-proxy-server.py
4. Open backend-token-manager.html
5. Enter admin password
6. Add GitHub tokens
7. Enjoy unlimited API access! 🎉
```

---

## 🎯 Pro Tips

### Keep Server Running in Background
Terminal tab টা খোলা রাখো development এর সময়।

### Auto-Restart on Code Changes
```powershell
pip install watchdog
python secure-proxy-server.py --reload
```

### Check Server Logs
Server terminal এ real-time logs দেখবে:
```
📊 Request: GET /api/github/users/Akhinoor14
🔑 Using token: ghp_****abc (4999 remaining)
✅ Success: 200 OK
```

### Production Deployment
- **Railway:** Railway.app এ deploy করো
- **Heroku:** Heroku এ deploy করো
- **Update `PROXY_URL`** in `github-proxy-config.js`:
  ```javascript
  PROXY_URL: 'https://your-app.railway.app'
  ```

---

## 🆘 Still Having Issues?

1. **Check Python version:** `python --version` (Need 3.7+)
2. **Check dependencies:** `pip list | findstr -i "flask cryptography"`
3. **Check firewall:** Allow Python through Windows Firewall
4. **Check antivirus:** Temporarily disable if blocking port 5000
5. **Restart everything:** Close terminal, close VS Code, reopen, try again

---

## 📞 Support

যদি এখনো problem হয়, check করো:
- `Backend projects/README.md` - Detailed documentation
- `SECURE_BACKEND_SETUP_GUIDE.md` - Complete setup guide
- Server terminal logs - Error messages দেখো

**Happy coding! 🚀**
