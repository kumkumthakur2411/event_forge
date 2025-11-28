const express = require('express');
const router = express.Router();
const { availableEvents, sendInterest, assignedEvents, revokeInterest, updateAssignmentStatus, deleteAccount, getProfile, updateProfile, changePassword, uploadVendorPhotos, deleteVendorPhoto, getPublicProfile } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('vendor'));

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', upload.single('profileImage'), updateProfile);
router.put('/profile/password', changePassword);
router.post('/photos', upload.array('vendorPhotos', 10), uploadVendorPhotos);
router.delete('/photos', deleteVendorPhoto);

// Event routes
router.get('/events', availableEvents);
router.post('/interest', sendInterest);
router.delete('/interest/:eventId', revokeInterest);
router.get('/assigned', assignedEvents);
router.post('/assigned/:eventId/action', updateAssignmentStatus);
// Vendor uploads photos for an event (photos pending admin approval)
router.post('/events/:eventId/photos', upload.array('photos', 10), require('../controllers/vendorController').uploadEventPhotos);

// Account management
router.delete('/profile', deleteAccount);

module.exports = router;
