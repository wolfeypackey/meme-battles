import { query } from '../../../lib/db';

/**
 * Cron job to schedule daily battles automatically
 * Runs once per day to create 3-5 new battles for the next day
 * Randomizes token matchups to keep things interesting
 */
export default async function handler(req, res) {
  // Verify this is called from Vercel Cron or authorized source
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = {
    created: [],
    errors: [],
  };

  try {
    // Verified tokens with working Pyth price feeds
    const verifiedTokens = [
      { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK' },
      { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF' },
      { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL' },
      { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP' },
      { mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', symbol: 'PYTH' },
    ];

    // Function to shuffle array (Fisher-Yates)
    function shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Function to generate random matchups (no duplicate pairings in same batch)
    function generateMatchups(tokens, count) {
      const shuffled = shuffle(tokens);
      const matchups = [];
      const used = new Set();

      let attempts = 0;
      while (matchups.length < count && attempts < 100) {
        const idx1 = Math.floor(Math.random() * shuffled.length);
        let idx2 = Math.floor(Math.random() * shuffled.length);

        // Make sure different tokens
        while (idx2 === idx1) {
          idx2 = Math.floor(Math.random() * shuffled.length);
        }

        const token1 = shuffled[idx1];
        const token2 = shuffled[idx2];

        // Create unique key for this pairing (order doesn't matter)
        const pairKey = [token1.symbol, token2.symbol].sort().join('-');

        // Check if we've already used this pairing
        if (!used.has(pairKey)) {
          matchups.push({ token1, token2 });
          used.add(pairKey);
        }

        attempts++;
      }

      return matchups;
    }

    // Determine how many battles to create (randomize between 3-5)
    const battleCount = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 battles

    // Generate random matchups
    const matchups = generateMatchups(verifiedTokens, battleCount);

    console.log(`Creating ${matchups.length} battles with randomized matchups`);

    // Create battles throughout the next 24 hours
    for (let i = 0; i < matchups.length; i++) {
      const matchup = matchups[i];

      // Stagger start times throughout the day (every 4-6 hours)
      const hoursUntilStart = 2 + (i * 5) + Math.floor(Math.random() * 2); // 2h, 7h, 12h, 17h, 22h (with variance)
      const durationMinutes = 90; // All battles are 90 minutes

      try {
        const result = await query(
          `INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
           VALUES ($1, $2, NOW() + INTERVAL '${hoursUntilStart} hours', NOW() + INTERVAL '${hoursUntilStart} hours' + INTERVAL '${durationMinutes} minutes', 'scheduled', 'auto-scheduler')
           RETURNING id, starts_at, ends_at`,
          [matchup.token1.mint, matchup.token2.mint]
        );

        const battle = result.rows[0];
        results.created.push({
          id: battle.id,
          matchup: `${matchup.token1.symbol} vs ${matchup.token2.symbol}`,
          startsAt: battle.starts_at,
          endsAt: battle.ends_at,
        });

        console.log(`Created: ${matchup.token1.symbol} vs ${matchup.token2.symbol} - starts in ${hoursUntilStart}h`);
      } catch (error) {
        console.error(`Error creating battle ${matchup.token1.symbol} vs ${matchup.token2.symbol}:`, error);
        results.errors.push({
          matchup: `${matchup.token1.symbol} vs ${matchup.token2.symbol}`,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      battlesCreated: results.created.length,
      results,
    });
  } catch (error) {
    console.error('Daily battle scheduler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      results,
    });
  }
}
