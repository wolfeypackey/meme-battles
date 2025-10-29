import Layout from '../components/Layout';

export default function HowItWorks() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">How It Works</h1>

        {/* Overview */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">What is Meme Battles?</h2>
          <p className="text-gray-300 mb-4">
            Meme Battles is a <strong>free-to-play prediction platform</strong> where you compete to
            predict which meme tokens will pump harder during live battles. No real money required -
            just your wallet signature and market instincts.
          </p>
          <p className="text-gray-300">
            Earn points, climb the leaderboard, and compete for Season 1 rewards!
          </p>
        </div>

        {/* How to Play */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">How to Play</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Connect Your Wallet</h3>
                <p className="text-gray-300">
                  Click "Connect Wallet" and sign a message to authenticate. No tokens or SOL needed
                  in your wallet - just the signature proves you own it. You'll receive{' '}
                  <strong className="text-purple-400">+50 bonus points</strong> on first sign-in!
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Choose a Battle</h3>
                <p className="text-gray-300">
                  Browse active and upcoming battles on the homepage. Each battle features two meme
                  tokens competing head-to-head over a 60-120 minute window. Click any battle to
                  see details and make your prediction.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Make Your Prediction</h3>
                <p className="text-gray-300 mb-2">
                  Select which token you think will have the <strong>higher percentage gain</strong>{' '}
                  during the battle window. Submit before the cutoff (last 60 seconds locked).
                  You'll earn <strong className="text-purple-400">+10 participation points</strong>{' '}
                  immediately.
                </p>
                <p className="text-gray-400 text-sm">
                  💡 Tip: Check the prediction distribution to see what others are picking, but
                  trust your own analysis!
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Wait for Settlement</h3>
                <p className="text-gray-300 mb-2">
                  When the battle ends, our system automatically fetches real prices from{' '}
                  <strong>Pyth Network</strong> (a Solana-native oracle). The winner is determined
                  by which token had the higher % price change during the battle window.
                </p>
                <p className="text-gray-400 text-sm">
                  🔍 Every settlement is 100% verifiable - check the "Verify" link on any settled
                  battle to see the exact prices and calculations used.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Collect Your Points</h3>
                <p className="text-gray-300 mb-2">
                  If you predicted correctly, you'll receive{' '}
                  <strong className="text-green-400">+100 points</strong>! Points are tracked in a
                  tamper-proof ledger and contribute to your leaderboard ranking.
                </p>
                <p className="text-gray-400 text-sm">
                  ❌ No points lost for incorrect predictions - just try again in the next battle!
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                6
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Climb the Leaderboard</h3>
                <p className="text-gray-300">
                  Check your rank on the leaderboard. Compete for top positions to earn Season 1
                  rewards including allowlist spots, NFT badges, and exclusive perks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Points System */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Points System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-purple-400 font-bold text-2xl mb-2">+50</div>
              <div className="text-sm text-gray-400">Join Bonus (first sign-in)</div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-blue-400 font-bold text-2xl mb-2">+10</div>
              <div className="text-sm text-gray-400">Participation (per prediction)</div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-green-400 font-bold text-2xl mb-2">+100</div>
              <div className="text-sm text-gray-400">Correct Prediction</div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-gray-400 font-bold text-2xl mb-2">+0</div>
              <div className="text-sm text-gray-400">Incorrect Prediction</div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            * Points are stored in an append-only, tamper-evident ledger with HMAC verification
          </p>
        </div>

        {/* Settlement Rules */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Settlement Rules</h2>

          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">📊 Price Source</h3>
              <p className="text-gray-300 text-sm">
                We use <strong>Pyth Network</strong>, a Solana-native oracle providing real-time
                price feeds for 400+ assets. Pyth aggregates prices from 95+ exchanges and market
                makers.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">🧮 Calculation</h3>
              <p className="text-gray-300 text-sm mb-2">
                For each token, we calculate:
              </p>
              <code className="block bg-gray-950 p-2 rounded text-xs text-green-400 mb-2">
                % Change = ((Price_End - Price_Start) / Price_Start) × 100
              </code>
              <p className="text-gray-300 text-sm">
                The token with the higher % change wins.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">🤝 Tie Threshold</h3>
              <p className="text-gray-300 text-sm">
                If the difference between the two % changes is less than <strong>0.10%</strong>, the
                battle is declared a TIE. No points awarded in ties.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">⚠️ Void Conditions</h3>
              <p className="text-gray-300 text-sm">
                A battle is voided if price data is unavailable from Pyth at the start or end time
                (extremely rare). No points are awarded for void battles.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">✅ Verification</h3>
              <p className="text-gray-300 text-sm">
                Every settled battle includes a verification endpoint showing the exact Pyth price
                IDs, timestamps, prices, and calculations used. You can independently verify any
                result.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">FAQ</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Do I need SOL or tokens in my wallet?</h3>
              <p className="text-gray-300 text-sm">
                No! You only need a Solana wallet (Phantom or Backpack) to sign authentication
                messages. No funds required.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Can I change my prediction after submitting?</h3>
              <p className="text-gray-300 text-sm">
                Yes, you can update your prediction any time before the cutoff (last 60 seconds of
                the battle). Your most recent pick is used for settlement.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">How often do battles run?</h3>
              <p className="text-gray-300 text-sm">
                We aim to have 3-5 active battles at all times, with new ones starting every 1-2
                hours. Battle duration is typically 60-120 minutes.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">What are Season 1 rewards?</h3>
              <p className="text-gray-300 text-sm">
                Top leaderboard positions will receive allowlist spots for our platform token
                airdrop, NFT badges, and early access to premium features. Full details TBA.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Is there a limit to how many battles I can join?</h3>
              <p className="text-gray-300 text-sm">
                No limit! You can make one prediction per battle. The more battles you participate
                in correctly, the more points you earn.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">How do you prevent cheating?</h3>
              <p className="text-gray-300 text-sm">
                - One prediction per wallet per battle (enforced by database constraint)
                <br />
                - Predictions locked 60 seconds before battle ends
                <br />
                - Points ledger uses HMAC for tamper-evidence
                <br />
                - Wallet signatures prevent fake accounts (each requires gas for creation)
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔒 Is It Safe to Connect My Wallet?</h2>

          <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 mb-6">
            <p className="text-green-400 font-bold mb-2">✅ YES - 100% Safe</p>
            <p className="text-gray-300 text-sm">
              Meme Battles only asks you to <strong>sign a text message</strong> to prove you own your wallet.
              We never request transaction approvals, token permissions, or access to your private keys.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2 text-green-400">What We DO</h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Ask you to sign a simple text message for authentication</li>
                <li>Read your public wallet address (visible to everyone on blockchain)</li>
                <li>Store your points in our off-chain database</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-red-400">What We CANNOT Do</h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Transfer SOL or tokens from your wallet</li>
                <li>Approve token spending on your behalf</li>
                <li>Sign transactions without your explicit approval</li>
                <li>Access your private keys or seed phrase</li>
              </ul>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-2">The Message You Sign:</h3>
              <code className="text-xs text-gray-400 block whitespace-pre">
{`Sign this message to authenticate with Meme Battles:

Nonce: [random string]
Wallet: [your wallet address]`}
              </code>
              <p className="text-gray-400 text-xs mt-2">
                This is just text - not a transaction. Signing proves you own the wallet without moving any funds.
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-400 font-bold text-sm mb-1">Same Method Used By:</p>
              <p className="text-gray-300 text-sm">
                OpenSea, Magic Eden, Jupiter, and other trusted Web3 platforms use this exact authentication method
                called "Sign-In with Solana" (SIWS).
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Battle?</h2>
          <p className="text-gray-300 mb-6">
            Connect your wallet and make your first prediction to earn +60 points instantly!
          </p>
          <a
            href="/"
            className="inline-block bg-white text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            View Active Battles
          </a>
        </div>
      </div>
    </Layout>
  );
}
