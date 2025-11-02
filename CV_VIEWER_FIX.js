// CV Viewer - Simple & Working Solution
// Opens CV PDF directly in new tab (no complex modal)

// Global variable for compatibility
let __cvZoom = 100;

/**
 * Open CV in new browser tab
 * - Shows PDF directly in browser's built-in PDF viewer
 * - No complex modal or iframe issues  
 * - Works on all modern browsers
 */
function openCVViewer() {
    try {
        console.log('📄 Opening CV in new tab...');
        
        // CV file path (relative to website root)
        const pdfPath = './CV/2313014 CV.pdf';
        
        // Open PDF in new tab
        const newTab = window.open(pdfPath, '_blank');
        
        if (newTab) {
            // Successfully opened in new tab
            newTab.focus();
            console.log('✅ CV opened successfully in new tab');
        } else {
            // Popup was blocked
            console.warn('⚠️ Popup blocked by browser');
            
            // Show helpful message
            if (confirm('Popup blocked! Click OK to open CV in current tab, or Cancel to stay here.')) {
                // User wants to open in same tab
                window.location.href = pdfPath;
            }
        }
        
    } catch (error) {
        console.error('❌ Error opening CV:', error);
        
        // Fallback: offer download
        if (confirm('Unable to open CV viewer. Would you like to download it instead?')) {
            cvDownload();
        }
    }
}

/**
 * Download CV file
 */
function cvDownload() {
    try {
        console.log('⬇️ Downloading CV...');
        
        const a = document.createElement('a');
        a.href = './CV/2313014 CV.pdf';
        a.download = 'Md_Akhinoor_Islam_CV.pdf';
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            console.log('✅ CV download initiated');
        }, 100);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Unable to download CV. Please try again.');
    }
}

// Legacy compatibility - no-op functions (for backward compatibility)
function closeCVViewer() { console.log('ℹ️ Close not needed - CV opens in new tab'); }
function cvPrint() { console.log('ℹ️ Use browser print in CV tab'); }
function cvToggleFullscreen() { console.log('ℹ️ Use F11 for fullscreen in CV tab'); }
function cvZoomIn() { console.log('ℹ️ Use Ctrl + Plus to zoom in CV tab'); }
function cvZoomOut() { console.log('ℹ️ Use Ctrl + Minus to zoom in CV tab'); }
function cvZoomReset() { console.log('ℹ️ Use Ctrl + 0 to reset zoom in CV tab'); }

// Export globally
window.openCVViewer = openCVViewer;
window.closeCVViewer = closeCVViewer;
window.cvDownload = cvDownload;
window.cvPrint = cvPrint;
window.cvToggleFullscreen = cvToggleFullscreen;
window.cvZoomIn = cvZoomIn;
window.cvZoomOut = cvZoomOut;
window.cvZoomReset = cvZoomReset;

console.log('✅ CV Viewer loaded - Simple new tab mode');
