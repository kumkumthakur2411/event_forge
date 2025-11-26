const express = require('express');
const router = express.Router();
const { availableEvents, sendInterest, updateProfile, assignedEvents, revokeInterest, updateAssignmentStatus } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('vendor'));

router.get('/events', availableEvents);
router.post('/interest', sendInterest);
router.delete('/interest/:eventId', revokeInterest);
router.patch('/profile', upload.array('photos', 5), updateProfile);
router.get('/assigned', assignedEvents);
router.post('/assigned/:eventId/action', updateAssignmentStatus);
// Vendor uploads photos for an event (photos pending admin approval)
router.post('/events/:eventId/photos', upload.array('photos', 10), require('../controllers/vendorController').uploadEventPhotos);
router.delete('/profile', require('../controllers/vendorController').deleteAccount);

module.exports = router;
