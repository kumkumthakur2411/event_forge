const http = require('http');
const mongoose = require('mongoose');

function req(method, path, data, token){
  return new Promise((resolve, reject)=>{
    const options = { hostname: 'localhost', port: 5000, path: `/api${path}`, method, headers: { 'Content-Type': 'application/json' } };
    if(token) options.headers.Authorization = `Bearer ${token}`;
    const r = http.request(options, res=>{
      let body = '';
      res.on('data', d=> body += d);
      res.on('end', ()=>{
        try{ resolve({ status: res.statusCode, data: JSON.parse(body) }); }catch(e){ resolve({ status: res.statusCode, data: body }); }
      });
    });
    r.on('error', reject);
    if(data) r.write(JSON.stringify(data));
    r.end();
  });
}

(async ()=>{
  try{
    // Connect to MongoDB to inspect directly
    await mongoose.connect('mongodb://localhost:27017/event_forge');
    const User = require('../backend/models/User');
    const Event = require('../backend/models/Event');
    
    console.log('=== DIAGNOSTIC: Testing notification flow ===\n');
    
    // Step 1: Create client
    console.log('Step 1: Creating test client...');
    const email = `client+${Date.now()}@test.com`;
    const pass = 'pass123';
    const regRes = await req('POST','/auth/register',{ name: 'Test', email, password: pass, role: 'client' });
    console.log('Register status:', regRes.status);
    
    // Step 2: Admin approves client
    console.log('\nStep 2: Admin approving client...');
    const adminLogin = await req('POST','/auth/login',{ email: 'admin@admin.com', password: 'admin@admin' });
    const adminToken = adminLogin.data.token;
    const users = await req('GET','/admin/users', null, adminToken);
    const clientUser = users.data.find(u => u.email === email);
    console.log('Client ID:', clientUser._id);
    
    await req('PUT', `/admin/users/${clientUser._id}`, { action: 'approve' }, adminToken);
    console.log('Client approved');
    
    // Step 3: Client posts event
    console.log('\nStep 3: Client posting event...');
    const clientLogin = await req('POST','/auth/login', { email, password: pass });
    const clientToken = clientLogin.data.token;
    const eventRes = await req('POST','/client/events',{ title: 'Test Event', description: 'desc', date: '2025-12-01', location: 'Test' }, clientToken);
    const eventId = eventRes.data.event._id;
    console.log('Event ID:', eventId);
    
    // Check DB before approval
    const clientBefore = await User.findById(clientUser._id);
    console.log('\nBefore approval - Client notifications count:', clientBefore.notifications.length);
    console.log('Before approval - Event postedBy:', clientBefore._id);
    
    // Step 4: Admin approves event
    console.log('\nStep 4: Admin approving event...');
    console.log('Calling: PUT /admin/events/' + eventId);
    const approveRes = await req('PUT', `/admin/events/${eventId}`, { action: 'approve' }, adminToken);
    console.log('Approve response status:', approveRes.status);
    console.log('Approve response:', approveRes.data);
    
    // Small delay to ensure DB write
    await new Promise(r => setTimeout(r, 500));
    
    // Check DB after approval - DIRECTLY
    console.log('\nDirect DB query after approval:');
    const clientAfter = await User.findById(clientUser._id);
    console.log('After approval - Client notifications count:', clientAfter.notifications.length);
    console.log('After approval - Notifications:', JSON.stringify(clientAfter.notifications, null, 2));
    
    const event = await Event.findById(eventId);
    console.log('\nEvent after approval:');
    console.log('Event ID:', event._id);
    console.log('Event postedBy:', event.postedBy);
    console.log('Event status:', event.status);
    console.log('Event postedBy type:', typeof event.postedBy);
    console.log('clientUser._id type:', typeof clientUser._id);
    console.log('Are they equal?', event.postedBy.toString() === clientUser._id.toString());
    
    // Also check API response
    console.log('\nAPI response test:');
    const apiNotif = await req('GET','/auth/notifications', null, clientToken);
    console.log('GET /auth/notifications status:', apiNotif.status);
    console.log('Notifications from API:', apiNotif.data);
    
    await mongoose.connection.close();
    process.exit(0);
  }catch(e){ 
    console.error('ERROR:', e.message);
    console.error(e);
    process.exit(1);
  } 
})();
