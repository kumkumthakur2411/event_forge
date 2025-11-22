const express = require('express');
const router = express.Router();
const { postEvent, myEvents, updateProfile, submitFeedback } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('client'));

router.post('/events', postEvent);
router.get('/events', myEvents);
router.put('/profile', updateProfile);
router.post('/feedback', submitFeedback);

module.exports = router;
