import { query } from '../../../lib/db';
import { getWalletFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetBattles(req, res);
  } else if (req.method === 'POST') {
    return handleCreateBattle(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetBattles(req, res) {
  const { status = 'active', limit = 20 } = req.query;

  try {
    const statusFilter =
      status === 'all'
        ? ''
        : 'WHERE b.status = $1';

    const params = status === 'all' ? [parseInt(limit, 10)] : [status, parseInt(limit, 10)];
    const limitIdx = status === 'all' ? 1 : 2;

    const result = await query(
      `SELECT
         b.id,
         b.token_a,
         b.token_b,
         ta.symbol as token_a_symbol,
         ta.name as token_a_name,
         tb.symbol as token_b_symbol,
         tb.name as token_b_name,
         b.starts_at,
         b.ends_at,
         b.status,
         b.winner_token,
         b.delta_a_pct,
         b.delta_b_pct,
         COUNT(DISTINCT p.wallet) as prediction_count,
         COUNT(DISTINCT CASE WHEN p.pick = 'A' THEN p.wallet END) as pick_a_count,
         COUNT(DISTINCT CASE WHEN p.pick = 'B' THEN p.wallet END) as pick_b_count
       FROM battles b
       JOIN tokens ta ON b.token_a = ta.mint
       JOIN tokens tb ON b.token_b = tb.mint
       LEFT JOIN predictions p ON b.id = p.battle_id
       ${statusFilter}
       GROUP BY b.id, ta.symbol, ta.name, tb.symbol, tb.name
       ORDER BY b.starts_at DESC
       LIMIT $${limitIdx}`,
      params
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching battles:', error);
    return res.status(500).json({ error: 'Failed to fetch battles' });
  }
}

async function handleCreateBattle(req, res) {
  // Admin-only endpoint - in production, verify admin wallet
  const wallet = getWalletFromRequest(req);

  if (!wallet) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { tokenA, tokenB, startsAt, endsAt } = req.body;

  if (!tokenA || !tokenB || !startsAt || !endsAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await query(
      `INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
       VALUES ($1, $2, $3, $4, 'scheduled', $5)
       RETURNING *`,
      [tokenA, tokenB, startsAt, endsAt, wallet]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating battle:', error);
    return res.status(500).json({ error: 'Failed to create battle' });
  }
}
