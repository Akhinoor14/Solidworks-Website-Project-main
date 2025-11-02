# 🚀 SIMPLE DEPLOYMENT STEPS

## আমাকে Railway তে deploy করতে হবে

### Step 1: Railway তে Login
- Go to: https://railway.app
- Click "Login" 
- GitHub দিয়ে login করো

### Step 2: New Project Create
1. Dashboard এ "New Project" click করো
2. Select: **"Deploy from GitHub repo"**
3. Select repository: **Solidworks-Website-Project-main**
4. Root directory set করো: **Backend projects**
5. Click **"Deploy"**

### Step 3: Environment Variables Add
Railway dashboard → Variables tab → Add these:

```
SECRET_KEY = থাকে দাও (auto-generated)
ADMIN_PASSWORD = তোমার একটা password দাও (example: MyPass123)
PORT = 5000
HOST = 0.0.0.0
```

### Step 4: Domain পাও
Settings → Domains → Generate Domain
Copy করো: `https://solidworks-backend-production.up.railway.app`

### Step 5: Frontend Update
`github-proxy-config.js` file খোলো, line 34:
```javascript
PROXY_URL: 'https://solidworks-backend-production.up.railway.app',
```

### Step 6: Tokens Add
Browser এ যাও: `backend-token-manager.html`
- Admin password দাও
- GitHub tokens paste করো
- Add Tokens click করো

## ✅ DONE! Everything works!

Public users → No token needed
You → Full admin access with analytics
