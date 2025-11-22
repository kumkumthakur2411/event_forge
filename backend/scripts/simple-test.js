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
    // Create and approve a quick event
    const email = `client+${Date.now()}@test.com`;
    const regRes = await req('POST','/auth/register',{ name: 'Test', email, password: 'pass123', role: 'client' });
    const adminLogin = await req('POST','/auth/login',{ email: 'admin@admin.com', password: 'admin@admin' });
    const adminToken = adminLogin.data.token;
    const users = await req('GET','/admin/users', null, adminToken);
    const clientUser = users.data.find(u => u.email === email);
    await req('PUT', `/admin/users/${clientUser._id}`, { action: 'approve' }, adminToken);
    const clientLogin = await req('POST','/auth/login', { email, password: 'pass123' });
    const clientToken = clientLogin.data.token;
    const eventRes = await req('POST','/client/events',{ title: 'Test Event', description: 'desc', date: '2025-12-01', location: 'Test' }, clientToken);
    const eventId = eventRes.data.event._id;
    
    console.log('\n==== APPROVING EVENT ====');
    console.log('Event ID:', eventId);
    const approveRes = await req('PUT', `/admin/events/${eventId}`, { action: 'approve' }, adminToken);
    console.log('Approve response:', approveRes.data);
    
    // Check notifications
    await new Promise(r => setTimeout(r, 500));
    const notifRes = await req('GET','/auth/notifications', null, clientToken);
    console.log('\nNotifications count:', notifRes.data.length);
    console.log('Notifications:', JSON.stringify(notifRes.data, null, 2));
    
    process.exit(0);
  }catch(e){ 
    console.error('ERROR:', e);
    process.exit(1);
  } 
})();
