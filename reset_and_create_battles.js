const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function resetAndCreate() {
  try {
    console.log('\n=== RESETTING BATTLES ===\n');

    // Step 1: Delete all existing battles
    const deleteResult = await pool.query('DELETE FROM battles');
    console.log(`✅ Deleted ${deleteResult.rowCount} old battle(s)\n`);

    // Step 2: Fix token Pyth IDs
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

    console.log('=== CREATING 3 NEW BATTLES ===\n');

    // Battle 1: BONK vs WIF (starts in 10 minutes)
    const battle1 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        NOW() + INTERVAL '10 minutes',
        NOW() + INTERVAL '100 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 1: BONK vs WIF`);
    console.log(`   ID: ${battle1.rows[0].id}`);
    console.log(`   Status: scheduled`);
    console.log(`   Starts: ${battle1.rows[0].starts_at}`);
    console.log(`   Ends: ${battle1.rows[0].ends_at}\n`);

    // Battle 2: SOL vs JUP (starts in 20 minutes)
    const battle2 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'So11111111111111111111111111111111111111112',
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        NOW() + INTERVAL '20 minutes',
        NOW() + INTERVAL '110 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 2: SOL vs JUP`);
    console.log(`   ID: ${battle2.rows[0].id}`);
    console.log(`   Status: scheduled`);
    console.log(`   Starts: ${battle2.rows[0].starts_at}`);
    console.log(`   Ends: ${battle2.rows[0].ends_at}\n`);

    // Battle 3: JUP vs PYTH (starts in 30 minutes)
    const battle3 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        NOW() + INTERVAL '30 minutes',
        NOW() + INTERVAL '120 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at, ends_at
    `);
    console.log(`✅ Battle 3: JUP vs PYTH`);
    console.log(`   ID: ${battle3.rows[0].id}`);
    console.log(`   Status: scheduled`);
    console.log(`   Starts: ${battle3.rows[0].starts_at}`);
    console.log(`   Ends: ${battle3.rows[0].ends_at}\n`);

    console.log('=== VERIFICATION ===\n');

    // Verify
    const check = await pool.query(`
      SELECT
        b.id,
        ta.symbol as token_a,
        tb.symbol as token_b,
        b.status,
        b.starts_at,
        NOW() as current_time
      FROM battles b
      JOIN tokens ta ON b.token_a = ta.mint
      JOIN tokens tb ON b.token_b = tb.mint
      ORDER BY b.starts_at
    `);

    console.log(`Total battles: ${check.rows.length}\n`);
    check.rows.forEach((b, i) => {
      console.log(`${i+1}. ${b.token_a} vs ${b.token_b} - Status: ${b.status}`);
    });

    console.log('\n✅ COMPLETE!');
    console.log('\nGo to your website and:');
    console.log('1. Click "Scheduled" tab - you should see 3 battles');
    console.log('2. Wait 10-30 minutes for them to start');
    console.log('3. Run `node activate_battles.js` to activate them (or enable cron)\n');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

resetAndCreate();
