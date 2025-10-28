import { query } from '../../../../lib/db';
import { settleBattle } from '../../../../lib/pyth';
import { distributeSettlementPoints } from '../../../../lib/points';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get battle details
    const battleResult = await query(
      `SELECT
         b.*,
         ta.pyth_price_id as token_a_pyth_id,
         tb.pyth_price_id as token_b_pyth_id
       FROM battles b
       JOIN tokens ta ON b.token_a = ta.mint
       JOIN tokens tb ON b.token_b = tb.mint
       WHERE b.id = $1`,
      [id]
    );

    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const battle = battleResult.rows[0];

    // Check if already settled
    if (battle.status === 'settled' || battle.status === 'void') {
      return res.status(400).json({ error: 'Battle already settled' });
    }

    // Check if battle has ended
    const now = new Date();
    const endsAt = new Date(battle.ends_at);

    if (now < endsAt) {
      return res.status(400).json({ error: 'Battle has not ended yet' });
    }

    // Update status to settling
    await query('UPDATE battles SET status = $1 WHERE id = $2', ['settling', id]);

    // Audit log: Starting settlement
    await query(
      `INSERT INTO settlement_audit (battle_id, action, data, triggered_by)
       VALUES ($1, $2, $3, $4)`,
      [
        id,
        'FETCH_PRICE',
        JSON.stringify({
          token_a_pyth_id: battle.token_a_pyth_id,
          token_b_pyth_id: battle.token_b_pyth_id,
          starts_at: battle.starts_at,
          ends_at: battle.ends_at,
        }),
        'API',
      ]
    );

    // Fetch prices and determine winner
    const settlement = await settleBattle(
      battle.token_a_pyth_id,
      battle.token_b_pyth_id,
      battle.starts_at,
      battle.ends_at
    );

    // Audit log: Calculation complete
    await query(
      `INSERT INTO settlement_audit (battle_id, action, data, triggered_by)
       VALUES ($1, $2, $3, $4)`,
      [id, 'CALCULATE', JSON.stringify(settlement), 'API']
    );

    let finalStatus = 'settled';
    let winnerToken = null;

    if (settlement.winner === null) {
      // Insufficient data - void the battle
      finalStatus = 'void';
    } else if (settlement.winner === 'TIE') {
      // Tie - no winner
      finalStatus = 'settled';
    } else {
      // Determine winner token mint
      winnerToken = settlement.winner === 'A' ? battle.token_a : battle.token_b;
    }

    // Update battle with settlement data
    await query(
      `UPDATE battles SET
         status = $1,
         winner_token = $2,
         settle_reason = $3,
         price_a_start = $4,
         price_a_end = $5,
         price_b_start = $6,
         price_b_end = $7,
         delta_a_pct = $8,
         delta_b_pct = $9,
         settled_at = NOW()
       WHERE id = $10`,
      [
        finalStatus,
        winnerToken,
        settlement.reason,
        settlement.priceAStart,
        settlement.priceAEnd,
        settlement.priceBStart,
        settlement.priceBEnd,
        settlement.deltaA,
        settlement.deltaB,
        id,
      ]
    );

    // Audit log: Settlement complete
    await query(
      `INSERT INTO settlement_audit (battle_id, action, data, triggered_by)
       VALUES ($1, $2, $3, $4)`,
      [
        id,
        'SETTLE',
        JSON.stringify({ status: finalStatus, winner: settlement.winner }),
        'API',
      ]
    );

    // Distribute points if not void
    if (finalStatus === 'settled' && settlement.winner !== null) {
      await distributeSettlementPoints(id, settlement.winner);

      // Audit log: Points distributed
      await query(
        `INSERT INTO settlement_audit (battle_id, action, data, triggered_by)
         VALUES ($1, $2, $3, $4)`,
        [id, 'DISTRIBUTE', JSON.stringify({ winner: settlement.winner }), 'API']
      );
    }

    return res.status(200).json({
      battleId: id,
      status: finalStatus,
      winner: settlement.winner,
      settlement,
    });
  } catch (error) {
    console.error('Error settling battle:', error);

    // Audit log: Error occurred
    try {
      await query(
        `INSERT INTO settlement_audit (battle_id, action, data, triggered_by)
         VALUES ($1, $2, $3, $4)`,
        [
          id,
          'ERROR',
          JSON.stringify({ error: error.message, stack: error.stack }),
          'API',
        ]
      );
    } catch (auditError) {
      console.error('Failed to log error to audit:', auditError);
    }

    // Mark as void on error
    await query(
      `UPDATE battles SET status = 'void', settle_reason = 'ERROR' WHERE id = $1`,
      [id]
    );

    return res.status(500).json({ error: 'Failed to settle battle' });
  }
}
