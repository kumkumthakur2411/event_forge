# Verification Checklist & Quick Test Guide

## Pre-Verification

### 1. Ensure Backend is Running
```powershell
# Check if backend is running on port 5000
curl -s http://localhost:5000/api/public/images | ConvertFrom-Json | Format-Table

# Should return list of images (at least 1-2)
# If error, start backend: cd backend; npm start
```

### 2. Ensure Frontend is Available
```powershell
# Check if frontend is accessible
curl -s http://localhost:5173 | head -20

# Should return HTML content
# If error, start frontend: cd frontend; npm run dev
```

## Verification Steps

### Step 1: Verify Public Endpoints ✅

```powershell
# Test 1: Get web images
Write-Host "Test 1: Get Web Images" -ForegroundColor Yellow
$images = Invoke-RestMethod -Uri "http://localhost:5000/api/public/images"
Write-Host "✓ Got $(($images | Measure-Object).Count) web images" -ForegroundColor Green

# Test 2: Get landing testimonials
Write-Host "Test 2: Get Landing Testimonials" -ForegroundColor Yellow
$testimonials = Invoke-RestMethod -Uri "http://localhost:5000/api/public/testimonials?landing=true&limit=6"
Write-Host "✓ Got $(($testimonials | Measure-Object).Count) landing testimonials" -ForegroundColor Green

# Test 3: Get all testimonials
Write-Host "Test 3: Get All Approved Testimonials" -ForegroundColor Yellow
$allTestimonials = Invoke-RestMethod -Uri "http://localhost:5000/api/public/testimonials?limit=1000"
Write-Host "✓ Got $(($allTestimonials | Measure-Object).Count) total testimonials" -ForegroundColor Green

# Test 4: Get event gallery
Write-Host "Test 4: Get Event Gallery" -ForegroundColor Yellow
$gallery = Invoke-RestMethod -Uri "http://localhost:5000/api/public/event-images"
Write-Host "✓ Got $(($gallery | Measure-Object).Count) event gallery images" -ForegroundColor Green
```

**Expected Results**:
- Web images: 1-5 images
- Landing testimonials: 0-6 testimonials
- All testimonials: 0+ testimonials
- Event gallery: 0+ images

### Step 2: Verify Admin Components Load

```
1. Navigate to http://localhost:5173/admin
2. Login with admin credentials
3. Check Dashboard Tabs:
   ✓ Users tab exists
   ✓ Events tab exists
   ✓ Categories tab exists
   ✓ Testimonials tab exists
   ✓ Web Images tab exists (renamed from "Images")
   ✓ Event Gallery tab exists (new)
   ✓ Payments tab exists
   ✓ Settings tab exists
```

### Step 3: Verify Testimonials Tab ✅

```
1. Click "Testimonials" tab
2. Should see:
   ✓ "Pending Testimonials" section at top
   ✓ "Approved Testimonials" section below
   ✓ Pending items show approve checkbox and reject button
   ✓ Approved items show landing toggle checkbox
   ✓ Refresh data button works
```

**Test Actions**:
```
- [ ] Click approve checkbox on pending testimonial
- [ ] Message should appear: "Testimonial approved and marked for landing"
- [ ] Testimonial should move to approved section or update status
- [ ] Toggle landing checkbox on approved testimonial
- [ ] Message should appear: "Landing display updated"
```

### Step 4: Verify Web Images Tab ✅

```
1. Click "Web Images" tab
2. Should see:
   ✓ Section dropdown (hero, navbar-logo, box1, box2, howitworks)
   ✓ File upload input
   ✓ Alt text input
   ✓ Upload button
   ✓ Grid of existing images below
```

**Test Actions**:
```
- [ ] Select "hero" from section dropdown
- [ ] Choose any image file
- [ ] Enter alt text: "Test Hero Image"
- [ ] Click "Upload Image"
- [ ] Should see success message
- [ ] New image should appear in grid
- [ ] Click "Edit" on image
- [ ] Change alt text
- [ ] Click "Save"
- [ ] Alt text should update
- [ ] Click "Delete"
- [ ] Image should be removed
```

### Step 5: Verify Event Gallery Tab ✅

```
1. Click "Event Gallery" tab
2. Should see:
   ✓ Upload form for admin uploads
   ✓ Event selector dropdown
   ✓ Caption input
   ✓ Upload button
   ✓ Grid of event images below (if any exist)
```

**Test Actions**:
```
- [ ] Select an event from dropdown
- [ ] Enter caption: "Test event photo"
- [ ] Choose an image file
- [ ] Click "Upload"
- [ ] Should see success message
- [ ] New image should appear in grid
- [ ] Click "Approve" button
- [ ] Should see success message
- [ ] Image status should change to "Approved"
- [ ] Check "Show on landing" checkbox
- [ ] Should see success message
- [ ] Click "Delete"
- [ ] Image should be removed
```

### Step 6: Verify Landing Page ✅

```
1. Navigate to http://localhost:5173/
2. Scroll down to testimonials section
3. Should see:
   ✓ 6 testimonials (or less if not enough)
   ✓ "Show more testimonials" link at bottom
   ✓ Testimonial cards display name, role, message
4. Scroll further for event gallery
5. Should see:
   ✓ Event gallery images displayed
   ✓ Images only show if approved+landing marked
```

**Test Actions**:
```
- [ ] Click "Show more testimonials" link
- [ ] Should navigate to /testimonials page
- [ ] Page should show all approved testimonials
- [ ] Should have back link or navigation to home
- [ ] Return to home page
- [ ] Verify testimonials section still shows 6 max
```

### Step 7: Verify Client Feedback ✅

```
1. Logout from admin
2. Login as client
3. Navigate to Dashboard → Client
4. Click "Send Feedback" tab
5. Should see:
   ✓ Textarea for feedback message
   ✓ Submit button
   ✓ Clear button
```

**Test Actions**:
```
- [ ] Enter feedback: "Great platform for event planning!"
- [ ] Click "Submit Feedback"
- [ ] Should see success message
- [ ] Textarea should clear
- [ ] Login as admin
- [ ] Go to Admin → Testimonials tab
- [ ] Should see new feedback in "Pending" section
```

### Step 8: Verify Client Event Upload ✅

```
1. Logout and login as client (if needed logged out)
2. Navigate to Dashboard → Client
3. Click "My Events" tab
4. Should see events posted by client
5. For each event:
   ✓ Event title, description, date, location displayed
   ✓ Event status badge shown
   ✓ "Upload event photos" section visible
   ✓ File input for photos
   ✓ Upload and Clear buttons
```

**Test Actions**:
```
- [ ] Click file input
- [ ] Select one or more image files
- [ ] Click "Upload Photos"
- [ ] Should see success message
- [ ] Login as admin
- [ ] Go to Admin → Event Gallery tab
- [ ] Should see new images in list
- [ ] Images should show client name as uploader
```

### Step 9: Verify API Responses ✅

```powershell
# Test admin endpoints (requires token - use from login)

# Get admin token first (adjust email/password as needed)
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{email="admin@admin.com"; password="admin@admin"} | ConvertTo-Json)

$token = $login.token

# If login fails, try: echo "Cannot authenticate - verify admin account exists"

# Assuming token obtained, test endpoints
$headers = @{"Authorization"="Bearer $token"}

# Test pending testimonials
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/testimonials/pending" `
  -Headers $headers | ConvertTo-Json | Write-Host

# Test list event images
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/event-images" `
  -Headers $headers | ConvertTo-Json | Write-Host
```

## Verification Summary

### ✅ Backend Verification
- [ ] Server running on port 5000
- [ ] `/public/images` returns images
- [ ] `/public/testimonials?landing=true` returns testimonials
- [ ] `/public/event-images` returns event images
- [ ] Admin endpoints require token
- [ ] Client endpoints require token

### ✅ Frontend Verification
- [ ] Admin dashboard loads
- [ ] All tabs present and clickable
- [ ] Components load correct data
- [ ] Upload forms functional
- [ ] Edit/delete operations work
- [ ] Landing page displays content
- [ ] Client feedback form works
- [ ] Event photo upload works

### ✅ Integration Verification
- [ ] Admin approves testimonials
- [ ] Approved testimonials appear on landing
- [ ] Landing shows 6 testimonials max
- [ ] /testimonials page shows all approved
- [ ] Web images display on landing
- [ ] Event gallery shows approved images
- [ ] Client feedback creates testimonial
- [ ] Event uploads create images

### ✅ Data Integrity
- [ ] Testimonials have `displayOnLanding` field
- [ ] Event images have `approved` and `forLanding` fields
- [ ] Web images have proper section values
- [ ] Uploader information tracked correctly
- [ ] Event associations maintained

## Common Issues & Solutions

### Issue: Admin login fails
**Solution**: 
- Verify admin account exists in database
- Check email/password in .env file
- Run: `npm run seed-admin` in backend to create admin

### Issue: Tabs don't load data
**Solution**:
- Check browser console for errors
- Verify API endpoints are responding
- Check authentication token validity
- Refresh page and try again

### Issue: Upload fails
**Solution**:
- Check file size (max 10 MB)
- Verify file is image format
- Check backend/uploads directory permissions
- Look at server logs for multer errors

### Issue: Images not appearing on landing
**Solution**:
- Verify images are approved
- Check `displayOnLanding` flag for testimonials
- Check both `approved` and `forLanding` for event images
- Refresh landing page (clear browser cache)

## Success Criteria

✅ All checkboxes in above sections checked
✅ No error messages in browser console
✅ API endpoints return expected data
✅ Admin can approve/reject/toggle testimonials
✅ Admin can upload/edit/delete web images
✅ Admin can approve/reject event images
✅ Landing page displays testimonials and images
✅ Clients can submit feedback
✅ Clients can upload event photos
✅ All data flows correctly end-to-end

## Rollback Instructions (If Needed)

### To rollback code changes:
```powershell
# Reset modified files to previous version
git checkout -- backend/
git checkout -- frontend/

# Or restore specific files:
git checkout -- frontend/src/pages/Admin.jsx
```

### To remove added fields:
```powershell
# Remove from existing Testimonial documents:
# db.testimonials.updateMany({}, { $unset: { displayOnLanding: "" } })
```

## Performance Testing

```powershell
# Test response times
$sw = [System.Diagnostics.Stopwatch]::StartNew()
Invoke-RestMethod -Uri "http://localhost:5000/api/public/images" > $null
$sw.Stop()
Write-Host "Images API: $($sw.ElapsedMilliseconds)ms"

$sw = [System.Diagnostics.Stopwatch]::StartNew()
Invoke-RestMethod -Uri "http://localhost:5000/api/public/testimonials?landing=true" > $null
$sw.Stop()
Write-Host "Testimonials API: $($sw.ElapsedMilliseconds)ms"
```

**Expected**: < 100ms for small datasets

---

## Final Verification

When all steps are complete and all checkboxes are checked, the system is verified and ready for production use.

**🎉 System Verification Complete!**
