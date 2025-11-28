const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.approveUser);
router.get('/users/:id', adminController.getUser);
router.delete('/users/:id', adminController.deleteUser);

// Admin self profile endpoints
router.patch('/profile', upload.single('profileImage'), adminController.updateProfile);
router.put('/profile/password', adminController.changePassword);

router.get('/events', adminController.getAllEvents);
router.get('/events/:id', adminController.getEvent);
router.put('/events/:id', adminController.approveEvent);
router.patch('/events/:id', adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);
router.post('/events/:id/apply', adminController.applyPendingEdits);
router.post('/events/:id/discard', adminController.discardPendingEdits);

router.post('/categories', upload.single('image'), adminController.createCategory);
router.get('/categories', adminController.getCategories);
router.patch('/categories/:id', upload.single('image'), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
// upload multiple images to existing category
router.post('/categories/:id/images', upload.array('images'), adminController.addCategoryImages);
router.delete('/categories/:id/images', adminController.deleteCategoryImage);

router.put('/quotations/:id', adminController.approveQuotation);
router.put('/quotations/:id/payment', adminController.setPaymentStatus);
router.put('/quotations/:id/mark-paid', adminController.markQuotationPaid);
router.put('/quotations/:id/mark-unpaid', adminController.markQuotationUnpaid);
router.get('/quotations', adminController.listQuotations);
router.put('/quotations/bulk-payment', adminController.bulkSetPayment);

router.get('/testimonials/pending', adminController.getPendingTestimonials);
router.post('/testimonials/:id/approve', adminController.approveTestimonial);
router.patch('/testimonials/:id/display', adminController.setTestimonialDisplay);
router.delete('/testimonials/:id', adminController.rejectTestimonial);

// Admin settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

router.post('/images', upload.single('image'), adminController.uploadImage);
router.patch('/images/:id', upload.single('image'), adminController.updateImage);
router.get('/images', adminController.getImages);
router.delete('/images/:id', adminController.deleteImage);
// Event/gallery images
router.post('/event-images', upload.single('image'), adminController.createEventImage);
router.get('/event-images', adminController.listEventImages);
router.get('/stats', adminController.getStats);
router.post('/event-images/:id/approve', adminController.approveEventImage);
router.delete('/event-images/:id', adminController.deleteEventImage);

module.exports = router;
