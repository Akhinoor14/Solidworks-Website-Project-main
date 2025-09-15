# SOLIDWORKS Beginner Projects

<details>
   <summary><strong>Class Work (CW)</strong> &nbsp; <a href="https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW" target="_blank">[Main Folder]</a></summary>
   <ul>
      <li><a href="https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW/cw%201" target="_blank">CW 1</a></li>
      <li><a href="https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW/cw%202" target="_blank">CW 2</a></li>
   </ul>
</details>

<details>
   <summary><strong>Home Work (HW)</strong> &nbsp; <a href="https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW" target="_blank">[Main Folder]</a></summary>
   <ul>
      <li><a href="https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW/HW%201" target="_blank">HW 1</a></li>
      <li><a href="https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW/HW%202" target="_blank">HW 2</a></li>
   </ul>
</details>

---

<sub>Click the arrows to expand and see specific files. Main folder links open the full collection on GitHub. This structure keeps navigation clean and user-friendly!</sub>
# 🚀 Md Akhinoor Islam - Engineering Portfolio Deployment Guide

> Complete deployment guide for the interactive engineering portfolio website

## 📋 Table of Contents
- [🌐 Deployment Options](#-deployment-options)
- [⚡ Quick Setup Commands](#-quick-setup-commands)
- [✅ Pre-Deployment Checklist](#-pre-deployment-checklist)
- [📁 Files to Customize](#-files-to-customize)
- [🔧 Troubleshooting](#-troubleshooting)
- [🎯 Post-Deployment Tasks](#-post-deployment-tasks)

## 🌐 Deployment Options

### Option 1: GitHub Pages (Recommended) ⭐

**Best for**: Free hosting, custom domain support, automatic SSL

1. **Create a GitHub Repository**
   ```bash
   cd "c:\Users\AKHINOOR\Desktop\Solidworks Website Project"
   git init
   git add .
   git commit -m "Initial commit: Engineering Portfolio Website"
   git branch -M main
   git remote add origin https://github.com/Akhinoor14/engineering-portfolio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll to "Pages" section in the left sidebar
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your site will be live at**: 
   ```
   https://akhinoor14.github.io/engineering-portfolio
   ```

4. **Custom Domain (Optional)**
   - Add CNAME file with your domain
   - Configure DNS settings
   - Enable "Enforce HTTPS"

### Option 2: Netlify 🎯

**Best for**: Instant deployment, form handling, serverless functions

1. **Drag & Drop Method (Fastest)**
   - Go to [Netlify](https://netlify.com)
   - Drag your project folder to the deploy area
   - Get instant deployment with custom URL
   - Example: `https://akhinoor-portfolio.netlify.app`

2. **Git Integration Method (Recommended)**
   ```bash
   # First push to GitHub (see Option 1)
   # Then connect repository in Netlify dashboard
   ```
   - Connect your GitHub repository
   - Auto-deploy on every push
   - Branch previews for testing
   - Custom domain support

3. **Netlify CLI Method**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --dir .
   netlify deploy --dir . --prod  # For production
   ```

### Option 3: Vercel ⚡

**Best for**: Automatic optimization, edge network, React/Next.js friendly

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd "c:\Users\AKHINOOR\Desktop\Solidworks Website Project"
   vercel
   # Follow the prompts
   ```

3. **Git Integration**
   - Import from GitHub in Vercel dashboard
   - Automatic deployments on push
   - Preview deployments for branches

### Option 4: Traditional Web Hosting 🌐

**Best for**: Shared hosting, custom server configurations

Popular hosting providers:
- **Hostinger** - Affordable, good performance
- **SiteGround** - WordPress friendly
- **Bluehost** - Beginner friendly
- **DigitalOcean** - Developer friendly

**Upload via FTP/SFTP:**
```bash
# Upload all files to public_html or www directory
# Ensure index.html is in the root
```

## ⚡ Quick Setup Commands

### Local Development Server
```bash
# Navigate to project directory
cd "c:\Users\AKHINOOR\Desktop\Solidworks Website Project"

# Option 1: Python (if installed)
python -m http.server 8000
# Access: http://localhost:8000

# Option 2: Node.js live-server
npx live-server
# Auto-opens browser with live reload

# Option 3: PHP (if installed)
php -S localhost:8000

# Option 4: VS Code Live Server Extension
# Right-click index.html → "Open with Live Server"
```

### Git Setup for Your Portfolio
```bash
# Initialize repository
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: Add engineering portfolio with SOLIDWORKS, Arduino, and Electronics projects"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/Akhinoor14/SOLIDWORKS-Website-Project.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## ✅ Pre-Deployment Checklist

### 🎯 Personal Information Updates
- [ ] **Profile Photo**: Add your image as `images/profile.jpg` (currently using fallback)
- [ ] **Name & Title**: Update hero section with your name and title
- [ ] **About Section**: Verify department information (Energy Science and Engineering, KUET)
- [ ] **Contact Details**: Update email, phone numbers, and social media links
- [ ] **Bio Description**: Customize the hero description to reflect your interests

### 📊 Project Portfolio Updates
- [ ] **SOLIDWORKS Projects**: Verify GitHub link: `https://github.com/Akhinoor14/SOLIDWORKS-Projects`
    - **Direct Folders:**
        - [📂 Class Work (CW)](https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW)
        - [🏠 Home Work (HW)](https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW)
    - **Example Files:**
        - **CW:** [CW01 - Simple Bracket](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW01.SLDPRT), [CW02 - Shaft Coupling](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW02.SLDPRT), [CW03 - Flange](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW03.SLDPRT)
        - **HW:** [HW01 - Pulley](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW01.SLDPRT), [HW02 - Gear](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW02.SLDPRT), [HW03 - Clamp](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW03.SLDPRT)
- [ ] **Arduino Projects**: Verify GitHub link: `https://github.com/Akhinoor14/Tinkercad-basic-Projects-Using-Arduino-Uno`
- [ ] **Electronics Guide**: Verify GitHub link: `https://github.com/Akhinoor14/Electronic-Components-`
- [ ] **Tinkercad Demo**: Verify link: `https://www.tinkercad.com/users/akhinoor14`
- [ ] **Project Images**: All project images load correctly with fallback system

### 🔗 Social Media & Links
- [ ] **GitHub**: `https://github.com/Akhinoor14`
- [ ] **LinkedIn**: `https://www.linkedin.com/in/mdakhinoorislam/`
- [ ] **Facebook**: `https://www.facebook.com/mdakhinoorislam`
- [ ] **WhatsApp**: `https://wa.me/qr/6LUI5SF346NCP1`
- [ ] **Email**: `mdakhinoorislam.official.2005@gmail.com`
- [ ] **Phone Numbers**: `01724812042` / `01518956815`

### 🛠️ Technical Verification
- [ ] **Image Fallback System**: Test that broken images show appropriate placeholders
- [ ] **Dark/Light Theme**: Toggle works correctly and persists in localStorage
- [ ] **Mobile Responsiveness**: Test on different screen sizes
- [ ] **Project Modals**: All modals open and close properly
- [ ] **Contact Form**: Form validation works (currently shows alert)
- [ ] **Smooth Scrolling**: Navigation links scroll smoothly
- [ ] **Animations**: Floating elements, particles, and hover effects work

### 🎨 Skills & Technologies Verification
- [ ] **CAD & Design**: SOLIDWORKS, AutoCAD, 3D Modeling, Technical Drawing
- [ ] **Programming**: Arduino, C/C++, Python, HTML/CSS
- [ ] **Engineering Tools**: MATLAB, Simulink, Tinkercad, Circuit Design
- [ ] **Project Categories**: Desktop (SOLIDWORKS), Web (Arduino & Electronics)

## 📁 Files to Customize

### 1. **index.html** - Main HTML Structure
```html
<!-- Update these sections: -->
<h1 class="hero-title">Hi, I'm <span class="highlight">Md Akhinoor Islam</span></h1>
<h2 class="hero-subtitle">Energy Science and Engineering Student, KUET</h2>
<!-- Profile image source -->
<img src="./images/profile.jpg" alt="Md Akhinoor Islam Profile Picture">
<!-- Contact information section -->
<p>mdakhinoorislam.official.2005@gmail.com</p>
```

### 2. **script.js** - Project Data & Functionality
```javascript
// Update GitHub username for API calls
const githubUsername = 'Akhinoor14';

// Update project data array
const sampleProjects = [
    {
        title: "SOLIDWORKS Beginner Projects",
        github: "https://github.com/Akhinoor14/SOLIDWORKS-Projects",
        // ... other project details
    }
];
```

### 3. **styles.css** - Styling (Optional Customization)
```css
:root {
    --primary-color: #4f46e5;     /* Indigo - can be customized */
    --secondary-color: #7c3aed;   /* Purple - can be customized */
    --accent-color: #10b981;      /* Emerald - can be customized */
}
```

### 4. **images/README.md** - Image Guidelines
- Profile photo specifications
- Project image requirements
- Fallback system documentation

## 🔧 Troubleshooting

### Common Issues & Solutions

#### ❌ Profile Image Not Loading
**Problem**: Profile image shows placeholder instead of your photo
**Solution**: 
```bash
# Add your photo to images folder
cp your-photo.jpg "images/profile.jpg"
# Or update the image source in index.html
```

#### ❌ GitHub Pages Not Updating
**Problem**: Changes not visible after deployment
**Solution**:
```bash
# Clear browser cache or use incognito mode
# Check if files are properly committed and pushed
git status
git add .
git commit -m "Update portfolio content"
git push
```

#### ❌ Project Images Not Loading
**Problem**: External images from Unsplash not loading
**Solution**: The portfolio includes automatic fallback placeholders
- Arduino Projects: Orange placeholder
- SOLIDWORKS Projects: Blue placeholder  
- Electronics Guide: Green placeholder

#### ❌ Contact Form Not Working
**Problem**: Form submissions not being processed
**Solution**: Currently shows JavaScript alert. For real form handling:
```javascript
// Option 1: Use Netlify Forms (add data-netlify="true" to form)
// Option 2: Use Formspree or similar service
// Option 3: Implement server-side processing
```

#### ❌ Theme Toggle Not Persisting
**Problem**: Theme resets on page reload
**Solution**: Check localStorage functionality
```javascript
// Verify in browser console
localStorage.getItem('theme')
```

### Performance Optimization

#### Image Optimization
```bash
# Compress images (optional)
# Use tools like TinyPNG or Squoosh.app
# Convert to WebP format for better compression
```

#### CSS/JS Minification
```bash
# Minify CSS (optional)
npx clean-css-cli -o styles.min.css styles.css

# Update HTML to use minified version
<link rel="stylesheet" href="styles.min.css">
```

## 🎯 Post-Deployment Tasks

### ✅ After Successful Deployment

#### 1. **Test All Functionality**
- [ ] Open website in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (phone and tablet)
- [ ] Verify all links work correctly
- [ ] Test contact form and theme toggle

#### 2. **SEO & Performance**
- [ ] Submit to Google Search Console
- [ ] Add Google Analytics (optional)
- [ ] Test page speed with Google PageSpeed Insights
- [ ] Verify meta tags and descriptions

#### 3. **Share Your Portfolio**
- [ ] Update LinkedIn profile with portfolio link
- [ ] Add link to GitHub profile README
- [ ] Share with classmates and professors
- [ ] Include in job applications and resumes

#### 4. **Monitor & Maintain**
- [ ] Check for broken links monthly
- [ ] Update project portfolio as you complete new work
- [ ] Keep contact information current
- [ ] Update skills and technologies as you learn

### 🎨 Custom Domain Setup (Optional)

#### For GitHub Pages:
1. **Purchase Domain** (from Namecheap, GoDaddy, etc.)
2. **Add CNAME file** to repository root:
   ```
   yourdomain.com
   ```
3. **Configure DNS** with your domain provider:
   ```
   CNAME: www -> akhinoor14.github.io
   A Record: @ -> 185.199.108.153
   A Record: @ -> 185.199.109.153
   A Record: @ -> 185.199.110.153
   A Record: @ -> 185.199.111.153
   ```

### 📊 Analytics Setup (Optional)

#### Google Analytics:
```html
<!-- Add to <head> section of index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 🎉 Success! Your Engineering Portfolio is Live!

Your portfolio showcases:
- **Professional Engineering Focus** (Energy Science & Engineering, KUET)
- **Technical Projects** (20+ SOLIDWORKS, 40+ Arduino projects)
- **Modern Web Design** (Dark/light theme, animations, responsive)
- **Interactive Features** (Project modals, search, filtering)
- **Professional Contact** (Multiple contact methods and social links)

**Next Steps**: Share your portfolio URL with potential employers, professors, and peers to showcase your engineering skills and technical projects! 🚀
