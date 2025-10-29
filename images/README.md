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
# Portfolio Website - Images & Assets

This folder contains profile images and project screenshots for **Md Akhinoor Islam's Engineering Portfolio Website**.

## 📁 Folder Structure
```
images/
├── profile.jpg          # Main profile photo (recommended)
├── profile.png          # Alternative profile photo
├── project-screenshots/ # Project demonstration images
└── gallery/            # Additional project gallery images
```

## 🖼️ Image Requirements

### Profile Image
- **Filename**: `profile.jpg` or `profile.png`
- **Dimensions**: 300x300px (square ratio recommended)
- **Format**: JPG, PNG, or WebP
- **Size**: Under 500KB for optimal loading
- **Usage**: Update HTML: `<img src="./images/profile.jpg">`

### Project Images
- **Main Project Images**: 600x300px (2:1 ratio)
- **Gallery Images**: 800x400px (2:1 ratio) 
- **Thumbnails**: 80x60px for modal galleries
- **Format**: JPG/JPEG, PNG, WebP

## 🎯 Current Project Structure

### Featured Projects:
1. **SOLIDWORKS Beginner Projects** (Desktop)
   - 20+ CAD projects with tutorials
   - Engineering focus with 3D modeling
   - **Quick Access:**
     - [📂 Class Work (CW) Folder](https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/CW)
     - [🏠 Home Work (HW) Folder](https://github.com/Akhinoor14/SOLIDWORKS-Projects/tree/main/HW)
   - **Example Files:**
     - **CW:** [CW01 - Simple Bracket](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW01.SLDPRT), [CW02 - Shaft Coupling](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW02.SLDPRT), [CW03 - Flange](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/CW/CW03.SLDPRT)
     - **HW:** [HW01 - Pulley](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW01.SLDPRT), [HW02 - Gear](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW02.SLDPRT), [HW03 - Clamp](https://github.com/Akhinoor14/SOLIDWORKS-Projects/blob/main/HW/HW03.SLDPRT)

2. **Arduino UNO Projects with Tinkercad** (Web)
   - 40+ embedded systems experiments
   - IoT and sensor interfacing

3. **Electronic Components Guide** (Web)
   - Interactive electronics reference
   - Circuit design and analysis

## 🔧 Image Fallback System

The portfolio includes automatic fallback placeholders:
- **Arduino Projects**: Orange placeholder
- **SOLIDWORKS Projects**: Blue placeholder  
- **Electronic Components**: Green placeholder
- **General Engineering**: Purple placeholder

## 📝 How to Add Custom Images

1. **Profile Photo**:
   ```bash
   # Save your photo as:
   images/profile.jpg
   
   # Update in index.html:
   <img src="./images/profile.jpg" alt="Profile">
   ```

2. **Project Screenshots**:
   ```javascript
   // Update in script.js:
   image: "./images/your-project-image.jpg"
   gallery: [
       "./images/gallery/project1-1.jpg",
       "./images/gallery/project1-2.jpg"
   ]
   ```

## 🎨 Supported Formats & Specifications

| Image Type | Dimensions | Format | Max Size |
|------------|------------|--------|----------|
| Profile Photo | 300x300px | JPG/PNG/WebP | 500KB |
| Project Main | 600x300px | JPG/PNG/WebP | 800KB |
| Gallery Images | 800x400px | JPG/PNG/WebP | 1MB |
| Thumbnails | 80x60px | JPG/PNG/WebP | 100KB |

## 🚀 Performance Tips

- **Optimize Images**: Use tools like TinyPNG or Squoosh
- **WebP Format**: Modern browsers support for better compression
- **Lazy Loading**: Images load only when needed (already implemented)
- **CDN Alternative**: Consider using Cloudinary or ImgBB for hosting

## 🔗 External Image URLs

Currently using Unsplash for project images:
- Professional stock photos related to engineering
- Automatic fallback to branded placeholders
- No external dependencies for critical images

## 📱 Responsive Design

Images automatically adapt to:
- **Desktop**: Full resolution display
- **Tablet**: Scaled appropriately 
- **Mobile**: Optimized for touch interfaces
- **High-DPI**: Retina display support

## 🛠️ Technical Implementation

The portfolio includes:
- **Error Handling**: Automatic fallback for broken images
- **Loading States**: Smooth image loading experience
- **Modal Gallery**: Interactive image viewing
- **Image Optimization**: Lazy loading and compression

## 📋 Quick Setup Checklist

- [ ] Add your profile photo as `profile.jpg`
- [ ] Update image path in `index.html`
- [ ] Add project screenshots to respective folders
- [ ] Update image URLs in `script.js`
- [ ] Test image loading on different devices
- [ ] Verify fallback placeholders work correctly

---

**Engineering Portfolio by Md Akhinoor Islam**  
*Energy Science and Engineering Student, KUET*

---

## 🔖 Logos & Wordmark (Brand Assets)

Primary logo (recommended):
- `images/logo.svg` — engineering icon designed for dark UI with white strokes and a red baseline. Use this in the navbar and small brand placements.

Optional wordmark lockups (A M typography):
- `images/logo-wordmark.svg` — for dark backgrounds (white strokes + red accent)
- `images/logo-wordmark-light.svg` — for light backgrounds (near-black strokes + red accent)

### Usage Examples

Navbar brand:
```html
<a href="index.html" class="brand">
   <img src="images/logo.svg" alt="Site logo" class="brand-logo" />
   <span>Home</span>
   <!-- underline effect is handled by CSS on .nav-logo a -->
   <!-- Tip: .brand-logo is sized via CSS; you can remove width/height attributes -->
   <!-- Optional: swap with wordmark for larger hero/header displays -->
</a>
```

Hero/footer with wordmark (dark UI):
```html
<img src="images/logo-wordmark.svg" alt="AM wordmark" class="brand-wordmark" />
```

Hero/footer with wordmark (light UI):
```html
<img src="images/logo-wordmark-light.svg" alt="AM wordmark (light)" class="brand-wordmark" />
```

Accessibility tips:
- Always include informative `alt` text (e.g., "Site logo", "AM wordmark").
- Keep sufficient contrast; prefer the light variant on very light backgrounds.