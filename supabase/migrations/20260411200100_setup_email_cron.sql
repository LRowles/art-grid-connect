-- ============================================================
-- pg_cron Setup for Timed Reminder Emails
-- ============================================================
-- 
-- PREREQUISITES:
-- 1. Enable pg_cron extension in Supabase Dashboard → Database → Extensions → pg_cron
-- 2. Deploy the send-reminders Edge Function: 
--    supabase functions deploy send-reminders
-- 3. Set the RESEND_API_KEY secret:
--    supabase secrets set RESEND_API_KEY=your_resend_api_key
-- 4. Run this SQL in the Supabase SQL Editor
--
-- NOTE: Replace YOUR_SUPABASE_URL and YOUR_ANON_KEY with your actual values
-- ============================================================

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================================
-- Schedule 1: Deadline Reminder — June 8, 2026 at 10:00 AM PT (17:00 UTC)
-- Sends a "2 weeks left" reminder to all artists who haven't dropped off
-- ============================================================
SELECT cron.schedule(
  'deadline-reminder-2weeks',
  '0 17 8 6 *',  -- June 8 at 5pm UTC (10am PT)
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{"email_type": "deadline_reminder"}'::jsonb
  );
  $$
);

-- ============================================================
-- Schedule 2: Final Deadline Reminder — June 19, 2026 at 10:00 AM PT
-- Sends a "3 days left" reminder
-- ============================================================
SELECT cron.schedule(
  'deadline-reminder-final',
  '0 17 19 6 *',  -- June 19 at 5pm UTC (10am PT)
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{"email_type": "deadline_reminder"}'::jsonb
  );
  $$
);

-- ============================================================
-- Schedule 3: Invitation Email — June 25, 2026 at 10:00 AM PT
-- Sends July 2nd reveal party invitation to all artists
-- ============================================================
SELECT cron.schedule(
  'reveal-party-invitation',
  '0 17 25 6 *',  -- June 25 at 5pm UTC (10am PT)
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{"email_type": "invitation"}'::jsonb
  );
  $$
);

-- ============================================================
-- Schedule 4: Thank You Emails — Daily check at 6:00 PM PT
-- Checks for newly dropped-off canvases and sends thank you emails
-- Runs daily from June 1 through June 30
-- ============================================================
SELECT cron.schedule(
  'thank-you-daily-check',
  '0 1 * 6 *',  -- Every day in June at 1am UTC (6pm PT previous day)
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{"email_type": "thank_you"}'::jsonb
  );
  $$
);

-- ============================================================
-- To view scheduled jobs:
--   SELECT * FROM cron.job;
--
-- To unschedule a job:
--   SELECT cron.unschedule('deadline-reminder-2weeks');
--
-- To manually trigger the Edge Function (for testing):
--   curl -X POST YOUR_SUPABASE_URL/functions/v1/send-reminders \
--     -H "Authorization: Bearer YOUR_ANON_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{"email_type": "deadline_reminder"}'
-- ============================================================
