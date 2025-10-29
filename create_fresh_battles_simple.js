const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function createBattles() {
  try {
    console.log('\n=== CREATING 3 NEW SCHEDULED BATTLES ===\n');

    // Fix token Pyth IDs first
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

    console.log('✅ Fixed token Pyth IDs\n');

    // Battle 1
    const b1 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        NOW() + INTERVAL '10 minutes',
        NOW() + INTERVAL '100 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at
    `);
    console.log(`✅ BONK vs WIF - starts ${b1.rows[0].starts_at}`);

    // Battle 2
    const b2 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'So11111111111111111111111111111111111111112',
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        NOW() + INTERVAL '20 minutes',
        NOW() + INTERVAL '110 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at
    `);
    console.log(`✅ SOL vs JUP - starts ${b2.rows[0].starts_at}`);

    // Battle 3
    const b3 = await pool.query(`
      INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
      VALUES (
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        NOW() + INTERVAL '30 minutes',
        NOW() + INTERVAL '120 minutes',
        'scheduled',
        'admin'
      )
      RETURNING id, starts_at
    `);
    console.log(`✅ JUP vs PYTH - starts ${b3.rows[0].starts_at}`);

    console.log('\n✅ DONE! Go to website and click "Scheduled" tab\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createBattles();
