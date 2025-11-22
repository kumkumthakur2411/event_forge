const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../backend/models/User');

dotenv.config({ path: 'c:/Users/DELL/Desktop/event_forge/backend/.env' });

function req(method, path, data, token){
  return new Promise((resolve, reject)=>{
    const options = {
      hostname: 'localhost', port: 5000, path: `/api${path}`, method, headers: { 'Content-Type': 'application/json' }
    };
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
    const login = await req('POST','/auth/login',{ email: process.env.ADMIN_EMAIL || 'admin@admin.com', password: process.env.ADMIN_PASSWORD || 'admin@admin' });
    if(login.status !== 200) return console.error('Login failed', login.data);
    const token = login.data.token;
    console.log('Admin logged in');

    const eventsRes = await req('GET','/admin/events', null, token);
    if(eventsRes.status !== 200) return console.error('Failed to fetch events', eventsRes.data);
    const pending = eventsRes.data.find(e=> e.status === 'pending');
    if(!pending) { console.log('No pending events'); process.exit(0); }
    console.log('Pending event:', pending._id, pending.title);

    const approveRes = await req('PUT', `/admin/events/${pending._id}`, { action: 'approve' }, token);
    console.log('Approve result:', approveRes.status, approveRes.data);

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const owner = await User.findById(pending.postedBy);
    console.log('Owner notifications:', owner.notifications);
    process.exit(0);
  }catch(e){ console.error('Error', e); process.exit(1); }
})();
