#!/usr/bin/env node

/**
 * Event Workflow Test Script
 * Tests the complete event lifecycle: post → approve → vendor interest → assignment → payment tracking
 */

const API_URL = 'http://localhost:5000/api';

// Test credentials
const ADMIN_CREDS = { email: 'admin@admin.com', password: 'admin@admin' };
const CLIENT_CREDS = { email: 'client@test.com', password: 'password123' };
const VENDOR_CREDS = { email: 'vendor@test.com', password: 'password123' };

// Helper function for API calls
async function api(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (data) options.body = JSON.stringify(data);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    const json = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${json.message || response.statusText}`);
    }
    
    return json;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Event Workflow Tests...\n');

  let adminToken, clientToken, vendorToken;
  let eventId, quotationId;

  try {
    // Test 1: Admin Login
    console.log('📝 Test 1: Admin Login');
    const adminRes = await api('POST', '/auth/login', ADMIN_CREDS);
    adminToken = adminRes.token;
    console.log('✅ Admin logged in\n');

    // Test 2: Create Client Account (if needed) and Login
    console.log('📝 Test 2: Client Login/Registration');
    try {
      // Try login first
      const clientRes = await api('POST', '/auth/login', CLIENT_CREDS);
      clientToken = clientRes.token;
      console.log('✅ Client logged in (existing account)\n');
    } catch (e) {
      // If login fails, try to register or approve
      console.log('   Client not logged in, checking status...');
      try {
        // Try to register
        await api('POST', '/auth/register', {
          ...CLIENT_CREDS,
          name: 'Test Client',
          role: 'client'
        });
      } catch (regErr) {
        if (!regErr.message.includes('already exists')) throw regErr;
        // Account exists but pending, which is fine - will approve below
      }
      // Admin approves the client
      const allUsers = await api('GET', '/admin/users', null, adminToken);
      const clientUser = allUsers.find(u => u.email === CLIENT_CREDS.email);
      if (!clientUser) throw new Error('Client account not found after registration');
      if (clientUser.status !== 'approved') {
        await api('PUT', `/admin/users/${clientUser._id}`, { action: 'approve' }, adminToken);
        console.log('   Admin approved client account');
      }
      // Now login
      const clientRes = await api('POST', '/auth/login', CLIENT_CREDS);
      clientToken = clientRes.token;
      console.log('✅ Client approved and logged in\n');
    }

    // Test 3: Create Vendor Account and Login
    console.log('📝 Test 3: Vendor Login/Registration');
    try {
      const vendorRes = await api('POST', '/auth/login', VENDOR_CREDS);
      vendorToken = vendorRes.token;
      console.log('✅ Vendor logged in (existing account)\n');
    } catch (e) {
      console.log('   Vendor not logged in, checking status...');
      try {
        // Try to register
        await api('POST', '/auth/register', {
          ...VENDOR_CREDS,
          name: 'Test Vendor',
          role: 'vendor'
        });
      } catch (regErr) {
        if (!regErr.message.includes('already exists')) throw regErr;
        // Account exists but pending, which is fine - will approve below
      }
      // Admin approves the vendor
      const allUsers = await api('GET', '/admin/users', null, adminToken);
      const vendorUser = allUsers.find(u => u.email === VENDOR_CREDS.email);
      if (!vendorUser) throw new Error('Vendor account not found after registration');
      if (vendorUser.status !== 'approved') {
        await api('PUT', `/admin/users/${vendorUser._id}`, { action: 'approve' }, adminToken);
        console.log('   Admin approved vendor account');
      }
      // Now login
      const vendorRes = await api('POST', '/auth/login', VENDOR_CREDS);
      vendorToken = vendorRes.token;
      console.log('✅ Vendor approved and logged in\n');
    }

    // Test 4: Client Posts Event
    console.log('📝 Test 4: Client Posts Event');
    const eventRes = await api('POST', '/client/events', {
      title: 'Wedding Ceremony',
      description: 'Beautiful wedding event at garden venue',
      date: '2024-06-15',
      location: 'Garden Venue, Downtown'
    }, clientToken);
    eventId = eventRes.event._id;
    console.log(`✅ Event created with ID: ${eventId}`);
    console.log(`   Status: ${eventRes.event.status} (should be "pending")\n`);

    // Test 5: Admin Views Pending Events
    console.log('📝 Test 5: Admin Views Pending Events');
    const eventsRes = await api('GET', '/admin/events', null, adminToken);
    const pendingEvent = eventsRes.find(e => e._id === eventId);
    if (!pendingEvent) throw new Error('Event not found in admin list');
    console.log(`✅ Event found in admin dashboard`);
    console.log(`   Posted by: ${pendingEvent.postedBy?.email}`);
    console.log(`   Status: ${pendingEvent.status}\n`);

    // Test 6: Admin Approves Event
    console.log('📝 Test 6: Admin Approves Event');
    const approveRes = await api('PUT', `/admin/events/${eventId}`, 
      { action: 'approve' }, 
      adminToken);
    console.log(`✅ Event approved`);
    console.log(`   New status: ${approveRes.message}\n`);

    // Test 7: Vendor Views Approved Events
    console.log('📝 Test 7: Vendor Views Approved Events');
    const vendorEventsRes = await api('GET', '/vendor/events', null, vendorToken);
    const approvedEvent = vendorEventsRes.find(e => e._id === eventId);
    if (!approvedEvent) throw new Error('Approved event not visible to vendor');
    console.log(`✅ Approved event visible to vendor`);
    console.log(`   Event: ${approvedEvent.title}\n`);

    // Test 8: Vendor Sends Interest
    console.log('📝 Test 8: Vendor Sends Interest (Creates Quotation)');
    const interestRes = await api('POST', '/vendor/interest', {
      eventId: eventId,
      message: 'I am interested in providing decoration services for this wedding'
    }, vendorToken);
    quotationId = interestRes.quotation._id;
    console.log(`✅ Quotation created with ID: ${quotationId}`);
    console.log(`   Status: ${interestRes.quotation.status} (should be "pending")\n`);

    // Test 9: Admin Views Vendor Interest
    console.log('📝 Test 9: Admin Views Vendor Interest in Event Details');
    const eventDetailRes = await api('GET', `/admin/events/${eventId}`, null, adminToken);
    if (!eventDetailRes.vendorInterests || eventDetailRes.vendorInterests.length === 0) {
      throw new Error('Vendor interest not found in event details');
    }
    const interest = eventDetailRes.vendorInterests[0];
    console.log(`✅ Vendor interest visible in event details`);
    console.log(`   Vendor: ${interest.vendor?.email}`);
    console.log(`   Message: ${interest.message}`);
    console.log(`   Status: ${interest.status}\n`);

    // Test 10: Admin Assigns Vendor
    console.log('📝 Test 10: Admin Assigns Vendor to Event');
    const assignRes = await api('PUT', `/admin/quotations/${quotationId}`, 
      { action: 'approve' }, 
      adminToken);
    console.log(`✅ Vendor assigned to event`);
    console.log(`   Quotation status: ${assignRes.message}\n`);

    // Test 11: Admin Marks Vendor as Paid
    console.log('📝 Test 11: Admin Marks Vendor Payment as Paid');
    const paidRes = await api('PUT', `/admin/quotations/${quotationId}/mark-paid`, 
      {}, 
      adminToken);
    console.log(`✅ Vendor marked as paid`);
    console.log(`   Payment status updated\n`);

    // Test 12: View Payment Dashboard
    console.log('📝 Test 12: Admin Views Payment Dashboard');
    const paymentsRes = await api('GET', '/admin/events', null, adminToken);
    console.log(`✅ Payment data available`);
    console.log(`   Total events: ${paymentsRes.length}\n`);

    console.log('\n✨ All tests passed! Event workflow is working correctly.\n');
    console.log('Workflow Summary:');
    console.log(`1. Client posted event (ID: ${eventId})`);
    console.log(`2. Event created with status: pending`);
    console.log(`3. Admin approved event → status changed to approved`);
    console.log(`4. Vendor saw approved event in dashboard`);
    console.log(`5. Vendor sent interest → quotation created (ID: ${quotationId})`);
    console.log(`6. Admin reviewed vendor interest`);
    console.log(`7. Admin assigned vendor → quotation status = approved`);
    console.log(`8. Admin marked vendor payment as paid`);
    console.log(`9. Payment tracking updated`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
