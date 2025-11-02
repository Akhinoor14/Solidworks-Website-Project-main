// Profile Photo Slideshow - Auto-rotate profile pictures from images folder
// AUTO-DETECTS uploaded profile photos (PP*.jpg) from GitHub and local files

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        imageFolder: './images/',
        interval: 7000, // 7 seconds
        transitionDuration: 800, // 800ms smooth fade
        useGitHubAPI: true, // Try GitHub API first, then fallback to HEAD requests
        preloadImages: true, // Preload next image for instant switch
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' // Material Design smooth easing
    };

    let detectedPhotos = [];
    let currentIndex = 0;
    let intervalId = null;
    let preloadedImages = new Map(); // Cache for preloaded images

    // Get the profile photo element
    function getProfilePhoto() {
        return document.getElementById('profile-photo');
    }

    // Auto-detect profile photos from GitHub API
    async function detectFromGitHubAPI() {
        try {
            const githubToken = localStorage.getItem('githubToken');
            const githubRepo = localStorage.getItem('githubRepo');
            
            if (!githubToken || !githubRepo) {
                console.log('ℹ️ GitHub credentials not found, skipping API detection');
                return [];
            }

            const [owner, repo] = githubRepo.split('/');
            if (!owner || !repo) {
                console.warn('⚠️ Invalid GitHub repo format. Expected: owner/repo');
                return [];
            }

            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/images`;
            console.log('🔍 Checking GitHub API for profile photos...');

            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                console.warn(`⚠️ GitHub API error: ${response.status}`);
                return [];
            }

            const files = await response.json();
            const profilePhotos = files
                .filter(file => file.name.match(/^PP\d*\.jpg$/i) && file.type === 'file')
                .map(file => file.name)
                .sort((a, b) => {
                    // PP.jpg comes first (no number = 0), then PP1, PP2, etc.
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                    return numA - numB;
                });

            console.log(`✅ Found ${profilePhotos.length} photos via GitHub API:`, profilePhotos);
            return profilePhotos;
        } catch (error) {
            console.warn('⚠️ GitHub API detection failed:', error.message);
            return [];
        }
    }

    // Fallback: Check local files by trying to load them (unlimited detection)
    async function detectFromLocalFiles() {
        console.log('🔍 Checking local files for profile photos (unlimited)...');
        const detected = [];
        
        // Check PP.jpg first
        try {
            const response = await fetch(CONFIG.imageFolder + 'PP.jpg', { method: 'HEAD' });
            if (response.ok) {
                detected.push('PP.jpg');
            }
        } catch (error) {
            // File doesn't exist
        }
        
        // Check PP1.jpg onwards until we find 5 consecutive missing files
        let consecutiveMissing = 0;
        let currentNumber = 1;
        const maxConsecutiveMissing = 5; // Stop after 5 missing in a row
        
        while (consecutiveMissing < maxConsecutiveMissing) {
            const filename = `PP${currentNumber}.jpg`;
            
            try {
                const response = await fetch(CONFIG.imageFolder + filename, { method: 'HEAD' });
                if (response.ok) {
                    detected.push(filename);
                    consecutiveMissing = 0; // Reset counter on success
                } else {
                    consecutiveMissing++;
                }
            } catch (error) {
                consecutiveMissing++;
            }
            
            currentNumber++;
            
            // Safety limit to prevent infinite loop
            if (currentNumber > 1000) {
                console.warn('⚠️ Reached safety limit of 1000 photos');
                break;
            }
        }

        console.log(`✅ Found ${detected.length} photos locally:`, detected);
        return detected;
    }

    // Auto-detect all profile photos
    async function detectProfilePhotos() {
        console.log('🔎 Auto-detecting profile photos...');
        
        let photos = [];
        
        // Try GitHub API first
        if (CONFIG.useGitHubAPI) {
            photos = await detectFromGitHubAPI();
        }
        
        // Fallback to local file detection if GitHub didn't work
        if (photos.length === 0) {
            photos = await detectFromLocalFiles();
        }

        // Always ensure PP.jpg is included (default)
        if (photos.length === 0) {
            photos = ['PP.jpg'];
            console.log('ℹ️ No photos detected, using default PP.jpg');
        }

        detectedPhotos = photos;
        console.log(`📸 Total photos detected: ${detectedPhotos.length}`);
        return detectedPhotos;
    }

    // Preload an image for instant switching
    function preloadImage(photoName) {
        if (!CONFIG.preloadImages) return;
        
        const photoPath = CONFIG.imageFolder + photoName;
        
        // Skip if already preloaded
        if (preloadedImages.has(photoPath)) return;
        
        const img = new Image();
        img.src = photoPath;
        preloadedImages.set(photoPath, img);
    }

    // Preload next image in sequence
    function preloadNextImage() {
        if (detectedPhotos.length <= 1) return;
        
        const nextIndex = (currentIndex + 1) % detectedPhotos.length;
        preloadImage(detectedPhotos[nextIndex]);
    }

    // Shuffle to next photo with smooth fade effect
    function shufflePhoto() {
        const img = getProfilePhoto();
        if (!img || detectedPhotos.length <= 1) return;

        // Move to next photo (loop back to start)
        currentIndex = (currentIndex + 1) % detectedPhotos.length;
        const nextPhoto = CONFIG.imageFolder + detectedPhotos[currentIndex];

        console.log(`🔄 Shuffling to photo ${currentIndex + 1}/${detectedPhotos.length}:`, nextPhoto);

        // Apply smooth transition with custom easing
        img.style.transition = `opacity ${CONFIG.transitionDuration}ms ${CONFIG.easing}`;
        img.style.opacity = '0';

        // Change image and fade in (image already preloaded for instant display)
        setTimeout(() => {
            img.src = nextPhoto;
            // Force reflow to ensure transition works
            void img.offsetWidth;
            img.style.opacity = '1';
            
            // Preload the next image after current one loads
            preloadNextImage();
        }, CONFIG.transitionDuration);
    }

    // Start the slideshow
    async function startSlideshow() {
        const img = getProfilePhoto();
        if (!img) {
            console.warn('⚠️ Profile photo element (#profile-photo) not found');
            return;
        }

        // Auto-detect photos first
        await detectProfilePhotos();

        if (detectedPhotos.length <= 1) {
            console.log('ℹ️ Only one photo detected, slideshow disabled');
            return;
        }

        // Preload all images for smooth transitions
        if (CONFIG.preloadImages) {
            console.log('⏳ Preloading images for smooth transitions...');
            detectedPhotos.forEach(photo => preloadImage(photo));
        }

        console.log(`✅ Profile slideshow started with ${detectedPhotos.length} photos (${CONFIG.interval/1000}s interval)`);
        
        // Initialize smooth transition on profile photo
        img.style.transition = `opacity ${CONFIG.transitionDuration}ms ${CONFIG.easing}`;
        
        // Shuffle at configured interval
        intervalId = setInterval(shufflePhoto, CONFIG.interval);
    }

    // Stop the slideshow
    function stopSlideshow() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            console.log('🛑 Profile slideshow stopped');
        }
    }

    // Refresh photo list (call after uploading new photos)
    async function refreshPhotos() {
        console.log('🔄 Refreshing photo list...');
        stopSlideshow();
        await startSlideshow();
    }

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSlideshow);
    } else {
        startSlideshow();
    }

    // Expose controls globally
    window.profileSlideshow = {
        start: startSlideshow,
        stop: stopSlideshow,
        next: shufflePhoto,
        refresh: refreshPhotos,
        getPhotos: () => detectedPhotos,
        getCurrentIndex: () => currentIndex
    };

})();
