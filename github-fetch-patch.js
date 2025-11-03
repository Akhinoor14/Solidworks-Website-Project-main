/*
 Proxy fetch patch for GitHub GET requests
 - Routes all GET calls to https://api.github.com/... through backend proxy
 - Uses GITHUB_PROXY_CONFIG from github-proxy-config.js
 - Strips any frontend Authorization headers (security)
 - Non-GET methods are left untouched (so admin upload tools keep working)
*/
(function () {
  try {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return;
    if (typeof GITHUB_PROXY_CONFIG === 'undefined') return; // config not loaded yet
    if (!GITHUB_PROXY_CONFIG.USE_PROXY) return; // do nothing if proxy disabled

    const API_PREFIX = 'https://api.github.com/';
    const PROXY_PREFIX = (GITHUB_PROXY_CONFIG.PROXY_URL || '').replace(/\/$/, '') + '/api/github/';

    const originalFetch = window.fetch;

    window.fetch = function patchedFetch(input, init) {
      try {
        let url = typeof input === 'string' ? input : (input && input.url) || '';
        const method = (init && (init.method || init.METHOD)) || (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET');
        const upper = (method || 'GET').toUpperCase();

        // Reroute GET and HEAD requests to GitHub API via proxy
        if (url.startsWith(API_PREFIX) && (upper === 'GET' || upper === 'HEAD')) {
          const path = url.substring(API_PREFIX.length); // everything after domain/
          const proxiedUrl = PROXY_PREFIX + path;

          // Clone/init options and strip Authorization headers
          const options = { ...(init || {}) };
          options.headers = new Headers(options.headers || {});
          options.headers.delete('Authorization');
          options.headers.delete('authorization');

          return originalFetch(proxiedUrl, options);
        }
      } catch (e) {
        console.warn('fetch patch bypass due to error:', e);
      }

      // Fallback to original fetch
      return originalFetch(input, init);
    };

    console.log('🔌 GitHub GET proxy patch active →', GITHUB_PROXY_CONFIG.PROXY_URL);
  } catch (err) {
    console.warn('GitHub proxy fetch patch failed to initialize:', err);
  }
})();
