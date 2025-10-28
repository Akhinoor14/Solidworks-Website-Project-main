/**
 * 🔄 AUTO-REFRESH SYSTEM FOR WEBSITE
 * Automatically refreshes the website when GitHub changes are detected
 * Solves the problem of website not updating after GitHub uploads
 */

class AutoRefreshSystem {
    constructor() {
        this.checkInterval = 60000; // 1 minute
        this.lastKnownCommit = localStorage.getItem('lastKnownCommit');
        this.intervalId = null;
        this.isChecking = false;
    }

    /**
     * 🚀 Start auto-refresh monitoring
     */
    start() {
        console.log('🔄 Starting auto-refresh system...');
        
        // Initial check
        this.checkForChanges();
        
        // Set up periodic checking
        this.intervalId = setInterval(() => {
            this.checkForChanges();
        }, this.checkInterval);
        
        console.log('✅ Auto-refresh system started (1-minute intervals)');
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('🔄 Auto-refresh system activated - website will update automatically!', 'info');
        }
    }

    /**
     * 📡 Check for repository changes
     */
    async checkForChanges() {
        if (this.isChecking) return;
        
        this.isChecking = true;
        
        try {
            console.log('🔍 Checking for repository changes...');
            
            // Get latest commit from repository
            const response = await fetch('https://api.github.com/repos/Akhinoor14/SOLIDWORKS-Projects/commits?per_page=1');
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const commits = await response.json();
            
            if (commits.length === 0) {
                console.log('📭 No commits found');
                return;
            }
            
            const latestCommit = commits[0].sha;
            const commitMessage = commits[0].commit.message;
            const commitDate = commits[0].commit.author.date;
            
            console.log(`📊 Latest commit: ${latestCommit.substring(0, 8)} - ${commitMessage}`);
            
            // Check if this is a new commit
            if (this.lastKnownCommit && this.lastKnownCommit !== latestCommit) {
                console.log('🆕 New commit detected! Refreshing website...');
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification(`🆕 New upload detected! Refreshing website... (${commitMessage})`, 'success');
                }
                
                // Wait 2 seconds then refresh
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                console.log('✅ Website is up to date');
            }
            
            // Update last known commit
            this.lastKnownCommit = latestCommit;
            localStorage.setItem('lastKnownCommit', latestCommit);
            
        } catch (error) {
            console.error('❌ Auto-refresh check failed:', error);
            // Don't show error notification for this (too annoying)
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * ⏹️ Stop auto-refresh system
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Auto-refresh system stopped');
        }
    }

    /**
     * 🔄 Force immediate check
     */
    async forceCheck() {
        console.log('🔄 Force checking for changes...');
        
        if (typeof showNotification === 'function') {
            showNotification('🔍 Checking for latest uploads...', 'info');
        }
        
        // Reset last known commit to force refresh if there are changes
        this.lastKnownCommit = null;
        localStorage.removeItem('lastKnownCommit');
        
        await this.checkForChanges();
    }
}

// Initialize auto-refresh system
let autoRefresh = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Auto-Refresh System...');
    
    autoRefresh = new AutoRefreshSystem();
    autoRefresh.start();
    
    // Make it globally accessible
    window.autoRefresh = autoRefresh;
    window.forceRefreshCheck = () => autoRefresh.forceCheck();
    
    console.log('✅ Auto-Refresh System activated!');
    console.log('💡 Use forceRefreshCheck() to check immediately');
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoRefreshSystem;
}