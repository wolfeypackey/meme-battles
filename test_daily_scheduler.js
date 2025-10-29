const https = require('https');

const CRON_SECRET = 'VbhQiwOWPAFQglNFl150Y1JfJJ16JJzYSXI+Cw6gtb4=';
const appUrl = process.argv[2] || 'https://meme-battles-pump.vercel.app';

console.log(`\n=== Testing Daily Battle Scheduler ===`);
console.log(`Calling: ${appUrl}/api/cron/schedule-daily-battles\n`);

const url = new URL('/api/cron/schedule-daily-battles', appUrl);

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
    console.log(`Status: ${res.statusCode}\n`);

    try {
      const response = JSON.parse(data);

      if (response.success) {
        console.log(`✅ Success! Created ${response.battlesCreated} battles\n`);

        if (response.results.created.length > 0) {
          console.log('Battles created:');
          response.results.created.forEach((battle, i) => {
            console.log(`${i + 1}. ${battle.matchup}`);
            console.log(`   Starts: ${new Date(battle.startsAt).toLocaleString()}`);
            console.log(`   Ends: ${new Date(battle.endsAt).toLocaleString()}\n`);
          });
        }

        if (response.results.errors.length > 0) {
          console.log('⚠️ Errors:');
          response.results.errors.forEach((error) => {
            console.log(`- ${error.matchup}: ${error.error}`);
          });
        }
      } else {
        console.log('❌ Failed:', response.error);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
