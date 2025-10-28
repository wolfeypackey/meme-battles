const https = require('https');

function testAPI(status) {
  return new Promise((resolve, reject) => {
    const url = `https://meme-battles-pump.vercel.app/api/battles?status=${status}`;

    console.log(`\nTesting: ${url}`);

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`Response:`, JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log(`Raw response:`, data);
          reject(e);
        }
      });
    }).on('error', (e) => {
      console.error(`Error:`, e.message);
      reject(e);
    });
  });
}

async function runTests() {
  console.log('=== Testing Battles API ===\n');

  await testAPI('active');
  await testAPI('scheduled');
  await testAPI('all');
}

runTests();
