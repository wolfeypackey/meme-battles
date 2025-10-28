import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken() {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

function getHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth API
export async function getNonce(wallet) {
  const response = await axios.get(`${API_BASE}/api/auth/nonce`, {
    params: { wallet },
  });
  return response.data;
}

export async function verifySignature(wallet, signature, nonce) {
  const response = await axios.post(`${API_BASE}/api/auth/verify`, {
    wallet,
    signature,
    nonce,
  });

  if (response.data.token) {
    setAuthToken(response.data.token);
  }

  return response.data;
}

// Battles API
export async function getBattles(status = 'active', limit = 20) {
  const response = await axios.get(`${API_BASE}/api/battles`, {
    params: { status, limit },
  });
  return response.data;
}

export async function getBattle(id) {
  const response = await axios.get(`${API_BASE}/api/battles/${id}`, {
    headers: getHeaders(),
  });
  return response.data;
}

export async function createBattle(data) {
  const response = await axios.post(`${API_BASE}/api/battles`, data, {
    headers: getHeaders(),
  });
  return response.data;
}

export async function settleBattle(id) {
  const response = await axios.post(`${API_BASE}/api/battles/${id}/settle`, {}, {
    headers: getHeaders(),
  });
  return response.data;
}

// Predictions API
export async function submitPrediction(battleId, pick) {
  const response = await axios.post(
    `${API_BASE}/api/predictions`,
    { battleId, pick },
    { headers: getHeaders() }
  );
  return response.data;
}

// Leaderboard API
export async function getLeaderboard(period = 'season', limit = 100) {
  const response = await axios.get(`${API_BASE}/api/leaderboard`, {
    params: { period, limit },
  });
  return response.data;
}

// Verification API
export async function getVerification(battleId) {
  const response = await axios.get(`${API_BASE}/api/verify/${battleId}`);
  return response.data;
}

// User API
export async function getUserPoints() {
  const response = await axios.get(`${API_BASE}/api/user/points`, {
    headers: getHeaders(),
  });
  return response.data;
}
