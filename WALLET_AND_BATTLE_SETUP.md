# Wallet Options & Battle Setup Guide

## ✅ Issue 1: Multiple Wallet Support - FIXED

### What Was Changed

**Before:** Only showed Phantom wallet option (but MetaMask appeared due to browser extension)

**After:** Now shows 4 popular Solana wallets:
- 🟣 **Phantom** - Most popular Solana wallet
- 🟠 **Solflare** - Community favorite
- 🔵 **Torus** - Social login wallet
- 🔒 **Ledger** - Hardware wallet support

### How It Works

The wallet adapter now explicitly includes these wallet adapters:

```javascript
const wallets = useMemo(
  () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
  ],
  [network]
);
```

**Code location:** `pages/_app.js:20-28`

### Testing After Deployment

1. Go to your site
2. Click "Connect Wallet"
3. You should see all 4 wallet options
4. Users without a wallet installed will see "Install" buttons

---

## ✅ Issue 2: Pyth Price Feed Errors - IDENTIFIED & FIXED

### The Problem

Some tokens in your database had **incorrect or non-existent Pyth price IDs**, causing 404 errors when fetching live prices.

### Tokens Status

| Token | Symbol | Pyth Feed | Status |
|-------|--------|-----------|--------|
| Bonk | BONK | ✅ Working | `72b021...` |
| dogwifhat | WIF | ✅ Working | `4ca4be...` |
| Solana | SOL | ✅ Working | `ef0d8b...` |
| Jupiter | JUP | ⚠️ Fixed | Had placeholder, now correct |
| Pyth Network | PYTH | ✅ Added | New token added to database |
| Popcat | POPCAT | ❌ No feed | Pyth doesn't have this token |
| Pepe | PEPE | ❌ No feed | Pyth doesn't have this token |
| Moo Deng | MOODENG | ❌ No feed | Pyth doesn't have this token |

### Verified Working Tokens

Use these 5 tokens for all future battles:

1. **BONK** - `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
2. **WIF** - `EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm`
3. **SOL** - `So11111111111111111111111111111111111111112`
4. **JUP** - `JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN`
5. **PYTH** - `HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3`

---

## 🚀 Create 3 New Battles with Working Price Feeds

I've created a script that will:
1. Fix JUP's Pyth price ID
2. Add PYTH token to database
3. Create 3 new battles with verified price feeds

### Run This Command:

```bash
node setup_verified_battles.js
```

### What It Creates:

**Battle 1: BONK vs WIF**
- Starts in 5 minutes
- Duration: 90 minutes
- Both have verified Pyth feeds

**Battle 2: SOL vs JUP**
- Starts in 10 minutes
- Duration: 90 minutes
- Both have verified Pyth feeds

**Battle 3: WIF vs PYTH**
- Starts in 15 minutes
- Duration: 90 minutes
- Both have verified Pyth feeds

### Expected Output:

```
=== STEP 1: Fix Token Pyth IDs ===
✅ Updated JUP Pyth ID
✅ Added/Updated PYTH token

=== STEP 2: Create 3 New Battles ===
✅ Created Battle 1: BONK vs WIF (uuid...)
✅ Created Battle 2: SOL vs JUP (uuid...)
✅ Created Battle 3: WIF vs PYTH (uuid...)

=== STEP 3: Verify Setup ===
Latest battles:
  1. BONK vs WIF - scheduled
     Starts: 2025-10-28 20:15:00
  2. SOL vs JUP - scheduled
     Starts: 2025-10-28 20:20:00
  3. WIF vs PYTH - scheduled
     Starts: 2025-10-28 20:25:00

✅ Setup complete! All battles use verified Pyth price feeds.
```

---

## 📊 How to Find More Tokens with Pyth Feeds

### Option 1: Use Pyth API

```bash
# Search for a token
curl "https://hermes.pyth.network/v2/price_feeds?query=TOKEN_NAME&asset_type=crypto"

# Example: Search for ORCA
curl "https://hermes.pyth.network/v2/price_feeds?query=ORCA&asset_type=crypto"
```

Look for the `"id"` field in the response - that's the Pyth price ID.

### Option 2: Use Pyth Website

1. Go to https://pyth.network/price-feeds
2. Filter by "Crypto"
3. Search for your token
4. Copy the "Price Feed ID" (long hex string)

### Popular Solana Tokens with Pyth Feeds:

| Token | Symbol | Has Pyth Feed |
|-------|--------|--------------|
| Solana | SOL | ✅ Yes |
| Bonk | BONK | ✅ Yes |
| dogwifhat | WIF | ✅ Yes |
| Jupiter | JUP | ✅ Yes |
| Pyth Network | PYTH | ✅ Yes |
| Jito | JTO | ✅ Yes |
| Render | RNDR | ✅ Yes |
| Raydium | RAY | ✅ Yes |
| Orca | ORCA | ✅ Yes |
| Marinade | MNDE | ✅ Yes |

---

## 🛠️ Helper Scripts Reference

### Check Token Pyth IDs

```bash
node check_token_pyth_ids.js
```

Shows which tokens have correct/incorrect Pyth price IDs.

### Check Current Battles

```bash
node check_battles.js
```

Shows all battles with their start prices and status.

### Set Start Prices Manually

```bash
node set_start_prices.js
```

Retroactively sets start prices for active battles that are missing them.

### Activate Battles Manually

```bash
node activate_battles.js
```

Changes scheduled battles that should be active to 'active' status.

---

## 🔄 Automatic Battle Management (via Cron)

Once you enable the Vercel cron job (see `ENABLE_CRON.md`), battles will automatically:

1. **Activate** when `starts_at` time is reached
   - Fetches and stores start prices
   - Changes status from 'scheduled' to 'active'

2. **Settle** when `ends_at` time is reached
   - Fetches end prices
   - Calculates % changes
   - Determines winner
   - Distributes points

Until then, you can use the manual scripts above.

---

## 📝 Creating Future Battles

### SQL Template

```sql
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by)
VALUES (
  '[TOKEN_A_MINT]',
  '[TOKEN_B_MINT]',
  NOW() + INTERVAL '5 minutes',  -- Adjust start time
  NOW() + INTERVAL '95 minutes', -- Adjust duration
  'scheduled',
  'admin'
);
```

### Rules for Success

1. ✅ **Use verified tokens** - Only BONK, WIF, SOL, JUP, PYTH
2. ✅ **Future start times** - At least 5 minutes in the future
3. ✅ **Reasonable duration** - 60-120 minutes recommended
4. ✅ **Different matchups** - Don't repeat same battle too often

### Example Matchups

```sql
-- High volatility meme battle
BONK vs WIF

-- Ecosystem token battle
SOL vs JUP

-- Infra vs meme
PYTH vs BONK

-- Large cap vs mid cap
SOL vs WIF

-- DeFi battle
JUP vs PYTH
```

---

## 🎯 Summary

### What You Need to Do:

1. **Deploy to Vercel** (manually trigger if not auto-deploying)
2. **Run setup script**: `node setup_verified_battles.js`
3. **Wait 5-15 minutes** for battles to start
4. **Test the site** - you should see live prices and % changes

### What's Now Working:

✅ Multiple wallet options (Phantom, Solflare, Torus, Ledger)
✅ Verified Pyth price feeds for 5 tokens
✅ Scripts to create battles with working price data
✅ Helper tools to check and fix issues

### What to Avoid:

❌ Don't use POPCAT, PEPE, or MOODENG (no Pyth feeds)
❌ Don't create battles with past start times
❌ Don't use tokens without verifying Pyth feed exists first

---

## 🆘 Troubleshooting

### "No live price data" error

**Cause:** Token doesn't have Pyth price feed
**Fix:** Use only verified tokens (BONK, WIF, SOL, JUP, PYTH)

### Battles not activating

**Cause:** Cron job not running or battles have past start times
**Fix:** Run `node activate_battles.js` manually

### Wallet not connecting

**Cause:** Wallet extension not installed or wrong network
**Fix:** Make sure wallet is set to Solana Devnet (not Mainnet)

---

## 📞 Need Help?

Check these files for more info:
- `ENABLE_CRON.md` - How to enable automatic battle management
- `SCORING_MECHANICS.md` - How points and settlement work
- `SECURITY.md` - Security analysis and best practices
