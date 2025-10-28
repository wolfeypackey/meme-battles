import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getNonce, verifySignature } from '../lib/api';
import bs58 from 'bs58';

export default function Layout({ children }) {
  const { publicKey, signMessage, connected } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (connected && publicKey && signMessage && !isAuthenticated) {
      handleAuth();
    }
  }, [connected, publicKey]);

  async function handleAuth() {
    try {
      const wallet = publicKey.toString();

      // Get nonce
      const { nonce } = await getNonce(wallet);

      // Create message to sign
      const message = `Sign this message to authenticate with Meme Battles:\n\nNonce: ${nonce}\nWallet: ${wallet}`;
      const messageBytes = new TextEncoder().encode(message);

      // Sign message
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Verify signature and get JWT
      const authData = await verifySignature(wallet, signature, nonce);

      setIsAuthenticated(true);

      if (authData.isNewUser) {
        alert(`Welcome! You've received 50 bonus points!`);
      }

      // Fetch user points (you'd add this API endpoint)
      // For now, we'll just set to 0
      setUserPoints(0);
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to authenticate. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Nav */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MemeBattles
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="hover:text-purple-400 transition">
                  Battles
                </Link>
                <Link href="/leaderboard" className="hover:text-purple-400 transition">
                  Leaderboard
                </Link>
                <Link href="/how-it-works" className="hover:text-purple-400 transition">
                  How It Works
                </Link>
              </nav>
            </div>

            {/* Wallet & Points */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="hidden md:block px-4 py-2 bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-400">Points:</span>
                  <span className="ml-2 font-bold text-purple-400">{userPoints}</span>
                </div>
              )}
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Season 1 • Points-based predictions • Powered by Pyth Network</p>
            <p className="mt-2">No real-money wagering • Free to play • Rewards TBA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
