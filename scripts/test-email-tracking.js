require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEmailTracking() {
  try {
    console.log('🧪 Testing Email Tracking System...\n');

    // 1. Test creating a campaign
    console.log('📧 1. Creating test campaign...');
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        name: 'Test Tracking Campaign',
        subject: 'Test Email with Tracking',
        template_type: 'marketing',
        status: 'active',
        total_recipients: 1
      })
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Error creating campaign:', campaignError);
      return;
    }

    console.log('✅ Campaign created:', campaign.id);

    // 2. Test creating tracking record
    console.log('\n📧 2. Creating tracking record...');
    const tracking_id = `ttm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: trackingRecord, error: trackingError } = await supabase
      .from('email_tracking')
      .insert({
        campaign_id: campaign.id,
        recipient_email: 'test@example.com',
        recipient_name: 'Test User',
        subject: 'Test Email with Tracking',
        template_type: 'marketing',
        tracking_id,
        status: 'pending'
      })
      .select()
      .single();

    if (trackingError) {
      console.error('❌ Error creating tracking record:', trackingError);
      return;
    }

    console.log('✅ Tracking record created:', tracking_id);

    // 3. Test marking as sent
    console.log('\n📧 3. Marking email as sent...');
    const { error: sentError } = await supabase
      .from('email_tracking')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('tracking_id', tracking_id);

    if (sentError) {
      console.error('❌ Error marking as sent:', sentError);
      return;
    }

    console.log('✅ Email marked as sent');

    // 4. Test tracking open
    console.log('\n📧 4. Testing email open tracking...');
    const { error: openError } = await supabase.rpc('track_email_open', {
      tracking_id_param: tracking_id
    });

    if (openError) {
      console.error('❌ Error tracking open:', openError);
      return;
    }

    console.log('✅ Email open tracked');

    // 5. Test tracking click
    console.log('\n📧 5. Testing email click tracking...');
    const { error: clickError } = await supabase.rpc('track_email_click', {
      tracking_id_param: tracking_id,
      link_url_param: 'https://platform.toptiermen.eu/dashboard',
      link_text_param: 'Dashboard'
    });

    if (clickError) {
      console.error('❌ Error tracking click:', clickError);
      return;
    }

    console.log('✅ Email click tracked');

    // 6. Check final analytics
    console.log('\n📊 6. Checking analytics...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('email_analytics_view')
      .select('*')
      .eq('campaign_id', campaign.id)
      .single();

    if (analyticsError) {
      console.error('❌ Error getting analytics:', analyticsError);
      return;
    }

    console.log('✅ Analytics retrieved:');
    console.log(`   - Campaign: ${analytics.campaign_name}`);
    console.log(`   - Sent: ${analytics.sent_count}`);
    console.log(`   - Opened: ${analytics.open_count}`);
    console.log(`   - Clicked: ${analytics.click_count}`);
    console.log(`   - Open Rate: ${analytics.open_rate}%`);
    console.log(`   - Click Rate: ${analytics.click_rate}%`);

    // 7. Check detailed tracking
    console.log('\n📊 7. Checking detailed tracking...');
    const { data: detailedTracking, error: detailedError } = await supabase
      .from('email_tracking')
      .select(`
        *,
        email_opens (*),
        email_clicks (*)
      `)
      .eq('tracking_id', tracking_id)
      .single();

    if (detailedError) {
      console.error('❌ Error getting detailed tracking:', detailedError);
      return;
    }

    console.log('✅ Detailed tracking retrieved:');
    console.log(`   - Status: ${detailedTracking.status}`);
    console.log(`   - Opens: ${detailedTracking.email_opens?.length || 0}`);
    console.log(`   - Clicks: ${detailedTracking.email_clicks?.length || 0}`);

    // 8. Test API endpoints
    console.log('\n🌐 8. Testing API endpoints...');
    
    // Test tracking pixel URL
    const pixelUrl = `https://platform.toptiermen.eu/api/email/track-open?tid=${tracking_id}`;
    console.log(`   - Tracking pixel URL: ${pixelUrl}`);
    
    // Test tracking click URL
    const clickUrl = `https://platform.toptiermen.eu/api/email/track-click?tid=${tracking_id}&url=${encodeURIComponent('https://platform.toptiermen.eu/dashboard')}&text=Dashboard`;
    console.log(`   - Tracking click URL: ${clickUrl}`);

    console.log('\n🎉 Email tracking test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Campaign ID: ${campaign.id}`);
    console.log(`   - Tracking ID: ${tracking_id}`);
    console.log(`   - Test Email: test@example.com`);
    console.log(`   - Open Rate: ${analytics.open_rate}%`);
    console.log(`   - Click Rate: ${analytics.click_rate}%`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    const tables = [
      'email_campaigns',
      'email_tracking',
      'email_opens',
      'email_clicks',
      'email_bounces',
      'email_unsubscribes',
      'email_analytics_summary'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    }

    console.log('\n📊 Checking analytics view...');
    const { data: viewData, error: viewError } = await supabase
      .from('email_analytics_view')
      .select('*')
      .limit(1);

    if (viewError) {
      console.log(`❌ email_analytics_view: ${viewError.message}`);
    } else {
      console.log(`✅ email_analytics_view: OK`);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

// Run the tests
async function main() {
  console.log('🚀 Email Tracking System Test\n');
  
  await checkDatabaseTables();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testEmailTracking();
}

main();
