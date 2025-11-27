const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/public/categories',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const cats = JSON.parse(data);
      console.log('✓ API Response received');
      console.log(`✓ Categories found: ${cats.length}`);
      cats.forEach((cat, i) => {
        console.log(`\n${i+1}. ${cat.name}`);
        console.log(`   ImageUrl: ${cat.imageUrl}`);
        console.log(`   Images count: ${cat.images ? cat.images.length : 0}`);
        if (cat.images && cat.images.length > 0) {
          console.log(`   First image URL: ${cat.images[0].url}`);
          const hasDoubleSlash = cat.images[0].url.includes('//uploads');
          console.log(`   ✓ No double slash: ${!hasDoubleSlash}`);
        }
      });
      process.exit(0);
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`Connection error: ${e.message}`);
  process.exit(1);
});

req.end();
