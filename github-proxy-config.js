/**
 * GitHub API Proxy Configuration - Production Setup
 * ==================================================
 * 
 * This configuration enables automatic backend proxy usage.
 * All GitHub API calls are routed through secure backend server.
 * 
 * Benefits:
 * - No tokens exposed to frontend
 * - Unlimited API access (backend handles rotation)
 * - Secure and professional
 * - Zero user configuration needed
 * 
 * Backend Setup:
 * 1. cd "Backend projects"
 * 2. python setup-tokens.py  (one-time admin setup)
 * 3. python secure-proxy-server.py
 * 
 * For deployment: Deploy to Railway/Heroku and update PROXY_URL below
 */

// ============================================
// PRODUCTION CONFIGURATION
// ============================================

const GITHUB_PROXY_CONFIG = {
    // Enable proxy (SET TO TRUE FOR PRODUCTION)
    USE_PROXY: true,
    
    // Backend proxy server URL
    // Local development: http://localhost:5000
    // Production: https://solidworks-website-project-main-production.up.railway.app
    PROXY_URL: 'https://solidworks-website-project-main-production.up.railway.app',
    
    // Auto-fallback to direct GitHub API if proxy fails
    // Security-first: keep this false so all traffic goes through backend only
    AUTO_FALLBACK: false,
    
    // Cache responses for better performance
    ENABLE_CACHE: true,
    CACHE_DURATION: 300000 // 5 minutes in milliseconds
};

// ============================================
// SMART CACHING SYSTEM
// ============================================

const responseCache = new Map();

function getCacheKey(path, params = {}) {
    const paramString = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    return `${path}?${paramString}`;
}

function getCachedResponse(path, params) {
    if (!GITHUB_PROXY_CONFIG.ENABLE_CACHE) return null;
    
    const key = getCacheKey(path, params);
    const cached = responseCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < GITHUB_PROXY_CONFIG.CACHE_DURATION) {
        console.log(`💾 Cache hit: ${path}`);
        return cached.data;
    }
    
    return null;
}

function setCachedResponse(path, params, data) {
    if (!GITHUB_PROXY_CONFIG.ENABLE_CACHE) return;
    
    const key = getCacheKey(path, params);
    responseCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    // Limit cache size
    if (responseCache.size > 100) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }
}

// ============================================
// API URL BUILDER
// ============================================

/**
 * Get GitHub API URL (proxy or direct)
 * @param {string} path - GitHub API path (e.g., 'repos/owner/repo/contents')
 * @returns {string} - Full API URL
 */
function getGitHubApiUrl(path) {
    if (GITHUB_PROXY_CONFIG.USE_PROXY) {
        const cleanPath = path.replace(/^\//, '');
        return `${GITHUB_PROXY_CONFIG.PROXY_URL}/api/github/${cleanPath}`;
    }
    
    return `https://api.github.com/${path}`;
}

// ============================================
// SMART FETCH WITH PROXY SUPPORT
// ============================================

/**
 * Fetch from GitHub API with automatic proxy and caching
 * @param {string} path - GitHub API path
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchGitHubApi(path, options = {}) {
    // Check cache first
    const params = new URL(path.includes('?') ? `http://x.com/${path}` : 'http://x.com').searchParams;
    const paramObj = Object.fromEntries(params);
    const cleanPath = path.split('?')[0];
    
    const cached = getCachedResponse(cleanPath, paramObj);
    if (cached) {
        return new Response(JSON.stringify(cached), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const url = getGitHubApiUrl(path);
    
    try {
        // If using proxy, remove Authorization header (backend handles tokens)
        if (GITHUB_PROXY_CONFIG.USE_PROXY) {
            const proxyOptions = { ...options };
            if (proxyOptions.headers) {
                delete proxyOptions.headers.Authorization;
                delete proxyOptions.headers['Authorization'];
            }
            
            const response = await fetch(url, proxyOptions);
            
            // Cache successful responses
            if (response.ok) {
                const clonedResponse = response.clone();
                clonedResponse.json().then(data => {
                    setCachedResponse(cleanPath, paramObj, data);
                });
            }
            
            // Auto-fallback if proxy fails
            if (!response.ok && GITHUB_PROXY_CONFIG.AUTO_FALLBACK) {
                console.log('🔄 Proxy failed, falling back to direct GitHub API...');
                const directUrl = `https://api.github.com/${cleanPath}`;
                return await fetch(directUrl, options);
            }
            
            return response;
        }
        
        // Direct GitHub API call
        const response = await fetch(url, options);
        
        // Cache successful responses
        if (response.ok) {
            const clonedResponse = response.clone();
            clonedResponse.json().then(data => {
                setCachedResponse(cleanPath, paramObj, data);
            });
        }
        
        return response;
        
    } catch (error) {
        console.error('❌ API fetch error:', error);
        
        // Network error with proxy, try direct if fallback enabled
        if (GITHUB_PROXY_CONFIG.USE_PROXY && GITHUB_PROXY_CONFIG.AUTO_FALLBACK) {
            console.log('🔄 Network error, falling back to direct GitHub API...');
            const directUrl = `https://api.github.com/${cleanPath}`;
            return await fetch(directUrl, options);
        }
        
        throw error;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear cache (useful for forcing refresh)
 */
function clearGitHubCache() {
    responseCache.clear();
    console.log('🗑️ GitHub API cache cleared');
}

/**
 * Check proxy server health
 */
async function checkProxyHealth() {
    if (!GITHUB_PROXY_CONFIG.USE_PROXY) {
        return { available: false, reason: 'Proxy not enabled' };
    }
    
    try {
        const response = await fetch(`${GITHUB_PROXY_CONFIG.PROXY_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            return { 
                available: true, 
                ...data 
            };
        }
        
        return { available: false, reason: 'Proxy unhealthy' };
    } catch (error) {
        return { available: false, reason: error.message };
    }
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

// Check proxy health on load
if (GITHUB_PROXY_CONFIG.USE_PROXY) {
    checkProxyHealth().then(health => {
        if (health.available) {
            console.log('✅ Backend proxy connected:', health);
            console.log(`⚡ Effective rate limit: ${health.effective_limit} req/hour`);
        } else {
            console.warn('⚠️  Backend proxy not available:', health.reason);
            if (GITHUB_PROXY_CONFIG.AUTO_FALLBACK) {
                console.log('🔄 Using direct GitHub API as fallback');
            }
        }
    });
}

// ============================================
// GLOBAL EXPORTS
// ============================================

if (typeof window !== 'undefined') {
    window.GITHUB_PROXY_CONFIG = GITHUB_PROXY_CONFIG;
    window.getGitHubApiUrl = getGitHubApiUrl;
    window.fetchGitHubApi = fetchGitHubApi;
    window.clearGitHubCache = clearGitHubCache;
    window.checkProxyHealth = checkProxyHealth;
    
    // Log configuration on load
    console.log('🔧 GitHub Proxy Config:', {
        proxy_enabled: GITHUB_PROXY_CONFIG.USE_PROXY,
        proxy_url: GITHUB_PROXY_CONFIG.PROXY_URL,
        cache_enabled: GITHUB_PROXY_CONFIG.ENABLE_CACHE,
        auto_fallback: GITHUB_PROXY_CONFIG.AUTO_FALLBACK
    });
}

