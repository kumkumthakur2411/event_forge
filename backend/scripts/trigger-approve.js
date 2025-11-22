const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

dotenv.config({ path: __dirname + '/../../backend/.env' });

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
    // login admin
    const login = await req('POST','/auth/login',{ email: 'admin@admin.com', password: 'admin@admin' });
    if(login.status !== 200) return console.error('admin login failed', login);
    const token = login.data.token;
    console.log('admin logged in');

    // connect to DB and find latest event
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const ev = await Event.findOne({}).sort({createdAt:-1});
    if(!ev) return console.error('no event');
    console.log('Latest event id', ev._id, 'status', ev.status);

    const res = await req('PUT', `/admin/events/${ev._id}`, { action: 'approve' }, token);
    console.log('approve API result', res.status, res.data);

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const owner = await User.findById(ev.postedBy);
    console.log('owner notifications after trigger:', owner.notifications);
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
