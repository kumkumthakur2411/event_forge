const http = require('http');

function req(method, path, data, token){
  return new Promise((resolve, reject)=>{
    console.log(`[${method}] ${path}`);
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
    console.log('Step 1: Register client');
    const email = `client+${Date.now()}@test.com`;
    const regRes = await req('POST','/auth/register',{ name: 'Test', email, password: 'pass123', role: 'client' });
    console.log('Step 1 result:', regRes.status, regRes.data.message);
    
    if (regRes.status !== 201) {
      console.log('Registration failed, exiting');
      process.exit(1);
    }
    
    console.log('\nStep 2: Admin login');
    const adminLogin = await req('POST','/auth/login',{ email: 'admin@admin.com', password: 'admin@admin' });
    console.log('Step 2 result:', adminLogin.status);
    
    if (adminLogin.status !== 200) {
      console.log('Admin login failed');
      process.exit(1);
    }
    
    console.log('\n✅ SUCCESS - Basic operations work!');
    process.exit(0);
  }catch(e){ 
    console.error('ERROR:', e.message);
    process.exit(1);
  } 
})();
