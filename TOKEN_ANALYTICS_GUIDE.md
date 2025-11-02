# 📊 Token Analytics & Live Monitoring System

## 🎯 Overview

Backend Token Manager এ এখন **Real-time Token Analytics** এবং **Live Monitoring** যুক্ত করা হয়েছে যাতে দেখা যায়:

- ✅ **কোন token কোথায় ব্যবহার হচ্ছে** (which endpoints)
- ✅ **কোন token live/active আছে** (status tracking)
- ✅ **প্রতিটা token কতবার ব্যবহার হয়েছে** (usage count)
- ✅ **Rate limit status** (কত request বাকি আছে)
- ✅ **Recent API requests log** (শেষ 20টা request)
- ✅ **Success/Error tracking** (কতগুলো সফল/ব্যর্থ)

---

## 🔧 New Backend Features

### 1. Token Usage Tracking

```python
token_usage_stats = {
    'ghp_xxxx...yyyy': {
        'token_masked': 'ghp_xxxx...yyyy',
        'usage_count': 152,
        'endpoints_used': {
            'repos/Akhinoor14/Portfolio': 45,
            'users/Akhinoor14': 23,
            ...
        },
        'last_used': 1730534400,
        'rate_limit': {
            'remaining': 4850,
            'limit': 5000,
            'reset': 1730538000
        },
        'status': 'active',  # active / rate_limited / invalid
        'error_count': 2,
        'success_count': 150
    }
}
```

### 2. Request Logging

প্রতিটা API request log করা হয়:

```python
request_log = [
    {
        'timestamp': 1730534400,
        'endpoint': 'repos/Akhinoor14/Portfolio',
        'token': 'ghp_xxxx...yyyy',
        'status': 200,
        'time_str': '2025-11-02 14:30:00'
    },
    ...
]
```

### 3. New API Endpoints

#### `/admin/token-details` (GET)
**Purpose:** Detailed analytics for each token

**Response:**
```json
{
  "tokens": [
    {
      "token_id": "ghp_xxxx...yyyy",
      "usage_count": 152,
      "success_count": 150,
      "error_count": 2,
      "status": "active",
      "rate_limit": {
        "remaining": 4850,
        "limit": 5000,
        "reset": "2025-11-02 15:00:00"
      },
      "last_used": "2025-11-02 14:30:00",
      "endpoints_used": {
        "repos/Akhinoor14/Portfolio": 45,
        "users/Akhinoor14": 23
      },
      "top_endpoints": [
        ["repos/Akhinoor14/Portfolio", 45],
        ["users/Akhinoor14", 23]
      ]
    }
  ],
  "total_tokens": 4,
  "timestamp": "2025-11-02 14:30:00"
}
```

#### `/admin/stats` (Enhanced)
**Purpose:** Overall statistics

**Response:**
```json
{
  "tokens": {
    "count": 4,
    "effective_limit": 20000,
    "per_token_limit": 5000,
    "active": 3,
    "rate_limited": 1,
    "invalid": 0
  },
  "current_rate_limit": {
    "remaining": 4850,
    "limit": 5000,
    "reset": 1730538000
  },
  "reset_time": "2025-11-02 15:00:00",
  "total_requests": 453,
  "success_count": 445,
  "error_count": 8,
  "recent_requests": [...]
}
```

---

## 🎨 Frontend Analytics Dashboard

### Summary Statistics Cards

8টা real-time stat cards:
1. **Total Tokens** - মোট token সংখ্যা
2. **Active** - কতগুলো active আছে (সবুজ)
3. **Rate Limited** - কতগুলো rate limited (হলুদ)
4. **Invalid** - কতগুলো invalid/expired (লাল)
5. **Total Requests** - মোট API call
6. **Success** - সফল requests (সবুজ)
7. **Errors** - ব্যর্থ requests (লাল)
8. **API Limit/hr** - ঘন্টায় কত request করা যাবে

### Detailed Token Cards

প্রতিটা token এর জন্য একটা card যাতে দেখায়:
- **Token ID** (masked: ghp_xxxx...yyyy)
- **Status Badge** (Active/Rate Limited/Invalid)
- **Metrics:**
  - Total Uses
  - Success Count
  - Error Count
  - Rate Remaining
- **Last Used Time**
- **Rate Reset Time**
- **Top 5 Endpoints** (কোন endpoints বেশি ব্যবহার হয়েছে)

### Recent Requests Log

শেষ 20টা API request দেখায়:
- **Timestamp** - কখন request হয়েছে
- **Endpoint** - কোন endpoint
- **Token Used** - কোন token ব্যবহার করা হয়েছে
- **Status Code** - 200/404/500 (color coded)

---

## 🚀 How to Use

### Step 1: Start Backend Server

```bash
cd "Backend projects"
python secure-proxy-server.py
```

### Step 2: Open Backend Token Manager

1. Go to Only Boss Dashboard
2. Click **Backend Token Manager** card
3. Enter admin password

### Step 3: View Analytics

1. Scroll to **Token Analytics & Live Monitoring** section
2. Click **Refresh Analytics** button
3. View real-time data:
   - Summary stats at top
   - Detailed token cards below
   - Recent requests log at bottom

### Step 4: Monitor Usage

Analytics দেখে বুঝতে পারবেন:
- ✅ **কোন token সবচেয়ে বেশি ব্যবহার হচ্ছে**
- ✅ **কোন endpoint সবচেয়ে বেশি call হচ্ছে**
- ✅ **কোন token এর rate limit শেষ হয়ে যাচ্ছে**
- ✅ **কোন token invalid/expired হয়ে গেছে**
- ✅ **সব request সফল হচ্ছে কিনা**

---

## 📊 Color Coding System

### Status Colors:
- 🟢 **Green (Active)** - Token working perfectly
- 🟡 **Yellow (Rate Limited)** - Token hit rate limit, will reset soon
- 🔴 **Red (Invalid)** - Token expired/revoked, needs replacement

### Status Codes:
- 🟢 **200** - Success (green background)
- 🟡 **404** - Not Found (yellow background)
- 🔴 **500** - Server Error (red background)

---

## 🔍 Understanding the Data

### Usage Count
প্রতি token কতবার GitHub API call করেছে (startup থেকে)

### Success/Error Ratio
- **High success rate (>95%)** = Good ✅
- **High error rate (>5%)** = Check token validity ⚠️

### Rate Limit Remaining
- **>1000** = Plenty of requests left ✅
- **100-1000** = Monitor closely ⚠️
- **<100** = Will rotate to next token soon 🔄
- **0** = Rate limited, waiting for reset ⏳

### Endpoints Used
কোন repository/user বেশি দেখা হচ্ছে সেটা track করে। Example:
```
repos/Akhinoor14/Portfolio - 45 calls
users/Akhinoor14 - 23 calls
repos/Akhinoor14/SolidWorks - 18 calls
```

---

## 🎯 Use Cases

### 1. Performance Monitoring
দেখুন কোন token overused হচ্ছে এবং সেটা balance করুন

### 2. Issue Debugging
Error tracking দেখে বুঝুন কোন request fail হচ্ছে

### 3. Capacity Planning
Total requests দেখে বুঝুন আরও token লাগবে কিনা

### 4. Security Auditing
Recent requests log দেখে কোন unauthorized access detect করুন

---

## 🔧 Technical Implementation

### Backend Tracking Functions

```python
def track_token_usage(token, endpoint, success=True):
    """Track each token usage"""
    # Updates usage_count
    # Tracks endpoints_used
    # Tracks success/error counts

def update_token_rate_limit(token, headers):
    """Update rate limit from GitHub response headers"""
    # Reads X-RateLimit-Remaining
    # Updates token status (active/rate_limited/invalid)

def log_request(endpoint, token_used, status_code):
    """Log recent requests"""
    # Keeps last 100 requests
    # Available via /admin/stats
```

### Frontend Display Functions

```javascript
loadTokenAnalytics()        // Main function to fetch and display
displaySummaryStats(stats)  // Show 8 summary cards
displayTokenDetails(tokens) // Show detailed token cards
displayRecentRequests(log)  // Show recent API calls
```

---

## 📈 Example Analytics Output

```
SUMMARY STATISTICS:
====================
Total Tokens:     4
Active:          3 ✅
Rate Limited:    1 ⚠️
Invalid:         0
Total Requests:  453
Success:         445 (98.2%)
Errors:          8 (1.8%)
API Limit/hr:    20,000

TOKEN DETAILS:
==============
Token: ghp_abc1...xyz1
Status: Active ✅
Usage: 152 times
Success: 150 (98.7%)
Rate Remaining: 4,850/5,000
Last Used: 2025-11-02 14:30:00
Top Endpoints:
  - repos/Akhinoor14/Portfolio: 45 calls
  - users/Akhinoor14: 23 calls

Token: ghp_abc2...xyz2
Status: Rate Limited ⚠️
Usage: 178 times
Success: 175 (98.3%)
Rate Remaining: 0/5,000
Reset: 2025-11-02 15:00:00
Top Endpoints:
  - repos/Akhinoor14/SolidWorks: 67 calls

... (more tokens)

RECENT REQUESTS:
================
2025-11-02 14:30:15 | repos/Akhinoor14/Portfolio | ghp_abc1...xyz1 | 200 ✅
2025-11-02 14:30:10 | users/Akhinoor14          | ghp_abc2...xyz2 | 200 ✅
2025-11-02 14:30:05 | repos/invalid             | ghp_abc1...xyz1 | 404 ⚠️
```

---

## 🎯 Benefits

### For Admin:
- ✅ Complete visibility into token usage
- ✅ Real-time monitoring
- ✅ Early detection of issues
- ✅ Data-driven decisions for token management

### For Public Users:
- ✅ No impact on user experience
- ✅ All tracking happens on backend
- ✅ Zero configuration needed
- ✅ Fast and reliable API access

---

## 🔐 Security Notes

- ✅ All analytics require admin password
- ✅ Tokens are masked in UI (ghp_xxxx...yyyy)
- ✅ Full tokens never exposed to frontend
- ✅ Analytics data stays on backend
- ✅ No logging of sensitive data

---

## 🚀 Next Steps

1. **Auto-refresh**: Set interval to refresh analytics every 30 seconds
2. **Alerts**: Email/notification when token becomes invalid
3. **Charts**: Add visual graphs for usage trends
4. **Export**: Download analytics as CSV/JSON
5. **Webhooks**: Send usage reports to Slack/Discord

---

**Created:** November 2, 2025  
**Status:** ✅ Fully Implemented & Ready  
**Version:** 2.0 with Live Monitoring
