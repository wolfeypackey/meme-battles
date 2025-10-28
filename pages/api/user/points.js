import { verifyJWT } from '../../../lib/auth';
import { query } from '../../../lib/db';

/**
 * GET /api/user/points
 * Returns the current user's total points
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const wallet = decoded.wallet;

    // Get user's total points
    const result = await query(
      'SELECT points FROM users WHERE wallet = $1',
      [wallet]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      wallet,
      points: result.rows[0].points,
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return res.status(500).json({ error: 'Failed to fetch points' });
  }
}
