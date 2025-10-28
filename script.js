// Modal interactivity for project details
document.addEventListener('DOMContentLoaded', function() {
    // Embedded SOLIDWORKS Beginner Projects navigation
    (function initSolidworksEmbedded(){
        const card = document.getElementById('solidworks-beginner-card');
        if(!card) return;
        const views = card.querySelectorAll('.sw-view');
        const tiles = card.querySelectorAll('.sw-tile');
        const backButtons = card.querySelectorAll('.sw-back');
            const modeBtns = card.querySelectorAll('.sw-mode-btn');
        let current = 'root';

        // Inject day-specific projects into CW and HW sections
        function injectDayProjects() {
            const solidworksProject = sampleProjects.find(p => p.title === "SOLIDWORKS Beginner Projects");
            if (!solidworksProject || !solidworksProject.dayProjects) {
                return;
            }

            const cwFilesWrap = document.getElementById('cw-files-wrap');
            const hwFilesWrap = document.getElementById('hw-files-wrap');

            function createProjectItem(file, type) {
                const spotTestBadge = file.isSpotTest ? '<span class="spot-test-badge">📝 Spot Test</span>' : '';
                
                // Handle multiple downloads for projects like Day 5 HW 2
                let downloadButtons = '';
                if (file.downloads && Array.isArray(file.downloads)) {
                    downloadButtons = file.downloads.map(dl => `
                        <a href="${dl.url}" target="_blank" class="sw-action-btn sw-btn-download" title="Download ${dl.type}">
                            <i class="fas fa-download"></i> ${dl.type}
                        </a>
                    `).join('');
                } else if (file.download) {
                    downloadButtons = `
                        <a href="${file.download}" target="_blank" class="sw-action-btn sw-btn-download" title="Download SLDPRT">
                            <i class="fas fa-download"></i> Download
                        </a>
                    `;
                }
                
                const actionButtons = `
                    <div class="sw-file-actions">
                        <a href="${file.page}" target="_blank" class="sw-action-btn sw-btn-page" title="View Details">
                            <i class="fas fa-info-circle"></i> Details
                        </a>
                        ${downloadButtons}
                        ${file.preview ? `<a href="${file.preview}" target="_blank" class="sw-action-btn sw-btn-preview" title="View Preview">
                            <i class="fas fa-eye"></i> Preview
                        </a>` : ''}
                        ${file.preview2 ? `<a href="${file.preview2}" target="_blank" class="sw-action-btn sw-btn-preview" title="View Preview 2">
                            <i class="fas fa-eye"></i> Preview 2
                        </a>` : ''}
                        ${file.model3d ? `<button class="sw-action-btn sw-btn-3d" onclick="open3DViewer('${file.model3d}')" title="View 3D Model">
                            <i class="fas fa-cube"></i> 3D View
                        </button>` : ''}
                    </div>
                `;
                
                return `
                    <div class="sw-file-item ${file.isSpotTest ? 'spot-test' : ''}">
                        <div class="sw-file-header">
                            <i class="fas ${type === 'cw' ? 'fa-chalkboard-teacher' : 'fa-home'}"></i>
                            <span class="sw-file-name">${file.name}</span>
                            ${spotTestBadge}
                        </div>
                        ${actionButtons}
                    </div>
                `;
            }

            if (cwFilesWrap) {
                let cwHtml = '';
                Object.keys(solidworksProject.dayProjects).forEach(day => {
                    const dayData = solidworksProject.dayProjects[day];
                    cwHtml += `
                        <div class="sw-day-section">
                            <h5 class="sw-day-title">${day}</h5>
                            <div class="sw-file-list">
                                ${dayData.cw.map(file => createProjectItem(file, 'cw')).join('')}
                            </div>
                        </div>
                    `;
                });
                cwFilesWrap.innerHTML = cwHtml;
            }

            if (hwFilesWrap) {
                let hwHtml = '';
                Object.keys(solidworksProject.dayProjects).forEach(day => {
                    const dayData = solidworksProject.dayProjects[day];
                    hwHtml += `
                        <div class="sw-day-section">
                            <h5 class="sw-day-title">${day}</h5>
                            <div class="sw-file-list">
                                ${dayData.hw.map(file => createProjectItem(file, 'hw')).join('')}
                            </div>
                        </div>
                    `;
                });
                hwFilesWrap.innerHTML = hwHtml;
            }

            // Add quick links section
            addQuickLinksSection();
        }

        // Function to add quick links section
        function addQuickLinksSection() {
            const solidworksProject = sampleProjects.find(p => p.title === "SOLIDWORKS Beginner Projects");
            if (!solidworksProject || !solidworksProject.quickLinks) return;

            const quickLinksHtml = `
                <div class="sw-quick-links">
                    <h4 class="sw-quick-title">🚀 Quick Access</h4>
                    <div class="sw-quick-buttons">
                        <a href="${solidworksProject.quickLinks.coursework}" target="_blank" class="sw-quick-btn">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <span>All Coursework</span>
                        </a>
                        <a href="${solidworksProject.quickLinks.homework}" target="_blank" class="sw-quick-btn">
                            <i class="fas fa-home"></i>
                            <span>All Homework</span>
                        </a>
                        <a href="${solidworksProject.quickLinks.models3d}" target="_blank" class="sw-quick-btn">
                            <i class="fas fa-cube"></i>
                            <span>3D Models</span>
                        </a>
                    </div>
                </div>
            `;

            // Add to root view
            const rootView = card.querySelector('.sw-root .sw-root-info');
            if (rootView && !rootView.querySelector('.sw-quick-links')) {
                rootView.insertAdjacentHTML('beforeend', quickLinksHtml);
            }
        }

        // Global function for 3D viewer
        window.open3DViewer = function(modelUrl) {
            const modal = document.getElementById('model-viewer-modal') || createModelViewerModal();
            const viewer = document.getElementById('inline-model-viewer');
            viewer.setAttribute('src', modelUrl);
            modal.style.display = 'flex';
        };

        // Create 3D viewer modal if it doesn't exist
        function createModelViewerModal() {
            const modalHtml = `
                <div id="model-viewer-modal" class="model-viewer-modal" style="display: none;">
                    <div class="model-viewer-backdrop" onclick="closeModelViewer()"></div>
                    <div class="model-viewer-content">
                        <div class="model-viewer-header">
                            <h3>3D Model Viewer</h3>
                            <button onclick="closeModelViewer()" class="close-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <model-viewer id="inline-model-viewer" 
                            camera-controls 
                            auto-rotate 
                            shadow-intensity="1"
                            style="width: 100%; height: 500px;">
                        </model-viewer>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Add close function
            window.closeModelViewer = function() {
                const modal = document.getElementById('model-viewer-modal');
                modal.style.display = 'none';
                document.getElementById('inline-model-viewer').removeAttribute('src');
            };

            return document.getElementById('model-viewer-modal');
        }

        // Call the injection function after DOM is ready
        setTimeout(injectDayProjects, 100);
        
        // Backup call in case timing is an issue
        setTimeout(() => {
            injectDayProjects();
        }, 2000);

        function showView(name){
            current = name;
            views.forEach(v=>{
                const match = v.getAttribute('data-view') === name;
                if(match){
                    v.removeAttribute('hidden');
                    v.classList.add('active-sw-view');
                } else {
                    v.setAttribute('hidden','');
                    v.classList.remove('active-sw-view');
                }
            });
                // update mode buttons aria-current
                modeBtns.forEach(btn => {
                    const target = btn.getAttribute('data-target');
                    if(target === name || (name!== 'cw' && name !== 'hw' && target==='root')){
                        btn.setAttribute('aria-current','true');
                    } else {
                        btn.removeAttribute('aria-current');
                    }
                });
        }
        tiles.forEach(t=> t.addEventListener('click', ()=>{
            const target = t.getAttribute('data-target');
            if(target) showView(target);
        }));
        backButtons.forEach(b=> b.addEventListener('click', ()=>{
            const back = b.getAttribute('data-back');
            if(back) showView(back);
        }));
        modeBtns.forEach(mb => mb.addEventListener('click', ()=>{
            const target = mb.getAttribute('data-target');
            if(target) showView(target);
        }));
        // Keyboard support: ESC to go back if not root
        card.addEventListener('keydown', e=>{
            if(e.key === 'Escape' && current !== 'root'){
                showView('root');
            }
            // Arrow key navigation between mode buttons
            if(e.target.classList.contains('sw-mode-btn')){
                const btnArray = Array.from(modeBtns);
                const idx = btnArray.indexOf(e.target);
                if(e.key==='ArrowRight' || e.key==='ArrowDown'){
                    const next = btnArray[(idx+1)%btnArray.length];
                    next.focus();
                    e.preventDefault();
                } else if(e.key==='ArrowLeft' || e.key==='ArrowUp'){
                    const prev = btnArray[(idx-1+btnArray.length)%btnArray.length];
                    prev.focus();
                    e.preventDefault();
                } else if(e.key==='Home'){ btnArray[0].focus(); e.preventDefault(); }
                else if(e.key==='End'){ btnArray[btnArray.length-1].focus(); e.preventDefault(); }
            }
            // Enter/Space on tile triggers view
            if(e.target.classList.contains('sw-tile') && (e.key==='Enter' || e.key===' ')){
                e.preventDefault();
                const target = e.target.getAttribute('data-target');
                if(target) showView(target);
            }
        });
        // Make tiles focusable for keyboard users
        tiles.forEach(t => { if(!t.hasAttribute('tabindex')) t.setAttribute('tabindex','0'); });
        // Simple ripple effect on click for tiles & mode buttons
        function addRipple(e){
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'sw-ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            el.appendChild(ripple);
            setTimeout(()=> ripple.remove(), 650);
        }
        [...tiles, ...modeBtns].forEach(el => {
            el.addEventListener('click', addRipple);
        });
        showView('root');
    })();
    // Removed legacy modal code in favor of embedded navigation
    // Enhanced profile image fallback logic
    (function initProfilePhoto(){
        const img = document.getElementById('profile-photo');
        if(!img) return;
        const wrapper = img.closest('#profile-photo-wrapper') || img.closest('.profile-image');
        
        if(wrapper) { 
            wrapper.classList.add('loading'); 
        }
        
        function markReady() { 
            if(wrapper) { 
                wrapper.classList.remove('loading'); 
                wrapper.classList.add('ready'); 
            } 
        }
        
        function fallback(){
            console.log('Profile image fallback triggered');
            if(document.getElementById('profile-fallback')) return;
            const fb = document.createElement('div');
            fb.id = 'profile-fallback';
            fb.className = 'profile-fallback';
            fb.textContent = 'MAI'; // Md Akhinoor Islam initials
            fb.style.position = 'absolute';
            fb.style.inset = '0';
            fb.style.display = 'flex';
            fb.style.alignItems = 'center';
            fb.style.justifyContent = 'center';
            fb.style.fontSize = '2.5rem';
            fb.style.fontWeight = '700';
            fb.style.color = '#ffffff';
            fb.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
            fb.style.borderRadius = '50%';
            
            if(wrapper) { 
                wrapper.appendChild(fb); 
                wrapper.classList.add('ready'); 
            }
        }
        
        img.addEventListener('load', ()=> {
            console.log('Profile image loaded successfully');
            if(img.naturalWidth > 0) { 
                markReady(); 
            } else { 
                fallback(); 
            }
        });
        
        img.addEventListener('error', (e) => {
            console.log('Profile image failed to load:', e);
            fallback();
        });
        
        // Check if image is already loaded (cached)
        if(img.complete && img.naturalWidth > 0) {
            console.log('Profile image already loaded from cache');
            markReady();
        } else {
            // If after delay still not loaded, trigger fallback
            setTimeout(()=> { 
                if(!img.complete || img.naturalWidth === 0) {
                    console.log('Profile image loading timeout, using fallback');
                    fallback(); 
                }
            }, 3000);
        }
    })();

    // Profile upload & persistence logic
    (function initProfileUpload(){
        const fileInput = document.getElementById('profile-upload-input');
        const triggerBtn = document.getElementById('trigger-profile-upload');
        const statusEl = document.getElementById('profile-upload-status');
        const img = document.getElementById('profile-photo');
        const controls = document.querySelector('.profile-upload-controls');
        if(!fileInput || !triggerBtn || !img) return;

        const LS_KEY = 'portfolio.profile.photo.v1';
        const MAX_SIZE = 1.2 * 1024 * 1024; // 1.2MB
        const ACCEPTED = ['image/jpeg','image/png','image/webp'];

        function setStatus(msg, isError=false){
            if(!statusEl) return; 
            statusEl.textContent = msg; 
            statusEl.classList.toggle('profile-upload-error', !!isError);
        }

        function applyStored(){
            try {
                const data = localStorage.getItem(LS_KEY);
                if(data){
                    img.src = data; // base64 url
                    if(resetBtn) resetBtn.hidden = false;
                    setStatus('Loaded saved photo');
                }
            } catch(e){ console.warn('Profile photo load failed', e); }
        }

        function validateFile(file){
            if(!ACCEPTED.includes(file.type)) return 'Unsupported type';
            if(file.size > MAX_SIZE) return 'File too large (>1.2MB)';
            return null;
        }

        function handleFile(file){
            const error = validateFile(file);
            if(error){ setStatus(error, true); return; }
            setStatus('Processing...');
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const result = reader.result;
                    img.src = result;
                    localStorage.setItem(LS_KEY, result);
                    setStatus('Profile updated ✓');
                } catch(e){ setStatus('Store failed', true); }
            };
            reader.onerror = () => setStatus('Read error', true);
            reader.readAsDataURL(file);
        }

        triggerBtn.addEventListener('click', ()=> fileInput.click());
        fileInput.addEventListener('change', e => {
            const f = e.target.files && e.target.files[0];
            if(f) handleFile(f);
            fileInput.value = '';
        });


        // Drag & drop support
        if(controls){
            ['dragenter','dragover'].forEach(evt => controls.addEventListener(evt, e=>{ e.preventDefault(); controls.classList.add('drag-over'); }));
            ['dragleave','drop'].forEach(evt => controls.addEventListener(evt, e=>{ e.preventDefault(); controls.classList.remove('drag-over'); }));
            controls.addEventListener('drop', e => {
                const f = e.dataTransfer.files && e.dataTransfer.files[0];
                if(f) handleFile(f);
            });
        }

        applyStored();
    })();
});
// Enhanced projects data with engineering focus
const sampleProjects = [
    {
        title: "Interactive Engineering Portfolio Website",
        shortDescription: "Modern, responsive portfolio website showcasing engineering projects with dark/light theme, animations, and interactive features.",
        fullDescription: "A comprehensive, interactive portfolio website built from scratch to showcase engineering projects and technical skills. This modern web application features a responsive design with dark/light theme toggle, smooth animations, particle background effects, and interactive project modals. The website includes advanced functionality such as project filtering, search capabilities, contact forms, and GitHub API integration. Built with vanilla HTML, CSS, and JavaScript, it demonstrates proficiency in modern web development while maintaining focus on engineering content. The site features three main project categories: CAD design (SOLIDWORKS), embedded systems (Arduino), and electronics components. Includes comprehensive documentation, deployment guides, and fallback systems for reliable performance.",
        tech: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "GitHub Pages", "Web Development"],
        category: "web",
        github: "https://github.com/Akhinoor14/Solidworks-Website-Project",
        demo: "https://akhinoor14.github.io/Solidworks-Website-Project",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop"
        ],
        features: ["Dark/Light Theme", "Interactive Animations", "Project Modals", "Responsive Design", "GitHub Integration", "Contact Form"],
        featured: true
    },
    {
        title: "SOLIDWORKS Beginner Projects",
        shortDescription: "21+ SOLIDWORKS projects for beginners with step-by-step tutorials covering mechanical parts, assemblies, and technical drawings across 5 days of structured learning.",
        fullDescription: "A comprehensive collection of 21+ SOLIDWORKS projects specifically designed for beginners entering the world of CAD design. This repository serves as a complete learning resource featuring mechanical parts design, complex assemblies, and professional technical drawings across 5 days of structured coursework and homework assignments. Each project includes detailed step-by-step tutorials with screenshots, downloadable SOLIDWORKS files, preview images, and real-world engineering applications. Perfect for students, engineers, and hobbyists looking to master 3D modeling techniques used in modern engineering design. Projects range from simple bracket designs to complex mechanical assemblies and technical drawings, providing a progressive learning path that builds skills systematically from Day 1 through Day 7.",
        tech: ["SOLIDWORKS", "CAD Design", "3D Modeling", "Technical Drawing", "Engineering"],
        category: "desktop",
        github: "https://github.com/Akhinoor14/SOLIDWORKS-Projects",
        demo: null,
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=400&fit=crop"
        ],
        features: ["Step-by-step tutorials", "Downloadable files", "Progressive difficulty", "Real-world applications"],
        featured: true,
        // Add CW/HW folders and example files for interactive UI
        folders: [
            {
                label: "Class Work (CW)",
                icon: "📂",
                url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW",
                files: [
                    { name: "CW01 - Simple Bracket", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW01.SLDPRT" },
                    { name: "CW02 - Shaft Coupling", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW02.SLDPRT" },
                    { name: "CW03 - Flange", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW03.SLDPRT" }
                ]
            },
            {
                label: "Home Work (HW)",
                icon: "🏠",
                url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW",
                files: [
                    { name: "HW01 - Pulley", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW01.SLDPRT" },
                    { name: "HW02 - Gear", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW02.SLDPRT" },
                    { name: "HW03 - Clamp", url: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW03.SLDPRT" }
                ]
            }
        ],
        // Day-specific project structure for dynamic injection
        dayProjects: {
            "Day 01": {
                cw: [
                    { 
                        name: "CW 1 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2001/cw%201%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%201%20day%2001/cWW1.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%201%20day%2001/cw%201.png"
                    },
                    { 
                        name: "CW 2 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2001/cw%202%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%202%20day%2001/cw2.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2001/cw%202%20day%2001/cw%202.png"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2001/hw%2001%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2001%20day%2001/HW%201.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2001%20day%2001/hw%201.png"
                    },
                    { 
                        name: "HW 2 - Day 01", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2001/hw%2002%20day%2001/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2002%20day%2001/HW%202.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2002%20day%2001/2.1.png",
                        preview2: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2001/hw%2002%20day%2001/2.2.png"
                    }
                ]
            },
            "Day 02": {
                cw: [
                    { 
                        name: "CW 1 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2002/cw%201%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%201%20day%2002/cw%203%20DAY%2002%2C%2001.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%201%20day%2002/cw%203%20DAY%2002%2C%2001.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%201%20day%2002/cw_3_day_02%2C_01.glb"
                    },
                    { 
                        name: "CW 2 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2002/cw%202%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%202%20day%2002/cw%20%20DAY%2002%2C%2002.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%202%20day%2002/cw%20%20DAY%2002%2C%2002.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2002/cw%202%20day%2002/cw%20%20DAY%2002%2C%2002.glb"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2002/hw%2001%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2001%20day%2002/HW%203%20DAY%2002%2C%2001.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2001%20day%2002/HW%203%20DAY%2002%2C%2001.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2001%20day%2002/hw_3_day_02%2C_01.glb"
                    },
                    { 
                        name: "HW 2 - Day 02", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2002/hw%2002%20day%2002/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2002%20day%2002/HW%204%20DAY%2002%2C%2002.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2002%20day%2002/HW%204%20DAY%2002%2C%2002.JPG",
                        model3d: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2002/hw%2002%20day%2002/hw_4_day_02%2C_02.glb"
                    }
                ]
            },
            "Day 03": {
                cw: [
                    { 
                        name: "CW 1 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2003/cw%201%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2003/cw%201%20day%2003/cw%2001%2C%20day%2003.SLDPRT"
                    },
                    { 
                        name: "CW 2 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2003/cw%202%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2003/cw%202%20day%2003/cw%2002%2C%20day%2003.SLDPRT"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2003/hw%201%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2003/hw%201%20day%2003/hw%20day%203%2C%2001.SLDPRT"
                    },
                    { 
                        name: "HW 2 - Day 03", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2003/hw%202%20day%2003/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2003/hw%202%20day%2003/hw%20day%203%2C%2002.SLDPRT"
                    }
                ]
            },
            "Day 04": {
                cw: [
                    { 
                        name: "CW 1 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2004/cw%201%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%201%20day%204/cw%2001.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%201%20day%204/Screenshot%202025-10-13%20032712.png"
                    },
                    { 
                        name: "CW 2 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2004/cw%202%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%202%20day%204/cw%2002.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/cw%202%20day%204/Screenshot%202025-10-13%20032801.png"
                    },
                    { 
                        name: "Spot Test - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2004/spot%20test%20Day%2004/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/spot%20test%20Day%2004/cw%20spot%20test.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2004/spot%20test%20Day%2004/Screenshot%202025-10-13%20032734.png",
                        isSpotTest: true
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2004/hw%201%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2004/hw%201%20day%204/02.SLDPRT"
                    },
                    { 
                        name: "HW 2 - Day 04", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%2004/hw%202%20day%204/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2004/hw%202%20day%204/01.SLDPRT"
                    }
                ]
            },
            "Day 05": {
                cw: [
                    { 
                        name: "CW 1 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2005/day%205%20cw%201/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%201/day%205%20cw%201.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%201/Screenshot%202025-10-20%20122707.png"
                    },
                    { 
                        name: "CW 2 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2005/day%205%20cw%202/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%202/day%205%20cw%202.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2005/day%205%20cw%202/Screenshot%202025-10-20%20122757.png"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%205/hw%2001%20day%205/README.md",
                        download: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2001%20day%205/hw%2001%20day%205%20drill.SLDPRT",
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2001%20day%205/Screenshot%202025-10-19%20225850.png"
                    },
                    { 
                        name: "HW 2 - Day 05", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/Day%205/hw%2002%20day%205/README.md",
                        downloads: [
                            {
                                type: "Part",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2002%20day%205/hw%2002%20day%205%20spanner%20main.SLDPRT"
                            },
                            {
                                type: "Drawing",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2002%20day%205/hw%2002%20day%205%20spanner.SLDDRW"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%205/hw%2002%20day%205/Screenshot%202025-10-20%20120639.png"
                    }
                ]
            },
            "Day 06": {
                cw: [
                    { 
                        name: "CW 1 - Day 06", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW/Day%2006",
                        downloads: [
                            {
                                type: "Assembly",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/Assem1%20day%206.SLDASM"
                            },
                            {
                                type: "Part 1", 
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/part1%20day%206.SLDPRT"
                            },
                            {
                                type: "Part 2",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/part2%20day%206.SLDPRT"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2006/Screenshot%20day%206.png"
                    }
                ],
                hw: [
                    { 
                        name: "HW 1 - Day 06", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW/Day%2006",
                        downloads: [
                            {
                                type: "Part",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2006/hw%20day%206.SLDPRT"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/HW/Day%2006/Screenshot%20hw%20day%206.png"
                    }
                ]
            },
            "Day 07": {
                cw: [
                    { 
                        name: "CW 1 - Day 07", 
                        page: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW/Day%2007",
                        downloads: [
                            {
                                type: "Assembly",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/Assem1%20day%207.SLDASM"
                            },
                            {
                                type: "Part 1",
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/part1%20day%207.SLDPRT"
                            },
                            {
                                type: "Part 2", 
                                url: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/part2%20day%207.SLDPRT"
                            }
                        ],
                        preview: "https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/CW/Day%2007/Screenshot%20day%207.png"
                    }
                ],
                hw: []
            }
        },
        // Quick access links
        quickLinks: {
            coursework: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW",
            homework: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW", 
            models3d: "https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/Day%2002/cw%201%20day%2002/README.md"
        }
    },
    {
        title: "Arduino UNO Projects with Tinkercad",
        shortDescription: "40+ Arduino experiments in Tinkercad covering sensors, IoT, and embedded systems with circuit diagrams and code.",
        fullDescription: "An extensive collection of 40+ foundational Arduino UNO experiments designed and simulated using Tinkercad platform. This comprehensive resource covers essential topics in embedded systems including sensor interfacing, actuator control, display programming, and IoT fundamentals. Each project features detailed circuit diagrams, well-commented Arduino code, and practical real-world applications. The projects are structured to provide hands-on experience with various components like LEDs, sensors, motors, displays, and communication modules. Perfect for students, educators, and makers who want to master embedded systems programming and IoT development. All projects are tested and verified in Tinkercad simulation environment.",
        tech: ["Arduino", "C++", "Tinkercad", "IoT", "Embedded Systems", "Sensors"],
        category: "web",
        github: "https://github.com/Akhinoor14/Tinkercad-basic-Projects-Using-Arduino-Uno",
        demo: "https://www.tinkercad.com/users/akhinoor14",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=400&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1518309435079-11f4ccfec336?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop"
        ],
        features: ["40+ Projects", "Circuit diagrams", "Commented code", "IoT applications"],
        featured: false
    },
    {
        title: "Electronic Components Guide",
        shortDescription: "Interactive guide to essential electronic components with detailed explanations and practical circuit examples.",
        fullDescription: "A comprehensive interactive guide covering essential electronic components used in modern circuit design and electronics engineering. This educational resource provides detailed explanations of resistors, capacitors, transistors, integrated circuits, and other fundamental components. Each component section includes theoretical background, practical applications, circuit examples, and troubleshooting tips. The guide features visual representations, component specifications, and real-world usage scenarios that help students and engineers understand how to properly select and implement components in their designs. Essential for anyone working with electronics, from hobbyists to professional engineers developing complex systems.",
        tech: ["Electronics", "Circuit Design", "Component Analysis", "PCB Design"],
        category: "web",
        github: "https://github.com/Akhinoor14/Electronic-Components-",
        demo: null,
        image: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=600&h=300&fit=crop&crop=center",
        gallery: [
            "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=800&h=400&fit=crop"
        ],
        features: ["Component specs", "Circuit examples", "Visual guides", "Troubleshooting tips"],
        featured: false
    }
];

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const projectsGrid = document.getElementById('projects-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const contactForm = document.querySelector('.contact-form');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Theme Toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', toggleTheme);

// Initialize theme on page load
initializeTheme();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            navbar.style.background = 'rgba(17, 24, 39, 0.98)';
        }
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            navbar.style.background = 'rgba(17, 24, 39, 0.95)';
        }
    }
});

// Projects functionality
// Projects functionality with enhanced interactivity
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = `project-card ${project.category} ${project.featured ? 'featured' : ''}`;
    
    // Create fallback image based on project type
    const fallbackImage = project.category === 'web' && project.title.includes('Arduino') 
        ? 'https://via.placeholder.com/600x300/FF6B35/ffffff?text=Arduino+Projects'
        : project.category === 'desktop' && project.title.includes('SOLIDWORKS')
        ? 'https://via.placeholder.com/600x300/4F46E5/ffffff?text=SOLIDWORKS+Projects'
        : project.category === 'web' && project.title.includes('Electronic')
        ? 'https://via.placeholder.com/600x300/10B981/ffffff?text=Electronic+Components'
        : project.category === 'web' && project.title.includes('Portfolio')
        ? 'https://via.placeholder.com/600x300/7C3AED/ffffff?text=Portfolio+Website'
        : 'https://via.placeholder.com/600x300/6366F1/ffffff?text=Engineering+Project';
    
    // Add interactive CW/HW folders for SOLIDWORKS project
    let foldersHtml = '';
    if (project.title === "SOLIDWORKS Beginner Projects" && project.folders) {
        foldersHtml = project.folders.map(folder => `
            <details style="margin-top:0.5em;">
                <summary><b>${folder.icon} ${folder.label}</b> <a href="${folder.url}" target="_blank" style="font-size:0.9em;">[Open Folder]</a></summary>
                <ul style="margin:0.5em 0 0 1.5em;">
                    ${folder.files.map(f => `<li><a href="${f.url}" target="_blank">${f.name}</a></li>`).join('')}
                </ul>
            </details>
        `).join('');
    }

    card.innerHTML = `
        <div class="project-image">
            <img src="${project.image}" 
                 alt="${project.title}" 
                 style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${fallbackImage}'; console.log('Image failed for ${project.title}, using fallback');">
            <div class="project-overlay">
                <div class="project-status">
                    ${project.featured ? '<span class="featured-badge">★ Featured</span>' : ''}
                    <span class="category-badge">${project.category.toUpperCase()}</span>
                </div>
                <div class="project-actions">
                    <button class="view-details-btn" onclick="openProjectModal('${project.title}')" 
                            style="background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; margin: 5px;">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.shortDescription}</p>
            <div class="project-features">
                ${project.features.slice(0, 2).map(feature => `<span class="feature-tag">• ${feature}</span>`).join('')}
            </div>
            <div class="project-tech">
                ${project.tech.slice(0, 3).map(tech => `<span class="tech-tag" style="background: var(--primary-light); color: var(--primary-color);">${tech}</span>`).join('')}
                ${project.tech.length > 3 ? `<span class="tech-more">+${project.tech.length - 3} more</span>` : ''}
            </div>
            <div class="project-links">
                <a href="${project.github}" class="project-link primary" target="_blank" rel="noopener">
                    <i class="fab fa-github"></i> View Code
                </a>
                ${project.demo ? `<a href="${project.demo}" class="project-link secondary" target="_blank" rel="noopener">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>` : ''}
                <button class="project-link details" onclick="openProjectModal('${project.title}')" 
                        style="background: none; border: 2px solid var(--primary-color); color: var(--primary-color);">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
            ${foldersHtml}
        </div>
    `;
    
    // Add enhanced hover effects
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) scale(1.02)';
        card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    });
    
    return card;
}

function renderProjects(projectsToShow = sampleProjects) {
    // Preserve embedded SOLIDWORKS card if exists
    const embedded = document.getElementById('solidworks-beginner-card');
    const keepEmbedded = !!embedded;
    // Remove all dynamically generated cards only
    Array.from(projectsGrid.children).forEach(child => {
        if(!keepEmbedded || child !== embedded) {
            if(!child.id || child.id !== 'solidworks-beginner-card') {
                child.remove();
            }
        }
    });
    if(embedded) embedded.classList.add('visible');
    // Append dynamic cards after embedded card (or at start if none)
    projectsToShow.forEach((project, index) => {
        // Skip if project is the embedded concept to avoid duplicate
        if(project.title === 'SOLIDWORKS Beginner Projects') return;
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
        setTimeout(() => { card.classList.add('visible'); }, index * 100);
    });
}

// Filter projects
function filterProjects(category) {
    let filteredProjects = category === 'all' 
        ? sampleProjects 
        : sampleProjects.filter(project => project.category === category);
    // Ensure SOLIDWORKS project still available logically but we skip duplicate rendering
    if(!filteredProjects.find(p=>p.title==='SOLIDWORKS Beginner Projects') && category!=='desktop' && category!=='all') {
        // nothing to do; embedded remains but may not match filter; choose to hide if not matching
        const embedded = document.getElementById('solidworks-beginner-card');
        if(embedded) embedded.style.display = 'none';
    } else {
        const embedded = document.getElementById('solidworks-beginner-card');
        if(embedded) embedded.style.display = '';
    }
    
    // Hide all cards first
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.classList.add('hidden');
        card.classList.remove('visible');
    });
    
    // Show filtered projects after a short delay
    setTimeout(() => {
        renderProjects(filteredProjects);
    }, 300);
}

// Filter button event listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active filter button
        filterBtns.forEach(button => button.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter projects
        const category = btn.getAttribute('data-filter');
        filterProjects(category);
    });
});

// Initialize projects
renderProjects();

// Contact form handling
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Here you would typically send the data to a server
    // For now, we'll just show an alert
    alert(`Thank you ${name}! Your message has been received. I'll get back to you at ${email} soon.`);
    
    // Reset form
    contactForm.reset();
});

// Scroll animations
function observeElements() {
    const elements = document.querySelectorAll('.fade-in, .stat-card, .skill-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', observeElements);

// GitHub API integration for real-time data
async function fetchGitHubProjects(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        const repos = await response.json();
        
        const projects = repos.map(repo => ({
            title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: repo.description || 'No description available',
            tech: repo.language ? [repo.language] : ['JavaScript'],
            category: 'web',
            github: repo.html_url,
            demo: repo.homepage || null,
            image: `https://opengraph.githubassets.com/1/${username}/${repo.name}`,
            featured: repo.stargazers_count > 5
        }));
        
        return projects;
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return sampleProjects;
    }
}

// Load real GitHub data (disabled to show only sample projects)
// Uncomment the code below if you want to add more projects from GitHub
/*
(async () => {
    try {
        const githubProjects = await fetchGitHubProjects('Akhinoor14');
        if (githubProjects.length > 0) {
            // Merge with sample projects for better display
            const allProjects = [...sampleProjects, ...githubProjects.slice(0, 3)];
            renderProjects(allProjects);
        }
    } catch (error) {
        console.log('Using sample projects as fallback');
        renderProjects(sampleProjects);
    }
})();
*/

// Typing animation for hero text
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation
document.addEventListener('DOMContentLoaded', () => {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        typeWriter(heroSubtitle, originalText, 100);
    }
    
    // Add floating animation to tech badges
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
        element.classList.add('floating-animation');
    });
    
    // Initialize counters on page load (keep existing values from HTML)
    // Don't reset to 0, just prepare for updates
    console.log('✅ Page loaded - counters ready');
});

// Counter animation for stats - SIMPLE VERSION (no reset to 0)
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const targetAttr = counter.getAttribute('data-target');
        if (!targetAttr) return;
        
        const target = parseInt(targetAttr);
        const currentText = counter.textContent.replace('+', '');
        const current = parseInt(currentText) || 0;
        
        // If already at target, skip animation
        if (current === target) return;
        
        let value = current;
        const increment = Math.ceil((target - current) / 50);
        
        const updateCounter = () => {
            if (value < target) {
                value += increment;
                if (value > target) value = target;
                counter.textContent = value;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && value !== target) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Add loading states for better UX
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Add particles animation (optional enhancement)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.1;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// Add particles animation (optional enhancement)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.1;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// Initialize particles (enable for cool background effect)
createParticles();

// Enhanced Homepage Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    initializeHomepageAnimations();
    createParticleSystem();
    initializeTypingAnimation();
    initializeCounterAnimation();
    initializeSkillBadgeInteractions();
});

// Particle System for Background
function createParticleSystem() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Typing Animation
function initializeTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const text = typingElement.getAttribute('data-text');
    let index = 0;
    
    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }
    
    // Start typing after page load
    setTimeout(type, 1000);
}

// Counter Animation
function initializeCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                let current = 0;
                const increment = target / 100;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Skill Badge Interactions
function initializeSkillBadgeInteractions() {
    const skillBadges = document.querySelectorAll('.skill-badge');
    
    skillBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-10px) rotate(2deg)';
            
            // Add glow effect
            this.style.boxShadow = '0 15px 45px rgba(79, 70, 229, 0.3)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0) rotate(0deg)';
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        });
        
        badge.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Homepage Load Animations
function initializeHomepageAnimations() {
    // Stagger animation for hero elements
    const animatedElements = document.querySelectorAll('.animate-on-load');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animationPlayState = 'running';
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
}

// Download Resume Function
function downloadResume() {
    // Download the actual PDF CV file
    const cvPath = './CV/2313014 CV.pdf';
    
    // Create a temporary link to download the CV
    const a = document.createElement('a');
    a.href = cvPath;
    a.download = 'Md_Akhinoor_Islam_CV.pdf';
    a.target = '_blank'; // Open in new tab if download fails
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show success message
    const btn = event.target.closest('.btn-download');
    const originalText = btn.querySelector('.btn-text').textContent;
    btn.querySelector('.btn-text').textContent = 'Downloaded! ✓';
    
    setTimeout(() => {
        btn.querySelector('.btn-text').textContent = originalText;
    }, 2000);
    
    // Analytics tracking (optional)
    console.log('CV downloaded by user');
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroHeight = hero.offsetHeight;
    const scrollRatio = scrolled / heroHeight;
    
    if (scrollRatio <= 1) {
        // Move background elements at different speeds
        const shapes = document.querySelectorAll('.shape');
        const orbs = document.querySelectorAll('.orb');
        
        shapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        orbs.forEach((orb, index) => {
            const speed = 0.2 + (index * 0.05);
            orb.style.transform = `translateY(${scrolled * speed}px) scale(${1 - scrollRatio * 0.2})`;
        });
        
        // Fade out hero content as user scrolls
        const heroContent = document.querySelector('.hero-content');
        heroContent.style.opacity = Math.max(0, 1 - scrollRatio);
        heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Project search functionality
function addProjectSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search projects...';
    searchInput.className = 'project-search';
    searchInput.style.cssText = `
        margin: 20px 0;
        padding: 10px 15px;
        border: 2px solid var(--border-color);
        border-radius: 25px;
        width: 100%;
        max-width: 400px;
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s ease;
    `;
    
    const projectFilters = document.querySelector('.project-filters');
    projectFilters.parentNode.insertBefore(searchInput, projectFilters.nextSibling);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProjects = sampleProjects.filter(project =>
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.tech.some(tech => tech.toLowerCase().includes(searchTerm))
        );
        renderProjects(filteredProjects);
    });
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    addProjectSearch();
});

// Project Modal functionality
function openProjectModal(projectTitle) {
    const project = sampleProjects.find(p => p.title === projectTitle);
    if (!project) return;
    
    const modal = createProjectModal(project);
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal on escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function createProjectModal(project) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'projectModal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeProjectModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">${project.title}</h2>
                <button class="close-btn" onclick="closeProjectModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="project-gallery">
                    <div class="main-image">
                        <img src="${project.gallery[0]}" alt="${project.title}" id="mainImage">
                    </div>
                    <div class="gallery-thumbnails">
                        ${project.gallery.map((img, index) => `
                            <img src="${img}" alt="Gallery ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 onclick="changeMainImage('${img}', this)">
                        `).join('')}
                    </div>
                </div>
                <div class="project-details">
                    <div class="project-info">
                        <h3>Project Overview</h3>
                        <p class="full-description">${project.fullDescription}</p>
                        
                        <h3>Key Features</h3>
                        <ul class="features-list">
                            ${project.features.map(feature => `<li><i class="fas fa-check-circle"></i> ${feature}</li>`).join('')}
                        </ul>
                        
                        <h3>Technologies Used</h3>
                        <div class="tech-stack">
                            ${project.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                        </div>
                        
                        <div class="project-stats">
                            <div class="stat-item">
                                <i class="fas fa-star"></i>
                                <span>Category: ${project.category.toUpperCase()}</span>
                            </div>
                            ${project.featured ? '<div class="stat-item"><i class="fas fa-trophy"></i><span>Featured Project</span></div>' : ''}
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <a href="${project.github}" class="modal-btn primary" target="_blank" rel="noopener">
                            <i class="fab fa-github"></i> View Source Code
                        </a>
                        ${project.demo ? `<a href="${project.demo}" class="modal-btn secondary" target="_blank" rel="noopener">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </a>` : ''}
                        <button class="modal-btn outline" onclick="closeProjectModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .project-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .project-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            position: relative;
            max-width: 1200px;
            width: 90%;
            max-height: 90vh;
            margin: 5vh auto;
            background: var(--bg-color, white);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            transform: translateY(50px);
            transition: transform 0.3s ease;
        }
        
        .project-modal.show .modal-content {
            transform: translateY(0);
        }
        
        .modal-header {
            padding: 20px 30px;
            border-bottom: 1px solid var(--border-color, #eee);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, var(--primary-color, #4f46e5), var(--secondary-color, #7c3aed));
            color: white;
        }
        
        .modal-title {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.3s ease;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
            padding: 30px;
            max-height: calc(90vh - 140px);
            overflow-y: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .project-gallery {
            space-y: 15px;
        }
        
        .main-image {
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .main-image img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .main-image img:hover {
            transform: scale(1.05);
        }
        
        .gallery-thumbnails {
            display: flex;
            gap: 10px;
            overflow-x: auto;
        }
        
        .thumbnail {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .thumbnail:hover, .thumbnail.active {
            border-color: var(--primary-color, #4f46e5);
            transform: scale(1.1);
        }
        
        .project-details h3 {
            color: var(--primary-color, #4f46e5);
            margin: 20px 0 10px 0;
            font-size: 1.2rem;
        }
        
        .full-description {
            line-height: 1.6;
            color: var(--text-color, #333);
            margin-bottom: 20px;
        }
        
        .features-list {
            list-style: none;
            padding: 0;
        }
        
        .features-list li {
            padding: 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .features-list i {
            color: #10b981;
        }
        
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 20px;
        }
        
        .tech-badge {
            background: var(--primary-light, #eef2ff);
            color: var(--primary-color, #4f46e5);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .project-stats {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 20px 0;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-color, #666);
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .modal-btn {
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
            cursor: pointer;
        }
        
        .modal-btn.primary {
            background: var(--primary-color, #4f46e5);
            color: white;
        }
        
        .modal-btn.secondary {
            background: #10b981;
            color: white;
        }
        
        .modal-btn.outline {
            background: transparent;
            color: var(--text-color, #333);
            border: 2px solid var(--border-color, #ddd);
        }
        
        .modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
            .modal-body {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 20px;
            }
            
            .modal-actions {
                flex-direction: column;
            }
            
            .modal-btn {
                justify-content: center;
            }
        }
    `;
    
    if (!document.querySelector('#modal-styles')) {
        style.id = 'modal-styles';
        document.head.appendChild(style);
    }
    
    return modal;
}

function changeMainImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    mainImage.src = imageSrc;
    
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 3D viewer modal logic (moved from index.html for maintainability)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.view-3d-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const glbPath = this.getAttribute('data-glb');
            let src = '';
            if (glbPath.startsWith('CW/')) {
                src = `https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/${glbPath.replace(' ', '%20')}`;
            } else if (glbPath.startsWith('HW/')) {
                src = `https://raw.githubusercontent.com/Akhinoor14/SOLIDWORKS-Projects/main/${glbPath.replace(' ', '%20')}`;
            }
            document.getElementById('inline-model-viewer').setAttribute('src', src);
            document.getElementById('model-viewer-modal').style.display = 'flex';
        });
    });
    const closeBtn = document.getElementById('close-model-viewer');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('model-viewer-modal').style.display = 'none';
            document.getElementById('inline-model-viewer').removeAttribute('src');
        };
    }
});

// Add embedded card navigation for other project cards (Web, Mobile, Desktop)
function initEmbeddedProjectCard(cardId, sectionDefs) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const views = card.querySelectorAll('.sw-view');
    const tiles = card.querySelectorAll('.sw-tile');
    const backButtons = card.querySelectorAll('.sw-back');
    const modeBtns = card.querySelectorAll('.sw-mode-btn');
    let current = sectionDefs[0].view;

    function showView(name) {
        current = name;
        views.forEach(v => {
            const match = v.getAttribute('data-view') === name;
            if (match) {
                v.removeAttribute('hidden');
                v.classList.add('active-sw-view');
            } else {
                v.setAttribute('hidden', '');
                v.classList.remove('active-sw-view');
            }
        });
        modeBtns.forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === name || (name !== sectionDefs[1].view && name !== sectionDefs[2].view && target === sectionDefs[0].view)) {
                btn.setAttribute('aria-current', 'true');
            } else {
                btn.removeAttribute('aria-current');
            }
        });
    }
    tiles.forEach(t => t.addEventListener('click', () => {
        const target = t.getAttribute('data-target');
        if (target) showView(target);
    }));
    backButtons.forEach(b => b.addEventListener('click', () => {
        const back = b.getAttribute('data-back');
        if (back) showView(back);
    }));
    modeBtns.forEach(mb => mb.addEventListener('click', () => {
        const target = mb.getAttribute('data-target');
        if (target) showView(target);
    }));
    card.addEventListener('keydown', e => {
        if (e.key === 'Escape' && current !== sectionDefs[0].view) {
            showView(sectionDefs[0].view);
        }
        if (e.target.classList.contains('sw-mode-btn')) {
            const btnArray = Array.from(modeBtns);
            const idx = btnArray.indexOf(e.target);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                const next = btnArray[(idx + 1) % btnArray.length];
                next.focus();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                const prev = btnArray[(idx - 1 + btnArray.length) % btnArray.length];
                prev.focus();
                e.preventDefault();
            } else if (e.key === 'Home') { btnArray[0].focus(); e.preventDefault(); }
            else if (e.key === 'End') { btnArray[btnArray.length - 1].focus(); e.preventDefault(); }
        }
        if (e.target.classList.contains('sw-tile') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            if (target) showView(target);
        }
    });
    tiles.forEach(t => { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0'); });
    function addRipple(e) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'sw-ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    }
    [...tiles, ...modeBtns].forEach(el => {
        el.addEventListener('click', addRipple);
    });
    showView(sectionDefs[0].view);
}

// Initialize embedded navigation for Web, Mobile, Desktop cards
document.addEventListener('DOMContentLoaded', function () {
    // Web Projects Card
    initEmbeddedProjectCard('web-projects-card', [
        { view: 'web-root' }, { view: 'web-list' }
    ]);
    // Mobile Projects Card
    initEmbeddedProjectCard('mobile-projects-card', [
        { view: 'mobile-root' }, { view: 'mobile-list' }
    ]);
    // Desktop Projects Card
    initEmbeddedProjectCard('desktop-projects-card', [
        { view: 'desktop-root' }, { view: 'desktop-list' }
    ]);
});

/**
 * 🌍 GLOBAL COUNTER UPDATE UTILITY - SIMPLE VERSION
 * Direct counter update without animation complexity
 */
window.updateAllCountersGlobally = function(totalCW = 0, totalHW = 0, totalDays = 0) {
    console.log('🌍 Updating counters:', { totalCW, totalHW, totalDays });
    
    const totalProjects = totalCW + totalHW;
    
    try {
        // 1. Update Hero animated counters - DIRECTLY set value, no animation reset
        const heroCounters = document.querySelectorAll('[data-target="23"]');
        heroCounters.forEach(counter => {
            counter.setAttribute('data-target', totalProjects);
            counter.textContent = totalProjects; // Direct value, no 0 reset
        });

        // 2. Update Days counters
        const daysCounters = document.querySelectorAll('[data-target="7"]');
        daysCounters.forEach(counter => {
            counter.setAttribute('data-target', totalDays);
            counter.textContent = totalDays; // Direct value
        });

        // 3. Update HW counters
        const hwCounters = document.querySelectorAll('[data-target="8"]');
        hwCounters.forEach(counter => {
            counter.setAttribute('data-target', totalHW);
            counter.textContent = totalHW; // Direct value
        });

        // 4. Update Static counters (23+, 3+, 8+)
        const staticCounters = document.querySelectorAll('.stat-number');
        staticCounters.forEach(counter => {
            const text = counter.textContent;
            if (text.includes('23')) {
                counter.textContent = `${totalProjects}+`;
            } else if (text.includes('3') && !text.includes('23')) {
                counter.textContent = `${totalDays}+`;
            } else if (text.includes('8')) {
                counter.textContent = `${totalHW}+`;
            }
        });

        // 5. Update SOLIDWORKS Meta Counters (CW, HW, Total)
        const metaCounters = document.querySelectorAll('.sw-meta-num');
        if (metaCounters.length >= 3) {
            metaCounters[0].textContent = totalCW;      // CW
            metaCounters[1].textContent = totalHW;      // HW  
            metaCounters[2].textContent = totalProjects; // Total
        }

        // 6. Update SW Intro text
        const swIntro = document.getElementById('sw-intro');
        if (swIntro) {
            swIntro.textContent = `${totalProjects} SOLIDWORKS projects across ${totalDays} days of structured learning with downloads, previews, and real-world engineering applications to build strong CAD fundamentals.`;
        }

        console.log(`✅ Counters updated: ${totalCW} CW + ${totalHW} HW = ${totalProjects} Total (${totalDays} days)`);

    } catch (error) {
        console.error('❌ Counter update failed:', error);
    }
};

/**
 * 🔢 CALCULATE COUNTS FROM dayProjects
 * Helper to extract counts from current dayProjects data
 */
window.calculateProjectCounts = function() {
    if (!window.dayProjects) return { totalCW: 0, totalHW: 0, totalDays: 0 };
    
    let totalCW = 0, totalHW = 0;
    const totalDays = Object.keys(window.dayProjects).length;
    
    Object.values(window.dayProjects).forEach(day => {
        if (day.cw) totalCW += day.cw.length;
        if (day.hw) totalHW += day.hw.length;
    });
    
    return { totalCW, totalHW, totalDays };
};

/**
 * 🎯 AUTO-UPDATE COUNTERS FROM CURRENT DATA
 * Updates all counters based on current dayProjects
 */
window.refreshAllCounters = function() {
    const counts = window.calculateProjectCounts();
    window.updateAllCountersGlobally(counts.totalCW, counts.totalHW, counts.totalDays);
};

console.log('✅ Counter system loaded');

