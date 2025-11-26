const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public endpoints for landing page
router.get('/vendors', publicController.listVendors);
router.get('/vendors/search', publicController.searchVendors);
router.get('/events/completed', publicController.completedEvents);
router.get('/testimonials', publicController.testimonials);
router.get('/images', publicController.getImages);
router.get('/event-images', publicController.eventGallery);
router.get('/categories', publicController.listCategories);
router.get('/categories/:categoryId/vendors', publicController.getVendorsByCategory);

module.exports = router;
