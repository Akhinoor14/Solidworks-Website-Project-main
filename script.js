// Modal functions in global scope for onclick handlers
function openProjectModal(projectTitle) {
    console.log('🔍 Opening modal for:', projectTitle);
    const project = sampleProjects.find(p => p.title === projectTitle);
    if (!project) {
        console.warn('⚠️ Project not found:', projectTitle);
        return;
    }
    
    const modal = createProjectModal(project);
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal on escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function changeMainImage(imgSrc, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imgSrc;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    if (thumbnail) {
        thumbnail.classList.add('active');
    }
}

// ============================================
// GitHub Repository Browser System
// ============================================

// Token helpers for GitHub API
const GITHUB_TOKEN_KEY = 'gh_pat';
function getGitHubToken(){
    try { return localStorage.getItem(GITHUB_TOKEN_KEY) || ''; } catch { return ''; }
}
function setGitHubToken(token){
    try {
        if (token) localStorage.setItem(GITHUB_TOKEN_KEY, token);
        else localStorage.removeItem(GITHUB_TOKEN_KEY);
    } catch {}
}
function getGitHubHeaders(){
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    const token = getGitHubToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// Open GitHub repository browser modal
function openGitHubBrowser(repoUrlOrOwner, projectTitleOrRepo, optionalTitle) {
    console.log('📂 Opening GitHub browser');
    
    let owner, repo, projectTitle;
    
    // Check if called with (owner, repo, title) or (url, title)
    if (optionalTitle) {
        // Called with (owner, repo, title)
        owner = repoUrlOrOwner;
        repo = projectTitleOrRepo;
        projectTitle = optionalTitle;
    } else {
        // Called with (url, title) - legacy format
        const match = repoUrlOrOwner.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            console.error('Invalid GitHub URL');
            return;
        }
        [, owner, repo] = match;
        projectTitle = projectTitleOrRepo;
    }
    
    console.log(`📂 Owner: ${owner}, Repo: ${repo}`);
    
    const modal = createGitHubBrowserModal(owner, repo, projectTitle);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Load repository contents
    loadRepoContents(owner, repo);
    
    // Add ESC key listener
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeGitHubBrowser();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Close GitHub browser modal
function closeGitHubBrowser() {
    const modal = document.getElementById('githubBrowserModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            // Restore body scroll
            document.body.style.overflow = '';
        }, 300);
    }
}

// Create GitHub browser modal
function createGitHubBrowserModal(owner, repo, projectTitle) {
    const modal = document.createElement('div');
    modal.id = 'githubBrowserModal';
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-content github-browser-content">
            <button class="close-modal" onclick="closeGitHubBrowser()" title="Close (ESC)">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="github-browser-header">
                <div class="repo-info">
                    <i class="fab fa-github"></i>
                    <h2>${projectTitle}</h2>
                    <span class="repo-path">${owner}/${repo}</span>
                </div>
                <div class="browser-actions">
                    <button class="github-action-btn" onclick="window.open('https://github.com/${owner}/${repo}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open in GitHub
                    </button>
                    <div style="display:flex; align-items:center; gap:8px; margin-left:12px;">
                        <input id="ghTokenInput" type="password" placeholder="GitHub Token (optional)" 
                               style="padding:0.5rem 0.75rem; border-radius:8px; border:1px solid rgba(255,0,0,0.3); background: rgba(255,255,255,0.1); color:#fff; width:220px;" />
                        <button class="github-action-btn" onclick="window.saveGitHubToken()" title="Save token for higher API limits">Save</button>
                        <button class="github-action-btn" onclick="window.clearGitHubToken()" title="Clear saved token" style="background: linear-gradient(135deg, #666, #444);">Clear</button>
                    </div>
                </div>
            </div>
            
            <div class="github-browser-body">
                <div class="file-explorer">
                    <div class="explorer-header">
                        <i class="fas fa-folder-open"></i>
                        <span>Repository Files</span>
                    </div>
                    <div id="fileTree" class="file-tree">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading repository...
                        </div>
                    </div>
                </div>
                
                <div class="file-viewer">
                    <div class="viewer-header" id="viewerHeader">
                        <i class="fas fa-file"></i>
                        <span>Select a file to preview</span>
                    </div>
                    <div id="fileContent" class="file-content">
                        <div class="empty-state">
                            <i class="fas fa-arrow-left"></i>
                            <p>Select a file from the left panel</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    // Initialize token controls
    setTimeout(()=>{
        const input = modal.querySelector('#ghTokenInput');
        if (input) {
            const hasToken = !!getGitHubToken();
            input.placeholder = hasToken ? 'Token saved • enter to replace' : 'GitHub Token (optional)';
        }
    }, 0);
    
    // Expose token actions
    window.saveGitHubToken = function(){
        const input = document.getElementById('ghTokenInput');
        if (!input) return;
        const val = (input.value || '').trim();
        if (val.length < 10) { alert('Invalid token'); return; }
        setGitHubToken(val);
        input.value = '';
        input.placeholder = 'Token saved • enter to replace';
        // Reload current path root to apply auth
        loadRepoContents(owner, repo);
    };
    window.clearGitHubToken = function(){
        setGitHubToken('');
        const input = document.getElementById('ghTokenInput');
        if (input) input.placeholder = 'GitHub Token (optional)';
        loadRepoContents(owner, repo);
    };
    return modal;
}

// Load repository contents from GitHub API
async function loadRepoContents(owner, repo, path = '') {
    const fileTree = document.getElementById('fileTree');
    
    try {
        // Show loading immediately
        fileTree.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i> Loading...
            </div>
        `;
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: getGitHubHeaders()
        });
        
        if (!response.ok) {
            // Provide a clearer message for rate limit
            let msg = 'Failed to load repository';
            if (response.status === 403) {
                const remain = response.headers.get('x-ratelimit-remaining');
                const reset = response.headers.get('x-ratelimit-reset');
                msg = remain === '0' ? 'GitHub API rate limit exceeded' : 'Access forbidden by GitHub API';
                console.warn('⏳ Rate limit info:', { remain, reset });
            }
            throw new Error(msg);
        }
        
        const contents = await response.json();
        displayFileTree(contents, owner, repo, path);
        
    } catch (error) {
        console.error('Error loading repo:', error);
        fileTree.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${error.message}</p>
                <small>Tip: Add a GitHub token to increase API limits</small>
                <div style="margin-top: 1rem; display:flex; gap:0.5rem;">
                    <button class="github-action-btn" onclick="loadRepoContents('${owner}','${repo}','${path}')">Retry</button>
                    <button class="github-action-btn" onclick="document.getElementById('ghTokenInput')?.focus()" style="background: linear-gradient(135deg, #17a2b8, #007bff);">Add Token</button>
                </div>
            </div>
        `;
    }
}

// Display file tree
function displayFileTree(contents, owner, repo, currentPath) {
    const fileTree = document.getElementById('fileTree');
    
    // Sort: folders first, then files
    const sorted = contents.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });
    
    let html = '';
    
    // Add back button if in subfolder
    if (currentPath) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        html += `
            <div class="file-item folder-item" onclick="loadRepoContents('${owner}', '${repo}', '${parentPath}')">
                <i class="fas fa-arrow-left"></i>
                <span>.. (Back)</span>
            </div>
        `;
    }
    
    sorted.forEach(item => {
        const icon = getFileIcon(item);
        const itemClass = item.type === 'dir' ? 'folder-item' : 'file-item';
        
        if (item.type === 'dir') {
            html += `
                <div class="${itemClass}" onclick="loadRepoContents('${owner}', '${repo}', '${item.path}')">
                    <i class="${icon}"></i>
                    <span>${item.name}</span>
                </div>
            `;
        } else {
            html += `
                <div class="${itemClass}" onclick="viewFile('${owner}', '${repo}', '${item.path}', '${item.name}', '${item.download_url}')">
                    <i class="${icon}"></i>
                    <span>${item.name}</span>
                </div>
            `;
        }
    });
    
    fileTree.innerHTML = html;
}

// Get appropriate icon for file type
function getFileIcon(item) {
    if (item.type === 'dir') return 'fas fa-folder';
    
    const ext = item.name.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'md': 'fab fa-markdown',
        'png': 'fas fa-file-image',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'svg': 'fas fa-file-image',
        'sldprt': 'fas fa-cube',
        'sldasm': 'fas fa-cubes',
        'slddrw': 'fas fa-file-alt',
        'step': 'fas fa-cube',
        'stl': 'fas fa-cube',
        'glb': 'fas fa-cube',
        'js': 'fab fa-js-square',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'json': 'fas fa-brackets-curly',
        'txt': 'fas fa-file-alt'
    };
    
    return iconMap[ext] || 'fas fa-file';
}

    // ============================================
    // Robust Markdown rendering (marked.js + highlight.js)
    // Used by GitHub browser and auto-repo cards
    // ============================================

    async function ensureMarkdownDeps() {
        const loadScript = (src) => new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
        const loadCss = (href) => new Promise((resolve, reject) => {
            if (document.querySelector(`link[data-md-css="${href}"]`)) return resolve();
            const l = document.createElement('link');
            l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-md-css', href);
            l.onload = resolve; l.onerror = reject; document.head.appendChild(l);
        });

        // Load marked if absent
        if (typeof window.marked === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
        }
        // Load highlight.js (common languages) + theme if absent
        if (typeof window.hljs === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/common.min.js');
            await loadCss('https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css');
        }
        // Load KaTeX + auto-render for math if absent
        if (typeof window.katex === 'undefined') {
            await loadCss('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
            await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js');
        }
    }

    function computeRepoUrls(owner, repo, fullPath) {
        const norm = (fullPath || '').replace(/\\/g, '/');
        const baseDir = norm.includes('/') ? norm.split('/').slice(0, -1).join('/') + '/' : '';
        const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${baseDir}`;
        const blobBase = `https://github.com/${owner}/${repo}/blob/HEAD/${baseDir}`;
        return { baseDir, rawBase, blobBase };
    }

    function postProcessMarkdown(container, owner, repo, fullPath) {
        const { rawBase, blobBase } = computeRepoUrls(owner, repo, fullPath);
        // fix relative images
        container.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            if (!/^(https?:)?\/\//i.test(src) && !src.startsWith('data:') && !src.startsWith('#')) {
                img.src = rawBase + src.replace(/^\.\//,'');
            }
            img.loading = 'lazy';
            img.decoding = 'async';
            img.style.maxWidth = '100%';
        });
        // fix relative links
        container.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href.startsWith('#') || /^mailto:/i.test(href)) return;
            if (!/^(https?:)?\/\//i.test(href) && !href.startsWith('data:')) {
                a.href = blobBase + href.replace(/^\.\//,'');
                a.target = '_blank';
                a.rel = 'noopener';
            }
        });
        // code highlighting
        if (window.hljs) {
            container.querySelectorAll('pre code').forEach(block => {
                try { window.hljs.highlightElement(block); } catch {}
            });
        }
        // add copy buttons for code blocks
        container.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('.md-copy-btn')) return;
            const btn = document.createElement('button');
            btn.className = 'md-copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const code = pre.querySelector('code');
                try {
                    await navigator.clipboard.writeText(code ? code.innerText : pre.innerText);
                    btn.textContent = 'Copied!';
                    setTimeout(()=> btn.textContent = 'Copy', 1200);
                } catch {}
            });
            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    }

    function buildMarkdownTOC(mdRoot) {
        const headings = Array.from(mdRoot.querySelectorAll('h1, h2, h3'));
        if (headings.length < 2) return '';
        const items = headings.map(h => {
            const id = h.id || (h.textContent || '').trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF\s-]/gi,'').replace(/\s+/g,'-');
            if (!h.id) h.id = id;
            const level = h.tagName.toLowerCase();
            const indent = level === 'h1' ? 0 : level === 'h2' ? 1 : 2;
            return `<li class="toc-l${indent}"><a href="#${id}">${h.textContent || ''}</a></li>`;
        }).join('');
        return `<ul class="md-toc-list">${items}</ul>`;
    }

    function setupReaderUI(wrapperEl) {
        const content = wrapperEl.querySelector('.md-content');
        const tocBox = wrapperEl.querySelector('.md-toc');
        const toolbar = wrapperEl.querySelector('.md-reader-toolbar');
        const progress = wrapperEl.querySelector('.md-progress');
        const progressBar = wrapperEl.querySelector('.md-progress-bar');
        if (!content || !toolbar) return;

        // Defaults
        const PREF_KEY = 'mdReaderPrefs';
        const saved = (()=>{ try { return JSON.parse(localStorage.getItem(PREF_KEY)||'{}'); } catch { return {}; } })();
        let fontSize = typeof saved.fontSize === 'number' ? saved.fontSize : 0.95; // rem
        let narrow = typeof saved.narrow === 'boolean' ? saved.narrow : true;
        let wrap = typeof saved.wrap === 'boolean' ? saved.wrap : false;
        let light = typeof saved.light === 'boolean' ? saved.light : false;
        let inFs = false;
        let placeholder = null;
        let escHandler = null;

        const apply = () => {
            content.style.setProperty('--md-font-size', fontSize + 'rem');
            content.classList.toggle('md-narrow', narrow);
            content.classList.toggle('md-wrap', wrap);
            wrapperEl.classList.toggle('md-light', light);
            try { localStorage.setItem(PREF_KEY, JSON.stringify({ fontSize, narrow, wrap, light })); } catch {}
        };
        apply();

        // Build TOC
        const tocHtml = buildMarkdownTOC(content);
        if (tocHtml) {
            tocBox.innerHTML = `<div class="md-toc-title">Contents</div>${tocHtml}`;
        } else {
            tocBox.classList.add('hidden');
        }

        // Estimate reading time
        const text = content.textContent || '';
        const words = (text.match(/\S+/g) || []).length;
        const minutes = Math.max(1, Math.ceil(words / 180));
        const timeEl = toolbar.querySelector('[data-role="readtime"]');
        if (timeEl) timeEl.textContent = `${minutes} min read`;

        // Scroll progress + TOC scrollspy
        const onScroll = () => {
            if (!progress || !progressBar) return;
            const total = content.scrollHeight - content.clientHeight;
            const y = content.scrollTop;
            const pct = total > 0 ? Math.min(100, Math.max(0, (y/total)*100)) : 0;
            progressBar.style.width = pct + '%';
        };
        const spy = () => {
            const heads = Array.from(content.querySelectorAll('h1,h2,h3'));
            if (!heads.length) return;
            let activeId = heads[0].id;
            const threshold = content.scrollTop + 100;
            for (const h of heads) {
                if (h.offsetTop <= threshold) activeId = h.id;
                else break;
            }
            tocBox.querySelectorAll('a').forEach(a=>{
                a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
            });
        };

        // Fullscreen management
        const enterFs = () => {
            if (inFs) return;
            placeholder = document.createComment('md-reader-placeholder');
            wrapperEl.parentNode.insertBefore(placeholder, wrapperEl);
            document.body.appendChild(wrapperEl);
            wrapperEl.classList.add('md-fs');
            if (progress) progress.hidden = false;
            inFs = true;
            // ESC to exit
            escHandler = (e)=>{ if (e.key === 'Escape') exitFs(); };
            document.addEventListener('keydown', escHandler);
            // Scroll listeners
            content.addEventListener('scroll', onScroll);
            content.addEventListener('scroll', spy);
            // Initial update
            onScroll(); spy();
        };
        const exitFs = () => {
            if (!inFs) return;
            wrapperEl.classList.remove('md-fs');
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(wrapperEl, placeholder);
                placeholder.remove();
                placeholder = null;
            }
            if (progress) progress.hidden = true;
            inFs = false;
            document.removeEventListener('keydown', escHandler);
            escHandler = null;
            content.removeEventListener('scroll', onScroll);
            content.removeEventListener('scroll', spy);
        };

        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const act = btn.getAttribute('data-act');
            if (act === 'font-inc') { fontSize = Math.min(1.4, fontSize + 0.05); apply(); }
            else if (act === 'font-dec') { fontSize = Math.max(0.8, fontSize - 0.05); apply(); }
            else if (act === 'width') { narrow = !narrow; apply(); }
            else if (act === 'wrap') { wrap = !wrap; apply(); }
            else if (act === 'theme') { light = !light; apply(); }
            else if (act === 'toc') { tocBox.classList.toggle('hidden'); }
            else if (act === 'help') { wrapperEl.querySelector('.md-help-panel').classList.toggle('hidden'); }
            else if (act === 'fs') { inFs ? exitFs() : enterFs(); }
        });

        // Keyboard shortcuts
        wrapperEl.addEventListener('keydown', (e) => {
            if (e.target && ['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
            if (e.key === '+' || e.key === '=') { fontSize = Math.min(1.4, fontSize + 0.05); apply(); }
            else if (e.key === '-') { fontSize = Math.max(0.8, fontSize - 0.05); apply(); }
            else if (e.key.toLowerCase() === 'w') { narrow = !narrow; apply(); }
            else if (e.key.toLowerCase() === 'r') { wrap = !wrap; apply(); }
            else if (e.key.toLowerCase() === 't') { light = !light; apply(); }
            else if (e.key.toLowerCase() === 'f') { inFs ? exitFs() : enterFs(); }
        });

        // If user clicks a TOC link, close TOC in small view
        tocBox.addEventListener('click', (e)=>{
            const a = e.target.closest('a');
            if (!a) return;
            if (!inFs) tocBox.classList.add('hidden');
        });
    }

    async function renderMarkdownInto(container, markdownText, { owner, repo, path="" } = {}) {
        // Prefer marked + hljs
        try { await ensureMarkdownDeps(); } catch {}
        if (window.marked) {
            try {
                window.marked.setOptions({
                    gfm: true,
                    breaks: true,
                    mangle: false,
                    headerIds: true,
                    highlight: (code, lang) => {
                        if (window.hljs && lang && window.hljs.getLanguage(lang)) {
                            return window.hljs.highlight(code, { language: lang }).value;
                        } else if (window.hljs) {
                            return window.hljs.highlightAuto(code).value;
                        }
                        return code;
                    }
                });
            } catch {}
            const html = window.marked.parse(markdownText || '');
            container.innerHTML = `
                <div class="md-reader">
                    <div class="md-reader-toolbar">
                        <button class="md-btn" data-act="toc" title="Toggle table of contents">TOC</button>
                        <span class="md-sep"></span>
                        <button class="md-btn" data-act="font-dec" title="Smaller text">A-</button>
                        <button class="md-btn" data-act="font-inc" title="Larger text">A+</button>
                        <span class="md-sep"></span>
                        <button class="md-btn" data-act="width" title="Toggle width">Width</button>
                        <button class="md-btn" data-act="wrap" title="Wrap code">Wrap</button>
                        <button class="md-btn" data-act="theme" title="Toggle light theme">Theme</button>
                        <span class="md-sep"></span>
                        <button class="md-btn" data-act="fs" title="Fullscreen (F key)">Fullscreen</button>
                        <button class="md-btn md-help-btn" data-act="help" title="Keyboard shortcuts">
                            <i class="fas fa-keyboard"></i>
                        </button>
                        <span class="md-info" data-role="readtime" title="Estimated reading time" style="margin-left:auto; opacity:.9"></span>
                    </div>
                    <div class="md-progress" hidden><div class="md-progress-bar"></div></div>
                    <div class="md-toc hidden"></div>
                    <div class="md-help-panel hidden">
                        <div class="md-help-header">
                            <h3>📖 Reading Controls & Shortcuts</h3>
                            <button class="md-help-close" data-act="help">×</button>
                        </div>
                        <div class="md-help-content">
                            <div class="md-help-section">
                                <h4>⌨️ Keyboard Shortcuts</h4>
                                <div class="md-shortcut-list">
                                    <div class="md-shortcut"><kbd>F</kbd><span>Toggle Fullscreen</span></div>
                                    <div class="md-shortcut"><kbd>T</kbd><span>Toggle Light/Dark Theme</span></div>
                                    <div class="md-shortcut"><kbd>W</kbd><span>Toggle Narrow/Full Width</span></div>
                                    <div class="md-shortcut"><kbd>R</kbd><span>Toggle Code Wrap</span></div>
                                    <div class="md-shortcut"><kbd>+</kbd> or <kbd>=</kbd><span>Increase Font Size</span></div>
                                    <div class="md-shortcut"><kbd>-</kbd><span>Decrease Font Size</span></div>
                                    <div class="md-shortcut"><kbd>ESC</kbd><span>Exit Fullscreen</span></div>
                                </div>
                            </div>
                            <div class="md-help-section">
                                <h4>🖱️ Toolbar Features</h4>
                                <ul class="md-feature-list">
                                    <li><strong>TOC:</strong> Table of contents for quick navigation</li>
                                    <li><strong>A- / A+:</strong> Adjust reading font size</li>
                                    <li><strong>Width:</strong> Switch between narrow (focused) and full width</li>
                                    <li><strong>Wrap:</strong> Wrap long code lines for better readability</li>
                                    <li><strong>Theme:</strong> Toggle light/dark mode for content</li>
                                    <li><strong>Fullscreen:</strong> Immersive reading mode with progress bar</li>
                                </ul>
                            </div>
                            <div class="md-help-section">
                                <h4>💡 Tips</h4>
                                <ul class="md-feature-list">
                                    <li>Your preferences (font size, width, theme) are saved automatically</li>
                                    <li>In fullscreen, scroll progress is shown at the top</li>
                                    <li>TOC highlights your current section while reading</li>
                                    <li>Click code blocks to copy them instantly</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="markdown-body md-content">${html}</div>
                </div>`;
            const mdScope = container.querySelector('.md-reader');
            const mdContent = container.querySelector('.md-content');
            postProcessMarkdown(mdContent, owner, repo, path || 'README.md');
            // Render math (KaTeX) if available
            try {
                if (typeof window.renderMathInElement === 'function') {
                    window.renderMathInElement(mdContent, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false },
                            { left: '\\(', right: '\\)', display: false },
                            { left: '\\[', right: '\\]', display: true }
                        ],
                        throwOnError: false,
                        ignoredTags: ['script','noscript','style','textarea','pre','code'],
                        ignoredClasses: ['no-math']
                    });
                }
            } catch {}
            // Setup reader toolbar and TOC
            setupReaderUI(mdScope);
            return;
        }
        // Fallback: minimal converter preserving code blocks
        const safe = (s)=> s.replace(/[&<>]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
        // preserve fenced blocks
        const blocks = [];
        const replaced = (markdownText||'').replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code)=>{
            const id = blocks.push({ lang: lang||'', code }) - 1;
            return `@@BLOCK_${id}@@`;
        });
        let html = replaced
            .replace(/^### (.*)$/gim, '<h3>$1</h3>')
            .replace(/^## (.*)$/gim, '<h2>$1</h2>')
            .replace(/^# (.*)$/gim, '<h1>$1</h1>')
            .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
            .replace(/^\s*[-*] (.*)$/gim, '<li>$1</li>')
            .replace(/(?:<li>.*?<\/li>\s*)+/gims, (b)=>`<ul>${b}</ul>`)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src)=>`<img alt="${safe(alt)}" src="${safe(src)}" />`)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href)=>`<a href="${safe(href)}" target="_blank" rel="noopener">${text}</a>`)
            .replace(/(^|\n)([^<\n][^\n]*)/g, (m, pre, line)=> /^(\s*<)/.test(line) ? m : `${pre}<p>${line}</p>`);
        html = html.replace(/@@BLOCK_(\d+)@@/g, (m, i)=>{
            const b = blocks[Number(i)];
            const code = safe(b.code);
            const langClass = b.lang ? `language-${b.lang}` : '';
            return `<pre><code class="${langClass}">${code}</code></pre>`;
        });
        container.innerHTML = `
            <div class="md-reader">
                <div class="md-reader-toolbar">
                    <button class="md-btn" data-act="toc" title="Toggle table of contents">TOC</button>
                    <span class="md-sep"></span>
                    <button class="md-btn" data-act="font-dec" title="Smaller text">A-</button>
                    <button class="md-btn" data-act="font-inc" title="Larger text">A+</button>
                    <span class="md-sep"></span>
                    <button class="md-btn" data-act="width" title="Toggle width">Width</button>
                    <button class="md-btn" data-act="wrap" title="Wrap code">Wrap</button>
                    <button class="md-btn" data-act="theme" title="Toggle light theme">Theme</button>
                    <span class="md-sep"></span>
                    <button class="md-btn" data-act="fs" title="Fullscreen (F key)">Fullscreen</button>
                    <button class="md-btn md-help-btn" data-act="help" title="Keyboard shortcuts">
                        <i class="fas fa-keyboard"></i>
                    </button>
                    <span class="md-info" data-role="readtime" title="Estimated reading time" style="margin-left:auto; opacity:.9"></span>
                </div>
                <div class="md-progress" hidden><div class="md-progress-bar"></div></div>
                <div class="md-toc hidden"></div>
                <div class="md-help-panel hidden">
                    <div class="md-help-header">
                        <h3>📖 Reading Controls & Shortcuts</h3>
                        <button class="md-help-close" data-act="help">×</button>
                    </div>
                    <div class="md-help-content">
                        <div class="md-help-section">
                            <h4>⌨️ Keyboard Shortcuts</h4>
                            <div class="md-shortcut-list">
                                <div class="md-shortcut"><kbd>F</kbd><span>Toggle Fullscreen</span></div>
                                <div class="md-shortcut"><kbd>T</kbd><span>Toggle Light/Dark Theme</span></div>
                                <div class="md-shortcut"><kbd>W</kbd><span>Toggle Narrow/Full Width</span></div>
                                <div class="md-shortcut"><kbd>R</kbd><span>Toggle Code Wrap</span></div>
                                <div class="md-shortcut"><kbd>+</kbd> or <kbd>=</kbd><span>Increase Font Size</span></div>
                                <div class="md-shortcut"><kbd>-</kbd><span>Decrease Font Size</span></div>
                                <div class="md-shortcut"><kbd>ESC</kbd><span>Exit Fullscreen</span></div>
                            </div>
                        </div>
                        <div class="md-help-section">
                            <h4>🖱️ Toolbar Features</h4>
                            <ul class="md-feature-list">
                                <li><strong>TOC:</strong> Table of contents for quick navigation</li>
                                <li><strong>A- / A+:</strong> Adjust reading font size</li>
                                <li><strong>Width:</strong> Switch between narrow (focused) and full width</li>
                                <li><strong>Wrap:</strong> Wrap long code lines for better readability</li>
                                <li><strong>Theme:</strong> Toggle light/dark mode for content</li>
                                <li><strong>Fullscreen:</strong> Immersive reading mode with progress bar</li>
                            </ul>
                        </div>
                        <div class="md-help-section">
                            <h4>💡 Tips</h4>
                            <ul class="md-feature-list">
                                <li>Your preferences (font size, width, theme) are saved automatically</li>
                                <li>In fullscreen, scroll progress is shown at the top</li>
                                <li>TOC highlights your current section while reading</li>
                                <li>Click code blocks to copy them instantly</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="markdown-body md-content">${html}</div>
            </div>`;
        const mdScope = container.querySelector('.md-reader');
        const mdContent = container.querySelector('.md-content');
        postProcessMarkdown(mdContent, owner, repo, path || 'README.md');
        try {
            if (typeof window.renderMathInElement === 'function') {
                window.renderMathInElement(mdContent, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false,
                    ignoredTags: ['script','noscript','style','textarea','pre','code'],
                    ignoredClasses: ['no-math']
                });
            }
        } catch {}
        setupReaderUI(mdScope);
    }

    // Global helpers for any code path expecting these names
    window.viewMarkdown = async function(owner, repo, path, container) {
        function decodeBase64Utf8(b64){
            try {
                const bin = atob(String(b64).replace(/\n/g, ''));
                const len = bin.length;
                const bytes = new Uint8Array(len);
                for (let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i);
                if (typeof TextDecoder !== 'undefined') {
                    return new TextDecoder('utf-8').decode(bytes);
                }
                // Fallback for very old browsers
                return decodeURIComponent(escape(bin));
            } catch(e) {
                return '';
            }
        }
        try {
            // Prefer raw URL via GitHub API contents endpoint to avoid HTML pages
            const headers = getGitHubHeaders();
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`, { headers });
            if (res.ok) {
                const data = await res.json();
                let text = '';
                if (data.content && data.encoding === 'base64') {
                    text = decodeBase64Utf8(data.content);
                } else if (data.download_url) {
                    const raw = await fetch(data.download_url);
                    text = await raw.text();
                }
                await renderMarkdownInto(container, text, { owner, repo, path });
                return;
            }
            // fallback: try raw URL pattern
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${encodeURIComponent(path).replace(/%2F/g,'/')}`;
            const raw = await fetch(rawUrl);
            const text = await raw.text();
            await renderMarkdownInto(container, text, { owner, repo, path });
        } catch (err) {
            container.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load Markdown</p></div>';
            console.error('viewMarkdown error:', err);
        }
    };

// ============================================
// Generic GitHub Repo Auto-Update Cards
// ============================================

function initAutoRepoCards() {
    const cards = document.querySelectorAll('.repo-auto-card');
    if (!cards.length) return;
    cards.forEach(initAutoRepoCard);
}

function initAutoRepoCard(card) {
    const owner = card.getAttribute('data-owner');
    const repo = card.getAttribute('data-repo');
    const path = card.getAttribute('data-path') || '';

    // Wire quick actions
    const openBtn = card.querySelector('[data-action="open"]');
    const browseBtn = card.querySelector('[data-action="browse"]');
    if (openBtn) openBtn.href = `https://github.com/${owner}/${repo}`;
    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openGitHubBrowser(owner, repo, `${repo}`);
        });
    }

    // Initial load and then start polling
    loadRepoCardData(card, { owner, repo, path });
    startRepoPolling(card, { owner, repo, path });
}

async function loadRepoCardData(card, cfg) {
    const { owner, repo, path } = cfg;
    const headers = getGitHubHeaders();
    const titleEl = card.querySelector('[data-title]');
    const descEl = card.querySelector('[data-desc]');
    const statsEl = card.querySelector('[data-stats]');
    const listEl = card.querySelector('[data-list]');

    try {
        // Repo info: update title/desc
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (repoRes.ok) {
            const repoInfo = await repoRes.json();
            if (titleEl) titleEl.textContent = repoInfo.name || titleEl.textContent;
            if (descEl) descEl.textContent = repoInfo.description || descEl.textContent;
        }

    // Contents listing
    const pathPart = path ? `/${encodeURIComponent(path).replace(/%2F/g,'/')}` : '';
    const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents${pathPart}`, { headers });
        if (!contentsRes.ok) throw new Error('Failed to load repository contents');
        const contents = await contentsRes.json();

        // Render list: folders first then files (.md, .pdf, images, code)
        const sorted = contents.slice().sort((a,b)=>{
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        let html = '';
        sorted.forEach(item => {
            const isDir = item.type === 'dir';
            const icon = isDir ? 'fas fa-folder' : getFileIcon({ name: item.name, type: 'file' });
            const badge = isDir ? 'DIR' : (item.name.split('.').pop() || '').toUpperCase();
            const ghUrl = item.html_url;
            const name = item.name;
            html += `
                <div class="sw-file-item">
                    <div class="sw-file-header">
                        <i class="${icon}"></i>
                        <span class="sw-file-name">${name}</span>
                        <span class="sw-file-badge">${badge}</span>
                    </div>
                    <div class="sw-file-actions">
                        <a href="${ghUrl}" target="_blank" class="sw-action-btn sw-btn-page" title="Open on GitHub">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    </div>
                </div>
            `;
        });

        listEl.innerHTML = html || '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No files found</p></div>';

        // Try to find README (case-insensitive) in contents and render a short preview
        const readmeEl = card.querySelector('[data-readme]');
        if (readmeEl) {
            const readmeItem = contents.find(c => /^readme(\.|$)/i.test(c.name));
            if (readmeItem) {
                // compute path for file
                const readmePath = (path ? `${path}/` : '') + readmeItem.name;
                // Clear loading spinner
                readmeEl.innerHTML = '';
                try {
                    // Prefer using viewMarkdown if available
                    if (typeof viewMarkdown === 'function') {
                        const container = document.createElement('div');
                        container.className = 'readme-container';
                        readmeEl.appendChild(container);
                        viewMarkdown(owner, repo, readmePath, container).catch(async () => {
                            // fallback: fetch raw and render
                            const rawRes = await fetch(readmeItem.download_url);
                            const md = await rawRes.text();
                            container.innerHTML = markdownToHTML(md, { owner, repo, baseDir: readmePath.replace(/[^/]+$/, '') });
                        });
                    } else {
                        // fallback: fetch raw and render
                        const rawRes = await fetch(readmeItem.download_url);
                        const md = await rawRes.text();
                        readmeEl.innerHTML = markdownToHTML(md, { owner, repo, baseDir: readmePath.replace(/[^/]+$/, '') });
                    }

                    // Add small actions: Open README full in browser modal or GitHub
                    const actions = document.createElement('div');
                    actions.style.marginTop = '0.5rem';
                    actions.innerHTML = `
                        <button class="github-action-btn" style="margin-right:8px;" onclick="openGitHubBrowser('${owner}','${repo}','${repo}')">Browse</button>
                        <a class="github-action-btn" target="_blank" href="https://github.com/${owner}/${repo}/blob/main/${encodeURIComponent(readmePath).replace(/%2F/g,'/')}">Open README on GitHub</a>
                    `;
                    readmeEl.appendChild(actions);
                } catch (e) {
                    readmeEl.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load README</p></div>';
                }
            } else {
                // no README found
                readmeEl.innerHTML = '<div class="empty-state"><i class="fas fa-file-alt"></i><p>No README found</p></div>';
            }
        }

        // Stats: counts and last update
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?${path?`path=${encodeURIComponent(path)}&`:''}per_page=1`, { headers });
        let last = 'Unknown';
        if (commitsRes.ok) {
            const commits = await commitsRes.json();
            if (Array.isArray(commits) && commits.length) {
                last = new Date(commits[0].commit.author.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
                // save sha for polling
                card.__lastSha = commits[0].sha;
            }
        }
        const fileCount = contents.filter(c => c.type === 'file').length;
        const dirCount = contents.filter(c => c.type === 'dir').length;
        if (statsEl) statsEl.innerHTML = `Last updated: <strong>${last}</strong> • <strong>${dirCount}</strong> folders • <strong>${fileCount}</strong> files`;
    } catch (err) {
        console.error('Repo card load error:', err);
        if (listEl) listEl.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load contents</p></div>';
    }
}

function startRepoPolling(card, cfg) {
    const { owner, repo, path } = cfg;
    const headers = getGitHubHeaders();
    if (card.__pollTimer) clearInterval(card.__pollTimer);
    card.__pollTimer = setInterval(async () => {
        try {
            const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?${path?`path=${encodeURIComponent(path)}&`:''}per_page=1`, { headers });
            if (!commitsRes.ok) return;
            const commits = await commitsRes.json();
            if (!Array.isArray(commits) || !commits.length) return;
            const sha = commits[0].sha;
            if (card.__lastSha && sha !== card.__lastSha) {
                await loadRepoCardData(card, cfg);
                if (typeof showToast === 'function') showToast('Updated', `${repo} content refreshed automatically`, 'success');
            } else {
                card.__lastSha = sha; // initialize if missing
            }
        } catch (e) {
            // silent fail to avoid spam
        }
    }, 30000);
}

// View file content
async function viewFile(owner, repo, path, name, downloadUrl) {
    const viewerHeader = document.getElementById('viewerHeader');
    const fileContent = document.getElementById('fileContent');
    
    // Update header
    const ext = name.split('.').pop().toLowerCase();
    const icon = getFileIcon({ name, type: 'file' });
    viewerHeader.innerHTML = `
        <i class="${icon}"></i>
        <span>${name}</span>
        <a href="${downloadUrl}" download class="download-btn" title="Download">
            <i class="fas fa-download"></i>
        </a>
    `;
    
    // Show loading
    fileContent.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> Loading file...
        </div>
    `;
    
    try {
        // Handle different file types
        if (ext === 'pdf') {
            await viewPDF(downloadUrl, fileContent);
        } else if (ext === 'md') {
            await viewMarkdown(owner, repo, path, fileContent);
        } else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
            viewImage(downloadUrl, fileContent);
        } else if (['sldprt', 'sldasm', 'slddrw', 'step', 'stl'].includes(ext)) {
            viewCADFile(name, downloadUrl, fileContent);
        } else if (['glb', 'gltf'].includes(ext)) {
            await view3DModel(downloadUrl, fileContent);
        } else if (['js', 'html', 'css', 'json', 'txt', 'py', 'java', 'cpp'].includes(ext)) {
            await viewCode(downloadUrl, ext, fileContent);
        } else {
            viewGenericFile(name, downloadUrl, fileContent);
        }
    } catch (error) {
        console.error('Error viewing file:', error);
        fileContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load file</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// View PDF files (use PDF.js viewer to avoid download prompts) with native fallback and fullscreen
async function viewPDF(url, container) {
    const containerId = `pdfc_${Math.random().toString(36).slice(2)}`;
    container.id = containerId;
    const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    container.innerHTML = `
        <div class="pdf-viewer">
            <div style="display:flex; justify-content:space-between; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                <div style="display:flex; gap:8px;">
                    <button class="github-action-btn pdf-ctrl-btn" onclick="window.fullscreenPdf('${containerId}')" style="padding:0.4rem 0.8rem; border-radius:8px;">
                        <i class="fas fa-expand"></i> Fullscreen
                    </button>
                    <a href="${url}" target="_blank" rel="noopener" class="github-action-btn pdf-ctrl-btn" style="padding:0.4rem 0.8rem; border-radius:8px;">
                        <i class="fas fa-external-link-alt"></i> Open Direct
                    </a>
                </div>
                <button class="github-action-btn pdf-ctrl-btn" style="padding:0.4rem 0.8rem; border-radius:8px; background: linear-gradient(135deg,#6b7280,#374151);" onclick="window.useNativePdf('${encodeURIComponent(url)}','${containerId}')">Use Native Viewer</button>
            </div>
            <iframe id="${containerId}_iframe" src="${viewerUrl}" frameborder="0" allow="fullscreen"></iframe>
            <p class="pdf-fallback">
                If the PDF doesn't load, <a href="${url}" target="_blank" rel="noopener">open it directly</a>
            </p>
        </div>
    `;
}

// PDF fullscreen handler
window.fullscreenPdf = function(containerId) {
    const iframe = document.getElementById(containerId + '_iframe');
    if (!iframe) return;
    
    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
};

// Global helper to swap to native PDF embed
window.useNativePdf = function(encodedUrl, containerId){
    try {
        const url = decodeURIComponent(encodedUrl);
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = `
            <div class="pdf-viewer">
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <a href="${url}" target="_blank" rel="noopener" class="github-action-btn" style="padding:0.4rem 0.8rem; border-radius:8px;">
                        <i class="fas fa-external-link-alt"></i> Open Direct
                    </a>
                </div>
                <object data="${url}" type="application/pdf" width="100%" height="100%" style="min-height:600px; border-radius:10px; background:white;">
                    <p class="pdf-fallback">Your browser can't display this PDF. <a href="${url}" target="_blank" rel="noopener">Open it</a></p>
                </object>
            </div>
        `;
    } catch {}
};

// View Markdown files with proper rendering + relative asset fixups (uses enhanced pipeline)
async function viewMarkdown(owner, repo, path, container) {
    return window.viewMarkdown(owner, repo, path, container);
}

// Basic Markdown to HTML converter
function markdownToHTML(markdown, opts = {}) {
    const { owner = '', repo = '', baseDir = '' } = opts;

    // Helper to detect absolute URLs
    const isAbsolute = (u) => /^(https?:)?\/\//i.test(u) || u.startsWith('data:') || u.startsWith('#');

    // Resolve relative repository URLs
    const resolveRepoUrl = (u, type = 'link') => {
        if (!u || isAbsolute(u)) return u;
        // Handle root-relative paths
        const pathResolved = u.startsWith('/') ? u.replace(/^\/+/, '') : [baseDir, u].filter(Boolean).join('/');
        if (type === 'image') {
            // Raw content URL for images
            return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${pathResolved}`;
        }
        // Default to GitHub blob URL for other links
        return `https://github.com/${owner}/${repo}/blob/HEAD/${pathResolved}`;
    };

    let html = markdown;

    // Code blocks first to avoid interfering with inline formatting
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (m, lang, code) => {
        return `<pre><code class="language-${lang.trim()}">${escapeHtml(code)}</code></pre>`;
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1<\/h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1<\/h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1<\/h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1<\/strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1<\/em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1<\/code>');

    // Images (rewrite relative URLs to raw)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
        const fixed = resolveRepoUrl(src.trim(), 'image');
        return `<img src="${fixed}" alt="${escapeHtml(alt)}" />`;
    });

    // Links (rewrite relative URLs to GitHub blob)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => {
        const fixed = resolveRepoUrl(href.trim(), 'link');
        return `<a href="${fixed}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`;
    });

    // Lists (bulleted)
    // Convert lines starting with * or - into list items, then wrap consecutive items in <ul>
    html = html.replace(/^\s*[-*] (.*)$/gim, '<li>$1<\/li>');
    html = html.replace(/(?:<li>.*?<\/li>\s*)+/gims, (block) => `<ul>${block}<\/ul>`);

    // Paragraphs
    html = html.replace(/(^|\n)([^<\n][^\n]*)/g, (m, pre, line) => {
        // Skip if this line already starts with an HTML block element
        if (/^\s*<\/?(h\d|ul|ol|li|pre|img|blockquote|code)/i.test(line)) return m;
        return `${pre}<p>${line}<\/p>`;
    });

    return html;
}

// View image files with zoom and fullscreen
function viewImage(url, container) {
    const imgId = `img_${Math.random().toString(36).slice(2)}`;
    container.innerHTML = `
        <div class="image-viewer">
            <div class="image-controls">
                <button class="img-ctrl-btn" onclick="window.zoomImage('${imgId}', 1.2)" title="Zoom In">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="img-ctrl-btn" onclick="window.zoomImage('${imgId}', 0.8)" title="Zoom Out">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="img-ctrl-btn" onclick="window.resetZoomImage('${imgId}')" title="Reset Zoom">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="img-ctrl-btn" onclick="window.fullscreenImage('${imgId}')" title="Fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
                <a href="${url}" download class="img-ctrl-btn" title="Download">
                    <i class="fas fa-download"></i>
                </a>
            </div>
            <div class="image-container" id="${imgId}_container">
                <img id="${imgId}" src="${url}" alt="Preview" style="cursor: zoom-in;" onclick="window.fullscreenImage('${imgId}')" />
            </div>
        </div>
    `;
}

// Image zoom and fullscreen controls
window.zoomImage = function(imgId, factor) {
    const img = document.getElementById(imgId);
    if (!img) return;
    const current = img.dataset.scale ? parseFloat(img.dataset.scale) : 1;
    const newScale = Math.max(0.5, Math.min(5, current * factor));
    img.dataset.scale = newScale;
    img.style.transform = `scale(${newScale})`;
    img.style.cursor = newScale > 1 ? 'zoom-out' : 'zoom-in';
};

window.resetZoomImage = function(imgId) {
    const img = document.getElementById(imgId);
    if (!img) return;
    img.dataset.scale = 1;
    img.style.transform = 'scale(1)';
    img.style.cursor = 'zoom-in';
};

window.fullscreenImage = function(imgId) {
    const img = document.getElementById(imgId);
    if (!img) return;
    
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'image-fullscreen-overlay';
    overlay.innerHTML = `
        <div class="fullscreen-controls">
            <button onclick="this.parentElement.parentElement.remove()" class="fs-close-btn">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
        <img src="${img.src}" alt="Fullscreen Preview" style="max-width: 95vw; max-height: 95vh; cursor: zoom-in;" 
             onclick="if(this.style.maxWidth==='none'){this.style.maxWidth='95vw';this.style.maxHeight='95vh';this.style.cursor='zoom-in';}else{this.style.maxWidth='none';this.style.maxHeight='none';this.style.cursor='zoom-out';}" />
    `;
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    
    document.body.appendChild(overlay);
};

// View CAD files
function viewCADFile(name, url, container) {
    container.innerHTML = `
        <div class="cad-viewer">
            <div class="cad-icon">
                <i class="fas fa-cube fa-5x"></i>
            </div>
            <h3>${name}</h3>
            <p>SOLIDWORKS/CAD file preview not available</p>
            <a href="${url}" download class="btn-download-large">
                <i class="fas fa-download"></i> Download ${name}
            </a>
            <p class="file-info">
                <i class="fas fa-info-circle"></i>
                Open this file in SOLIDWORKS to view the 3D model
            </p>
        </div>
    `;
}

// View 3D models (GLB/GLTF)
async function view3DModel(url, container) {
    container.innerHTML = `
        <div class="model-3d-viewer">
            <div class="model-canvas" id="model3DCanvas"></div>
            <div class="model-controls">
                <p><i class="fas fa-mouse"></i> Drag to rotate • Scroll to zoom</p>
            </div>
        </div>
    `;
    
    // Note: Full 3D viewer would require Three.js library
    // For now, show placeholder
    container.innerHTML = `
        <div class="cad-viewer">
            <div class="cad-icon">
                <i class="fas fa-cube fa-5x"></i>
            </div>
            <h3>3D Model</h3>
            <p>Interactive 3D viewer requires additional libraries</p>
            <a href="${url}" download class="btn-download-large">
                <i class="fas fa-download"></i> Download 3D Model
            </a>
        </div>
    `;
}

// View code files
async function viewCode(url, language, container) {
    try {
        const response = await fetch(url);
        const code = await response.text();
        
        container.innerHTML = `
            <div class="code-viewer">
                <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
            </div>
        `;
    } catch (error) {
        throw new Error('Failed to load code');
    }
}

// View generic files
function viewGenericFile(name, url, container) {
    container.innerHTML = `
        <div class="generic-file-viewer">
            <div class="file-icon">
                <i class="fas fa-file fa-5x"></i>
            </div>
            <h3>${name}</h3>
            <p>Preview not available for this file type</p>
            <a href="${url}" download class="btn-download-large">
                <i class="fas fa-download"></i> Download File
            </a>
        </div>
    `;
}

// Open SOLIDWORKS CW/HW in full-page window
function openSolidworksWindow(type) {
    const titles = {
        'cw': 'Class Work (CW)',
        'hw': 'Home Work (HW)'
    };
    const folderPaths = {
        'cw': 'CW',
        'hw': 'HW'
    };
    
    const modal = document.createElement('div');
    modal.id = `solidworks${type.toUpperCase()}Modal`;
    modal.className = 'project-modal solidworks-window';
    modal.innerHTML = `
        <div class="modal-content sw-window-content">
            <button class="close-modal" onclick="closeSolidworksWindow('${type}')" title="Close (ESC)">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="sw-window-header">
                <div class="sw-header-info">
                    <i class="fas fa-cube"></i>
                    <h2>SOLIDWORKS ${titles[type]}</h2>
                    <span class="sw-path">SOLIDWORKS-Projects/${folderPaths[type]}</span>
                </div>
                <div class="sw-window-actions">
                    <button class="sw-action-btn" onclick="window.open('https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/${folderPaths[type]}', '_blank')">
                        <i class="fab fa-github"></i> Open in GitHub
                    </button>
                    <button class="sw-action-btn" onclick="uploadToSolidworks('${type}')">
                        <i class="fas fa-upload"></i> Upload Files
                    </button>
                    <button class="sw-action-btn" onclick="refreshSolidworksContent('${type}')" title="Refresh from GitHub">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="sw-window-body" id="sw${type.toUpperCase()}Content">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i> Loading ${titles[type]}...
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeSolidworksWindow(type);
        }
    };
    modal.escHandler = escHandler;
    document.addEventListener('keydown', escHandler);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Load content
    loadSolidworksContent(type);
}

// Close SOLIDWORKS window
function closeSolidworksWindow(type) {
    const modal = document.getElementById(`solidworks${type.toUpperCase()}Modal`);
    if (modal) {
        modal.classList.remove('show');
        if (modal.escHandler) {
            document.removeEventListener('keydown', modal.escHandler);
        }
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Helper: Recursively fetch all files under a directory (GitHub Contents API)
async function fetchAllFilesRecursive(dirUrl, headers, accumulator = []) {
    const res = await fetch(dirUrl, { headers });
    if (!res.ok) throw new Error(`Failed to load ${dirUrl}: ${res.status}`);
    const entries = await res.json();
    for (const entry of entries) {
        if (entry.type === 'file') {
            accumulator.push(entry);
        } else if (entry.type === 'dir') {
            // Recurse into subdirectory
            await fetchAllFilesRecursive(entry.url, headers, accumulator);
        }
    }
    return accumulator;
}

function fileExt(name) {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function isInterestingSwFile(name) {
    const ext = fileExt(name);
    return ['sldprt','sldasm','slddrw','pdf','png','jpg','jpeg','stl','step'].includes(ext);
}

// Load SOLIDWORKS content from GitHub
async function loadSolidworksContent(type) {
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPaths = { 'cw': 'CW', 'hw': 'HW' };
    const path = folderPaths[type];
    
    const contentDiv = document.getElementById(`sw${type.toUpperCase()}Content`);
    
    try {
        const headers = getGitHubHeaders();
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
        
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        
        const items = await response.json();
        
        // Group files by day and subfolders
        const dayGroups = {};
        for (const item of items) {
            if (item.type === 'dir' && /^Day\s*\d+/i.test(item.name)) {
                const dayNum = item.name.replace(/Day\s*/i, '').trim();
                
                // Fetch contents of day folder
                const dayResponse = await fetch(item.url, { headers });
                if (!dayResponse.ok) continue;
                const dayContents = await dayResponse.json();
                
                console.log(`📂 Day ${dayNum} contents:`, dayContents.map(e => `${e.name} (${e.type})`).join(', '));
                
                // Check if there are subfolders (CW1, CW2, etc.)
                const subfolders = dayContents.filter(entry => entry.type === 'dir');
                
                if (subfolders.length > 0) {
                    // Has subfolders - group by subfolder
                    console.log(`✨ Day ${dayNum} has ${subfolders.length} subfolders:`, subfolders.map(s => s.name).join(', '));
                    dayGroups[dayNum] = { type: 'subfolders', data: {} };
                    for (const subfolder of subfolders) {
                        const subFiles = await fetchAllFilesRecursive(subfolder.url, headers);
                        const filtered = subFiles.filter(f => isInterestingSwFile(f.name));
                        if (filtered.length > 0) {
                            console.log(`  🎯 ${subfolder.name}: ${filtered.length} files`);
                            dayGroups[dayNum].data[subfolder.name] = filtered;
                        }
                    }
                } else {
                    // No subfolders - just files
                    console.log(`📄 Day ${dayNum} has no subfolders, loading files directly`);
                    const allFiles = await fetchAllFilesRecursive(item.url, headers);
                    const filtered = allFiles.filter(f => isInterestingSwFile(f.name));
                    if (filtered.length > 0) {
                        console.log(`  📎 Found ${filtered.length} files`);
                        dayGroups[dayNum] = { type: 'files', data: filtered };
                    }
                }
            }
        }
        
        // Color palette for subfolder cards (vibrant and eye-catching)
        const subfolderColors = [
            { bg: 'rgba(255, 107, 107, 0.15)', border: 'rgba(255, 107, 107, 0.5)', accent: '#ff6b6b', icon: '🔴' },
            { bg: 'rgba(78, 205, 196, 0.15)', border: 'rgba(78, 205, 196, 0.5)', accent: '#4ecdc4', icon: '🔵' },
            { bg: 'rgba(255, 195, 113, 0.15)', border: 'rgba(255, 195, 113, 0.5)', accent: '#ffc371', icon: '🟠' },
            { bg: 'rgba(162, 155, 254, 0.15)', border: 'rgba(162, 155, 254, 0.5)', accent: '#a29bfe', icon: '🟣' },
            { bg: 'rgba(253, 121, 168, 0.15)', border: 'rgba(253, 121, 168, 0.5)', accent: '#fd79a8', icon: '🟡' },
            { bg: 'rgba(85, 230, 193, 0.15)', border: 'rgba(85, 230, 193, 0.5)', accent: '#55efc4', icon: '🟢' }
        ];
        
        // Render grouped content
        let html = '<div class="sw-files-container">';
        
        const sortedDays = Object.keys(dayGroups).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            return numA - numB;
        });
        
        for (const dayNum of sortedDays) {
            const dayData = dayGroups[dayNum];
            if (!dayData) continue;
            
            // Count total files
            let totalFiles = 0;
            if (dayData.type === 'subfolders') {
                Object.values(dayData.data).forEach(files => totalFiles += files.length);
            } else {
                totalFiles = dayData.data.length;
            }
            
            html += `
                <div class="sw-day-section-compact">
                    <h4 class="sw-day-title-compact">
                        📅 Day ${dayNum} <span style="color:#ff6666; font-size:0.8rem;">(${totalFiles} files${dayData.type === 'subfolders' ? ', ' + Object.keys(dayData.data).length + ' sections' : ''})</span>
                    </h4>
            `;
            
            if (dayData.type === 'subfolders') {
                // Render subfolders as separate colorful cards
                console.log(`🎨 Rendering Day ${dayNum} with colorful subfolder cards`);
                html += `<div class="sw-subfolder-grid">`;
                
                const subfolderNames = Object.keys(dayData.data).sort();
                console.log(`  📋 Subfolders to render:`, subfolderNames);
                subfolderNames.forEach((subfolderName, index) => {
                    const files = dayData.data[subfolderName];
                    const color = subfolderColors[index % subfolderColors.length];
                    
                    html += `
                        <div class="sw-subfolder-card" style="background: ${color.bg}; border-color: ${color.border};">
                            <div class="sw-subfolder-header" style="border-bottom-color: ${color.border};">
                                <span class="subfolder-icon">${color.icon}</span>
                                <h5 class="subfolder-title" style="color: ${color.accent};">${subfolderName}</h5>
                                <span class="subfolder-count" style="background: ${color.border}; color: ${color.accent};">
                                    ${files.length} file${files.length > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div class="sw-subfolder-files">
                    `;
                    
                    files.forEach(file => {
                        const downloadUrl = file.download_url;
                        const ext = fileExt(file.name).toUpperCase();
                        const fileName = file.name;
                        const baseName = fileName.replace(/\.[^/.]+$/, '');
                        
                        html += `
                            <div class="sw-subfolder-file-item">
                                <div class="file-item-info">
                                    <span class="file-ext-badge-small" style="background: ${color.border}; color: ${color.accent};">${ext}</span>
                                    <span class="file-item-name" title="${fileName}">${baseName}</span>
                                </div>
                                <div class="file-item-actions">
                                    <a href="${downloadUrl}" download="${fileName}" class="file-item-btn" title="Download" style="color: ${color.accent};">
                                        <i class="fas fa-download"></i>
                                    </a>
                                    <a href="${file.html_url}" target="_blank" class="file-item-btn" title="View on GitHub" style="color: ${color.accent};">
                                        <i class="fab fa-github"></i>
                                    </a>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                });
                
                html += `</div>`;
            } else {
                // Render files directly (no subfolders)
                html += `<div class="sw-file-grid-compact">`;
                
                dayData.data.forEach(file => {
                    const downloadUrl = file.download_url;
                    const ext = fileExt(file.name).toUpperCase();
                    const fileName = file.name;
                    const baseName = fileName.replace(/\.[^/.]+$/, '');
                    
                    html += `
                        <div class="sw-file-card-compact">
                            <div class="sw-file-header-compact">
                                <span class="file-ext-badge">${ext}</span>
                                <span class="file-name-compact" title="${fileName}">${baseName}</span>
                            </div>
                            <div class="sw-file-actions-compact">
                                <a href="${downloadUrl}" download="${fileName}" class="sw-file-btn-compact" title="Download">
                                    <i class="fas fa-download"></i>
                                </a>
                                <a href="${file.html_url}" target="_blank" class="sw-file-btn-compact" title="View on GitHub">
                                    <i class="fab fa-github"></i>
                                </a>
                            </div>
                        </div>
                    `;
                });
                
                html += `</div>`;
            }
            
            html += `</div>`;
        }
        
        html += '</div>';
        
        if (sortedDays.length === 0) {
            html = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No ${type.toUpperCase()} files found</p>
                </div>
            `;
        }
        
        contentDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading SOLIDWORKS content:', error);
        contentDiv.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load content</p>
                <button class="sw-action-btn" onclick="loadSolidworksContent('${type}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Refresh SOLIDWORKS content
async function refreshSolidworksContent(type) {
    const contentDiv = document.getElementById(`sw${type.toUpperCase()}Content`);
    contentDiv.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> Refreshing...
        </div>
    `;
    
    // Clear cache and reload
    await loadSolidworksContent(type);
    
    // Show success toast
    showToast('Refreshed', `${type.toUpperCase()} content updated from GitHub`);
}

// Upload to SOLIDWORKS - Full Upload System
async function uploadToSolidworks(type) {
    const token = getGitHubToken();
    if (!token) {
        showUploadDialog(type, 'needToken');
        return;
    }
    
    showUploadDialog(type, 'upload');
}

// Show upload dialog
function showUploadDialog(type, mode = 'upload') {
    const titles = {
        'cw': 'Class Work (CW)',
        'hw': 'Home Work (HW)'
    };
    
    const modeText = mode === 'needToken' ? 'GitHub Token Required' : `Upload to ${titles[type]}`;
    
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay';
    dialog.innerHTML = `
        <div class="upload-dialog">
            <div class="upload-header">
                <h3><i class="fas fa-upload"></i> ${modeText}</h3>
                <button class="upload-close" onclick="closeUploadDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            ${mode === 'needToken' ? `
                <div class="upload-body">
                    <div class="token-needed">
                        <i class="fas fa-key fa-3x"></i>
                        <h4>GitHub Personal Access Token Required</h4>
                        <p>To upload files, you need a GitHub token with 'repo' permission.</p>
                        
                        <div class="token-steps">
                            <h5>How to create a token:</h5>
                            <ol>
                                <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Tokens</a></li>
                                <li>Click "Generate new token (classic)"</li>
                                <li>Give it a name (e.g., "SOLIDWORKS Upload")</li>
                                <li>Select scope: <strong>repo</strong> (Full control of private repositories)</li>
                                <li>Click "Generate token"</li>
                                <li>Copy the token and paste it below</li>
                            </ol>
                        </div>
                        
                        <div class="token-input-group">
                            <input type="password" id="uploadTokenInput" placeholder="Paste your GitHub token here" />
                            <button class="btn-save-token" onclick="saveUploadToken('${type}')">
                                <i class="fas fa-save"></i> Save & Continue
                            </button>
                        </div>
                    </div>
                </div>
            ` : `
                <div class="upload-body">
                    <div class="upload-options">
                        <button class="upload-option-btn" onclick="selectUploadMode('${type}', 'new')">
                            <i class="fas fa-plus-circle"></i>
                            <span>Upload New Files</span>
                            <small>Add new SOLIDWORKS files to a day folder</small>
                        </button>
                        
                        <button class="upload-option-btn" onclick="selectUploadMode('${type}', 'question')">
                            <i class="fas fa-question-circle"></i>
                            <span>Upload Question</span>
                            <small>Add question PDF or image for a day</small>
                        </button>
                        
                        <button class="upload-option-btn" onclick="selectUploadMode('${type}', 'update')">
                            <i class="fas fa-edit"></i>
                            <span>Update Existing File</span>
                            <small>Replace or modify an existing file</small>
                        </button>
                        
                        <button class="upload-option-btn" onclick="selectUploadMode('${type}', 'delete')">
                            <i class="fas fa-trash-alt"></i>
                            <span>Delete File</span>
                            <small>Remove a file from repository</small>
                        </button>
                    </div>
                </div>
            `}
        </div>
    `;
    
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
}

// Close upload dialog
function closeUploadDialog() {
    const dialog = document.getElementById('uploadDialog');
    if (dialog) {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 300);
    }
}

// Save upload token
function saveUploadToken(type) {
    const input = document.getElementById('uploadTokenInput');
    const token = input.value.trim();
    
    if (!token) {
        alert('Please enter a valid GitHub token');
        return;
    }
    
    setGitHubToken(token);
    closeUploadDialog();
    
    setTimeout(() => {
        showUploadDialog(type, 'upload');
    }, 400);
}

// Select upload mode
function selectUploadMode(type, mode) {
    closeUploadDialog();
    
    setTimeout(() => {
        if (mode === 'new') {
            showFileUploadForm(type, 'new');
        } else if (mode === 'question') {
            showQuestionUploadForm(type);
        } else if (mode === 'update') {
            showFileUpdateForm(type);
        } else if (mode === 'delete') {
            showFileDeleteForm(type);
        }
    }, 400);
}

// Show file upload form
function showFileUploadForm(type, mode = 'new') {
    const titles = { 'cw': 'Class Work', 'hw': 'Home Work' };
    
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay';
    dialog.innerHTML = `
        <div class="upload-dialog upload-dialog-large">
            <div class="upload-header">
                <h3><i class="fas fa-upload"></i> Upload Files to ${titles[type]}</h3>
                <button class="upload-close" onclick="closeUploadDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="upload-body">
                <div class="upload-form">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Select Day:</label>
                        <select id="uploadDaySelect" class="form-control">
                            <option value="">-- Choose Day --</option>
                            ${Array.from({length: 30}, (_, i) => `<option value="Day ${String(i+1).padStart(2, '0')}">Day ${String(i+1).padStart(2, '0')}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-file"></i> Select Files:</label>
                        <input type="file" id="uploadFileInput" class="form-control" multiple accept=".SLDPRT,.SLDASM,.SLDDRW,.sldprt,.sldasm,.slddrw" />
                        <small>Accepted: .SLDPRT, .SLDASM, .SLDDRW</small>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-comment"></i> Commit Message (optional):</label>
                        <input type="text" id="uploadCommitMsg" class="form-control" placeholder="e.g., Added Day 05 parts" />
                    </div>
                    
                    <div class="upload-preview" id="uploadPreview"></div>
                    
                    <div class="upload-actions">
                        <button class="btn-cancel" onclick="closeUploadDialog()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn-upload" onclick="performFileUpload('${type}')">
                            <i class="fas fa-cloud-upload-alt"></i> Upload Files
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
    
    // File preview
    document.getElementById('uploadFileInput').addEventListener('change', (e) => {
        const files = e.target.files;
        const preview = document.getElementById('uploadPreview');
        
        if (files.length === 0) {
            preview.innerHTML = '';
            return;
        }
        
        let html = '<div class="preview-title">Selected Files:</div><ul class="file-preview-list">';
        for (let file of files) {
            const size = (file.size / 1024).toFixed(2);
            html += `<li><i class="fas fa-cube"></i> ${file.name} <span class="file-size">(${size} KB)</span></li>`;
        }
        html += '</ul>';
        preview.innerHTML = html;
    });
}

// Show question upload form
function showQuestionUploadForm(type) {
    const titles = { 'cw': 'Class Work', 'hw': 'Home Work' };
    const typeUpper = type.toUpperCase();
    
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay';
    dialog.innerHTML = `
        <div class="upload-dialog upload-dialog-large">
            <div class="upload-header">
                <h3><i class="fas fa-question-circle"></i> Upload Question for ${titles[type]}</h3>
                <button class="upload-close" onclick="closeUploadDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="upload-body">
                <div class="upload-form">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Select Day:</label>
                        <select id="questionDaySelect" class="form-control" onchange="updateQuestionFileName('${type}')">
                            <option value="">-- Choose Day --</option>
                            ${Array.from({length: 30}, (_, i) => `<option value="Day ${String(i+1).padStart(2, '0')}">Day ${String(i+1).padStart(2, '0')}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> ${typeUpper} Number:</label>
                        <select id="questionWorkNumber" class="form-control" onchange="updateQuestionFileName('${type}')">
                            <option value="">-- Choose ${typeUpper} Number --</option>
                            ${Array.from({length: 10}, (_, i) => `<option value="${typeUpper}${i+1}">${typeUpper}${i+1}</option>`).join('')}
                        </select>
                        <small>Select which ${typeUpper} this question is for (creates subfolder if needed)</small>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-file-pdf"></i> Select Question File:</label>
                        <input type="file" id="questionFileInput" class="form-control" accept=".pdf,.png,.jpg,.jpeg" onchange="updateQuestionFileName('${type}')" />
                        <small>Accepted: PDF, PNG, JPG (Question images/PDFs)</small>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> File Name:</label>
                        <input type="text" id="questionFileName" class="form-control" placeholder="Auto-generated based on Day and ${typeUpper}" value="" />
                        <small>Auto-generated: Day_XX_${typeUpper}X_Question.ext (you can edit if needed)</small>
                    </div>
                    
                    <div class="upload-actions">
                        <button class="btn-cancel" onclick="closeUploadDialog()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn-upload" onclick="performQuestionUpload('${type}')">
                            <i class="fas fa-cloud-upload-alt"></i> Upload Question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
}

// Auto-generate question file name based on Day, CW/HW number, and file extension
function updateQuestionFileName(type) {
    const daySelect = document.getElementById('questionDaySelect');
    const workNumberSelect = document.getElementById('questionWorkNumber');
    const fileInput = document.getElementById('questionFileInput');
    const fileNameInput = document.getElementById('questionFileName');
    
    const day = daySelect.value;
    const workNumber = workNumberSelect.value;
    const file = fileInput.files[0];
    
    if (day && workNumber) {
        // Get file extension from uploaded file or default to .pdf
        let extension = '.pdf';
        if (file) {
            const fileName = file.name;
            const lastDot = fileName.lastIndexOf('.');
            if (lastDot > -1) {
                extension = fileName.substring(lastDot);
            }
        }
        
        // Format: Day_01_CW1_Question.pdf
        const dayFormatted = day.replace(' ', '_');
        const generatedName = `${dayFormatted}_${workNumber}_Question${extension}`;
        fileNameInput.value = generatedName;
    }
}

// Make function globally accessible
window.updateQuestionFileName = updateQuestionFileName;

// Fetch statistics for CW/HW folders (day count, file count, last update)
async function fetchSolidworksStatistics(type) {
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const headers = getGitHubHeaders();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, { headers });
        if (!response.ok) return null;
        
        const items = await response.json();
        const days = items.filter(item => item.type === 'dir' && /^Day\s*\d+/i.test(item.name));
        
        let totalFiles = 0;
        let latestDate = null;
        
        // Fetch commits to get last update date
        const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?path=${folderPath}&per_page=1`, { headers });
        if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            if (commits.length > 0) {
                latestDate = new Date(commits[0].commit.author.date);
            }
        }
        
        // Count total files across all days
        for (const day of days) {
            const dayResponse = await fetch(day.url, { headers });
            if (dayResponse.ok) {
                const dayFiles = await dayResponse.json();
                totalFiles += dayFiles.filter(f => f.type === 'file' && isInterestingSwFile(f.name)).length;
            }
        }
        
        return {
            dayCount: days.length,
            fileCount: totalFiles,
            lastUpdate: latestDate ? latestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'
        };
        
    } catch (error) {
        console.error(`Error fetching ${type} statistics:`, error);
        return null;
    }
}

// Update mode buttons with statistics
async function updateModeButtonStats() {
    const cwBtn = document.querySelector('.sw-mode-btn[data-target="cw"]');
    const hwBtn = document.querySelector('.sw-mode-btn[data-target="hw"]');
    
    if (cwBtn) {
        const cwStats = await fetchSolidworksStatistics('cw');
        if (cwStats) {
            cwBtn.innerHTML = `Class Work <span class="sw-stats-badge">${cwStats.dayCount} days • ${cwStats.fileCount} files</span>`;
            cwBtn.title = `Last updated: ${cwStats.lastUpdate}`;
        }
    }
    
    if (hwBtn) {
        const hwStats = await fetchSolidworksStatistics('hw');
        if (hwStats) {
            hwBtn.innerHTML = `Home Work <span class="sw-stats-badge">${hwStats.dayCount} days • ${hwStats.fileCount} files</span>`;
            hwBtn.title = `Last updated: ${hwStats.lastUpdate}`;
        }
    }
}

// Perform file upload
async function performFileUpload(type) {
    const daySelect = document.getElementById('uploadDaySelect');
    const fileInput = document.getElementById('uploadFileInput');
    const commitMsg = document.getElementById('uploadCommitMsg');
    
    const day = daySelect.value;
    const files = fileInput.files;
    const message = commitMsg.value.trim() || `Upload files to ${type.toUpperCase()} ${day}`;
    
    if (!day) {
        alert('Please select a day');
        return;
    }
    
    if (files.length === 0) {
        alert('Please select at least one file');
        return;
    }
    
    const token = getGitHubToken();
    if (!token) {
        alert('GitHub token not found. Please set it first.');
        return;
    }
    
    // Show progress
    showUploadProgress('Uploading files...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        
        let successCount = 0;
        let failCount = 0;
        
        for (let file of files) {
            try {
                const path = `${folderPath}/${day}/${file.name}`;
                const content = await readFileAsBase64(file);
                
                // Check if file exists
                const checkUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
                const checkResponse = await fetch(checkUrl, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                let sha = null;
                if (checkResponse.ok) {
                    const existingFile = await checkResponse.json();
                    sha = existingFile.sha;
                }
                
                // Upload file
                const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
                const uploadData = {
                    message: message,
                    content: content,
                    branch: 'main'
                };
                
                if (sha) {
                    uploadData.sha = sha; // Update existing file
                }
                
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(uploadData)
                });
                
                if (uploadResponse.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Failed to upload ${file.name}:`, await uploadResponse.text());
                }
            } catch (error) {
                failCount++;
                console.error(`Error uploading ${file.name}:`, error);
            }
        }
        
        closeUploadDialog();
        
        if (successCount > 0) {
            showToast('Success', `${successCount} file(s) uploaded successfully!`);
            
            // Refresh the SOLIDWORKS window
            setTimeout(() => {
                refreshSolidworksContent(type);
            }, 1500);
        }
        
        if (failCount > 0) {
            alert(`${failCount} file(s) failed to upload. Check console for details.`);
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
        closeUploadDialog();
    }
}

// Perform question upload
async function performQuestionUpload(type) {
    const daySelect = document.getElementById('questionDaySelect');
    const workNumberSelect = document.getElementById('questionWorkNumber');
    const fileInput = document.getElementById('questionFileInput');
    const fileNameInput = document.getElementById('questionFileName');
    
    const day = daySelect.value;
    const workNumber = workNumberSelect.value;
    const file = fileInput.files[0];
    const fileName = fileNameInput.value.trim() || 'Question.pdf';
    
    if (!day) {
        alert('Please select a day');
        return;
    }
    
    if (!workNumber) {
        alert(`Please select ${type.toUpperCase()} number`);
        return;
    }
    
    if (!file) {
        alert('Please select a question file');
        return;
    }
    
    const token = getGitHubToken();
    if (!token) {
        alert('GitHub token not found');
        return;
    }
    
    showUploadProgress('Uploading question...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        // Upload to subfolder: CW/Day 01/CW1/Question.pdf
        const path = `${folderPath}/${day}/${workNumber}/${fileName}`;
        const content = await readFileAsBase64(file);
        
        // Check if exists
        const checkUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const checkResponse = await fetch(checkUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = null;
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }
        
        // Upload
        const uploadData = {
            message: `Upload question for ${type.toUpperCase()} ${day}/${workNumber}`,
            content: content,
            branch: 'main'
        };
        
        if (sha) {
            uploadData.sha = sha;
        }
        
        const uploadResponse = await fetch(checkUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        if (uploadResponse.ok) {
            closeUploadDialog();
            showToast('Success', `Question uploaded to ${day}/${workNumber}!`);
            setTimeout(() => refreshSolidworksContent(type), 1500);
        } else {
            throw new Error('Upload failed: ' + await uploadResponse.text());
        }
        
    } catch (error) {
        console.error('Question upload error:', error);
        alert('Failed to upload question: ' + error.message);
        closeUploadDialog();
    }
}

// Show file update form
async function showFileUpdateForm(type) {
    showUploadProgress('Loading files...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        const token = getGitHubToken();
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const items = await response.json();
        const days = items.filter(item => item.type === 'dir' && item.name.startsWith('Day'));
        
        closeUploadDialog();
        
        const titles = { 'cw': 'Class Work', 'hw': 'Home Work' };
        const dialog = document.createElement('div');
        dialog.id = 'uploadDialog';
        dialog.className = 'upload-dialog-overlay';
        dialog.innerHTML = `
            <div class="upload-dialog upload-dialog-large">
                <div class="upload-header">
                    <h3><i class="fas fa-edit"></i> Update File in ${titles[type]}</h3>
                    <button class="upload-close" onclick="closeUploadDialog()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="upload-body">
                    <div class="upload-form">
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Select Day:</label>
                            <select id="updateDaySelect" class="form-control" onchange="loadDayFilesForUpdate('${type}')">
                                <option value="">-- Choose Day --</option>
                                ${days.map(day => `<option value="${day.name}">${day.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group" id="updateFileSelectGroup" style="display:none;">
                            <label><i class="fas fa-file"></i> Select File to Update:</label>
                            <select id="updateFileSelect" class="form-control">
                                <option value="">-- Choose File --</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="updateNewFileGroup" style="display:none;">
                            <label><i class="fas fa-upload"></i> Upload New Version:</label>
                            <input type="file" id="updateFileInput" class="form-control" />
                        </div>
                        
                        <div class="upload-actions" id="updateActions" style="display:none;">
                            <button class="btn-cancel" onclick="closeUploadDialog()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button class="btn-upload" onclick="performFileUpdate('${type}')">
                                <i class="fas fa-sync-alt"></i> Update File
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        setTimeout(() => dialog.classList.add('show'), 10);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load files: ' + error.message);
        closeUploadDialog();
    }
}

// Load day files for update
async function loadDayFilesForUpdate(type) {
    const daySelect = document.getElementById('updateDaySelect');
    const fileSelect = document.getElementById('updateFileSelect');
    const day = daySelect.value;
    
    if (!day) {
        document.getElementById('updateFileSelectGroup').style.display = 'none';
        document.getElementById('updateNewFileGroup').style.display = 'none';
        document.getElementById('updateActions').style.display = 'none';
        return;
    }
    
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const token = getGitHubToken();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/${day}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        
        fileSelect.innerHTML = '<option value="">-- Choose File --</option>';
        files.forEach(file => {
            if (file.type === 'file') {
                fileSelect.innerHTML += `<option value="${file.name}" data-sha="${file.sha}">${file.name}</option>`;
            }
        });
        
        document.getElementById('updateFileSelectGroup').style.display = 'block';
        
        fileSelect.onchange = () => {
            if (fileSelect.value) {
                document.getElementById('updateNewFileGroup').style.display = 'block';
                document.getElementById('updateActions').style.display = 'flex';
            } else {
                document.getElementById('updateNewFileGroup').style.display = 'none';
                document.getElementById('updateActions').style.display = 'none';
            }
        };
        
    } catch (error) {
        console.error('Error loading files:', error);
        alert('Failed to load files');
    }
}

// Perform file update
async function performFileUpdate(type) {
    const daySelect = document.getElementById('updateDaySelect');
    const fileSelect = document.getElementById('updateFileSelect');
    const fileInput = document.getElementById('updateFileInput');
    
    const day = daySelect.value;
    const oldFileName = fileSelect.value;
    const newFile = fileInput.files[0];
    
    if (!day || !oldFileName || !newFile) {
        alert('Please fill all fields');
        return;
    }
    
    const selectedOption = fileSelect.options[fileSelect.selectedIndex];
    const sha = selectedOption.getAttribute('data-sha');
    const token = getGitHubToken();
    
    showUploadProgress('Updating file...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        const path = `${folderPath}/${day}/${oldFileName}`;
        const content = await readFileAsBase64(newFile);
        
        const uploadData = {
            message: `Update ${oldFileName} in ${type.toUpperCase()} ${day}`,
            content: content,
            sha: sha,
            branch: 'main'
        };
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        if (response.ok) {
            closeUploadDialog();
            showToast('Success', 'File updated successfully!');
            setTimeout(() => refreshSolidworksContent(type), 1500);
        } else {
            throw new Error('Update failed: ' + await response.text());
        }
        
    } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update file: ' + error.message);
        closeUploadDialog();
    }
}

// Show file delete form
async function showFileDeleteForm(type) {
    showUploadProgress('Loading files...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        const token = getGitHubToken();
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const items = await response.json();
        const days = items.filter(item => item.type === 'dir' && item.name.startsWith('Day'));
        
        closeUploadDialog();
        
        const titles = { 'cw': 'Class Work', 'hw': 'Home Work' };
        const dialog = document.createElement('div');
        dialog.id = 'uploadDialog';
        dialog.className = 'upload-dialog-overlay';
        dialog.innerHTML = `
            <div class="upload-dialog upload-dialog-large">
                <div class="upload-header">
                    <h3><i class="fas fa-trash-alt"></i> Delete File from ${titles[type]}</h3>
                    <button class="upload-close" onclick="closeUploadDialog()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="upload-body">
                    <div class="upload-form">
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Select Day:</label>
                            <select id="deleteDaySelect" class="form-control" onchange="loadDayFilesForDelete('${type}')">
                                <option value="">-- Choose Day --</option>
                                ${days.map(day => `<option value="${day.name}">${day.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group" id="deleteFileSelectGroup" style="display:none;">
                            <label><i class="fas fa-file"></i> Select File to Delete:</label>
                            <select id="deleteFileSelect" class="form-control">
                                <option value="">-- Choose File --</option>
                            </select>
                        </div>
                        
                        <div class="delete-warning" id="deleteWarning" style="display:none;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p><strong>Warning:</strong> This action cannot be undone! The file will be permanently deleted from GitHub.</p>
                        </div>
                        
                        <div class="upload-actions" id="deleteActions" style="display:none;">
                            <button class="btn-cancel" onclick="closeUploadDialog()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button class="btn-delete" onclick="performFileDelete('${type}')">
                                <i class="fas fa-trash"></i> Delete File
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        setTimeout(() => dialog.classList.add('show'), 10);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load files: ' + error.message);
        closeUploadDialog();
    }
}

// Load day files for delete
async function loadDayFilesForDelete(type) {
    const daySelect = document.getElementById('deleteDaySelect');
    const fileSelect = document.getElementById('deleteFileSelect');
    const day = daySelect.value;
    
    if (!day) {
        document.getElementById('deleteFileSelectGroup').style.display = 'none';
        document.getElementById('deleteWarning').style.display = 'none';
        document.getElementById('deleteActions').style.display = 'none';
        return;
    }
    
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const token = getGitHubToken();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/${day}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        
        fileSelect.innerHTML = '<option value="">-- Choose File --</option>';
        files.forEach(file => {
            if (file.type === 'file') {
                fileSelect.innerHTML += `<option value="${file.name}" data-sha="${file.sha}">${file.name}</option>`;
            }
        });
        
        document.getElementById('deleteFileSelectGroup').style.display = 'block';
        
        fileSelect.onchange = () => {
            if (fileSelect.value) {
                document.getElementById('deleteWarning').style.display = 'block';
                document.getElementById('deleteActions').style.display = 'flex';
            } else {
                document.getElementById('deleteWarning').style.display = 'none';
                document.getElementById('deleteActions').style.display = 'none';
            }
        };
        
    } catch (error) {
        console.error('Error loading files:', error);
        alert('Failed to load files');
    }
}

// Perform file delete
async function performFileDelete(type) {
    const daySelect = document.getElementById('deleteDaySelect');
    const fileSelect = document.getElementById('deleteFileSelect');
    
    const day = daySelect.value;
    const fileName = fileSelect.value;
    
    if (!day || !fileName) {
        alert('Please select a file to delete');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone!`)) {
        return;
    }
    
    const selectedOption = fileSelect.options[fileSelect.selectedIndex];
    const sha = selectedOption.getAttribute('data-sha');
    const token = getGitHubToken();
    
    showUploadProgress('Deleting file...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        const path = `${folderPath}/${day}/${fileName}`;
        
        const deleteData = {
            message: `Delete ${fileName} from ${type.toUpperCase()} ${day}`,
            sha: sha,
            branch: 'main'
        };
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteData)
        });
        
        if (response.ok) {
            closeUploadDialog();
            showToast('Success', 'File deleted successfully!');
            setTimeout(() => refreshSolidworksContent(type), 1500);
        } else {
            throw new Error('Delete failed: ' + await response.text());
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete file: ' + error.message);
        closeUploadDialog();
    }
}

// Show upload progress
function showUploadProgress(message) {
    const existing = document.getElementById('uploadDialog');
    if (existing) existing.remove();
    
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay show';
    dialog.innerHTML = `
        <div class="upload-dialog">
            <div class="upload-body">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin fa-3x"></i>
                    <p style="margin-top: 1rem; font-size: 1.1rem;">${message}</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// Show toast notification
function showToast(title, message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                  type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
                  type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' : 
                  '<i class="fas fa-info-circle"></i>'}
            </div>
            <div class="toast-body">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Make toast globally accessible
window.showToast = showToast;

// Read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Make upload functions globally accessible
window.closeUploadDialog = closeUploadDialog;
window.saveUploadToken = saveUploadToken;
window.selectUploadMode = selectUploadMode;
window.performFileUpload = performFileUpload;
window.performQuestionUpload = performQuestionUpload;
window.loadDayFilesForUpdate = loadDayFilesForUpdate;
window.performFileUpdate = performFileUpdate;
window.loadDayFilesForDelete = loadDayFilesForDelete;
window.performFileDelete = performFileDelete;

// Make SOLIDWORKS functions globally accessible
window.openGitHubBrowser = openGitHubBrowser;
window.closeSolidworksWindow = closeSolidworksWindow;
window.refreshSolidworksContent = refreshSolidworksContent;
window.uploadToSolidworks = uploadToSolidworks;

// Scroll to central upload card (Auto-Update System)
window.scrollToUploadCard = function() {
    // Prefer the dedicated Auto-Update card by id
    let uploadCard = document.getElementById('auto-update-card');
    if (!uploadCard) {
        // Fallback: find by style signature
        uploadCard = document.querySelector('.project-card[style*="rgba(102, 126, 234"]');
    }
    
    if (uploadCard) {
        uploadCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight animation
        uploadCard.style.transition = 'transform 0.3s, box-shadow 0.3s';
        uploadCard.style.transform = 'scale(1.02)';
        uploadCard.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.5)';
        
        setTimeout(() => {
            uploadCard.style.transform = 'scale(1)';
            uploadCard.style.boxShadow = '';
        }, 1000);
        
        if (typeof showToast === 'function') {
            showToast('Navigation', 'Scrolled to Auto-Update System', 'info');
        }
    } else {
        // Fallback: scroll to the section outside grid
        const uploadSection = document.querySelector('.github-section');
        if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (typeof showToast === 'function') {
                showToast('Navigation', 'Scrolled to Upload Section', 'info');
            }
        }
    }
};

// Debug helper: Test colorful cards with mock data
window.testColorfulCards = function() {
    console.log('🧪 Testing colorful subfolder cards...');
    
    const mockData = {
        type: 'subfolders',
        data: {
            'CW1': [
                { name: 'Part1.SLDPRT', download_url: '#', html_url: '#' },
                { name: 'Assembly.SLDASM', download_url: '#', html_url: '#' }
            ],
            'CW2': [
                { name: 'Drawing.SLDDRW', download_url: '#', html_url: '#' },
                { name: 'Question.pdf', download_url: '#', html_url: '#' }
            ],
            'CW3': [
                { name: 'Model.SLDPRT', download_url: '#', html_url: '#' }
            ]
        }
    };
    
    // Temporarily replace dayGroups with mock data
    const testDiv = document.createElement('div');
    testDiv.style.cssText = 'position:fixed; top:100px; left:50%; transform:translateX(-50%); z-index:9999; background:rgba(0,0,0,0.95); padding:2rem; border-radius:15px; max-width:90vw; max-height:80vh; overflow:auto;';
    testDiv.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:2px solid rgba(255,0,0,0.3); padding-bottom:0.5rem;">
            <h3 style="color:#ff6666; margin:0;">🎨 Colorful Cards Preview</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background:rgba(255,0,0,0.3); color:#fff; border:none; padding:0.5rem 1rem; border-radius:8px; cursor:pointer;">Close</button>
        </div>
        <div class="sw-day-section-compact">
            <h4 class="sw-day-title-compact">📅 Test Day <span style="color:#ff6666; font-size:0.8rem;">(5 files, 3 sections)</span></h4>
            ${renderSubfolderCards(mockData)}
        </div>
    `;
    document.body.appendChild(testDiv);
};

function renderSubfolderCards(dayData) {
    const subfolderColors = [
        { bg: 'rgba(255, 107, 107, 0.15)', border: 'rgba(255, 107, 107, 0.5)', accent: '#ff6b6b', icon: '🔴' },
        { bg: 'rgba(78, 205, 196, 0.15)', border: 'rgba(78, 205, 196, 0.5)', accent: '#4ecdc4', icon: '🔵' },
        { bg: 'rgba(255, 195, 113, 0.15)', border: 'rgba(255, 195, 113, 0.5)', accent: '#ffc371', icon: '🟠' },
        { bg: 'rgba(162, 155, 254, 0.15)', border: 'rgba(162, 155, 254, 0.5)', accent: '#a29bfe', icon: '🟣' },
        { bg: 'rgba(253, 121, 168, 0.15)', border: 'rgba(253, 121, 168, 0.5)', accent: '#fd79a8', icon: '🟡' },
        { bg: 'rgba(85, 230, 193, 0.15)', border: 'rgba(85, 230, 193, 0.5)', accent: '#55efc4', icon: '🟢' }
    ];
    
    let html = '<div class="sw-subfolder-grid">';
    const subfolderNames = Object.keys(dayData.data).sort();
    
    subfolderNames.forEach((subfolderName, index) => {
        const files = dayData.data[subfolderName];
        const color = subfolderColors[index % subfolderColors.length];
        
        html += `
            <div class="sw-subfolder-card" style="background: ${color.bg}; border-color: ${color.border};">
                <div class="sw-subfolder-header" style="border-bottom-color: ${color.border};">
                    <span class="subfolder-icon">${color.icon}</span>
                    <h5 class="subfolder-title" style="color: ${color.accent};">${subfolderName}</h5>
                    <span class="subfolder-count" style="background: ${color.border}; color: ${color.accent};">
                        ${files.length} file${files.length > 1 ? 's' : ''}
                    </span>
                </div>
                <div class="sw-subfolder-files">
        `;
        
        files.forEach(file => {
            const ext = fileExt(file.name).toUpperCase();
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            
            html += `
                <div class="sw-subfolder-file-item">
                    <div class="file-item-info">
                        <span class="file-ext-badge-small" style="background: ${color.border}; color: ${color.accent};">${ext}</span>
                        <span class="file-item-name" title="${file.name}">${baseName}</span>
                    </div>
                    <div class="file-item-actions">
                        <a href="${file.download_url}" download="${file.name}" class="file-item-btn" title="Download" style="color: ${color.accent};">
                            <i class="fas fa-download"></i>
                        </a>
                        <a href="${file.html_url}" target="_blank" class="file-item-btn" title="View on GitHub" style="color: ${color.accent};">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}
window.renderSubfolderCards = renderSubfolderCards;

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal interactivity for project details
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded');
    // Initialize auto-updating GitHub repo cards (Electronics, Arduino, Portfolio)
    try { initAutoRepoCards(); } catch(e) { console.warn('Auto repo cards init failed', e); }
    
    // Embedded SOLIDWORKS Beginner Projects navigation
    (function initSolidworksEmbedded(){
        console.log('🔧 Initializing SOLIDWORKS embedded card...');
        const card = document.getElementById('solidworks-beginner-card');
        if(!card) {
            console.warn('⚠️ SOLIDWORKS card not found!');
            return;
        }
        console.log('✅ SOLIDWORKS card found:', card);
        
        const views = card.querySelectorAll('.sw-view');
        const tiles = card.querySelectorAll('.sw-tile');
        const backButtons = card.querySelectorAll('.sw-back');
        const modeBtns = card.querySelectorAll('.sw-mode-btn');
        
        console.log('📊 Card elements:', {
            views: views.length,
            tiles: tiles.length,
            backButtons: backButtons.length,
            modeBtns: modeBtns.length
        });
        
        let current = 'root';

        // Inject day-specific projects into CW and HW sections
        function injectDayProjects() {
            const solidworksProject = sampleProjects.find(p => p.title === "SOLIDWORKS Beginner Projects");
            if (!solidworksProject || !solidworksProject.dayProjects) {
                // If no static data, load from GitHub dynamically
                loadDynamicCWHWFiles();
                return;
            }

            const cwFilesWrap = document.getElementById('cw-files-wrap');
            const hwFilesWrap = document.getElementById('hw-files-wrap');
            
            // Load dynamically from GitHub instead of static data
            loadDynamicCWHWFiles();
            
            /* OLD STATIC CODE - Now using dynamic GitHub loading
            function createProjectItem(file, type) {
                const spotTestBadge = file.isSpotTest ? '<span class="spot-test-badge">📝 Spot Test</span>' : '';
                
                // Handle multiple downloads for projects like Day 5 HW 2
                let downloadButtons = '';
                if (file.downloads && Array.isArray(file.downloads)) {
                    downloadButtons = file.downloads.map(dl => `
                        <a href="${dl.url}" target="_blank" class="sw-action-btn sw-btn-download" title="Download ${dl.type}">
                            <i class="fas fa-download"></i> ${dl.type}
                        </a>
                    `).join('');
                } else if (file.download) {
                    downloadButtons = `
                        <a href="${file.download}" target="_blank" class="sw-action-btn sw-btn-download" title="Download SLDPRT">
                            <i class="fas fa-download"></i> Download
                        </a>
                    `;
                }
                
                const actionButtons = `
                    <div class="sw-file-actions">
                        <a href="${file.page}" target="_blank" class="sw-action-btn sw-btn-page" title="View Details">
                            <i class="fas fa-info-circle"></i> Details
                        </a>
                        ${downloadButtons}
                        ${file.preview ? `<a href="${file.preview}" target="_blank" class="sw-action-btn sw-btn-preview" title="View Preview">
                            <i class="fas fa-eye"></i> Preview
                        </a>` : ''}
                        ${file.preview2 ? `<a href="${file.preview2}" target="_blank" class="sw-action-btn sw-btn-preview" title="View Preview 2">
                            <i class="fas fa-eye"></i> Preview 2
                        </a>` : ''}
                        ${file.model3d ? `<button class="sw-action-btn sw-btn-3d" onclick="open3DViewer('${file.model3d}')" title="View 3D Model">
                            <i class="fas fa-cube"></i> 3D View
                        </button>` : ''}
                    </div>
                `;
                
                return `
                    <div class="sw-file-item ${file.isSpotTest ? 'spot-test' : ''}">
                        <div class="sw-file-header">
                            <i class="fas ${type === 'cw' ? 'fa-chalkboard-teacher' : 'fa-home'}"></i>
                            <span class="sw-file-name">${file.name}</span>
                            ${spotTestBadge}
                        </div>
                        ${actionButtons}
                    </div>
                `;
            }

            if (cwFilesWrap) {
                let cwHtml = '';
                Object.keys(solidworksProject.dayProjects).forEach(day => {
                    const dayData = solidworksProject.dayProjects[day];
                    cwHtml += `
                        <div class="sw-day-section">
                            <h5 class="sw-day-title">${day}</h5>
                            <div class="sw-file-list">
                                ${dayData.cw.map(file => createProjectItem(file, 'cw')).join('')}
                            </div>
                        </div>
                    `;
                });
                cwFilesWrap.innerHTML = cwHtml;
            }

            if (hwFilesWrap) {
                let hwHtml = '';
                Object.keys(solidworksProject.dayProjects).forEach(day => {
                    const dayData = solidworksProject.dayProjects[day];
                    hwHtml += `
                        <div class="sw-day-section">
                            <h5 class="sw-day-title">${day}</h5>
                            <div class="sw-file-list">
                                ${dayData.hw.map(file => createProjectItem(file, 'hw')).join('')}
                            </div>
                        </div>
                    `;
                });
                hwFilesWrap.innerHTML = hwHtml;
            }
            END OF OLD STATIC CODE */

            // Add quick links section
            addQuickLinksSection();
        }
        
        // Dynamic CW/HW file loader from GitHub
        async function loadDynamicCWHWFiles() {
            const cwFilesWrap = document.getElementById('cw-files-wrap');
            const hwFilesWrap = document.getElementById('hw-files-wrap');
            
            if (!cwFilesWrap && !hwFilesWrap) return;
            
            const owner = 'Akhinoor14';
            const repo = 'SOLIDWORKS-Projects';
            const headers = getGitHubHeaders();
            
            try {
                // Load CW files
                if (cwFilesWrap) {
                    cwFilesWrap.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading CW files...</div>';
                    const cwData = await loadFolderFiles(owner, repo, 'CW', headers);
                    cwFilesWrap.innerHTML = renderDayFiles(cwData, 'cw');
                }
                
                // Load HW files
                if (hwFilesWrap) {
                    hwFilesWrap.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading HW files...</div>';
                    const hwData = await loadFolderFiles(owner, repo, 'HW', headers);
                    hwFilesWrap.innerHTML = renderDayFiles(hwData, 'hw');
                }
                
            } catch (error) {
                console.error('Error loading CW/HW files:', error);
                if (cwFilesWrap) {
                    cwFilesWrap.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load CW files</p></div>';
                }
                if (hwFilesWrap) {
                    hwFilesWrap.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load HW files</p></div>';
                }
            }
        }
        
        // Load files from a folder (CW or HW) - recursively include nested files
        async function loadFolderFiles(owner, repo, folder, headers) {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder}`, { headers });
            
            if (!response.ok) {
                throw new Error(`Failed to load ${folder} folder`);
            }
            
            const items = await response.json();
            const dayGroups = {};
            
            // Load each day folder recursively
            for (const item of items) {
                if (item.type === 'dir' && /^Day\s*\d+/i.test(item.name)) {
                    const allFiles = await fetchAllFilesRecursive(item.url, headers);
                    dayGroups[item.name] = allFiles.filter(f => isInterestingSwFile(f.name));
                }
            }
            
            return dayGroups;
        }
        
        // Render day files as HTML
        function renderDayFiles(dayGroups, type) {
            const sortedDays = Object.keys(dayGroups).sort((a, b) => {
                const numA = parseInt(a.replace('Day', '').trim());
                const numB = parseInt(b.replace('Day', '').trim());
                return numA - numB;
            });
            
            if (sortedDays.length === 0) {
                return '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No files found</p></div>';
            }
            
            let html = '';
            
            for (const day of sortedDays) {
                const files = dayGroups[day];
                if (files.length === 0) continue;
                
                html += `
                    <div class="sw-day-section">
                        <h5 class="sw-day-title"><i class="fas fa-calendar-day"></i> ${day}</h5>
                        <div class="sw-file-list">
                `;
                
                files.forEach(file => {
                    const downloadUrl = file.download_url;
                    const fileName = file.name;
                    const fileExt = fileName.split('.').pop().toUpperCase();
                    
                    // File type icon
                    let icon = 'fa-file';
                    if (fileExt === 'SLDPRT' || fileExt === 'SLDASM' || fileExt === 'SLDDRW') {
                        icon = 'fa-cube';
                    } else if (fileExt === 'PDF') {
                        icon = 'fa-file-pdf';
                    } else if (['PNG', 'JPG', 'JPEG'].includes(fileExt)) {
                        icon = 'fa-image';
                    }
                    
                    html += `
                        <div class="sw-file-item">
                            <div class="sw-file-header">
                                <i class="fas ${icon}"></i>
                                <span class="sw-file-name">${fileName}</span>
                                <span class="sw-file-badge">${fileExt}</span>
                            </div>
                            <div class="sw-file-actions">
                                <a href="${downloadUrl}" download="${fileName}" class="sw-action-btn sw-btn-download" title="Download">
                                    <i class="fas fa-download"></i> Download
                                </a>
                                <a href="${file.html_url}" target="_blank" class="sw-action-btn sw-btn-page" title="View on GitHub">
                                    <i class="fab fa-github"></i> GitHub
                                </a>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
            
            return html;
        }

        // Function to add quick links section
        function addQuickLinksSection() {
            const solidworksProject = sampleProjects.find(p => p.title === "SOLIDWORKS Beginner Projects");
            if (!solidworksProject || !solidworksProject.quickLinks) return;

            const quickLinksHtml = `
                <div class="sw-quick-links">
                    <h4 class="sw-quick-title">🚀 Quick Access</h4>
                    <div class="sw-quick-buttons">
                        <a href="${solidworksProject.quickLinks.coursework}" target="_blank" class="sw-quick-btn">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <span>All Coursework</span>
                        </a>
                        <a href="${solidworksProject.quickLinks.homework}" target="_blank" class="sw-quick-btn">
                            <i class="fas fa-home"></i>
                            <span>All Homework</span>
                        </a>
                        <a href="${solidworksProject.quickLinks.models3d}" target="_blank" class="sw-quick-btn">
                            <i class="fas fa-cube"></i>
                            <span>3D Models</span>
                        </a>
                    </div>
                </div>
            `;

            // Add to root view
            const rootView = card.querySelector('.sw-root .sw-root-info');
            if (rootView && !rootView.querySelector('.sw-quick-links')) {
                rootView.insertAdjacentHTML('beforeend', quickLinksHtml);
            }
        }

        // Global function for 3D viewer
        window.open3DViewer = function(modelUrl) {
            const modal = document.getElementById('model-viewer-modal') || createModelViewerModal();
            const viewer = document.getElementById('inline-model-viewer');
            viewer.setAttribute('src', modelUrl);
            modal.style.display = 'flex';
        };

        // Create 3D viewer modal if it doesn't exist
        function createModelViewerModal() {
            const modalHtml = `
                <div id="model-viewer-modal" class="model-viewer-modal" style="display: none;">
                    <div class="model-viewer-backdrop" onclick="closeModelViewer()"></div>
                    <div class="model-viewer-content">
                        <div class="model-viewer-header">
                            <h3>3D Model Viewer</h3>
                            <button onclick="closeModelViewer()" class="close-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <model-viewer id="inline-model-viewer" 
                            camera-controls 
                            auto-rotate 
                            shadow-intensity="1"
                            style="width: 100%; height: 500px;">
                        </model-viewer>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Add close function
            window.closeModelViewer = function() {
                const modal = document.getElementById('model-viewer-modal');
                modal.style.display = 'none';
                document.getElementById('inline-model-viewer').removeAttribute('src');
            };

            return document.getElementById('model-viewer-modal');
        }

        // Call the injection function immediately
        console.log('📝 Calling injectDayProjects...');
        injectDayProjects();
        console.log('✅ Day projects injected');
        
            // Update mode buttons with statistics
            console.log('📊 Fetching statistics for CW/HW...');
            updateModeButtonStats().then(() => {
                console.log('✅ Statistics updated');
            }).catch(err => {
                console.error('⚠️ Failed to update statistics:', err);
            });

        function showView(name){
            console.log('🔄 Switching to view:', name);
            current = name;
            views.forEach(v=>{
                const match = v.getAttribute('data-view') === name;
                if(match){
                    v.removeAttribute('hidden');
                    v.classList.add('active-sw-view');
                    console.log('✅ Showing view:', v.getAttribute('data-view'));
                } else {
                    v.setAttribute('hidden','');
                    v.classList.remove('active-sw-view');
                }
            });
                // update mode buttons aria-current
                modeBtns.forEach(btn => {
                    const target = btn.getAttribute('data-target');
                    if(target === name || (name!== 'cw' && name !== 'hw' && target==='root')){
                        btn.setAttribute('aria-current','true');
                        console.log('✅ Active button:', target);
                    } else {
                        btn.removeAttribute('aria-current');
                    }
                });
        }
        
        tiles.forEach(t=> t.addEventListener('click', (e)=>{
            const target = t.getAttribute('data-target');
            console.log('🎯 Tile clicked, target:', target);
            
            // For CW/HW, open in new window instead of inline view
            if(target === 'cw' || target === 'hw') {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 Opening SOLIDWORKS window for:', target);
                openSolidworksWindow(target);
                return false;
            }
            
            if(target) showView(target);
        }));
        
        backButtons.forEach(b=> b.addEventListener('click', ()=>{
            const back = b.getAttribute('data-back');
            console.log('⬅️ Back button clicked, going to:', back);
            if(back) showView(back);
        }));
        
            modeBtns.forEach(mb => mb.addEventListener('click', (e)=>{
            const target = mb.getAttribute('data-target');
            console.log('🔘 Mode button clicked, target:', target);
            
                // For CW/HW, open in new window instead of inline view
                if(target === 'cw' || target === 'hw') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🚀 Opening SOLIDWORKS window from mode button:', target);
                    openSolidworksWindow(target);
                    return false;
                }
            
            if(target) showView(target);
        }));
        // Keyboard support: ESC to go back if not root
        card.addEventListener('keydown', e=>{
            if(e.key === 'Escape' && current !== 'root'){
                showView('root');
            }
            // Arrow key navigation between mode buttons
            if(e.target.classList.contains('sw-mode-btn')){
                const btnArray = Array.from(modeBtns);
                const idx = btnArray.indexOf(e.target);
                if(e.key==='ArrowRight' || e.key==='ArrowDown'){
                    const next = btnArray[(idx+1)%btnArray.length];
                    next.focus();
                    e.preventDefault();
                } else if(e.key==='ArrowLeft' || e.key==='ArrowUp'){
                    const prev = btnArray[(idx-1+btnArray.length)%btnArray.length];
                    prev.focus();
                    e.preventDefault();
                } else if(e.key==='Home'){ btnArray[0].focus(); e.preventDefault(); }
                else if(e.key==='End'){ btnArray[btnArray.length-1].focus(); e.preventDefault(); }
            }
            // Enter/Space on tile triggers view
            if(e.target.classList.contains('sw-tile') && (e.key==='Enter' || e.key===' ')){
                e.preventDefault();
                const target = e.target.getAttribute('data-target');
                
                // For CW/HW, open in new window
                if(target === 'cw' || target === 'hw') {
                    openSolidworksWindow(target);
                    return;
                }
                
                if(target) showView(target);
            }
        });
        // Make tiles focusable for keyboard users
        tiles.forEach(t => { if(!t.hasAttribute('tabindex')) t.setAttribute('tabindex','0'); });
        // Simple ripple effect on click for tiles & mode buttons
        function addRipple(e){
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'sw-ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            el.appendChild(ripple);
            setTimeout(()=> ripple.remove(), 650);
        }
        [...tiles, ...modeBtns].forEach(el => {
            el.addEventListener('click', addRipple);
        });
        showView('root');
    })();
    // Removed legacy modal code in favor of embedded navigation
    // Enhanced profile image fallback logic
    (function initProfilePhoto(){
        const img = document.getElementById('profile-photo');
        if(!img) return;
        const wrapper = img.closest('#profile-photo-wrapper') || img.closest('.profile-image');
        
        if(wrapper) { 
            wrapper.classList.add('loading'); 
        }
        
        function markReady() { 
            if(wrapper) { 
                wrapper.classList.remove('loading'); 
                wrapper.classList.add('ready'); 
            } 
        }
        
        function fallback(){
            console.log('Profile image fallback triggered');
            if(document.getElementById('profile-fallback')) return;
            const fb = document.createElement('div');
            fb.id = 'profile-fallback';
            fb.className = 'profile-fallback';
            fb.textContent = 'MAI'; // Md Akhinoor Islam initials
            fb.style.position = 'absolute';
            fb.style.inset = '0';
            fb.style.display = 'flex';
            fb.style.alignItems = 'center';
            fb.style.justifyContent = 'center';
            fb.style.fontSize = '2.5rem';
            fb.style.fontWeight = '700';
            fb.style.color = '#ffffff';
            fb.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
            fb.style.borderRadius = '50%';
            
            if(wrapper) { 
                wrapper.appendChild(fb); 
                wrapper.classList.add('ready'); 
            }
        }
        
        img.addEventListener('load', ()=> {
            console.log('Profile image loaded successfully');
            if(img.naturalWidth > 0) { 
                markReady(); 
            } else { 
                fallback(); 
            }
        });
        
        img.addEventListener('error', (e) => {
            console.log('Profile image failed to load:', e);
            fallback();
        });
        
        // Check if image is already loaded (cached)
        if(img.complete && img.naturalWidth > 0) {
            console.log('Profile image already loaded from cache');
            markReady();
        } else {
            // If after delay still not loaded, trigger fallback
            setTimeout(()=> { 
                if(!img.complete || img.naturalWidth === 0) {
                    console.log('Profile image loading timeout, using fallback');
                    fallback(); 
                }
            }, 3000);
        }
    })();

    // Profile upload & persistence logic
    (function initProfileUpload(){
        const fileInput = document.getElementById('profile-upload-input');
        const triggerBtn = document.getElementById('trigger-profile-upload');
        const statusEl = document.getElementById('profile-upload-status');
        const img = document.getElementById('profile-photo');
        const controls = document.querySelector('.profile-upload-controls');
        if(!fileInput || !triggerBtn || !img) return;

        const LS_KEY = 'portfolio.profile.photo.v1';
        const MAX_SIZE = 1.2 * 1024 * 1024; // 1.2MB
        const ACCEPTED = ['image/jpeg','image/png','image/webp'];

        function setStatus(msg, isError=false){
            if(!statusEl) return; 
            statusEl.textContent = msg; 
            statusEl.classList.toggle('profile-upload-error', !!isError);
        }

        function applyStored(){
            try {
                const data = localStorage.getItem(LS_KEY);
                if(data){
                    img.src = data; // base64 url
                    if(resetBtn) resetBtn.hidden = false;
                    setStatus('Loaded saved photo');
                }
            } catch(e){ console.warn('Profile photo load failed', e); }
        }

        function validateFile(file){
            if(!ACCEPTED.includes(file.type)) return 'Unsupported type';
            if(file.size > MAX_SIZE) return 'File too large (>1.2MB)';
            return null;
        }

        function handleFile(file){
            const error = validateFile(file);
            if(error){ setStatus(error, true); return; }
            setStatus('Processing...');
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const result = reader.result;
                    img.src = result;
                    localStorage.setItem(LS_KEY, result);
                    setStatus('Profile updated ✓');
                } catch(e){ setStatus('Store failed', true); }
            };
            reader.onerror = () => setStatus('Read error', true);
            reader.readAsDataURL(file);
        }

        triggerBtn.addEventListener('click', ()=> fileInput.click());
        fileInput.addEventListener('change', e => {
            const f = e.target.files && e.target.files[0];
            if(f) handleFile(f);
            fileInput.value = '';
        });


        // Drag & drop support
        if(controls){
            ['dragenter','dragover'].forEach(evt => controls.addEventListener(evt, e=>{ e.preventDefault(); controls.classList.add('drag-over'); }));
            ['dragleave','drop'].forEach(evt => controls.addEventListener(evt, e=>{ e.preventDefault(); controls.classList.remove('drag-over'); }));
            controls.addEventListener('drop', e => {
                const f = e.dataTransfer.files && e.dataTransfer.files[0];
                if(f) handleFile(f);
            });
        }

        applyStored();
    })();
});
// Enhanced projects data with engineering focus
const sampleProjects = [
    {
        title: "Interactive Engineering Portfolio Website",
        shortDescription: "Modern, responsive portfolio website showcasing engineering projects with dark/light theme, animations, and interactive features.",
        fullDescription: "A comprehensive, interactive portfolio website built from scratch to showcase engineering projects and technical skills. This modern web application features a responsive design with dark/light theme toggle, smooth animations, particle background effects, and interactive project modals. The website includes advanced functionality such as project filtering, search capabilities, contact forms, and GitHub API integration. Built with vanilla HTML, CSS, and JavaScript, it demonstrates proficiency in modern web development while maintaining focus on engineering content. The site features three main project categories: CAD design (SOLIDWORKS), embedded systems (Arduino), and electronics components. Includes comprehensive documentation, deployment guides, and fallback systems for reliable performance.",
        tech: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "GitHub Pages", "Web Development"],
        category: "web",
        github: "https://github.com/Akhinoor14/Solidworks-Website-Project",
        demo: "https://akhinoor14.github.io/Solidworks-Website-Project",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop"
        ],
        features: ["Responsive Design", "Dark/Light Theme", "GitHub API", "Interactive UI"],
        featured: true,
        // Special Portfolio website structure
        specialType: "portfolio",
        websiteFeatures: [
            {
                name: "Modern UI/UX",
                icon: "🎨",
                details: ["Engineering architecture theme", "Blueprint grid patterns", "Smooth animations", "Interactive cards"]
            },
            {
                name: "Advanced Features",
                icon: "⚡",
                details: ["GitHub repository browser", "PDF viewer", "Markdown renderer", "3D model support"]
            },
            {
                name: "Tech Stack",
                icon: "💻",
                details: ["Vanilla JavaScript", "CSS3 Grid/Flexbox", "HTML5 semantic tags", "GitHub Pages deployment"]
            },
            {
                name: "Performance",
                icon: "🚀",
                details: ["Optimized animations", "Lazy loading", "Fast page load", "Mobile responsive"]
            }
        ],
        repoFiles: {
            hasHTML: true,
            hasCSS: true,
            hasJavaScript: true,
            hasDocumentation: true,
            hasDeployment: true
        }
    },
    {
        title: "SOLIDWORKS Beginner Projects",
        shortDescription: "21+ SOLIDWORKS projects for beginners with step-by-step tutorials covering mechanical parts, assemblies, and technical drawings across 5 days of structured learning.",
        fullDescription: "A comprehensive collection of 21+ SOLIDWORKS projects specifically designed for beginners entering the world of CAD design. This repository serves as a complete learning resource featuring mechanical parts design, complex assemblies, and professional technical drawings across 5 days of structured coursework and homework assignments. Each project includes detailed step-by-step tutorials with screenshots, downloadable SOLIDWORKS files, preview images, and real-world engineering applications. Perfect for students, engineers, and hobbyists looking to master 3D modeling techniques used in modern engineering design. Projects range from simple bracket designs to complex mechanical assemblies and technical drawings, providing a progressive learning path that builds skills systematically from Day 1 through Day 7.",
        tech: ["SOLIDWORKS", "CAD Design", "3D Modeling", "Technical Drawing", "Engineering"],
        category: "desktop",
        github: "https://github.com/Akhinoor14/SOLIDWORKS-Projects",
        demo: null,
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=400&fit=crop"
        ],
        features: ["Step-by-step tutorials", "Downloadable files", "Progressive difficulty", "Real-world applications"],
        featured: true,
        // Add CW/HW folders and example files for interactive UI
        folders: [
            {
                label: "Class Work (CW)",
                icon: "📂",
                url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW",
                files: [
                    { name: "CW01 - Simple Bracket", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW01.SLDPRT" },
                    { name: "CW02 - Shaft Coupling", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW02.SLDPRT" },
                    { name: "CW03 - Flange", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW03.SLDPRT" }
                ]
            },
            {
                label: "Home Work (HW)",
                icon: "🏠",
                url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW",
                files: [
                    { name: "HW01 - Pulley", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW01.SLDPRT" },
                    { name: "HW02 - Gear", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW02.SLDPRT" },
                    { name: "HW03 - Clamp", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW03.SLDPRT" }
                ]
            }
        ],
        // Day-specific project structure for dynamic injection
        dayProjects: {
            "Day 01": {
                cw: [
                    { 
                        name: "CW 1 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2001/cw%201%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%201%20day%2001/cWW1.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%201%20day%2001/cw%201.png"
                    },
                    { 
                        name: "CW 2 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2001/cw%202%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%202%20day%2001/cw2.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%202%20day%2001/cw%202.png"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2001/hw%2001%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2001%20day%2001/HW%201.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2001%20day%2001/hw%201.png"
                    },
                    { 
                        name: "HW 2 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2001/hw%2002%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2002%20day%2001/HW%202.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2002%20day%2001/2.1.png",
                        preview2: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2002%20day%2001/2.2.png"
                    }
                ]
            },
            "Day 02": {
                cw: [
                    { 
                        name: "CW 1 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2002/cw%201%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%201%20day%2002/cw%203%20DAY%2002%2C%2001.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%201%20day%2002/cw%203%20DAY%2002%2C%2001.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%201%20day%2002/cw_3_day_02%2C_01.glb"
                    },
                    { 
                        name: "CW 2 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2002/cw%202%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%202%20day%2002/cw%20%20DAY%2002%2C%2002.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%202%20day%2002/cw%20%20DAY%2002%2C%2002.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%202%20day%2002/cw%20%20DAY%2002%2C%2002.glb"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2002/hw%2001%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2001%20day%2002/HW%203%20DAY%2002%2C%2001.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2001%20day%2002/HW%203%20DAY%2002%2C%2001.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2001%20day%2002/hw_3_day_02%2C_01.glb"
                    },
                    { 
                        name: "HW 2 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2002/hw%2002%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2002%20day%2002/HW%204%20DAY%2002%2C%2002.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2002%20day%2002/HW%204%20DAY%2002%2C%2002.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2002%20day%2002/hw_4_day_02%2C_02.glb"
                    }
                ]
            },
            "Day 03": {
                cw: [
                    { 
                        name: "CW 1 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2003/cw%201%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2003/cw%201%20day%2003/cw%2001%2C%20day%2003.SLDPRT"
                    },
                    { 
                        name: "CW 2 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2003/cw%202%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2003/cw%202%20day%2003/cw%2002%2C%20day%2003.SLDPRT"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2003/hw%201%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2003/hw%201%20day%2003/hw%20day%203%2C%2001.SLDPRT"
                    },
                    { 
                        name: "HW 2 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2003/hw%202%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2003/hw%202%20day%2003/hw%20day%203%2C%2002.SLDPRT"
                    }
                ]
            },
            "Day 04": {
                cw: [
                    { 
                        name: "CW 1 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2004/cw%201%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%201%20day%204/cw%2001.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%201%20day%204/Screenshot%202025-10-13%20032712.png"
                    },
                    { 
                        name: "CW 2 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2004/cw%202%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%202%20day%204/cw%2002.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%202%20day%204/Screenshot%202025-10-13%20032801.png"
                    },
                    { 
                        name: "Spot Test - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2004/spot%20test%20Day%2004/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/spot%20test%20Day%2004/cw%20spot%20test.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/spot%20test%20Day%2004/Screenshot%202025-10-13%20032734.png",
                        isSpotTest: true
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2004/hw%201%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2004/hw%201%20day%204/02.SLDPRT"
                    },
                    { 
                        name: "HW 2 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2004/hw%202%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2004/hw%202%20day%204/01.SLDPRT"
                    }
                ]
            },
            "Day 05": {
                cw: [
                    { 
                        name: "CW 1 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2005/day%205%20cw%201/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%201/day%205%20cw%201.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%201/Screenshot%202025-10-20%20122707.png"
                    },
                    { 
                        name: "CW 2 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2005/day%205%20cw%202/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%202/day%205%20cw%202.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%202/Screenshot%202025-10-20%20122757.png"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%205/hw%2001%20day%205/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2001%20day%205/hw%2001%20day%205%20drill.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2001%20day%205/Screenshot%202025-10-19%20225850.png"
                    },
                    { 
                        name: "HW 2 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%205/hw%2002%20day%205/README.md",
                        downloads: [
                            {
                                type: "Part",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2002%20day%205/hw%2002%20day%205%20spanner%20main.SLDPRT"
                            },
                            {
                                type: "Drawing",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2002%20day%205/hw%2002%20day%205%20spanner.SLDDRW"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2002%20day%205/Screenshot%202025-10-20%20120639.png"
                    }
                ]
            },
            "Day 06": {
                cw: [
                    { 
                        name: "CW 1 - Day 06", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW/Day%2006",
                        downloads: [
                            {
                                type: "Assembly",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/Assem1%20day%206.SLDASM"
                            },
                            {
                                type: "Part 1", 
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/part1%20day%206.SLDPRT"
                            },
                            {
                                type: "Part 2",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/part2%20day%206.SLDPRT"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/Screenshot%20day%206.png"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 06", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW/Day%2006",
                        downloads: [
                            {
                                type: "Part",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2006/hw%20day%206.SLDPRT"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2006/Screenshot%20hw%20day%206.png"
                    }
                ]
            },
            "Day 07": {
                cw: [
                    { 
                        name: "CW 1 - Day 07", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW/Day%2007",
                        downloads: [
                            {
                                type: "Assembly",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/Assem1%20day%207.SLDASM"
                            },
                            {
                                type: "Part 1",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/part1%20day%207.SLDPRT"
                            },
                            {
                                type: "Part 2", 
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/part2%20day%207.SLDPRT"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/Screenshot%20day%207.png"
                    }
                ],
                hw: []
            }
        },
        // Quick access links
        quickLinks: {
            coursework: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW",
            homework: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW", 
            models3d: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2002/cw%201%20day%2002/README.md"
        }
    },
    {
        title: "Arduino UNO Projects with Tinkercad",
        shortDescription: "40+ Arduino experiments in Tinkercad covering sensors, IoT, and embedded systems with circuit diagrams and code.",
        fullDescription: "An extensive collection of 40+ foundational Arduino UNO experiments designed and simulated using Tinkercad platform. This comprehensive resource covers essential topics in embedded systems including sensor interfacing, actuator control, display programming, and IoT fundamentals. Each project features detailed circuit diagrams, well-commented Arduino code, and practical real-world applications. The projects are structured to provide hands-on experience with various components like LEDs, sensors, motors, displays, and communication modules. Perfect for students, educators, and makers who want to master embedded systems programming and IoT development. All projects are tested and verified in Tinkercad simulation environment.",
        tech: ["Arduino", "C++", "Tinkercad", "IoT", "Embedded Systems", "Sensors"],
        category: "web",
        github: "https://github.com/Akhinoor14/Tinkercad-basic-Projects-Using-Arduino-Uno",
        demo: "https://www.tinkercad.com/users/akhinoor14",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=400&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1518309435079-11f4ccfec336?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop"
        ],
        features: ["40+ Arduino Projects", "Tinkercad Simulations", "Circuit Diagrams", "IoT & Sensors"],
        featured: false,
        // Special Arduino project structure
        specialType: "arduino",
        arduinoCategories: [
            {
                name: "LED & Display Projects",
                icon: "💡",
                count: 12,
                examples: ["Blinking LED", "7-Segment Display", "LED Matrix", "RGB LED Control"]
            },
            {
                name: "Sensor Projects",
                icon: "📡",
                count: 15,
                examples: ["Ultrasonic Distance", "Temperature (DHT11)", "IR Sensor", "LDR Light Sensor"]
            },
            {
                name: "Motor & Actuators",
                icon: "⚙️",
                count: 8,
                examples: ["DC Motor Control", "Servo Motor", "Stepper Motor", "Relay Module"]
            },
            {
                name: "IoT & Communication",
                icon: "🌐",
                count: 5,
                examples: ["Bluetooth HC-05", "WiFi ESP8266", "RFID Reader", "GSM Module"]
            }
        ],
        repoFiles: {
            hasCircuitDiagrams: true,
            hasCodeFiles: true,
            hasTinkercadLinks: true,
            hasReadmeGuides: true
        }
    },
    {
        title: "Electronic Components Guide",
        shortDescription: "Interactive guide to essential electronic components with detailed explanations and practical circuit examples.",
        fullDescription: "A comprehensive interactive guide covering essential electronic components used in modern circuit design and electronics engineering. This educational resource provides detailed explanations of resistors, capacitors, transistors, integrated circuits, and other fundamental components. Each component section includes theoretical background, practical applications, circuit examples, and troubleshooting tips. The guide features visual representations, component specifications, and real-world usage scenarios that help students and engineers understand how to properly select and implement components in their designs. Essential for anyone working with electronics, from hobbyists to professional engineers developing complex systems.",
        tech: ["Electronics", "Circuit Design", "Component Analysis", "PCB Design", "Datasheets"],
        category: "web",
        github: "https://github.com/Akhinoor14/Electronic-Components-",
        demo: null,
        image: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=600&h=300&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=800&h=400&fit=crop"
        ],
        features: ["Component Database", "Circuit Examples", "Datasheets & Specs", "Practical Tutorials"],
        featured: false,
        // Special Electronics component structure
        specialType: "electronics",
        componentCategories: [
            {
                name: "Passive Components",
                icon: "🔌",
                components: ["Resistors", "Capacitors", "Inductors", "Diodes", "Crystals"]
            },
            {
                name: "Active Components",
                icon: "⚡",
                components: ["Transistors (BJT/FET)", "Op-Amps", "Voltage Regulators", "MOSFETs", "IGBTs"]
            },
            {
                name: "Integrated Circuits",
                icon: "🔲",
                components: ["Microcontrollers", "Logic Gates", "Memory ICs", "Timer ICs (555)", "ADC/DAC"]
            },
            {
                name: "Power Components",
                icon: "⚙️",
                components: ["Transformers", "Batteries", "Solar Cells", "Power Supplies", "Buck/Boost Converters"]
            },
            {
                name: "Sensors & Modules",
                icon: "📊",
                components: ["Temperature Sensors", "Pressure Sensors", "Proximity Sensors", "Gas Sensors", "Gyroscopes"]
            }
        ],
        repoFiles: {
            hasDatasheets: true,
            hasCircuitExamples: true,
            hasCalculators: true,
            hasSpecs: true
        }
    }
];

// DOM Elements
console.log('🔍 Selecting DOM elements...');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const projectsGrid = document.getElementById('projects-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const contactForm = document.querySelector('.contact-form');

console.log('📌 DOM Elements found:', {
    hamburger: !!hamburger,
    navMenu: !!navMenu,
    themeToggle: !!themeToggle,
    projectsGrid: !!projectsGrid,
    filterBtns: filterBtns.length,
    contactForm: !!contactForm
});

if (!projectsGrid) {
    console.error('❌ Projects grid not found! Cannot render projects.');
}

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Theme Toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', toggleTheme);

// Initialize theme on page load
initializeTheme();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active nav link tracking on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'linear-gradient(180deg, rgba(10,10,10,0.98), rgba(20,0,0,0.98))';
        navbar.style.boxShadow = '0 8px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(255, 0, 0, 0.06)';
    } else {
        navbar.style.background = 'linear-gradient(180deg, rgba(10,10,10,0.95), rgba(20,0,0,0.95))';
        navbar.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.6), 0 0 18px rgba(255, 0, 0, 0.04)';
    }
    
    // Update active nav link
    updateActiveNavLink();
});

// Initialize active nav link on load
document.addEventListener('DOMContentLoaded', updateActiveNavLink);

// Projects functionality
// Projects functionality with enhanced interactivity
function createProjectCard(project) {
    console.log('🎴 Creating card for:', project.title);
    
    if (!project || !project.title) {
        console.error('❌ Invalid project data:', project);
        return document.createElement('div');
    }
    
    const card = document.createElement('div');
    card.className = `project-card ${project.category} ${project.featured ? 'featured' : ''} visible`;
    
    // Set initial styles for animation
    card.style.cssText = 'opacity: 1; transform: translateY(0); display: block;';
    
    console.log(`✅ Card created with classes: ${card.className}`);
    
    // Create fallback image based on project type
    const fallbackImage = project.category === 'web' && project.title.includes('Arduino') 
        ? 'https://via.placeholder.com/600x300/FF6B35/ffffff?text=Arduino+Projects'
        : project.category === 'desktop' && project.title.includes('SOLIDWORKS')
        ? 'https://via.placeholder.com/600x300/4F46E5/ffffff?text=SOLIDWORKS+Projects'
        : project.category === 'web' && project.title.includes('Electronic')
        ? 'https://via.placeholder.com/600x300/10B981/ffffff?text=Electronic+Components'
        : project.category === 'web' && project.title.includes('Portfolio')
        ? 'https://via.placeholder.com/600x300/7C3AED/ffffff?text=Portfolio+Website'
        : 'https://via.placeholder.com/600x300/6366F1/ffffff?text=Engineering+Project';
    // Compute repo info for quick links
    const repoMatch = (project.github || '').match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const owner = repoMatch ? repoMatch[1] : '';
    const repo = repoMatch ? repoMatch[2] : '';
    const readmeUrl = owner && repo ? `https://github.com/${owner}/${repo}` : project.github;
    const readmeRaw = owner && repo ? `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md` : project.github;
    const zipUrlMain = owner && repo ? `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip` : '#';
    const zipUrlMaster = owner && repo ? `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip` : '#';
    const zipUrl = zipUrlMain; // default to main

    // Helper to build action buttons (no Details button as requested)
    const buildActions = () => {
        const hasDemo = !!project.demo;
        const escapedGithub = (project.github || '').replace(/'/g, "\\'");
        const escapedTitle = (project.title || '').replace(/'/g, "\\'");
        // Prioritize: GitHub, README, Browse, Demo|ZIP
        const lastBtn = hasDemo 
            ? `<a href="${project.demo}" class="action-btn btn-demo" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i><span>Live Demo</span></a>`
            : `<a href="${zipUrl}" class="action-btn btn-zip" target="_blank" rel="noopener" title="If main is unavailable, try master from GitHub"><i class="fas fa-file-archive"></i><span>Download ZIP</span></a>`;
        return `
            <div class="project-actions-grid">
                <a href="${project.github}" class="action-btn btn-github" target="_blank" rel="noopener">
                    <i class="fab fa-github"></i>
                    <span>GitHub</span>
                </a>
                <a href="${readmeUrl}#readme" class="action-btn btn-readme" target="_blank" rel="noopener">
                    <i class="fas fa-book"></i>
                    <span>README</span>
                </a>
                <button class="action-btn btn-browse" onclick="openGitHubBrowser('${escapedGithub}', '${escapedTitle}')">
                    <i class="fas fa-folder-open"></i>
                    <span>Browse</span>
                </button>
                ${lastBtn}
            </div>
        `;
    };

    // Check for special project types and render custom content
    if (project.specialType === 'arduino' && project.arduinoCategories) {
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" 
                     alt="${project.title}" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                <div class="project-overlay">
                    <div class="project-status">
                        ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                        <span class="category-badge">${project.category.toUpperCase()}</span>
                    </div>
                </div>
                <div class="blueprint-grid"></div>
            </div>
            <div class="project-content">
                <div class="content-header">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="title-accent"></div>
                </div>
                <p class="project-description">${project.shortDescription}</p>
                
                <div class="special-content arduino-categories">
                    ${project.arduinoCategories.map(cat => `
                        <details class="category-section">
                            <summary class="category-header">
                                <span class="category-icon">${cat.icon}</span>
                                <span class="category-name">${cat.name}</span>
                                <span class="category-count">${cat.count} projects</span>
                            </summary>
                            <div class="category-body">
                                <p class="category-description">Example projects:</p>
                                <ul class="project-list">
                                    ${cat.examples.map(example => `<li>${example}</li>`).join('')}
                                </ul>
                            </div>
                        </details>
                    `).join('')}
                </div>
                
                <div class="project-tech">
                    ${project.tech.slice(0, 4).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    ${project.tech.length > 4 ? `<span class="tech-more">+${project.tech.length - 4}</span>` : ''}
                </div>
                
                ${buildActions()}
            </div>
        `;
        return card;
    }
    
    if (project.specialType === 'electronics' && project.componentCategories) {
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" 
                     alt="${project.title}" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                <div class="project-overlay">
                    <div class="project-status">
                        ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                        <span class="category-badge">${project.category.toUpperCase()}</span>
                    </div>
                </div>
                <div class="blueprint-grid"></div>
            </div>
            <div class="project-content">
                <div class="content-header">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="title-accent"></div>
                </div>
                <p class="project-description">${project.shortDescription}</p>
                
                <div class="special-content electronics-components">
                    ${project.componentCategories.map(cat => `
                        <details class="category-section">
                            <summary class="category-header">
                                <span class="category-icon">${cat.icon}</span>
                                <span class="category-name">${cat.name}</span>
                            </summary>
                            <div class="category-body">
                                <ul class="component-list">
                                    ${cat.components.map(comp => `<li><span class="component-bullet">▸</span>${comp}</li>`).join('')}
                                </ul>
                            </div>
                        </details>
                    `).join('')}
                </div>
                
                <div class="project-tech">
                    ${project.tech.slice(0, 4).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    ${project.tech.length > 4 ? `<span class="tech-more">+${project.tech.length - 4}</span>` : ''}
                </div>
                
                ${buildActions()}
            </div>
        `;
        return card;
    }
    
    if (project.specialType === 'portfolio' && project.websiteFeatures) {
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" 
                     alt="${project.title}" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                <div class="project-overlay">
                    <div class="project-status">
                        ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                        <span class="category-badge">${project.category.toUpperCase()}</span>
                    </div>
                </div>
                <div class="blueprint-grid"></div>
            </div>
            <div class="project-content">
                <div class="content-header">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="title-accent"></div>
                </div>
                <p class="project-description">${project.shortDescription}</p>
                
                <div class="special-content portfolio-features">
                    ${project.websiteFeatures.map(feature => `
                        <div class="feature-group">
                            <div class="feature-group-header">
                                <span class="feature-icon">${feature.icon}</span>
                                <span class="feature-name">${feature.name}</span>
                            </div>
                            <ul class="feature-details">
                                ${feature.details.map(detail => `<li><span class="detail-bullet">✓</span>${detail}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
                
                <div class="project-tech">
                    ${project.tech.slice(0, 4).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    ${project.tech.length > 4 ? `<span class="tech-more">+${project.tech.length - 4}</span>` : ''}
                </div>
                
                ${buildActions()}
            </div>
        `;
        return card;
    }
    
    // Default card rendering for standard projects
    // Add interactive CW/HW folders for SOLIDWORKS project
    let foldersHtml = '';
    if (project.title === "SOLIDWORKS Beginner Projects" && project.folders) {
        foldersHtml = project.folders.map(folder => `
            <details style="margin-top:0.5em;">
                <summary><b>${folder.icon} ${folder.label}</b> <a href="${folder.url}" target="_blank" style="font-size:0.9em;">[Open Folder]</a></summary>
                <ul style="margin:0.5em 0 0 1.5em;">
                    ${folder.files.map(f => `<li><a href="${f.url}" target="_blank">${f.name}</a></li>`).join('')}
                </ul>
            </details>
        `).join('');
    }

    card.innerHTML = `
        <div class="project-image">
            <img src="${project.image}" 
                 alt="${project.title}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${fallbackImage}';">
            <div class="project-overlay">
                <div class="project-status">
                    ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                    <span class="category-badge">${project.category.toUpperCase()}</span>
                </div>
            </div>
            <div class="blueprint-grid"></div>
        </div>
        <div class="project-content">
            <div class="content-header">
                <h3 class="project-title">${project.title}</h3>
                <div class="title-accent"></div>
            </div>
            <p class="project-description">${project.shortDescription}</p>
            <div class="project-features">
                ${project.features.slice(0, 3).map(feature => `<span class="feature-tag"><i class="fas fa-check-circle"></i> ${feature}</span>`).join('')}
            </div>
            <div class="project-tech">
                ${project.tech.slice(0, 4).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                ${project.tech.length > 4 ? `<span class="tech-more">+${project.tech.length - 4}</span>` : ''}
            </div>
            ${buildActions()}
        </div>
    `;
    
    return card;
}

function renderProjects(projectsToShow = sampleProjects) {
    console.log('🎨 Rendering projects:', projectsToShow.length, 'projects');
    
    if (!projectsGrid) {
        console.error('❌ Projects grid not found!');
        return;
    }
    
    // Preserve embedded SOLIDWORKS card if exists
    const embedded = document.getElementById('solidworks-beginner-card');
    
    // Remove all dynamically generated cards only (keep embedded card)
    Array.from(projectsGrid.children).forEach(child => {
        if(child.id !== 'solidworks-beginner-card') {
            child.remove();
        }
    });
    
    // Ensure embedded card is visible if it exists
    if(embedded) {
        embedded.classList.remove('hidden');
        embedded.classList.add('visible');
        embedded.style.display = '';
        console.log('✅ Embedded SOLIDWORKS card preserved');
    }
    
    // Create and append dynamic cards
    projectsToShow.forEach((project, index) => {
        // Skip SOLIDWORKS project since it's already embedded in HTML
        if(project.title === 'SOLIDWORKS Beginner Projects') {
            console.log('⏭️ Skipping SOLIDWORKS (already embedded)');
            return;
        }
        
        console.log('🎴 Creating dynamic card for:', project.title);
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
        console.log('✅ Card appended:', project.title);
    });
    
    console.log('📊 Total cards in grid:', projectsGrid.children.length);
    console.log('📋 Card titles:', Array.from(projectsGrid.children).map(c => c.querySelector('.project-title')?.textContent || 'Unknown'));
}

// Filter projects
function filterProjects(category) {
    console.log('🔍 Filtering by category:', category);
    
    const embedded = document.getElementById('solidworks-beginner-card');
    
    if (category === 'all') {
        // Show all projects
        console.log('✅ Showing all projects');
        if(embedded) {
            embedded.classList.remove('hidden');
            embedded.classList.add('visible');
            embedded.style.display = '';
        }
        renderProjects(sampleProjects);
    } else if (category === 'desktop') {
        // Show only desktop projects (SOLIDWORKS embedded card)
        console.log('✅ Showing desktop projects');
        if(embedded) {
            embedded.classList.remove('hidden');
            embedded.classList.add('visible');
            embedded.style.display = '';
        }
        // Filter other projects that are desktop category
        const filteredProjects = sampleProjects.filter(p => p.category === 'desktop');
        renderProjects(filteredProjects);
    } else {
        // Show web/mobile projects, hide SOLIDWORKS
        console.log('✅ Showing', category, 'projects');
        if(embedded) {
            embedded.classList.add('hidden');
            embedded.classList.remove('visible');
            embedded.style.display = 'none';
        }
        const filteredProjects = sampleProjects.filter(p => p.category === category);
        renderProjects(filteredProjects);
    }
}

// Filter button event listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active filter button
        filterBtns.forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter projects
        const category = btn.getAttribute('data-filter');
        filterProjects(category);
    });
});

// Initialize projects
console.log('🎨 Initializing projects...');
console.log('📦 Total sample projects:', sampleProjects.length);
console.log('📋 Projects:', sampleProjects.map(p => `${p.title} (${p.category})`));

if (projectsGrid) {
    console.log('✅ Projects grid found:', projectsGrid);
    console.log('📍 Grid current children:', projectsGrid.children.length);
    console.log('🔍 Grid innerHTML length:', projectsGrid.innerHTML.length);
    
    renderProjects();
    
    console.log('🎬 After render - Grid children:', projectsGrid.children.length);
    console.log('🎬 After render - Children:', Array.from(projectsGrid.children).map(c => ({
        id: c.id,
        className: c.className,
        title: c.querySelector('.project-title, .sw-card-title')?.textContent?.substring(0, 30)
    })));
} else {
    console.error('❌ Projects grid element not found! Check HTML for id="projects-grid"');
}

// Contact form handling
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Here you would typically send the data to a server
    // For now, we'll just show an alert
    alert(`Thank you ${name}! Your message has been received. I'll get back to you at ${email} soon.`);
    
    // Reset form
    contactForm.reset();
    });
} else {
    console.log('ℹ️ Contact form not found on this page');
}

// Scroll animations
function observeElements() {
    const elements = document.querySelectorAll('.fade-in, .stat-card, .skill-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', observeElements);

// GitHub API integration for real-time data
async function fetchGitHubProjects(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        const repos = await response.json();
        
        const projects = repos.map(repo => ({
            title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: repo.description || 'No description available',
            tech: repo.language ? [repo.language] : ['JavaScript'],
            category: 'web',
            github: repo.html_url,
            demo: repo.homepage || null,
            image: `https://opengraph.githubassets.com/1/${username}/${repo.name}`,
            featured: repo.stargazers_count > 5
        }));
        
        return projects;
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return sampleProjects;
    }
}

// Load real GitHub data (disabled to show only sample projects)
// Uncomment the code below if you want to add more projects from GitHub
/*
(async () => {
    try {
        const githubProjects = await fetchGitHubProjects('Akhinoor14');
        if (githubProjects.length > 0) {
            // Merge with sample projects for better display
            const allProjects = [...sampleProjects, ...githubProjects.slice(0, 3)];
            renderProjects(allProjects);
        }
    } catch (error) {
        console.log('Using sample projects as fallback');
        renderProjects(sampleProjects);
    }
})();
*/

// Typing animation for hero text
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation
document.addEventListener('DOMContentLoaded', () => {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        typeWriter(heroSubtitle, originalText, 100);
    }
    
    // Add floating animation to tech badges
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
        element.classList.add('floating-animation');
    });
    
    // Initialize counters on page load
    if (typeof window.refreshAllCounters === 'function') {
        // Wait a bit for dayProjects to be fully loaded
        setTimeout(() => {
            window.refreshAllCounters();
            console.log('✅ Counters initialized from dayProjects');
        }, 500);
    } else {
        console.log('✅ Page loaded - ready');
    }
});

// Add loading states for better UX
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add particles animation (optional enhancement)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.1;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// Add particles animation (optional enhancement)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.1;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// Initialize particles (enable for cool background effect)
createParticles();

// Enhanced Homepage Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    initializeHomepageAnimations();
    createParticleSystem();
    initializeTypingAnimation();
    initializeCounterAnimation();
    initializeSkillBadgeInteractions();
});

// Particle System for Background
function createParticleSystem() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Typing Animation
function initializeTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const text = typingElement.getAttribute('data-text');
    let index = 0;
    
    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }
    
    // Start typing after page load
    setTimeout(type, 1000);
}

// Counter Animation
function initializeCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                let current = 0;
                const increment = target / 100;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Skill Badge Interactions
function initializeSkillBadgeInteractions() {
    const skillBadges = document.querySelectorAll('.skill-badge');
    
    skillBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-10px) rotate(2deg)';
            
            // Add glow effect
            this.style.boxShadow = '0 15px 45px rgba(79, 70, 229, 0.3)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0) rotate(0deg)';
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        });
        
        badge.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Homepage Load Animations
function initializeHomepageAnimations() {
    // Stagger animation for hero elements
    const animatedElements = document.querySelectorAll('.animate-on-load');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animationPlayState = 'running';
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
}

// Download Resume Function
function downloadResume() {
    // Download the actual PDF CV file
    const cvPath = './CV/2313014 CV.pdf';
    
    // Create a temporary link to download the CV
    const a = document.createElement('a');
    a.href = cvPath;
    a.download = 'Md_Akhinoor_Islam_CV.pdf';
    a.target = '_blank'; // Open in new tab if download fails
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show success message
    const btn = event.target.closest('.btn-download');
    const originalText = btn.querySelector('.btn-text').textContent;
    btn.querySelector('.btn-text').textContent = 'Downloaded! ✓';
    
    setTimeout(() => {
        btn.querySelector('.btn-text').textContent = originalText;
    }, 2000);
    
    // Analytics tracking (optional)
    console.log('CV downloaded by user');
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroHeight = hero.offsetHeight;
    const scrollRatio = scrolled / heroHeight;
    
    if (scrollRatio <= 1) {
        // Move background elements at different speeds
        const shapes = document.querySelectorAll('.shape');
        const orbs = document.querySelectorAll('.orb');
        
        shapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        orbs.forEach((orb, index) => {
            const speed = 0.2 + (index * 0.05);
            orb.style.transform = `translateY(${scrolled * speed}px) scale(${1 - scrollRatio * 0.2})`;
        });
        
        // Fade out hero content as user scrolls
        const heroContent = document.querySelector('.hero-content');
        heroContent.style.opacity = Math.max(0, 1 - scrollRatio);
        heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Add CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Project search functionality
function addProjectSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search projects...';
    searchInput.className = 'project-search';
    searchInput.style.cssText = `
        margin: 20px 0;
        padding: 10px 15px;
        border: 2px solid var(--border-color);
        border-radius: 25px;
        width: 100%;
        max-width: 400px;
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s ease;
    `;
    
    const projectFilters = document.querySelector('.project-filters');
    projectFilters.parentNode.insertBefore(searchInput, projectFilters.nextSibling);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProjects = sampleProjects.filter(project =>
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.tech.some(tech => tech.toLowerCase().includes(searchTerm))
        );
        renderProjects(filteredProjects);
    });
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    addProjectSearch();
});

// Helper function to create project modal (used by openProjectModal)
function createProjectModal(project) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'projectModal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeProjectModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">${project.title}</h2>
                <button class="close-btn" onclick="closeProjectModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="project-gallery">
                    <div class="main-image">
                        <img src="${project.gallery[0]}" alt="${project.title}" id="mainImage">
                    </div>
                    <div class="gallery-thumbnails">
                        ${project.gallery.map((img, index) => `
                            <img src="${img}" alt="Gallery ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 onclick="changeMainImage('${img}', this)">
                        `).join('')}
                    </div>
                </div>
                <div class="project-details">
                    <div class="project-info">
                        <h3>Project Overview</h3>
                        <p class="full-description">${project.fullDescription}</p>
                        
                        <h3>Key Features</h3>
                        <ul class="features-list">
                            ${project.features.map(feature => `<li><i class="fas fa-check-circle"></i> ${feature}</li>`).join('')}
                        </ul>
                        
                        <h3>Technologies Used</h3>
                        <div class="tech-stack">
                            ${project.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                        </div>
                        
                        <div class="project-stats">
                            <div class="stat-item">
                                <i class="fas fa-star"></i>
                                <span>Category: ${project.category.toUpperCase()}</span>
                            </div>
                            ${project.featured ? '<div class="stat-item"><i class="fas fa-trophy"></i><span>Featured Project</span></div>' : ''}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <a href="${project.github}" class="modal-btn primary" target="_blank" rel="noopener">
                            <i class="fab fa-github"></i> View Source Code
                        </a>
                        ${project.demo ? `<a href="${project.demo}" class="modal-btn secondary" target="_blank" rel="noopener">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </a>` : ''}
                        <button class="modal-btn outline" onclick="closeProjectModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .project-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .project-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            position: relative;
            max-width: 1200px;
            width: 90%;
            max-height: 90vh;
            margin: 5vh auto;
            background: var(--bg-color, white);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            transform: translateY(50px);
            transition: transform 0.3s ease;
        }
        
        .project-modal.show .modal-content {
            transform: translateY(0);
        }
        
        .modal-header {
            padding: 20px 30px;
            border-bottom: 1px solid rgba(255, 0, 0, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #cc0000, #ff0000);
            color: white;
        }
        
        .modal-title {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
            padding: 30px;
            max-height: calc(90vh - 140px);
            overflow-y: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .project-gallery {
            space-y: 15px;
        }
        
        .main-image {
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .main-image img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .main-image img:hover {
            transform: scale(1.05);
        }
        
        .gallery-thumbnails {
            display: flex;
            gap: 10px;
            overflow-x: auto;
        }
        
        .thumbnail {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .thumbnail:hover, .thumbnail.active {
            border-color: #ff0000;
            transform: scale(1.1);
        }
        
        .project-details h3 {
            color: #ff0000;
            margin: 20px 0 10px 0;
            font-size: 1.2rem;
        }
        
        .full-description {
            line-height: 1.6;
            color: var(--text-color, #333);
            margin-bottom: 20px;
        }
        
        .features-list {
            list-style: none;
            padding: 0;
        }
        
        .features-list li {
            padding: 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .features-list i {
            color: #10b981;
        }
        
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 20px;
        }
        
        .tech-badge {
            background: rgba(255, 0, 0, 0.1);
            color: #ff0000;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .project-stats {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 20px 0;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-color, #666);
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .modal-btn {
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
            cursor: pointer;
        }
        
        .modal-btn.primary {
            background: #ff0000;
            color: white;
        }
        
        .modal-btn.secondary {
            background: #cc0000;
            color: white;
        }
        
        .modal-btn.outline {
            background: transparent;
            color: rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(255, 0, 0, 0.5);
        }
        
        .modal-btn.outline:hover {
            background: rgba(255, 0, 0, 0.1);
            border-color: #ff0000;
        }
        
        .modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
            .modal-body {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 20px;
            }
            
            .modal-actions {
                flex-direction: column;
            }
            
            .modal-btn {
                justify-content: center;
            }
        }
    `;
    
    if (!document.querySelector('#modal-styles')) {
        style.id = 'modal-styles';
        document.head.appendChild(style);
    }
    
    return modal;
}

// 3D viewer modal logic (moved from index.html for maintainability)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.view-3d-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const glbPath = this.getAttribute('data-glb');
            let src = '';
            if (glbPath.startsWith('CW/')) {
                src = `https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/${glbPath.replace(' ', '%20')}`;
            } else if (glbPath.startsWith('HW/')) {
                src = `https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/${glbPath.replace(' ', '%20')}`;
            }
            document.getElementById('inline-model-viewer').setAttribute('src', src);
            document.getElementById('model-viewer-modal').style.display = 'flex';
        });
    });
    const closeBtn = document.getElementById('close-model-viewer');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('model-viewer-modal').style.display = 'none';
            document.getElementById('inline-model-viewer').removeAttribute('src');
        };
    }
});

// Add embedded card navigation for other project cards (Web, Mobile, Desktop)
function initEmbeddedProjectCard(cardId, sectionDefs) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const views = card.querySelectorAll('.sw-view');
    const tiles = card.querySelectorAll('.sw-tile');
    const backButtons = card.querySelectorAll('.sw-back');
    const modeBtns = card.querySelectorAll('.sw-mode-btn');
    let current = sectionDefs[0].view;

    function showView(name) {
        current = name;
        views.forEach(v => {
            const match = v.getAttribute('data-view') === name;
            if (match) {
                v.removeAttribute('hidden');
                v.classList.add('active-sw-view');
            } else {
                v.setAttribute('hidden', '');
                v.classList.remove('active-sw-view');
            }
        });
        modeBtns.forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === name || (name !== sectionDefs[1].view && name !== sectionDefs[2].view && target === sectionDefs[0].view)) {
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.removeAttribute('aria-current');
            }
        });
    }
    tiles.forEach(t => t.addEventListener('click', (e) => {
        const target = t.getAttribute('data-target');
        if (target === 'cw' || target === 'hw') {
            e.preventDefault();
            e.stopPropagation();
            openSolidworksWindow(target);
            return false;
        } else if (target) {
            showView(target);
        }
    }));
    backButtons.forEach(b => b.addEventListener('click', () => {
        const back = b.getAttribute('data-back');
        if (back) showView(back);
    }));
    modeBtns.forEach(mb => mb.addEventListener('click', () => {
        const target = mb.getAttribute('data-target');
        if (target) showView(target);
    }));
    card.addEventListener('keydown', e => {
        if (e.key === 'Escape' && current !== sectionDefs[0].view) {
            showView(sectionDefs[0].view);
        }
        if (e.target.classList.contains('sw-mode-btn')) {
            const btnArray = Array.from(modeBtns);
            const idx = btnArray.indexOf(e.target);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                const next = btnArray[(idx + 1) % btnArray.length];
                next.focus();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                const prev = btnArray[(idx - 1 + btnArray.length) % btnArray.length];
                prev.focus();
                e.preventDefault();
            } else if (e.key === 'Home') { btnArray[0].focus(); e.preventDefault(); }
            else if (e.key === 'End') { btnArray[btnArray.length - 1].focus(); e.preventDefault(); }
        }
        if (e.target.classList.contains('sw-tile') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            if (target) showView(target);
        }
    });
    tiles.forEach(t => { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0'); });
    function addRipple(e) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'sw-ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    }
    [...tiles, ...modeBtns].forEach(el => {
        el.addEventListener('click', addRipple);
    });
    showView(sectionDefs[0].view);
}

// Initialize embedded navigation for Web, Mobile, Desktop cards
document.addEventListener('DOMContentLoaded', function () {
    // Web Projects Card
    initEmbeddedProjectCard('web-projects-card', [
        { view: 'web-root' }, { view: 'web-list' }
    ]);
    // Mobile Projects Card
    initEmbeddedProjectCard('mobile-projects-card', [
        { view: 'mobile-root' }, { view: 'mobile-list' }
    ]);
    // Desktop Projects Card
    initEmbeddedProjectCard('desktop-projects-card', [
        { view: 'desktop-root' }, { view: 'desktop-list' }
    ]);
});

/**
 * 🎨 TECH STACK INTERACTIVE SHOWCASE
 * Dynamic interactive technology badges with animations
 */
window.initTechBadges = function() {
    const techBadges = document.querySelectorAll('.tech-badge');
    
    if (techBadges.length === 0) {
        console.log('⏭️ No tech badges found');
        return;
    }

    // Add click interaction for each badge
    techBadges.forEach((badge, index) => {
        const techName = badge.dataset.tech;
        const icon = badge.querySelector('.tech-icon i');
        
        // Staggered entrance animation
        setTimeout(() => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            badge.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                badge.style.opacity = '1';
                badge.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);

        // Click to show tech info
        badge.addEventListener('click', () => {
            const techInfo = {
                solidworks: { title: 'SOLIDWORKS', desc: 'Professional 3D CAD Design Software' },
                cad: { title: '3D CAD Modeling', desc: 'Advanced 3D Design & Engineering' },
                simulation: { title: 'FEA Simulation', desc: 'Structural & Thermal Analysis' },
                rendering: { title: 'PhotoView 360', desc: 'Professional Rendering & Visualization' },
                assembly: { title: 'Assembly Design', desc: 'Complex Multi-Part Systems' }
            };

            const info = techInfo[techName];
            if (info) {
                // Create toast notification
                showTechToast(info.title, info.desc);
            }

            // Add ripple effect
            createRipple(badge, event);
        });

        // Continuous pulse animation on hover
        badge.addEventListener('mouseenter', () => {
            if (icon) {
                icon.style.animation = 'techIconPulse 0.6s ease-in-out';
            }
        });

        badge.addEventListener('mouseleave', () => {
            if (icon) {
                icon.style.animation = '';
            }
        });
    });

    console.log(`✅ ${techBadges.length} tech badges initialized`);
};

// Create ripple effect on click
function createRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 0, 0, 0.4);
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        animation: rippleEffect 0.6s ease-out;
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Show tech information toast
function showTechToast(title, description) {
    // Remove existing toast
    const existingToast = document.querySelector('.tech-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'tech-toast';
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${description}</div>
        </div>
    `;

    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, rgba(40, 0, 0, 0.95), rgba(20, 0, 0, 0.9));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 0, 0, 0.4);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 10px 40px rgba(255, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideInToast 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 300px;
    `;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Add required CSS animations
const techStackStyle = document.createElement('style');
techStackStyle.textContent = `
    @keyframes techIconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    @keyframes rippleEffect {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
    }

    @keyframes slideInToast {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutToast {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }

    .toast-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(150, 0, 0, 0.2));
        border-radius: 50%;
        color: #ff3333;
        font-size: 1.3rem;
    }

    .toast-content {
        flex: 1;
    }

    .toast-title {
        font-family: 'Source Sans Pro', sans-serif;
        font-weight: 600;
        color: #ffffff;
        font-size: 1rem;
        margin-bottom: 0.25rem;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    }

    .toast-desc {
        font-family: 'Source Sans Pro', sans-serif;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }
`;
document.head.appendChild(techStackStyle);

// Initialize tech badges on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.initTechBadges();
    }, 500);
    
    // Auto-update check for GitHub changes
    startAutoUpdateCheck();
});

console.log('✅ Tech badge system loaded');

// Auto-update functionality to keep website in sync with GitHub
let lastCommitSHA = null;
let autoUpdateInterval = null;

async function checkForGitHubUpdates() {
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const headers = getGitHubHeaders();
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/main`, { headers });
        if (!response.ok) return;
        
        const commit = await response.json();
        const currentSHA = commit.sha;
        
        if (lastCommitSHA === null) {
            // First check, just store the SHA
            lastCommitSHA = currentSHA;
            console.log('📌 Initial commit SHA stored:', currentSHA.substring(0, 7));
        } else if (lastCommitSHA !== currentSHA) {
            // New commit detected!
            console.log('🔄 New GitHub commit detected:', currentSHA.substring(0, 7));
            lastCommitSHA = currentSHA;
            
            // Show update notification
            showUpdateNotification(commit.commit.message);
            
            // Refresh any open SOLIDWORKS windows
            refreshOpenSolidworksWindows();
        }
    } catch (error) {
        console.error('Auto-update check failed:', error);
    }
}

function showUpdateNotification(commitMessage) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 30px;
        background: linear-gradient(135deg, rgba(0, 100, 0, 0.95), rgba(0, 60, 0, 0.9));
        backdrop-filter: blur(20px);
        border: 2px solid rgba(0, 255, 0, 0.5);
        border-radius: 12px;
        padding: 1.2rem 1.8rem;
        display: flex;
        align-items: center;
        gap: 1.2rem;
        box-shadow: 0 10px 40px rgba(0, 255, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.5);
        z-index: 10001;
        animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 350px;
        max-width: 500px;
    `;
    
    notification.innerHTML = `
        <div style="
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(0, 255, 0, 0.3), rgba(0, 150, 0, 0.2));
            border-radius: 50%;
            color: #00ff00;
            font-size: 1.6rem;
        ">
            <i class="fas fa-sync-alt fa-spin"></i>
        </div>
        <div style="flex: 1;">
            <div style="
                font-family: 'Source Sans Pro', sans-serif;
                font-weight: 700;
                color: #ffffff;
                font-size: 1.1rem;
                margin-bottom: 0.4rem;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
            ">
                🎉 GitHub Updated!
            </div>
            <div style="
                font-family: 'Source Sans Pro', sans-serif;
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.9);
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
            ">
                ${commitMessage.substring(0, 60)}${commitMessage.length > 60 ? '...' : ''}
            </div>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0.5rem;
            transition: color 0.3s;
        " onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => notification.remove(), 500);
    }, 8000);
}

function refreshOpenSolidworksWindows() {
    // Check if CW window is open
    const cwModal = document.getElementById('solidworksCWModal');
    if (cwModal) {
        refreshSolidworksContent('cw');
    }
    
    // Check if HW window is open
    const hwModal = document.getElementById('solidworksHWModal');
    if (hwModal) {
        refreshSolidworksContent('hw');
    }
}

function startAutoUpdateCheck() {
    // Check every 30 seconds for updates
    autoUpdateInterval = setInterval(checkForGitHubUpdates, 30000);
    
    // Initial check after 5 seconds
    setTimeout(checkForGitHubUpdates, 5000);
    
    console.log('🔄 Auto-update system started (checking every 30s)');
}

function stopAutoUpdateCheck() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
        console.log('⏸️ Auto-update system stopped');
    }
}

// Add CSS animations for notifications
const updateAnimStyle = document.createElement('style');
updateAnimStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(500px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(500px); opacity: 0; }
    }
`;
document.head.appendChild(updateAnimStyle);

// Central Upload System Functions (for Auto-Update card)
function openCentralUpload(type) {
    const token = getGitHubToken();
    if (!token) {
        showUploadDialog(type, 'needToken');
        return;
    }
    
    showFileUploadForm(type, 'new');
}

function openCentralUpdate() {
    const token = getGitHubToken();
    if (!token) {
        showCentralTokenDialog('update');
        return;
    }
    
    showCentralUpdateDialog();
}

function openCentralDelete() {
    const token = getGitHubToken();
    if (!token) {
        showCentralTokenDialog('delete');
        return;
    }
    
    showCentralDeleteDialog();
}

// Central token dialog for update/delete
function showCentralTokenDialog(action) {
    const actionText = action === 'update' ? 'Update Files' : 'Delete Files';
    
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay';
    dialog.innerHTML = `
        <div class="upload-dialog">
            <div class="upload-header">
                <h3><i class="fas fa-key"></i> GitHub Token Required</h3>
                <button class="upload-close" onclick="closeUploadDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="upload-body">
                <div class="token-needed">
                    <i class="fas fa-key fa-3x"></i>
                    <h4>GitHub Personal Access Token Required</h4>
                    <p>To ${action} files, you need a GitHub token with 'repo' permission.</p>
                    
                    <div class="token-steps">
                        <h5>How to create a token:</h5>
                        <ol>
                            <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Tokens</a></li>
                            <li>Click "Generate new token (classic)"</li>
                            <li>Give it a name (e.g., "SOLIDWORKS Management")</li>
                            <li>Select scope: <strong>repo</strong> (Full control of private repositories)</li>
                            <li>Click "Generate token"</li>
                            <li>Copy the token and paste it below</li>
                        </ol>
                    </div>
                    
                    <div class="token-input-group">
                        <input type="password" id="centralTokenInput" placeholder="Paste your GitHub token here" />
                        <button class="btn-save-token" onclick="saveCentralToken('${action}')">
                            <i class="fas fa-save"></i> Save & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
}

// Save central token
function saveCentralToken(action) {
    const input = document.getElementById('centralTokenInput');
    const token = input.value.trim();
    
    if (!token) {
        alert('Please enter a valid GitHub token');
        return;
    }
    
    setGitHubToken(token);
    closeUploadDialog();
    
    setTimeout(() => {
        if (action === 'update') {
            showCentralUpdateDialog();
        } else if (action === 'delete') {
            showCentralDeleteDialog();
        }
    }, 400);
}

// Central update dialog
function showCentralUpdateDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay';
    dialog.innerHTML = `
        <div class="upload-dialog upload-dialog-large">
            <div class="upload-header">
                <h3><i class="fas fa-edit"></i> Update SOLIDWORKS Files</h3>
                <button class="upload-close" onclick="closeUploadDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="upload-body">
                <div class="upload-form">
                    <div class="form-group">
                        <label><i class="fas fa-folder"></i> Select Type:</label>
                        <select id="centralUpdateType" class="form-control" onchange="loadCentralUpdateDays()">
                            <option value="">-- Choose Type --</option>
                            <option value="cw">Class Work (CW)</option>
                            <option value="hw">Home Work (HW)</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="centralUpdateDayGroup" style="display:none;">
                        <label><i class="fas fa-calendar"></i> Select Day:</label>
                        <select id="centralUpdateDay" class="form-control" onchange="loadCentralUpdateFiles()">
                            <option value="">-- Choose Day --</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="centralUpdateFileGroup" style="display:none;">
                        <label><i class="fas fa-file"></i> Select File to Update:</label>
                        <select id="centralUpdateFile" class="form-control">
                            <option value="">-- Choose File --</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="centralUpdateNewFileGroup" style="display:none;">
                        <label><i class="fas fa-upload"></i> Upload New Version:</label>
                        <input type="file" id="centralUpdateNewFile" class="form-control" />
                    </div>
                    
                    <div class="upload-actions" id="centralUpdateActions" style="display:none;">
                        <button class="btn-cancel" onclick="closeUploadDialog()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn-upload" onclick="performCentralUpdate()">
                            <i class="fas fa-sync-alt"></i> Update File
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
}

// Central delete dialog
function showCentralDeleteDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'uploadDialog';
    dialog.className = 'upload-dialog-overlay';
    dialog.innerHTML = `
        <div class="upload-dialog upload-dialog-large">
            <div class="upload-header">
                <h3><i class="fas fa-trash-alt"></i> Delete SOLIDWORKS Files</h3>
                <button class="upload-close" onclick="closeUploadDialog()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="upload-body">
                <div class="upload-form">
                    <div class="form-group">
                        <label><i class="fas fa-folder"></i> Select Type:</label>
                        <select id="centralDeleteType" class="form-control" onchange="loadCentralDeleteDays()">
                            <option value="">-- Choose Type --</option>
                            <option value="cw">Class Work (CW)</option>
                            <option value="hw">Home Work (HW)</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="centralDeleteDayGroup" style="display:none;">
                        <label><i class="fas fa-calendar"></i> Select Day:</label>
                        <select id="centralDeleteDay" class="form-control" onchange="loadCentralDeleteFiles()">
                            <option value="">-- Choose Day --</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="centralDeleteFileGroup" style="display:none;">
                        <label><i class="fas fa-file"></i> Select File to Delete:</label>
                        <select id="centralDeleteFile" class="form-control">
                            <option value="">-- Choose File --</option>
                        </select>
                    </div>
                    
                    <div class="delete-warning" id="centralDeleteWarning" style="display:none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p><strong>Warning:</strong> This action cannot be undone! The file will be permanently deleted from GitHub.</p>
                    </div>
                    
                    <div class="upload-actions" id="centralDeleteActions" style="display:none;">
                        <button class="btn-cancel" onclick="closeUploadDialog()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn-delete" onclick="performCentralDelete()">
                            <i class="fas fa-trash"></i> Delete File
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    setTimeout(() => dialog.classList.add('show'), 10);
}

// Load days for central update
async function loadCentralUpdateDays() {
    const typeSelect = document.getElementById('centralUpdateType');
    const type = typeSelect.value;
    
    if (!type) {
        document.getElementById('centralUpdateDayGroup').style.display = 'none';
        document.getElementById('centralUpdateFileGroup').style.display = 'none';
        document.getElementById('centralUpdateNewFileGroup').style.display = 'none';
        document.getElementById('centralUpdateActions').style.display = 'none';
        return;
    }
    
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const token = getGitHubToken();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load days');
        
        const items = await response.json();
        const days = items.filter(item => item.type === 'dir' && item.name.startsWith('Day'));
        
        const daySelect = document.getElementById('centralUpdateDay');
        daySelect.innerHTML = '<option value="">-- Choose Day --</option>';
        days.forEach(day => {
            daySelect.innerHTML += `<option value="${day.name}">${day.name}</option>`;
        });
        
        document.getElementById('centralUpdateDayGroup').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading days:', error);
        alert('Failed to load days');
    }
}

// Load files for central update
async function loadCentralUpdateFiles() {
    const typeSelect = document.getElementById('centralUpdateType');
    const daySelect = document.getElementById('centralUpdateDay');
    const fileSelect = document.getElementById('centralUpdateFile');
    
    const type = typeSelect.value;
    const day = daySelect.value;
    
    if (!day) {
        document.getElementById('centralUpdateFileGroup').style.display = 'none';
        document.getElementById('centralUpdateNewFileGroup').style.display = 'none';
        document.getElementById('centralUpdateActions').style.display = 'none';
        return;
    }
    
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const token = getGitHubToken();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/${day}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        
        fileSelect.innerHTML = '<option value="">-- Choose File --</option>';
        files.forEach(file => {
            if (file.type === 'file') {
                fileSelect.innerHTML += `<option value="${file.name}" data-sha="${file.sha}">${file.name}</option>`;
            }
        });
        
        document.getElementById('centralUpdateFileGroup').style.display = 'block';
        
        fileSelect.onchange = () => {
            if (fileSelect.value) {
                document.getElementById('centralUpdateNewFileGroup').style.display = 'block';
                document.getElementById('centralUpdateActions').style.display = 'flex';
            } else {
                document.getElementById('centralUpdateNewFileGroup').style.display = 'none';
                document.getElementById('centralUpdateActions').style.display = 'none';
            }
        };
        
    } catch (error) {
        console.error('Error loading files:', error);
        alert('Failed to load files');
    }
}

// Perform central update
async function performCentralUpdate() {
    const typeSelect = document.getElementById('centralUpdateType');
    const daySelect = document.getElementById('centralUpdateDay');
    const fileSelect = document.getElementById('centralUpdateFile');
    const fileInput = document.getElementById('centralUpdateNewFile');
    
    const type = typeSelect.value;
    const day = daySelect.value;
    const oldFileName = fileSelect.value;
    const newFile = fileInput.files[0];
    
    if (!type || !day || !oldFileName || !newFile) {
        alert('Please fill all fields');
        return;
    }
    
    const selectedOption = fileSelect.options[fileSelect.selectedIndex];
    const sha = selectedOption.getAttribute('data-sha');
    const token = getGitHubToken();
    
    showUploadProgress('Updating file...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        const path = `${folderPath}/${day}/${oldFileName}`;
        const content = await readFileAsBase64(newFile);
        
        const uploadData = {
            message: `Update ${oldFileName} in ${type.toUpperCase()} ${day}`,
            content: content,
            sha: sha,
            branch: 'main'
        };
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        if (response.ok) {
            closeUploadDialog();
            showToast('Success', 'File updated successfully!');
        } else {
            throw new Error('Update failed: ' + await response.text());
        }
        
    } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update file: ' + error.message);
        closeUploadDialog();
    }
}

// Load days for central delete
async function loadCentralDeleteDays() {
    const typeSelect = document.getElementById('centralDeleteType');
    const type = typeSelect.value;
    
    if (!type) {
        document.getElementById('centralDeleteDayGroup').style.display = 'none';
        document.getElementById('centralDeleteFileGroup').style.display = 'none';
        document.getElementById('centralDeleteWarning').style.display = 'none';
        document.getElementById('centralDeleteActions').style.display = 'none';
        return;
    }
    
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const token = getGitHubToken();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load days');
        
        const items = await response.json();
        const days = items.filter(item => item.type === 'dir' && item.name.startsWith('Day'));
        
        const daySelect = document.getElementById('centralDeleteDay');
        daySelect.innerHTML = '<option value="">-- Choose Day --</option>';
        days.forEach(day => {
            daySelect.innerHTML += `<option value="${day.name}">${day.name}</option>`;
        });
        
        document.getElementById('centralDeleteDayGroup').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading days:', error);
        alert('Failed to load days');
    }
}

// Load files for central delete
async function loadCentralDeleteFiles() {
    const typeSelect = document.getElementById('centralDeleteType');
    const daySelect = document.getElementById('centralDeleteDay');
    const fileSelect = document.getElementById('centralDeleteFile');
    
    const type = typeSelect.value;
    const day = daySelect.value;
    
    if (!day) {
        document.getElementById('centralDeleteFileGroup').style.display = 'none';
        document.getElementById('centralDeleteWarning').style.display = 'none';
        document.getElementById('centralDeleteActions').style.display = 'none';
        return;
    }
    
    const owner = 'Akhinoor14';
    const repo = 'SOLIDWORKS-Projects';
    const folderPath = type === 'cw' ? 'CW' : 'HW';
    const token = getGitHubToken();
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/${day}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        
        fileSelect.innerHTML = '<option value="">-- Choose File --</option>';
        files.forEach(file => {
            if (file.type === 'file') {
                fileSelect.innerHTML += `<option value="${file.name}" data-sha="${file.sha}">${file.name}</option>`;
            }
        });
        
        document.getElementById('centralDeleteFileGroup').style.display = 'block';
        
        fileSelect.onchange = () => {
            if (fileSelect.value) {
                document.getElementById('centralDeleteWarning').style.display = 'block';
                document.getElementById('centralDeleteActions').style.display = 'flex';
            } else {
                document.getElementById('centralDeleteWarning').style.display = 'none';
                document.getElementById('centralDeleteActions').style.display = 'none';
            }
        };
        
    } catch (error) {
        console.error('Error loading files:', error);
        alert('Failed to load files');
    }
}

// Perform central delete
async function performCentralDelete() {
    const typeSelect = document.getElementById('centralDeleteType');
    const daySelect = document.getElementById('centralDeleteDay');
    const fileSelect = document.getElementById('centralDeleteFile');
    
    const type = typeSelect.value;
    const day = daySelect.value;
    const fileName = fileSelect.value;
    
    if (!type || !day || !fileName) {
        alert('Please select a file to delete');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone!`)) {
        return;
    }
    
    const selectedOption = fileSelect.options[fileSelect.selectedIndex];
    const sha = selectedOption.getAttribute('data-sha');
    const token = getGitHubToken();
    
    showUploadProgress('Deleting file...');
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type === 'cw' ? 'CW' : 'HW';
        const path = `${folderPath}/${day}/${fileName}`;
        
        const deleteData = {
            message: `Delete ${fileName} from ${type.toUpperCase()} ${day}`,
            sha: sha,
            branch: 'main'
        };
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteData)
        });
        
        if (response.ok) {
            closeUploadDialog();
            showToast('Success', 'File deleted successfully!');
        } else {
            throw new Error('Delete failed: ' + await response.text());
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete file: ' + error.message);
        closeUploadDialog();
    }
}

// Make central functions globally accessible
window.openCentralUpload = openCentralUpload;
window.openCentralUpdate = openCentralUpdate;
window.openCentralDelete = openCentralDelete;
window.saveCentralToken = saveCentralToken;
window.loadCentralUpdateDays = loadCentralUpdateDays;
window.loadCentralUpdateFiles = loadCentralUpdateFiles;
window.performCentralUpdate = performCentralUpdate;
window.loadCentralDeleteDays = loadCentralDeleteDays;
window.loadCentralDeleteFiles = loadCentralDeleteFiles;
window.performCentralDelete = performCentralDelete;




