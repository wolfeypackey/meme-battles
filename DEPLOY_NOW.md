# 🚀 Deploy Meme Battles Right Now (30 Minutes)

Follow these steps in order. Don't skip any!

## ✅ Pre-Deploy Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Neon account (sign up at neon.tech)

---

## Step 1: Set Up Database (5 minutes)

### 1.1 Create Neon Project

1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" or "Log In"
3. Click "Create a project"
4. Name it: `meme-battles-prod`
5. Copy the connection string (looks like `postgresql://...`)

### 1.2 Run Schema

1. In Neon dashboard, click "SQL Editor"
2. Open your local `schema.sql` file
3. Copy ALL contents
4. Paste into SQL Editor
5. Click "Run" (green button)
6. Verify: Should see "Success" and tables created

**IMPORTANT**: Check the "tokens" table has 20 rows!

---

## Step 2: Generate Secrets (2 minutes)

Open Terminal and run:

```bash
cd /Users/bradohara/meme-battles

# Generate 3 random secrets
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SERVER_HMAC_SECRET=$(openssl rand -base64 32)"
echo "CRON_SECRET=$(openssl rand -base64 32)"
```

**Copy these outputs!** You'll need them in Step 5.

---

## Step 3: Initialize Git (3 minutes)

```bash
cd /Users/bradohara/meme-battles

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Meme Battles MVP with enhancements"
```

---

## Step 4: Push to GitHub (5 minutes)

### 4.1 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the "+" in top right → "New repository"
3. Name it: `meme-battles`
4. Make it **Public** (so Vercel can access)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 4.2 Push Code

Copy the commands from GitHub (will look like this):

```bash
cd /Users/bradohara/meme-battles

git remote add origin https://github.com/YOUR_USERNAME/meme-battles.git
git branch -M main
git push -u origin main
```

**Verify**: Refresh GitHub page - you should see all your files!

---

## Step 5: Deploy to Vercel (10 minutes)

### 5.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Click "Import" next to your `meme-battles` repo
4. Click "Import"

### 5.2 Configure Project

**Framework Preset**: Next.js (should auto-detect)

**Root Directory**: `./` (leave as default)

### 5.3 Add Environment Variables

Click "Environment Variables" and add these **ONE BY ONE**:

```
DATABASE_URL
```
Value: Your Neon connection string from Step 1

```
JWT_SECRET
```
Value: First secret from Step 2

```
SERVER_HMAC_SECRET
```
Value: Second secret from Step 2

```
CRON_SECRET
```
Value: Third secret from Step 2

```
PYTH_ENDPOINT
```
Value: `https://hermes.pyth.network`

```
NEXT_PUBLIC_APP_URL
```
Value: `https://YOUR-PROJECT-NAME.vercel.app` (Vercel will show you this)

**Note**: For `NEXT_PUBLIC_APP_URL`, use the domain Vercel shows you. You can update it after first deploy.

### 5.4 Deploy!

Click "Deploy" button.

⏱️ This will take 2-3 minutes. Watch the logs!

---

## Step 6: Update App URL (2 minutes)

After deployment succeeds:

1. Copy your Vercel URL (e.g., `https://meme-battles-xyz.vercel.app`)
2. In Vercel dashboard, go to "Settings" → "Environment Variables"
3. Find `NEXT_PUBLIC_APP_URL`
4. Click "Edit" → Update with your actual Vercel URL
5. Click "Save"
6. Go to "Deployments" tab
7. Click "Redeploy" on the latest deployment (to apply new env var)

---

## Step 7: Verify Deployment (3 minutes)

### 7.1 Check Homepage

Visit: `https://your-project.vercel.app`

You should see:
- ✅ Homepage loads
- ✅ "Connect Wallet" button visible
- ✅ 3 battles listed (from seed data)

### 7.2 Check Cron Job

1. In Vercel, go to your project
2. Click "Settings" → "Crons"
3. Verify `/api/cron/manage-battles` is scheduled (every minute)

### 7.3 Test Wallet Connection

1. Click "Connect Wallet"
2. Select Phantom or Backpack
3. Sign the authentication message
4. You should see your wallet address in header
5. Check for "+50 bonus points" notification

### 7.4 Make a Prediction (optional)

1. Click on a battle
2. Select Token A or Token B
3. Click "Submit Prediction"
4. Should see "+10 points" success message

---

## 🎉 You're Live!

Your platform is now deployed at: `https://your-project.vercel.app`

### Share Your Launch

Tweet this:

```
🚀 Just launched Meme Battles!

Predict which meme tokens pump harder, earn points, win prizes.

✅ Free to play
✅ No funding needed
✅ AI-powered settlements
✅ Season 1 NOW LIVE

Try it: https://your-project.vercel.app

#Solana #MemeCoin #Web3
```

---

## 🔧 Post-Deploy Tasks (Do These Next)

### Immediately:
- [ ] Test all features (battles, predictions, leaderboard)
- [ ] Create 3-5 more battles for variety
- [ ] Join Discord/Telegram communities to announce

### Within 24 Hours:
- [ ] Monitor Vercel logs for errors
- [ ] Check Neon database usage
- [ ] Verify cron is running (check "Functions" logs)
- [ ] Test ledger export endpoint

### Within 1 Week:
- [ ] Verify Pyth price feed IDs (replace placeholders in schema)
- [ ] Add your logo to `/public`
- [ ] Set up analytics (Vercel Analytics or Google Analytics)
- [ ] Create Twitter account for platform

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` in Vercel env vars
- Verify Neon project isn't paused
- Test connection: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM tokens;"`

### "Wallet won't connect"
- Check `NEXT_PUBLIC_APP_URL` matches your Vercel domain
- Try incognito/private window
- Check browser console for errors

### "Battles not settling"
- Check Vercel "Functions" → "Crons" logs
- Verify `CRON_SECRET` is set
- Manually trigger: Visit `/api/cron/manage-battles` (requires auth header)

### "Rate limit errors"
- This is normal if testing heavily
- Wait 1-5 minutes and try again
- Rate limits are intentionally strict

---

## 📊 Monitor These Metrics

**Day 1**:
- Unique wallet connections
- Total predictions made
- Battles settled successfully

**Week 1**:
- Daily active users
- Retention rate
- Memes generated

**Month 1**:
- Top 10 leaderboard competition
- Total points distributed
- Community growth (Twitter followers)

---

## 🆘 Need Help?

- **Docs**: Check `README.md`, `DEPLOYMENT.md`, `ENHANCEMENTS.md`
- **Vercel Issues**: Check their status page
- **Database Issues**: Check Neon dashboard
- **Code Issues**: Check GitHub commits

---

## ✅ Deployment Complete!

Congratulations! You just shipped a production dApp in 30 minutes. 🎉

**Your checklist**:
- [x] Database created and seeded
- [x] Code pushed to GitHub
- [x] Deployed to Vercel
- [x] Environment variables configured
- [x] Cron job active
- [x] Features tested
- [ ] Launch announced
- [ ] First users onboarded

**Now go make it go viral!** 🚀
