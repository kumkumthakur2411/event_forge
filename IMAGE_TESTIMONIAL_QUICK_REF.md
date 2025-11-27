# Quick Reference - Image & Testimonial System

## What Was Built

A comprehensive image management and testimonial system for Event Forge with the following features:

### 1. **Testimonial Management**
- Clients submit feedback via their dashboard
- Admin approves/rejects feedback
- Admin can toggle display on landing page (6 testimonials max)
- Dedicated testimonials page shows all approved testimonials

### 2. **Web Section Images**
- Admin uploads images for specific sections (hero, navbar-logo, box1, box2, howitworks)
- Admin can edit alt text and replace images
- Landing page fetches web images dynamically
- Images returned via `/public/images` endpoint

### 3. **Event Gallery Management**
- Admin can upload images to event gallery
- Clients/Vendors can upload event photos
- All uploads require admin approval before landing display
- Landing page shows approved+marked for landing images
- Admin has dedicated interface to approve/reject/toggle display

### 4. **Landing Page Integration**
- Shows 6 testimonials with "Show more testimonials" link
- Displays approved event gallery images
- Fetches web section images dynamically

## Key Files & Components

### Frontend Components
- `Admin.jsx` - Main admin dashboard with tabs for testimonials, web images, event gallery
- `Landing.jsx` - Home page with testimonials and event gallery
- `Testimonials.jsx` - Dedicated page for all approved testimonials
- `AdminTestimonials.jsx` - Component for approving/rejecting/displaying testimonials
- `AdminWebImages.jsx` - Component for managing web section images
- `AdminEventImages.jsx` - Component for managing event gallery and approvals

### Backend Controllers
- `adminController.js` - Routes for image/testimonial admin operations
- `publicController.js` - Public endpoints for landing page data
- `clientController.js` - Client feedback and photo uploads
- `vendorController.js` - Vendor photo uploads

### Backend Models
- `Testimonial.js` - Has `displayOnLanding` boolean field
- `WebImage.js` - Web section images with sections support
- `EventImage.js` - Event gallery images with approval workflow

## API Endpoints

### For Landing Page
```
GET /public/testimonials?landing=true        → 6 testimonials for landing
GET /public/images                           → Web section images
GET /public/event-images                     → Event gallery images
```

### For Admin Dashboard
```
GET /admin/testimonials/pending              → Pending approval
POST /admin/testimonials/:id/approve         → Approve with landing flag
PATCH /admin/testimonials/:id/display        → Toggle landing display
DELETE /admin/testimonials/:id               → Reject testimonial

POST /admin/images                           → Upload web image
PATCH /admin/images/:id                      → Update web image
DELETE /admin/images/:id                     → Delete web image

POST /admin/event-images                     → Admin upload event image
GET /admin/event-images                      → List all event images
POST /admin/event-images/:id/approve         → Approve/reject/toggle landing
DELETE /admin/event-images/:id               → Delete event image
```

### For Clients/Vendors
```
POST /client/feedback                        → Submit testimonial
POST /client/events/:eventId/photos          → Upload event photos
POST /vendor/events/:eventId/photos          → Upload event photos
```

## Admin Dashboard Workflow

1. **Testimonials Tab**
   - Review pending client feedback
   - Check "Approve & show on landing" to both approve and mark for display
   - Or just approve without marking for landing
   - View all approved testimonials and toggle their landing status

2. **Web Images Tab**
   - Select section (hero, navbar-logo, box1, box2, howitworks)
   - Upload image with alt text
   - Edit images inline (update image or alt text)
   - Delete images

3. **Event Gallery Tab**
   - Admin can upload images for any event
   - View all event images with uploader info and event title
   - Approve/unapprove images
   - Toggle "Show on landing" for approved images
   - Delete images

## Frontend Workflow

### For Clients
1. Go to Dashboard → Client → Feedback Tab
2. Write testimonial and submit
3. Go to My Events Tab → Upload photos within event card

### For Vendors
1. Go to Dashboard → Vendor → Assigned Events Tab
2. Upload photos within assigned event card

### For Landing Visitors
1. View home page with 6 testimonials
2. Click "Show more testimonials" to see all
3. View event gallery images at bottom of landing page

## Testing the System

### Test Public Endpoints
```powershell
# Get web images
curl http://localhost:5000/api/public/images

# Get landing testimonials
curl http://localhost:5000/api/public/testimonials?landing=true

# Get event gallery
curl http://localhost:5000/api/public/event-images
```

### Test with Admin Account
1. Login as admin (credentials from .env or admin seed)
2. Go to Admin dashboard
3. Test each tab:
   - Approve a testimonial and toggle landing display
   - Upload and edit a web image
   - Review event images and approve/reject

### Test Client Feedback
1. Login as client
2. Go to Feedback tab
3. Submit feedback
4. Check admin dashboard to see pending testimonial

### Test Event Photo Upload
1. Client: Post an event, upload photos
2. Admin: Approve event and event images
3. Verify images appear on landing gallery

## Configuration

### Environment Variables
```
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin@admin
```

### Sections Supported for Web Images
- `hero` - Hero banner
- `navbar-logo` - Navigation bar logo
- `box1` - Featured section box 1
- `box2` - Featured section box 2
- `howitworks` - How it works section

## Important Notes

1. **Testimonials** - Only `approved: true` testimonials are shown. The `displayOnLanding` flag determines if they appear in landing view.

2. **Event Images** - Both `approved: true` AND `forLanding: true` are required for images to appear on landing gallery.

3. **Web Images** - No approval needed. Uploaded directly and immediately available on landing page.

4. **File Size** - Multer configured for up to 10 MB per file, max 10 files per request.

5. **Uploads** - Files stored in `backend/uploads/` and served via `/uploads/` route.

## Troubleshooting

### Images not showing on landing
- Check if admin approved the images
- For testimonials: Check both `approved` AND `displayOnLanding` flags
- For event images: Check both `approved` AND `forLanding` flags
- Check file paths and ensure `/uploads/` route is accessible

### Admin dashboard not loading images
- Verify admin token is valid
- Check browser console for API errors
- Ensure `loadWebImages()` and `loadEventImages()` functions are being called

### Upload failing
- Check file size (max 10 MB)
- Check file format (images only)
- Verify `multipart/form-data` header is set
- Check backend logs for multer errors

## Performance Considerations

- Web images limit: No limit (all returned)
- Landing testimonials: Limited to 6 by default
- Event gallery: Limited by pagination (10 per page default)
- Consider caching public endpoints for high traffic

## Future Enhancements

- Image compression/optimization
- Bulk operations
- Search and filtering
- Image analytics
- Lazy loading for galleries
- CDN integration for image hosting
