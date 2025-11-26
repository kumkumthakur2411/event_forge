const express = require('express');
const router = express.Router();
const { postEvent, myEvents, updateProfile, submitFeedback } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('client'));

router.post('/events', postEvent);
router.get('/events', myEvents);
router.patch('/profile', upload.single('profileImage'), updateProfile);
router.post('/feedback', submitFeedback);
// Client uploads photos for their own event (photos pending admin approval)
router.post('/events/:eventId/photos', upload.array('photos', 10), require('../controllers/clientController').uploadEventPhotos);
router.delete('/profile', require('../controllers/clientController').deleteAccount);

module.exports = router;
