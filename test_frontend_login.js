const http = require('http');

async function testFrontend() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Frontend Status: ' + res.statusCode);
        console.log('Frontend responding: ✓');
        resolve(true);
      });
    });
    req.on('error', reject);
    req.setTimeout(5000);
  });
}

testFrontend().then(() => {
  console.log('Frontend is accessible at http://localhost:3000');
  process.exit(0);
}).catch(err => {
  console.error('Frontend error:', err.message);
  process.exit(1);
});
