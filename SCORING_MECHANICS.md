# Meme Battles - Scoring Mechanics

## How It Works

### Battle Lifecycle

1. **Scheduled** → Battle is created and accepting predictions
2. **Active** → Battle has started, still accepting predictions until cutoff
3. **Settling** → Battle ended, fetching prices and calculating winner
4. **Settled** → Winner determined, points distributed
5. **Void** → Battle cancelled or data unavailable (no points awarded/lost)

### Prediction Cutoff

- Users can predict until **60 seconds before the battle ends** (configurable via `PREDICTION_CUTOFF_SEC`)
- This prevents last-second predictions based on near-final prices

### Price Settlement

When a battle ends, the system:

1. **Fetches start prices** - Gets Pyth Network prices for both tokens at battle start time
2. **Fetches end prices** - Gets Pyth Network prices for both tokens at battle end time
3. **Calculates percentage change** for each token:
   ```
   % Change = ((End Price - Start Price) / Start Price) × 100
   ```
4. **Determines winner** - The token with the highest percentage gain wins

### Tie Threshold

- If both tokens perform within **0.10%** of each other (`TIE_BPS = 10` basis points), it's declared a tie
- No winner/loser in a tie - all participants get their participation points back as winners

### Points System

| Action | Points Awarded | When |
|--------|---------------|------|
| **Join Bonus** | 50 | First time connecting wallet (one-time only) |
| **Make Prediction** | 10 | First prediction per battle (not for updates) |
| **Win Prediction** | 100 | If you picked the winning token |
| **Lose Prediction** | 0 | If you picked the losing token |
| **Tie** | 100 | Everyone who participated gets winner points |

### Point Award Examples

**Scenario 1: You win**
- Make prediction: +10 points
- Battle settles, you picked correctly: +100 points
- **Total: +110 points**

**Scenario 2: You lose**
- Make prediction: +10 points
- Battle settles, you picked incorrectly: +0 points
- **Total: +10 points** (you keep participation points)

**Scenario 3: Tie**
- Make prediction: +10 points
- Battle settles in a tie: +100 points
- **Total: +110 points** (same as winning)

**Scenario 4: You change your pick**
- First prediction: +10 points
- Update prediction: +0 points (no additional points for changing)
- Battle settles: +100 or +0 depending on your final pick
- **Total: +110 or +10 points**

### Current Fixes

✅ **No duplicate points** - Changing your prediction doesn't award more participation points
✅ **No points for re-selecting** - Clicking the same token again doesn't award points
✅ **One-time join bonus** - 50 points only awarded on first signup, not every login
✅ **Only first prediction counts** - Updates don't give more participation points

### What's NOT Implemented Yet

❌ **Live price tracking** - Prices aren't shown during battles (coming soon)
❌ **Real-time percentage changes** - No live updates of which token is winning
❌ **Current standings** - Can't see intermediate performance during battle

### Next Steps

The plan is to add:
1. Live price display for both tokens during battle
2. Current percentage change from battle start
3. Live indicator of which token is currently "winning"
4. Countdown timer until prediction cutoff
