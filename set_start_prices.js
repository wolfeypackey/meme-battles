const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_DsvzFd7ohWc8@ep-blue-snow-a40zmjjc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

const PYTH_ENDPOINT = 'https://hermes.pyth.network';

async function getPythLatestPrice(priceId) {
  try {
    const url = `${PYTH_ENDPOINT}/v2/updates/price/latest`;
    const response = await axios.get(url, {
      params: {
        ids: [priceId],
        parsed: true,
      },
      timeout: 10000,
    });

    if (response.data?.parsed?.[0]?.price?.price) {
      const price = parseFloat(response.data.parsed[0].price.price);
      const expo = response.data.parsed[0].price.expo;
      return price * Math.pow(10, expo);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching latest Pyth price for ${priceId}:`, error.message);
    return null;
  }
}

async function setStartPrices() {
  try {
    // Get active battles without start prices
    const result = await pool.query(`
      SELECT
        b.id,
        ta.pyth_price_id as token_a_pyth_id,
        tb.pyth_price_id as token_b_pyth_id,
        ta.symbol as token_a_symbol,
        tb.symbol as token_b_symbol
      FROM battles b
      JOIN tokens ta ON b.token_a = ta.mint
      JOIN tokens tb ON b.token_b = tb.mint
      WHERE b.status = 'active'
      AND (b.price_a_start IS NULL OR b.price_b_start IS NULL)
    `);

    console.log(`\n=== SETTING START PRICES ===`);
    console.log(`Found ${result.rows.length} battles needing start prices\n`);

    for (const battle of result.rows) {
      console.log(`Processing battle ${battle.id} (${battle.token_a_symbol} vs ${battle.token_b_symbol})...`);

      // Fetch current prices (will be used as "start" prices retroactively)
      const [priceAStart, priceBStart] = await Promise.all([
        getPythLatestPrice(battle.token_a_pyth_id),
        getPythLatestPrice(battle.token_b_pyth_id),
      ]);

      if (!priceAStart || !priceBStart) {
        console.log(`  ❌ Failed to fetch prices`);
        continue;
      }

      console.log(`  ${battle.token_a_symbol} price: $${priceAStart}`);
      console.log(`  ${battle.token_b_symbol} price: $${priceBStart}`);

      // Update battle with start prices
      await pool.query(
        `UPDATE battles
         SET price_a_start = $1, price_b_start = $2
         WHERE id = $3`,
        [priceAStart, priceBStart, battle.id]
      );

      console.log(`  ✅ Start prices set!\n`);
    }

    console.log('=== DONE ===\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

setStartPrices();
