const express = require('express');
const router = express.Router();
const { postEvent, myEvents, updateProfile } = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('client'));

router.post('/events', postEvent);
router.get('/events', myEvents);
router.put('/profile', updateProfile);

module.exports = router;
