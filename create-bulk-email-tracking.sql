-- Create bulk email tracking table for production email campaigns
CREATE TABLE IF NOT EXISTS public.bulk_email_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES public.bulk_email_campaigns(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.bulk_email_recipients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  tracking_id text UNIQUE NOT NULL,
  template text,
  sent_at timestamp with time zone DEFAULT now(),
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  user_agent text,
  ip_address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_bulk_email_tracking_tracking_id ON public.bulk_email_tracking (tracking_id);
CREATE INDEX IF NOT EXISTS idx_bulk_email_tracking_campaign_id ON public.bulk_email_tracking (campaign_id);
CREATE INDEX IF NOT EXISTS idx_bulk_email_tracking_email ON public.bulk_email_tracking (email);
CREATE INDEX IF NOT EXISTS idx_bulk_email_tracking_status ON public.bulk_email_tracking (status);
CREATE INDEX IF NOT EXISTS idx_bulk_email_tracking_sent_at ON public.bulk_email_tracking (sent_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.bulk_email_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage bulk email tracking" ON public.bulk_email_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to create table if not exists (for API call)
CREATE OR REPLACE FUNCTION create_bulk_email_tracking_if_not_exists()
RETURNS void AS $$
BEGIN
  -- This function is just a placeholder since the table is created above
  -- It's called from the API to ensure the table exists
  RAISE NOTICE 'Bulk email tracking table exists';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON public.bulk_email_tracking TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
