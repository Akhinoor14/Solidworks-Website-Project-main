/**
 * 🚀 GitHub Auto-Sync System
 * Automatically syncs website with GitHub repository data
 * Solves the auto-update problem by fetching live data from GitHub API
 */

class GitHubAutoSync {
    constructor(username, repository) {
        this.username = username;
        this.repository = repository;
        this.baseUrl = `https://api.github.com/repos/${username}/${repository}/contents`;
        this.cache = {
            projects: null,
            timestamp: null,
            ttl: 300000 // 5 minutes cache
        };
    }

    /**
     * 📡 Fetch latest project data from GitHub
     */
    async fetchLatestProjects() {
        try {
            // Check cache first
            if (this.cache.projects && 
                this.cache.timestamp && 
                (Date.now() - this.cache.timestamp) < this.cache.ttl) {
                console.log('📦 Using cached project data');
                return this.cache.projects;
            }

            console.log('🔄 Fetching fresh data from GitHub...');
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const contents = await response.json();
            const projects = await this.parseGitHubStructure(contents);
            
            // Update cache
            this.cache.projects = projects;
            this.cache.timestamp = Date.now();
            
            console.log('✅ Fresh project data loaded:', projects);
            return projects;

        } catch (error) {
            console.log('⚠️ GitHub fetch failed, using fallback:', error.message);
            return this.getFallbackData();
        }
    }

    /**
     * 🔍 Parse GitHub repository structure into website format
     */
    async parseGitHubStructure(contents) {
        const dayFolders = contents.filter(item => 
            item.type === 'dir' && 
            item.name.startsWith('Day')
        );

        const parsedProjects = {};

        for (const dayFolder of dayFolders) {
            const dayName = dayFolder.name; // e.g., "Day 06"
            const dayKey = dayName.replace(' ', ' '); // Normalize spacing
            
            try {
                const dayContents = await this.fetchDayContents(dayFolder.url);
                parsedProjects[dayKey] = await this.parseDayFolder(dayContents, dayName);
            } catch (error) {
                console.log(`⚠️ Error parsing ${dayName}:`, error.message);
                // Add placeholder data
                parsedProjects[dayKey] = this.createPlaceholderDay(dayName);
            }
        }

        console.log('🏗️ Parsed GitHub structure:', parsedProjects);
        return parsedProjects;
    }

    /**
     * 📁 Fetch contents of a specific day folder
     */
    async fetchDayContents(folderUrl) {
        // Add delay to avoid rate limiting
        await this.delay(100);
        
        const response = await fetch(folderUrl);
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('GitHub API rate limit exceeded. Please try again later.');
            }
            throw new Error(`Failed to fetch day contents: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * ⏱️ Simple delay function for rate limiting
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🏗️ Parse individual day folder structure
     */
    async parseDayFolder(dayContents, dayName) {
        const cwFolder = dayContents.find(item => 
            item.type === 'dir' && 
            item.name.toLowerCase() === 'cw'
        );
        
        const hwFolder = dayContents.find(item => 
            item.type === 'dir' && 
            item.name.toLowerCase() === 'hw'
        );

        const parsedDay = {};

        // Parse CW (Class Work)
        if (cwFolder) {
            try {
                const cwContents = await this.fetchDayContents(cwFolder.url);
                parsedDay.cw = await this.parseProjectFolder(cwContents, 'CW', dayName);
            } catch (error) {
                console.log(`⚠️ Error parsing CW for ${dayName}:`, error.message);
                parsedDay.cw = [this.createPlaceholderProject('CW', dayName)];
            }
        }

        // Parse HW (Home Work)
        if (hwFolder) {
            try {
                const hwContents = await this.fetchDayContents(hwFolder.url);
                parsedDay.hw = await this.parseProjectFolder(hwContents, 'HW', dayName);
            } catch (error) {
                console.log(`⚠️ Error parsing HW for ${dayName}:`, error.message);
                parsedDay.hw = [this.createPlaceholderProject('HW', dayName)];
            }
        }

        return parsedDay;
    }

    /**
     * 📂 Parse project folder (CW or HW)
     */
    async parseProjectFolder(folderContents, type, dayName) {
        const projects = [];
        
        // Look for README file to get project description
        const readmeFile = folderContents.find(file => 
            file.name.toLowerCase().includes('readme')
        );

        // Look for SOLIDWORKS files
        const swFiles = folderContents.filter(file => 
            this.isSolidWorksFile(file.name)
        );

        // Look for preview images
        const previewFiles = folderContents.filter(file => 
            this.isImageFile(file.name)
        );

        // Create project object
        const project = {
            name: `${type} 1 - ${dayName}`,
            page: readmeFile ? readmeFile.html_url : `https://github.com/${this.username}/${this.repository}/tree/main/${dayName}/${type}`,
            downloads: swFiles.map(file => ({
                name: file.name,
                url: file.download_url,
                type: this.getFileType(file.name)
            })),
            preview: previewFiles.length > 0 ? previewFiles[0].download_url : null
        };

        projects.push(project);
        return projects;
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
        if (filename.toLowerCase().endsWith('.sldasm')) return 'Assembly';
        if (filename.toLowerCase().endsWith('.sldprt')) return 'Part';
        if (filename.toLowerCase().endsWith('.slddrw')) return 'Drawing';
        return 'File';
    }

    /**
     * 🔄 Create placeholder data for missing projects
     */
    createPlaceholderProject(type, dayName) {
        return {
            name: `${type} 1 - ${dayName}`,
            page: `https://github.com/${this.username}/${this.repository}/tree/main/${dayName}/${type}`,
            downloads: [],
            preview: null
        };
    }

    createPlaceholderDay(dayName) {
        return {
            cw: [this.createPlaceholderProject('CW', dayName)]
        };
    }

    /**
     * 🛡️ Fallback to existing static data if GitHub fails
     */
    getFallbackData() {
        // Return existing dayProjects if available
        if (typeof window !== 'undefined' && typeof window.dayProjects !== 'undefined') {
            console.log('📦 Using existing static project data from window');
            return window.dayProjects;
        }
        
        if (typeof dayProjects !== 'undefined') {
            console.log('📦 Using existing static project data');
            return dayProjects;
        }

        // Minimal fallback with current manual data
        console.log('🔴 Using minimal fallback data');
        return {
            "Day 01": { cw: [{ name: "CW 1 - Day 01", page: "#", downloads: [], preview: null }] },
            "Day 02": { cw: [{ name: "CW 1 - Day 02", page: "#", downloads: [], preview: null }] },
            "Day 03": { cw: [{ name: "CW 1 - Day 03", page: "#", downloads: [], preview: null }] },
            "Day 04": { cw: [{ name: "CW 1 - Day 04", page: "#", downloads: [], preview: null }] },
            "Day 05": { cw: [{ name: "CW 1 - Day 05", page: "#", downloads: [], preview: null }] },
            "Day 06": { cw: [{ name: "CW 1 - Day 06", page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/Day%2006/CW", downloads: [], preview: null }] },
            "Day 07": { cw: [{ name: "CW 1 - Day 07", page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/Day%2007/CW", downloads: [], preview: null }] }
        };
    }

    /**
     * 📊 Calculate statistics from project data
     */
    calculateStats(projects) {
        const stats = {
            totalProjects: 0,
            totalDays: Object.keys(projects).length,
            cwProjects: 0,
            hwProjects: 0
        };

        Object.values(projects).forEach(day => {
            if (day.cw) {
                stats.cwProjects += day.cw.length;
                stats.totalProjects += day.cw.length;
            }
            if (day.hw) {
                stats.hwProjects += day.hw.length;
                stats.totalProjects += day.hw.length;
            }
        });

        return stats;
    }

    /**
     * 🔄 Auto-update website counters and navigation
     */
    async updateWebsite() {
        try {
            console.log('🚀 Starting website auto-update...');
            
            // Fetch latest project data
            const latestProjects = await this.fetchLatestProjects();
            const stats = this.calculateStats(latestProjects);
            
            console.log('📊 Calculated stats:', stats);

            // Update global dayProjects variable
            if (typeof window !== 'undefined') {
                window.dayProjects = { ...window.dayProjects, ...latestProjects };
            }

            // Update counters in DOM
            this.updateCounters(stats);
            
            // Update navigation if needed
            this.updateNavigation(latestProjects);
            
            // Trigger any existing project loading functions
            if (typeof loadProjects === 'function') {
                loadProjects();
            }

            console.log('✅ Website auto-update completed successfully!');
            return { success: true, stats, projects: latestProjects };

        } catch (error) {
            console.error('❌ Website auto-update failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 📊 Update counters in the DOM
     */
    updateCounters(stats) {
        // Update hero section counters
        const heroProjects = document.querySelector('.hero .stat-number[data-target]');
        if (heroProjects) {
            heroProjects.textContent = stats.totalProjects;
            heroProjects.setAttribute('data-target', stats.totalProjects);
        }

        // Update SOLIDWORKS card counters  
        const cardProjects = document.querySelector('.project-card .project-count');
        if (cardProjects) {
            cardProjects.textContent = `${stats.totalProjects}+`;
        }

        // Update day counters
        const dayCounters = document.querySelectorAll('[data-days]');
        dayCounters.forEach(counter => {
            counter.textContent = `${stats.totalDays}`;
        });

        // Update descriptions mentioning day ranges
        const descriptions = document.querySelectorAll('.project-description, .hero-description');
        descriptions.forEach(desc => {
            if (desc.textContent.includes('Day 1 through')) {
                desc.textContent = desc.textContent.replace(
                    /Day 1 through Day \d+/g, 
                    `Day 1 through Day ${stats.totalDays.toString().padStart(2, '0')}`
                );
            }
        });

        console.log('📊 Counters updated successfully');
    }

    /**
     * 🧭 Update navigation dynamically
     */
    updateNavigation(projects) {
        // This would need to be implemented based on your specific navigation structure
        console.log('🧭 Navigation update - implement based on your nav structure');
        
        // Example: Update dropdown options
        const daySelectors = document.querySelectorAll('select[data-day-selector]');
        daySelectors.forEach(select => {
            // Clear existing options
            select.innerHTML = '<option value="">Select Day</option>';
            
            // Add new day options
            Object.keys(projects).forEach(day => {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                select.appendChild(option);
            });
        });
    }
}

/**
 * 🚀 Initialize Auto-Sync System
 */
const githubSync = new GitHubAutoSync('Akhinoor14', 'SOLIDWORKS-Projects');

/**
 * 🔄 Auto-update on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌐 Page loaded - starting GitHub auto-sync...');
    
    // Wait a moment for other scripts to load
    setTimeout(async () => {
        const result = await githubSync.updateWebsite();
        
        if (result.success) {
            console.log('🎉 GitHub auto-sync completed successfully!');
            
            // Show success notification
            if (typeof showNotification === 'function') {
                showNotification(`✅ Auto-synced! ${result.stats.totalProjects} projects loaded`, 'success');
            }
        } else {
            console.log('⚠️ Auto-sync failed, using static data');
            
            // Show fallback notification
            if (typeof showNotification === 'function') {
                showNotification('⚠️ Using cached data - GitHub sync failed', 'warning');
            }
        }
    }, 1000);
});

/**
 * � Periodic auto-sync (every 10 minutes) - only if instance exists
 */
setInterval(async () => {
    if (typeof window !== 'undefined' && window.githubSyncInstance) {
        console.log('🕒 Periodic sync check...');
        await window.githubSyncInstance.updateWebsite();
    }
}, 600000); // 10 minutes

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAutoSync;
}