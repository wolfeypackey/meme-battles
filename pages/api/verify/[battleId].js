import { query } from '../../../lib/db';

/**
 * Verification endpoint - returns exact inputs and outputs used for settlement
 * This allows anyone to independently verify battle results
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { battleId } = req.query;

  try {
    const result = await query(
      `SELECT
         b.*,
         ta.symbol as token_a_symbol,
         ta.pyth_price_id as token_a_pyth_id,
         tb.symbol as token_b_symbol,
         tb.pyth_price_id as token_b_pyth_id
       FROM battles b
       JOIN tokens ta ON b.token_a = ta.mint
       JOIN tokens tb ON b.token_b = tb.mint
       WHERE b.id = $1`,
      [battleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const battle = result.rows[0];

    if (battle.status !== 'settled' && battle.status !== 'void') {
      return res.status(400).json({ error: 'Battle not yet settled' });
    }

    // Return verification data
    const verification = {
      battleId: battle.id,
      tokens: {
        a: {
          mint: battle.token_a,
          symbol: battle.token_a_symbol,
          pythPriceId: battle.token_a_pyth_id,
        },
        b: {
          mint: battle.token_b,
          symbol: battle.token_b_symbol,
          pythPriceId: battle.token_b_pyth_id,
        },
      },
      timeWindow: {
        startsAt: battle.starts_at,
        endsAt: battle.ends_at,
        startsAtUnix: Math.floor(new Date(battle.starts_at).getTime() / 1000),
        endsAtUnix: Math.floor(new Date(battle.ends_at).getTime() / 1000),
      },
      prices: {
        tokenA: {
          start: parseFloat(battle.price_a_start),
          end: parseFloat(battle.price_a_end),
        },
        tokenB: {
          start: parseFloat(battle.price_b_start),
          end: parseFloat(battle.price_b_end),
        },
      },
      deltas: {
        tokenA: parseFloat(battle.delta_a_pct),
        tokenB: parseFloat(battle.delta_b_pct),
      },
      result: {
        winner: battle.winner_token,
        winnerSymbol: battle.winner_token === battle.token_a ? battle.token_a_symbol : battle.token_b_symbol,
        reason: battle.settle_reason,
        settledAt: battle.settled_at,
      },
      config: {
        tieThresholdBps: parseInt(process.env.TIE_BPS || '10', 10),
        tieThresholdPct: parseInt(process.env.TIE_BPS || '10', 10) / 100,
      },
      verification: {
        pythEndpoint: process.env.PYTH_ENDPOINT || 'https://hermes.pyth.network',
        howToVerify: [
          '1. Fetch Pyth prices for both tokens at startsAtUnix and endsAtUnix',
          '2. Calculate % change for each: ((end - start) / start) * 100',
          '3. If |deltaA - deltaB| < tieThresholdPct, result is TIE',
          '4. Otherwise, winner is token with higher delta',
        ],
      },
    };

    return res.status(200).json(verification);
  } catch (error) {
    console.error('Error fetching verification data:', error);
    return res.status(500).json({ error: 'Failed to fetch verification data' });
  }
}
