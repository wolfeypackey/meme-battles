# Quick Command Reference

## 🚀 Deploy Steps (Copy-Paste Ready)

### 1. Push to GitHub

```bash
# Create repo at github.com/new first, then:
cd /Users/bradohara/meme-battles
git remote add origin https://github.com/YOUR_USERNAME/meme-battles.git
git push -u origin main
```

### 2. Test Locally (Optional)

```bash
# Install dependencies
npm install

# Update DATABASE_URL in .env.local with your Neon string

# Run dev server
npm run dev

# Visit http://localhost:3000
```

### 3. After Vercel Deployment

```bash
# Update app URL env var (replace with your Vercel URL)
# Do this in Vercel dashboard: Settings → Environment Variables → Edit NEXT_PUBLIC_APP_URL
```

---

## 🔍 Verify Database

```bash
# Test Neon connection (replace with your DATABASE_URL)
psql "postgresql://user:pass@host.neon.tech/db" -c "SELECT COUNT(*) FROM tokens;"

# Should return: 20
```

---

## 🧪 Test Endpoints

```bash
# Replace YOUR_VERCEL_URL with your actual domain

# Get active battles
curl https://YOUR_VERCEL_URL/api/battles?status=active

# Get leaderboard
curl https://YOUR_VERCEL_URL/api/leaderboard?period=season

# Verify a battle (after it settles)
curl https://YOUR_VERCEL_URL/api/verify/BATTLE_UUID
```

---

## 📊 Monitor Vercel

```bash
# View real-time logs
# Go to: https://vercel.com/YOUR_USERNAME/meme-battles/logs

# Check cron jobs
# Go to: https://vercel.com/YOUR_USERNAME/meme-battles/settings/crons

# View analytics
# Go to: https://vercel.com/YOUR_USERNAME/meme-battles/analytics
```

---

## 🗃️ Database Commands

```sql
-- Check token count
SELECT COUNT(*) FROM tokens;

-- View active battles
SELECT id, token_a, token_b, status FROM battles WHERE status = 'active';

-- Check recent predictions
SELECT * FROM predictions ORDER BY created_at DESC LIMIT 10;

-- View leaderboard
SELECT wallet, points FROM users ORDER BY points DESC LIMIT 10;

-- Check audit logs
SELECT * FROM settlement_audit ORDER BY created_at DESC LIMIT 5;
```

---

## 🔧 Troubleshooting

### Reset Local Database
```bash
# Drop and recreate (CAREFUL!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL < schema.sql
```

### Test Rate Limiting
```bash
# Spam requests (should get 429 after limit)
for i in {1..10}; do
  curl https://YOUR_VERCEL_URL/api/battles
  echo "Request $i"
done
```

### Manual Battle Settlement
```bash
# Trigger settlement (requires CRON_SECRET)
curl -X POST https://YOUR_VERCEL_URL/api/battles/BATTLE_UUID/settle \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## 📝 Create More Battles

```sql
-- Add a new battle (90 minutes from now)
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  (
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',  -- BONK
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',  -- POPCAT
    NOW() + INTERVAL '10 minutes',
    NOW() + INTERVAL '100 minutes',
    'scheduled',
    'admin'
  );
```

---

## 🎨 Test Meme Generator

```bash
# Requires authentication
curl -X POST https://YOUR_VERCEL_URL/api/meme/generate \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "topText": "BONK TO THE MOON",
    "bottomText": "I CALLED IT"
  }'
```

---

## 📤 Export Your Ledger

```bash
# As CSV
curl -H "Authorization: Bearer YOUR_JWT" \
  https://YOUR_VERCEL_URL/api/ledger/export?format=csv \
  > my-points.csv

# As JSON
curl -H "Authorization: Bearer YOUR_JWT" \
  https://YOUR_VERCEL_URL/api/ledger/export?format=json \
  | jq '.'
```

---

## 🚨 Emergency Commands

### Pause Cron Job
```bash
# In Vercel: Settings → Crons → Disable
# Or set CRON_SECRET to a different value temporarily
```

### Void a Battle
```sql
UPDATE battles SET status = 'void', settle_reason = 'MANUAL_VOID' WHERE id = 'BATTLE_UUID';
```

### Reset User Points (CAREFUL!)
```sql
-- For testing only!
DELETE FROM points_ledger WHERE wallet = 'USER_WALLET';
UPDATE users SET points = 0 WHERE wallet = 'USER_WALLET';
```

---

## 📈 Analytics Queries

```sql
-- Daily predictions
SELECT DATE(created_at) as day, COUNT(*) as predictions
FROM predictions
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Most predicted battles
SELECT b.id, ta.symbol, tb.symbol, COUNT(p.id) as prediction_count
FROM battles b
JOIN tokens ta ON b.token_a = ta.mint
JOIN tokens tb ON b.token_b = tb.mint
LEFT JOIN predictions p ON b.id = p.battle_id
GROUP BY b.id, ta.symbol, tb.symbol
ORDER BY prediction_count DESC
LIMIT 10;

-- Top point earners
SELECT wallet, points, COUNT(DISTINCT battle_id) as battles_participated
FROM users u
LEFT JOIN points_ledger pl ON u.wallet = pl.wallet
GROUP BY u.wallet, u.points
ORDER BY points DESC
LIMIT 20;
```

---

## 🔐 Get JWT Token (For Testing)

1. Open browser console on your deployed site
2. Connect wallet and sign in
3. Run: `localStorage.getItem('auth_token')`
4. Copy the token for curl commands above

---

## 📱 Social Sharing

```bash
# Create Twitter share link
https://twitter.com/intent/tweet?text=Just+predicted+BONK+will+pump!&url=https://YOUR_VERCEL_URL/battle/BATTLE_UUID

# Create Telegram share link
https://t.me/share/url?url=https://YOUR_VERCEL_URL/battle/BATTLE_UUID&text=Join+the+battle!
```

---

## ✅ Health Check

```bash
# Check all systems
curl https://YOUR_VERCEL_URL/api/battles | jq '.[] | {id, status}'
curl https://YOUR_VERCEL_URL/api/leaderboard | jq '.leaderboard | length'
```

---

**Keep this file handy for quick reference!** 🚀
