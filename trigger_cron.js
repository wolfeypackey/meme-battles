// Manually trigger the cron job to activate battles
const https = require('https');

const CRON_SECRET = 'VbhQiwOWPAFQglNFl150Y1JfJJ16JJzYSXI+Cw6gtb4=';

// Get app URL from command line or use default
const appUrl = process.argv[2] || 'https://meme-battles.vercel.app';

console.log(`Triggering cron job at: ${appUrl}/api/cron/manage-battles\n`);

const url = new URL('/api/cron/manage-battles', appUrl);

const options = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`
  }
};

const req = https.request(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
