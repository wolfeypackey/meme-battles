import { query } from './db.js';
import { generatePointsHMAC } from './auth.js';

// Points configuration
const POINTS_CONFIG = {
  JOIN_BONUS: parseInt(process.env.JOIN_BONUS || '50', 10),
  PREDICT_PARTICIPATE: parseInt(process.env.PREDICT_PARTICIPATE || '10', 10),
  PREDICT_WIN: parseInt(process.env.PREDICT_WIN || '100', 10),
  PREDICT_LOSS: parseInt(process.env.PREDICT_LOSS || '0', 10),
};

/**
 * Award points to a wallet
 */
export async function awardPoints(wallet, delta, reason, battleId = null) {
  const createdAt = new Date().toISOString();
  const hmac = generatePointsHMAC(wallet, delta, reason, battleId, createdAt);

  const client = await query('BEGIN');

  try {
    // Insert into ledger
    await query(
      `INSERT INTO points_ledger (wallet, delta, reason, battle_id, hmac, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [wallet, delta, reason, battleId, hmac, createdAt]
    );

    // Update user's total points
    await query(
      `INSERT INTO users (wallet, points)
       VALUES ($1, $2)
       ON CONFLICT (wallet)
       DO UPDATE SET points = users.points + $2`,
      [wallet, delta]
    );

    await query('COMMIT');

    return { success: true, newDelta: delta };
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Award join bonus if user is new
 */
export async function awardJoinBonusIfNew(wallet) {
  // Check if user already exists
  const result = await query('SELECT wallet FROM users WHERE wallet = $1', [wallet]);

  if (result.rows.length === 0) {
    await awardPoints(wallet, POINTS_CONFIG.JOIN_BONUS, 'JOIN_BONUS');
    return true;
  }

  return false;
}

/**
 * Award participation points when prediction is made
 */
export async function awardParticipationPoints(wallet, battleId) {
  await awardPoints(wallet, POINTS_CONFIG.PREDICT_PARTICIPATE, 'PREDICT_PARTICIPATE', battleId);
}

/**
 * Distribute points after battle settlement
 */
export async function distributeSettlementPoints(battleId, winner) {
  // Get all predictions for this battle
  const predictions = await query(
    'SELECT wallet, pick FROM predictions WHERE battle_id = $1',
    [battleId]
  );

  const winPoints = POINTS_CONFIG.PREDICT_WIN;
  const losePoints = POINTS_CONFIG.PREDICT_LOSS;

  for (const prediction of predictions.rows) {
    const { wallet, pick } = prediction;

    // Determine if this prediction won
    const didWin =
      winner === 'TIE' ? null : // Don't award for tie
      (winner === 'A' && pick === 'A') || (winner === 'B' && pick === 'B');

    if (didWin === null) {
      // Tie - no points change
      continue;
    } else if (didWin) {
      await awardPoints(wallet, winPoints, 'PREDICT_WIN', battleId);
    } else if (losePoints !== 0) {
      await awardPoints(wallet, losePoints, 'PREDICT_LOSS', battleId);
    }
  }
}

/**
 * Get user's current points
 */
export async function getUserPoints(wallet) {
  const result = await query('SELECT points FROM users WHERE wallet = $1', [wallet]);
  return result.rows[0]?.points || 0;
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit = 100, period = 'all') {
  let whereClause = '';
  let params = [limit];

  if (period === 'day') {
    whereClause = 'WHERE pl.created_at > NOW() - INTERVAL \'1 day\'';
  } else if (period === 'week') {
    whereClause = 'WHERE pl.created_at > NOW() - INTERVAL \'7 days\'';
  } else if (period === 'season') {
    // Define season start (adjust as needed)
    whereClause = 'WHERE pl.created_at > \'2025-10-28\'::timestamptz';
  }

  const result = await query(
    `SELECT
       u.wallet,
       COALESCE(SUM(pl.delta), 0) as points,
       COUNT(DISTINCT p.battle_id) as battles_participated
     FROM users u
     LEFT JOIN points_ledger pl ON u.wallet = pl.wallet ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
     LEFT JOIN predictions p ON u.wallet = p.wallet
     GROUP BY u.wallet
     ORDER BY points DESC
     LIMIT $1`,
    params
  );

  return result.rows;
}
