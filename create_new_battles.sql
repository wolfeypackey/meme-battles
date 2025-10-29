-- Create 3 new battles with VERIFIED Pyth price feeds
-- These tokens have confirmed working price feeds from Pyth Network

-- Battle 1: BONK vs WIF (both verified working)
-- BONK: 72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419
-- WIF: 4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', -- BONK
   'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', -- WIF
   NOW() + INTERVAL '5 minutes',
   NOW() + INTERVAL '95 minutes',
   'scheduled',
   'admin');

-- Battle 2: SOL vs JUP
-- SOL: ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
-- JUP: 0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('So11111111111111111111111111111111111111112', -- SOL
   'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', -- JUP
   NOW() + INTERVAL '10 minutes',
   NOW() + INTERVAL '100 minutes',
   'scheduled',
   'admin');

-- Battle 3: WIF vs PYTH
-- WIF: 4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc
-- PYTH: 0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', -- WIF
   'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', -- PYTH
   NOW() + INTERVAL '15 minutes',
   NOW() + INTERVAL '105 minutes',
   'scheduled',
   'admin');

-- Verify the battles were created
SELECT id, token_a, token_b, starts_at, ends_at, status FROM battles
WHERE created_by = 'admin'
ORDER BY starts_at DESC
LIMIT 3;
