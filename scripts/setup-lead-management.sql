-- SETUP LEAD MANAGEMENT - Database setup for bulk email campaigns
-- Voer dit uit in je Supabase SQL Editor

-- 1. Create leads table with proper name handling
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200),
  source VARCHAR(100) DEFAULT 'manual',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed', 'bounced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create lead import logs table
CREATE TABLE IF NOT EXISTS lead_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_leads INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  error_details JSONB,
  imported_by UUID
);

-- 3. Create bulk email campaigns table
CREATE TABLE IF NOT EXISTS bulk_email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) DEFAULT 'welcome',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create bulk email recipients table
CREATE TABLE IF NOT EXISTS bulk_email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES bulk_email_campaigns(id),
  lead_id UUID REFERENCES leads(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_bulk_email_campaigns_status ON bulk_email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_bulk_email_recipients_campaign_id ON bulk_email_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bulk_email_recipients_status ON bulk_email_recipients(status);

-- 6. Disable RLS for new tables
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_import_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_email_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_email_recipients DISABLE ROW LEVEL SECURITY;

-- 7. Grant permissions
GRANT ALL ON leads TO authenticated;
GRANT ALL ON lead_import_logs TO authenticated;
GRANT ALL ON bulk_email_campaigns TO authenticated;
GRANT ALL ON bulk_email_recipients TO authenticated;

-- 8. Create function to update full_name automatically
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.full_name = TRIM(
      COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for automatic full_name updates
CREATE TRIGGER trigger_update_full_name
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_full_name();

-- 10. Grant execute permission
GRANT EXECUTE ON FUNCTION update_full_name() TO authenticated;
