# 📸 Profile Photo Management System - Complete Guide

## 🎯 Overview
Advanced profile photo upload and management system with auto-detection, smart renaming, and GitHub integration.

---

## ✨ Key Features

### 1. **Upload System** 
- ✅ Drag & drop or click to select multiple photos
- ✅ Auto-rename to PP1.jpg, PP2.jpg, PP3.jpg...
- ✅ Direct GitHub upload via API
- ✅ Real-time upload progress
- ✅ Admin-only password protected

### 2. **Photo Gallery** 
- ✅ Visual preview of all uploaded photos
- ✅ Thumbnail grid layout (responsive)
- ✅ Direct view in new tab
- ✅ Delete with confirmation modal
- ✅ Auto-refresh from GitHub

### 3. **Smart Delete System** 
- ✅ Preview before delete
- ✅ Deletes from GitHub API
- ✅ **Auto-renumber to fill gaps**
  - Example: Delete PP5.jpg → PP6 becomes PP5, PP7 becomes PP6...
- ✅ No broken photo numbers
- ✅ Slideshow stays functional

### 4. **Unlimited Auto-Detection** 
- ✅ **No 50-photo limit!**
- ✅ Detects PP1.jpg through PP∞ (unlimited)
- ✅ GitHub API detection (fast)
- ✅ Fallback HEAD request detection
- ✅ Stops after 5 consecutive missing files
- ✅ Safety limit: 1000 photos max

### 5. **30-Second Slideshow** 
- ✅ Auto-shuffle every 30 seconds
- ✅ Smooth fade transitions (600ms)
- ✅ Auto-detects new uploads
- ✅ Loops continuously
- ✅ No manual config needed

---

## 🔧 How It Works

### **Upload Flow:**
```
1. Select photos → Auto-detect existing count
2. Rename: PP{next_number}.jpg
3. Upload to GitHub via API
4. Gallery auto-refreshes
5. Slideshow detects new photos
```

### **Delete Flow:**
```
1. Click Delete → Show preview modal
2. Confirm → Delete from GitHub
3. Get all remaining photos
4. Renumber sequentially (fill gaps)
   - PP1, PP2, PP5, PP7 → PP1, PP2, PP3, PP4
5. Gallery refreshes
6. Slideshow updates automatically
```

### **Detection Flow:**
```
1. GitHub API → Fetch all PP*.jpg files
2. Sort by number (PP1, PP2, PP3...)
3. Fallback: HEAD requests (if API fails)
4. Check PP1, PP2, PP3... until 5 consecutive missing
5. Load detected photos into slideshow
```

---

## 📁 Files

| File | Purpose |
|------|---------|
| `profile-uploader.html` | Upload interface with gallery & delete UI |
| `profile-uploader.js` | Upload, gallery load, delete, and renumber logic |
| `profile-slideshow.js` | Auto-detection and 30s rotation on home page |
| `index.html` | Displays profile photo with slideshow |

---

## 🎨 User Interface

### **Upload Interface:**
- Modern dark theme with red accents
- Password-protected login screen
- Settings panel (GitHub config + password change)
- Drag & drop upload area
- File preview list with thumbnails
- Upload progress bar

### **Photo Gallery:**
- Grid layout (responsive, 140px cards)
- Each card shows:
  - Photo thumbnail
  - Filename (PP1.jpg)
  - View button (opens in new tab)
  - Delete button (shows confirmation)
- Refresh button to reload from GitHub
- Status messages (loading, success, error)

### **Delete Confirmation Modal:**
- Full-screen dark overlay
- Photo preview (max 250px)
- Filename display
- Warning message about renumbering
- Cancel / Confirm buttons

---

## 🔐 Security

### **Password Protection:**
- SHA-256 hashed passwords
- Stored in localStorage
- Session-based unlock
- Settings panel to change password
- Console reset method available

### **GitHub API:**
- Personal access token required
- Token stored in localStorage (encrypted in browser)
- Repository format: `owner/repo`
- Requires write permissions for upload/delete

---

## 🚀 Usage Guide

### **Initial Setup:**
1. Open `profile-uploader.html`
2. Enter password (default in code comments)
3. Go to Settings ⚙️
4. Enter GitHub Personal Access Token
5. Enter Repository (format: `Akhinoor14/Solidworks-Website-Project-main`)
6. Click "Save GitHub Config"

### **Upload Photos:**
1. Click or drag photos to upload area
2. Review file list
3. Click "Upload to GitHub"
4. Wait for progress to complete
5. Photos appear in gallery automatically

### **Delete Photos:**
1. Gallery shows all uploaded photos
2. Click 🗑️ Delete on any photo
3. Preview modal appears
4. Click "Delete" to confirm
5. Photo deleted + remaining photos renumbered

### **View Slideshow:**
1. Open `index.html` (home page)
2. Slideshow auto-starts if 2+ photos exist
3. Shuffles every 30 seconds
4. Smooth fade transitions
5. Loops infinitely

---

## 🛠️ Technical Details

### **GitHub API Endpoints:**
```javascript
// List files
GET /repos/{owner}/{repo}/contents/images

// Upload file
PUT /repos/{owner}/{repo}/contents/images/{filename}
Body: { message, content (base64), branch }

// Delete file
DELETE /repos/{owner}/{repo}/contents/images/{filename}
Body: { message, sha, branch }
```

### **Renumber Algorithm:**
```javascript
// After delete, renumber to fill gaps
photos = [PP1, PP2, PP5, PP7, PP10]
for (i = 0; i < photos.length; i++) {
    expectedName = `PP${i + 1}.jpg`
    if (currentName !== expectedName) {
        rename(currentName → expectedName)
    }
}
// Result: PP1, PP2, PP3, PP4, PP5
```

### **Unlimited Detection:**
```javascript
// No hardcoded limit!
consecutiveMissing = 0
currentNumber = 1
while (consecutiveMissing < 5) {
    check(`PP${currentNumber}.jpg`)
    if (exists) {
        add to list
        consecutiveMissing = 0
    } else {
        consecutiveMissing++
    }
    currentNumber++
}
// Stops when 5 files missing in a row
// Safety limit: 1000 max
```

---

## 🐛 Problem Solutions

### **Problem 1: Delete leaves gaps**
❌ Before: PP1, PP2, (deleted PP3), PP4, PP5  
✅ After: PP1, PP2, PP3, PP4 (auto-renumbered)

### **Problem 2: 50-photo limit**
❌ Before: Only detects PP1-PP50  
✅ After: Detects unlimited (stops after 5 consecutive missing)

### **Problem 3: No preview before delete**
❌ Before: Delete without seeing photo  
✅ After: Preview modal with image + filename

### **Problem 4: Manual slideshow config**
❌ Before: Edit JS file to add photos  
✅ After: Auto-detects from GitHub/local files

---

## 📊 Status Indicators

### **Gallery Status:**
- 🔍 Loading... → Fetching from GitHub
- ✅ Loaded X photos → Success
- ⚠️ Configure credentials → GitHub token missing
- ❌ Failed to load → API error
- 📭 No photos uploaded → Empty gallery

### **Upload Status:**
- 📤 Uploading 1/5: PP3.jpg → In progress
- ✅ All photos uploaded! → Complete
- ❌ Upload failed → Error with details

### **Delete Status:**
- ⏳ Deleting... → In progress
- ✅ Deleted PP5.jpg and renumbered! → Success
- ❌ Delete failed → Error with details

---

## 🎓 Best Practices

1. **Regular Backups:** Download photos before bulk delete
2. **Token Security:** Use fine-grained tokens with repo access only
3. **Photo Naming:** Don't manually rename photos (breaks auto-detection)
4. **File Format:** Use JPG for best compatibility
5. **File Size:** Keep under 5MB for fast upload/display
6. **Delete Carefully:** Renumbering can't be undone
7. **Browser Console:** Use F12 → Console to see detailed logs

---

## 🔮 Future Enhancements

- [ ] Bulk delete (select multiple)
- [ ] Drag-to-reorder photos
- [ ] Image editing (crop, rotate)
- [ ] Multiple slideshows (categories)
- [ ] Video support
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Download all photos as ZIP
- [ ] Photo metadata (upload date, size)

---

## 📝 Changelog

### Version 2.0 (Current)
- ✅ Added photo gallery with thumbnails
- ✅ Implemented delete functionality
- ✅ Smart auto-renumber after delete
- ✅ Unlimited photo detection (no 50 limit)
- ✅ Delete confirmation modal with preview
- ✅ Auto-refresh gallery
- ✅ Enhanced slideshow detection

### Version 1.0
- ✅ Basic upload with auto-rename
- ✅ GitHub API integration
- ✅ Password protection
- ✅ 30-second slideshow
- ✅ Manual photo list config

---

## 🆘 Troubleshooting

### **Photos not showing in slideshow:**
1. Check browser console for errors
2. Verify photos uploaded to `images/` folder
3. Check file naming (PP1.jpg, PP2.jpg...)
4. Refresh page to trigger detection
5. Call `profileSlideshow.refresh()` in console

### **Upload fails:**
1. Check GitHub token validity
2. Verify repo format: `owner/repo`
3. Ensure token has write permissions
4. Check file size (< 100MB GitHub limit)
5. Check network connectivity

### **Delete not working:**
1. Verify GitHub token has delete permissions
2. Check if photo exists on GitHub
3. Try refreshing gallery first
4. Check browser console for errors

### **Renumbering issues:**
1. Wait for delete to complete fully
2. Don't interrupt renumber process
3. Refresh gallery to verify
4. Check GitHub repo directly if needed

---

## 📞 Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Review this documentation
3. Check GitHub repo issues
4. Contact system administrator

---

**Made with ❤️ for efficient profile photo management**
