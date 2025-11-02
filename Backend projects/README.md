# 🐍 Backend Projects

## GitHub API Proxy Server

A production-ready Flask server that acts as a proxy between your frontend and GitHub API, providing:

- ✅ **Unlimited API Access** via token rotation
- ✅ **Rate Limit Bypass** - 5000 req/hour per token
- ✅ **Security** - Tokens hidden from frontend
- ✅ **Caching** - Faster response times
- ✅ **CORS Support** - Works with any frontend
- ✅ **Monitoring** - Health checks and rate limit tracking

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your tokens:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GITHUB_TOKENS=ghp_yourtoken1,ghp_yourtoken2,ghp_yourtoken3
PORT=5000
ALLOWED_ORIGINS=http://localhost:8000,https://yourdomain.com
```

### 3. Run Server

```bash
python github-proxy-server.py
```

Server will start on `http://localhost:5000`

### 4. Test

Visit: `http://localhost:5000/health`

---

## 📡 API Endpoints

### `GET /api/github/<path>`
Proxy GitHub API requests.

**Example**:
```
GET /api/github/repos/Akhinoor14/SOLIDWORKS-Projects/contents/CW
```

### `GET /api/rate-limit`
Check rate limit status.

### `GET /health`
Health check endpoint.

---

## 🌐 Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set GITHUB_TOKENS=ghp_xxx,ghp_yyy
git push heroku main
```

### Railway.app (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Vercel
```bash
vercel
```

---

## 📊 Features

- **Token Rotation**: Automatically cycles through multiple tokens
- **Auto Fallback**: Falls back to public API if rate limited
- **CORS Enabled**: Works with any frontend
- **Rate Limit Tracking**: Real-time monitoring
- **Production Ready**: Uses gunicorn for deployment

---

## 🔗 Integration

See `../TOKEN_ROTATION_GUIDE.md` for complete integration instructions.

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKENS` | Comma-separated tokens | `ghp_xxx,ghp_yyy` |
| `PORT` | Server port | `5000` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:8000` |
| `DEBUG` | Debug mode | `False` |

---

**For detailed documentation, see: `TOKEN_ROTATION_GUIDE.md`**
