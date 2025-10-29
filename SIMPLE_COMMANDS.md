# Simple Battle Management Commands

## 🎯 Most Common Task: Create 3 New Battles

**Just run this:**
```bash
node create_fresh_battles_simple.js
```

This creates:
- 3 battles with VERIFIED tokens (BONK, WIF, SOL, JUP, PYTH)
- Starting in 10, 20, and 30 minutes
- Status: 'scheduled'
- Will appear on "Scheduled" tab

**No other steps needed.**

---

## 📊 Check What's in Database

```bash
node check_battles.js
```

Shows all battles with their:
- Status (scheduled, active, settled)
- Start/end times
- Start prices (if set)

---

## 🔄 Activate Battles When Ready

When a scheduled battle's start time has passed:

```bash
node activate_battles.js
```

This changes status from 'scheduled' → 'active' and sets start prices.

---

## 🧹 Check Token Price Feeds

```bash
node check_token_pyth_ids.js
```

Shows which tokens have working Pyth price feeds.

**Only use these 5 tokens:**
- BONK ✅
- WIF ✅
- SOL ✅
- JUP ✅
- PYTH ✅

---

## ❓ Troubleshooting

### "No scheduled battles found"

**Check 1:** Are there battles in the database?
```bash
node check_battles.js
```

**Check 2:** What does the API return?
```bash
curl "https://meme-battles-pump.vercel.app/api/battles?status=scheduled"
```

If API returns battles but website doesn't show them:
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Clear browser cache
- Try incognito mode

### "No active battles found"

Battles need to be activated after start time:
```bash
node activate_battles.js
```

Or enable Vercel cron job (see ENABLE_CRON.md)

### "No live price data" or 404 errors

You're using a token without a Pyth feed.
Only use: BONK, WIF, SOL, JUP, PYTH

---

## 📝 That's It!

For 99% of cases, you just need:
1. `node create_fresh_battles_simple.js` - Create battles
2. Wait for start time
3. `node activate_battles.js` - Activate them
4. Watch users battle!
