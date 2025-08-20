const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCampaignsDatabase() {
  try {
    console.log('🎯 Setting up campaigns database...');

    // Create campaigns table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS campaigns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          video_id VARCHAR(255) NOT NULL,
          video_name VARCHAR(255) NOT NULL,
          objective VARCHAR(50) DEFAULT 'CONSIDERATION',
          budget_amount DECIMAL(10,2) NOT NULL,
          budget_currency VARCHAR(3) DEFAULT 'EUR',
          budget_type VARCHAR(20) DEFAULT 'DAILY',
          targeting JSONB,
          placements JSONB,
          ad_format VARCHAR(20) DEFAULT 'VIDEO',
          status VARCHAR(20) DEFAULT 'DRAFT',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Error creating campaigns table:', createError);
      return;
    }

    console.log('✅ Campaigns table created successfully');

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_campaigns_video_id ON campaigns(video_id);
        CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
        CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Allow authenticated users to read campaigns" ON campaigns;
        DROP POLICY IF EXISTS "Allow authenticated users to insert campaigns" ON campaigns;
        DROP POLICY IF EXISTS "Allow authenticated users to update campaigns" ON campaigns;
        DROP POLICY IF EXISTS "Allow authenticated users to delete campaigns" ON campaigns;
        
        CREATE POLICY "Allow authenticated users to read campaigns" ON campaigns
          FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Allow authenticated users to insert campaigns" ON campaigns
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Allow authenticated users to update campaigns" ON campaigns
          FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Allow authenticated users to delete campaigns" ON campaigns
          FOR DELETE USING (auth.role() = 'authenticated');
      `
    });

    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Insert sample data
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO campaigns (name, video_id, video_name, objective, budget_amount, budget_currency, budget_type, targeting, placements, ad_format, status) VALUES
        (
          'TTM Het Merk - Q4 2024',
          'sample-video-1',
          'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov',
          'CONSIDERATION',
          5.00,
          'EUR',
          'DAILY',
          '{"ageMin": 25, "ageMax": 45, "gender": "MEN", "locations": ["Nederland"], "languages": ["Nederlands"], "interests": ["Fitness", "Personal Training"], "behaviors": ["Frequent gym bezoekers"], "exclusions": []}',
          '{"facebook": true, "instagram": true, "audienceNetwork": false, "messenger": false}',
          'VIDEO',
          'DRAFT'
        ),
        (
          'TTM Zakelijk - Q4 2024',
          'sample-video-2',
          'TTM_Zakelijk_Reel_01.mov',
          'AWARENESS',
          5.00,
          'EUR',
          'DAILY',
          '{"ageMin": 30, "ageMax": 50, "gender": "MEN", "locations": ["Nederland"], "languages": ["Nederlands"], "interests": ["Ondernemerschap", "Business"], "behaviors": ["LinkedIn users"], "exclusions": []}',
          '{"facebook": true, "instagram": false, "audienceNetwork": false, "messenger": false}',
          'VIDEO',
          'ACTIVE'
        )
        ON CONFLICT DO NOTHING;
      `
    });

    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
    } else {
      console.log('✅ Sample campaigns inserted successfully');
    }

    console.log('🎉 Campaigns database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up campaigns database:', error);
  }
}

setupCampaignsDatabase();
