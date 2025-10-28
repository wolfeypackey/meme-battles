import { query } from '../../../../lib/db';
import { getWalletFromRequest } from '../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const wallet = getWalletFromRequest(req);

  try {
    const result = await query(
      `SELECT
         b.*,
         ta.symbol as token_a_symbol,
         ta.name as token_a_name,
         ta.pyth_price_id as token_a_pyth_id,
         tb.symbol as token_b_symbol,
         tb.name as token_b_name,
         tb.pyth_price_id as token_b_pyth_id,
         COUNT(DISTINCT p.wallet) as prediction_count,
         COUNT(DISTINCT CASE WHEN p.pick = 'A' THEN p.wallet END) as pick_a_count,
         COUNT(DISTINCT CASE WHEN p.pick = 'B' THEN p.wallet END) as pick_b_count
       FROM battles b
       JOIN tokens ta ON b.token_a = ta.mint
       JOIN tokens tb ON b.token_b = tb.mint
       LEFT JOIN predictions p ON b.id = p.battle_id
       WHERE b.id = $1
       GROUP BY b.id, ta.symbol, ta.name, ta.pyth_price_id, tb.symbol, tb.name, tb.pyth_price_id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const battle = result.rows[0];

    // If wallet is provided, include user's prediction
    if (wallet) {
      const predictionResult = await query(
        'SELECT pick FROM predictions WHERE battle_id = $1 AND wallet = $2',
        [id, wallet]
      );

      battle.userPrediction = predictionResult.rows[0]?.pick || null;
    }

    return res.status(200).json(battle);
  } catch (error) {
    console.error('Error fetching battle:', error);
    return res.status(500).json({ error: 'Failed to fetch battle' });
  }
}
