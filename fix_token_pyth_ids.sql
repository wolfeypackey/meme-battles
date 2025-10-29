-- Fix JUP token Pyth price ID (currently has placeholder)
UPDATE tokens
SET pyth_price_id = '0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996'
WHERE symbol = 'JUP';

-- Add PYTH token if it doesn't exist
INSERT INTO tokens (mint, symbol, name, pyth_price_id)
VALUES (
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  'PYTH',
  'Pyth Network',
  '0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff'
)
ON CONFLICT (mint) DO UPDATE
SET pyth_price_id = EXCLUDED.pyth_price_id;

-- Verify the updates
SELECT symbol, name, pyth_price_id
FROM tokens
WHERE symbol IN ('JUP', 'PYTH')
ORDER BY symbol;
