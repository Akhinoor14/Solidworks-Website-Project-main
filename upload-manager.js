/**
 * SOLIDWORKS Upload Manager - Complete Implementation
 * Integrated with existing script.js patterns and GitHub API
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

function getGitHubToken() {
    return localStorage.getItem('github_token');
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// TAB MANAGEMENT
// ============================================

function switchTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Show selected tab
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

function saveToken() {
    const token = document.getElementById('github-token').value.trim();
    if (!token) {
        alert('❌ Please enter a GitHub token');
        return;
    }
    localStorage.setItem('github_token', token);
    updateTokenStatus();
    alert('✅ GitHub token saved successfully!');
}

function updateTokenStatus() {
    const token = getGitHubToken();
    const status = document.getElementById('token-status');
    if (token) {
        status.className = 'token-status connected';
        status.innerHTML = '<i class="fas fa-check-circle"></i> Connected';
    } else {
        status.className = 'token-status disconnected';
        status.innerHTML = '<i class="fas fa-times-circle"></i> Not Connected';
    }
}

// ============================================
// FILE UPLOAD HANDLERS
// ============================================

function setupFileHandlers(type) {
    const fileInput = document.getElementById(type + '-files');
    const uploadZone = document.getElementById(type + '-zone');
    const preview = document.getElementById(type + '-preview');
    const list = document.getElementById(type + '-list');

    if (!fileInput || !uploadZone) return;

    fileInput.addEventListener('change', () => displayFiles(type, fileInput.files));

    uploadZone.addEventListener('dragover', e => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        fileInput.files = e.dataTransfer.files;
        displayFiles(type, e.dataTransfer.files);
    });
}

function displayFiles(type, files) {
    const preview = document.getElementById(type + '-preview');
    const list = document.getElementById(type + '-list');
    
    if (files.length === 0) {
        preview.classList.remove('show');
        return;
    }

    preview.classList.add('show');
    list.innerHTML = '';

    Array.from(files).forEach(file => {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <i class="fas fa-check-circle" style="color: #28a745; font-size: 1.2rem;"></i>
        `;
        list.appendChild(li);
    });
}

function clearFiles(type) {
    const fileInput = document.getElementById(type + '-files');
    const preview = document.getElementById(type + '-preview');
    if (fileInput) fileInput.value = '';
    if (preview) preview.classList.remove('show');
}

// ============================================
// CW/HW UPLOAD (Main Upload Feature)
// ============================================

async function handleUpload(event, type) {
    event.preventDefault();
    
    const prefix = type.toLowerCase();
    const daySelect = document.getElementById(prefix + '-day');
    const numberSelect = document.getElementById(prefix + '-number');
    const fileInput = document.getElementById(prefix + '-files');

    const day = daySelect.value;
    const number = numberSelect.value;
    const files = fileInput.files;

    if (!day || !number || files.length === 0) {
        alert('❌ Please fill all fields and select files');
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found. Please save it first!');
        return;
    }

    // Show progress
    const progressPanel = document.getElementById(prefix + '-progress');
    const progressBar = document.getElementById(prefix + '-bar');
    const progressText = document.getElementById(prefix + '-text');
    
    progressPanel.classList.add('show');
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting upload...';

    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type; // CW or HW
        
        let successCount = 0;
        let failCount = 0;
        const uploadedFiles = [];
        
        progressText.textContent = `Uploading ${files.length} files...`;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length * 90);
            progressBar.style.width = progress + '%';
            progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
            
            try {
                // Path: CW/Day 10/CW 01/filename.ext
                const path = `${folderPath}/Day ${day}/${type} ${number}/${file.name}`;
                const content = await readFileAsBase64(file);
                
                // Check if file exists (get SHA for update)
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
                const uploadData = {
                    message: `Upload ${file.name} to ${type} Day ${day}/${type} ${number}`,
                    content: content,
                    branch: 'main'
                };
                
                if (sha) {
                    uploadData.sha = sha; // Update existing
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
                    successCount++;
                    const result = await uploadResponse.json();
                    uploadedFiles.push({
                        name: file.name,
                        path: result.content.path,
                        url: result.content.html_url
                    });
                } else {
                    failCount++;
                    console.error(`Failed to upload ${file.name}:`, await uploadResponse.text());
                }
                
            } catch (error) {
                failCount++;
                console.error(`Error uploading ${file.name}:`, error);
            }
        }

        progressBar.style.width = '100%';
        
        if (failCount === 0) {
            progressText.textContent = `✅ Successfully uploaded ${successCount} file(s)!`;
            
            // Log success
            console.log('Upload complete:', uploadedFiles);
            
            setTimeout(() => {
                progressPanel.classList.remove('show');
                event.target.reset();
                clearFiles(prefix);
                alert(`✅ Upload complete!\n${successCount} file(s) uploaded to GitHub.\n\nPath: ${type}/Day ${day}/${type} ${number}/`);
            }, 2000);
        } else {
            progressText.textContent = `⚠️ Uploaded ${successCount} file(s), ${failCount} failed`;
            alert(`⚠️ Upload partially complete:\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n\nCheck console for details.`);
        }

    } catch (error) {
        progressText.textContent = '❌ Upload failed: ' + error.message;
        progressBar.style.width = '0%';
        console.error('Upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    }
}

// ============================================
// SOLO PROJECT UPLOAD
// ============================================

async function handleSoloUpload(event) {
    event.preventDefault();
    
    const projectNumber = document.getElementById('solo-project-number').value;
    const mode = document.getElementById('solo-mode').value;
    const fileInput = document.getElementById('solo-files');
    const files = fileInput.files;

    if (!projectNumber || !mode || files.length === 0) {
        alert('❌ Please fill all fields and select files');
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found. Please save it first!');
        return;
    }

    const progressPanel = document.getElementById('solo-progress');
    const progressBar = document.getElementById('solo-bar');
    const progressText = document.getElementById('solo-text');
    
    progressPanel.classList.add('show');
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting solo project upload...';

    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const basePath = 'Solo-Projects';
        const projectName = `Project ${projectNumber}`;
        
        let successCount = 0;
        let failCount = 0;
        
        progressText.textContent = `Uploading ${files.length} files to ${projectName}...`;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length * 90);
            progressBar.style.width = progress + '%';
            progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
            
            try {
                const content = await readFileAsBase64(file);
                const uploadPath = `${basePath}/${projectName}/${file.name}`;
                
                // Check if file exists
                let sha = null;
                try {
                    const checkResponse = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/contents/${uploadPath}`,
                        {
                            headers: {
                                'Authorization': `token ${token}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        }
                    );
                    if (checkResponse.ok) {
                        const existingFile = await checkResponse.json();
                        sha = existingFile.sha;
                    }
                } catch (e) {
                    // File doesn't exist
                }
                
                // Upload
                const uploadData = {
                    message: `Upload ${file.name} to ${projectName} (${mode})`,
                    content: content,
                    branch: 'main'
                };
                
                if (sha) {
                    uploadData.sha = sha;
                }
                
                const uploadResponse = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/contents/${uploadPath}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(uploadData)
                    }
                );
                
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

        progressBar.style.width = '100%';
        
        if (failCount === 0) {
            progressText.textContent = `✅ Successfully uploaded ${successCount} file(s) to ${projectName}!`;
            setTimeout(() => {
                progressPanel.classList.remove('show');
                event.target.reset();
                clearFiles('solo');
                alert(`✅ Solo project upload complete!\n${successCount} file(s) uploaded.\n\nPath: Solo-Projects/${projectName}/`);
            }, 2000);
        } else {
            progressText.textContent = `⚠️ Uploaded ${successCount}, ${failCount} failed`;
            alert(`⚠️ Upload partially complete:\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
        }

    } catch (error) {
        progressText.textContent = '❌ Upload failed: ' + error.message;
        progressBar.style.width = '0%';
        console.error('Solo upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    }
}

// ============================================
// QUESTION UPLOAD
// ============================================

async function handleQuestionUpload(event) {
    event.preventDefault();
    
    const day = document.getElementById('question-day').value;
    const type = document.getElementById('question-type').value;
    const fileInput = document.getElementById('question-files');
    const files = fileInput.files;

    if (!day || !type || files.length === 0) {
        alert('❌ Please fill all fields and select at least one file');
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found. Please save it first!');
        return;
    }

    const progressPanel = document.getElementById('question-progress');
    const progressBar = document.getElementById('question-bar');
    const progressText = document.getElementById('question-text');
    
    progressPanel.classList.add('show');
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting question upload...';

    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const folderPath = type; // CW or HW
        
        let successCount = 0;
        let failCount = 0;
        
        progressText.textContent = `Uploading ${files.length} question file(s)...`;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length * 90);
            progressBar.style.width = progress + '%';
            progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
            
            try {
                // Path: CW/Day 10/Questions/filename.pdf
                const fileName = file.name;
                const path = `${folderPath}/Day ${day}/Questions/${fileName}`;
                
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
                    message: `Upload question for ${type} Day ${day}`,
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

        progressBar.style.width = '100%';
        
        if (failCount === 0) {
            progressText.textContent = `✅ Question paper(s) uploaded successfully!`;
            setTimeout(() => {
                progressPanel.classList.remove('show');
                event.target.reset();
                clearFiles('question');
                alert(`✅ Question upload complete!\n${successCount} file(s) uploaded.\n\nPath: ${type}/Day ${day}/Questions/`);
            }, 2000);
        } else {
            progressText.textContent = `⚠️ Uploaded ${successCount}, ${failCount} failed`;
            alert(`⚠️ Upload partially complete:\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
        }

    } catch (error) {
        progressText.textContent = '❌ Upload failed: ' + error.message;
        progressBar.style.width = '0%';
        console.error('Question upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    }
}

// ============================================
// UPDATE FILES FEATURE
// ============================================

async function loadUpdateFiles(type) {
    if (!type) {
        document.getElementById('update-form-container').style.display = 'none';
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        alert('❌ Please save GitHub token first!');
        return;
    }

    const container = document.getElementById('update-files-list');
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading files...</p>';
    document.getElementById('update-form-container').style.display = 'block';

    try {
        const owner = 'Akhinoor14';
        const repo = type === 'Solo' ? 'SOLIDWORKS-Projects' : 'SOLIDWORKS-Projects';
        const folderPath = type === 'Solo' ? 'Solo-Projects' : type;
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: { 
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const folders = await response.json();
        
        let html = '<div style="display: grid; gap: 15px;">';
        folders.forEach(folder => {
            if (folder.type === 'dir') {
                html += `
                    <div class="file-item" style="cursor: pointer;" onclick="selectUpdateFolder('${type}', '${folder.name}', '${folder.path}')">
                        <div class="file-info">
                            <i class="fas fa-folder file-icon"></i>
                            <div class="file-name">${folder.name}</div>
                        </div>
                        <i class="fas fa-chevron-right" style="color: #cc0000;"></i>
                    </div>
                `;
            }
        });
        html += '</div>';
        
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p style="text-align: center; color: #dc3545;">Failed to load files: ' + error.message + '</p>';
    }
}

async function selectUpdateFolder(type, folderName, folderPath) {
    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found!');
        return;
    }

    const container = document.getElementById('update-files-list');
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading files in ' + folderName + '...</p>';

    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: { 
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load folder contents');
        
        const files = await response.json();
        
        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary btn-small" onclick="loadUpdateFiles('${type}')">
                    <i class="fas fa-arrow-left"></i> Back to Folders
                </button>
            </div>
            <h4 style="color: #ff3333; margin-bottom: 15px;"><i class="fas fa-folder-open"></i> Files in ${folderName}</h4>
            <div style="display: grid; gap: 15px;">
        `;
        
        files.forEach(file => {
            if (file.type === 'file') {
                html += `
                    <div class="file-item">
                        <div class="file-info">
                            <i class="fas fa-file file-icon"></i>
                            <div>
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${formatFileSize(file.size)}</div>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-small" onclick="showUpdateFileDialog('${file.path}', '${file.name}', '${file.sha}')">
                            <i class="fas fa-edit"></i> Update
                        </button>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p style="text-align: center; color: #dc3545;">Failed to load folder: ' + error.message + '</p>';
    }
}

function showUpdateFileDialog(filePath, fileName, sha) {
    const modal = document.createElement('div');
    modal.id = 'update-file-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(30, 0, 0, 0.98), rgba(10, 0, 0, 0.98)); border: 2px solid rgba(204, 0, 0, 0.4); border-radius: 20px; padding: 40px; max-width: 500px; width: 90%;">
            <h3 style="color: #ff3333; margin-bottom: 20px;"><i class="fas fa-edit"></i> Update File</h3>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">File: <strong>${fileName}</strong></p>
            <input type="file" id="update-file-input" style="margin-bottom: 20px; padding: 10px; background: rgba(0,0,0,0.5); border: 2px solid rgba(204,0,0,0.3); border-radius: 10px; color: #fff; width: 100%;">
            <div style="display: flex; gap: 15px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeUpdateModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-primary" onclick="performFileUpdate('${filePath}', '${fileName}', '${sha}')">
                    <i class="fas fa-sync"></i> Update File
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeUpdateModal() {
    const modal = document.getElementById('update-file-modal');
    if (modal) modal.remove();
}

async function performFileUpdate(filePath, fileName, sha) {
    const fileInput = document.getElementById('update-file-input');
    const newFile = fileInput.files[0];
    
    if (!newFile) {
        alert('❌ Please select a new file to upload');
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found!');
        return;
    }

    try {
        const content = await readFileAsBase64(newFile);
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        
        const uploadData = {
            message: `Update ${fileName}`,
            content: content,
            sha: sha,
            branch: 'main'
        };
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        if (response.ok) {
            alert('✅ File updated successfully!');
            closeUpdateModal();
            // Reload the folder
            const type = document.getElementById('update-type').value;
            loadUpdateFiles(type);
        } else {
            const error = await response.text();
            throw new Error(error);
        }
        
    } catch (error) {
        console.error('Update error:', error);
        alert('❌ Failed to update file: ' + error.message);
    }
}

function proceedUpdate() {
    const type = document.getElementById('update-type').value;
    if (!type) {
        alert('❌ Please select a project type first');
        return;
    }
    loadUpdateFiles(type);
}

// ============================================
// DELETE FILES FEATURE
// ============================================

async function loadDeleteFiles(type) {
    if (!type) {
        document.getElementById('delete-form-container').style.display = 'none';
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        alert('❌ Please save GitHub token first!');
        return;
    }

    const container = document.getElementById('delete-files-list');
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading files...</p>';
    document.getElementById('delete-form-container').style.display = 'block';

    try {
        const owner = 'Akhinoor14';
        const repo = type === 'Solo' ? 'SOLIDWORKS-Projects' : 'SOLIDWORKS-Projects';
        const folderPath = type === 'Solo' ? 'Solo-Projects' : type;
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: { 
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load files');
        
        const folders = await response.json();
        
        let html = '<div style="display: grid; gap: 15px;">';
        folders.forEach(folder => {
            if (folder.type === 'dir') {
                html += `
                    <div class="file-item" style="cursor: pointer;" onclick="selectDeleteFolder('${type}', '${folder.name}', '${folder.path}')">
                        <div class="file-info">
                            <i class="fas fa-folder file-icon"></i>
                            <div class="file-name">${folder.name}</div>
                        </div>
                        <i class="fas fa-chevron-right" style="color: #cc0000;"></i>
                    </div>
                `;
            }
        });
        html += '</div>';
        
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p style="text-align: center; color: #dc3545;">Failed to load files: ' + error.message + '</p>';
    }
}

async function selectDeleteFolder(type, folderName, folderPath) {
    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found!');
        return;
    }

    const container = document.getElementById('delete-files-list');
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);"><i class="fas fa-spinner fa-spin"></i> Loading files in ' + folderName + '...</p>';

    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`, {
            headers: { 
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load folder contents');
        
        const files = await response.json();
        
        let html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary btn-small" onclick="loadDeleteFiles('${type}')">
                    <i class="fas fa-arrow-left"></i> Back to Folders
                </button>
            </div>
            <h4 style="color: #dc3545; margin-bottom: 15px;"><i class="fas fa-folder-open"></i> Files in ${folderName}</h4>
            <div style="display: grid; gap: 15px;">
        `;
        
        files.forEach(file => {
            if (file.type === 'file') {
                html += `
                    <div class="file-item">
                        <div class="file-info">
                            <input type="checkbox" class="delete-file-checkbox" data-path="${file.path}" data-sha="${file.sha}" data-name="${file.name}" style="width: 20px; height: 20px; cursor: pointer; margin-right: 10px;">
                            <i class="fas fa-file file-icon"></i>
                            <div>
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${formatFileSize(file.size)}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        html += `
            </div>
            <div style="margin-top: 30px; text-align: center;">
                <button class="btn btn-primary" style="background: linear-gradient(135deg, #dc3545, #c82333);" onclick="confirmDeleteFiles()">
                    <i class="fas fa-trash-alt"></i> Delete Selected Files
                </button>
            </div>
        `;
        
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p style="text-align: center; color: #dc3545;">Failed to load folder: ' + error.message + '</p>';
    }
}

async function confirmDeleteFiles() {
    const checkboxes = document.querySelectorAll('.delete-file-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('❌ Please select at least one file to delete');
        return;
    }

    const fileNames = Array.from(checkboxes).map(cb => cb.dataset.name);
    const confirmed = confirm(`⚠️ Are you sure you want to delete ${checkboxes.length} file(s)?\n\n${fileNames.join('\n')}\n\nThis action cannot be undone!`);
    
    if (!confirmed) return;

    const token = getGitHubToken();
    if (!token) {
        alert('❌ GitHub token not found!');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const checkbox of checkboxes) {
        const filePath = checkbox.dataset.path;
        const sha = checkbox.dataset.sha;
        const fileName = checkbox.dataset.name;

        try {
            const owner = 'Akhinoor14';
            const repo = 'SOLIDWORKS-Projects';
            
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete ${fileName}`,
                    sha: sha,
                    branch: 'main'
                })
            });
            
            if (response.ok) {
                successCount++;
            } else {
                failCount++;
                console.error(`Failed to delete ${fileName}:`, await response.text());
            }
            
        } catch (error) {
            failCount++;
            console.error(`Error deleting ${fileName}:`, error);
        }
    }

    if (failCount === 0) {
        alert(`✅ Successfully deleted ${successCount} file(s)!`);
        const type = document.getElementById('delete-type').value;
        loadDeleteFiles(type);
    } else {
        alert(`⚠️ Deletion partially complete:\n✅ Deleted: ${successCount}\n❌ Failed: ${failCount}\n\nCheck console for details.`);
    }
}

function proceedDelete() {
    const type = document.getElementById('delete-type').value;
    if (!type) {
        alert('❌ Please select a project type first');
        return;
    }
    loadDeleteFiles(type);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateTokenStatus();
    setupFileHandlers('cw');
    setupFileHandlers('hw');
    setupFileHandlers('solo');
    setupFileHandlers('question');
    
    const savedToken = getGitHubToken();
    if (savedToken) {
        document.getElementById('github-token').value = savedToken;
    }
});
