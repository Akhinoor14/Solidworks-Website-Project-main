# 🔄 Backend Proxy Integration - Complete File List

## 📋 Overview
এই document এ দেখানো হয়েছে **কোন কোন files এ GitHub API calls আছে** এবং সেগুলোকে **backend proxy** দিয়ে replace করতে হবে।

---

## ✅ Already Integrated (No Changes Needed)

### 1. **github-proxy-config.js** ✅
- Already has `fetchGitHubApi()` global function
- Automatically uses proxy if enabled
- Has caching and fallback logic
- **Status:** Complete, no changes needed

### 2. **Backend files** ✅
- `Backend projects/secure-proxy-server.py` - Proxy server itself
- `Backend projects/github-proxy-server.py` - Old proxy (can be removed)
- **Status:** Backend is ready

---

## 🔧 Files That Need Updates

### **PUBLIC PAGES** (User-facing, must use proxy)

#### 1. **script.js** (Main frontend script) 🔴
**Total API Calls:** ~40+ locations
**Key Functions:**
- `getGitHubToken()` - Line 131
- `checkRateLimit()` - Line 139
- `fetchFileContent()` - Line 302
- `fetchGitHubProjects()` - Line 6255
- All Solo project functions
- All Day folders functions

**Required Changes:**
```javascript
// BEFORE:
const response = await fetch('https://api.github.com/repos/...', { headers });

// AFTER:
const response = await fetchGitHubApi('repos/...', { method: 'GET' });
```

**Priority:** 🔴 **CRITICAL** - Most used file

---

#### 2. **projects.html** (Inline script) 🟡
**API Calls:** 1 location (Line 543)
```javascript
// Line 543:
const response = await fetch('https://api.github.com/repos/Akhinoor14/SOLIDWORKS-Projects');
```

**Required Change:**
```javascript
const response = await fetchGitHubApi('repos/Akhinoor14/SOLIDWORKS-Projects');
```

**Priority:** 🟡 **MEDIUM** - Public page

---

#### 3. **profile-slideshow.js** 🟢
**API Calls:** 1 location (Line 41)
```javascript
// Line 41:
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/images`;
```

**Required Change:**
```javascript
const response = await fetchGitHubApi(`repos/${owner}/${repo}/contents/images`);
```

**Priority:** 🟢 **LOW** - Profile photos (public repo, works without token)

---

#### 4. **auto-refresh.js** 🟡
**API Calls:** 1 location (Line 49)
```javascript
// Line 49:
const response = await fetch('https://api.github.com/repos/Akhinoor14/SOLIDWORKS-Projects/commits?per_page=1');
```

**Required Change:**
```javascript
const response = await fetchGitHubApi('repos/Akhinoor14/SOLIDWORKS-Projects/commits?per_page=1');
```

**Priority:** 🟡 **MEDIUM** - Auto-refresh functionality

---

#### 5. **github-projects-detector.js** 🟡
**API Calls:** Uses baseUrl (Line 11)
```javascript
// Line 11:
this.baseUrl = `https://api.github.com/repos/${username}/${repository}/contents`;
```

**Required Change:**
```javascript
// Replace all fetch calls with fetchGitHubApi
```

**Priority:** 🟡 **MEDIUM** - Project detection

---

#### 6. **github-sync.js** 🟡
**API Calls:** Uses baseUrl (Line 11)
```javascript
// Line 11:
this.baseUrl = `https://api.github.com/repos/${username}/${repository}/contents`;
```

**Required Change:**
```javascript
// Replace all fetch calls with fetchGitHubApi
```

**Priority:** 🟡 **MEDIUM** - Sync functionality

---

#### 7. **realtime-github-sync.js** 🟡
**API Calls:** Uses baseUrl (Line 11)
```javascript
// Line 11:
this.baseUrl = `https://api.github.com/repos/${username}/${repository}`;
```

**Required Change:**
```javascript
// Replace all fetch calls with fetchGitHubApi
```

**Priority:** 🟡 **MEDIUM** - Real-time sync

---

### **ADMIN PAGES** (Only Boss Dashboard - uses tokens)

#### 8. **profile-uploader.js** 🟠
**API Calls:** ~5 locations
**Functions:**
- `fetchGitHubPhotos()` - Line 818
- Upload/delete operations

**Required Change:**
```javascript
// Use fetchGitHubApi for all GitHub API calls
```

**Priority:** 🟠 **HIGH** - Admin feature, needs tokens

---

#### 9. **upload-manager.js** 🟠
**API Calls:** ~10 locations
**Functions:**
- Solo project uploads
- File management
- Delete operations

**Required Change:**
```javascript
// Use fetchGitHubApi for all GitHub API calls
```

**Priority:** 🟠 **HIGH** - Admin feature, needs tokens

---

#### 10. **github-uploader.js** 🟠
**API Calls:** Multiple locations
**Uses:** apiBase property

**Required Change:**
```javascript
// Replace makeRequest() to use fetchGitHubApi
```

**Priority:** 🟠 **HIGH** - Admin feature

---

#### 11. **upload-interface.js** 🟢
**API Calls:** 2 locations (test calls)
- Line 103: Test API call
- Line 165: Repository check

**Required Change:**
```javascript
// Use fetchGitHubApi for tests
```

**Priority:** 🟢 **LOW** - Test interface

---

## 📊 Summary Statistics

### By Priority:
- 🔴 **CRITICAL (1):** script.js (40+ calls)
- 🟠 **HIGH (4):** Admin upload tools
- 🟡 **MEDIUM (5):** Public sync/detection tools  
- 🟢 **LOW (2):** Profile slideshow, test interface

### Total Files: **12 files**
### Total API Calls: **100+ locations**

---

## 🎯 Implementation Strategy

### Phase 1: Critical Files (Do First) 🔴
1. ✅ `github-proxy-config.js` - Already done
2. 🔴 `script.js` - Replace all fetch calls

### Phase 2: Admin Features 🟠
3. `profile-uploader.js`
4. `upload-manager.js`
5. `github-uploader.js`

### Phase 3: Public Features 🟡
6. `projects.html`
7. `auto-refresh.js`
8. `github-projects-detector.js`
9. `github-sync.js`
10. `realtime-github-sync.js`

### Phase 4: Optional 🟢
11. `profile-slideshow.js`
12. `upload-interface.js`

---

## 🔧 Standard Replacement Pattern

### Pattern 1: Simple GET request
```javascript
// BEFORE:
const response = await fetch(`https://api.github.com/${path}`, { headers });

// AFTER:
const response = await fetchGitHubApi(path);
```

### Pattern 2: With query parameters
```javascript
// BEFORE:
const response = await fetch('https://api.github.com/repos/owner/repo/commits?per_page=1', { headers });

// AFTER:
const response = await fetchGitHubApi('repos/owner/repo/commits?per_page=1');
```

### Pattern 3: POST/PUT/DELETE (Admin operations)
```javascript
// BEFORE:
const response = await fetch(`https://api.github.com/${path}`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
});

// AFTER:
const response = await fetchGitHubApi(path, {
    method: 'PUT',
    body: JSON.stringify(data)
});
// Note: fetchGitHubApi automatically handles auth via proxy
```

### Pattern 4: Class-based (baseUrl pattern)
```javascript
// BEFORE:
class GitHubSync {
    constructor() {
        this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    }
    
    async fetchData(path) {
        const response = await fetch(`${this.baseUrl}/${path}`, { headers });
        return response.json();
    }
}

// AFTER:
class GitHubSync {
    constructor() {
        this.owner = owner;
        this.repo = repo;
    }
    
    async fetchData(path) {
        const response = await fetchGitHubApi(`repos/${this.owner}/${this.repo}/${path}`);
        return response.json();
    }
}
```

---

## ✅ Benefits After Integration

### For Public Users:
- ✅ **No token needed** - Backend handles everything
- ✅ **Faster loading** - Caching enabled
- ✅ **No rate limits** - Multiple tokens rotation
- ✅ **Auto-fallback** - Works even if proxy is down

### For Admin:
- ✅ **Centralized token management** - All tokens in backend
- ✅ **Token analytics** - See usage per endpoint
- ✅ **Security** - Tokens never exposed to frontend
- ✅ **Easy rotation** - Add/remove tokens anytime

### For Developer:
- ✅ **Simple API** - Just use `fetchGitHubApi(path)`
- ✅ **No auth logic** - Proxy handles it
- ✅ **Caching built-in** - 5-minute cache TTL
- ✅ **Error handling** - Auto-retry with fallback

---

## 🚀 Next Steps

1. **Start with script.js** (most critical)
2. **Test each file** after modification
3. **Update admin tools** (profile-uploader, upload-manager)
4. **Update public sync tools** (auto-refresh, github-sync)
5. **Test end-to-end** (public + admin features)
6. **Deploy backend** to production server
7. **Update PROXY_URL** in github-proxy-config.js

---

## 📝 Testing Checklist

After each file update:
- [ ] Test public viewing (no token)
- [ ] Test admin operations (with backend proxy)
- [ ] Verify caching works
- [ ] Check console for errors
- [ ] Verify analytics tracking
- [ ] Test rate limit handling

---

**Status:** 📋 Planning Complete  
**Next:** 🔧 Start implementing changes  
**Priority:** 🔴 script.js first  

---

Generated: November 2, 2025
