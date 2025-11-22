const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.approveUser);
router.get('/users/:id', adminController.getUser);

router.get('/events', adminController.getAllEvents);
router.get('/events/:id', adminController.getEvent);
router.put('/events/:id', adminController.approveEvent);
router.patch('/events/:id', adminController.updateEvent);
router.post('/events/:id/apply', adminController.applyPendingEdits);
router.post('/events/:id/discard', adminController.discardPendingEdits);

router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getCategories);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.put('/quotations/:id', adminController.approveQuotation);

router.get('/testimonials/pending', adminController.getPendingTestimonials);
router.post('/testimonials/:id/approve', adminController.approveTestimonial);
router.delete('/testimonials/:id', adminController.rejectTestimonial);

router.post('/images', adminController.uploadImage);
router.get('/images', adminController.getImages);
router.delete('/images/:id', adminController.deleteImage);

module.exports = router;
