const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function addBattles() {
  try {
    console.log('\n=== Adding 3 Scheduled Battles ===\n');
    console.log('Using verified tokens: BONK, WIF, SOL, JUP, PYTH');
    console.log('All battles will be 90 minutes long\n');

    // First, make sure JUP and PYTH have correct Pyth IDs
    console.log('Fixing token Pyth IDs...');

    await pool.query(`
      UPDATE tokens
      SET pyth_price_id = '0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996'
      WHERE symbol = 'JUP'
    `);

    await pool.query(`
      INSERT INTO tokens (mint, symbol, name, pyth_price_id)
      VALUES (
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        'PYTH',
        'Pyth Network',
        '0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff'
      )
      ON CONFLICT (mint) DO UPDATE
      SET pyth_price_id = EXCLUDED.pyth_price_id
    `);

    console.log('✅ Token Pyth IDs updated\n');

    // Battle 1: BONK vs WIF (starts in 30 minutes)
    const battle1 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        NOW() + INTERVAL '30 minutes',
        NOW() + INTERVAL '120 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 1: BONK vs WIF`);
    console.log(`   Starts: ${battle1.rows[0].starts_at}`);
    console.log(`   Ends: ${battle1.rows[0].ends_at}\n`);

    // Battle 2: SOL vs JUP (starts in 45 minutes)
    const battle2 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'So11111111111111111111111111111111111111112',
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        NOW() + INTERVAL '45 minutes',
        NOW() + INTERVAL '135 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 2: SOL vs JUP`);
    console.log(`   Starts: ${battle2.rows[0].starts_at}`);
    console.log(`   Ends: ${battle2.rows[0].ends_at}\n`);

    // Battle 3: JUP vs PYTH (starts in 60 minutes)
    const battle3 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        NOW() + INTERVAL '60 minutes',
        NOW() + INTERVAL '150 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 3: JUP vs PYTH`);
    console.log(`   Starts: ${battle3.rows[0].starts_at}`);
    console.log(`   Ends: ${battle3.rows[0].ends_at}\n`);

    console.log('=== Summary ===');
    console.log('✅ 3 battles created with verified Pyth price feeds');
    console.log('✅ Battles will show on homepage as "Scheduled"');
    console.log('✅ Will auto-activate when start time is reached (if cron enabled)');
    console.log('✅ Or run `node activate_battles.js` manually after start times\n');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

addBattles();
