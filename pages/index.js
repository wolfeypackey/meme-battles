import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getBattles } from '../lib/api';

export default function Home() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadBattles();
  }, [filter]);

  async function loadBattles() {
    try {
      setLoading(true);
      const data = await getBattles(filter);
      setBattles(data);
    } catch (error) {
      console.error('Error loading battles:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTimeRemaining(endsAt) {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `${hours}h ${minutes}m`;
  }

  function getTimeUntilStart(startsAt) {
    const start = new Date(startsAt);
    const now = new Date();
    const diff = start - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `Starts in ${hours}h ${minutes}m`;
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          AI-Powered Meme Token Battles
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Predict which token pumps harder • Earn points • Climb the leaderboard
        </p>
        <div className="inline-block bg-purple-900/30 border border-purple-500/30 rounded-lg px-6 py-3">
          <span className="text-purple-400 font-semibold">Season 1 Live</span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-gray-300">Free to play • No wallet funding required</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-center space-x-4 mb-8">
        {['active', 'scheduled', 'settled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Battles Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading battles...</p>
        </div>
      ) : battles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No {filter} battles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battles.map((battle) => (
            <Link key={battle.id} href={`/battle/${battle.id}`}>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition cursor-pointer">
                {/* Token Matchup */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {battle.token_a_symbol}
                    </div>
                    <div className="text-xs text-gray-500">{battle.token_a_name}</div>
                  </div>
                  <div className="text-gray-500 font-bold px-4">VS</div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-pink-400 mb-1">
                      {battle.token_b_symbol}
                    </div>
                    <div className="text-xs text-gray-500">{battle.token_b_name}</div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                  {battle.status === 'active' && (
                    <span className="px-3 py-1 bg-green-900/30 border border-green-500 text-green-400 rounded-full text-sm font-medium">
                      🔴 LIVE • {getTimeRemaining(battle.ends_at)}
                    </span>
                  )}
                  {battle.status === 'scheduled' && (
                    <span className="px-3 py-1 bg-blue-900/30 border border-blue-500 text-blue-400 rounded-full text-sm font-medium">
                      {getTimeUntilStart(battle.starts_at)}
                    </span>
                  )}
                  {battle.status === 'settled' && battle.winner_token && (
                    <span className="px-3 py-1 bg-purple-900/30 border border-purple-500 text-purple-400 rounded-full text-sm font-medium">
                      Winner: {battle.winner_token === battle.token_a ? battle.token_a_symbol : battle.token_b_symbol}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Predictions:</span>
                    <span className="font-medium">{battle.prediction_count || 0}</span>
                  </div>

                  {/* Prediction Distribution */}
                  {battle.prediction_count > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-purple-400">{battle.pick_a_count} picks</span>
                        <span className="text-pink-400">{battle.pick_b_count} picks</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-purple-500"
                          style={{
                            width: `${(battle.pick_a_count / battle.prediction_count) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-pink-500"
                          style={{
                            width: `${(battle.pick_b_count / battle.prediction_count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Performance for settled battles */}
                  {battle.status === 'settled' && battle.delta_a_pct !== null && (
                    <div className="pt-2 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">{battle.token_a_symbol}:</span>
                        <span className={`ml-1 font-bold ${battle.delta_a_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {battle.delta_a_pct >= 0 ? '+' : ''}{parseFloat(battle.delta_a_pct).toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">{battle.token_b_symbol}:</span>
                        <span className={`ml-1 font-bold ${battle.delta_b_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {battle.delta_b_pct >= 0 ? '+' : ''}{parseFloat(battle.delta_b_pct).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-4">
                  <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-center py-2 rounded-lg font-medium transition">
                    {battle.status === 'settled' ? 'View Results' : 'Make Prediction'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{battles.length}</div>
          <div className="text-gray-400">Active Battles</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">Free</div>
          <div className="text-gray-400">Cost to Play</div>
        </div>
      </div>
    </Layout>
  );
}
