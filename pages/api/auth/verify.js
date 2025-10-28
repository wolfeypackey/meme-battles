import { query } from '../../../lib/db';
import { verifySignature, generateToken } from '../../../lib/auth';
import { awardJoinBonusIfNew } from '../../../lib/points';
import { withRateLimit, authRateLimit } from '../../../lib/rateLimit';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet, signature, nonce } = req.body;

  if (!wallet || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Retrieve stored nonce
    const result = await query(
      'SELECT nonce, issued_at FROM auth_nonces WHERE wallet = $1',
      [wallet]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No nonce found for wallet' });
    }

    const storedNonce = result.rows[0].nonce;
    const issuedAt = new Date(result.rows[0].issued_at);

    // Check if nonce is expired (5 minutes)
    const now = new Date();
    const expiryMs = 5 * 60 * 1000;
    if (now - issuedAt > expiryMs) {
      return res.status(401).json({ error: 'Nonce expired' });
    }

    // Verify nonce matches
    if (storedNonce !== nonce) {
      return res.status(401).json({ error: 'Invalid nonce' });
    }

    // Verify signature
    const isValid = verifySignature(wallet, signature, nonce);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Delete used nonce
    await query('DELETE FROM auth_nonces WHERE wallet = $1', [wallet]);

    // Award join bonus if new user (check BEFORE creating user record)
    const isNewUser = await awardJoinBonusIfNew(wallet);

    // Update last login (this will create user if doesn't exist)
    await query(
      `INSERT INTO users (wallet, last_login)
       VALUES ($1, NOW())
       ON CONFLICT (wallet)
       DO UPDATE SET last_login = NOW()`,
      [wallet]
    );

    // Generate JWT
    const token = generateToken(wallet);

    return res.status(200).json({
      token,
      wallet,
      isNewUser,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export default withRateLimit(handler, authRateLimit);
