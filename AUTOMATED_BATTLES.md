# Automated Daily Battle Scheduling

## ✅ What It Does

Your site now has **fully automated battle scheduling**. Every day at midnight (UTC), the system will:

1. **Create 3-5 new battles** (random count for variety)
2. **Randomize token matchups** (no duplicate pairings in same day)
3. **Stagger start times** throughout the next 24 hours (every 4-6 hours)
4. **Use only verified tokens** (BONK, WIF, SOL, JUP, PYTH)

**You never need to run scripts again!** ✨

---

## 🤖 How It Works

### Cron Schedule

```json
{
  "path": "/api/cron/schedule-daily-battles",
  "schedule": "0 0 * * *"  // Every day at midnight UTC
}
```

### Randomization Logic

1. **Random battle count**: 3, 4, or 5 battles per day
2. **Shuffle tokens**: Uses Fisher-Yates algorithm
3. **No duplicate matchups**: Won't create "BONK vs WIF" twice in same day
4. **Staggered timing**: Battles start every 4-6 hours throughout the day

### Example Output

**Day 1:**
- 2:00 AM UTC: PYTH vs SOL (90 min)
- 7:30 AM UTC: BONK vs JUP (90 min)
- 12:45 PM UTC: WIF vs PYTH (90 min)
- 5:15 PM UTC: SOL vs BONK (90 min)

**Day 2:** (completely different matchups)
- 2:15 AM UTC: JUP vs WIF (90 min)
- 7:00 AM UTC: SOL vs PYTH (90 min)
- 1:30 PM UTC: BONK vs WIF (90 min)

---

## 🎮 What Users Experience

### Variety
- Different matchups every day
- Can't predict what's coming next
- Fresh content daily

### Consistency
- Always have scheduled battles
- No downtime between seasons
- Battles running 24/7

### Engagement
- New battles every 4-6 hours
- Multiple opportunities per day to predict
- Points accumulate continuously

---

## 🛠️ Setup Requirements

### 1. Enable Vercel Cron (Required)

Go to Vercel dashboard:
1. Navigate to your project: https://vercel.com/wolfeypackeys-projects/meme-battles-pump
2. Go to **Settings** → **Cron Jobs**
3. You should see:
   - `manage-battles` - Runs every minute (activates/settles battles)
   - `schedule-daily-battles` - Runs daily at midnight (creates new battles)
4. Make sure **both are enabled**

### 2. Environment Variables (Already Set)

The cron needs these variables (you already have them):
- ✅ `CRON_SECRET` - For authentication
- ✅ `DATABASE_URL` - To create battles in database

### 3. That's It!

Once cron is enabled, you're done. No manual work needed.

---

## 🧪 Testing Before Going Live

Want to test the scheduler without waiting for midnight?

### Manual Trigger

```bash
node test_daily_scheduler.js
```

This will:
- Call the cron endpoint immediately
- Create 3-5 randomized battles
- Show you what was created

**Example output:**
```
=== Testing Daily Battle Scheduler ===
Status: 200

✅ Success! Created 4 battles

Battles created:
1. PYTH vs JUP
   Starts: 10/28/2025, 10:30:00 PM
   Ends: 10/29/2025, 12:00:00 AM

2. BONK vs SOL
   Starts: 10/29/2025, 3:15:00 AM
   Ends: 10/29/2025, 4:45:00 AM

3. WIF vs PYTH
   Starts: 10/29/2025, 8:45:00 AM
   Ends: 10/29/2025, 10:15:00 AM

4. SOL vs JUP
   Starts: 10/29/2025, 1:30:00 PM
   Ends: 10/29/2025, 3:00:00 PM
```

---

## 📊 How to Monitor

### Check What's Scheduled

```bash
node check_battles.js
```

Shows all battles (scheduled, active, settled) with their times.

### View Vercel Cron Logs

1. Go to Vercel → Your Project → **Logs**
2. Filter by "Cron" or search for "schedule-daily-battles"
3. You'll see logs every day at midnight showing what was created

### Database Check

The scheduler marks battles with `created_by = 'auto-scheduler'` so you can identify automated battles:

```sql
SELECT COUNT(*) FROM battles WHERE created_by = 'auto-scheduler';
```

---

## ⚙️ Configuration Options

### Change Schedule Time

Edit `vercel.json`:

```json
{
  "path": "/api/cron/schedule-daily-battles",
  "schedule": "0 12 * * *"  // Noon UTC instead of midnight
}
```

**Cron format:** `minute hour day month dayOfWeek`
- `0 0 * * *` = Every day at midnight
- `0 12 * * *` = Every day at noon
- `0 0 * * 1` = Every Monday at midnight
- `0 */6 * * *` = Every 6 hours

### Change Battle Count

Edit `pages/api/cron/schedule-daily-battles.js`:

```javascript
// Line ~72
const battleCount = Math.floor(Math.random() * 3) + 3; // Currently: 3, 4, or 5

// Change to always create 5 battles:
const battleCount = 5;

// Change to create 2-4 battles:
const battleCount = Math.floor(Math.random() * 3) + 2;
```

### Change Battle Duration

```javascript
// Line ~80
const durationMinutes = 90; // Currently 90 minutes

// Change to 60 minutes:
const durationMinutes = 60;

// Change to 2 hours:
const durationMinutes = 120;
```

### Add More Tokens

Edit the `verifiedTokens` array (line ~23):

```javascript
const verifiedTokens = [
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK' },
  { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF' },
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL' },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP' },
  { mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', symbol: 'PYTH' },
  // Add new token here (make sure it has a Pyth price feed!)
];
```

⚠️ **Only add tokens with verified Pyth price feeds!**

---

## 🚨 Troubleshooting

### No battles being created

**Check 1:** Is cron enabled in Vercel?
- Go to Settings → Cron Jobs
- Make sure `schedule-daily-battles` is enabled

**Check 2:** Is CRON_SECRET set in Vercel?
- Go to Settings → Environment Variables
- Verify `CRON_SECRET` exists

**Check 3:** Check Vercel logs
- Look for errors at midnight UTC
- Search for "schedule-daily-battles"

### Battles created but not showing on site

Run the activation script:
```bash
node activate_battles.js
```

Or make sure the `manage-battles` cron is also enabled.

### Same matchups every day

This shouldn't happen due to randomization. If it does:
- Check the code wasn't modified
- Restart the deployment
- Contact support (might be a caching issue)

---

## 📈 Future Enhancements

### Possible Additions:

1. **Themed days**: "Meme Monday" with only meme tokens, "Ecosystem Tuesday" with SOL/JUP
2. **Special events**: Tournament-style brackets, championship matches
3. **Community voting**: Let users vote on which matchups they want to see
4. **Dynamic difficulty**: Adjust battle frequency based on user engagement
5. **Seasonal rotations**: Different token pools for different seasons

All of these can be added by editing `pages/api/cron/schedule-daily-battles.js`

---

## ✅ Summary

**What you had before:**
- Manual script running: `node create_fresh_battles_simple.js`
- Same matchups: BONK vs WIF, SOL vs JUP, etc.
- Required your intervention daily

**What you have now:**
- ✅ Fully automated (runs at midnight daily)
- ✅ Random matchups (different every day)
- ✅ Random timing (staggered throughout 24 hours)
- ✅ Random count (3-5 battles per day)
- ✅ Zero maintenance required

**Your only job:** Enable cron in Vercel (one-time setup)

🎉 **That's it! Your battles are now on autopilot.**
