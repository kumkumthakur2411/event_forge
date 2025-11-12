const express = require('express');
const router = express.Router();
const { availableEvents, sendInterest, updateProfile, assignedEvents, revokeInterest, updateAssignmentStatus } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('vendor'));

router.get('/events', availableEvents);
router.post('/interest', sendInterest);
router.delete('/interest/:eventId', revokeInterest);
router.put('/profile', updateProfile);
router.get('/assigned', assignedEvents);
router.post('/assigned/:eventId/action', updateAssignmentStatus);

module.exports = router;
