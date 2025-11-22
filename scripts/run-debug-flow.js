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
  try{
    console.log('1) Create test client account');
    const email = `testclient+${Date.now()}@example.com`;
    const pass = 'password123';
    let r = await req('POST','/auth/register',{ name: 'Test Client', email, password: pass, role: 'client' });
    console.log(' register:', r.status, r.data.message || r.data);

    // Admin login to approve the new client
    console.log('2) Login as admin to approve client');
    const adminLogin = await req('POST','/auth/login',{ email: 'admin@admin.com', password: 'admin@admin' });
    if(adminLogin.status !== 200) return console.error('admin login failed', adminLogin.data);
    const adminToken = adminLogin.data.token;
    console.log(' admin logged in');

    // Find the created client via admin users endpoint
    const usersRes = await req('GET','/admin/users', null, adminToken);
    const created = usersRes.data.find(u => u.email === email);
    if(!created) return console.error('Created user not found in admin users list');
    console.log(' found created user id', created._id);

    // Approve the client
    const approveUser = await req('PUT', `/admin/users/${created._id}`, { action: 'approve' }, adminToken);
    console.log(' approve user:', approveUser.status, approveUser.data);

    // Now login as client
    const clientLogin = await req('POST','/auth/login', { email, password: pass });
    if(clientLogin.status !== 200) return console.error('client login failed after approval', clientLogin.data);
    const clientToken = clientLogin.data.token;
    console.log(' client logged in');

    // Post event as client
    const postEvent = await req('POST','/client/events',{ title: 'Test Event for Notifications', description: 'desc', date: '2025-12-01', location: 'Test' }, clientToken);
    console.log(' post event:', postEvent.status, postEvent.data.message || postEvent.data);
    const eventId = postEvent.data.event._id;

    // Approve the event as admin
    const approve = await req('PUT', `/admin/events/${eventId}`, { action: 'approve' }, adminToken);
    console.log(' approve event res:', approve.status, approve.data);

    // Fetch client notifications
    const notes = await req('GET','/auth/notifications', null, clientToken);
    console.log(' client notifications status', notes.status);
    console.log(' notifications:', notes.data);

    process.exit(0);
  }catch(e){ console.error('error', e); process.exit(1);} 
})();
