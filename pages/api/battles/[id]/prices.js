import { query } from '../../../../lib/db';
import { getPythLatestPrice, calculatePctChange } from '../../../../lib/pyth';

/**
 * GET /api/battles/[id]/prices
 * Returns current live prices and performance for both tokens in a battle
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get battle details with token info
    const result = await query(
      `SELECT
         b.id,
         b.status,
         b.starts_at,
         b.ends_at,
         b.price_a_start,
         b.price_b_start,
         ta.symbol as token_a_symbol,
         ta.name as token_a_name,
         ta.pyth_price_id as token_a_pyth_id,
         tb.symbol as token_b_symbol,
         tb.name as token_b_name,
         tb.pyth_price_id as token_b_pyth_id
       FROM battles b
       JOIN tokens ta ON b.token_a = ta.mint
       JOIN tokens tb ON b.token_b = tb.mint
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const battle = result.rows[0];

    // Only fetch live prices for active battles
    if (battle.status !== 'active') {
      return res.status(400).json({
        error: 'Battle not active',
        status: battle.status
      });
    }

    // Fetch current prices from Pyth
    const [priceACurrent, priceBCurrent] = await Promise.all([
      getPythLatestPrice(battle.token_a_pyth_id),
      getPythLatestPrice(battle.token_b_pyth_id),
    ]);

    if (!priceACurrent || !priceBCurrent) {
      return res.status(503).json({
        error: 'Unable to fetch current prices',
        priceACurrent,
        priceBCurrent
      });
    }

    // Calculate percentage changes from battle start
    const priceAStart = battle.price_a_start ? parseFloat(battle.price_a_start) : null;
    const priceBStart = battle.price_b_start ? parseFloat(battle.price_b_start) : null;

    const deltaA = priceAStart ? calculatePctChange(priceAStart, priceACurrent) : null;
    const deltaB = priceBStart ? calculatePctChange(priceBStart, priceBCurrent) : null;

    // Determine who's currently winning
    let currentLeader = null;
    if (deltaA !== null && deltaB !== null) {
      if (Math.abs(deltaA - deltaB) < 0.10) {
        currentLeader = 'TIE';
      } else if (deltaA > deltaB) {
        currentLeader = 'A';
      } else {
        currentLeader = 'B';
      }
    }

    return res.status(200).json({
      battleId: id,
      status: battle.status,
      startsAt: battle.starts_at,
      endsAt: battle.ends_at,
      tokenA: {
        symbol: battle.token_a_symbol,
        name: battle.token_a_name,
        priceStart: priceAStart,
        priceCurrent: priceACurrent,
        deltaPercent: deltaA,
      },
      tokenB: {
        symbol: battle.token_b_symbol,
        name: battle.token_b_name,
        priceStart: priceBStart,
        priceCurrent: priceBCurrent,
        deltaPercent: deltaB,
      },
      currentLeader,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching battle prices:', error);
    return res.status(500).json({ error: 'Failed to fetch prices' });
  }
}
