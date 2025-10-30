// CV Viewer Fix - Replace lines 6348-6420 in script.js

// Open CV Viewer as In-Page Overlay
let __cvZoom = 100;
function openCVViewer() {
    try {
        console.log('🔍 Opening CV viewer...');
        
        // If overlay already exists, just show
        let overlay = document.getElementById('cv-overlay');
        if (!overlay) {
            console.log('📄 Creating CV overlay...');
            overlay = document.createElement('div');
            overlay.id = 'cv-overlay';
            overlay.className = 'cv-overlay';
            overlay.innerHTML = `
                <div class="cv-modal" role="dialog" aria-label="CV Viewer" aria-modal="true">
                    <div class="cv-modal-header">
                        <div class="cv-modal-title">
                            <div class="cv-title-icon"><i class="fas fa-file-pdf"></i></div>
                            <div>
                                <div style="font-weight:700;">Curriculum Vitae</div>
                                <div style="font-size:12px;opacity:.7;">Md Akhinoor Islam</div>
                            </div>
                        </div>
                        <div class="cv-modal-actions">
                            <button class="cv-action" onclick="window.cvPrint()"><i class="fas fa-print"></i><span>Print</span></button>
                            <button class="cv-action primary" onclick="window.cvDownload()"><i class="fas fa-download"></i><span>Download</span></button>
                            <button class="cv-action" onclick="window.cvToggleFullscreen()"><i class="fas fa-expand" id="cv-fullscreen-icon"></i><span>Fullscreen</span></button>
                            <button class="cv-action round" onclick="window.closeCVViewer()" title="Close (Esc)"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="cv-modal-body">
                        <div class="cv-iframe-wrap" id="cv-iframe-wrap">
                            <div class="cv-loading" id="cv-loading" style="position:absolute;inset:0;display:grid;place-items:center;background:#0a0a0a;color:#fff;z-index:10;">
                                <div style="text-align:center;">
                                    <i class="fas fa-spinner fa-spin" style="font-size:3rem;color:#ff0000;margin-bottom:1rem;"></i>
                                    <p style="font-size:1.1rem;">Loading CV...</p>
                                </div>
                            </div>
                            <iframe class="cv-iframe" id="cv-iframe" title="CV PDF" style="display:none;"></iframe>
                        </div>
                        <div class="cv-zoom-controls">
                            <button class="cv-action round" onclick="window.cvZoomOut()" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
                            <div class="cv-zoom-level" id="cv-zoom-level">100%</div>
                            <button class="cv-action round" onclick="window.cvZoomIn()" title="Zoom In"><i class="fas fa-search-plus"></i></button>
                            <button class="cv-action round" onclick="window.cvZoomReset()" title="Reset Zoom"><i class="fas fa-redo"></i></button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Load PDF and show overlay
        const pdfPath = './CV/2313014 CV.pdf';
        const pdfSrc = pdfPath + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH';
        const iframe = overlay.querySelector('#cv-iframe');
        const loading = overlay.querySelector('#cv-loading');
        
        console.log('📄 Loading PDF:', pdfPath);
        
        if (iframe) {
            // Always set src to ensure reload
            iframe.src = pdfSrc;
            
            // Show loading, hide iframe initially
            if (loading) loading.style.display = 'grid';
            iframe.style.display = 'none';
            
            // Handle successful load
            iframe.onload = function() {
                console.log('✅ PDF loaded successfully');
                if (loading) loading.style.display = 'none';
                iframe.style.display = 'block';
            };
            
            // Handle load errors
            iframe.onerror = function() {
                console.error('❌ PDF failed to load');
                if (loading) {
                    loading.innerHTML = `
                        <div style="text-align:center;padding:2rem;">
                            <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#ff0000;margin-bottom:1rem;"></i>
                            <p style="font-size:1.2rem;margin-bottom:0.5rem;color:#fff;">Unable to load PDF</p>
                            <p style="font-size:0.9rem;opacity:0.7;margin-bottom:1.5rem;color:#fff;">Your browser may not support embedded PDFs</p>
                            <button class="cv-action primary" onclick="window.cvDownload()" style="margin:0 auto;cursor:pointer;">
                                <i class="fas fa-download"></i> Download CV Instead
                            </button>
                        </div>
                    `;
                }
            };
            
            // Timeout fallback - if PDF doesn't load in 5 seconds
            setTimeout(() => {
                if (loading && loading.style.display !== 'none') {
                    console.warn('⚠️ PDF taking too long to load, showing fallback');
                    // Check if iframe actually loaded
                    try {
                        if (!iframe.contentDocument && !iframe.contentWindow) {
                            throw new Error('PDF blocked');
                        }
                    } catch (e) {
                        loading.innerHTML = `
                            <div style="text-align:center;padding:2rem;">
                                <i class="fas fa-clock" style="font-size:3rem;color:#ff0000;margin-bottom:1rem;"></i>
                                <p style="font-size:1.2rem;margin-bottom:0.5rem;color:#fff;">PDF taking too long to load</p>
                                <p style="font-size:0.9rem;opacity:0.7;margin-bottom:1.5rem;color:#fff;">You can download it instead</p>
                                <button class="cv-action primary" onclick="window.cvDownload()" style="margin:0 auto;cursor:pointer;">
                                    <i class="fas fa-download"></i> Download CV
                                </button>
                            </div>
                        `;
                    }
                }
            }, 5000);
        }
        
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        __cvZoom = 100; 
        updateCVZoom();

        // Keyboard shortcuts
        document.addEventListener('keydown', __cvKeyHandler);

        // Button feedback
        try {
            const btn = event && event.target ? event.target.closest('.btn-view-cv') : null;
            if (btn) {
                const textEl = btn.querySelector('.btn-text');
                if (textEl) {
                    const originalText = textEl.textContent;
                    textEl.textContent = 'Opening... ✓';
                    setTimeout(() => { textEl.textContent = originalText; }, 1500);
                }
            }
        } catch (e) {
            console.warn('Button feedback error:', e);
        }
        
    } catch (e) {
        console.error('CV overlay error:', e);
        alert('Unable to open CV viewer. Downloading instead...');
        window.cvDownload();
    }
}

function closeCVViewer() {
    console.log('🚫 Closing CV viewer');
    const overlay = document.getElementById('cv-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', __cvKeyHandler);
    }
}

function cvPrint() {
    console.log('🖨️ Printing CV');
    const iframe = document.getElementById('cv-iframe');
    try { 
        iframe.contentWindow.print(); 
    } catch (e) { 
        console.warn('Print from iframe failed, using window.print');
        window.print(); 
    }
}

function cvDownload() {
    console.log('⬇️ Downloading CV');
    const a = document.createElement('a');
    a.href = './CV/2313014 CV.pdf';
    a.download = 'Md_Akhinoor_Islam_CV.pdf';
    a.style.display = 'none';
    document.body.appendChild(a); 
    a.click(); 
    setTimeout(() => a.remove(), 100);
}

function cvToggleFullscreen() {
    const modal = document.querySelector('.cv-modal');
    if (!modal) return;
    const icon = document.getElementById('cv-fullscreen-icon');
    
    // Toggle fullscreen class instead of browser fullscreen
    if (!modal.classList.contains('fullscreen')) {
        modal.classList.add('fullscreen');
        if (icon) icon.className = 'fas fa-compress';
        console.log('📺 Modal fullscreen enabled');
    } else {
        modal.classList.remove('fullscreen');
        if (icon) icon.className = 'fas fa-expand';
        console.log('📺 Modal fullscreen disabled');
    }
}

function cvZoomIn() { 
    __cvZoom = Math.min(200, __cvZoom + 10); 
    updateCVZoom(); 
    console.log('🔍 Zoom in:', __cvZoom + '%');
}

function cvZoomOut() { 
    __cvZoom = Math.max(50, __cvZoom - 10); 
    updateCVZoom(); 
    console.log('🔍 Zoom out:', __cvZoom + '%');
}

function cvZoomReset() { 
    __cvZoom = 100; 
    updateCVZoom(); 
    console.log('🔍 Zoom reset: 100%');
}

function updateCVZoom() {
    const wrap = document.getElementById('cv-iframe-wrap');
    if (!wrap) return;
    wrap.style.zoom = __cvZoom + '%';
    const level = document.getElementById('cv-zoom-level');
    if (level) level.textContent = __cvZoom + '%';
}

function __cvKeyHandler(e) {
    // Escape closes the viewer (or exits modal fullscreen first)
    if (e.key === 'Escape') {
        const modal = document.querySelector('.cv-modal');
        if (modal && modal.classList.contains('fullscreen')) {
            // Exit modal fullscreen first
            cvToggleFullscreen();
        } else {
            // Close viewer
            closeCVViewer();
        }
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { 
        e.preventDefault(); 
        cvPrint(); 
        return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) { 
        e.preventDefault(); 
        cvZoomIn(); 
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') { 
        e.preventDefault(); 
        cvZoomOut(); 
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '0') { 
        e.preventDefault(); 
        cvZoomReset(); 
        return;
    }
}

// Expose controls globally
window.openCVViewer = openCVViewer;
window.closeCVViewer = closeCVViewer;
window.cvPrint = cvPrint;
window.cvDownload = cvDownload;
window.cvToggleFullscreen = cvToggleFullscreen;
window.cvZoomIn = cvZoomIn;
window.cvZoomOut = cvZoomOut;
window.cvZoomReset = cvZoomReset;
