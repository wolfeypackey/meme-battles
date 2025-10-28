import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { getBattle, submitPrediction } from '../../lib/api';

export default function BattleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { connected } = useWallet();

  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPick, setSelectedPick] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadBattle();
    }
  }, [id]);

  async function loadBattle() {
    try {
      setLoading(true);
      const data = await getBattle(id);
      setBattle(data);
      setSelectedPick(data.userPrediction || null);
    } catch (error) {
      console.error('Error loading battle:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitPrediction() {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!selectedPick) {
      alert('Please select your prediction');
      return;
    }

    try {
      setSubmitting(true);
      await submitPrediction(id, selectedPick);
      alert('Prediction submitted successfully! +10 points');
      await loadBattle();
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert(error.response?.data?.error || 'Failed to submit prediction');
    } finally {
      setSubmitting(false);
    }
  }

  function getTimeRemaining(endsAt) {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return { ended: true, display: 'Battle Ended' };

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return {
      ended: false,
      display: `${hours}h ${minutes}m ${seconds}s`,
      hours,
      minutes,
      seconds,
    };
  }

  const canPredict = battle && (battle.status === 'scheduled' || battle.status === 'active');
  const isSettled = battle && (battle.status === 'settled' || battle.status === 'void');

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading battle...</p>
        </div>
      </Layout>
    );
  }

  if (!battle) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">Battle not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-gray-400 hover:text-white transition"
        >
          ← Back to Battles
        </button>

        {/* Battle Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">Meme Battle</h1>
            {battle.status === 'active' && (
              <div className="inline-block px-4 py-2 bg-green-900/30 border border-green-500 text-green-400 rounded-full">
                🔴 LIVE • {getTimeRemaining(battle.ends_at).display}
              </div>
            )}
            {battle.status === 'scheduled' && (
              <div className="inline-block px-4 py-2 bg-blue-900/30 border border-blue-500 text-blue-400 rounded-full">
                Starts soon
              </div>
            )}
          </div>

          {/* Token Cards */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Token A */}
            <button
              onClick={() => canPredict && setSelectedPick('A')}
              disabled={!canPredict || submitting}
              className={`p-6 rounded-lg border-2 transition ${
                selectedPick === 'A'
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-gray-700 hover:border-gray-600'
              } ${!canPredict ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {battle.token_a_symbol}
              </div>
              <div className="text-sm text-gray-400 mb-4">{battle.token_a_name}</div>
              {isSettled && battle.delta_a_pct !== null && (
                <div className={`text-xl font-bold ${battle.delta_a_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {battle.delta_a_pct >= 0 ? '+' : ''}{parseFloat(battle.delta_a_pct).toFixed(2)}%
                </div>
              )}
              <div className="mt-4 text-sm text-gray-400">
                {battle.pick_a_count || 0} predictions
              </div>
            </button>

            {/* Token B */}
            <button
              onClick={() => canPredict && setSelectedPick('B')}
              disabled={!canPredict || submitting}
              className={`p-6 rounded-lg border-2 transition ${
                selectedPick === 'B'
                  ? 'border-pink-500 bg-pink-900/30'
                  : 'border-gray-700 hover:border-gray-600'
              } ${!canPredict ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-3xl font-bold text-pink-400 mb-2">
                {battle.token_b_symbol}
              </div>
              <div className="text-sm text-gray-400 mb-4">{battle.token_b_name}</div>
              {isSettled && battle.delta_b_pct !== null && (
                <div className={`text-xl font-bold ${battle.delta_b_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {battle.delta_b_pct >= 0 ? '+' : ''}{parseFloat(battle.delta_b_pct).toFixed(2)}%
                </div>
              )}
              <div className="mt-4 text-sm text-gray-400">
                {battle.pick_b_count || 0} predictions
              </div>
            </button>
          </div>

          {/* Submit Button */}
          {canPredict && (
            <button
              onClick={handleSubmitPrediction}
              disabled={!selectedPick || submitting || !connected}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded-lg font-bold text-lg transition"
            >
              {submitting
                ? 'Submitting...'
                : battle.userPrediction
                ? `Update Prediction (${selectedPick})`
                : 'Submit Prediction (+10 points)'}
            </button>
          )}

          {/* Winner Banner */}
          {isSettled && battle.winner_token && (
            <div className="mt-6 bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold mb-2">
                🏆 Winner: {battle.winner_token === battle.token_a ? battle.token_a_symbol : battle.token_b_symbol}
              </div>
              {battle.userPrediction && (
                <div className="text-lg">
                  {((battle.winner_token === battle.token_a && battle.userPrediction === 'A') ||
                    (battle.winner_token === battle.token_b && battle.userPrediction === 'B'))
                    ? '✅ You won! +100 points'
                    : '❌ Better luck next time'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Battle Stats */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-xl mb-4">Battle Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Total Predictions</div>
              <div className="text-2xl font-bold">{battle.prediction_count || 0}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="text-2xl font-bold capitalize">{battle.status}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Starts</div>
              <div className="font-medium">{new Date(battle.starts_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Ends</div>
              <div className="font-medium">{new Date(battle.ends_at).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Sharing */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-bold text-xl mb-4">Share This Battle</h3>
          <div className="flex space-x-4">
            <a
              href={`https://twitter.com/intent/tweet?text=I'm%20predicting%20${selectedPick === 'A' ? battle.token_a_symbol : battle.token_b_symbol}%20will%20pump%20harder!%20Join%20the%20battle%20on%20MemeBattles&url=${typeof window !== 'undefined' ? window.location.href : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg font-medium transition"
            >
              Share on X
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                alert('Link copied!');
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium transition"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
