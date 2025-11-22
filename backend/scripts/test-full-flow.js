const http = require('http');

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
  const startTime = Date.now();
  try{
    console.log('Creating test client...');
    const email = `client+${Date.now()}@test.com`;
    const regRes = await req('POST','/auth/register',{ name: 'Test', email, password: 'pass123', role: 'client' });
    console.log('Register response:', regRes.status);
    if (regRes.status !== 201) throw new Error('Register failed: ' + JSON.stringify(regRes.data));
    
    console.log('Admin logging in...');
    const adminLogin = await req('POST','/auth/login',{ email: 'admin@admin.com', password: 'admin@admin' });
    console.log('Admin login response:', adminLogin.status);
    if (adminLogin.status !== 200) throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
    const adminToken = adminLogin.data.token;
    
    console.log('Getting users...');
    const users = await req('GET','/admin/users', null, adminToken);
    console.log('Users response:', users.status);
    const clientUser = users.data.find(u => u.email === email);
    if (!clientUser) throw new Error('Client user not found');
    console.log('Found client:', clientUser._id);
    
    console.log('Approving client user...');
    const approveUserRes = await req('PUT', `/admin/users/${clientUser._id}`, { action: 'approve' }, adminToken);
    console.log('Approve user response:', approveUserRes.status);
    if (approveUserRes.status !== 200) throw new Error('Approve user failed: ' + JSON.stringify(approveUserRes.data));
    
    console.log('Client logging in...');
    const clientLogin = await req('POST','/auth/login', { email, password: 'pass123' });
    console.log('Client login response:', clientLogin.status);
    if (clientLogin.status !== 200) throw new Error('Client login failed: ' + JSON.stringify(clientLogin.data));
    const clientToken = clientLogin.data.token;
    
    console.log('Client posting event...');
    const eventRes = await req('POST','/client/events',{ title: 'Test Event', description: 'desc', date: '2025-12-01', location: 'Test' }, clientToken);
    console.log('Post event response:', eventRes.status);
    if (eventRes.status !== 201) throw new Error('Post event failed: ' + JSON.stringify(eventRes.data));
    const eventId = eventRes.data.event._id;
    console.log('Event ID:', eventId);
    
    console.log('Admin approving event...');
    const approveRes = await req('PUT', `/admin/events/${eventId}`, { action: 'approve' }, adminToken);
    console.log('Approve event response:', approveRes.status);
    if (approveRes.status !== 200) throw new Error('Approve event failed: ' + JSON.stringify(approveRes.data));
    console.log('Event approved response:', approveRes.data);
    
    // Wait a bit for DB to sync
    console.log('Waiting for DB write...');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('Fetching client notifications...');
    const notifRes = await req('GET','/auth/notifications', null, clientToken);
    console.log('Get notifications response:', notifRes.status);
    if (notifRes.status !== 200) throw new Error('Get notifications failed: ' + JSON.stringify(notifRes.data));
    
    console.log('\n✅ SUCCESS!');
    console.log('Notifications count:', notifRes.data.length);
    console.log('Notifications:', JSON.stringify(notifRes.data, null, 2));
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\nCompleted in ${totalTime.toFixed(2)}s`);
    
    setTimeout(() => process.exit(0), 500);
  }catch(e){ 
    console.error('\n❌ ERROR:', e.message);
    console.error(e.stack);
    setTimeout(() => process.exit(1), 500);
  } 
})().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
