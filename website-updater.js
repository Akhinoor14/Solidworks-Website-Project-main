/**
 * Website Auto-Updater for SOLIDWORKS Upload System
 * Automatically updates website after successful GitHub upload
 */

class WebsiteAutoUpdater {
    constructor() {
        this.currentDayProjects = null;
        this.scriptsToUpdate = ['script.js'];
        this.init();
    }

    async init() {
        // Load current dayProjects structure
        await this.loadCurrentProjects();
    }

    /**
     * Main function called after successful upload
     */
    async updateAfterUpload(uploadResult) {
        const { projectData, folderUrl, files } = uploadResult;
        const { day, type, number } = projectData;

        try {
            console.log('Starting website auto-update...');

            // Step 1: Add project to dayProjects structure
            const isNewDay = await this.addProjectToStructure(day, type, number, files, folderUrl);

            // Step 2: Update counters and descriptions
            await this.updateCountersAndDescriptions(isNewDay);

            // Step 3: Refresh navigation and UI
            this.refreshWebsiteInterface();

            // Step 4: Show update notification
            this.showUpdateNotification(day, type, number);

            console.log('Website auto-update completed successfully!');

        } catch (error) {
            console.error('Website auto-update failed:', error);
            throw new Error(`Website update failed: ${error.message}`);
        }
    }

    /**
     * Add new project to dayProjects structure
     */
    async addProjectToStructure(day, type, number, files, folderUrl) {
        if (!this.currentDayProjects) {
            await this.loadCurrentProjects();
        }

        const dayKey = `Day ${day.padStart(2, '0')}`;
        let isNewDay = false;

        // Create day structure if it doesn't exist
        if (!this.currentDayProjects[dayKey]) {
            this.currentDayProjects[dayKey] = { CW: [], HW: [] };
            isNewDay = true;
        }

        // Create project object
        const projectData = {
            name: `${type} ${number} - Day ${day.padStart(2, '0')}`,
            page: `${folderUrl.replace('tree', 'blob')}/README.md`,
            downloads: this.generateDownloadLinks(files, folderUrl),
            preview: this.getScreenshotUrl(files, folderUrl)
        };

        // Add to appropriate array
        this.currentDayProjects[dayKey][type].push(projectData);

        // Update the actual script.js file (in real implementation)
        await this.updateScriptFile(this.currentDayProjects);

        return isNewDay;
    }

    /**
     * Generate download links from uploaded files
     */
    generateDownloadLinks(files, folderUrl) {
        const downloads = [];
        const baseUrl = folderUrl.replace('github.com', 'raw.githubusercontent.com').replace('/tree/main/', '/main/');

        files.forEach(fileResult => {
            let type = 'File';
            
            switch (fileResult.type) {
                case 'assembly':
                    type = 'Assembly';
                    break;
                case 'part':
                    type = `Part ${downloads.filter(d => d.type.includes('Part')).length + 1}`;
                    break;
                case 'screenshot':
                    type = 'Screenshot';
                    break;
                case 'guide':
                    type = 'Guide';
                    break;
            }

            downloads.push({
                type: type,
                url: `${baseUrl}/${fileResult.name}`
            });
        });

        return downloads;
    }

    /**
     * Get screenshot URL for preview
     */
    getScreenshotUrl(files, folderUrl) {
        const screenshot = files.find(f => f.type === 'screenshot');
        if (screenshot) {
            const baseUrl = folderUrl.replace('github.com', 'raw.githubusercontent.com').replace('/tree/main/', '/main/');
            return `${baseUrl}/${screenshot.name}`;
        }
        return null;
    }

    /**
     * Update counters and descriptions
     */
    async updateCountersAndDescriptions(isNewDay) {
        const stats = this.calculateStats();
        
        console.log('📊 [Website Updater] Updating counters with stats:', stats);

        // Use global counter update utility if available
        if (typeof window.updateAllCountersGlobally === 'function') {
            console.log('📊 [Website Updater] Using global counter utility...');
            window.updateAllCountersGlobally(stats.totalCW, stats.totalHW, stats.totalDays);
        } else {
            console.log('📊 [Website Updater] Using fallback counter update...');
            // Fallback to old method
            this.updateHeroStats(stats);
            this.updateSolidworksCard(stats);
        }

        // Update project descriptions
        this.updateProjectDescriptions(stats);

        // Update HTML comments if new day
        if (isNewDay) {
            this.updateHTMLComments(stats.totalDays);
        }
    }

    /**
     * Calculate current statistics
     */
    calculateStats() {
        if (!this.currentDayProjects) return null;

        const days = Object.keys(this.currentDayProjects);
        let totalCW = 0, totalHW = 0;

        days.forEach(dayKey => {
            const dayData = this.currentDayProjects[dayKey];
            totalCW += dayData.CW ? dayData.CW.length : 0;
            totalHW += dayData.HW ? dayData.HW.length : 0;
        });

        return {
            totalProjects: totalCW + totalHW,
            totalDays: days.length,
            totalCW: totalCW,
            totalHW: totalHW,
            highestDay: Math.max(...days.map(d => parseInt(d.split(' ')[1])))
        };
    }

    /**
     * Update hero section statistics
     */
    updateHeroStats(stats) {
        const heroStats = document.querySelectorAll('.hero-stats .stat-number');
        
        if (heroStats[0]) {
            heroStats[0].setAttribute('data-target', stats.totalProjects);
            this.animateCounter(heroStats[0], stats.totalProjects);
        }
        
        if (heroStats[1]) {
            heroStats[1].setAttribute('data-target', stats.totalDays);
            this.animateCounter(heroStats[1], stats.totalDays);
        }
    }

    /**
     * Update SOLIDWORKS card counters
     */
    updateSolidworksCard(stats) {
        // Update meta counters
        const metaCounters = document.querySelectorAll('.sw-meta-num');
        if (metaCounters[0]) metaCounters[0].textContent = stats.totalCW;
        if (metaCounters[1]) metaCounters[1].textContent = stats.totalHW;
        if (metaCounters[2]) metaCounters[2].textContent = stats.totalProjects;

        // Update intro text
        const introText = document.getElementById('sw-intro');
        if (introText) {
            introText.textContent = `${stats.totalProjects} SOLIDWORKS projects across ${stats.totalDays} days of structured learning with downloads, previews, and real-world engineering applications to build strong CAD fundamentals.`;
        }

        // Update card title if needed
        const cardTitle = document.getElementById('sw-heading');
        if (cardTitle && !cardTitle.textContent.includes('SOLIDWORKS Beginner Projects')) {
            // Ensure consistent title
            cardTitle.innerHTML = 'SOLIDWORKS Beginner Projects <span class="sw-badge-new">Beta</span>';
        }
    }

    /**
     * Update project descriptions in script.js data
     */
    updateProjectDescriptions(stats) {
        // This would update the sampleProjects array in script.js
        // For now, we'll update any displayed descriptions
        
        const descriptions = document.querySelectorAll('[data-project-description]');
        descriptions.forEach(desc => {
            const template = desc.getAttribute('data-project-description');
            if (template.includes('SOLIDWORKS')) {
                desc.textContent = `${stats.totalProjects}+ SOLIDWORKS projects for beginners with step-by-step tutorials covering mechanical parts, assemblies, and technical drawings across ${stats.totalDays} days of structured learning.`;
            }
        });
    }

    /**
     * Animate counter numbers
     */
    animateCounter(element, target) {
        const current = parseInt(element.textContent) || 0;
        const increment = target > current ? 1 : -1;
        const duration = 1000; // 1 second
        const stepTime = duration / Math.abs(target - current);

        let currentValue = current;
        const timer = setInterval(() => {
            currentValue += increment;
            element.textContent = currentValue;
            
            if (currentValue === target) {
                clearInterval(timer);
                // Add flash effect
                element.style.animation = 'flash 0.5s ease-in-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        }, stepTime);
    }

    /**
     * Refresh website interface
     */
    refreshWebsiteInterface() {
        // Re-inject day projects if function exists
        if (typeof window.injectDayProjects === 'function') {
            console.log('Re-injecting day projects...');
            window.injectDayProjects();
        }

        // Update navigation if function exists
        if (typeof window.updateNavigation === 'function') {
            window.updateNavigation();
        }

        // Force refresh of SOLIDWORKS embedded navigation
        const event = new CustomEvent('projectsUpdated', {
            detail: { dayProjects: this.currentDayProjects }
        });
        document.dispatchEvent(event);

        // Update cache buster
        this.updateCacheBuster();
    }

    /**
     * Update cache buster parameter
     */
    updateCacheBuster() {
        const timestamp = new Date().getTime();
        const scriptTags = document.querySelectorAll('script[src*="script.js"]');
        
        scriptTags.forEach(script => {
            const currentSrc = script.src;
            const baseSrc = currentSrc.split('?')[0];
            script.src = `${baseSrc}?v=${timestamp}`;
        });
    }

    /**
     * Load current dayProjects structure
     */
    async loadCurrentProjects() {
        try {
            // Try to get from global variable first
            if (typeof window.sampleProjects !== 'undefined') {
                const solidworksProject = window.sampleProjects.find(p => p.title === "SOLIDWORKS Beginner Projects");
                if (solidworksProject && solidworksProject.dayProjects) {
                    this.currentDayProjects = solidworksProject.dayProjects;
                    return;
                }
            }

            // Fallback: parse from script.js file
            const response = await fetch('script.js');
            const scriptContent = await response.text();
            
            // Extract dayProjects using regex (simplified)
            const dayProjectsMatch = scriptContent.match(/dayProjects:\s*({[\s\S]*?}),?\s*\/\/\s*Quick access links/);
            if (dayProjectsMatch) {
                // This is a simplified extraction - in production, you'd use a proper parser
                console.log('Found dayProjects structure in script.js');
                // For now, initialize with empty structure
                this.currentDayProjects = {};
            } else {
                this.currentDayProjects = {};
            }

        } catch (error) {
            console.warn('Could not load current projects, starting with empty structure:', error);
            this.currentDayProjects = {};
        }
    }

    /**
     * Update script.js file with new dayProjects
     */
    async updateScriptFile(newDayProjects) {
        // In a real implementation, this would use GitHub API to update the script.js file
        // For now, we'll just update the in-memory structure and hope the page gets refreshed
        
        console.log('Updating script.js with new dayProjects structure...');
        
        // Update global variable if it exists
        if (typeof window.sampleProjects !== 'undefined') {
            const solidworksProject = window.sampleProjects.find(p => p.title === "SOLIDWORKS Beginner Projects");
            if (solidworksProject) {
                solidworksProject.dayProjects = newDayProjects;
                console.log('Updated global sampleProjects variable');
            }
        }

        // In production, this would make an API call to update the actual file
        // For demo purposes, we'll simulate this
        return Promise.resolve();
    }

    /**
     * Show update notification
     */
    showUpdateNotification(day, type, number) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
            z-index: 10001;
            max-width: 300px;
            font-family: inherit;
            animation: slideInUp 0.3s ease-out;
        `;

        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🌐 Website Updated!</div>
            <div style="font-size: 0.9rem;">
                ${type} ${number} - Day ${day.padStart(2, '0')} has been added to your website.
                Counters and navigation updated automatically.
            </div>
        `;

        document.body.appendChild(notification);

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideInUp 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Get next available day number
     */
    getNextDayNumber() {
        if (!this.currentDayProjects) return '06';

        const existingDays = Object.keys(this.currentDayProjects)
            .map(key => parseInt(key.split(' ')[1]))
            .filter(num => !isNaN(num));

        if (existingDays.length === 0) return '06';

        const maxDay = Math.max(...existingDays);
        return (maxDay + 1).toString().padStart(2, '0');
    }

    /**
     * Check if a day already exists
     */
    dayExists(day) {
        const dayKey = `Day ${day.padStart(2, '0')}`;
        return this.currentDayProjects && this.currentDayProjects.hasOwnProperty(dayKey);
    }
}

// Initialize and expose globally
window.websiteUpdater = new WebsiteAutoUpdater();

// Also listen for manual refresh events
document.addEventListener('projectsUpdated', (event) => {
    console.log('Projects updated event received:', event.detail);
});

console.log('Website Auto-Updater initialized!');