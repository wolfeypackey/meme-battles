const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createBattles() {
  try {
    console.log('\n=== Create 3 Scheduled Battles ===\n');
    console.log('Verified tokens with working Pyth price feeds:');
    console.log('1. BONK (Bonk)');
    console.log('2. WIF (dogwifhat)');
    console.log('3. SOL (Solana)');
    console.log('4. JUP (Jupiter)');
    console.log('5. PYTH (Pyth Network)\n');

    const answer = await ask('When should battles start? (1=5min, 2=10min, 3=Custom): ');

    let startIntervals = ['5 minutes', '10 minutes', '15 minutes'];

    if (answer === '3') {
      const min1 = await ask('Battle 1 starts in how many minutes? ');
      const min2 = await ask('Battle 2 starts in how many minutes? ');
      const min3 = await ask('Battle 3 starts in how many minutes? ');
      startIntervals = [`${min1} minutes`, `${min2} minutes`, `${min3} minutes`];
    } else if (answer === '2') {
      startIntervals = ['10 minutes', '20 minutes', '30 minutes'];
    }

    console.log('\n=== Creating Battles ===\n');

    // Battle 1: BONK vs WIF
    const battle1 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        NOW() + INTERVAL '${startIntervals[0]}',
        NOW() + INTERVAL '${startIntervals[0]}' + INTERVAL '90 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 1: BONK vs WIF`);
    console.log(`   Starts: ${battle1.rows[0].starts_at}`);
    console.log(`   Ends: ${battle1.rows[0].ends_at}\n`);

    // Battle 2: SOL vs JUP
    const battle2 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'So11111111111111111111111111111111111111112',
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        NOW() + INTERVAL '${startIntervals[1]}',
        NOW() + INTERVAL '${startIntervals[1]}' + INTERVAL '90 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 2: SOL vs JUP`);
    console.log(`   Starts: ${battle2.rows[0].starts_at}`);
    console.log(`   Ends: ${battle2.rows[0].ends_at}\n`);

    // Battle 3: WIF vs PYTH
    const battle3 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        NOW() + INTERVAL '${startIntervals[2]}',
        NOW() + INTERVAL '${startIntervals[2]}' + INTERVAL '90 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 3: WIF vs PYTH`);
    console.log(`   Starts: ${battle3.rows[0].starts_at}`);
    console.log(`   Ends: ${battle3.rows[0].ends_at}\n`);

    console.log('✅ All battles created successfully!\n');
    console.log('Note: Run `node activate_battles.js` after start times to activate them.');
    console.log('Or enable the Vercel cron job for automatic activation.\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

createBattles();
