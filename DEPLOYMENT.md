# Deployment Guide for BeachSeeker 🚀

BeachSeeker is ready for the world! Since it's built with Next.js, the easiest and most powerful way to deploy it is via **Vercel**.

## Prerequisites

1.  **A GitHub Account**: To host your code.
2.  **A Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **A Production Database**: Since you're using PostgreSQL, I recommend:
    *   **Neon** ([neon.tech](https://neon.tech)) - Extremely fast and has a great free tier.
    *   **Supabase** ([supabase.com](https://supabase.com)) - Another excellent option.
    *   **Vercel Postgres** - Integrated directly into Vercel.

## Step-by-Step Deployment

### 1. Push your code to GitHub
If you haven't already, create a new repository on GitHub and push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Set up your Production Database
1. Create a new project on **Neon** or **Supabase**.
2. Copy the **Connection String** (it should look like `postgresql://user:password@host/dbname`).

### 3. Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. In the **Environment Variables** section, add the following:
    *   `DATABASE_URL`: Your production connection string from Step 2.
    *   `GOOGLE_AI_API_KEY`: Your Gemini API key.
4. Click **Deploy**!

### 4. Seed the Production Database
Once deployed, you'll need to populate your production database with beach data. You can do this by running the seed script locally but pointing it to your production URL:
```bash
DATABASE_URL="your-production-url" npx tsx src/db/seed.ts
```

## Maintenance
*   **Updates**: Every time you push to your `main` branch on GitHub, Vercel will automatically redeploy your app.
*   **Analytics**: You can enable Vercel Analytics in the dashboard to see how many people are visiting your paradise.

---
**Need help?** Just ask! I can help you with specific database setups or troubleshooting deployment errors.
