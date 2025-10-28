import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

/**
 * Generate a random nonce for wallet sign-in
 */
export function generateNonce() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Verify a signature from a Solana wallet
 * @param {string} wallet - Base58 public key
 * @param {string} signature - Base58 signature
 * @param {string} nonce - The nonce that was signed
 * @returns {boolean}
 */
export function verifySignature(wallet, signature, nonce) {
  try {
    const message = `Sign this message to authenticate with Meme Battles:\n\nNonce: ${nonce}\nWallet: ${wallet}`;
    const messageBytes = new TextEncoder().encode(message);
    const publicKeyBytes = bs58.decode(wallet);
    const signatureBytes = bs58.decode(signature);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate a JWT for authenticated wallet
 */
export function generateToken(wallet) {
  return jwt.sign({ wallet }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a JWT
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract wallet from Authorization header
 */
export function getWalletFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded?.wallet || null;
}

/**
 * Generate HMAC for points ledger entry (tamper-evidence)
 */
export function generatePointsHMAC(wallet, delta, reason, battleId, createdAt) {
  const secret = process.env.SERVER_HMAC_SECRET || 'dev-hmac-secret-change-in-production';
  const data = `${wallet}|${delta}|${reason}|${battleId || 'null'}|${createdAt}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC for points ledger entry
 */
export function verifyPointsHMAC(wallet, delta, reason, battleId, createdAt, hmac) {
  const expected = generatePointsHMAC(wallet, delta, reason, battleId, createdAt);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hmac));
}
