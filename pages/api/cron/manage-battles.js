import { query } from '../../../lib/db';
import { settleBattle as settleBattleLib } from '../../../lib/pyth';
import { distributeSettlementPoints } from '../../../lib/points';

/**
 * Cron job to manage battle lifecycle
 * Runs every minute to:
 * 1. Activate scheduled battles that have started
 * 2. Settle battles that have ended
 */
export default async function handler(req, res) {
  // Verify this is called from Vercel Cron or authorized source
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = {
    activated: [],
    settled: [],
    errors: [],
  };

  try {
    const now = new Date();

    // 1. Activate scheduled battles
    const scheduledBattles = await query(
      `SELECT id FROM battles
       WHERE status = 'scheduled' AND starts_at <= $1`,
      [now]
    );

    for (const battle of scheduledBattles.rows) {
      try {
        await query(
          'UPDATE battles SET status = $1 WHERE id = $2',
          ['active', battle.id]
        );
        results.activated.push(battle.id);
        console.log(`Activated battle ${battle.id}`);
      } catch (error) {
        console.error(`Error activating battle ${battle.id}:`, error);
        results.errors.push({ battleId: battle.id, action: 'activate', error: error.message });
      }
    }

    // 2. Settle battles that have ended
    const endedBattles = await query(
      `SELECT
         b.id,
         b.token_a,
         b.token_b,
         b.starts_at,
         b.ends_at,
         ta.pyth_price_id as token_a_pyth_id,
         tb.pyth_price_id as token_b_pyth_id
       FROM battles b
       JOIN tokens ta ON b.token_a = ta.mint
       JOIN tokens tb ON b.token_b = tb.mint
       WHERE b.status = 'active' AND b.ends_at <= $1`,
      [now]
    );

    for (const battle of endedBattles.rows) {
      try {
        console.log(`Settling battle ${battle.id}...`);

        // Update to settling status
        await query('UPDATE battles SET status = $1 WHERE id = $2', ['settling', battle.id]);

        // Fetch prices and determine winner
        const settlement = await settleBattleLib(
          battle.token_a_pyth_id,
          battle.token_b_pyth_id,
          battle.starts_at,
          battle.ends_at
        );

        let finalStatus = 'settled';
        let winnerToken = null;

        if (settlement.winner === null) {
          finalStatus = 'void';
        } else if (settlement.winner !== 'TIE') {
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
            battle.id,
          ]
        );

        // Distribute points if not void
        if (finalStatus === 'settled' && settlement.winner !== null) {
          await distributeSettlementPoints(battle.id, settlement.winner);
        }

        results.settled.push({
          battleId: battle.id,
          status: finalStatus,
          winner: settlement.winner,
        });

        console.log(`Settled battle ${battle.id} - Winner: ${settlement.winner}`);
      } catch (error) {
        console.error(`Error settling battle ${battle.id}:`, error);

        // Mark as void on error
        await query(
          `UPDATE battles SET status = 'void', settle_reason = 'ERROR' WHERE id = $1`,
          [battle.id]
        );

        results.errors.push({
          battleId: battle.id,
          action: 'settle',
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      results,
    });
  }
}
