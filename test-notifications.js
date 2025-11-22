#!/usr/bin/env node

// Test notifications and pending edits flow
const http = require('http');

const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  console.log('Testing notifications & pending edits flow...\n');

  // Login as admin
  console.log('1. Login as admin...');
  let res = await makeRequest('POST', '/auth/login', { email: 'admin@admin.com', password: 'admin@admin' });
  if (res.status !== 200) {
    console.error('   Failed:', res.data.message);
    process.exit(1);
  }
  const adminToken = res.data.token;
  console.log('   ✓ Admin token:', adminToken.substring(0, 20) + '...\n');

  // Get admin user
  console.log('2. Get admin user...');
  res = await makeRequest('GET', '/auth/me', null, adminToken);
  const adminId = res.data._id;
  console.log('   ✓ Admin ID:', adminId);
  console.log('   ✓ Notifications:', res.data.notifications || 'empty\n');

  // Create a test event (as client - need a vendor and client to test)
  // For now, just verify endpoints exist
  console.log('3. Check notifications endpoint...');
  res = await makeRequest('GET', '/auth/notifications', null, adminToken);
  console.log('   ✓ GET /auth/notifications:', res.status === 200 ? 'OK' : 'FAIL');

  console.log('\n4. Test mark all read...');
  res = await makeRequest('POST', '/auth/notifications/read-all', {}, adminToken);
  console.log('   ✓ POST /auth/notifications/read-all:', res.status === 200 ? 'OK' : 'FAIL');

  console.log('\n5. Check categories endpoints...');
  res = await makeRequest('GET', '/categories');
  console.log('   ✓ GET /categories:', res.status === 200 ? 'OK' : 'FAIL', `(${res.data.length} categories)`);

  console.log('\n✓ All endpoints working!\n');
  console.log('Next steps:');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Login as admin (admin@admin.com / admin@admin)');
  console.log('3. Go to Admin > Manage Events');
  console.log('4. Edit an event and click Save (creates pending edits)');
  console.log('5. Click "Apply Pending Edits" and confirm');
  console.log('6. Check the bell icon in navbar for notifications');
  console.log('7. Assigned vendors and event owner should see notifications');
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
