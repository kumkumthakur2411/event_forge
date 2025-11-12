const express = require('express');
const router = express.Router();
const { getAllUsers, approveUser, getAllEvents, getEvent, approveEvent, approveQuotation } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', approveUser);

router.get('/events', getAllEvents);
router.get('/events/:id', getEvent);
router.put('/events/:id', approveEvent);

router.put('/quotations/:id', approveQuotation);

module.exports = router;
