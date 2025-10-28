-- AI-Powered Meme Battles Database Schema
-- Deploy to Neon or any Postgres 14+

-- Registry of supported tokens and their Pyth feed IDs
CREATE TABLE tokens (
  mint TEXT PRIMARY KEY,         -- 44-char Solana address
  symbol TEXT NOT NULL,
  name TEXT,
  pyth_price_id TEXT NOT NULL,   -- Pyth feed identifier
  pump_slug TEXT,                 -- optional for deep-links
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A battle between two tokens
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_a TEXT NOT NULL REFERENCES tokens(mint),
  token_b TEXT NOT NULL REFERENCES tokens(mint),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled','active','settling','settled','void')),
  winner_token TEXT NULL REFERENCES tokens(mint),
  settle_reason TEXT NULL,       -- "OK", "TIE", "INSUFFICIENT_DATA", etc.

  -- Settlement data for verification
  price_a_start NUMERIC(20,10),
  price_a_end NUMERIC(20,10),
  price_b_start NUMERIC(20,10),
  price_b_end NUMERIC(20,10),
  delta_a_pct NUMERIC(10,6),
  delta_b_pct NUMERIC(10,6),

  created_by TEXT,               -- admin wallet
  created_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ
);

CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_starts_at ON battles(starts_at);
CREATE INDEX idx_battles_ends_at ON battles(ends_at);

-- Wallet identity + cumulative points
CREATE TABLE users (
  wallet TEXT PRIMARY KEY,       -- base58 pubkey
  points BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_points ON users(points DESC);

-- Non-transferable points transactions (append-only)
CREATE TABLE points_ledger (
  id BIGSERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  delta BIGINT NOT NULL,         -- positive or negative
  reason TEXT NOT NULL,          -- "PREDICT_WIN","PREDICT_LOSS","JOIN_BONUS","QUEST"
  battle_id UUID NULL REFERENCES battles(id),
  hmac TEXT NOT NULL,            -- server HMAC for tamper-evidence
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_points_ledger_wallet ON points_ledger(wallet);
CREATE INDEX idx_points_ledger_created_at ON points_ledger(created_at);

-- User's single prediction per battle
CREATE TABLE predictions (
  id BIGSERIAL PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES battles(id),
  wallet TEXT NOT NULL,
  pick TEXT NOT NULL CHECK (pick IN ('A','B')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (battle_id, wallet)
);

CREATE INDEX idx_predictions_battle ON predictions(battle_id);
CREATE INDEX idx_predictions_wallet ON predictions(wallet);

-- Auth nonce for wallet sign-in
CREATE TABLE auth_nonces (
  wallet TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- Meme assets (optional)
CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  battle_id UUID NULL REFERENCES battles(id),
  type TEXT NOT NULL CHECK (type IN ('image','gif')),
  storage_url TEXT NOT NULL,      -- S3/IPFS/Cloudinary
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clips_battle ON clips(battle_id);

-- Settlement audit log (append-only, for compliance and verification)
CREATE TABLE settlement_audit (
  id BIGSERIAL PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES battles(id),
  action TEXT NOT NULL CHECK (action IN ('FETCH_PRICE','CALCULATE','SETTLE','DISTRIBUTE','ERROR')),
  data JSONB NOT NULL,              -- Full context: prices, calculations, errors, etc.
  triggered_by TEXT,                -- 'CRON', 'ADMIN', 'API'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settlement_audit_battle ON settlement_audit(battle_id);
CREATE INDEX idx_settlement_audit_created_at ON settlement_audit(created_at);

-- Seed popular tokens with Pyth price feed IDs
-- Note: Pyth feed IDs are hex strings. Verify current IDs at https://pyth.network/developers/price-feed-ids
INSERT INTO tokens (mint, symbol, name, pyth_price_id) VALUES
  -- Major tokens
  ('So11111111111111111111111111111111111111112', 'SOL', 'Solana', 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'),
  ('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USDC', 'USD Coin', 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'),

  -- Top memecoins
  ('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'BONK', 'Bonk', '72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419'),
  ('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', 'WIF', 'dogwifhat', '4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc'),
  ('7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', 'POPCAT', 'Popcat', 'a6e8f6fcee6b95f8e19f143c223e043d5c2bc82b07ef1eb1bd8d8f9834b2b6bc'),
  ('ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY', 'MOODENG', 'Moo Deng', '8dc8452be0e5cace8ec49f1f1edc522f5f8c33537cd0d89d85c5e20d49d5dfa9'),
  ('2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv', 'PEPE', 'Pepe', '2ff9cc5c7c857c0e24cf9e6f5fece3ac5c99c806af5eca8ee11c9e16c4c63222'),
  ('8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', 'MYRO', 'Myro', '3b1e13d6f08df6eb41ff8742cfad5b8b23c655a2c8f09f57f96c89ea87674f1d'),
  ('A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump', 'FARTCOIN', 'Fartcoin', '5c4939a6c5e8c8c5a4e7c6c8f5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8c5c8'),
  ('9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', 'GIGA', 'Gigachad', '7d669f1c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8'),
  ('HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', 'AI16Z', 'ai16z', '6e2c1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f'),
  ('ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82', 'BOME', 'BOOK OF MEME', '3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b'),
  ('MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', 'MEW', 'cat in a dogs world', '4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d'),
  ('hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux', 'HNT', 'Helium', '5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e'),
  ('SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y', 'SHDW', 'GenesysGo Shadow', '6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f'),
  ('DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ', 'DUST', 'DUST Protocol', '7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a'),
  ('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', 'RAY', 'Raydium', 'b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8'),
  ('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', 'ORCA', 'Orca', 'c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9'),
  ('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', 'JUP', 'Jupiter', 'd1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1'),
  ('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'MSOL', 'Marinade staked SOL', 'e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2'),
  ('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', 'stSOL', 'Lido Staked SOL', 'f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3');

-- IMPORTANT: Before using in production, verify all Pyth price feed IDs at:
-- https://pyth.network/developers/price-feed-ids
-- The IDs above are placeholders for tokens without confirmed Pyth feeds.
-- Update with real feed IDs before launch!

-- Seed initial battles (adjust timestamps for your launch)
-- Battle 1: BONK vs WIF (90 minutes)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
   'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
   NOW() + INTERVAL '5 minutes',
   NOW() + INTERVAL '95 minutes',
   'scheduled',
   'admin');

-- Battle 2: POPCAT vs PEPE (90 minutes)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
   '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
   NOW() + INTERVAL '100 minutes',
   NOW() + INTERVAL '190 minutes',
   'scheduled',
   'admin');

-- Battle 3: SOL vs MOODENG (120 minutes)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('So11111111111111111111111111111111111111112',
   'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
   NOW() + INTERVAL '195 minutes',
   NOW() + INTERVAL '315 minutes',
   'scheduled',
   'admin');
