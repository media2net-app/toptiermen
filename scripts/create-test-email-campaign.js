// Create a test email campaign for testing the email tracking system
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestEmailCampaign() {
  console.log('📧 Creating test email campaign...');
  
  try {
    // First, create the email campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        name: 'TopTierMen Welkom Email - Test Campaign',
        subject: 'Welkom bij TopTierMen - Jouw reis naar het volgende level begint nu!',
        template_type: 'welcome',
        status: 'completed',
        total_recipients: 3,
        sent_count: 3,
        open_count: 2,
        click_count: 1,
        bounce_count: 0,
        unsubscribe_count: 0,
        sent_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Error creating campaign:', campaignError);
      return;
    }

    console.log('✅ Test campaign created:', campaign.id);

    // Create tracking records with realistic data
    const trackingRecords = [
      {
        campaign_id: campaign.id,
        recipient_email: 'chiel@media2net.nl',
        recipient_name: 'Chiel',
        subject: campaign.subject,
        template_type: 'welcome',
        tracking_id: `ttm_${Date.now()}_001`,
        status: 'clicked',
        sent_at: new Date().toISOString(),
        delivered_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min later
        opened_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min later
        clicked_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 min later
        open_count: 3,
        click_count: 1,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ip_address: '192.168.1.100'
      },
      {
        campaign_id: campaign.id,
        recipient_email: 'test2@example.com',
        recipient_name: 'Test User 2',
        subject: campaign.subject,
        template_type: 'welcome',
        tracking_id: `ttm_${Date.now()}_002`,
        status: 'opened',
        sent_at: new Date().toISOString(),
        delivered_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        opened_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        open_count: 1,
        click_count: 0,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ip_address: '192.168.1.101'
      },
      {
        campaign_id: campaign.id,
        recipient_email: 'test3@example.com',
        recipient_name: 'Test User 3',
        subject: campaign.subject,
        template_type: 'welcome',
        tracking_id: `ttm_${Date.now()}_003`,
        status: 'delivered',
        sent_at: new Date().toISOString(),
        delivered_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        open_count: 0,
        click_count: 0,
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
        ip_address: '192.168.1.102'
      }
    ];

    const { error: trackingError } = await supabase
      .from('email_tracking')
      .insert(trackingRecords);

    if (trackingError) {
      console.error('❌ Error creating tracking records:', trackingError);
      return;
    }

    console.log('✅ Test tracking records created');

    // Create some open records for detailed tracking
    const { data: trackingData } = await supabase
      .from('email_tracking')
      .select('id')
      .eq('campaign_id', campaign.id);

    if (trackingData && trackingData.length > 0) {
      const openRecords = [
        {
          tracking_id: trackingData[0].id,
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ip_address: '192.168.1.100',
          device_type: 'desktop',
          browser: 'Chrome',
          os: 'macOS'
        },
        {
          tracking_id: trackingData[0].id, // Same user opened multiple times
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          ip_address: '192.168.1.100',
          device_type: 'desktop',
          browser: 'Chrome',
          os: 'macOS'
        },
        {
          tracking_id: trackingData[1].id,
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ip_address: '192.168.1.101',
          device_type: 'desktop',
          browser: 'Firefox',
          os: 'Windows'
        }
      ];

      const { error: opensError } = await supabase
        .from('email_opens')
        .insert(openRecords);

      if (opensError) {
        console.error('❌ Error creating open records:', opensError);
      } else {
        console.log('✅ Test open records created');
      }

      // Create a click record
      const clickRecord = {
        tracking_id: trackingData[0].id,
        link_url: 'https://platform.toptiermen.eu/dashboard',
        link_text: 'Start je journey',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ip_address: '192.168.1.100',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'macOS'
      };

      const { error: clickError } = await supabase
        .from('email_clicks')
        .insert([clickRecord]);

      if (clickError) {
        console.error('❌ Error creating click record:', clickError);
      } else {
        console.log('✅ Test click record created');
      }
    }

    console.log('\n🎉 Test email campaign created successfully!');
    console.log('📊 Campaign Stats:');
    console.log(`   - Campaign ID: ${campaign.id}`);
    console.log(`   - Subject: ${campaign.subject}`);
    console.log(`   - Recipients: ${campaign.total_recipients}`);
    console.log(`   - Delivery Rate: 100% (3/3 delivered)`);
    console.log(`   - Open Rate: 66.7% (2/3 opened)`);
    console.log(`   - Click Rate: 33.3% (1/3 clicked)`);
    console.log('\n📧 You can now test sending an email to chiel@media2net.nl');

  } catch (error) {
    console.error('❌ Error creating test campaign:', error);
  }
}

// Run the script
if (require.main === module) {
  createTestEmailCampaign()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestEmailCampaign };
