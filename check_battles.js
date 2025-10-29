const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkBattles() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        status,
        starts_at,
        ends_at,
        NOW() as current_time,
        token_a,
        token_b,
        price_a_start,
        price_b_start
      FROM battles
      ORDER BY starts_at;
    `);

    console.log('\n=== BATTLES IN DATABASE ===');
    console.log(`Total battles found: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('❌ NO BATTLES FOUND IN DATABASE');
      console.log('The INSERT statements may not have executed successfully.\n');
    } else {
      result.rows.forEach((battle, i) => {
        console.log(`Battle ${i + 1}:`);
        console.log(`  ID: ${battle.id}`);
        console.log(`  Status: ${battle.status}`);
        console.log(`  Token A: ${battle.token_a}`);
        console.log(`  Token B: ${battle.token_b}`);
        console.log(`  Starts: ${battle.starts_at}`);
        console.log(`  Ends: ${battle.ends_at}`);
        console.log(`  Price A Start: ${battle.price_a_start || 'NOT SET'}`);
        console.log(`  Price B Start: ${battle.price_b_start || 'NOT SET'}`);
        console.log(`  Current DB time: ${battle.current_time}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error querying database:', error.message);
  } finally {
    await pool.end();
  }
}

checkBattles();
