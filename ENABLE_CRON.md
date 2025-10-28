# Enable Vercel Cron Job for Battle Management

## What the Cron Does

The cron job at `/api/cron/manage-battles` runs every minute to:
1. Activate scheduled battles that have started (`scheduled` → `active`)
2. Settle battles that have ended (`active` → `settling` → `settled`)

## Why It's Not Working Yet

Vercel cron jobs need to be enabled in the dashboard. Currently, battles must be manually activated.

## How to Enable

1. Go to your Vercel project: https://vercel.com/wolfeypackey/meme-battles
2. Navigate to **Settings** → **Cron Jobs**
3. You should see the cron defined in `vercel.json`:
   - Path: `/api/cron/manage-battles`
   - Schedule: `* * * * *` (every minute)
4. Make sure it's **enabled**
5. Verify the `CRON_SECRET` environment variable is set in **Settings** → **Environment Variables**

## Manual Activation (Temporary Solution)

Until the cron is enabled, you can manually activate battles by running:

```bash
node activate_battles.js
```

This script:
- Connects to your Neon database
- Updates battles with `status='scheduled'` and `starts_at <= NOW()` to `status='active'`
- Shows all current battles and their statuses

## Testing the Cron Manually

Once `CRON_SECRET` is set in Vercel, you can test the cron endpoint:

```bash
curl -X GET https://meme-battles.vercel.app/api/cron/manage-battles \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from `.env.local` or Vercel environment variables.

## Future Battles

Once the cron is enabled, all future battles will automatically:
- Start when their `starts_at` time is reached
- Settle when their `ends_at` time is reached
- Distribute points to winners

No manual intervention needed!
