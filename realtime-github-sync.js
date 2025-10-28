/**
 * 🚀 REAL-TIME GITHUB SYNC SYSTEM
 * Automatically syncs website with GitHub uploads without manual intervention
 * Solves the core problem of GitHub uploads not reflecting on website
 */

class RealTimeGitHubSync {
    constructor(username, repository) {
        this.username = username;
        this.repository = repository;
        this.baseUrl = `https://api.github.com/repos/${username}/${repository}`;
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || '0';
        this.syncInterval = null;
        this.isActiveSyncing = false;
    }

    /**
     * 🔄 Start automatic real-time monitoring
     */
    startRealTimeSync() {
        console.log('🚀 Starting real-time GitHub sync...');
        
        // Initial sync
        this.performSync();
        
        // Set up polling every 30 seconds
        this.syncInterval = setInterval(() => {
            if (!this.isActiveSyncing) {
                this.performSync();
            }
        }, 30000); // 30 seconds
        
        // Also sync on window focus (when user returns to tab)
        window.addEventListener('focus', () => {
            if (!this.isActiveSyncing) {
                console.log('🔄 Window focused, checking for updates...');
                this.performSync();
            }
        });
        
        console.log('✅ Real-time sync activated (30-second intervals)');
    }

    /**
     * 📡 Perform sync operation
     */
    async performSync() {
        if (this.isActiveSyncing) return;
        
        this.isActiveSyncing = true;
        
        try {
            console.log('🔄 Checking for GitHub updates...');
            
            // Get repository information including last push time
            const repoInfo = await fetch(`${this.baseUrl}`);
            if (!repoInfo.ok) throw new Error('Repository not accessible');
            
            const repoData = await repoInfo.json();
            const lastPushTime = new Date(repoData.pushed_at).getTime();
            const lastSyncTime = parseInt(this.lastSyncTime);
            
            console.log(`📊 Last push: ${repoData.pushed_at}, Last sync: ${new Date(lastSyncTime).toISOString()}`);
            
            // Check if there are new changes
            if (lastPushTime > lastSyncTime) {
                console.log('🆕 New changes detected! Syncing...');
                await this.syncWebsiteData();
                
                // Update last sync time
                this.lastSyncTime = Date.now().toString();
                localStorage.setItem('lastSyncTime', this.lastSyncTime);
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification('🆕 Website updated with latest GitHub changes!', 'success');
                }
            } else {
                console.log('✅ Website is up to date');
            }
            
        } catch (error) {
            console.error('❌ Sync check failed:', error);
        } finally {
            this.isActiveSyncing = false;
        }
    }

    /**
     * 🔄 Sync website data with GitHub repository
     */
    async syncWebsiteData() {
        try {
            // Fetch repository structure
            const contents = await fetch(`${this.baseUrl}/contents`);
            if (!contents.ok) throw new Error('Failed to fetch repository contents');
            
            const repoContents = await contents.json();
            
            // Parse Day folders
            const dayFolders = repoContents
                .filter(item => item.type === 'dir' && item.name.match(/^Day\s+\d+$/))
                .sort((a, b) => {
                    const dayA = parseInt(a.name.replace(/\D/g, ''));
                    const dayB = parseInt(b.name.replace(/\D/g, ''));
                    return dayA - dayB;
                });
            
            console.log(`📁 Found ${dayFolders.length} day folders:`, dayFolders.map(f => f.name));
            
            // Build new project structure
            const newProjects = {};
            let totalProjects = 0;
            
            for (const dayFolder of dayFolders) {
                const dayKey = dayFolder.name.replace(/\s+/g, ' '); // Normalize spacing
                const dayProjects = await this.parseDayFolder(dayFolder);
                
                if (dayProjects) {
                    newProjects[dayKey] = dayProjects;
                    
                    // Count projects
                    if (dayProjects.cw) totalProjects += dayProjects.cw.length;
                    if (dayProjects.hw) totalProjects += dayProjects.hw.length;
                }
            }
            
            // Update global dayProjects
            if (typeof window !== 'undefined') {
                // Merge with existing projects, prioritizing GitHub data
                window.dayProjects = { ...window.dayProjects, ...newProjects };
                
                // Update counters immediately
                this.updateAllWebsiteCounters(newProjects, dayFolders.length);
                
                // Reload project display
                if (typeof loadProjects === 'function') {
                    loadProjects();
                }
                
                console.log(`✅ Updated ${dayFolders.length} days, ${totalProjects} projects`);
            }
            
        } catch (error) {
            console.error('❌ Failed to sync website data:', error);
            throw error;
        }
    }

    /**
     * 📁 Parse individual day folder
     */
    async parseDayFolder(dayFolder) {
        try {
            const dayContents = await fetch(dayFolder.url);
            if (!dayContents.ok) return null;
            
            const contents = await dayContents.json();
            const result = {};
            
            // Look for CW and HW folders
            const cwFolder = contents.find(item => 
                item.type === 'dir' && item.name.toLowerCase() === 'cw'
            );
            const hwFolder = contents.find(item => 
                item.type === 'dir' && item.name.toLowerCase() === 'hw'
            );
            
            // Parse CW folder
            if (cwFolder) {
                result.cw = await this.parseProjectFolder(cwFolder, 'CW', dayFolder.name);
            }
            
            // Parse HW folder  
            if (hwFolder) {
                result.hw = await this.parseProjectFolder(hwFolder, 'HW', dayFolder.name);
            }
            
            return Object.keys(result).length > 0 ? result : null;
            
        } catch (error) {
            console.warn(`⚠️ Failed to parse ${dayFolder.name}:`, error.message);
            return null;
        }
    }

    /**
     * 🗂️ Parse project folder (CW/HW)
     */
    async parseProjectFolder(folder, type, dayName) {
        try {
            const folderContents = await fetch(folder.url);
            if (!folderContents.ok) return [];
            
            const contents = await folderContents.json();
            
            // Look for SOLIDWORKS files
            const swFiles = contents.filter(file => 
                file.type === 'file' && this.isSolidWorksFile(file.name)
            );
            
            // Look for images
            const imageFiles = contents.filter(file => 
                file.type === 'file' && this.isImageFile(file.name)
            );
            
            // Look for README
            const readmeFile = contents.find(file => 
                file.type === 'file' && file.name.toLowerCase().includes('readme')
            );
            
            // Create project object
            const project = {
                name: `${type} 1 - ${dayName}`,
                page: readmeFile ? readmeFile.html_url : folder.html_url,
                downloads: swFiles.map(file => ({
                    type: this.getFileType(file.name),
                    url: file.download_url
                })),
                preview: imageFiles.length > 0 ? imageFiles[0].download_url : null
            };
            
            return [project];
            
        } catch (error) {
            console.warn(`⚠️ Failed to parse ${type} folder for ${dayName}:`, error.message);
            return [];
        }
    }

    /**
     * 📊 Update website counters
     */
    updateWebsiteCounters(totalProjects, totalDays) {
        // Update project counters
        const projectCounters = document.querySelectorAll('[data-target="23"], .stat-number');
        projectCounters.forEach(counter => {
            if (counter.getAttribute('data-target') || counter.textContent.includes('23')) {
                counter.textContent = totalProjects;
                if (counter.hasAttribute('data-target')) {
                    counter.setAttribute('data-target', totalProjects);
                }
            }
        });
        
        // Update day counters
        const dayCounters = document.querySelectorAll('[data-target="7"]');
        dayCounters.forEach(counter => {
            counter.textContent = totalDays;
            counter.setAttribute('data-target', totalDays);
        });
        
        // Update SOLIDWORKS card counters
        const cardCounters = document.querySelectorAll('.sw-meta-num');
        if (cardCounters.length >= 3) {
            // Assume structure: CW, HW, Total
            cardCounters[2].textContent = totalProjects; // Total
        }
        
        // Update about section
        const aboutStats = document.querySelectorAll('.stat-card .stat-number');
        aboutStats.forEach(stat => {
            if (stat.textContent.includes('+')) {
                stat.textContent = `${totalProjects}+`;
            }
        });
        
        console.log(`📊 Updated counters: ${totalProjects} projects, ${totalDays} days`);
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

    /**
     * ⏹️ Stop real-time sync
     */
    stopRealTimeSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('⏹️ Real-time sync stopped');
        }
    }

    /**
     * 📊 Update ALL website counters using global utility  
     */
    updateAllWebsiteCounters(projectsData, totalDays) {
        console.log('📊 [Real-Time] Using global counter update...');
        
        // Calculate counts from project data
        let totalCW = 0, totalHW = 0;
        
        Object.values(projectsData).forEach(day => {
            if (day.cw) totalCW += day.cw.length;
            if (day.hw) totalHW += day.hw.length;
        });
        
        // Use global counter update utility
        if (typeof window.updateAllCountersGlobally === 'function') {
            window.updateAllCountersGlobally(totalCW, totalHW, totalDays);
        } else {
            console.warn('⚠️ [Real-Time] Global counter utility not available, using fallback...');
            
            const totalProjects = totalCW + totalHW;
            
            // Update SOLIDWORKS Meta Counters only  
            const metaCounters = document.querySelectorAll('.sw-meta-num');
            if (metaCounters.length >= 3) {
                metaCounters[0].textContent = totalCW;      // CW
                metaCounters[1].textContent = totalHW;      // HW  
                metaCounters[2].textContent = totalProjects; // Total
            }
            
            console.log(`✅ [Real-Time] Fallback counters updated: ${totalCW} CW + ${totalHW} HW = ${totalProjects} Total`);
        }
    }

    /**
     * � Force immediate sync
     */
    async forceSync() {
        console.log('🔄 Force sync requested...');
        if (typeof showNotification === 'function') {
            showNotification('🔄 Forcing immediate sync...', 'info');
        }
        
        // Reset last sync time to force update
        this.lastSyncTime = '0';
        localStorage.removeItem('lastSyncTime');
        
        await this.performSync();
    }
}

// Initialize and export
let realTimeSync = null;

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Real-Time GitHub Sync...');
    
    realTimeSync = new RealTimeGitHubSync('Akhinoor14', 'SOLIDWORKS-Projects');
    realTimeSync.startRealTimeSync();
    
    // Add to window for manual access
    window.realTimeSync = realTimeSync;
    window.forceGitHubSync = () => realTimeSync.forceSync();
    
    console.log('✅ Real-Time GitHub Sync activated!');
    console.log('💡 Use forceGitHubSync() to force immediate update');
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeGitHubSync;
}