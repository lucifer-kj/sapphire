-- Sapphire Phase 3: Delivery Tick & Keep-Alive Cron Jobs
-- Enables pg_cron and pg_net extensions for automated delivery webhook triggers

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Delivery Tick Cron Job (Runs hourly at minute 0)
-- Queries scheduled posts that are due, and triggers the n8n Delivery Webhook via pg_net
SELECT cron.schedule(
    'sapphire-delivery-tick',
    '0 * * * *',
    $$
    SELECT net.http_post(
        url := (SELECT current_setting('custom.n8n_webhook_url', true)),
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-sapphire-secret', (SELECT current_setting('custom.n8n_webhook_secret', true))
        ),
        body := jsonb_build_object(
            'trigger', 'delivery_tick',
            'timestamp', NOW(),
            'due_posts', (
                SELECT json_agg(p)
                FROM posts p
                WHERE p.status = 'scheduled' AND p.scheduled_for <= NOW()
            )
        )
    );
    $$
);

-- 2. Database Keep-Alive Cron Job (Runs daily at 03:00 UTC to prevent Supabase 7-day inactivity pause)
SELECT cron.schedule(
    'sapphire-keep-alive',
    '0 3 * * *',
    $$ SELECT 1; $$
);
