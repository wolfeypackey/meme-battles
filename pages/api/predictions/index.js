import { query } from '../../../lib/db';
import { getWalletFromRequest } from '../../../lib/auth';
import { awardParticipationPoints } from '../../../lib/points';
import { withRateLimit, predictionRateLimit } from '../../../lib/rateLimit';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = getWalletFromRequest(req);

  if (!wallet) {
    return res.status(401).json({ error: 'Unauthorized - please sign in' });
  }

  const { battleId, pick } = req.body;

  if (!battleId || !pick || !['A', 'B'].includes(pick)) {
    return res.status(400).json({ error: 'Invalid request - battleId and pick (A or B) required' });
  }

  try {
    // Get battle details
    const battleResult = await query(
      'SELECT * FROM battles WHERE id = $1',
      [battleId]
    );

    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    const battle = battleResult.rows[0];

    // Check if battle is accepting predictions
    if (battle.status !== 'scheduled' && battle.status !== 'active') {
      return res.status(400).json({ error: 'Battle is not accepting predictions' });
    }

    // Check if prediction cutoff has passed
    const now = new Date();
    const endsAt = new Date(battle.ends_at);
    const cutoffSeconds = parseInt(process.env.PREDICTION_CUTOFF_SEC || '60', 10);
    const cutoffTime = new Date(endsAt.getTime() - cutoffSeconds * 1000);

    if (now > cutoffTime) {
      return res.status(400).json({ error: 'Prediction cutoff has passed' });
    }

    // Insert or update prediction
    const result = await query(
      `INSERT INTO predictions (battle_id, wallet, pick)
       VALUES ($1, $2, $3)
       ON CONFLICT (battle_id, wallet)
       DO UPDATE SET pick = $3, created_at = NOW()
       RETURNING *`,
      [battleId, wallet, pick]
    );

    // Award participation points (only on first prediction)
    const isNewPrediction = result.rowCount === 1;
    if (isNewPrediction) {
      await awardParticipationPoints(wallet, battleId);
    }

    return res.status(200).json({
      success: true,
      prediction: result.rows[0],
      pointsAwarded: isNewPrediction,
    });
  } catch (error) {
    console.error('Error creating prediction:', error);

    // Check if this is a duplicate key error
    if (error.code === '23505') {
      return res.status(200).json({
        success: true,
        message: 'Prediction updated',
      });
    }

    return res.status(500).json({ error: 'Failed to create prediction' });
  }
}

export default withRateLimit(handler, predictionRateLimit);
