// Profile Photo Uploader - Auto-rename and GitHub upload
// Private interface for managing profile slideshow photos

(function() {
    'use strict';

    // ========== NOTIFICATION SYSTEM ==========
    /**
     * Show toast notification (uses styles.css .toast-notification)
     */
    function showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.warn('Notification container not found');
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        // Set message and type
        container.textContent = message;
        container.className = `toast-notification ${type}`;
        
        // Show notification
        setTimeout(() => container.classList.add('show'), 10);
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                container.classList.remove('show');
            }, duration);
        }
        
        // Also log to console for debugging
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    // ========== PASSWORD PROTECTION ==========
    // Password is hashed for security - never stored in plain text
    // To change default: run generate-hash.html with your new password
    const DEFAULT_PASSWORD_HASH = 'd7a5f8187ceede6c093445dad128e1b4ea2a21d91348a219b947ce2b70416212'; // SHA-256 hash
    
    // Get stored password hash (or use default)
    let storedPasswordHash = localStorage.getItem('uploader_pwd_hash') || DEFAULT_PASSWORD_HASH;

    // ========== PASSWORD RESET INSTRUCTIONS ==========
    // If you forget your password, reset using browser console or update the hash.
    // Security Note: Hash দেখে password বের করা practically impossible!

    const passwordScreen = document.getElementById('passwordScreen');
    const mainContainer = document.getElementById('mainContainer');
    const passwordInput = document.getElementById('passwordInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const passwordError = document.getElementById('passwordError');

    // Improve UX while password overlay is active:
    // - disable page scroll
    // - focus password input
    // - trap Tab focus inside the password panel so underlying controls aren't reachable
    document.addEventListener('DOMContentLoaded', function() {
        try {
            if (passwordScreen && passwordInput) {
                // ensure overlay is visible and focus is on input
                passwordInput.focus();
                document.body.style.overflow = 'hidden';

                const panel = document.querySelector('.password-panel') || passwordScreen;
                // animate panel in
                try { panel.classList.add('open'); } catch (e) {}
                // hide underlying main container completely while overlay is active
                try {
                    if (mainContainer) {
                        mainContainer.style.visibility = 'hidden';
                        mainContainer.style.pointerEvents = 'none';
                        mainContainer.setAttribute('aria-hidden', 'true');
                    }
                } catch (err) {
                    // ignore
                }
                const focusable = panel.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
                if (focusable.length) {
                    const firstFocusable = focusable[0];
                    const lastFocusable = focusable[focusable.length - 1];
                    panel.addEventListener('keydown', function(e) {
                        if (e.key === 'Tab') {
                            // Wrap focus
                            if (e.shiftKey) {
                                if (document.activeElement === firstFocusable) {
                                    e.preventDefault();
                                    lastFocusable.focus();
                                }
                            } else {
                                if (document.activeElement === lastFocusable) {
                                    e.preventDefault();
                                    firstFocusable.focus();
                                }
                            }
                        }
                    });
                }
            }
        } catch (err) {
            // non-fatal
            console.warn('Focus trap setup failed:', err);
        }
    });

    // SHA-256 hash function
    async function hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Always require password on page load

    // Password unlock handler
    async function checkPassword() {
        const enteredPassword = passwordInput.value.trim();
        const enteredHash = await hashPassword(enteredPassword);
        
        if (enteredHash === storedPasswordHash) {
            sessionStorage.setItem('uploader_unlocked', 'true');
            showMainInterface();
        } else {
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.classList.add('shake');
            setTimeout(() => {
                passwordInput.classList.remove('shake');
                passwordError.style.display = 'none';
            }, 2000);
        }
    }

    function showMainInterface() {
        // hide overlay and restore page behaviour
        passwordScreen.style.display = 'none';
        document.body.style.overflow = '';
        // restore main container visibility
        try {
            if (mainContainer) {
                mainContainer.style.visibility = '';
                mainContainer.style.pointerEvents = '';
                mainContainer.removeAttribute('aria-hidden');
            }
        } catch (err) {}
        mainContainer.style.display = 'block';
        initializeUploader();
    }

    // Button click
    unlockBtn.addEventListener('click', checkPassword);

    // Enter key
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .shake { animation: shake 0.3s ease-in-out; }
    `;
    document.head.appendChild(style);

    // ========== PASSWORD CHANGE LOGIC ==========
    function setupPasswordChange() {
        const settingsBtn = document.getElementById('settingsBtn');
        const passwordChangePanel = document.getElementById('passwordChangePanel');
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const savePasswordBtn = document.getElementById('savePasswordBtn');
        const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
        const passwordChangeStatus = document.getElementById('passwordChangeStatus');
        
        // GitHub config elements
        const githubTokenInput = document.getElementById('githubToken');
        const githubRepoInput = document.getElementById('githubRepo');
        const saveGitHubConfigBtn = document.getElementById('saveGitHubConfig');
        const testGitHubConnectionBtn = document.getElementById('testGitHubConnection');
        const githubConfigStatus = document.getElementById('githubConfigStatus');
        const configStatusBadge = document.getElementById('configStatusBadge');
        
        // Update badge status
        function updateConfigBadge(status) {
            if (!configStatusBadge) return;
            
            if (status === 'connected') {
                configStatusBadge.textContent = 'Connected ✓';
                configStatusBadge.classList.add('connected');
            } else {
                configStatusBadge.textContent = 'Not Configured';
                configStatusBadge.classList.remove('connected');
            }
        }
        
        // Load existing GitHub config
        if (githubTokenInput && githubRepoInput) {
            const savedToken = localStorage.getItem('githubToken') || localStorage.getItem('github_token');
            const savedRepo = localStorage.getItem('githubRepo') || localStorage.getItem('github_repo') || 'Akhinoor14/Solidworks-Website-Project-main';
            
            if (savedToken) {
                githubTokenInput.value = savedToken;
                updateConfigBadge('connected');
            }
            githubRepoInput.value = savedRepo;
        }
        
        // Test GitHub connection
        if (testGitHubConnectionBtn) {
            testGitHubConnectionBtn.addEventListener('click', async () => {
                const token = githubTokenInput.value.trim();
                const repo = githubRepoInput.value.trim();
                
                if (!token || !repo) {
                    showGitHubConfigStatus('❌ Please enter both token and repository', 'error');
                    showNotification('❌ Please fill in all fields', 'error');
                    return;
                }
                
                testGitHubConnectionBtn.disabled = true;
                testGitHubConnectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
                
                try {
                    showNotification('🔍 Testing GitHub connection...', 'info', 0);
                    
                    // Test API access
                    const [owner, repoName] = repo.split('/');
                    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
                    
                    const response = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    
                    if (response.ok) {
                        const repoData = await response.json();
                        const successMsg = `✅ Connected to ${repoData.full_name}! ${repoData.private ? '🔒 Private' : '🌍 Public'} repository`;
                        showGitHubConfigStatus(successMsg, 'success');
                        showNotification(successMsg, 'success', 5000);
                        updateConfigBadge('connected');
                    } else if (response.status === 401) {
                        throw new Error('Invalid token - please check your Personal Access Token');
                    } else if (response.status === 404) {
                        throw new Error('Repository not found - check owner/repo format');
                    } else {
                        throw new Error(`GitHub API error: ${response.status}`);
                    }
                    
                } catch (error) {
                    const errorMsg = `❌ Connection failed: ${error.message}`;
                    showGitHubConfigStatus(errorMsg, 'error');
                    showNotification(errorMsg, 'error', 6000);
                    updateConfigBadge('error');
                } finally {
                    testGitHubConnectionBtn.disabled = false;
                    testGitHubConnectionBtn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
                }
            });
        }
        
        // Save GitHub config with validation
        if (saveGitHubConfigBtn) {
            saveGitHubConfigBtn.addEventListener('click', () => {
                const token = githubTokenInput.value.trim();
                const repo = githubRepoInput.value.trim();
                
                if (!token) {
                    showGitHubConfigStatus('❌ Please enter a GitHub token', 'error');
                    showNotification('❌ GitHub token is required', 'error');
                    githubTokenInput.focus();
                    return;
                }
                
                if (!repo || !repo.includes('/')) {
                    showGitHubConfigStatus('❌ Invalid repo format (use: owner/repo)', 'error');
                    showNotification('❌ Invalid repository format. Use: owner/repo', 'error');
                    githubRepoInput.focus();
                    return;
                }
                
                // Validate token format
                if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
                    showGitHubConfigStatus('⚠️ Token format unusual but saved', 'info');
                    showNotification('⚠️ Token format looks unusual. Typically starts with ghp_ or github_pat_', 'warning', 5000);
                }
                
                // Save with both key names for compatibility
                localStorage.setItem('githubToken', token);
                localStorage.setItem('githubRepo', repo);
                localStorage.setItem('github_token', token); // Legacy support
                localStorage.setItem('github_repo', repo); // Legacy support
                
                const successMsg = '✅ GitHub credentials saved successfully!';
                showGitHubConfigStatus(successMsg, 'success');
                showNotification(successMsg + ' You can now upload photos.', 'success', 4000);
                updateConfigBadge('connected');
                
                // Auto-hide status after 4 seconds
                setTimeout(() => {
                    githubConfigStatus.style.display = 'none';
                }, 4000);
            });
        }
        
        function showGitHubConfigStatus(message, type) {
            if (!githubConfigStatus) return;
            
            githubConfigStatus.textContent = message;
            githubConfigStatus.className = `status-message ${type}`;
            githubConfigStatus.style.display = 'block';
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    githubConfigStatus.style.display = 'none';
                }, 5000);
            }
        }

        // Toggle password change panel
        settingsBtn.addEventListener('click', () => {
            const isVisible = passwordChangePanel.style.display !== 'none';
            passwordChangePanel.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
                passwordChangeStatus.style.display = 'none';
            }
            // Focus on GitHub token input for better UX
            setTimeout(() => {
                if (githubTokenInput && !githubTokenInput.value) {
                    githubTokenInput.focus();
                } else {
                    currentPasswordInput.focus();
                }
            }, 100);
        });

        // Cancel button
        cancelPasswordBtn.addEventListener('click', () => {
            passwordChangePanel.style.display = 'none';
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            passwordChangeStatus.style.display = 'none';
        });

        // Save new password
        savePasswordBtn.addEventListener('click', async () => {
            const currentPwd = currentPasswordInput.value.trim();
            const newPwd = newPasswordInput.value.trim();
            const confirmPwd = confirmPasswordInput.value.trim();

            // Validation
            if (!currentPwd || !newPwd || !confirmPwd) {
                showPasswordStatus('❌ Please fill all fields', 'error');
                return;
            }

            // Verify current password
            const currentPwdHash = await hashPassword(currentPwd);
            if (currentPwdHash !== storedPasswordHash) {
                showPasswordStatus('❌ Current password is incorrect', 'error');
                return;
            }

            if (newPwd.length < 6) {
                showPasswordStatus('❌ New password must be at least 6 characters', 'error');
                return;
            }

            if (newPwd !== confirmPwd) {
                showPasswordStatus('❌ New passwords do not match', 'error');
                return;
            }

            // Hash and save new password
            const newPwdHash = await hashPassword(newPwd);
            storedPasswordHash = newPwdHash;
            localStorage.setItem('uploader_pwd_hash', newPwdHash);
            
            showPasswordStatus('✅ Password changed successfully!', 'success');
            
            // Clear inputs and close panel after 2 seconds
            setTimeout(() => {
                passwordChangePanel.style.display = 'none';
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
                passwordChangeStatus.style.display = 'none';
            }, 2000);
        });

        function showPasswordStatus(message, type) {
            passwordChangeStatus.textContent = message;
            passwordChangeStatus.className = `status-message ${type}`;
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    passwordChangeStatus.className = 'status-message';
                    passwordChangeStatus.textContent = '';
                }, 5000);
            }
        }
    }

    // ========== MAIN UPLOADER LOGIC ==========
    function initializeUploader() {
    
    // Initialize password change functionality
    setupPasswordChange();

    // Logout fallback: keyboard shortcut (Ctrl+L)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key.toLowerCase() === 'l') {
            sessionStorage.removeItem('uploader_unlocked');
            alert('Logout successful! Admin dashboard e niye jawa hobe.');
            window.location.href = 'only-boss-dashboard.html';
        }
    });

    // If logout button exists, attach logic
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('uploader_unlocked');
            window.location.href = 'only-boss-dashboard.html';
        });
    }

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');
    const progress = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');

    let selectedFiles = [];
    let existingPhotos = []; // Will be fetched from GitHub API

    // Fetch existing photos from GitHub API (used for upload numbering)
    async function fetchExistingPhotos() {
        const githubToken = localStorage.getItem('githubToken');
        const githubRepo = localStorage.getItem('githubRepo');
        
        if (!githubToken || !githubRepo) {
            console.log('ℹ️ GitHub not configured, starting from PP1.jpg');
            existingPhotos = [];
            return;
        }

        try {
            const photos = await fetchGitHubPhotos(githubToken, githubRepo);
            // Determine current profile by PP.jpg sha
            const ppFile = photos.find(p => (p.name || '').toLowerCase() === 'pp.jpg');
            const currentSha = ppFile ? ppFile.sha : null;
            existingPhotos = photos.map(p => p.name);
            console.log(`📋 Found ${existingPhotos.length} existing photos on GitHub:`, existingPhotos);
        } catch (err) {
            console.warn('⚠️ Could not fetch existing photos from GitHub:', err);
            existingPhotos = [];
        }
    }

    // Initialize - fetch on page load
    fetchExistingPhotos();

    // Click to select files
    uploadArea.addEventListener('click', () => fileInput.click());

    // File selection handler
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragging');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        handleFiles(e.dataTransfer.files);
    });

    // Handle selected files - SINGLE FILE ONLY
    function handleFiles(files) {
        if (files.length === 0) return;
        
        // Only take first file
        const file = files[0];
        
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showStatus(`❌ ${file.name} is not a supported image format`, 'error');
            showNotification('❌ Only JPG, PNG, WebP supported', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showStatus(`❌ ${file.name} is too large (max 10MB)`, 'error');
            showNotification('❌ File too large (max 10MB)', 'error');
            return;
        }

        selectedFiles = [file]; // Only one file
        updateFileList();
        uploadBtn.disabled = false;
    }

    // Update file list UI - SINGLE FILE VERSION
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (selectedFiles.length === 0) return;
        
        const file = selectedFiles[0];
        const isPng = (file.type && file.type.toLowerCase().includes('png')) || (/\.png$/i.test(file.name || ''));
        const newName = `pp.${isPng ? 'png' : 'jpg'}`;
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            fileItem.innerHTML = `
                <div class="file-info">
                    <img src="${e.target.result}" alt="Preview" class="file-preview">
                    <div class="file-details">
                        <div class="file-name">Selected: ${file.name}</div>
                        <div class="file-name" style="color: #cc0000;">Will save as: ${newName}</div>
                        <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                </div>
                <button class="remove-btn" onclick="window.removeFile(0)">Remove</button>
            `;
        };
        reader.readAsDataURL(file);
            
        fileList.appendChild(fileItem);
        // animate new file item
        try {
            fileItem.classList.add('file-enter');
            setTimeout(() => fileItem.classList.remove('file-enter'), 600);
        } catch (err) {}
    }

    // Remove file from list
    window.removeFile = function(index) {
        selectedFiles = [];
        updateFileList();
        uploadBtn.disabled = selectedFiles.length === 0;
    };

    // Clear all files
    clearBtn.addEventListener('click', () => {
        selectedFiles = [];
        fileList.innerHTML = '';
        fileInput.value = '';
        uploadBtn.disabled = true;
        hideStatus();
    });

    // Upload to GitHub
    uploadBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        uploadBtn.disabled = true;
        clearBtn.disabled = true;
        progress.style.display = 'block';
        
        showNotification('🚀 Preparing upload...', 'info');
        showStatus('🚀 Preparing upload...', 'info');

        try {
            // Upload to GitHub with real-time notifications
            await uploadToGitHub();
            
            const successMsg = `✅ Successfully uploaded ${selectedFiles.length} photo(s)!`;
            showNotification(successMsg, 'success', 5000);
            showStatus(successMsg, 'success');
            
            // Refresh gallery to show new photos
            if (typeof loadGallery === 'function') {
                showNotification('🔄 Refreshing gallery...', 'info', 2000);
                setTimeout(() => loadGallery(), 1000);
            }
            
            // Clear after success
            setTimeout(() => {
                selectedFiles = [];
                fileList.innerHTML = '';
                fileInput.value = '';
                uploadBtn.disabled = true;
                progress.style.display = 'none';
                hideStatus();
            }, 3000);
            
        } catch (error) {
            const errorMsg = `❌ Upload failed: ${error.message}`;
            showNotification(errorMsg, 'error', 6000);
            showStatus(errorMsg, 'error');
            uploadBtn.disabled = false;
        } finally {
            clearBtn.disabled = false;
        }
    });

    // Upload files to GitHub - SINGLE pp.jpg/pp.png UPLOAD
    async function uploadToGitHub() {
        if (selectedFiles.length === 0) {
            throw new Error('No file selected');
        }
        
        const file = selectedFiles[0]; // Only one file
        const isPng = (file.type && file.type.toLowerCase().includes('png')) || (/\.png$/i.test(file.name || ''));
        const ext = isPng ? 'png' : 'jpg';
        const targetName = `pp.${ext}`;
        const otherExt = isPng ? 'jpg' : 'png';
        
        // Get GitHub credentials from localStorage
        let githubToken = localStorage.getItem('githubToken');
        let githubRepo = localStorage.getItem('githubRepo');
        
        // Fallback to old keys for compatibility
        if (!githubToken) githubToken = localStorage.getItem('github_token');
        if (!githubRepo) githubRepo = localStorage.getItem('github_repo');
        
        if (!githubToken || !githubRepo) {
            throw new Error('GitHub credentials not configured. Please configure in Settings panel first.');
        }
        
        const [owner, repo] = githubRepo.split('/');
        
        showNotification('📤 Uploading profile photo...', 'info', 2000);
        showStatus(`📤 Uploading as ${targetName}...`, 'info');
        updateProgress(30);

        try {
            // Check if target file already exists (to get sha for update)
            let targetSha = null;
            let otherSha = null;
            try {
                const checkRes = await window.fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/${targetName}`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (checkRes.ok) {
                    const data = await checkRes.json();
                    targetSha = data.sha;
                }
            } catch (e) {
                // File doesn't exist, will create new
            }

            // Also check if the other extension exists (to remove it after upload for clarity)
            try {
                const otherRes = await window.fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/pp.${otherExt}`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (otherRes.ok) {
                    const data = await otherRes.json();
                    otherSha = data.sha;
                }
            } catch (e) {}

            updateProgress(50);
            
            // Upload as pp.jpg or pp.png
            await realGitHubUpload(file, targetName, githubToken, githubRepo, targetSha);
            
            // If other variant exists (pp.jpg/pp.png), remove it to avoid ambiguity
            if (otherSha) {
                try {
                    await window.fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/pp.${otherExt}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `token ${githubToken}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify({
                            message: `Remove old profile photo pp.${otherExt}`,
                            sha: otherSha,
                            branch: 'main'
                        })
                    });
                } catch (e) {
                    console.warn('Could not remove other profile variant:', e.message);
                }
            }

            updateProgress(100);
            showNotification('✅ Profile photo uploaded successfully!', 'success', 4000);
            
            // No auto-update; user can refresh to see changes
            
        } catch (error) {
            throw new Error(`Failed to upload: ${error.message}`);
        }
    }

    // Real GitHub API upload - modified to support sha for updates
    function realGitHubUpload(file, newName, token, repo, existingSha = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Content = reader.result.split(',')[1];
                    
                       // Build request body
                       const requestBody = {
                           message: existingSha ? `Update profile photo ${newName}` : `Add profile photo ${newName}`,
                           content: base64Content,
                           branch: 'main'
                       };
                   
                       // Include sha if updating existing file
                       if (existingSha) {
                           requestBody.sha = existingSha;
                       }
                   
                    const response = await fetch(`https://api.github.com/repos/${repo}/contents/images/${newName}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                           body: JSON.stringify(requestBody)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
                    }
                    
                    const result = await response.json();
                    console.log(`✅ Uploaded ${newName}:`, result.content.html_url);
                    resolve(result);
                    
                } catch (error) {
                    console.error(`❌ Upload failed for ${newName}:`, error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    // Show status message
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
    }

    // Hide status message
    function hideStatus() {
        status.style.display = 'none';
    }

    // Update progress bar
    function updateProgress(percent) {
        progressFill.style.width = `${percent}%`;
    }

    // ========== PHOTO GALLERY & DELETE SYSTEM ==========
    
    const photoGallery = document.getElementById('photoGallery');
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryStatus = document.getElementById('galleryStatus');
    const refreshGalleryBtn = document.getElementById('refreshGallery');
    const deleteModal = document.getElementById('deleteModal');
    const deletePreviewImg = document.getElementById('deletePreviewImg');
    const deleteFileName = document.getElementById('deleteFileName');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    
    let currentDeleteTarget = null;

    // Load and display gallery
    async function loadGallery() {
        const githubToken = localStorage.getItem('githubToken');
        const githubRepo = localStorage.getItem('githubRepo');
        
        if (!githubToken || !githubRepo) {
            galleryStatus.textContent = '⚠️ Configure GitHub credentials in Settings first';
            galleryStatus.style.color = '#ffaa66';
            photoGallery.style.display = 'block';
            showNotification('⚠️ Please configure GitHub credentials in Settings', 'warning', 4000);
            return;
        }

        try {
            galleryStatus.textContent = '🔍 Loading photos from GitHub...';
            galleryStatus.style.color = 'rgba(255,255,255,0.6)';
            photoGallery.style.display = 'block';
            
            showNotification('🔍 Loading photo gallery from GitHub...', 'info', 2000);
            const photos = await fetchGitHubPhotos(githubToken, githubRepo);
            
            if (photos.length === 0) {
                galleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">📭 No photos uploaded yet</div>';
                galleryStatus.textContent = '';
                showNotification('📭 No photos found in repository', 'info', 3000);
                return;
            }
            
            existingPhotos = photos.map(p => p.name); // Update global list
            
            // Determine current profile by PP.jpg sha
            const ppFile = photos.find(p => (p.name || '').toLowerCase() === 'pp.jpg');
            const currentSha = ppFile ? ppFile.sha : null;
            
            showNotification(`✅ Loaded ${photos.length} photo${photos.length > 1 ? 's' : ''} from GitHub`, 'success', 3000);
            
            galleryGrid.innerHTML = photos.map(photo => {
                const isCurrent = !!currentSha && photo.sha === currentSha;
                const badge = isCurrent ? `<div style="position:absolute; top:6px; left:6px; background: rgba(0,200,0,0.85); color:#fff; font-size: 0.7rem; padding: 3px 6px; border-radius:6px; border:1px solid rgba(255,255,255,0.15);">Current</div>` : '';
                const setBtnAttrs = isCurrent ? 'disabled title="Already current"' : `data-photo='${JSON.stringify(photo)}' title="Set as Profile"`;
                return `
                <div class="gallery-photo" data-filename="${photo.name}" style="position:relative; ${isCurrent ? 'outline:2px solid #00aa00;' : ''}">
                    ${badge}
                    <img src="${photo.download_url}" alt="${photo.name}" loading="lazy">
                    <div class="gallery-photo-info">
                        <div class="gallery-photo-name">${photo.name}</div>
                        <div class="gallery-photo-actions">
                            <button class="gallery-btn gallery-btn-view" onclick="window.open('${photo.download_url}', '_blank')">
                                👁️ View
                            </button>
                            <button class="gallery-btn gallery-btn-profile" ${setBtnAttrs}>
                                ⭐ ${isCurrent ? 'Current' : 'Set Profile'}
                            </button>
                            <button class="gallery-btn gallery-btn-delete" data-photo='${JSON.stringify(photo)}'>
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
            
            galleryStatus.textContent = `✅ Loaded ${photos.length} photo${photos.length > 1 ? 's' : ''}`;
            galleryStatus.style.color = '#00ff00';
            
            // Attach action handlers
            document.querySelectorAll('.gallery-btn-delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const photoData = JSON.parse(this.dataset.photo);
                    showDeleteConfirmation(photoData);
                });
            });
            document.querySelectorAll('.gallery-btn-profile').forEach(btn => {
                btn.addEventListener('click', function() {
                    const photoData = JSON.parse(this.dataset.photo);
                    setAsProfile(photoData);
                });
            });
            
        } catch (error) {
            console.error('Gallery load error:', error);
            const errorMsg = `❌ Failed to load gallery: ${error.message}`;
            galleryStatus.textContent = errorMsg;
            galleryStatus.style.color = '#ff6666';
            showNotification(errorMsg, 'error', 6000);
        }
    }

    // Set selected photo as hero profile (copies to images/PP.jpg)
    async function setAsProfile(photo) {
        try {
            const githubToken = localStorage.getItem('githubToken') || localStorage.getItem('github_token');
            const githubRepo = localStorage.getItem('githubRepo') || localStorage.getItem('github_repo');
            if (!githubToken || !githubRepo) {
                showNotification('❌ GitHub not configured in Settings', 'error');
                return;
            }
            const [owner, repoName] = githubRepo.split('/');

            showNotification(`⭐ Setting ${photo.name} as profile photo...`, 'info', 0);

            // 1) Get selected photo content (base64) - use direct API with token for admin operations
            const getPhotoRes = await window.fetch(photo.url, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!getPhotoRes.ok) throw new Error('Failed to read selected photo content');
            const photoData = await getPhotoRes.json();
            const base64Content = photoData.content.replace(/\n/g, ''); // Remove newlines from base64

            // 2) Get existing PP.jpg sha (if exists) - use direct GitHub API to bypass proxy for admin operations
            let ppSha = null;
            try {
                const getPpRes = await window.fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/images/PP.jpg`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (getPpRes.ok) {
                    const ppData = await getPpRes.json();
                    ppSha = ppData.sha;
                    console.log('Found existing PP.jpg, sha:', ppSha);
                } else if (getPpRes.status === 404) {
                    console.log('PP.jpg not found (404), will create new');
                } else {
                    console.warn('PP.jpg check returned:', getPpRes.status);
                }
            } catch (e) {
                // PP.jpg doesn't exist yet, will create new
                console.log('PP.jpg check error (likely does not exist):', e.message);
            }

            // 3) PUT content to PP.jpg (create or update)
            const putBody = {
                message: `Set PP.jpg to ${photo.name}`,
                content: base64Content,
                branch: 'main'
            };
            if (ppSha) {
                putBody.sha = ppSha;
            }

            // PUT is an admin write operation - must use direct API with token (not proxy)
            const putRes = await window.fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/images/PP.jpg`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(putBody)
            });
            if (!putRes.ok) {
                const errData = await putRes.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to update PP.jpg');
            }

            showNotification('✅ Profile photo updated! Homepage will show it next load.', 'success', 4000);
            // Refresh gallery to reflect new Current badge
            try { setTimeout(() => loadGallery(), 750); } catch (e) {}

            // Optional: signal other tabs to refresh
            try {
                const channel = new BroadcastChannel('websiteUpdates');
                channel.postMessage({ type: 'PROFILE_UPDATED', at: Date.now() });
                channel.close();
            } catch (e) {}

        } catch (error) {
            console.error('Set profile error:', error);
            showNotification(`❌ Could not set profile: ${error.message}`, 'error', 6000);
        }
    }

    // Fetch photos from GitHub API
    async function fetchGitHubPhotos(token, repo) {
        const [owner, repoName] = repo.split('/');
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/images`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const files = await response.json();
        
        // Filter and sort profile photos (PP*.jpg, including PP.jpg)
        return files
            .filter(file => file.name.match(/^PP\d*\.jpg$/i) && file.type === 'file')
            .sort((a, b) => {
                // PP.jpg comes first (no number = 0), then PP1, PP2, etc.
                const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
                const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
                return numA - numB;
            });
    }

    // Show delete confirmation modal
    function showDeleteConfirmation(photo) {
        currentDeleteTarget = photo;
        deletePreviewImg.src = photo.download_url;
        deleteFileName.textContent = photo.name;
        deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide delete confirmation modal
    function hideDeleteConfirmation() {
        deleteModal.style.display = 'none';
        document.body.style.overflow = '';
        currentDeleteTarget = null;
    }

    // Show spinner when loading delete preview
    function showDeleteLoadingSpinner(show) {
        var spinner = document.getElementById('deleteLoadingSpinner');
        var img = document.getElementById('deletePreviewImg');
        if (spinner && img) {
            spinner.style.display = show ? 'block' : 'none';
            img.style.opacity = show ? '0.3' : '1';
        }
    }

    // Delete photo from GitHub and renumber
    async function deletePhotoAndRenumber() {
        if (!currentDeleteTarget) return;
        
        const githubToken = localStorage.getItem('githubToken');
        const githubRepo = localStorage.getItem('githubRepo');
        
        if (!githubToken || !githubRepo) {
            showNotification('❌ GitHub credentials not configured', 'error');
            hideDeleteConfirmation();
            return;
        }
        
        try {
            deleteConfirmBtn.disabled = true;
            deleteConfirmBtn.textContent = '⏳ Deleting...';
            
            const photoToDelete = currentDeleteTarget.name;
            
            showNotification(`🗑️ Deleting ${photoToDelete}...`, 'info', 0);
            console.log(`🗑️ Deleting ${photoToDelete}...`);
            
            // Step 1: Delete the photo
            await deleteFromGitHub(currentDeleteTarget, githubToken, githubRepo);
            showNotification(`✅ Deleted ${photoToDelete} from GitHub`, 'success', 2000);
            
            // Step 2: Get all remaining photos
            showNotification('🔍 Checking remaining photos...', 'info', 2000);
            const remainingPhotos = await fetchGitHubPhotos(githubToken, githubRepo);
            
            // Step 3: Renumber photos to fill gaps
            if (remainingPhotos.length > 0) {
                showNotification(`🔢 Renumbering ${remainingPhotos.length} photos to fill gaps...`, 'info', 0);
                await renumberPhotos(remainingPhotos, githubToken, githubRepo);
            }
            
            hideDeleteConfirmation();
            
            const successMsg = `✅ Deleted ${photoToDelete} and renumbered ${remainingPhotos.length} photos!`;
            showNotification(successMsg, 'success', 5000);
            showStatus(successMsg, 'success');
            
            // Reload gallery
            setTimeout(() => {
                loadGallery();
                hideStatus();
            }, 2000);
            
            // Notify slideshow to refresh (if on home page)
            try {
                if (window.opener && window.opener.profileSlideshow) {
                    window.opener.profileSlideshow.refresh();
                }
            } catch (e) {
                // Ignore if slideshow not available
            }
            
        } catch (error) {
            console.error('Delete error:', error);
            const errorMsg = `❌ Delete failed: ${error.message}`;
            showNotification(errorMsg, 'error', 6000);
            showStatus(errorMsg, 'error');
            deleteConfirmBtn.disabled = false;
            deleteConfirmBtn.textContent = '🗑️ Delete';
        }
    }

    // Delete file from GitHub
    async function deleteFromGitHub(photo, token, repo) {
        const [owner, repoName] = repo.split('/');
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/images/${photo.name}`;
        
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Delete profile photo ${photo.name}`,
                sha: photo.sha,
                branch: 'main'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || response.statusText);
        }
        
        console.log(`✅ Deleted ${photo.name} from GitHub`);
    }

    // Renumber photos to fill gaps (PP5 deleted → PP6 becomes PP5)
    async function renumberPhotos(photos, token, repo) {
        console.log(`🔢 Renumbering ${photos.length} photos...`);
        
        for (let i = 0; i < photos.length; i++) {
            const currentName = photos[i].name;
            const expectedName = `PP${i + 1}.jpg`;
            
            if (currentName !== expectedName) {
                console.log(`  Renaming ${currentName} → ${expectedName}`);
                await renameOnGitHub(photos[i], expectedName, token, repo);
            }
        }
        
        console.log('✅ Renumbering complete!');
    }

    // Rename file on GitHub (delete old + create new)
    async function renameOnGitHub(photo, newName, token, repo) {
        const [owner, repoName] = repo.split('/');
        
        // Step 1: Get file content
        const getResponse = await fetch(photo.url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getResponse.ok) {
            throw new Error(`Failed to get ${photo.name}`);
        }
        
        const fileData = await getResponse.json();
        
        // Step 2: Create file with new name
        const createResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/images/${newName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Rename ${photo.name} to ${newName}`,
                content: fileData.content,
                branch: 'main'
            })
        });
        
        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(`Failed to create ${newName}: ${errorData.message}`);
        }
        
        // Step 3: Delete old file
        const deleteResponse = await fetch(photo.url, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Remove old ${photo.name}`,
                sha: photo.sha,
                branch: 'main'
            })
        });
        
        if (!deleteResponse.ok) {
            console.warn(`⚠️ Failed to delete old ${photo.name}, but new file created`);
        }
    }

    // Event listeners
    if (refreshGalleryBtn) {
        refreshGalleryBtn.addEventListener('click', loadGallery);
    }
    
    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', hideDeleteConfirmation);
    }
    
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', deletePhotoAndRenumber);
    }
    
    // Close modal on background click
    if (deleteModal) {
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                hideDeleteConfirmation();
            }
        });
    }
    
    // Load gallery on page load
    if (mainContainer && photoGallery) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style' && mainContainer.style.display !== 'none') {
                    loadGallery();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(mainContainer, { attributes: true });
    }

    // Gallery button logic
    var galleryBtn = document.getElementById('galleryBtn');
    if (galleryBtn && photoGallery) {
        galleryBtn.addEventListener('click', function() {
            if (photoGallery.style.display === 'none' || photoGallery.style.display === '') {
                photoGallery.style.display = 'block';
                photoGallery.scrollIntoView({behavior: 'smooth'});
            } else {
                photoGallery.style.display = 'none';
            }
        });
    }

    } // End initializeUploader

})();
