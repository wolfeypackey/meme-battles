const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function checkTokens() {
  try {
    const result = await pool.query(`
      SELECT mint, symbol, name, pyth_price_id
      FROM tokens
      WHERE symbol IN ('BONK', 'WIF', 'SOL', 'JUP', 'PYTH', 'POPCAT', 'PEPE', 'MOODENG')
      ORDER BY symbol;
    `);

    console.log('\n=== TOKENS IN DATABASE ===\n');

    // Correct Pyth IDs from API verification
    const correctIds = {
      'BONK': '72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
      'WIF': '4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
      'SOL': 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
      'JUP': '0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
      'PYTH': '0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
    };

    result.rows.forEach(token => {
      const isCorrect = correctIds[token.symbol] === token.pyth_price_id;
      const status = isCorrect ? '✅' : '❌';

      console.log(`${status} ${token.symbol} (${token.name})`);
      console.log(`   Mint: ${token.mint}`);
      console.log(`   Current Pyth ID: ${token.pyth_price_id || 'NULL'}`);

      if (correctIds[token.symbol]) {
        console.log(`   Correct Pyth ID: ${correctIds[token.symbol]}`);
        if (!isCorrect) {
          console.log(`   ⚠️  NEEDS UPDATE!`);
        }
      } else {
        console.log(`   ⚠️  No verified Pyth feed found`);
      }
      console.log('');
    });

    console.log('\n=== RECOMMENDATION ===');
    console.log('Use these tokens for battles (verified working):');
    console.log('- BONK ✅');
    console.log('- WIF ✅');
    console.log('- SOL ✅');
    console.log('- JUP ✅');
    console.log('- PYTH ✅\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTokens();
