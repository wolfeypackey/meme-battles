import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getLeaderboard } from '../lib/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('season');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      const data = await getLeaderboard(period, 100);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankBadge(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-gray-400">
            Top players by points • Season rewards TBA
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex justify-center space-x-4 mb-8">
          {['day', 'week', 'season', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No entries yet. Be the first to predict!</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-900 font-medium text-sm text-gray-400">
              <div>Rank</div>
              <div>Wallet</div>
              <div className="text-right">Points</div>
              <div className="text-right">Battles</div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-gray-700">
              {leaderboard.map((entry) => (
                <div
                  key={entry.wallet}
                  className={`grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-700/50 transition ${
                    entry.rank <= 3 ? 'bg-gray-900/50' : ''
                  }`}
                >
                  <div className="text-lg font-bold">
                    {getRankBadge(entry.rank)}
                  </div>
                  <div className="font-mono text-sm">
                    {entry.walletDisplay}
                  </div>
                  <div className="text-right font-bold text-purple-400">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-right text-gray-400">
                    {entry.battlesParticipated}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Info */}
        <div className="mt-8 bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-lg p-6">
          <h3 className="font-bold text-xl mb-2">Season 1 Rewards</h3>
          <p className="text-gray-300 mb-4">
            Top players will receive exclusive rewards at the end of Season 1:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">🏆</span>
              <span>Top 10: Allowlist for platform token airdrop</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎖️</span>
              <span>Top 50: Early access to premium features</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎁</span>
              <span>Top 100: Commemorative NFT badge</span>
            </li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            * Rewards subject to change • Season ends TBA
          </p>
        </div>
      </div>
    </Layout>
  );
}
