/**
 * GitHub API Integration for SOLIDWORKS Upload System
 * Handles file uploads to GitHub repository with proper authentication
 */

class GitHubUploader {
    constructor(config = {}) {
        this.config = {
            owner: 'Akhinoor14',
            repo: 'SOLIDWORKS-Projects',
            token: config.token || null,
            apiBase: 'https://api.github.com/repos',
            branch: 'main',
            ...config
        };
        
        this.rateLimitDelay = 1000; // 1 second between requests
        this.maxRetries = 3;
    }

    /**
     * Set GitHub Personal Access Token
     */
    setToken(token) {
        this.config.token = token;
    }
    
    /**
     * Get GitHub token with user-friendly prompt and validation
     */
    async getValidatedToken() {
        let token = localStorage.getItem('github_token');
        
        if (!token) {
            token = this.promptForToken();
            if (!token) {
                throw new Error('GitHub token is required for upload');
            }
            
            // Validate token format
            if (!this.isValidTokenFormat(token)) {
                const proceed = confirm(
                    '⚠️ Token format looks unusual.\n\n' +
                    'GitHub tokens typically start with "ghp_" or "github_pat_"\n\n' +
                    'Continue anyway?'
                );
                if (!proceed) {
                    throw new Error('Token validation cancelled by user');
                }
            }
            
            localStorage.setItem('github_token', token);
        }
        
        this.setToken(token);
        
        // Validate token access
        try {
            const validation = await this.validateAccess();
            console.log('✅ Token validation successful');
            return validation;
        } catch (error) {
            // Clear invalid token
            localStorage.removeItem('github_token');
            throw error;
        }
    }
    
    /**
     * Show user-friendly token prompt
     */
    promptForToken() {
        return prompt(
            '🔐 GitHub Personal Access Token Required\n\n' +
            'To upload files to your repository, you need a Personal Access Token.\n\n' +
            '📋 Quick Setup Steps:\n' +
            '1. Visit: github.com/settings/tokens\n' +
            '2. Click "Generate new token (classic)"\n' +
            '3. Name it "SOLIDWORKS Upload"\n' +
            '4. Select "repo" scope (full repository access)\n' +
            '5. Click "Generate token"\n' +
            '6. Copy the token and paste below\n\n' +
            '⚠️ Important: Copy immediately - you won\'t see it again!\n\n' +
            'Paste your GitHub token here:'
        );
    }
    
    /**
     * Basic token format validation
     */
    isValidTokenFormat(token) {
        // GitHub personal access tokens start with ghp_ or github_pat_
        return token && (token.startsWith('ghp_') || token.startsWith('github_pat_'));
    }

    /**
     * Validate GitHub token and repository access
     */
    async validateAccess() {
        if (!this.config.token) {
            throw new Error('GitHub Personal Access Token is required. Please get one from GitHub Settings → Developer settings → Personal access tokens');
        }

        try {
            console.log('🔍 Validating GitHub token and repository access...');
            
            // First check if token is valid by checking user info
            const userResponse = await this.makeRequest('user', 'GET', null, 'https://api.github.com');
            console.log(`👤 Token belongs to user: ${userResponse.login}`);
            
            // Then check repository access
            const response = await this.makeRequest(`${this.config.owner}/${this.config.repo}`, 'GET');
            
            console.log(`✅ Repository found: ${response.full_name}`);
            console.log(`📊 Repository: ${response.private ? 'Private' : 'Public'}, ${response.stargazers_count || 0} stars`);
            
            // Update UI status
            this.updateRepositoryStatus('connected', response);
            
            // Check push permissions
            if (response.permissions) {
                if (response.permissions.push) {
                    console.log('✅ Token has push access to repository');
                    return { valid: true, repoInfo: response, userInfo: userResponse };
                } else {
                    throw new Error('Token does not have push (write) access to repository. Make sure the token has "repo" scope and you have write access to the repository.');
                }
            } else {
                // If permissions object not available, token might not have sufficient scope
                console.warn('⚠️ Unable to verify push permissions. Token might need "repo" scope.');
                return { valid: true, repoInfo: response, userInfo: userResponse, warning: 'Push permissions unclear' };
            }
        } catch (error) {
            console.error('❌ GitHub access validation failed:', error.message);
            
            // Update UI status
            this.updateRepositoryStatus('error', null);
            
            // Provide helpful error messages
            if (error.message.includes('401')) {
                throw new Error('Invalid GitHub token. Please check your token and ensure it has "repo" scope permissions.');
            } else if (error.message.includes('404')) {
                throw new Error(`Repository not found or access denied. Please verify the repository "Akhinoor14/SOLIDWORKS-Projects" exists and your token has access.`);
            } else if (error.message.includes('403')) {
                throw new Error('Access forbidden. Your token might not have sufficient permissions. Ensure it has "repo" scope and you have write access to the repository.');
            } else {
                throw new Error(`GitHub API error: ${error.message}. Check your internet connection and try again.`);
            }
        }
    }
    
    /**
     * Update repository status in UI
     */
    updateRepositoryStatus(status, repoData) {
        const statusElement = document.getElementById('repo-status');
        if (!statusElement) return;
        
        switch (status) {
            case 'connected':
                statusElement.textContent = 'Connected ✓';
                statusElement.className = 'repo-status-connected';
                console.log(`🔗 Repository: https://github.com/${this.config.owner}/${this.config.repo}`);
                break;
            case 'error':
                statusElement.textContent = 'Access Error';
                statusElement.className = 'repo-status-error';
                break;
            case 'checking':
                statusElement.textContent = 'Validating...';
                statusElement.className = 'repo-status-checking';
                break;
        }
    }

    /**
     * Upload a complete SOLIDWORKS project
     */
    async uploadProject(projectData) {
        const { day, type, number, files } = projectData;
        
        // Generate folder structure
        const folderPath = this.generateFolderPath(day, type, number);
        
        // Validate access first
        await this.validateAccess();
        
        const uploadResults = [];
        let uploadedCount = 0;
        
        try {
            console.log(`🚀 Starting upload to folder: ${folderPath}`);
            
            // Upload each file
            for (const file of files) {
                console.log(`📤 Uploading file: ${file.name} (${file.size} bytes)`);
                const result = await this.uploadFile(folderPath, file);
                uploadResults.push(result);
                uploadedCount++;
                
                // Update progress callback if provided
                if (projectData.onProgress) {
                    const progress = Math.round((uploadedCount / (files.length + 1)) * 90); // Reserve 10% for README
                    projectData.onProgress(progress, `Uploaded ${file.name}`);
                }
                
                // Rate limiting delay
                await this.delay(this.rateLimitDelay);
            }
            
            // Generate and upload README
            const readmeContent = this.generateREADME(day, type, number, files, uploadResults);
            const readmeResult = await this.uploadTextFile(folderPath, 'README.md', readmeContent);
            uploadResults.push(readmeResult);
            
            if (projectData.onProgress) {
                projectData.onProgress(100, 'README generated and uploaded');
            }
            
            return {
                success: true,
                folderPath: folderPath,
                folderUrl: `https://github.com/${this.config.owner}/${this.config.repo}/tree/${this.config.branch}/${folderPath}`,
                files: uploadResults,
                projectData: { day, type, number }
            };
            
        } catch (error) {
            // If upload fails partway through, we might want to clean up
            console.error('Upload failed:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Upload a single file to GitHub
     */
    async uploadFile(folderPath, file, retryCount = 0) {
        try {
            // Convert file to base64
            const base64Content = await this.fileToBase64(file);
            
            // Create file path
            const filePath = `${folderPath}/${file.name}`;
            
            // Prepare request data
            const requestData = {
                message: `Add ${file.name} for ${folderPath}`,
                content: base64Content,
                branch: this.config.branch
            };
            
            // Check if file already exists (skip for new uploads to avoid 404 errors)
            try {
                const existingFile = await this.checkFileExists(filePath);
                if (existingFile) {
                    requestData.sha = existingFile.sha;
                    console.log(`Updating existing file: ${filePath}`);
                }
            } catch (error) {
                // File doesn't exist yet, which is normal for new uploads
                console.log(`File ${filePath} doesn't exist yet, creating new file`);
            }
            
            // Upload file
            const response = await this.makeRequest(
                `${this.config.owner}/${this.config.repo}/contents/${filePath}`,
                'PUT',
                requestData
            );
            
            return {
                name: file.name,
                path: filePath,
                size: file.size,
                downloadUrl: response.content.download_url,
                htmlUrl: response.content.html_url,
                type: this.getFileType(file.name)
            };
            
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.log(`Retrying upload for ${file.name}, attempt ${retryCount + 1}`);
                await this.delay(this.rateLimitDelay * (retryCount + 1));
                return this.uploadFile(folderPath, file, retryCount + 1);
            } else {
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
        }
    }

    /**
     * Upload text content (like README) to GitHub
     */
    async uploadTextFile(folderPath, fileName, content, retryCount = 0) {
        try {
            const filePath = `${folderPath}/${fileName}`;
            const base64Content = btoa(unescape(encodeURIComponent(content)));
            
            const requestData = {
                message: `Add ${fileName} for ${folderPath}`,
                content: base64Content,
                branch: this.config.branch
            };
            
            // Check if file already exists (skip for new uploads to avoid 404 errors)
            try {
                const existingFile = await this.checkFileExists(filePath);
                if (existingFile) {
                    requestData.sha = existingFile.sha;
                }
            } catch (error) {
                // File doesn't exist yet, which is normal for new uploads
                console.log(`README ${filePath} doesn't exist yet, creating new file`);
            }
            
            const response = await this.makeRequest(
                `${this.config.owner}/${this.config.repo}/contents/${filePath}`,
                'PUT',
                requestData
            );
            
            return {
                name: fileName,
                path: filePath,
                size: content.length,
                downloadUrl: response.content.download_url,
                htmlUrl: response.content.html_url,
                type: 'readme'
            };
            
        } catch (error) {
            if (retryCount < this.maxRetries) {
                await this.delay(this.rateLimitDelay * (retryCount + 1));
                return this.uploadTextFile(folderPath, fileName, content, retryCount + 1);
            } else {
                throw new Error(`Failed to upload ${fileName}: ${error.message}`);
            }
        }
    }

    /**
     * Check if a file already exists on GitHub
     */
    async checkFileExists(filePath) {
        try {
            const response = await this.makeRequest(
                `${this.config.owner}/${this.config.repo}/contents/${filePath}`,
                'GET'
            );
            return response;
        } catch (error) {
            if (error.message.includes('404')) {
                return null; // File doesn't exist
            }
            throw error;
        }
    }

    /**
     * Generate folder path following the existing pattern
     */
    generateFolderPath(day, type, number) {
        const dayPadded = day.toString().padStart(2, '0');
        const numberPadded = number.toString().padStart(2, '0');
        
        // Follow existing pattern: CW/Day 06/cw 01 day 6
        const path = `${type}/Day ${dayPadded}/${type.toLowerCase()} ${numberPadded} day ${parseInt(day)}`;
        console.log(`📁 Generated folder path: "${path}"`);
        console.log(`📋 Parameters: day=${day}, type=${type}, number=${number}`);
        
        return path;
    }

    /**
     * Generate README content in the existing style
     */
    generateREADME(day, type, number, files, uploadResults) {
        const dayPadded = day.toString().padStart(2, '0');
        const numberPadded = number.toString().padStart(2, '0');
        const projectName = `${type} ${numberPadded} - Day ${dayPadded}`;
        
        // Organize files by type
        const filesByType = this.organizeFilesByType(files, uploadResults);
        
        // Generate description based on project type and files
        const description = this.generateProjectDescription(type, filesByType);
        
        const readme = `# ${projectName}

## Project Overview
${description}

## Files Included
${this.generateFileList(filesByType)}

## Preview
${filesByType.screenshot ? `![${projectName} Preview](${filesByType.screenshot.name})` : '*Screenshot will be available after upload*'}

## Download Instructions
1. Click on each file link above to download
2. Open the assembly file (${filesByType.assembly ? filesByType.assembly.name : '*.SLDASM'}) in SOLIDWORKS
3. Ensure all part files are in the same folder
4. Check assembly constraints and relations

## Project Details
- **Day**: ${parseInt(day)}
- **Type**: ${type === 'CW' ? 'Class Work' : 'Home Work'}
- **Project Number**: ${parseInt(number)}
- **Total Parts**: ${filesByType.parts ? filesByType.parts.length : 0}
- **Assembly File**: ${filesByType.assembly ? filesByType.assembly.name : 'Not specified'}
- **Upload Date**: ${new Date().toLocaleDateString()}

## Technical Specifications
${this.generateTechnicalSpecs(filesByType)}

---
*This README was auto-generated by the SOLIDWORKS Upload System on ${new Date().toLocaleString()}*`;

        return readme;
    }

    /**
     * Organize files by their types for README generation
     */
    organizeFilesByType(files, uploadResults) {
        const organized = {
            assembly: null,
            parts: [],
            screenshot: null,
            guide: null
        };

        files.forEach((file, index) => {
            const fileType = this.getFileType(file.name);
            const result = uploadResults[index];

            switch (fileType) {
                case 'assembly':
                    organized.assembly = { ...result, file };
                    break;
                case 'part':
                    organized.parts.push({ ...result, file });
                    break;
                case 'screenshot':
                    organized.screenshot = { ...result, file };
                    break;
                case 'guide':
                    organized.guide = { ...result, file };
                    break;
            }
        });

        return organized;
    }

    /**
     * Generate project description based on files
     */
    generateProjectDescription(type, filesByType) {
        const typeText = type === 'CW' ? 'Class Work' : 'Home Work';
        const partCount = filesByType.parts.length;
        const hasGuide = filesByType.guide !== null;

        let description = `This is a ${typeText} project featuring `;
        
        if (partCount === 0) {
            description += 'a SOLIDWORKS assembly';
        } else if (partCount === 1) {
            description += 'a single-part mechanical assembly';
        } else {
            description += `a ${partCount}-part mechanical assembly`;
        }

        description += '. The project includes detailed SOLIDWORKS files with proper constraints, relations, and technical specifications designed to enhance CAD modeling skills';

        if (hasGuide) {
            description += ', along with a comprehensive guide for better understanding';
        }

        description += '.';

        return description;
    }

    /**
     * Generate file list for README
     */
    generateFileList(filesByType) {
        let fileList = '';

        if (filesByType.assembly) {
            fileList += `- **Assembly File**: [${filesByType.assembly.name}](${filesByType.assembly.name})\n`;
        }

        filesByType.parts.forEach((part, index) => {
            fileList += `- **Part File ${index + 1}**: [${part.name}](${part.name})\n`;
        });

        if (filesByType.screenshot) {
            fileList += `- **Screenshot**: [${filesByType.screenshot.name}](${filesByType.screenshot.name})\n`;
        }

        if (filesByType.guide) {
            fileList += `- **Guide**: [${filesByType.guide.name}](${filesByType.guide.name})\n`;
        }

        return fileList.trim();
    }

    /**
     * Generate technical specifications
     */
    generateTechnicalSpecs(filesByType) {
        let specs = '';
        
        if (filesByType.assembly) {
            specs += `- **Assembly Format**: SOLIDWORKS Assembly (.SLDASM)\n`;
        }
        
        if (filesByType.parts.length > 0) {
            specs += `- **Part Format**: SOLIDWORKS Part (.SLDPRT)\n`;
            specs += `- **Number of Components**: ${filesByType.parts.length} parts\n`;
        }
        
        if (filesByType.screenshot) {
            const ext = this.getFileExtension(filesByType.screenshot.name);
            specs += `- **Preview Format**: ${ext.toUpperCase()} image\n`;
        }

        specs += `- **Compatibility**: SOLIDWORKS 2020 or later\n`;
        specs += `- **File Size**: ${this.calculateTotalSize(filesByType)} total\n`;

        return specs;
    }

    /**
     * Calculate total file size
     */
    calculateTotalSize(filesByType) {
        let totalSize = 0;
        
        if (filesByType.assembly) totalSize += filesByType.assembly.size;
        filesByType.parts.forEach(part => totalSize += part.size);
        if (filesByType.screenshot) totalSize += filesByType.screenshot.size;
        if (filesByType.guide) totalSize += filesByType.guide.size;

        return this.formatFileSize(totalSize);
    }

    /**
     * Make HTTP request to GitHub API
     */
    async makeRequest(endpoint, method = 'GET', data = null, customBaseUrl = null) {
        const baseUrl = customBaseUrl || this.config.apiBase;
        const url = `${baseUrl}/${endpoint}`;
        
        console.log(`🔍 GitHub API Request: ${method} ${url}`);
        if (data && method === 'PUT') {
            console.log(`📝 Request data keys:`, Object.keys(data));
        }
        
        const options = {
            method: method,
            headers: {
                'Authorization': `token ${this.config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SOLIDWORKS-Upload-System'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            console.error(`❌ API Error: ${method} ${url}`);
            console.error(`❌ Status: ${response.status} ${response.statusText}`);
            console.error(`❌ Error details:`, errorData);
            
            // Provide helpful error messages
            if (response.status === 404) {
                if (url.includes('/contents/')) {
                    throw new Error(`File path not found. This might be the first upload to this folder. Original error: ${errorMessage}`);
                } else {
                    throw new Error(`Repository not found or you don't have access. Check repository name and token permissions. Original error: ${errorMessage}`);
                }
            } else if (response.status === 403) {
                throw new Error(`Access forbidden. Your token might not have sufficient permissions. Ensure it has 'repo' scope. Original error: ${errorMessage}`);
            } else if (response.status === 401) {
                throw new Error(`Authentication failed. Please check your GitHub token. Original error: ${errorMessage}`);
            }
            
            throw new Error(errorMessage);
        }

        return await response.json();
    }

    /**
     * Convert file to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Utility methods
     */
    getFileType(fileName) {
        const extension = this.getFileExtension(fileName);
        
        if (extension === '.sldasm') return 'assembly';
        if (extension === '.sldprt') return 'part';
        if (['.png', '.jpg', '.jpeg'].includes(extension)) return 'screenshot';
        if (extension === '.pdf') return 'guide';
        
        return 'unknown';
    }

    getFileExtension(fileName) {
        return '.' + fileName.split('.').pop().toLowerCase();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * GitHub Token Manager for secure token handling
 */
class GitHubTokenManager {
    constructor() {
        this.tokenKey = 'solidworks_github_token';
        this.token = null;
    }

    /**
     * Set and store GitHub token securely
     */
    setToken(token) {
        this.token = token;
        // Store in sessionStorage (cleared when browser closes)
        sessionStorage.setItem(this.tokenKey, token);
    }

    /**
     * Get stored token
     */
    getToken() {
        if (this.token) {
            return this.token;
        }
        
        // Try to get from sessionStorage
        const stored = sessionStorage.getItem(this.tokenKey);
        if (stored) {
            this.token = stored;
            return stored;
        }
        
        return null;
    }

    /**
     * Clear stored token
     */
    clearToken() {
        this.token = null;
        sessionStorage.removeItem(this.tokenKey);
    }

    /**
     * Check if token is available
     */
    hasToken() {
        return !!this.getToken();
    }

    /**
     * Prompt user for GitHub token if not available
     */
    async promptForToken() {
        if (this.hasToken()) {
            return this.getToken();
        }

        const token = prompt(`
GitHub Personal Access Token Required

To upload files to your GitHub repository, please provide your Personal Access Token.

How to create a token:
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select 'repo' scope for full repository access
4. Copy the generated token

Enter your GitHub token:`);

        if (token && token.trim()) {
            this.setToken(token.trim());
            return token.trim();
        }

        throw new Error('GitHub token is required for upload functionality');
    }
}

// Export classes for use in other modules
window.GitHubUploader = GitHubUploader;
window.GitHubTokenManager = GitHubTokenManager;