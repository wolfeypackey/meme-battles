const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function setup() {
  try {
    console.log('\n=== STEP 1: Fix Token Pyth IDs ===\n');

    // Fix JUP
    await pool.query(`
      UPDATE tokens
      SET pyth_price_id = '0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996'
      WHERE symbol = 'JUP'
    `);
    console.log('✅ Updated JUP Pyth ID');

    // Add PYTH
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
    console.log('✅ Added/Updated PYTH token');

    console.log('\n=== STEP 2: Create 3 New Battles ===\n');

    // Battle 1: BONK vs WIF
    const battle1 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        NOW() + INTERVAL '5 minutes',
        NOW() + INTERVAL '95 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id
    `);
    console.log(`✅ Created Battle 1: BONK vs WIF (${battle1.rows[0].id})`);

    // Battle 2: SOL vs JUP
    const battle2 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'So11111111111111111111111111111111111111112',
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        NOW() + INTERVAL '10 minutes',
        NOW() + INTERVAL '100 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id
    `);
    console.log(`✅ Created Battle 2: SOL vs JUP (${battle2.rows[0].id})`);

    // Battle 3: WIF vs PYTH
    const battle3 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        NOW() + INTERVAL '15 minutes',
        NOW() + INTERVAL '105 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id
    `);
    console.log(`✅ Created Battle 3: WIF vs PYTH (${battle3.rows[0].id})`);

    console.log('\n=== STEP 3: Verify Setup ===\n');

    const battles = await pool.query(`
      SELECT
        b.id,
        ta.symbol as token_a_symbol,
        tb.symbol as token_b_symbol,
        b.starts_at,
        b.ends_at,
        b.status
      FROM battles b
      JOIN tokens ta ON b.token_a = ta.mint
      JOIN tokens tb ON b.token_b = tb.mint
      WHERE b.created_by = 'admin'
      ORDER BY b.starts_at DESC
      LIMIT 3
    `);

    console.log('Latest battles:');
    battles.rows.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.token_a_symbol} vs ${b.token_b_symbol} - ${b.status}`);
      console.log(`     Starts: ${b.starts_at}`);
    });

    console.log('\n✅ Setup complete! All battles use verified Pyth price feeds.\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

setup();
