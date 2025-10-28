import { getLeaderboard } from '../../lib/points';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { period = 'season', limit = 100 } = req.query;

  const validPeriods = ['day', 'week', 'season', 'all'];
  if (!validPeriods.includes(period)) {
    return res.status(400).json({ error: 'Invalid period' });
  }

  try {
    const leaderboard = await getLeaderboard(parseInt(limit, 10), period);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      wallet: entry.wallet,
      // Truncate wallet for display
      walletDisplay: `${entry.wallet.slice(0, 4)}...${entry.wallet.slice(-4)}`,
      points: parseInt(entry.points, 10),
      battlesParticipated: parseInt(entry.battles_participated, 10),
    }));

    return res.status(200).json({
      period,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
