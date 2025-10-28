import { query } from '../../../lib/db';
import { generateNonce } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.query;

  if (!wallet || wallet.length < 32) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const nonce = generateNonce();

    // Store nonce with 5 minute expiry
    await query(
      `INSERT INTO auth_nonces (wallet, nonce, issued_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (wallet)
       DO UPDATE SET nonce = $2, issued_at = NOW()`,
      [wallet, nonce]
    );

    return res.status(200).json({ nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return res.status(500).json({ error: 'Failed to generate nonce' });
  }
}
