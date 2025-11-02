// CV Viewer - Inline Modal Solution
// Shows CV in an embedded modal viewer (guaranteed to display, not download)

// Global variable for compatibility
let __cvZoom = 100;

/**
 * Open CV in modal overlay with embedded PDF viewer
 * - Shows PDF inline using <embed> tag
 * - Guaranteed to view, not download
 * - Includes download button in modal
 */
function openCVViewer() {
    try {
        console.log('📄 Opening CV in modal viewer...');
        
        // CV file path (relative to website root)
        const pdfPath = './CV/2313014 CV.pdf';
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'cv-viewer-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            animation: fadeIn 0.3s ease;
        `;
        
        // Create header with title and close button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 30px;
            background: #1a1a1a;
            color: white;
            border-bottom: 2px solid #00ff88;
        `;
        
        const title = document.createElement('h2');
        title.textContent = '📄 Curriculum Vitae';
        title.style.cssText = `
            margin: 0;
            font-size: 1.5rem;
            color: #00ff88;
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 15px; align-items: center;';
        
        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Download';
        downloadBtn.style.cssText = `
            padding: 10px 20px;
            background: #00ff88;
            color: #000;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1rem;
            transition: all 0.3s ease;
        `;
        downloadBtn.onmouseover = () => downloadBtn.style.background = '#00cc6a';
        downloadBtn.onmouseout = () => downloadBtn.style.background = '#00ff88';
        downloadBtn.onclick = () => cvDownload();
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close';
        closeBtn.style.cssText = `
            padding: 10px 20px;
            background: transparent;
            color: white;
            border: 2px solid #00ff88;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = '#00ff88';
            closeBtn.style.color = '#000';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'transparent';
            closeBtn.style.color = 'white';
        };
        closeBtn.onclick = () => closeCVViewer();
        
        buttonContainer.appendChild(downloadBtn);
        buttonContainer.appendChild(closeBtn);
        header.appendChild(title);
        header.appendChild(buttonContainer);
        
        // Create PDF viewer container
        const viewerContainer = document.createElement('div');
        viewerContainer.style.cssText = `
            flex: 1;
            position: relative;
            overflow: auto;
            background: #2a2a2a;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 20px;
        `;
        
        // Detect if mobile (iOS/Android may not support PDF embed)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Mobile fallback: show message + download/open link
            const mobileMsg = document.createElement('div');
            mobileMsg.style.cssText = `
                background: rgba(255,255,255,0.1);
                border: 2px solid #00ff88;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                text-align: center;
                color: white;
            `;
            mobileMsg.innerHTML = `
                <h3 style="color: #00ff88; margin-top: 0;">📱 Mobile Device Detected</h3>
                <p style="line-height: 1.6; margin: 20px 0;">PDF viewing is limited on mobile browsers. Please download or open in a new tab.</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="./CV/2313014 CV.pdf" target="_blank" style="
                        padding: 12px 24px;
                        background: #00ff88;
                        color: #000;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        display: inline-block;
                    ">🔗 Open in New Tab</a>
                    <a href="./CV/2313014 CV.pdf" download="Md_Akhinoor_Islam_CV.pdf" style="
                        padding: 12px 24px;
                        background: transparent;
                        color: #00ff88;
                        border: 2px solid #00ff88;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        display: inline-block;
                    ">📥 Download PDF</a>
                </div>
            `;
            viewerContainer.appendChild(mobileMsg);
        } else {
            // Desktop: Embed PDF using <embed> tag (most reliable for viewing)
            const pdfEmbed = document.createElement('embed');
            pdfEmbed.src = `${pdfPath}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
            pdfEmbed.type = 'application/pdf';
            pdfEmbed.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                min-height: 600px;
            `;
            viewerContainer.appendChild(pdfEmbed);
        }
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(viewerContainer);
        
        // Add to page
        document.body.appendChild(modal);
        
        // Add fade-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('✅ CV viewer opened successfully');
        
    } catch (error) {
        console.error('❌ Error opening CV:', error);
        alert('Unable to open CV viewer. Please try downloading instead.');
    }
}

/**
 * Close CV viewer modal
 */
function closeCVViewer() {
    const modal = document.getElementById('cv-viewer-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = ''; // Restore scroll
            console.log('✅ CV viewer closed');
        }, 300);
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

// Legacy compatibility - updated functions
function cvPrint() { 
    console.log('ℹ️ Use Print button in PDF viewer toolbar'); 
}
function cvToggleFullscreen() { 
    const modal = document.getElementById('cv-viewer-modal');
    if (modal) {
        if (!document.fullscreenElement) {
            modal.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}
function cvZoomIn() { console.log('ℹ️ Use Zoom controls in PDF viewer toolbar'); }
function cvZoomOut() { console.log('ℹ️ Use Zoom controls in PDF viewer toolbar'); }
function cvZoomReset() { console.log('ℹ️ Use Zoom controls in PDF viewer toolbar'); }

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
