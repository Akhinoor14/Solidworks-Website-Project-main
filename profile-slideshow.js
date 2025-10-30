// Profile Photo Slideshow - Auto-rotate profile pictures from images folder
// No API/token required - works with local files

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        imageFolder: './images/',
        interval: 30000, // 30 seconds
        transitionDuration: 600, // 600ms fade
        // List all profile photos here (add new filenames as you upload)
        photos: [
            'PP.jpg',
            // Add more photos below as you upload them to images/ folder
            // Example:
            // 'PP2.jpg',
            // 'PP3.jpg',
            // 'profile-casual.jpg',
            // 'profile-formal.jpg',
        ]
    };

    let currentIndex = 0;
    let intervalId = null;

    // Get the profile photo element
    function getProfilePhoto() {
        return document.getElementById('profile-photo');
    }

    // Shuffle to next photo with fade effect
    function shufflePhoto() {
        const img = getProfilePhoto();
        if (!img || CONFIG.photos.length <= 1) return;

        // Move to next photo (loop back to start)
        currentIndex = (currentIndex + 1) % CONFIG.photos.length;
        const nextPhoto = CONFIG.imageFolder + CONFIG.photos[currentIndex];

        console.log('🔄 Shuffling to photo:', nextPhoto);

        // Fade out
        img.style.transition = `opacity ${CONFIG.transitionDuration}ms ease-in-out`;
        img.style.opacity = '0';

        // Change image and fade in
        setTimeout(() => {
            img.src = nextPhoto;
            img.style.opacity = '1';
        }, CONFIG.transitionDuration);
    }

    // Start the slideshow
    function startSlideshow() {
        const img = getProfilePhoto();
        if (!img) {
            console.warn('⚠️ Profile photo element not found');
            return;
        }

        if (CONFIG.photos.length <= 1) {
            console.log('ℹ️ Only one photo configured, slideshow disabled');
            return;
        }

        console.log(`✅ Profile slideshow started with ${CONFIG.photos.length} photos (${CONFIG.interval/1000}s interval)`);
        
        // Shuffle every 30 seconds
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

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSlideshow);
    } else {
        startSlideshow();
    }

    // Expose controls globally (optional)
    window.profileSlideshow = {
        start: startSlideshow,
        stop: stopSlideshow,
        next: shufflePhoto,
        getPhotos: () => CONFIG.photos,
        getCurrentIndex: () => currentIndex
    };

})();
