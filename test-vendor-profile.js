#!/usr/bin/env node

/**
 * Vendor Profile API Testing Script
 * Run: node test-vendor-profile.js
 * 
 * Tests all vendor profile endpoints
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let token = '';
let vendorId = '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test vendor credentials
const testVendor = {
  email: 'testvendor@example.com',
  password: 'testpass123',
  name: 'Test Vendor Company',
  phoneNo: '9876543210',
  companyName: 'Test Company Ltd',
  categories: [],
  companyEmail: 'company@test.com',
  companyPhone: '9876543210',
  city: 'Test City',
  description: 'Test company description',
  gst: 'GST123456789',
  pan: 'PAN1234567890'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n📝 Testing: ${name}`, 'blue');
    await fn();
    log(`✅ PASSED: ${name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${name}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function runTests() {
  log('\n🧪 VENDOR PROFILE API TESTS\n', 'yellow');
  let passed = 0;
  let failed = 0;

  // Test 1: Register vendor
  if (await test('Register new vendor', async () => {
    const res = await api.post('/auth/register', {
      ...testVendor,
      role: 'vendor'
    });
    log(`   Response: ${JSON.stringify(res.data).substring(0, 100)}...`);
  })) passed++; else failed++;

  // Test 2: Login
  if (await test('Login as vendor', async () => {
    const res = await api.post('/auth/login', {
      email: testVendor.email,
      password: testVendor.password
    });
    token = res.data.token;
    vendorId = res.data.user._id;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    log(`   Token received, Vendor ID: ${vendorId}`);
  })) passed++; else failed++;

  // Test 3: Get profile
  if (await test('GET /vendor/profile', async () => {
    const res = await api.get('/vendor/profile');
    log(`   Name: ${res.data.name}, Email: ${res.data.email}`);
  })) passed++; else failed++;

  // Test 4: Update profile (without file)
  if (await test('PATCH /vendor/profile (text fields)', async () => {
    const res = await api.patch('/vendor/profile', {
      name: 'Updated Vendor Name',
      bio: 'This is an updated bio',
      experience: '5 years in event management'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    log(`   Updated name: ${res.data.vendor.name}`);
    log(`   Updated bio: ${res.data.vendor.bio}`);
  })) passed++; else failed++;

  // Test 5: Change password
  if (await test('PUT /vendor/profile/password', async () => {
    const res = await api.put('/vendor/profile/password', {
      currentPassword: testVendor.password,
      newPassword: 'newpass123'
    });
    log(`   Response: ${res.data.message}`);
  })) passed++; else failed++;

  // Test 6: Get public vendor profile
  if (await test('GET /public/vendors/{vendorId} (public)', async () => {
    const publicApi = axios.create({ baseURL: API_URL });
    const res = await publicApi.get(`/public/vendors/${vendorId}`);
    log(`   Vendor name: ${res.data.name}`);
    log(`   Company: ${res.data.companyName}`);
  })) passed++; else failed++;

  // Test 7: Verify password changed by trying old password
  if (await test('Verify password changed (try old password)', async () => {
    try {
      const res = await api.post('/auth/login', {
        email: testVendor.email,
        password: testVendor.password // old password
      });
      throw new Error('Should not login with old password');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log(`   Correctly rejected old password`);
      } else {
        throw error;
      }
    }
  })) passed++; else failed++;

  // Test 8: Login with new password
  if (await test('Login with new password', async () => {
    const res = await api.post('/auth/login', {
      email: testVendor.email,
      password: 'newpass123'
    });
    token = res.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    log(`   Successfully logged in with new password`);
  })) passed++; else failed++;

  // Test 9: Try duplicate email
  if (await test('Prevent duplicate email (should fail)', async () => {
    try {
      await api.patch('/vendor/profile', {
        email: 'testvendor@example.com' // Already used
      });
      throw new Error('Should prevent duplicate email');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log(`   Correctly prevented duplicate email: ${error.response.data.message}`);
      } else {
        throw error;
      }
    }
  })) passed++; else failed++;

  // Summary
  log(`\n${'='.repeat(50)}`, 'yellow');
  log(`Tests Passed: ${passed}`, 'green');
  log(`Tests Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Total Tests: ${passed + failed}`, 'blue');
  log(`${'='.repeat(50)}`, 'yellow');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  log(`\n🔥 Fatal Error: ${err.message}`, 'red');
  process.exit(1);
});
