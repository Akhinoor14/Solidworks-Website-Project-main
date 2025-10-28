/**
 * SOLIDWORKS Auto Upload Interface
 * Handles file upload, validation, and user interactions
 */

class SolidworksUploadInterface {
    constructor() {
        this.selectedFiles = new Map();
        this.requirements = {
            assembly: { required: false, found: false, extensions: ['.sldasm'] },
            parts: { required: false, found: false, extensions: ['.sldprt'] },
            screenshot: { required: false, found: false, extensions: ['.png', '.jpg', '.jpeg'] },
            guide: { required: false, found: false, extensions: ['.pdf'] }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateRequirements();
    }

    setupEventListeners() {
        // File input change
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        const uploadZone = document.getElementById('file-upload-zone');
        uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
        uploadZone.addEventListener('click', () => fileInput.click());

        // Radio button styling
        const radioItems = document.querySelectorAll('.radio-item');
        radioItems.forEach(item => {
            const radio = item.querySelector('input[type="radio"]');
            radio.addEventListener('change', () => this.updateRadioStyles());
        });

        // Form submission
        const form = document.getElementById('upload-form');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        clearBtn.addEventListener('click', () => this.clearAllFiles());

        // Form field changes
        this.setupFormValidation();
        
        // Check repository access on load
        this.checkRepositoryAccess();
        
        // Check system requirements
        this.checkSystemRequirements();
    }
    
    checkSystemRequirements() {
        // Check browser compatibility
        this.checkBrowserSupport();
        
        // Check internet connection
        this.checkNetworkConnection();
        
        // Initial token status (will be checked when token provided)
        this.updateTokenStatus('required');
    }
    
    checkBrowserSupport() {
        const browserStatus = document.getElementById('browser-status');
        const requiredFeatures = {
            'File API support': window.File && window.FileReader && window.FileList,
            'Fetch API support': window.fetch,
            'Promise support': window.Promise,
            'FormData support': window.FormData
        };
        
        const unsupported = Object.entries(requiredFeatures)
            .filter(([name, supported]) => !supported)
            .map(([name]) => name);
            
        if (unsupported.length === 0) {
            browserStatus.innerHTML = '✓ Compatible';
            browserStatus.style.color = '#4CAF50';
        } else {
            browserStatus.innerHTML = `❌ Missing: ${unsupported.join(', ')}`;
            browserStatus.style.color = '#f44336';
            this.showNotification(`Browser compatibility issues: ${unsupported.join(', ')}. Please use a modern browser.`, 'error');
        }
    }
    
    async checkNetworkConnection() {
        const networkStatus = document.getElementById('network-status');
        networkStatus.innerHTML = '⏳ Testing...';
        networkStatus.style.color = '#FF9800';
        
        try {
            // Test GitHub API connectivity
            const startTime = performance.now();
            const response = await fetch('https://api.github.com/octocat', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            
            if (response.ok) {
                networkStatus.innerHTML = `✓ Connected (${latency}ms)`;
                networkStatus.style.color = '#4CAF50';
            } else {
                throw new Error('GitHub API not accessible');
            }
        } catch (error) {
            networkStatus.innerHTML = '❌ Connection issues';
            networkStatus.style.color = '#f44336';
            console.warn('Network check failed:', error.message);
        }
    }
    
    updateTokenStatus(status, message = '') {
        const tokenStatus = document.getElementById('token-status');
        const repoAccessStatus = document.getElementById('repo-access-status');
        
        switch (status) {
            case 'required':
                tokenStatus.innerHTML = '❌ Required';
                tokenStatus.style.color = '#f44336';
                repoAccessStatus.innerHTML = '⏳ Waiting for token';
                repoAccessStatus.style.color = '#FF9800';
                break;
            case 'valid':
                tokenStatus.innerHTML = '✓ Valid token';
                tokenStatus.style.color = '#4CAF50';
                repoAccessStatus.innerHTML = '✓ Access confirmed';
                repoAccessStatus.style.color = '#4CAF50';
                break;
            case 'invalid':
                tokenStatus.innerHTML = '❌ Invalid token';
                tokenStatus.style.color = '#f44336';
                repoAccessStatus.innerHTML = '❌ Access denied';
                repoAccessStatus.style.color = '#f44336';
                if (message) {
                    this.showNotification(`Token issue: ${message}`, 'error');
                }
                break;
            case 'checking':
                tokenStatus.innerHTML = '⏳ Validating...';
                tokenStatus.style.color = '#FF9800';
                repoAccessStatus.innerHTML = '⏳ Checking access...';
                repoAccessStatus.style.color = '#FF9800';
                break;
        }
    }

    async checkRepositoryAccess() {
        const statusElement = document.getElementById('repo-status');
        statusElement.textContent = 'Checking...';
        statusElement.className = 'repo-status-checking';
        
        try {
            // Check if repository is accessible (without token for now)
            const response = await fetch('https://api.github.com/repos/Akhinoor14/SOLIDWORKS-Projects');
            
            if (response.ok) {
                statusElement.textContent = 'Public Access ✓';
                statusElement.className = 'repo-status-connected';
                
                const repoData = await response.json();
                console.log('Repository found:', repoData.full_name);
                
                // Show additional info
                const repoInfo = document.querySelector('.form-section p');
                if (repoInfo) {
                    repoInfo.innerHTML = `
                        Files will be uploaded to this repository automatically<br>
                        <small style="color: #888;">Last updated: ${new Date(repoData.updated_at).toLocaleDateString()}</small>
                    `;
                }
            } else {
                throw new Error('Repository not found or private');
            }
        } catch (error) {
            statusElement.textContent = 'Token Required';
            statusElement.className = 'repo-status-error';
            console.log('Repository check:', error.message);
        }
    }

    setupFormValidation() {
        const requiredFields = ['day-select', 'project-number'];
        const radioGroup = document.getElementsByName('project-type');

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => this.validateForm());
            } else {
                console.warn(`Element with ID '${fieldId}' not found in HTML`);
            }
        });

        radioGroup.forEach(radio => {
            radio.addEventListener('change', () => this.validateForm());
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadZone = document.getElementById('file-upload-zone');
        uploadZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadZone = document.getElementById('file-upload-zone');
        uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const uploadZone = document.getElementById('file-upload-zone');
        uploadZone.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        // Filter valid files
        const validExtensions = ['.sldasm', '.sldprt', '.png', '.jpg', '.jpeg', '.pdf'];
        const validFiles = files.filter(file => {
            const extension = this.getFileExtension(file.name);
            return validExtensions.includes(extension);
        });

        if (validFiles.length !== files.length) {
            this.showNotification('Some files were ignored due to unsupported file types.', 'warning');
        }

        // Add files to collection
        validFiles.forEach(file => {
            this.selectedFiles.set(file.name, file);
        });

        this.updateFilePreview();
        this.updateRequirements();
        this.validateForm();
    }

    updateFilePreview() {
        const filePreview = document.getElementById('file-preview');
        const fileList = document.getElementById('file-list');

        if (this.selectedFiles.size === 0) {
            filePreview.classList.remove('show');
            return;
        }

        filePreview.classList.add('show');
        fileList.innerHTML = '';

        this.selectedFiles.forEach((file, fileName) => {
            const li = document.createElement('li');
            li.className = 'file-item';

            const fileType = this.getFileType(fileName);
            const icon = this.getFileIcon(fileType);
            const size = this.formatFileSize(file.size);
            const status = this.getFileStatus(fileType);

            li.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">${icon}</span>
                    <div class="file-details">
                        <div class="file-name">${fileName}</div>
                        <div class="file-size">${size}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <span class="file-status">${status}</span>
                    <button type="button" onclick="uploadInterface.removeFile('${fileName}')" 
                            style="background: none; border: none; color: #dc3545; cursor: pointer; margin-left: 10px;">
                        ❌
                    </button>
                </div>
            `;

            fileList.appendChild(li);
        });
    }

    updateRequirements() {
        // Reset requirements
        Object.keys(this.requirements).forEach(key => {
            this.requirements[key].found = false;
        });

        // Check each file
        this.selectedFiles.forEach((file, fileName) => {
            const extension = this.getFileExtension(fileName);
            
            if (this.requirements.assembly.extensions.includes(extension)) {
                this.requirements.assembly.found = true;
            } else if (this.requirements.parts.extensions.includes(extension)) {
                this.requirements.parts.found = true;
            } else if (this.requirements.screenshot.extensions.includes(extension)) {
                this.requirements.screenshot.found = true;
            } else if (this.requirements.guide.extensions.includes(extension)) {
                this.requirements.guide.found = true;
            }
        });

        // Update UI
        this.updateRequirementStatus('assembly-status', this.requirements.assembly);
        this.updateRequirementStatus('parts-status', this.requirements.parts);
        this.updateRequirementStatus('screenshot-status', this.requirements.screenshot);
        this.updateRequirementStatus('guide-status', this.requirements.guide);
    }

    updateRequirementStatus(elementId, requirement) {
        const element = document.getElementById(elementId);
        
        if (!requirement.required) {
            element.textContent = '✅';
        } else if (requirement.found) {
            element.textContent = '✅';
        } else {
            element.textContent = '❌';
        }
    }

    validateForm() {
        const daySelect = document.getElementById('day-select').value;
        const projectType = document.querySelector('input[name="project-type"]:checked');
        const projectNumber = document.getElementById('project-number').value;
        
        // Check required fields
        const fieldsValid = daySelect && projectType && projectNumber;
        
        // Check if at least one file is selected (any type)
        const hasFiles = this.selectedFiles.size > 0;
        
        const isValid = fieldsValid && hasFiles;
        
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = !isValid;
        
        if (isValid) {
            uploadBtn.style.opacity = '1';
            uploadBtn.style.cursor = 'pointer';
        } else {
            uploadBtn.style.opacity = '0.6';
            uploadBtn.style.cursor = 'not-allowed';
        }
    }

    updateRadioStyles() {
        const radioItems = document.querySelectorAll('.radio-item');
        radioItems.forEach(item => {
            const radio = item.querySelector('input[type="radio"]');
            if (radio.checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    removeFile(fileName) {
        this.selectedFiles.delete(fileName);
        this.updateFilePreview();
        this.updateRequirements();
        this.validateForm();
    }

    clearAllFiles() {
        this.selectedFiles.clear();
        document.getElementById('file-input').value = '';
        this.updateFilePreview();
        this.updateRequirements();
        this.validateForm();
        this.showNotification('All files cleared!', 'info');
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateFormData()) {
            return;
        }
        
        // Show repository confirmation
        const repoConfirm = confirm(
            `📤 Ready to upload to GitHub!\n\n` +
            `Repository: Akhinoor14/SOLIDWORKS-Projects\n` +
            `Day: ${this.getFormData().dayNumber}\n` +
            `Type: ${this.getFormData().projectType}\n` +
            `Files: ${this.selectedFiles.size} files\n\n` +
            `Continue with upload?`
        );
        
        if (!repoConfirm) {
            this.showNotification('Upload cancelled by user', 'info');
            return;
        }

        const formData = this.getFormData();
        
        try {
            this.showProgressSection();
            await this.processUpload(formData);
        } catch (error) {
            console.error('Upload failed:', error);
            this.showNotification('Upload failed: ' + error.message, 'error');
            this.hideProgressSection();
        }
    }

    validateFormData() {
        const daySelect = document.getElementById('day-select').value;
        const projectType = document.querySelector('input[name="project-type"]:checked');
        const projectNumber = document.getElementById('project-number').value;
        
        if (!daySelect || !projectType || !projectNumber) {
            this.showNotification('Please fill in all required fields.', 'error');
            return false;
        }

        if (this.selectedFiles.size === 0) {
            this.showNotification('Please select at least one file to upload.', 'error');
            return false;
        }

        if (!this.requirements.screenshot.found) {
            this.showNotification('Screenshot file (.PNG/.JPG) is required.', 'error');
            return false;
        }

        return true;
    }

    getFormData() {
        return {
            day: document.getElementById('day-select').value,
            type: document.querySelector('input[name="project-type"]:checked').value,
            number: document.getElementById('project-number').value,
            files: Array.from(this.selectedFiles.values())
        };
    }

    async processUpload(formData) {
        try {
            // Step 1: Validate
            this.updateProgressStep('step-validate', 'active');
            this.updateProgressBar(5);
            this.updateProgressText('Validating files and form data...');
            
            // Initialize GitHub components
            const tokenManager = new GitHubTokenManager();
            const githubUploader = new GitHubUploader();
            const websiteUpdater = new WebsiteAutoUpdater();
            
            // Get or prompt for GitHub token
            try {
                const token = await tokenManager.promptForToken();
                githubUploader.setToken(token);
                
                // Validate GitHub access
                await githubUploader.validateAccess();
                this.updateProgressText('GitHub access validated successfully');
            } catch (error) {
                this.updateProgressStep('step-validate', 'error');
                throw new Error(`GitHub authentication failed: ${error.message}`);
            }
            
            this.updateProgressStep('step-validate', 'completed');
            
            // Step 2: GitHub Upload
            this.updateProgressStep('step-github', 'active');
            this.updateProgressBar(15);
            this.updateProgressText('Validating GitHub access...');
            
            // Get and validate GitHub token
            this.updateTokenStatus('checking');
            try {
                await githubUploader.getValidatedToken();
                this.updateTokenStatus('valid');
                this.showNotification('✅ GitHub token validated successfully!', 'success');
            } catch (error) {
                this.updateTokenStatus('invalid', error.message);
                this.showNotification(`❌ GitHub token validation failed: ${error.message}`, 'error');
                throw error;
            }
            
            this.updateProgressText('Starting upload to GitHub...');
            
            // Prepare project data with progress callback
            const projectData = {
                ...formData,
                onProgress: (progress, message) => {
                    // Map 0-90% to 15-70% for GitHub upload step
                    const mappedProgress = 15 + (progress * 0.55);
                    this.updateProgressBar(mappedProgress);
                    this.updateProgressText(message);
                }
            };
            
            const uploadResult = await githubUploader.uploadProject(projectData);
            
            this.updateProgressStep('step-github', 'completed');
            this.updateProgressStep('step-readme', 'completed'); // README is generated during upload
            
            // Step 3: Website Update
            this.updateProgressStep('step-website', 'active');
            this.updateProgressBar(80);
            this.updateProgressText('Updating website counters and navigation...');
            
            // Update website with new project data
            try {
                await websiteUpdater.updateAfterUpload(
                    formData.dayNumber,
                    formData.projectType, 
                    formData.projectNumber,
                    uploadResult.uploadedFiles,
                    uploadResult.folderUrl
                );
                this.showNotification('✅ Website updated successfully!', 'success');
            } catch (updateError) {
                console.warn('Website update failed:', updateError);
                this.showNotification('⚠️ Upload successful but website update failed. Please refresh manually.', 'warning');
                // Fallback: refresh the page to show updates
                console.log('Website updater not available, manual refresh may be needed');
            }
            
            this.updateProgressStep('step-website', 'completed');
            this.updateProgressBar(100);
            this.updateProgressText('Upload completed successfully!');
            
            // Trigger counter update after successful upload
            console.log('🔄 Triggering counter update after upload...');
            if (typeof window.refreshAllCounters === 'function') {
                setTimeout(() => {
                    window.refreshAllCounters();
                    console.log('✅ Counters refreshed after upload');
                }, 500);
            }
            
            // Notify other tabs about upload completion
            if (typeof window.broadcastUploadComplete === 'function') {
                window.broadcastUploadComplete();
            }
            
            // Show success message with actual results
            setTimeout(() => {
                this.showSuccessMessage(formData, uploadResult);
                this.resetForm();
            }, 1000);
            
        } catch (error) {
            console.error('Upload process failed:', error);
            
            // Update failed step
            const activeStep = document.querySelector('.progress-step.active');
            if (activeStep) {
                this.updateProgressStep(activeStep.id, 'error');
            }
            
            this.updateProgressText(`Upload failed: ${error.message}`);
            throw error; // Re-throw to be handled by the calling function
        }
    }

    showProgressSection() {
        const progressSection = document.getElementById('progress-section');
        progressSection.classList.add('show');
        
        // Reset progress
        this.updateProgressBar(0);
        this.resetProgressSteps();
    }

    hideProgressSection() {
        const progressSection = document.getElementById('progress-section');
        progressSection.classList.remove('show');
    }

    updateProgressStep(stepId, status) {
        const step = document.getElementById(stepId);
        const statusIcon = step.querySelector('.step-status');
        
        // Remove all status classes
        step.classList.remove('active', 'completed', 'error');
        
        if (status === 'active') {
            step.classList.add('active');
            statusIcon.textContent = '⏳';
        } else if (status === 'completed') {
            step.classList.add('completed');
            statusIcon.textContent = '✅';
        } else if (status === 'error') {
            step.classList.add('error');
            statusIcon.textContent = '❌';
        } else {
            statusIcon.textContent = '⏳';
        }
    }

    updateProgressBar(percentage) {
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = percentage + '%';
    }

    updateProgressText(text) {
        const progressText = document.getElementById('progress-text');
        progressText.textContent = text;
    }

    resetProgressSteps() {
        const steps = ['step-validate', 'step-github', 'step-readme', 'step-website'];
        steps.forEach(stepId => {
            this.updateProgressStep(stepId, 'waiting');
        });
    }

    showSuccessMessage(formData, uploadResult = null) {
        let message = `🎉 SUCCESS! 

${formData.type} ${formData.number} - Day ${formData.day.padStart(2, '0')} uploaded successfully!

✅ ${formData.files.length} files uploaded to GitHub
✅ README generated automatically  
✅ Website updated in real-time
✅ Counters and navigation refreshed`;

        if (uploadResult && uploadResult.folderUrl) {
            message += `

🔗 View on GitHub: ${uploadResult.folderUrl}
📁 Project folder created: ${uploadResult.folderPath}`;
        }

        message += `

Your project is now live and accessible!

🔄 Website will auto-refresh to show your new project...`;
        
        this.showNotification(message, 'success');
        
        // Trigger website refresh in main site
        this.triggerWebsiteRefresh();
        
        // Also create clickable links if available
        if (uploadResult && uploadResult.folderUrl) {
            setTimeout(() => {
                const linkMessage = `🌐 Quick Links:

• GitHub Folder: ${uploadResult.folderUrl}
• Repository: https://github.com/Akhinoor14/SOLIDWORKS-Projects
• Main Website: ../index.html (Auto-refreshing now!)

Click to open in new tab!`;
                
                if (confirm(linkMessage + '\n\nOpen GitHub folder now?')) {
                    window.open(uploadResult.folderUrl, '_blank');
                }
            }, 2000);
        }
    }

    resetForm() {
        // Reset form fields
        document.getElementById('upload-form').reset();
        
        // Clear files
        this.clearAllFiles();
        
        // Reset radio styles
        document.querySelectorAll('.radio-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Hide progress
        setTimeout(() => {
            this.hideProgressSection();
        }, 3000);
    }

    // Utility methods
    getFileExtension(fileName) {
        return '.' + fileName.split('.').pop().toLowerCase();
    }

    getFileType(fileName) {
        const extension = this.getFileExtension(fileName);
        
        if (extension === '.sldasm') return 'assembly';
        if (extension === '.sldprt') return 'part';
        if (['.png', '.jpg', '.jpeg'].includes(extension)) return 'screenshot';
        if (extension === '.pdf') return 'guide';
        
        return 'unknown';
    }

    getFileIcon(fileType) {
        const icons = {
            assembly: '📦',
            part: '🔧',
            screenshot: '📸',
            guide: '📄',
            unknown: '📄'
        };
        
        return icons[fileType] || '📄';
    }

    getFileStatus(fileType) {
        if (fileType === 'assembly' && this.requirements.assembly.found) return '✅';
        if (fileType === 'part' && this.requirements.parts.found) return '✅';
        if (fileType === 'screenshot' && this.requirements.screenshot.found) return '✅';
        if (fileType === 'guide') return '✅';
        
        return '⏳';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            border-radius: 10px;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            white-space: pre-line;
            font-family: inherit;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🔄 Trigger website refresh after successful upload
     */
    triggerWebsiteRefresh() {
        console.log('🔄 Triggering website refresh...');
        
        // Method 1: Use localStorage to signal main website
        localStorage.setItem('triggerRefresh', Date.now().toString());
        localStorage.setItem('newUploadCompleted', 'true');
        
        // Method 2: Try to communicate with main website tab if open
        try {
            // Use BroadcastChannel for cross-tab communication
            const channel = new BroadcastChannel('websiteUpdates');
            channel.postMessage({
                type: 'UPLOAD_COMPLETED',
                timestamp: Date.now(),
                action: 'FORCE_REFRESH'
            });
            console.log('✅ Broadcast message sent to main website');
        } catch (error) {
            console.log('⚠️ BroadcastChannel not supported:', error.message);
        }
        
        // Method 3: Show instructions for manual refresh
        setTimeout(() => {
            this.showNotification(`
🔄 Upload Complete! 

To see your new project on the website:
1. Go back to the main website tab
2. Click the "Sync Projects" button
3. Or refresh the page manually

The website should auto-update within 1 minute!
            `, 'info');
        }, 3000);
        
        // Method 4: Offer to open main website
        setTimeout(() => {
            if (confirm('🌐 Would you like to open the main website to see your new project?')) {
                window.open('../index.html', '_blank');
            }
        }, 5000);
    }
}

// Initialize the interface when DOM is loaded
let uploadInterface;

document.addEventListener('DOMContentLoaded', () => {
    uploadInterface = new SolidworksUploadInterface();
    console.log('SOLIDWORKS Upload Interface initialized!');
});