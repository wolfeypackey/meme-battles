const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function activateBattles() {
  try {
    // Update battles that should be active
    const result = await pool.query(`
      UPDATE battles
      SET status = 'active'
      WHERE status = 'scheduled'
      AND starts_at <= NOW()
      RETURNING id, token_a, token_b, starts_at;
    `);

    console.log('\n=== ACTIVATED BATTLES ===');
    console.log(`Updated ${result.rows.length} battle(s) to active status:\n`);

    result.rows.forEach((battle, i) => {
      console.log(`Battle ${i + 1}:`);
      console.log(`  ID: ${battle.id}`);
      console.log(`  Started: ${battle.starts_at}`);
      console.log('');
    });

    // Show all current battles
    const allBattles = await pool.query(`
      SELECT id, status, starts_at, ends_at
      FROM battles
      ORDER BY starts_at;
    `);

    console.log('=== ALL BATTLES ===');
    allBattles.rows.forEach((battle, i) => {
      console.log(`Battle ${i + 1}: ${battle.status} (starts: ${battle.starts_at})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

activateBattles();
