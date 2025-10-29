# Project Cards - Complete Style & Features Documentation

This document provides comprehensive details about the styles and features implemented for the three main project cards in the Interactive Engineering Portfolio Website.

---

## 🎯 Overview

The portfolio features **three main project cards**, each with unique styling and interactive features:

1. **Interactive Engineering Portfolio Website** ⭐ Featured
2. **Arduino UNO Projects with Tinkercad**
3. **Electronic Components Guide**

---

## 📦 Card 1: Interactive Engineering Portfolio Website

### 🎨 Visual Design & Styling

#### **Color Scheme**
- **Primary Color**: `#ff0000` (Red)
- **Secondary Color**: `#cc0000` (Dark Red)
- **Accent Color**: `#ff3333` (Light Red)
- **Background**: 
  - Primary: `#0a0a0a` (Deep Black)
  - Secondary: `#1a1a1a` (Dark Gray)
- **Text Colors**:
  - Primary: `#ffffff` (White)
  - Secondary: `#e0e0e0` (Light Gray)
  - Light: `#b0b0b0` (Medium Gray)

#### **Featured Card Styling**
```css
- Background: Linear gradient (135deg, #0a0a0a → #1a0000)
- Blueprint Grid Pattern: Repeating linear gradients creating engineering-style grid
- Border: 2px solid rgba(255, 0, 0, 0.3)
- Border Radius: 15px
- Box Shadow: Multi-layered shadows for depth
  - 0 8px 30px rgba(0, 0, 0, 0.5)
  - inset 0 0 60px rgba(255, 0, 0, 0.05)
- Padding: 2.5rem
```

#### **Engineering Corner Brackets**
- **Top-Left Bracket**: 
  - 50px × 50px
  - 3px solid #ff0000 borders (top & left)
  - Positioned at 15px from edges
  - Opacity: 0.7

- **Bottom-Right Bracket**: 
  - 50px × 50px
  - 3px solid #ff0000 borders (bottom & right)
  - Positioned at 15px from edges
  - Opacity: 0.7

#### **Hover Effects**
```css
Box Shadow (Enhanced):
  - 0 12px 40px rgba(0, 0, 0, 0.7)
  - 0 0 40px rgba(255, 0, 0, 0.2)
  - inset 0 0 80px rgba(255, 0, 0, 0.08)
Border Color: rgba(255, 0, 0, 0.5)
```

### ⭐ Special Features

#### **Featured Badge**
- Position: Relative
- Badge Style: Gradient background with white text
- Font Size: 0.55rem
- Font Weight: 700
- Letter Spacing: 0.5px
- Padding: 4px 7px 3px
- Border Radius: 6px
- Border: 1px solid rgba(255, 255, 255, 0.2)
- Background: Linear gradient (135deg, rgba(255,255,255,.15) → rgba(255,255,255,.08))

#### **Category Badge (WEB)**
- Background: Rgba(255, 255, 255, 0.08)
- Color: Rgba(255, 255, 255, 0.7)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Padding: 0.15rem 0.5rem
- Border Radius: 12px
- Font Size: 0.65rem

### 🎨 Modern UI/UX Features

#### **1. Engineering Architecture Theme**
- Blueprint-style grid patterns
- Corner brackets for technical aesthetic
- Professional red/black/white color scheme

#### **2. Blueprint Grid Patterns**
- Horizontal grid lines: 20px spacing
- Vertical grid lines: 20px spacing
- Line color: rgba(255, 0, 0, 0.1)
- Creates engineering blueprint aesthetic

#### **3. Smooth Animations**

**Fade Slide Animation**:
```css
@keyframes swFadeSlide {
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
Duration: 0.55s
Timing: cubic-bezier(.25,.8,.25,1)
```

**View Fade Animation**:
```css
@keyframes swViewFade {
  from { 
    opacity: 0; 
    transform: translateY(8px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}
Duration: 0.35s
```

**Ripple Effect**:
```css
@keyframes sw-ripple {
  to { 
    transform: scale(2.8); 
    opacity: 0; 
  }
}
Duration: 0.55s
Color: rgba(99,102,241,.35)
```

#### **4. Interactive Cards**
- Transform on hover: `translateY(-3px)`
- Transition duration: 0.3s ease
- Background change on hover
- Border color enhancement
- Box shadow expansion

### ⚡ Advanced Features

#### **1. GitHub Repository Browser**
- Inline repository navigation
- File browser with tree structure
- README preview integration
- Markdown rendering support
- Code syntax highlighting

#### **2. PDF Viewer**
- Embedded PDF display
- Download functionality
- Responsive viewing
- Full-screen mode support

#### **3. Markdown Renderer**
- Live markdown parsing
- Syntax highlighting for code blocks
- Copy code button functionality
- Table of contents generation
- Fullscreen reading mode
- Dark/Light theme toggle

**Markdown Features**:
- Headings (H1-H6) with proper hierarchy
- Code blocks with syntax highlighting
- Tables with sticky headers
- Blockquotes with custom styling
- Lists (ordered/unordered)
- Images with rounded corners
- Links with hover effects
- KaTeX math rendering

#### **4. 3D Model Support**
- Model viewer integration
- Interactive 3D rotation
- Zoom controls
- Model information display

### 💻 Tech Stack Display

#### **Tags/Chips Styling**
```css
Background: var(--chip-bg)
Color: var(--chip-color)
Padding: 6px 12px
Font Size: 0.7rem
Letter Spacing: 0.5px
Border Radius: 20px
Transition: background .25s, transform .15s, color .25s

Hover State:
  - Background: #dbeafe
  - Transform: translateY(-2px)

Active State:
  - Transform: translateY(0)
```

**Tech Tags Included**:
- HTML5
- CSS3
- JavaScript
- Responsive Design
- GitHub Pages
- +2 (additional technologies)

### 🚀 Performance Features

#### **1. Optimized Animations**
- Hardware acceleration (transform, opacity)
- Reduced motion support
- Smooth 60fps animations
- CSS animations over JavaScript

#### **2. Lazy Loading**
- Images load on demand
- Deferred script loading
- Progressive enhancement

#### **3. Fast Page Load**
- Minified CSS/JS
- Optimized assets
- Efficient selectors
- Critical CSS inline

#### **4. Mobile Responsive**
```css
Breakpoints:
  - Desktop: 960px+
  - Tablet: 768px - 959px
  - Mobile: < 768px

Mobile Adjustments:
  - Single column layout
  - Reduced padding
  - Larger touch targets
  - Simplified navigation
```

### 🔘 Action Buttons

#### **GitHub Button**
- Background: Linear gradient (135deg, #ff0000 → #cc0000)
- Color: #ffffff
- Padding: 6px 14px
- Border Radius: 20px
- Border: 1px solid rgba(255,255,255,0.2)
- Hover Effect: Enhanced gradient & shadow

#### **README Button**
- Similar styling to GitHub button
- Icon integration
- Smooth hover transition

#### **Browse Button**
- Primary action styling
- Prominent positioning
- Interactive feedback

#### **Live Demo Button**
- Accent color gradient
- External link indicator
- Hover scale effect

---

## 📦 Card 2: Arduino UNO Projects with Tinkercad

### 🎨 Visual Design & Styling

#### **Card Base Styling**
```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: 12px
Padding: 1.5rem
Transition: all 0.3s ease

Hover State:
  - Background: rgba(255, 255, 255, 0.08)
  - Border Color: rgba(255, 255, 255, 0.15)
  - Box Shadow: 0 4px 16px rgba(0, 0, 0, 0.2)
  - Transform: translateY(-2px)
```

#### **Header Section**
```css
Display: flex
Justify Content: space-between
Align Items: flex-start
Margin Bottom: 1rem
Padding Bottom: 1rem
Border Bottom: 1px solid rgba(255, 255, 255, 0.1)
```

#### **Category Badge (WEB)**
- Background: Rgba(255, 255, 255, 0.1)
- Color: Rgba(255, 255, 255, 0.9)
- Font Size: 0.65rem
- Font Weight: 700
- Padding: 0.3rem 0.5rem
- Border Radius: 4px
- Letter Spacing: 0.5px

### 💡 Project Categories

#### **1. LED & Display Projects**
- Count: 12 projects
- Icon: 💡
- Category color scheme
- Dedicated section styling

#### **2. Sensor Projects**
- Count: 15 projects
- Icon: 📡
- Advanced sensor circuits
- Real-time data display

#### **3. Motor & Actuators**
- Count: 8 projects
- Icon: ⚙️
- Motion control systems
- Servo & stepper integration

#### **4. IoT & Communication**
- Count: 5 projects
- Icon: 🌐
- Wireless communication
- Network protocols

### 🎯 Features Grid Layout

#### **Statistics Cards**
```css
Display: flex
Gap: 0.75rem
Align Items: stretch

Meta Item Styling:
  - Background: rgba(255,255,255,.05)
  - Backdrop Filter: blur(10px)
  - Padding: 0.55rem 0.7rem 0.5rem
  - Border Radius: 10px
  - Border: 1px solid rgba(255,255,255,.1)
  - Min Width: 60px
```

#### **Project Count Display**
- Font Size: 0.95rem
- Font Weight: 700
- Color: rgba(255,255,255,.9)
- Prominent number display

#### **Category Labels**
- Font Size: 0.55rem
- Letter Spacing: 1px
- Text Transform: uppercase
- Color: rgba(255,255,255,0.6)
- Font Weight: 600

### 💻 Tech Stack Tags

**Technologies Featured**:
- **Arduino**: Primary platform badge
- **C++**: Programming language
- **Tinkercad**: Simulation platform
- **IoT**: Internet of Things
- **Embedded Systems**: Category tag
- **+2**: Additional technologies

#### **Tag Styling**
```css
Quick Links Chips:
  - Display: flex
  - Flex Wrap: wrap
  - Gap: 8px
  - Margin Top: 14px

Individual Chip:
  - Background: var(--chip-bg) #eef2ff
  - Color: var(--chip-color) #1e3a8a
  - Padding: 6px 12px
  - Font Size: 0.7rem
  - Letter Spacing: 0.5px
  - Border Radius: 20px
  - Font Weight: 600
```

### 🔘 Action Buttons

#### **GitHub Button**
- Primary action button
- Repository access
- Red gradient background

#### **README Button**
- Documentation access
- Preview modal trigger
- Icon integrated

#### **Browse Button**
- File explorer access
- Interactive navigation
- Hover effects

#### **Live Demo Button**
- External Tinkercad link
- Simulation access
- Target: _blank

---

## 📦 Card 3: Electronic Components Guide

### 🎨 Visual Design & Styling

#### **Card Structure**
Same base styling as Arduino card with component-specific adaptations:

```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: 12px
Padding: 1.5rem
```

### 🔌 Component Categories

#### **1. Passive Components**
- Icon: 🔌
- Resistors
- Capacitors
- Inductors
- Transformers

#### **2. Active Components**
- Icon: ⚡
- Transistors
- Diodes
- ICs
- LEDs

#### **3. Integrated Circuits**
- Icon: 🔲
- Microcontrollers
- Logic gates
- Op-amps
- Memory chips

#### **4. Power Components**
- Icon: ⚙️
- Voltage regulators
- Power supplies
- Batteries
- Converters

#### **5. Sensors & Modules**
- Icon: 📊
- Temperature sensors
- Motion sensors
- Display modules
- Communication modules

### 🎯 Interactive Features

#### **Component Explorer**
- Grid layout display
- Category filtering
- Search functionality
- Detailed specifications

#### **Circuit Examples**
- Practical applications
- Breadboard layouts
- Schematic diagrams
- PCB designs

#### **Specification Cards**
```css
Display: grid
Gap: 1rem
Grid Auto Rows: auto

Spec Item:
  - Background: rgba(255,255,255,.03)
  - Padding: 0.75rem
  - Border Radius: 8px
  - Border: 1px solid rgba(255,255,255,.05)
```

### 💻 Tech Stack Tags

**Technologies Featured**:
- **Electronics**: Primary category
- **Circuit Design**: Design tools
- **Component Analysis**: Analysis methods
- **PCB Design**: Board layout
- **Testing**: Quality assurance
- **+1**: Additional specialization

### 🔘 Action Buttons

#### **GitHub Button**
- Component database access
- Documentation repository
- Resource files

#### **README Button**
- Component guide
- Usage instructions
- Safety information

#### **Browse Button**
- Component library
- File explorer
- Resource browser

#### **Download ZIP Button**
- Full component pack
- Offline access
- Complete resources
- Green gradient styling

```css
Background: Linear gradient (135deg, #00cc00 → #009900)
Color: #ffffff
Border: 1px solid rgba(255, 255, 255, 0.2)

Hover State:
  - Background: Linear gradient (135deg, #00ff00 → #00cc00)
  - Box Shadow: 0 4px 15px rgba(0, 255, 0, 0.5)
  - Transform: translateY(-2px)
```

---

## 🎨 Universal Card Features

### 📱 Responsive Design

#### **Mobile Optimization** (< 768px)
```css
Container:
  - Grid Template Columns: 1fr
  - Gap: 1rem
  - Reduced padding

Header:
  - Flex Direction: column
  - Aligned left
  
Meta:
  - Stack vertically
  - Full width

File List:
  - Single column
  - Larger touch targets
```

#### **Tablet Optimization** (768px - 959px)
```css
Container:
  - Grid: 2 columns
  - Balanced spacing

Cards:
  - Responsive width
  - Maintained proportions
```

#### **Desktop Optimization** (960px+)
```css
Container:
  - Grid: auto-fill, minmax(400px, 1fr)
  - Maximum 3 columns

Cards:
  - Full feature display
  - Enhanced interactions
```

### 🎭 Theme Support

#### **Dark Mode** (Default)
```css
Background: #0a0a0a
Text: #ffffff
Accent: #ff0000
Border: rgba(255, 0, 0, 0.3)
Shadow: Enhanced depth
```

#### **Light Mode** (Optional)
```css
Background: #ffffff
Text: #1f2937
Accent: #4f46e5
Border: rgba(0, 0, 0, 0.1)
Shadow: Softer depth
```

#### **Theme Toggle**
- Smooth transitions (0.3s)
- All elements animated
- Persistent state
- System preference detection

### ✨ Micro-interactions

#### **Hover States**
- Transform: translateY(-2px)
- Enhanced shadows
- Color transitions
- Border highlights

#### **Active States**
- Transform: translateY(0)
- Immediate feedback
- Visual confirmation

#### **Focus States**
- Outline: 2px solid
- Outline offset: 2px
- Keyboard navigation support
- Accessibility compliant

### 🎬 Animations

#### **Card Entry Animation**
```css
@keyframes swFadeSlide
Initial State:
  - Opacity: 0
  - Transform: translateY(12px)

Final State:
  - Opacity: 1
  - Transform: translateY(0)

Duration: 0.55s
Timing: cubic-bezier(.25,.8,.25,1)
```

#### **Button Hover Animation**
```css
Transition: all 0.3s ease
Transform: translateY(-2px)
Box Shadow: Enhanced
Background: Gradient shift
```

#### **Chip Hover Animation**
```css
Transition: background .25s, transform .15s
Transform: translateY(-2px)
Background: Lighter shade
```

---

## 🎯 Advanced Styling Techniques

### 🌈 Gradient Systems

#### **Professional Gradient**
```css
Linear-gradient(135deg, #0a0a0a 0%, #1a0000 100%)
```

#### **Accent Gradient**
```css
Linear-gradient(135deg, #ff0000 0%, #cc0000 100%)
```

#### **Button Gradients**
```css
Primary: linear-gradient(135deg, #ff0000, #cc0000)
Success: linear-gradient(135deg, #00cc00, #009900)
Info: linear-gradient(135deg, #667eea, #764ba2)
```

### 🎨 Shadow Systems

#### **Light Shadow**
```css
Box-shadow: 0 4px 24px rgba(255, 0, 0, 0.1)
```

#### **Medium Shadow**
```css
Box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5)
```

#### **Heavy Shadow** (Hover)
```css
Box-shadow: 
  0 12px 40px rgba(0, 0, 0, 0.7),
  0 0 40px rgba(255, 0, 0, 0.2),
  inset 0 0 80px rgba(255, 0, 0, 0.08)
```

### 🔤 Typography System

#### **Font Families**
- **Primary**: 'Source Sans Pro', 'Segoe UI', Arial, sans-serif
- **Headings**: 'Playfair Display', serif
- **Code**: ui-monospace, SFMono-Regular, Monaco, Consolas

#### **Font Weights**
- Light: 300
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

#### **Font Sizes**
- Hero: 2rem
- Large Heading: 1.5rem
- Heading: 1.25rem
- Subheading: 1.1rem
- Body: 1rem
- Small: 0.9rem
- Tiny: 0.75rem
- Micro: 0.65rem

#### **Letter Spacing**
- Tight: 0.3px
- Normal: 0.5px
- Wide: 1px

### 🎨 Border Radius System

```css
Small: 4px
Medium: 8px
Large: 12px
XLarge: 16px
Pill: 20px
Circle: 50%
```

### 📐 Spacing System

```css
XSmall: 0.25rem (4px)
Small: 0.5rem (8px)
Medium: 1rem (16px)
Large: 1.5rem (24px)
XLarge: 2rem (32px)
XXLarge: 2.5rem (40px)
```

---

## 🔧 Component-Specific Classes

### 📋 File List Styling

```css
.sw-file-list {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  columns: 2;
  column-gap: 28px;
}

.sw-file-list li {
  break-inside: avoid;
  margin: 4px 0;
}

.sw-file-list a {
  text-decoration: none;
  color: #ffffff;
  font-size: 0.9rem;
  position: relative;
  padding-left: 18px;
  font-weight: 500;
}

.sw-file-list a:before {
  content: "▸";
  position: absolute;
  left: 0;
  top: 0;
  color: #ff0000;
  font-weight: 700;
  font-size: 1rem;
}

.sw-file-list a:hover {
  color: #ff6666;
}
```

### 🎯 Mode Switch Styling

```css
.sw-mode-switch {
  display: inline-flex;
  gap: 0.4rem;
  background: rgba(15,15,20,.6);
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(10px);
}

.sw-mode-btn {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.6px;
  cursor: pointer;
  color: rgba(255,255,255,0.6);
  transition: all 0.3s ease;
}

.sw-mode-btn[aria-current="true"] {
  background: linear-gradient(135deg, rgba(255,255,255,.1), rgba(255,255,255,.05));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
  border: 1px solid rgba(255,255,255,.1);
}
```

### 📊 Statistics Display

```css
.sw-meta-counters {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
}

.sw-meta-item {
  background: rgba(255,255,255,.05);
  backdrop-filter: blur(10px);
  padding: 0.55rem 0.7rem 0.5rem;
  border-radius: 10px;
  text-align: center;
  min-width: 60px;
  border: 1px solid rgba(255,255,255,.1);
}

.sw-meta-num {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(255,255,255,.9);
}

.sw-meta-label {
  font-size: 0.55rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  font-weight: 600;
  margin-top: 4px;
}
```

---

## 🎬 Animation Keyframes

### 1. Fade Slide
```css
@keyframes swFadeSlide {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 2. View Fade
```css
@keyframes swViewFade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3. View Fade Calm
```css
@keyframes swViewFadeCalm {
  from {
    opacity: 0;
    transform: translateY(10px) scale(.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### 4. Ripple Effect
```css
@keyframes sw-ripple {
  to {
    transform: scale(2.8);
    opacity: 0;
  }
}
```

---

## 🎨 Color Palette Reference

### Primary Colors
| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Primary Red | #ff0000 | 255, 0, 0 | Main accent, buttons, highlights |
| Dark Red | #cc0000 | 204, 0, 0 | Hover states, secondary elements |
| Light Red | #ff3333 | 255, 51, 51 | Active states, tertiary accents |
| Deep Black | #0a0a0a | 10, 10, 10 | Primary background |
| Dark Gray | #1a1a1a | 26, 26, 26 | Secondary background |

### Text Colors
| Color Name | Hex Code | Opacity | Usage |
|------------|----------|---------|-------|
| White | #ffffff | 100% | Primary text |
| Light Gray | #e0e0e0 | 87.5% | Secondary text |
| Medium Gray | #b0b0b0 | 69% | Tertiary text |
| Soft White | rgba(255,255,255,0.85) | 85% | Body text |
| Muted White | rgba(255,255,255,0.6) | 60% | Labels, hints |

### Border & Shadow Colors
| Color Name | Value | Usage |
|------------|-------|-------|
| Border Color | rgba(255, 0, 0, 0.2) | Default borders |
| Shadow Light | rgba(255, 0, 0, 0.1) | Subtle shadows |
| Shadow Medium | rgba(255, 0, 0, 0.2) | Standard shadows |
| Shadow Dark | rgba(0, 0, 0, 0.5) | Deep shadows |

---

## 📱 Breakpoint System

```css
/* Extra Small Devices (Portrait Phones) */
@media (max-width: 480px) {
  /* Single column, stacked layout */
}

/* Small Devices (Landscape Phones) */
@media (max-width: 600px) {
  /* File lists: 1 column */
  /* Section buttons: 1fr 1fr grid */
}

/* Medium Devices (Tablets) */
@media (max-width: 768px) {
  /* Reduced font sizes */
  /* Compact spacing */
  /* Mobile navigation */
}

/* Large Devices (Small Laptops) */
@media (max-width: 900px) {
  /* TOC positioning adjustments */
  /* 2-column grids */
}

/* Desktop Devices */
@media (min-width: 960px) {
  /* Full layout */
  /* Multi-column grids */
  /* Enhanced interactions */
}
```

---

## 🚀 Performance Optimizations

### 1. CSS Optimizations
- Hardware-accelerated properties (transform, opacity)
- Minimal repaints/reflows
- Efficient selectors
- CSS variables for theming

### 2. Animation Performance
- Transform over position changes
- Opacity transitions
- will-change hints (when appropriate)
- Reduced motion support

### 3. Loading Strategies
- Critical CSS inline
- Deferred non-critical styles
- Font display: swap
- Lazy loading images

### 4. Responsive Images
- Srcset for different resolutions
- WebP with fallbacks
- Proper sizing attributes
- Loading: lazy

---

## ♿ Accessibility Features

### 1. Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Landmark regions
- Skip links

### 2. Keyboard Navigation
- Focus visible states
- Tab order logical
- Interactive elements accessible
- Escape key support

### 3. Screen Reader Support
- Alt text for images
- ARIA live regions
- Descriptive labels
- Status announcements

### 4. Color Contrast
- WCAG AA compliant (minimum 4.5:1)
- Focus indicators visible
- Error states clear
- Interactive elements distinguishable

---

## 🎯 Interactive States Summary

### Hover States
- Cards: translateY(-2px) + enhanced shadow
- Buttons: Gradient shift + shadow + transform
- Links: Color change + underline
- Chips: Background change + lift

### Active States
- Cards: translateY(0)
- Buttons: Immediate feedback
- Ripple effect on click

### Focus States
- Outline: 2px solid
- Outline offset: 2px or 3px
- High contrast color
- Never outline: none

### Disabled States
- Opacity: 0.5
- Cursor: not-allowed
- No interactions
- Reduced contrast

---

## 📚 CSS Variables Used

```css
:root {
  /* Colors */
  --primary-color: #ff0000;
  --secondary-color: #cc0000;
  --accent-color: #ff3333;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-light: #b0b0b0;
  
  /* Backgrounds */
  --background-primary: #0a0a0a;
  --background-secondary: #1a1a1a;
  
  /* Borders & Shadows */
  --border-color: rgba(255, 0, 0, 0.2);
  --shadow-light: rgba(255, 0, 0, 0.1);
  --shadow-medium: rgba(255, 0, 0, 0.2);
  
  /* Gradients */
  --gradient-professional: linear-gradient(135deg, #0a0a0a 0%, #1a0000 100%);
  --gradient-accent: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
  
  /* Chip Colors */
  --chip-bg: #eef2ff;
  --chip-color: #1e3a8a;
}
```

---

## 🎨 Special Effects

### Blueprint Grid Effect
```css
background:
  linear-gradient(135deg, #0a0a0a 0%, #1a0000 100%),
  repeating-linear-gradient(0deg, transparent 0px, transparent 19px, rgba(255, 0, 0, 0.1) 19px, rgba(255, 0, 0, 0.1) 20px),
  repeating-linear-gradient(90deg, transparent 0px, transparent 19px, rgba(255, 0, 0, 0.1) 19px, rgba(255, 0, 0, 0.1) 20px);
```

### Glassmorphism Effect
```css
background: rgba(255,255,255,.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255,255,255,.1);
```

### Inset Glow Effect
```css
box-shadow: inset 0 0 60px rgba(255, 0, 0, 0.05);
```

---

## 📝 Notes & Best Practices

### 1. Consistency
- All cards follow same base styling
- Uniform spacing system
- Consistent color usage
- Standardized interactions

### 2. Maintainability
- CSS variables for easy theming
- Modular component structure
- Clear class naming
- Well-documented code

### 3. Scalability
- Grid-based layouts
- Flexible components
- Responsive by default
- Easy to add new cards

### 4. User Experience
- Instant visual feedback
- Smooth animations
- Clear hierarchy
- Intuitive interactions

---

## 🔄 Version Information

**Document Version**: 1.0  
**Last Updated**: October 30, 2025  
**CSS File**: styles.css (7074 lines)  
**Total Classes**: 200+  
**Animation Keyframes**: 4  
**Responsive Breakpoints**: 5  
**Color Variables**: 15+  

---

## 📞 Summary

This documentation covers **all styling and features** implemented across the three main project cards:

✅ **Visual Design**: Colors, gradients, shadows, borders  
✅ **Layout**: Grid systems, flexbox, responsive breakpoints  
✅ **Typography**: Font families, sizes, weights, spacing  
✅ **Animations**: Keyframes, transitions, transforms  
✅ **Interactions**: Hover, active, focus states  
✅ **Components**: Buttons, chips, badges, file lists  
✅ **Advanced Features**: Markdown rendering, PDF viewing, 3D models  
✅ **Accessibility**: ARIA, keyboard nav, screen readers  
✅ **Performance**: Optimizations, lazy loading, critical CSS  
✅ **Theming**: Dark/light modes, CSS variables  

Each card maintains consistent base styling while featuring unique content and specialized interactive elements tailored to its purpose.

---

**End of Documentation**
