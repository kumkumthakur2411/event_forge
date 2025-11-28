# Vendor Profile Debugging Guide

## Issue: "Save and other options are not working because of error"

This guide helps diagnose and fix issues with vendor profile functionality.

---

## Quick Diagnosis Checklist

### 1. **Check Backend Server Status**
```bash
# Terminal in backend directory
npm start
```
**Look for:**
- ✅ "Server running on port 5000"
- ✅ "Loading vendor routes..."
- ❌ If shows errors, check server.js

**If error:**
- Check backend/server.js connections
- Verify MongoDB connection
- Check for syntax errors in routes

---

### 2. **Check Frontend Build**
```bash
# Terminal in frontend directory
npm run dev
```
**Look for:**
- ✅ "VITE v[version]" ready
- ✅ "Local: http://localhost:5173"
- ❌ If shows errors, check console output

**If error:**
- Check for syntax errors in components
- Run: `npm install` to reinstall dependencies
- Clear node_modules and reinstall

---

### 3. **Browser Console Errors**
1. Open browser DevTools (F12)
2. Click "Console" tab
3. Look for red error messages
4. Note the exact error text

**Common errors:**
```
❌ "Cannot read property 'name' of undefined"
   → vendor prop not passed correctly
   
❌ "API endpoint not found"
   → /api/vendor/profile route missing
   
❌ "Failed to fetch"
   → Backend server not running
   
❌ "CORS error"
   → Backend CORS configuration issue
```

---

### 4. **Check Network Requests**
1. Open DevTools (F12)
2. Click "Network" tab
3. Try to save profile
4. Look for failed requests (red)
5. Click on request to see details

**Expected requests:**
```
PATCH /api/vendor/profile
Status: 200
Response: { message: "Profile updated", vendor: {...} }
```

**Troubleshoot failed requests:**
- **404**: Route not found → check backend/routes/vendor.js
- **400**: Bad request → check request body format
- **401**: Unauthorized → check token/auth middleware
- **500**: Server error → check backend logs
- **Network error**: Backend not running

---

## Step-by-Step Fixes

### Fix #1: Verify Routes are Registered

**File:** `backend/routes/vendor.js`

```javascript
// ✅ Should have these routes:
router.get('/profile', getProfile);
router.patch('/profile', upload.single('profileImage'), updateProfile);
router.put('/profile/password', changePassword);
router.post('/photos', upload.array('vendorPhotos', 10), uploadVendorPhotos);
router.delete('/photos', deleteVendorPhoto);
```

**If missing:**
- Run git status to check for uncommitted changes
- Verify file wasn't corrupted
- Restore from backup if needed

---

### Fix #2: Verify Controller Methods Exist

**File:** `backend/controllers/vendorController.js`

```javascript
// ✅ Should export these functions:
exports.getProfile = async (req, res) => { ... }
exports.updateProfile = async (req, res) => { ... }
exports.changePassword = async (req, res) => { ... }
exports.uploadVendorPhotos = async (req, res) => { ... }
exports.deleteVendorPhoto = async (req, res) => { ... }
```

**If missing:**
- Copy from backup
- Recreate from documentation

---

### Fix #3: Check API.js Configuration

**File:** `frontend/src/api.js`

```javascript
// ✅ Should look like:
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// ✅ Should have setToken function:
export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('ef_token', token);
  }
};
```

---

### Fix #4: Check VendorSettings Component

**File:** `frontend/src/components/VendorSettings.jsx`

**Verify imports:**
```javascript
import API from '../api'
import { getFullImageUrl } from '../utils/getBaseUrl'
```

**Verify saveProfile function:**
- [ ] Uses `API.patch('/vendor/profile', ...)`
- [ ] Creates FormData object
- [ ] Appends fields with correct names
- [ ] Handles file upload if present
- [ ] Shows error/success messages

---

### Fix #5: Verify Vendor.jsx Integration

**File:** `frontend/src/pages/Vendor.jsx`

```javascript
// ✅ Should have:
import VendorSettings from '../components/VendorSettings'

// ✅ Should render:
{activeTab === 'settings' && (
  <VendorSettings vendor={user} onUpdate={setUser} />
)}
```

---

### Fix #6: Check Upload Middleware

**File:** `backend/middleware/upload.js`

```javascript
// ✅ Should allow image files
const filetypes = /jpeg|jpg|png|gif/

// ✅ Should limit file size
limits: { fileSize: 1000000 } // 1MB
```

---

## Testing the Fix

### Test 1: Manual API Test Using Terminal

```bash
# 1. Start backend
cd backend
npm start

# 2. In another terminal, test API
curl -X GET http://localhost:5000/api/vendor/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
# {"_id": "...", "name": "...", "email": "..."}
```

### Test 2: Use Test Script

```bash
cd event_forge
node test-vendor-profile.js
```

This will:
- ✅ Register a test vendor
- ✅ Login
- ✅ Get profile
- ✅ Update profile
- ✅ Change password
- ✅ Get public profile
- ✅ Verify all endpoints work

### Test 3: Manual UI Test

1. Log in as vendor
2. Go to dashboard → Settings tab
3. Edit a field (e.g., change name)
4. Click "Save Profile"
5. **Watch for:**
   - ✅ Success message appears
   - ✅ Field value updates in form
   - ✅ No error in console
   - ✅ Refresh page → changes persisted

---

## Common Issues & Solutions

### Issue: "Cannot read property 'vendor' of undefined"

**Cause:** Response structure incorrect
**Solution:**
1. Check backend endpoint returns: `{ message: "...", vendor: {...} }`
2. Verify response is not wrapped in extra object
3. Update VendorSettings to match response structure

**Fix:**
```javascript
// ✅ Correct response:
res.json({ message: 'Profile updated', vendor: safe })

// ❌ Wrong:
res.json({ data: { vendor: safe } })
```

---

### Issue: "profileImage is not defined"

**Cause:** Field name mismatch
**Solution:**
- Backend route uses `upload.single('profileImage')`
- Frontend FormData must use same name
- Check: `data.append('profileImage', profileImageFile)`

---

### Issue: "Email already in use" when email hasn't changed

**Cause:** Email validation includes current user
**Solution:**
Check email validation logic:
```javascript
// ✅ Correct:
if (email && email !== vendor.email) {
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ ... });
}

// ❌ Wrong (checks all users):
const existing = await User.findOne({ email });
if (existing) return res.status(400).json({ ... });
```

---

### Issue: Photos won't upload

**Cause:** Multiple possible reasons
**Solutions:**

1. **Check file type:**
   - Only JPG, PNG, GIF allowed
   - Try .png file
   
2. **Check file size:**
   - Max 1MB per file
   - Compress if needed
   
3. **Check /uploads folder:**
   - Exists: `ls -la backend/uploads/`
   - Has write permissions: `chmod 755 backend/uploads/`
   
4. **Check multer configuration:**
   - Verify middleware/upload.js settings
   - Verify route: `router.post('/photos', upload.array('vendorPhotos', 10), ...)`

---

### Issue: Password change not working

**Cause:** Current password validation failing
**Solutions:**

1. **Verify password comparison:**
   - Check User model has `matchPassword` method
   - Method must use bcrypt.compare()
   
2. **Test with correct password:**
   - Ensure you're entering current password correctly
   - Password is case-sensitive
   
3. **Check response:**
   - Should return: `{ message: "Password changed successfully" }`
   - If 400: "Current password is incorrect"

---

## Backend Logs Interpretation

### When to check logs

Run in backend terminal and watch for:

```
✅ GOOD LOG:
POST /api/vendor/profile 200 (success)
Profile updated for vendor: 647a8b9c123...

❌ BAD LOG:
POST /api/vendor/profile 500
Error: User not found
Error: Email validation failed

⚠️  WARNING LOG:
PATCH /api/vendor/profile 400
Email already in use
```

### How to enable more logs

**File:** `backend/controllers/vendorController.js`

Add debug logging:
```javascript
console.log('updateProfile received:', {
  body: req.body,
  file: req.file ? `${req.file.filename}` : 'no file',
  user: req.user._id
});
```

---

## Database Verification

### Check if vendor document has new fields

```bash
# In MongoDB shell or MongoDB Compass
db.users.findOne({ role: 'vendor' })

# Should include:
{
  _id: ObjectId(...),
  name: "...",
  email: "...",
  profileImage: "/uploads/...",
  vendorPhotos: [...],
  companyName: "...",
  bio: "...",
  experience: "...",
  // ... other fields
}
```

---

## File Permissions Check

```bash
# Check backend directory permissions
ls -la backend/
ls -la backend/uploads/
ls -la backend/middleware/upload.js
ls -la backend/controllers/vendorController.js

# Should show:
# drwxr-xr-x (readable/writable)
# -rw-r--r-- (readable)
```

---

## Environment Variables Check

**File:** `.env` (in backend root)

```
MONGO_URI=mongodb://...
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**File:** `.env` or check vite.config.js (frontend)

```
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Reset

If all else fails, restart everything:

```bash
# 1. Stop backend and frontend (Ctrl+C)

# 2. Clear caches
cd frontend && npm run build && cd ..
cd backend && rm -rf node_modules && npm install && cd ..

# 3. Restart
cd backend && npm start
# In another terminal:
cd frontend && npm run dev

# 4. Test in browser
# http://localhost:5173
# Login → Settings tab → Try save
```

---

## Still Not Working?

### Collect Debug Information

1. **Network Request:** Screenshot of failed request in DevTools
2. **Console Error:** Full error message text
3. **Backend Log:** All relevant log lines
4. **Component Props:** Check what `vendor` object contains
5. **Database:** Check if vendor document exists and has fields

### Contact Support With:

```
Backend Error: [error message]
Frontend Error: [error message]
Network Status: [404/400/500]
Response: [response data if available]
Steps to reproduce:
1. ...
2. ...
3. ...
```

---

## Validation Checklist

Before concluding it's "not working":

- [ ] Backend running? (npm start shows no errors)
- [ ] Frontend running? (npm run dev shows no errors)
- [ ] Logged in as vendor? (check localStorage ef_token)
- [ ] Settings tab visible? (click and see VendorSettings component)
- [ ] Can fill form? (type in fields and values update)
- [ ] Network request sent? (see PATCH in DevTools Network)
- [ ] Response received? (see 200 status, not 400/401/404/500)
- [ ] Success message appears? (see "Profile updated successfully")
- [ ] Page refresh persists changes? (refresh page, values still there)

---

## Performance Notes

- **Profile update:** Should complete in < 1 second
- **Photo upload:** Should complete in < 5 seconds per photo
- **Public profile load:** Should complete in < 2 seconds

If slower, check:
- Network tab for slow requests
- Backend logs for database queries
- Database indexes

---

Last Updated: November 28, 2025
Status: Active
