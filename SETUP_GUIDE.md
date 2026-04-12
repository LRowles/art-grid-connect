# Art of Aviation Community Mural — Setup Guide

## What Was Built

This update adds **10 major features** to the Art of Aviation Community Mural website:

### New Pages
1. **Events Page** (`/events`) — Timeline of all project events: canvas pickup (May 1), deadline (June 22), Artown Kickoff & mural unveiling (July 2), Discovery aviation exhibit (July 2+), and Red White & Flight (July 4)
2. **Follow Along Page** (`/follow-along`) — Community feed where artists upload photos/videos of their creative process, plus an artist directory sidebar

### Homepage Updates
3. **Meet the Artist — Reilly Moss** callout with mural artwork preview, bio excerpt, and links
4. **Red White & Flight banner** moved to the bottom of the page
5. **Pathways to Aviation** promotion section linking to pathwaystoaviation.org
6. **Enhanced Registration Form** with optional fields: short bio, website, social media handle, and aviation connection

### Interactive Features
7. **Hover Tooltips** on grid squares — hovering over a claimed square shows the artist's name, bio, social link, and aviation connection
8. **Social Media Sharing** — after registration, artists can share on Twitter/X, Facebook, or copy a link

### About Page Updates
9. **Full Reilly Moss Artist Feature** — complete bio, artist statement from her proposal, mural artwork image, and links to reillymoss.com and @reillymossart
10. **Pathways to Aviation** section on the About page

### Email System
11. **Timed Reminder Emails** via Supabase Edge Functions + pg_cron:
    - **Deadline reminder** (June 8 — 2 weeks before)
    - **Final deadline reminder** (June 19 — 3 days before)
    - **Thank you email** (daily check for dropped-off canvases)
    - **July 2nd invitation** (sent June 25)

---

## Database Setup (Required)

You need to run the SQL migration to add new columns and tables. Here's how:

### Step 1: Run the Migration SQL

1. Go to your **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copy and paste the contents of `supabase/migrations/20260411200000_artist_profiles_and_posts.sql`
3. Click **Run**

This will:
- Add `bio`, `website`, `social_handle`, `aviation_connection`, `aviation_description`, and `avatar_url` columns to the `artists` table
- Create the `artist_posts` table (for Follow Along content)
- Create the `email_reminders` table (for tracking sent emails)
- Set up RLS policies for the new tables

### Step 2: Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage** → **New Bucket**
2. Name it: `artist-uploads`
3. Set it to **Public**
4. Add allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`

---

## Email Reminders Setup (Optional but Recommended)

### Step 1: Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login and link your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=your_resend_api_key

# Deploy the function
supabase functions deploy send-reminders
```

### Step 2: Enable pg_cron

1. Go to **Supabase Dashboard** → **Database** → **Extensions**
2. Search for `pg_cron` and enable it
3. Also enable `pg_net` (needed for HTTP requests from cron jobs)

### Step 3: Schedule the Cron Jobs

1. Go to **SQL Editor** → **New Query**
2. Copy the contents of `supabase/migrations/20260411200100_setup_email_cron.sql`
3. **Replace** `YOUR_SUPABASE_URL` with your actual Supabase URL (e.g., `https://abc123.supabase.co`)
4. **Replace** `YOUR_ANON_KEY` with your Supabase anon key
5. Click **Run**

### Step 4: Test (Optional)

```bash
curl -X POST YOUR_SUPABASE_URL/functions/v1/send-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_type": "deadline_reminder"}'
```

---

## Email Schedule Summary

| Email Type | Date | Description |
|---|---|---|
| `deadline_reminder` | June 8, 2026 | "2 weeks left" reminder to artists who haven't returned canvas |
| `deadline_reminder` | June 19, 2026 | "3 days left" final reminder |
| `thank_you` | Daily in June | Automatic thank you when canvas status changes to "dropped_off" |
| `invitation` | June 25, 2026 | July 2nd reveal party invitation to all artists |

---

## Navigation Structure

| Page | URL | Description |
|---|---|---|
| Register (Home) | `/` | Main registration page with mural grid |
| About | `/about` | Project info, Reilly Moss feature, partners |
| Events | `/events` | Timeline of all events |
| Follow Along | `/follow-along` | Artist community feed and directory |
| Admin | `/admin` | Protected admin dashboard |

---

## Files Changed

| File | Change |
|---|---|
| `src/App.tsx` | Added Events and FollowAlong routes |
| `src/components/PublicNav.tsx` | Added Events and Follow Along nav links |
| `src/pages/Register.tsx` | Reilly Moss callout, enhanced form, hover tooltips, social sharing, RWF moved, Pathways to Aviation |
| `src/pages/About.tsx` | Full Reilly Moss feature, Pathways to Aviation, updated partners |
| `src/pages/Events.tsx` | **NEW** — Events timeline page |
| `src/pages/FollowAlong.tsx` | **NEW** — Follow Along community feed page |
| `src/assets/mural-artwork.png` | **NEW** — Reilly Moss mural artwork image |
| `src/integrations/supabase/types.ts` | Updated with new artist fields and tables |
| `supabase/migrations/20260411200000_...sql` | **NEW** — Database migration |
| `supabase/migrations/20260411200100_...sql` | **NEW** — pg_cron email scheduling |
| `supabase/functions/send-reminders/index.ts` | **NEW** — Edge Function for timed emails |
