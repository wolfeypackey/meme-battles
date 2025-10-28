# Meme Battles - AI-Powered Points-Based Prediction Platform

A lean, ship-today web dApp for predicting meme token price battles with **no real-money betting**, Pyth-based price settlement, and seasonal leaderboards.

## Features

- 🎮 **Points-Based Predictions**: Predict which token pumps harder, earn points
- 🏆 **Leaderboard**: Compete for top spots and season rewards
- 📊 **Pyth Price Settlement**: Transparent, verifiable outcomes using Pyth Network
- 🔐 **Wallet Authentication**: Sign in with Solana wallet (Phantom/Backpack)
- 🎯 **Zero Cost**: Free to play, no wallet funding required
- 🤖 **Automated**: Cron jobs handle battle lifecycle automatically
- 📤 **Ledger Export**: Export your points history as CSV/JSON for verification
- 🛡️ **Rate Limiting**: Protection against bot abuse and spam
- 🎨 **Meme Generator**: Create shareable battle memes with custom text
- 📝 **Audit Trail**: Append-only settlement logs for compliance and transparency
- 🔄 **Retry Logic**: Robust Pyth integration with automatic retries

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Wallet**: Solana Wallet Adapter
- **Database**: PostgreSQL (Neon recommended)
- **Price Oracles**: Pyth Network
- **Hosting**: Vercel

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or local)
- npm or yarn

### 2. Clone & Install

```bash
cd meme-battles
npm install
```

### 3. Database Setup

Create a Postgres database on [Neon](https://neon.tech) (or locally):

```bash
# Run the schema
psql $DATABASE_URL < schema.sql
```

This creates all tables and seeds 6 popular tokens + 3 initial battles.

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Required variables:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-random-secret-32-chars
SERVER_HMAC_SECRET=your-random-secret-32-chars
CRON_SECRET=your-cron-secret
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SERVER_HMAC_SECRET`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
4. Deploy!

### 3. Verify Cron Jobs

Vercel automatically sets up the cron job from `vercel.json` to run every minute:
- Activates scheduled battles
- Settles ended battles
- Distributes points

Check logs in Vercel dashboard under "Functions" → "Crons"

## API Endpoints

### Authentication
- `GET /api/auth/nonce?wallet=<address>` - Get nonce for signing
- `POST /api/auth/verify` - Verify signature and get JWT

### Battles
- `GET /api/battles?status=active&limit=20` - List battles
- `GET /api/battles/:id` - Get battle details
- `POST /api/battles/:id/settle` - Settle battle (cron or manual)

### Predictions
- `POST /api/predictions` - Submit prediction (requires JWT)

### Leaderboard
- `GET /api/leaderboard?period=season&limit=100`

### Verification
- `GET /api/verify/:battleId` - Get settlement proof

### Ledger Export
- `GET /api/ledger/export?wallet=<addr>&format=csv|json` - Export points history

### Meme Generator
- `POST /api/meme/generate` - Generate meme image

## Points System

- **Join Bonus**: +50 points (first login)
- **Prediction Submitted**: +10 points
- **Correct Prediction**: +100 points
- **Incorrect Prediction**: 0 points

## Settlement Rules

For each battle:
1. Fetch Pyth prices for both tokens at `starts_at` and `ends_at`
2. Calculate `%Δ = (price_end - price_start) / price_start * 100`
3. Winner = token with higher %Δ
4. TIE if |ΔA - ΔB| < 0.10%
5. VOID if price data unavailable

All settlement data is stored and verifiable via `/api/verify/:battleId`

## Database Schema

Key tables:
- `tokens` - Supported tokens with Pyth feed IDs
- `battles` - Head-to-head token battles
- `predictions` - User predictions (1 per wallet per battle)
- `points_ledger` - Append-only points log (HMAC protected)
- `users` - Wallet addresses and cumulative points

See `schema.sql` for full structure.

## Adding New Tokens

Insert into `tokens` table with correct Pyth price feed ID:

```sql
INSERT INTO tokens (mint, symbol, name, pyth_price_id) VALUES
  ('TokenMintAddress', 'SYMBOL', 'Token Name', 'pyth-feed-id-here');
```

Find Pyth feed IDs at: https://pyth.network/developers/price-feed-ids

## Creating Battles (Admin)

Use the API or insert directly:

```sql
INSERT INTO battles (token_a, token_b, starts_at, ends_at, status, created_by) VALUES
  ('token_mint_1', 'token_mint_2', NOW() + INTERVAL '10 minutes', NOW() + INTERVAL '100 minutes', 'scheduled', 'admin_wallet');
```

## Security Features

- **Nonce-based auth**: Prevents replay attacks
- **JWT tokens**: 7-day expiry
- **HMAC ledger**: Tamper-evident points history
- **One prediction per wallet**: Enforced by unique constraint
- **Prediction cutoff**: Last 60 seconds locked
- **Rate limiting**: Recommended via Vercel Edge Config

## Roadmap

**MVP (Launch Today)**:
- ✅ Points-based predictions
- ✅ Pyth price settlement
- ✅ Leaderboard
- ✅ Wallet authentication

**Phase 2**:
- [ ] Simple meme image generator
- [ ] X (Twitter) share integration
- [ ] Social quests (follow, retweet)
- [ ] Referral system

**Phase 3**:
- [ ] Platform token launch via pump.fun
- [ ] Season rewards (NFTs, airdrops)
- [ ] Advanced AI video clips
- [ ] Mobile app

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/meme-battles/issues)
- Documentation: [Full tech spec](./TECH_SPEC.md)

## License

MIT

---

Built with ❤️ for the Solana meme coin community
