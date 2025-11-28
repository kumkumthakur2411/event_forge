const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const vendorController = require('../controllers/vendorController');

// Public endpoints for landing page
router.get('/vendors', publicController.listVendors);
router.get('/vendors/search', publicController.searchVendors);
router.get('/vendors/:vendorId', vendorController.getPublicProfile);
router.get('/events/completed', publicController.completedEvents);
router.get('/testimonials', publicController.testimonials);
router.get('/images', publicController.getImages);
router.get('/event-images', publicController.eventGallery);
router.get('/categories', publicController.listCategories);
router.get('/categories/:categoryId/vendors', publicController.getVendorsByCategory);

// Public settings (site-wide) - lightweight
router.get('/settings', publicController.getSettings);

module.exports = router;
