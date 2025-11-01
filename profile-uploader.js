// Profile Photo Uploader - Auto-rename and GitHub upload
// Private interface for managing profile slideshow photos

(function() {
    'use strict';

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
            // Focus on current password input for better UX
            setTimeout(() => currentPasswordInput.focus(), 100);
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
            passwordChangeStatus.style.display = 'block';
            passwordChangeStatus.style.background = type === 'success' 
                ? 'rgba(0, 200, 0, 0.2)' 
                : 'rgba(200, 0, 0, 0.2)';
            passwordChangeStatus.style.border = type === 'success'
                ? '1px solid rgba(0, 200, 0, 0.4)'
                : '1px solid rgba(200, 0, 0, 0.4)';
            passwordChangeStatus.style.color = type === 'success' ? '#00ff00' : '#ff6666';
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
    let existingPhotos = []; // Will be fetched from slideshow config

    // Fetch existing photos from profile-slideshow.js
    async function fetchExistingPhotos() {
        try {
            const response = await fetch('./profile-slideshow.js');
            const text = await response.text();
            const match = text.match(/photos:\s*\[([\s\S]*?)\]/);
            if (match) {
                const photosStr = match[1];
                existingPhotos = photosStr
                    .split(',')
                    .map(line => line.trim().replace(/['"]/g, '').replace(/\/\/.*/g, ''))
                    .filter(name => name && name.endsWith('.jpg'));
                console.log('📋 Existing photos:', existingPhotos);
            }
        } catch (err) {
            console.warn('⚠️ Could not fetch existing photos:', err);
            existingPhotos = ['PP.jpg']; // Default fallback
        }
    }

    // Initialize
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

    // Handle selected files
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showStatus(`❌ ${file.name} is not a supported image format`, 'error');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showStatus(`❌ ${file.name} is too large (max 10MB)`, 'error');
                return false;
            }
            return true;
        });

        selectedFiles = [...selectedFiles, ...validFiles];
        updateFileList();
        uploadBtn.disabled = selectedFiles.length === 0;
    }

    // Update file list UI
    function updateFileList() {
        fileList.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const newName = `PP${existingPhotos.length + index + 1}.jpg`;
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                fileItem.innerHTML = `
                    <div class="file-info">
                        <img src="${e.target.result}" alt="Preview" class="file-preview">
                        <div class="file-details">
                            <div class="file-name">Original: ${file.name}</div>
                            <div class="file-name" style="color: #cc0000;">Rename to: ${newName}</div>
                            <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="window.removeFile(${index})">Remove</button>
                `;
            };
            reader.readAsDataURL(file);
            
            fileList.appendChild(fileItem);
            // animate new file item
            try {
                fileItem.classList.add('file-enter');
                setTimeout(() => fileItem.classList.remove('file-enter'), 600);
            } catch (err) {}
        });
    }

    // Remove file from list
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
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
        
        showStatus('🚀 Preparing upload...', 'info');

        try {
            // Simulate upload process (replace with actual GitHub API)
            await uploadToGitHub();
            
            showStatus(`✅ Successfully uploaded ${selectedFiles.length} photo(s)!`, 'success');
            
            // Update slideshow config
            await updateSlideshowConfig();
            
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
            showStatus(`❌ Upload failed: ${error.message}`, 'error');
            uploadBtn.disabled = false;
        } finally {
            clearBtn.disabled = false;
        }
    });

    // Upload files to GitHub (simulation - needs GitHub API token)
    async function uploadToGitHub() {
        const totalFiles = selectedFiles.length;
        
        for (let i = 0; i < totalFiles; i++) {
            const file = selectedFiles[i];
            const newName = `PP${existingPhotos.length + i + 1}.jpg`;
            
            showStatus(`📤 Uploading ${i + 1}/${totalFiles}: ${newName}...`, 'info');
            updateProgress((i / totalFiles) * 100);
            
            // IMPORTANT: This is a simulation
            // In production, you need to:
            // 1. Convert file to base64
            // 2. Use GitHub API with your personal access token
            // 3. Upload to: PUT /repos/:owner/:repo/contents/images/:filename
            
            await simulateUpload(file, newName);
            
            existingPhotos.push(newName);
        }
        
        updateProgress(100);
    }

    // Simulate upload delay (replace with real GitHub API call)
    function simulateUpload(file, newName) {
        return new Promise((resolve) => {
            // In real implementation:
            // const reader = new FileReader();
            // reader.onload = async () => {
            //     const base64Content = reader.result.split(',')[1];
            //     await fetch(`https://api.github.com/repos/USERNAME/REPO/contents/images/${newName}`, {
            //         method: 'PUT',
            //         headers: {
            //             'Authorization': 'token YOUR_GITHUB_TOKEN',
            //             'Content-Type': 'application/json'
            //         },
            //         body: JSON.stringify({
            //             message: `Add profile photo ${newName}`,
            //             content: base64Content
            //         })
            //     });
            // };
            // reader.readAsDataURL(file);
            
            // Simulation only
            setTimeout(resolve, 1000);
        });
    }

    // Update profile-slideshow.js config
    async function updateSlideshowConfig() {
        showStatus('📝 Updating slideshow configuration...', 'info');
        
        // In production, update profile-slideshow.js via GitHub API
        // For now, just log the new config
        console.log('📋 Updated photo list:', existingPhotos);
        
        showStatus('✅ Configuration updated! Reload page to see changes.', 'success');
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

    } // End initializeUploader

})();
