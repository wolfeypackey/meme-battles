# Deployment Guide - Ship Today

This guide will get your Meme Battles platform live in under 30 minutes.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] Neon account for Postgres (free tier works)

## Step 1: Database Setup (5 minutes)

### Option A: Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Name it "meme-battles"
4. Copy the connection string (looks like `postgresql://user:pass@host/dbname`)
5. In Neon's SQL Editor, paste contents of `schema.sql` and run
6. Verify: Check that tables exist and 6 tokens are seeded

### Option B: Local Postgres

```bash
# Create database
createdb meme_battles

# Run schema
psql meme_battles < schema.sql

# Get connection string
echo "postgresql://localhost/meme_battles"
```

## Step 2: Environment Setup (3 minutes)

### Generate Secrets

```bash
# Generate random secrets (Mac/Linux)
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for SERVER_HMAC_SECRET
openssl rand -base64 32  # Use for CRON_SECRET
```

### Create `.env.local`

```env
# Database
DATABASE_URL=postgresql://your-neon-connection-string

# Auth (use generated secrets from above)
JWT_SECRET=your-jwt-secret-here
SERVER_HMAC_SECRET=your-hmac-secret-here
CRON_SECRET=your-cron-secret-here

# Pyth (use default)
PYTH_ENDPOINT=https://hermes.pyth.network

# App (for local testing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Test Locally (5 minutes)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:3000 and verify:
- [ ] Homepage loads with 3 seeded battles
- [ ] Connect wallet button works
- [ ] Click a battle to see detail page
- [ ] Leaderboard page loads

## Step 4: Push to GitHub (2 minutes)

```bash
# Initialize git (if not done)
git init

# Add files
git add .
git commit -m "Initial commit - Meme Battles MVP"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/meme-battles.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy to Vercel (10 minutes)

### Deploy

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)

### Add Environment Variables

In Vercel project settings → "Environment Variables", add:

```
DATABASE_URL = postgresql://your-neon-connection-string
JWT_SECRET = your-jwt-secret
SERVER_HMAC_SECRET = your-hmac-secret
CRON_SECRET = your-cron-secret
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
```

**Important**: After adding `NEXT_PUBLIC_APP_URL`, trigger a redeploy for it to take effect.

### Deploy!

Click "Deploy" - Vercel will:
- Build your Next.js app
- Deploy to edge network
- Set up automatic cron job from `vercel.json`

## Step 6: Verify Deployment (5 minutes)

### Check Homepage

Visit `https://your-project.vercel.app`

- [ ] Homepage loads
- [ ] Battles are visible
- [ ] Wallet connection works

### Check Cron Job

1. In Vercel dashboard, go to "Deployments" → Latest deployment
2. Click "Functions" → "Cron Jobs"
3. Verify `/api/cron/manage-battles` is scheduled
4. Check logs to see it ran successfully

### Test Full Flow

1. Connect Phantom or Backpack wallet
2. Sign authentication message
3. Go to a battle
4. Make a prediction
5. Check leaderboard for your wallet

## Step 7: Create First Real Battle (5 minutes)

### Option A: Via Database

```sql
-- Add battle starting in 10 minutes, ending in 100 minutes
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  (
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',  -- BONK
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',  -- WIF
    NOW() + INTERVAL '10 minutes',
    NOW() + INTERVAL '100 minutes',
    'scheduled',
    'admin'
  );
```

### Option B: Via API

```bash
# Get JWT token first by connecting wallet
# Then:
curl -X POST https://your-project.vercel.app/api/battles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenA": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "tokenB": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    "startsAt": "2025-10-28T20:00:00Z",
    "endsAt": "2025-10-28T21:30:00Z"
  }'
```

## Step 8: Monitor & Iterate

### Check Cron Logs

In Vercel:
1. Go to your project
2. Click "Logs" → Filter by function `/api/cron/manage-battles`
3. Verify battles are being activated and settled

### Watch for Errors

- Check Vercel function logs for API errors
- Monitor Neon dashboard for database issues
- Test prediction flow with multiple wallets

## Common Issues & Fixes

### Cron not running
- Verify `vercel.json` is in root directory
- Check Vercel project has cron enabled (free tier has limits)
- Manually trigger: `curl -X POST https://your-project.vercel.app/api/cron/manage-battles -H "Authorization: Bearer YOUR_CRON_SECRET"`

### Wallet auth fails
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console for CORS errors
- Verify JWT_SECRET is same in all environments

### Battles not settling
- Check Pyth API is accessible (test: `curl https://hermes.pyth.network/v2/updates/price/latest?ids=...`)
- Verify Pyth feed IDs in `tokens` table are correct
- Check cron logs for settlement errors

### Database connection issues
- Verify DATABASE_URL has `?sslmode=require` if using Neon
- Check Neon project isn't suspended (free tier limits)
- Test connection: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM battles;"`

## Performance Tips

1. **Index optimization**: Already included in `schema.sql`
2. **Connection pooling**: Built into `lib/db.js`
3. **Edge caching**: Add to `vercel.json` for static assets
4. **Rate limiting**: Consider Vercel Edge Config or Upstash

## Security Checklist

- [ ] All secrets are unique and random (32+ chars)
- [ ] `CRON_SECRET` is set and verified in cron handler
- [ ] Database connection uses SSL
- [ ] JWT tokens expire (7 days default)
- [ ] HMAC verification on points ledger

## Launch Checklist

- [ ] Database schema deployed
- [ ] Tokens seeded with correct Pyth IDs
- [ ] Environment variables set in Vercel
- [ ] Cron job running every minute
- [ ] Test battle created and settled successfully
- [ ] Wallet authentication working
- [ ] Prediction flow tested end-to-end
- [ ] Leaderboard displaying correctly
- [ ] Mobile responsive (test on phone)

## Next Steps

1. **Announce on X**: Share your deployment link
2. **Seed more battles**: Keep 3-5 active at all times
3. **Monitor first users**: Watch for bugs in production
4. **Gather feedback**: What features do users want?
5. **Iterate**: Ship improvements daily

## Maintenance

### Daily
- Check cron logs for errors
- Verify battles are settling correctly
- Monitor user signups

### Weekly
- Review leaderboard for anomalies
- Add new popular tokens
- Create upcoming battles

### Monthly
- Analyze Neon database usage
- Review Vercel function usage
- Plan season rewards

---

**You're live!** 🚀

Share your link: `https://your-project.vercel.app`

Join the community: [Discord/Telegram TBA]
