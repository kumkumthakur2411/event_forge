const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let adminToken = '';
let clientToken = '';
let vendorToken = '';
let eventId = '';
let webImageId = '';
let eventImageId = '';
let testimonialId = '';

const log = (title, data) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ ${title}`);
  console.log(`${'='.repeat(60)}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logError = (title, error) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✗ ${title}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Error: ${error.message}`);
  if (error.response?.data) console.log(JSON.stringify(error.response.data, null, 2));
};

// Create a test image buffer
const createTestImage = () => {
  // Create a simple 1x1 pixel PNG
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
    0x00, 0x05, 0xFE, 0x02, 0xB7, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
    0x82
  ]);
  return pngHeader;
};

const test = async () => {
  try {
    log('Starting Image & Testimonial System Tests');

    // 1. Login as admin
    console.log('\n→ Logging in as admin...');
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@eventforge.com',
      password: 'admin123'
    });
    adminToken = adminRes.data.token;
    log('Admin Login', { email: adminRes.data.user.email, role: adminRes.data.user.role });

    // 2. Test Web Images Upload
    console.log('\n→ Testing web image upload...');
    const formData = new FormData();
    formData.append('section', 'hero');
    formData.append('altText', 'Hero Banner Image');
    
    // For Node.js, we need to use a different approach
    const imageBuffer = createTestImage();
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', imageBlob, 'test-hero.png');

    try {
      const uploadRes = await axios.post(`${BASE_URL}/admin/images`, formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      webImageId = uploadRes.data.image._id;
      log('Web Image Upload', { section: uploadRes.data.image.section, altText: uploadRes.data.image.altText });
    } catch (e) {
      logError('Web Image Upload', e);
    }

    // 3. Test Get Web Images
    console.log('\n→ Testing get web images...');
    try {
      const imagesRes = await axios.get(`${BASE_URL}/public/images`);
      log('Get Web Images', { count: imagesRes.data.length, images: imagesRes.data.slice(0, 2) });
    } catch (e) {
      logError('Get Web Images', e);
    }

    // 4. Login as client
    console.log('\n→ Logging in as client...');
    try {
      const clientRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'client@example.com',
        password: 'password123'
      });
      clientToken = clientRes.data.token;
      log('Client Login', { email: clientRes.data.user.email, role: clientRes.data.user.role });
    } catch (e) {
      // Create a test client if not exists
      console.log('→ Creating test client...');
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test Client',
        email: 'client@example.com',
        password: 'password123',
        role: 'client'
      });
      clientToken = regRes.data.token;
      log('Client Created', { email: regRes.data.user.email });
    }

    // 5. Client submits testimonial/feedback
    console.log('\n→ Testing client feedback submission...');
    try {
      const feedbackRes = await axios.post(`${BASE_URL}/client/feedback`, 
        { message: 'Great platform! Very easy to use.' },
        { headers: { 'Authorization': `Bearer ${clientToken}` } }
      );
      testimonialId = feedbackRes.data.testimonial._id;
      log('Client Feedback Submitted', { message: feedbackRes.data.message, testimonialId });
    } catch (e) {
      logError('Client Feedback Submission', e);
    }

    // 6. Get pending testimonials (admin)
    console.log('\n→ Testing get pending testimonials...');
    try {
      const pendingRes = await axios.get(`${BASE_URL}/admin/testimonials/pending`, 
        { headers: { 'Authorization': `Bearer ${adminToken}` } }
      );
      log('Pending Testimonials', { count: pendingRes.data.length, testimonials: pendingRes.data });
    } catch (e) {
      logError('Get Pending Testimonials', e);
    }

    // 7. Admin approves testimonial and marks for landing
    console.log('\n→ Testing testimonial approval with landing flag...');
    if (testimonialId) {
      try {
        const approveRes = await axios.post(`${BASE_URL}/admin/testimonials/${testimonialId}/approve`,
          { displayOnLanding: true },
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        log('Testimonial Approved', { approved: approveRes.data.testimonial.approved, displayOnLanding: approveRes.data.testimonial.displayOnLanding });
      } catch (e) {
        logError('Testimonial Approval', e);
      }
    }

    // 8. Get landing testimonials
    console.log('\n→ Testing landing testimonials (with landing=true filter)...');
    try {
      const landingRes = await axios.get(`${BASE_URL}/public/testimonials?landing=true&limit=6`);
      log('Landing Testimonials', { count: landingRes.data.length, testimonials: landingRes.data.slice(0, 2) });
    } catch (e) {
      logError('Get Landing Testimonials', e);
    }

    // 9. Get all approved testimonials
    console.log('\n→ Testing all approved testimonials...');
    try {
      const allRes = await axios.get(`${BASE_URL}/public/testimonials?limit=1000`);
      log('All Approved Testimonials', { count: allRes.data.length });
    } catch (e) {
      logError('Get All Testimonials', e);
    }

    // 10. Create test event for client
    console.log('\n→ Creating test event...');
    try {
      const eventRes = await axios.post(`${BASE_URL}/client/events`,
        { title: 'Test Wedding Event', description: 'A beautiful wedding celebration', date: new Date().toISOString(), location: 'Mumbai' },
        { headers: { 'Authorization': `Bearer ${clientToken}` } }
      );
      eventId = eventRes.data._id;
      log('Event Created', { title: eventRes.data.title, eventId });
    } catch (e) {
      logError('Create Event', e);
    }

    // 11. Admin approves event
    console.log('\n→ Admin approves event...');
    if (eventId) {
      try {
        const approveEventRes = await axios.put(`${BASE_URL}/admin/events/${eventId}`,
          { status: 'approved' },
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        log('Event Approved', { status: approveEventRes.data.status });
      } catch (e) {
        logError('Approve Event', e);
      }
    }

    // 12. Test event image creation (admin upload)
    console.log('\n→ Testing admin event image upload...');
    if (eventId) {
      try {
        const eventImageForm = new FormData();
        eventImageForm.append('event', eventId);
        eventImageForm.append('caption', 'Beautiful event setup');
        const eventImageRes = await axios.post(`${BASE_URL}/admin/event-images`,
          eventImageForm,
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        eventImageId = eventImageRes.data.image._id;
        log('Event Image Uploaded', { caption: eventImageRes.data.image.caption });
      } catch (e) {
        logError('Event Image Upload', e);
      }
    }

    // 13. Admin approves event image for landing
    console.log('\n→ Testing event image approval for landing...');
    if (eventImageId) {
      try {
        const approveImgRes = await axios.post(`${BASE_URL}/admin/event-images/${eventImageId}/approve`,
          { approve: true, forLanding: true },
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        log('Event Image Approved for Landing', { approved: approveImgRes.data.image.approved, forLanding: approveImgRes.data.image.forLanding });
      } catch (e) {
        logError('Approve Event Image', e);
      }
    }

    // 14. Get event gallery
    console.log('\n→ Testing get event gallery...');
    try {
      const galleryRes = await axios.get(`${BASE_URL}/public/event-images`);
      log('Event Gallery', { count: galleryRes.data.length });
    } catch (e) {
      logError('Get Event Gallery', e);
    }

    // 15. List admin event images with filters
    console.log('\n→ Testing admin list event images...');
    try {
      const listRes = await axios.get(`${BASE_URL}/admin/event-images`,
        { headers: { 'Authorization': `Bearer ${adminToken}` } }
      );
      log('Admin Event Images List', { total: listRes.data.total, images: listRes.data.images.slice(0, 2) });
    } catch (e) {
      logError('List Event Images', e);
    }

    log('Image & Testimonial System Tests Complete!');

  } catch (error) {
    logError('Test Suite', error);
  }
};

// Run tests
test();
