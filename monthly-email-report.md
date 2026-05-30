# Monthly Email Report — Implementation Plan

## Overview

Automatically send each user a personalized email on the 1st of every month with their interest earnings for that month.

## Email Content

> Thanks for Joining SimpleFinance Investment, your interest this month is $[UserInterestThisMonth].

## Architecture

- **Trigger:** Vercel Cron Job — runs at midnight UTC on the 1st of every month (`0 0 1 * *`)
- **API Route:** Serverless function at `/api/send-monthly-email.js` in the app repo
- **Email Service:** Resend (free tier — 3,000 emails/month, 100/day)
- **Data Source:** Render backend API (already kept awake by existing cron-job.org pinger)

## Flow

1. Vercel cron fires on the 1st of each month
2. Serverless function calls Render backend API to get all users + their interest records for the previous month
3. Calculates total monthly interest per user
4. Sends personalized email to each user via Resend API
5. Returns success/failure summary

## Config Required

### `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/send-monthly-email",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

### Vercel Environment Variables

- `RESEND_API_KEY` — API key from Resend dashboard
- `BACKEND_API_URL` — `https://simplefinance-website.onrender.com`
- `ADMIN_TOKEN` — Bearer token for authenticating admin API calls

## Free Tier Limits

- **Resend:** 3,000 emails/month, 100 emails/day — sufficient for current user base
- **Vercel Hobby:** 2 cron jobs allowed, 10-second function timeout — sufficient for small user count
- **Render:** Already kept awake by cron-job.org, no cold start concern

## Scaling Notes

- If user count exceeds ~50-100 and emails take longer than 10s, batch sending will be needed
- Resend free tier caps at 100 emails/day — if user count exceeds this, send in batches across multiple days or upgrade plan

## Prerequisites

1. Sign up at resend.com and get an API key
2. Verify a sender domain or use Resend's default `onboarding@resend.dev` for testing
3. Add a backend endpoint that returns each user's monthly interest total (or use existing admin endpoints)
4. Add env vars to Vercel project settings
