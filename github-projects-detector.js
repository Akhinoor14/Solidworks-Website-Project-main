/**
 * 🔄 GitHub Projects Auto-Detector & Updater
 * Automatically detects all projects from GitHub and updates website
 * Solves the problem of missing GitHub projects on website
 */

class GitHubProjectsAutoDetector {
    constructor(username, repository) {
        this.username = username;
        this.repository = repository;
        this.baseUrl = `https://api.github.com/repos/${username}/${repository}/contents`;
        this.detectedProjects = {};
        this.totalCW = 0;
        this.totalHW = 0;
    }

    /**
     * 🚀 Auto-detect and update all missing projects
     */
    async autoDetectAndUpdate() {
        try {
            console.log('🔍 Auto-detecting all GitHub projects...');
            
            // Show progress notification
            if (typeof showNotification === 'function') {
                showNotification('🔍 Scanning GitHub repository for all projects...', 'info');
            }

            // Step 1: Get repository structure
            const structure = await this.scanRepository();
            
            // Step 2: Detect all projects
            const detectedProjects = await this.detectAllProjects(structure);
            
            // Step 3: Update website data
            this.updateWebsiteProjects(detectedProjects);
            
            // Step 4: Update counters
            this.updateCounters();
            
            // Step 5: Show results
            this.showResults(detectedProjects);
            
            console.log('✅ Auto-detection and update completed!');
            
            if (typeof showNotification === 'function') {
                showNotification(`✅ Found and updated ${this.totalCW + this.totalHW} projects from GitHub!`, 'success');
            }

            return detectedProjects;

        } catch (error) {
            console.error('❌ Auto-detection failed:', error);
            
            if (typeof showNotification === 'function') {
                showNotification(`❌ Auto-detection failed: ${error.message}`, 'error');
            }
            
            throw error;
        }
    }

    /**
     * 📡 Scan GitHub repository structure
     */
    async scanRepository() {
        console.log('📡 Scanning repository structure...');
        
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error(`Repository not accessible: ${response.status}`);
        }
        
        const contents = await response.json();
        
        // Find CW and HW folders
        const cwFolder = contents.find(item => 
            item.type === 'dir' && item.name.toLowerCase() === 'cw'
        );
        const hwFolder = contents.find(item => 
            item.type === 'dir' && item.name.toLowerCase() === 'hw'
        );

        const structure = {};
        
        if (cwFolder) {
            structure.cw = await this.scanFolder(cwFolder.url);
        }
        
        if (hwFolder) {
            structure.hw = await this.scanFolder(hwFolder.url);
        }

        console.log('📊 Repository structure:', structure);
        return structure;
    }

    /**
     * 📁 Scan individual folder
     */
    async scanFolder(folderUrl) {
        try {
            const response = await fetch(folderUrl);
            if (!response.ok) return [];
            
            const contents = await response.json();
            
            // Filter day folders
            const dayFolders = contents
                .filter(item => 
                    item.type === 'dir' && 
                    item.name.match(/Day\s*\d+/i)
                )
                .sort((a, b) => {
                    const dayA = parseInt(a.name.replace(/\D/g, ''));
                    const dayB = parseInt(b.name.replace(/\D/g, ''));
                    return dayA - dayB;
                });

            return dayFolders;
            
        } catch (error) {
            console.warn(`⚠️ Failed to scan folder ${folderUrl}:`, error.message);
            return [];
        }
    }

    /**
     * 🔍 Detect all projects from structure
     */
    async detectAllProjects(structure) {
        console.log('🔍 Detecting projects from structure...');
        
        const projects = {};

        // Process CW projects
        if (structure.cw) {
            for (const dayFolder of structure.cw) {
                const dayKey = this.normalizeDayName(dayFolder.name);
                
                if (!projects[dayKey]) {
                    projects[dayKey] = {};
                }
                
                projects[dayKey].cw = await this.detectDayProjects(dayFolder, 'CW');
                this.totalCW += projects[dayKey].cw.length;
            }
        }

        // Process HW projects
        if (structure.hw) {
            for (const dayFolder of structure.hw) {
                const dayKey = this.normalizeDayName(dayFolder.name);
                
                if (!projects[dayKey]) {
                    projects[dayKey] = {};
                }
                
                projects[dayKey].hw = await this.detectDayProjects(dayFolder, 'HW');
                this.totalHW += projects[dayKey].hw.length;
            }
        }

        console.log(`📊 Detected: ${this.totalCW} CW projects, ${this.totalHW} HW projects`);
        return projects;
    }

    /**
     * 📅 Normalize day name format
     */
    normalizeDayName(dayName) {
        // Convert "Day 1", "Day 01", "Day1" etc. to "Day 01"
        const dayNumber = dayName.replace(/\D/g, '');
        return `Day ${dayNumber.padStart(2, '0')}`;
    }

    /**
     * 🗂️ Detect projects in a day folder
     */
    async detectDayProjects(dayFolder, type) {
        try {
            const response = await fetch(dayFolder.url);
            if (!response.ok) return [];
            
            const contents = await response.json();
            
            // Look for project subfolders or files
            const projects = [];
            let projectCount = 1;

            // Check if there are subfolders (like "cw 1 day 01", "cw 2 day 01")
            const projectFolders = contents.filter(item => 
                item.type === 'dir'
            );

            if (projectFolders.length > 0) {
                // Multiple projects in subfolders
                for (const projectFolder of projectFolders) {
                    const project = await this.createProjectFromFolder(projectFolder, type, dayFolder.name, projectCount);
                    if (project) {
                        projects.push(project);
                        projectCount++;
                    }
                }
            } else {
                // Single project in day folder
                const project = await this.createProjectFromFolder(dayFolder, type, dayFolder.name, 1);
                if (project) {
                    projects.push(project);
                }
            }

            return projects;
            
        } catch (error) {
            console.warn(`⚠️ Failed to detect projects in ${dayFolder.name}:`, error.message);
            return [];
        }
    }

    /**
     * 🏗️ Create project object from folder
     */
    async createProjectFromFolder(folder, type, dayName, projectNumber) {
        try {
            const response = await fetch(folder.url);
            if (!response.ok) return null;
            
            const contents = await response.json();

            // Find files
            const swFiles = contents.filter(file => 
                file.type === 'file' && this.isSolidWorksFile(file.name)
            );
            
            const imageFiles = contents.filter(file => 
                file.type === 'file' && this.isImageFile(file.name)
            );
            
            const readmeFile = contents.find(file => 
                file.type === 'file' && file.name.toLowerCase().includes('readme')
            );

            // Create downloads array
            const downloads = swFiles.map(file => ({
                type: this.getFileType(file.name),
                url: file.download_url
            }));

            const project = {
                name: `${type} ${projectNumber} - ${this.normalizeDayName(dayName)}`,
                page: readmeFile ? readmeFile.html_url : folder.html_url,
                downloads: downloads,
                preview: imageFiles.length > 0 ? imageFiles[0].download_url : null
            };

            // Add additional previews if available
            if (imageFiles.length > 1) {
                imageFiles.slice(1).forEach((img, index) => {
                    project[`preview${index + 2}`] = img.download_url;
                });
            }

            // Add 3D model if available
            const modelFile = contents.find(file => 
                file.type === 'file' && file.name.toLowerCase().endsWith('.glb')
            );
            if (modelFile) {
                project.model3d = modelFile.download_url;
            }

            return project;
            
        } catch (error) {
            console.warn(`⚠️ Failed to create project from ${folder.name}:`, error.message);
            return null;
        }
    }

    /**
     * 🔄 Update website projects data
     */
    updateWebsiteProjects(detectedProjects) {
        console.log('🔄 Updating website projects data...');
        
        if (typeof window !== 'undefined') {
            // Merge with existing projects, prioritizing detected projects
            window.dayProjects = { ...window.dayProjects, ...detectedProjects };
            
            console.log('✅ Website projects data updated');
        }
    }

    /**
     * 📊 Update ALL website counters using global utility
     */
    updateCounters() {
        console.log('📊 [Auto-Detector] Using global counter update...');
        
        const totalDays = Object.keys(this.detectedProjects).length;
        
        // Use global counter update utility
        if (typeof window.updateAllCountersGlobally === 'function') {
            window.updateAllCountersGlobally(this.totalCW, this.totalHW, totalDays);
        } else {
            console.warn('⚠️ Global counter utility not available, using fallback...');
            
            // Fallback method
            const totalProjects = this.totalCW + this.totalHW;
            
            // Update SOLIDWORKS Meta Counters only
            const metaCounters = document.querySelectorAll('.sw-meta-num');
            if (metaCounters.length >= 3) {
                metaCounters[0].textContent = this.totalCW;      // CW
                metaCounters[1].textContent = this.totalHW;      // HW  
                metaCounters[2].textContent = totalProjects;     // Total
            }
            
            console.log(`✅ Fallback counters updated: ${this.totalCW} CW + ${this.totalHW} HW = ${totalProjects} Total`);
        }
    }

    /**
     * 📈 Show detection results
     */
    showResults(detectedProjects = {}) {
        const projectDays = Object.keys(detectedProjects);
        const results = `
🎯 AUTO-DETECTION RESULTS:

📊 Projects Found:
• Class Work (CW): ${this.totalCW} projects
• Home Work (HW): ${this.totalHW} projects
• Total Projects: ${this.totalCW + this.totalHW} projects

🗓️ Days Covered: ${projectDays.length} days

✅ All GitHub projects are now synchronized with the website!
✅ Counters updated automatically
✅ Navigation links working

Your website now reflects all your GitHub uploads! 🚀
        `;

        console.log(results);

        if (typeof showNotification === 'function') {
            showNotification(results, 'success');
        }
    }

    /**
     * 🔧 Helper functions
     */
    isSolidWorksFile(filename) {
        const extensions = ['.sldprt', '.sldasm', '.slddrw'];
        return extensions.some(ext => filename.toLowerCase().endsWith(ext));
    }
    
    isImageFile(filename) {
        const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
        return extensions.some(ext => filename.toLowerCase().endsWith(ext));
    }
    
    getFileType(filename) {
        const lower = filename.toLowerCase();
        if (lower.endsWith('.sldasm')) return 'Assembly';
        if (lower.endsWith('.sldprt')) return 'Part';
        if (lower.endsWith('.slddrw')) return 'Drawing';
        return 'File';
    }
}

// Initialize auto-detector
let projectDetector = null;

// Make it globally accessible
window.detectAllGitHubProjects = async () => {
    if (!projectDetector) {
        projectDetector = new GitHubProjectsAutoDetector('Akhinoor14', 'SOLIDWORKS-Projects');
    }
    
    return await projectDetector.autoDetectAndUpdate();
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubProjectsAutoDetector;
}