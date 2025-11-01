/**
 * SOLIDWORKS Upload Manager - Complete Implementation
 * Integrated with existing script.js patterns and GitHub API
 */

// ============================================
// MODERN TOAST NOTIFICATION SYSTEM
// ============================================

function showToast(title, message, type = 'info', duration = 5000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const toastId = `toast-${Date.now()}`;
    toast.id = toastId;
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        loading: 'fa-spinner fa-spin'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="closeToast('${toastId}')">
            <i class="fas fa-times"></i>
        </button>
        ${type !== 'loading' ? '<div class="toast-progress"></div>' : ''}
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remove after duration (except for loading toasts)
    if (type !== 'loading' && duration > 0) {
        setTimeout(() => closeToast(toastId), duration);
    }
    
    return toastId;
}

function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.add('hide');
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }
}

function updateToast(toastId, title, message, type) {
    const toast = document.getElementById(toastId);
    if (toast) {
        // Update type
        toast.className = `toast show ${type}`;
        
        // Update content
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            loading: 'fa-spinner fa-spin'
        };
        
        toast.querySelector('.toast-icon i').className = `fas ${icons[type]}`;
        toast.querySelector('.toast-title').textContent = title;
        toast.querySelector('.toast-message').textContent = message;
        
        // Add progress bar if not loading
        if (type !== 'loading' && !toast.querySelector('.toast-progress')) {
            const progress = document.createElement('div');
            progress.className = 'toast-progress';
            toast.appendChild(progress);
            
            // Auto-close after 5 seconds
            setTimeout(() => closeToast(toastId), 5000);
        }
    }
}

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
        showToast('Invalid Token', 'Please enter a valid GitHub token', 'warning');
        return;
    }
    localStorage.setItem('github_token', token);
    updateTokenStatus();
    showToast('Token Saved!', 'GitHub authentication token saved successfully', 'success');
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
        showToast('Missing Information', 'Please fill all fields and select files to upload', 'warning');
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        showToast('Authentication Required', 'GitHub token not found. Please save your token first!', 'error');
        return;
    }

    // Show progress
    const progressPanel = document.getElementById(prefix + '-progress');
    const progressBar = document.getElementById(prefix + '-bar');
    const progressText = document.getElementById(prefix + '-text');
    
    progressPanel.classList.add('show');
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting upload...';
    
    const uploadToast = showToast('Upload Started', `Uploading ${files.length} file(s) to ${type} Day ${day}/${type} ${number}...`, 'loading', 0);

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
            updateToast(uploadToast, 'Upload Complete!', `Successfully uploaded ${successCount} file(s) to ${type} Day ${day}`, 'success');
            
            // Log success
            console.log('Upload complete:', uploadedFiles);
            
            setTimeout(() => {
                progressPanel.classList.remove('show');
                event.target.reset();
                clearFiles(prefix);
                
                // Show clickable redirect toast
                const redirectToast = document.getElementById(showToast(
                    'View Your Projects?',
                    'Click this notification to view uploaded files',
                    'info',
                    10000
                ));
                if (redirectToast) {
                    redirectToast.style.cursor = 'pointer';
                    redirectToast.onclick = () => window.location.href = 'projects.html';
                }
            }, 2000);
        } else {
            progressText.textContent = `⚠️ Uploaded ${successCount} file(s), ${failCount} failed`;
            updateToast(uploadToast, 'Upload Incomplete', `${successCount} succeeded, ${failCount} failed - Check console`, 'warning');
        }

    } catch (error) {
        progressText.textContent = '❌ Upload failed: ' + error.message;
        progressBar.style.width = '0%';
        updateToast(uploadToast, 'Upload Failed', error.message, 'error');
        console.error('Upload error:', error);
    }
}

// ============================================
// SOLO PROJECT UPLOAD - COMPLETE IMPLEMENTATION
// ============================================

async function handleSoloUpload(event) {
    event.preventDefault();
    
    const mode = document.getElementById('solo-mode').value;
    const fileInput = document.getElementById('solo-files');
    const files = fileInput.files;
    const commitMsg = document.getElementById('solo-commit-msg').value.trim();

    if (!mode) {
        showToast('Upload Mode Required', 'Please select upload mode (New Project or Add to Existing)', 'warning');
        return;
    }

    if (files.length === 0) {
        showToast('No Files Selected', 'Please select at least one file to upload', 'warning');
        return;
    }

    const token = getGitHubToken();
    if (!token) {
        showToast('Authentication Required', 'GitHub token not found. Please save your token first!', 'error');
        return;
    }

    // Get project name based on mode
    const isNewProject = mode === 'new';
    let projectName;
    
    if (isNewProject) {
        projectName = document.getElementById('solo-project-name').value.trim();
        if (!projectName) {
            showToast('Project Name Required', 'Please enter a project name', 'warning');
            return;
        }
    } else {
        projectName = document.getElementById('solo-project-select').value;
        if (!projectName) {
            showToast('Project Selection Required', 'Please select an existing project', 'warning');
            return;
        }
    }

    const progressPanel = document.getElementById('solo-progress');
    const progressBar = document.getElementById('solo-bar');
    const progressText = document.getElementById('solo-text');
    
    progressPanel.classList.add('show');
    progressBar.style.width = '0%';
    progressText.textContent = isNewProject ? `Creating new project: ${projectName}...` : `Adding to ${projectName}...`;

    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        const basePath = 'Solo-Projects';
        const message = commitMsg || `Upload files to ${projectName}`;
        
        let successCount = 0;
        let failCount = 0;
        const uploadedFiles = [];
        
        progressText.textContent = `Uploading ${files.length} file(s) to ${projectName}...`;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length * 90);
            progressBar.style.width = progress + '%';
            progressText.textContent = `Uploading ${file.name}... (${i + 1}/${files.length})`;
            
            try {
                const content = await readFileAsBase64(file);
                const uploadPath = `${basePath}/${projectName}/${file.name}`;
                
                // Check if file exists (for overwrite detection)
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
                    // File doesn't exist, which is fine
                }
                
                // Upload file
                const uploadData = {
                    message: `${message} - ${file.name}`,
                    content: content,
                    branch: 'main'
                };
                
                if (sha) {
                    uploadData.sha = sha; // Include SHA for updates
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
            progressText.textContent = `✅ Successfully uploaded ${successCount} file(s) to ${projectName}!`;
            
            // Log success
            console.log('Solo project upload complete:', uploadedFiles);
            
            setTimeout(() => {
                progressPanel.classList.remove('show');
                event.target.reset();
                clearFiles('solo');
                
                // Reset form
                if (isNewProject) {
                    document.getElementById('solo-project-name').value = '';
                }
                document.getElementById('solo-commit-msg').value = '';
                
                // Show success with redirect option
                const viewProjects = confirm(`✅ Upload complete!\n${successCount} file(s) uploaded to ${projectName}.\n\nPath: Solo-Projects/${projectName}/\n\n📌 Click OK to view your Solo Projects now, or Cancel to continue uploading.`);
                
                if (viewProjects) {
                    window.location.href = 'projects.html';
                }
            }, 2000);
        } else {
            progressText.textContent = `⚠️ Uploaded ${successCount}, ${failCount} failed`;
            alert(`⚠️ Upload partially complete:\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n\nCheck console for details.`);
        }

    } catch (error) {
        progressText.textContent = '❌ Upload failed: ' + error.message;
        progressBar.style.width = '0%';
        console.error('Solo upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    }
}

// Load existing Solo Projects for dropdown
async function loadSoloProjects() {
    const select = document.getElementById('solo-project-select');
    if (!select) return;
    
    const token = getGitHubToken();
    if (!token) {
        select.innerHTML = '<option value="">⚠️ Token required</option>';
        return;
    }
    
    select.innerHTML = '<option value="">Loading projects...</option>';
    
    try {
        const owner = 'Akhinoor14';
        const repo = 'SOLIDWORKS-Projects';
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Solo-Projects`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            select.innerHTML = '<option value="">No projects found</option>';
            return;
        }
        
        const items = await response.json();
        const projects = items.filter(item => item.type === 'dir' && /^Project\s*\d+|^Project\s+.+/i.test(item.name));
        
        if (projects.length === 0) {
            select.innerHTML = '<option value="">No projects found</option>';
            return;
        }
        
        // Sort projects by number
        projects.sort((a, b) => {
            const numA = parseInt(a.name.replace(/Project\s*/i, '')) || 0;
            const numB = parseInt(b.name.replace(/Project\s*/i, '')) || 0;
            return numA - numB;
        });
        
        let html = '<option value="">-- Choose Project --</option>';
        projects.forEach(project => {
            html += `<option value="${project.name}">${project.name}</option>`;
        });
        select.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading projects:', error);
        select.innerHTML = '<option value="">Error loading projects</option>';
    }
}

// Toggle Solo Project upload mode
function toggleSoloMode() {
    const mode = document.getElementById('solo-mode').value;
    const newProjectField = document.getElementById('solo-new-project-field');
    const existingProjectField = document.getElementById('solo-existing-project-field');
    
    if (mode === 'new') {
        newProjectField.style.display = 'block';
        existingProjectField.style.display = 'none';
    } else if (mode === 'existing') {
        newProjectField.style.display = 'none';
        existingProjectField.style.display = 'block';
        loadSoloProjects(); // Load existing projects
    } else {
        newProjectField.style.display = 'none';
        existingProjectField.style.display = 'none';
    }
}

// ============================================
// QUESTION UPLOAD - COMPLETE IMPLEMENTATION
// ============================================

function toggleQuestionType() {
    const type = document.getElementById('question-type').value;
    const cwHwFields = document.getElementById('question-cw-hw-fields');
    const soloFields = document.getElementById('question-solo-fields');
    
    if (type === 'CW' || type === 'HW') {
        cwHwFields.style.display = 'block';
        soloFields.style.display = 'none';
        loadQuestionWorkNumbers();
    } else if (type === 'SOLO') {
        cwHwFields.style.display = 'none';
        soloFields.style.display = 'block';
        loadSoloProjectsForQuestion();
    } else {
        cwHwFields.style.display = 'none';
        soloFields.style.display = 'none';
    }
}

async function loadSoloProjectsForQuestion() {
    const token = getGitHubToken();
    if (!token) return;
    
    const select = document.getElementById('question-solo-project');
    select.innerHTML = '<option value="">Loading...</option>';
    
    try {
        const response = await fetch('https://api.github.com/repos/Akhinoor14/SOLIDWORKS-Projects/contents/Solo-Projects', {
            headers: { 
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load projects');
        
        const folders = await response.json();
        select.innerHTML = '<option value="">-- Select Project --</option>';
        
        folders.forEach(folder => {
            if (folder.type === 'dir') {
                select.innerHTML += `<option value="${folder.name}">${folder.name}</option>`;
            }
        });
    } catch (error) {
        select.innerHTML = '<option value="">Failed to load projects</option>';
        console.error('Error loading projects:', error);
    }
}

async function handleQuestionUpload(event) {
    event.preventDefault();
    
    const type = document.getElementById('question-type').value;
    const fileInput = document.getElementById('question-files');
    const fileNameInput = document.getElementById('question-filename');
    const file = fileInput.files[0];
    const fileName = fileNameInput.value.trim() || 'Question.pdf';

    if (!type || !file) {
        showToast('Missing Information', 'Please select type and file', 'warning');
        return;
    }

    // Different validation for CW/HW vs Solo
    let path;
    if (type === 'SOLO') {
        const project = document.getElementById('question-solo-project').value;
        if (!project) {
            showToast('Project Required', 'Please select a Solo Project', 'warning');
            return;
        }
        path = `Solo-Projects/${project}/${fileName}`;
    } else {
        const daySelect = document.getElementById('question-day');
        const workNumberSelect = document.getElementById('question-work-number');
        const day = daySelect.value;
        const workNumber = workNumberSelect.value;
        
        if (!day || !workNumber) {
            showToast('Missing Fields', 'Please fill all fields (Day and Work Number)', 'warning');
            return;
        }
        path = `${type}/${day}/${workNumber}/${fileName}`;
    }

    const token = getGitHubToken();
    if (!token) {
        showToast('Authentication Required', 'GitHub token not found. Please save your token first!', 'error');
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
        
        progressText.textContent = `Uploading ${fileName}...`;
        progressBar.style.width = '30%';
        
        const content = await readFileAsBase64(file);
        
        progressBar.style.width = '50%';
        
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
        
        progressBar.style.width = '70%';
        
        // Upload question file
        const uploadData = {
            message: type === 'SOLO' 
                ? `Upload problem for ${path.split('/')[1]}`
                : `Upload question for ${type} ${path.split('/')[1]}/${path.split('/')[2]}`,
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
            progressBar.style.width = '100%';
            progressText.textContent = `✅ Question uploaded successfully!`;
            
            const result = await uploadResponse.json();
            console.log('Question upload complete:', result.content);
            
            setTimeout(() => {
                progressPanel.classList.remove('show');
                event.target.reset();
                clearFiles('question');
                document.getElementById('question-filename').value = '';
                document.getElementById('question-cw-hw-fields').style.display = 'none';
                document.getElementById('question-solo-fields').style.display = 'none';
                
                // Show success with redirect option
                const message = type === 'SOLO'
                    ? `✅ Problem uploaded to Solo Project!\n\nPath: ${path}\n\n📌 The problem will appear in the "${path.split('/')[1]}" project.\n\nClick OK to view your projects now, or Cancel to continue uploading.`
                    : `✅ Question uploaded to GitHub!\n\nPath: ${path}\n\n📌 The question will appear in the "${path.split('/')[2]}" section of ${type} ${path.split('/')[1]}.\n\nClick OK to view your projects now, or Cancel to continue uploading.`;
                
                const viewProjects = confirm(message);
                
                if (viewProjects) {
                    window.location.href = 'projects.html';
                }
            }, 2000);
        } else {
            throw new Error(await uploadResponse.text());
        }

    } catch (error) {
        progressText.textContent = '❌ Upload failed: ' + error.message;
        progressBar.style.width = '0%';
        console.error('Question upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    }
}

// Auto-generate question filename based on type (CW/HW or Solo)
function updateQuestionFileName() {
    const type = document.getElementById('question-type').value;
    const fileInput = document.getElementById('question-files');
    const fileNameInput = document.getElementById('question-filename');
    const file = fileInput ? fileInput.files[0] : null;
    
    // Get file extension
    let extension = '.pdf';
    if (file) {
        const fileName = file.name;
        const lastDot = fileName.lastIndexOf('.');
        if (lastDot > -1) {
            extension = fileName.substring(lastDot);
        }
    }
    
    if (type === 'SOLO') {
        // Solo Project: problem-project1.pdf
        const project = document.getElementById('question-solo-project').value;
        if (project) {
            const projectNum = project.replace(/\D/g, ''); // Extract number
            const generatedName = `problem-project${projectNum}${extension}`;
            if (fileNameInput) {
                fileNameInput.value = generatedName;
            }
        }
    } else if (type === 'CW' || type === 'HW') {
        // CW/HW: Day_01_CW1_Question.pdf
        const daySelect = document.getElementById('question-day');
        const workNumberSelect = document.getElementById('question-work-number');
        const day = daySelect ? daySelect.value : '';
        const workNumber = workNumberSelect ? workNumberSelect.value : '';
        
        if (day && workNumber) {
            const dayFormatted = day.replace(' ', '_');
            const generatedName = `${dayFormatted}_${workNumber}_Question${extension}`;
            if (fileNameInput) {
                fileNameInput.value = generatedName;
            }
        }
    }
}

// Load work numbers dynamically based on type
function loadQuestionWorkNumbers() {
    const type = document.getElementById('question-type').value;
    const workNumberSelect = document.getElementById('question-work-number');
    
    if (!type || !workNumberSelect) return;
    
    const typeUpper = type; // CW or HW
    
    let html = `<option value="">-- Choose ${typeUpper} Number --</option>`;
    for (let i = 1; i <= 10; i++) {
        html += `<option value="${typeUpper}${i}">${typeUpper}${i}</option>`;
    }
    
    workNumberSelect.innerHTML = html;
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

async function selectUpdateFolder(type, folderName, folderPath, backPath = null) {
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
        
        const items = await response.json();
        
        // Separate folders and files
        const folders = items.filter(item => item.type === 'dir');
        const files = items.filter(item => item.type === 'file');
        
        let html = `
            <div style="margin-bottom: 20px;">
                ${backPath 
                    ? `<button class="btn btn-secondary btn-small" onclick="selectUpdateFolder('${type}', '${backPath.name}', '${backPath.path}')">
                           <i class="fas fa-arrow-left"></i> Back
                       </button>`
                    : `<button class="btn btn-secondary btn-small" onclick="loadUpdateFiles('${type}')">
                           <i class="fas fa-arrow-left"></i> Back to Folders
                       </button>`
                }
            </div>
            <h4 style="color: #ff3333; margin-bottom: 15px;"><i class="fas fa-folder-open"></i> ${folderName}</h4>
            <div style="display: grid; gap: 15px;">
        `;
        
        // Show subfolders first (for Solo Projects: CW/HW folders, then Day folders)
        folders.forEach(folder => {
            html += `
                <div class="file-item" style="cursor: pointer; background: linear-gradient(135deg, rgba(204,0,0,0.1), rgba(255,51,51,0.05));" 
                     onclick="selectUpdateFolder('${type}', '${folder.name}', '${folder.path}', {name: '${folderName}', path: '${folderPath}'})">
                    <div class="file-info">
                        <i class="fas fa-folder file-icon" style="color: #ffcc00;"></i>
                        <div class="file-name">${folder.name}</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color: #cc0000;"></i>
                </div>
            `;
        });
        
        // Show files (including question/problem files)
        files.forEach(file => {
            const isQuestion = file.name.toLowerCase().includes('question') || file.name.toLowerCase().includes('problem');
            html += `
                <div class="file-item" ${isQuestion ? 'style="border-left: 3px solid #ffcc00;"' : ''}>
                    <div class="file-info">
                        <i class="fas ${isQuestion ? 'fa-question-circle' : 'fa-file'} file-icon" style="color: ${isQuestion ? '#ffcc00' : '#fff'};"></i>
                        <div>
                            <div class="file-name">${file.name} ${isQuestion ? '<span style="color: #ffcc00; font-size: 0.8rem;">(Question)</span>' : ''}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-small" onclick="showUpdateFileDialog('${file.path}', '${file.name}', '${file.sha}')">
                        <i class="fas fa-edit"></i> Update
                    </button>
                </div>
            `;
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

async function selectDeleteFolder(type, folderName, folderPath, backPath = null) {
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
        
        const items = await response.json();
        
        // Separate folders and files
        const folders = items.filter(item => item.type === 'dir');
        const files = items.filter(item => item.type === 'file');
        
        let html = `
            <div style="margin-bottom: 20px;">
                ${backPath 
                    ? `<button class="btn btn-secondary btn-small" onclick="selectDeleteFolder('${type}', '${backPath.name}', '${backPath.path}')">
                           <i class="fas fa-arrow-left"></i> Back
                       </button>`
                    : `<button class="btn btn-secondary btn-small" onclick="loadDeleteFiles('${type}')">
                           <i class="fas fa-arrow-left"></i> Back to Folders
                       </button>`
                }
            </div>
            <h4 style="color: #dc3545; margin-bottom: 15px;"><i class="fas fa-folder-open"></i> ${folderName}</h4>
            <div style="display: grid; gap: 15px;">
        `;
        
        // Show subfolders first (for Solo Projects: CW/HW folders, then Day folders)
        folders.forEach(folder => {
            html += `
                <div class="file-item" style="cursor: pointer; background: linear-gradient(135deg, rgba(220,53,69,0.1), rgba(200,35,51,0.05));" 
                     onclick="selectDeleteFolder('${type}', '${folder.name}', '${folder.path}', {name: '${folderName}', path: '${folderPath}'})">
                    <div class="file-info">
                        <i class="fas fa-folder file-icon" style="color: #ffcc00;"></i>
                        <div class="file-name">${folder.name}</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color: #dc3545;"></i>
                </div>
            `;
        });
        
        // Show files with checkboxes (including question/problem files)
        files.forEach(file => {
            const isQuestion = file.name.toLowerCase().includes('question') || file.name.toLowerCase().includes('problem');
            html += `
                <div class="file-item" ${isQuestion ? 'style="border-left: 3px solid #ffcc00;"' : ''}>
                    <div class="file-info">
                        <input type="checkbox" class="delete-file-checkbox" data-path="${file.path}" data-sha="${file.sha}" data-name="${file.name}" style="width: 20px; height: 20px; cursor: pointer; margin-right: 10px;">
                        <i class="fas ${isQuestion ? 'fa-question-circle' : 'fa-file'} file-icon" style="color: ${isQuestion ? '#ffcc00' : '#fff'};"></i>
                        <div>
                            <div class="file-name">${file.name} ${isQuestion ? '<span style="color: #ffcc00; font-size: 0.8rem;">(Question)</span>' : ''}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                </div>
            `;
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
