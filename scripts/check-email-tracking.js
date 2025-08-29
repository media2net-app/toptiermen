// Check email tracking data in database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmailTracking() {
  try {
    console.log('🔍 Checking email tracking data...\n');
    
    // Get the latest campaign
    const { data: campaigns, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (campaignError) {
      console.error('❌ Error fetching campaigns:', campaignError);
      return;
    }

    console.log('📧 Recent Campaigns:');
    console.log('===================');
    campaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   Subject: ${campaign.subject}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Created: ${campaign.created_at}`);
      console.log(`   Sent: ${campaign.sent_at || 'Not sent'}`);
      console.log('');
    });

    // Get tracking records for the latest campaign
    const latestCampaign = campaigns[0];
    console.log(`🔍 Checking tracking for campaign: ${latestCampaign.name}`);
    console.log('================================================');

    const { data: tracking, error: trackingError } = await supabase
      .from('email_tracking')
      .select('*')
      .eq('campaign_id', latestCampaign.id);

    if (trackingError) {
      console.error('❌ Error fetching tracking:', trackingError);
      return;
    }

    if (tracking.length === 0) {
      console.log('❌ No tracking records found for this campaign');
      return;
    }

    tracking.forEach((record, index) => {
      console.log(`📧 Tracking Record ${index + 1}:`);
      console.log(`   Email: ${record.recipient_email}`);
      console.log(`   Status: ${record.status}`);
      console.log(`   Tracking ID: ${record.tracking_id}`);
      console.log(`   Sent: ${record.sent_at || 'Not sent'}`);
      console.log(`   Opened: ${record.opened_at || 'Not opened'}`);
      console.log(`   Clicked: ${record.clicked_at || 'Not clicked'}`);
      console.log(`   Open Count: ${record.open_count}`);
      console.log(`   Click Count: ${record.click_count}`);
      console.log('');
    });

    // Check for open records
    const trackingId = tracking[0]?.id;
    if (trackingId) {
      console.log('👁️ Checking email opens...');
      const { data: opens, error: opensError } = await supabase
        .from('email_opens')
        .select('*')
        .eq('tracking_id', trackingId);

      if (opens && opens.length > 0) {
        console.log(`✅ Found ${opens.length} open(s):`);
        opens.forEach((open, index) => {
          console.log(`   Open ${index + 1}: ${open.opened_at}`);
          console.log(`   Browser: ${open.browser}`);
          console.log(`   Device: ${open.device_type}`);
          console.log(`   IP: ${open.ip_address}`);
        });
      } else {
        console.log('❌ No open records found');
      }

      // Check for click records
      console.log('\n🖱️ Checking email clicks...');
      const { data: clicks, error: clicksError } = await supabase
        .from('email_clicks')
        .select('*')
        .eq('tracking_id', trackingId);

      if (clicks && clicks.length > 0) {
        console.log(`✅ Found ${clicks.length} click(s):`);
        clicks.forEach((click, index) => {
          console.log(`   Click ${index + 1}: ${click.clicked_at}`);
          console.log(`   URL: ${click.link_url}`);
          console.log(`   Browser: ${click.browser}`);
          console.log(`   IP: ${click.ip_address}`);
        });
      } else {
        console.log('❌ No click records found');
      }
    }

    console.log('\n🔧 Tracking URLs for testing:');
    if (tracking[0]) {
      const trackingParam = tracking[0].tracking_id;
      console.log(`Open tracking: https://platform.toptiermen.eu/email-track/open?t=${trackingParam}`);
      console.log(`Click tracking: https://platform.toptiermen.eu/email-track/click?t=${trackingParam}&url=https://platform.toptiermen.eu/dashboard`);
    }

  } catch (error) {
    console.error('❌ Error checking tracking:', error);
  }
}

// Run the check
checkEmailTracking()
  .then(() => {
    console.log('\n✅ Tracking check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Tracking check failed:', error);
    process.exit(1);
  });
