# Vendor Profile System - Quick Reference Guide

## How Vendors Use the System

### 1. **Access Settings from Dashboard**
- Log in as vendor → Click "Settings" tab in dashboard
- Three tabs appear: Edit Profile, Gallery Photos, Change Password

### 2. **Edit Profile Information**
**Step 1:** Click "Edit Profile" tab
**Step 2:** Upload profile image (optional)
- Click "Choose File" to select an image
- Preview appears immediately
- Supported: JPG, PNG (up to 5MB)

**Step 3:** Fill personal information
- Name, Email, Phone Number, City
- Email must be unique (if changing from registration)

**Step 4:** Fill company information
- Company Name, Company Email, Company Phone

**Step 5:** Add professional details
- Bio: Describe your business (what you do, specialties)
- Experience: Years of experience, notable projects, team size

**Step 6:** Click "Save Profile"
- Data saved to database
- Success message appears
- Changes reflected immediately

### 3. **Upload Gallery Photos**
**Step 1:** Click "Gallery Photos" tab
**Step 2:** Select multiple photos
- Click file input to select photos
- Can select multiple at once (up to 10)

**Step 3:** Click "Upload Photos"
- Photos saved to server
- Photos appear in grid below
- Counter shows total photos

**Step 4:** Manage photos
- Hover over photo to see "Delete" button
- Click Delete to remove individual photos

### 4. **Change Password**
**Step 1:** Click "Change Password" tab
**Step 2:** Enter current password
- Validates against existing password
**Step 3:** Enter new password
- Minimum 6 characters
**Step 4:** Confirm new password
- Must match new password field
**Step 5:** Click "Change Password"
- Password updated in database
- Success message appears

---

## How Clients/Public View Vendor Profiles

### Accessing Public Vendor Profile
**URL:** `http://yourdomain.com/vendor/profile/{vendorId}`

### Information Displayed
- **Profile Image**: Large round avatar
- **Vendor Name & Rating**: Title with star rating if available
- **Company Name**: Prominent display
- **Contact Information**:
  - Location (City)
  - Email & Phone
  - Company Email & Phone
- **Services/Categories**: What they offer
- **About Section**: Business description (bio)
- **Experience Section**: Professional background
- **Business Details**: GST/PAN numbers
- **Photo Gallery**: All uploaded gallery photos
  - Responsive grid layout
  - Hover effects for interactivity
- **Media Links**: Portfolio or website links

### Features
- ✅ No login required to view
- ✅ Mobile-friendly design
- ✅ Fast loading with image optimization
- ✅ Share-friendly layout

---

## API Endpoints for Developers

### Vendor Endpoints (Authentication Required)
```
GET     /api/vendor/profile
        Response: { vendor: {...all vendor data...} }

PATCH   /api/vendor/profile
        Body: { name, email, phoneNo, city, companyName, ... , profileImage: file }
        Response: { message: "Profile updated", vendor: {...} }

PUT     /api/vendor/profile/password
        Body: { currentPassword, newPassword }
        Response: { message: "Password changed successfully" }

POST    /api/vendor/photos
        Body: FormData with vendorPhotos: [files...]
        Response: { message: "Photos uploaded", vendorPhotos: [...urls] }

DELETE  /api/vendor/photos
        Body: { photoUrl: "..." }
        Response: { message: "Photo deleted", vendorPhotos: [...urls] }
```

### Public Endpoints (No Auth Required)
```
GET     /api/public/vendors/:vendorId
        Response: { vendor: {...vendor data without password...} }
```

---

## Database Fields (User Model)

### Profile Fields
```javascript
profileImage       String      // Single profile photo URL
vendorPhotos       [String]    // Array of gallery photo URLs
name              String      // Vendor name
email             String      // Personal email (unique)
phoneNo           String      // Personal phone
city              String      // Location city
```

### Company Fields
```javascript
companyName       String      // Business name
companyEmail      String      // Business email
companyPhone      String      // Business phone
companyLogo       String      // Logo URL
gst               String      // GST registration number
pan               String      // PAN registration number
```

### Professional Fields
```javascript
bio               String      // Business description
experience        String      // Experience details
ratings           Number      // Rating score (0-5)
media             [String]    // Portfolio/website links
```

---

## Frontend Components

### VendorSettings Component
- **Path:** `frontend/src/components/VendorSettings.jsx`
- **Props:**
  - `vendor` - Current vendor data object
  - `onUpdate` - Callback when profile updates
- **Tabs:**
  - Edit Profile (form fields + profileImage upload)
  - Gallery Photos (multi-file upload + grid display)
  - Change Password (password validation form)

### VendorPublicProfile Component
- **Path:** `frontend/src/pages/VendorPublicProfile.jsx`
- **Route:** `/vendor/profile/:vendorId`
- **Features:**
  - Displays public vendor information
  - Gallery grid with images
  - Contact information
  - Professional details

---

## File Structure Overview

```
backend/
├── controllers/
│   └── vendorController.js          (added 6 methods)
├── models/
│   └── User.js                      (added vendor fields)
└── routes/
    ├── vendor.js                    (added 5 routes)
    └── public.js                    (added 1 route)

frontend/
├── components/
│   └── VendorSettings.jsx           (NEW - 290+ lines)
├── pages/
│   ├── Vendor.jsx                   (modified - added Settings tab)
│   └── VendorPublicProfile.jsx      (NEW - 200+ lines)
└── main.jsx                         (added route)
```

---

## Common Tasks

### Task: Vendor Wants to Update Profile Photo Only
1. Go to Settings → Edit Profile tab
2. Click "Choose File" and select new image
3. Click "Save Profile"
4. Photo updates and displays as avatar

### Task: Vendor Wants to Add Photos to Gallery
1. Go to Settings → Gallery Photos tab
2. Click "Choose Files" to select multiple photos
3. Click "Upload Photos"
4. Photos appear in grid immediately

### Task: Vendor Wants to Change Password
1. Go to Settings → Change Password tab
2. Enter current password (must be correct)
3. Enter new password (6+ chars)
4. Confirm new password (must match)
5. Click "Change Password"

### Task: Client Wants to View Vendor's Profile
- Click on vendor name/link (usually on event or testimonial)
- Or use URL: `/vendor/profile/{vendorId}`
- View all vendor information and photo gallery

### Task: Admin Wants to See Vendor Details
- Go to Admin Users tab
- Click on vendor user
- See profile image and all details in modal
- Can also navigate to public profile via link

---

## Validation Rules

### Profile Image
- ✅ JPG, PNG, GIF formats
- ✅ Up to 5MB
- ❌ Other formats rejected

### Email
- ✅ Valid email format
- ✅ Must be unique across system
- ❌ Duplicate emails rejected

### Gallery Photos
- ✅ Up to 10 photos per vendor
- ✅ Any image format (JPG, PNG, GIF, WebP)
- ❌ More than 10 rejected

### Password
- ✅ Current password must match (if changing)
- ✅ New password minimum 6 characters
- ✅ Confirmation must match new password
- ❌ Validation errors shown

### Text Fields
- ✅ No length limit on bio/experience
- ✅ Newlines preserved
- ✅ HTML stripped for security

---

## Error Messages You Might See

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already in use" | Email exists in DB | Use different email |
| "Current password is incorrect" | Wrong password entered | Double-check password |
| "New password must be at least 6 characters" | Password too short | Use 6+ characters |
| "Passwords do not match" | Confirmation doesn't match | Ensure passwords match |
| "Please select photos to upload" | No files selected | Click to select photos |
| "Vendor not found" | Invalid vendor ID | Check vendor ID in URL |

---

## Tips for Best Results

✅ **Profile Image**: Use a clear, professional photo (business or professional headshot)
✅ **Bio**: Be specific about services and specialties
✅ **Experience**: Include years in business, notable projects, team size
✅ **Gallery Photos**: Show your work/past events/setup
✅ **Contact Info**: Keep accurate for clients to reach you
✅ **Categories**: Select all relevant service categories at registration
✅ **Media Links**: Add portfolio, website, or social media links

---

## Mobile Experience

- ✅ Profile image upload works on mobile
- ✅ Gallery photos display responsively (1-4 columns)
- ✅ Settings tabs are touch-friendly
- ✅ Form inputs are mobile-optimized
- ✅ Public profile is fully responsive
- ✅ Photos scale appropriately on all screens

---

## Performance Notes

- Profile images are cached by browser
- Gallery photos load with lazy loading
- Forms include client-side validation (faster feedback)
- Responsive design uses CSS media queries
- No unnecessary API calls on settings tab view
- Photos stored locally on server (in /uploads)

---

## Security Notes

✅ All profile updates require authentication
✅ Email uniqueness prevents account takeover
✅ Password changes require current password verification
✅ Public profile excludes sensitive fields
✅ File uploads validated server-side
✅ Vendor role verified for profile access
✅ All inputs sanitized to prevent XSS

---

## Troubleshooting

### Profile Image Not Showing
1. Check file was actually uploaded (see console)
2. Verify image URL in database
3. Check /uploads directory exists on server
4. Try re-uploading image

### Gallery Photos Not Displaying
1. Verify photos were saved (check count in UI)
2. Check file paths in database
3. Ensure /uploads directory has read permissions
4. Try uploading again

### Password Change Failed
1. Verify current password is correct (case-sensitive)
2. Ensure new password is 6+ characters
3. Ensure confirmation matches new password
4. Try logout/login if session issues

### Public Profile Not Found
1. Check vendor ID in URL is correct
2. Verify vendor is in "approved" status (admin approval)
3. Try the API endpoint directly: `/api/public/vendors/{id}`
4. Check network tab for actual error response

---

## Support

For issues or questions:
1. Check error message displayed on form
2. Review this guide section "Error Messages"
3. Check browser console for JavaScript errors
4. Verify network requests in browser DevTools
5. Contact system administrator if database issue
