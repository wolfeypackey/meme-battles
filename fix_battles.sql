-- Delete old battles that are in the past
DELETE FROM battles;

-- Create 3 new battles starting soon
-- Battle 1: BONK vs WIF (starts in 5 minutes, ends in 95 minutes)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
   'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
   NOW() + INTERVAL '5 minutes',
   NOW() + INTERVAL '95 minutes',
   'scheduled',
   'admin');

-- Battle 2: POPCAT vs PEPE (starts in 10 minutes, ends in 100 minutes)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
   '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
   NOW() + INTERVAL '10 minutes',
   NOW() + INTERVAL '100 minutes',
   'scheduled',
   'admin');

-- Battle 3: SOL vs MOODENG (starts in 15 minutes, ends in 105 minutes)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('So11111111111111111111111111111111111111112',
   'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
   NOW() + INTERVAL '15 minutes',
   NOW() + INTERVAL '105 minutes',
   'scheduled',
   'admin');

-- Verify the battles were created
SELECT id, token_a, token_b, starts_at, ends_at, status FROM battles;
