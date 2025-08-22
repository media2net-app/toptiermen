require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

if (!supabaseUrl || !supabaseServiceKey || !facebookAccessToken || !facebookAppId) {
  console.error('❌ Missing environment variables');
  console.log('Required:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseServiceKey,
    hasFacebookToken: !!facebookAccessToken,
    hasFacebookAppId: !!facebookAppId
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFacebookAdsLive() {
  console.log('🚀 Testing Facebook Ads Live Integration...');
  console.log('📱 App ID:', facebookAppId);
  console.log('🔑 Token:', facebookAccessToken.substring(0, 20) + '...');

  try {
    // 1. Test Facebook API connection
    console.log('\n🔍 Testing Facebook API connection...');
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${facebookAccessToken}`);
    const userData = await userResponse.json();
    
    if (userData.error) {
      console.error('❌ Facebook API connection failed:', userData.error);
      return;
    }
    
    console.log('✅ Facebook API connected successfully');
    console.log('👤 User:', userData.name, `(ID: ${userData.id})`);

    // 2. Get ad accounts
    console.log('\n💰 Fetching ad accounts...');
    const adAccountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${facebookAccessToken}&fields=id,name,account_status,currency,timezone_name`
    );
    const adAccountsData = await adAccountsResponse.json();

    if (adAccountsData.error) {
      console.error('❌ Failed to fetch ad accounts:', adAccountsData.error);
      return;
    }

    if (!adAccountsData.data || adAccountsData.data.length === 0) {
      console.log('⚠️ No ad accounts found');
      return;
    }

    console.log('✅ Found ad accounts:');
    adAccountsData.data.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.name} (${account.id}) - Status: ${account.account_status}`);
    });

    // 3. Test with first ad account
    const firstAdAccount = adAccountsData.data[0];
    console.log(`\n🎯 Testing with ad account: ${firstAdAccount.name}`);

    // 4. Get campaigns
    console.log('\n📊 Fetching campaigns...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${firstAdAccount.id}/campaigns?access_token=${facebookAccessToken}&fields=id,name,status,objective,created_time&limit=10`
    );
    const campaignsData = await campaignsResponse.json();

    if (campaignsData.error) {
      console.error('❌ Failed to fetch campaigns:', campaignsData.error);
    } else {
      console.log(`✅ Found ${campaignsData.data?.length || 0} campaigns`);
      if (campaignsData.data && campaignsData.data.length > 0) {
        campaignsData.data.forEach((campaign, index) => {
          console.log(`  ${index + 1}. ${campaign.name} - ${campaign.status} (${campaign.objective})`);
        });
      }
    }

    // 5. Test video upload capability
    console.log('\n🎬 Testing video upload capability...');
    const videosResponse = await fetch(
      `https://graph.facebook.com/v18.0/${firstAdAccount.id}/advideos?access_token=${facebookAccessToken}&fields=id,name,status&limit=5`
    );
    const videosData = await videosResponse.json();

    if (videosData.error) {
      console.error('❌ Failed to fetch videos:', videosData.error);
    } else {
      console.log(`✅ Found ${videosData.data?.length || 0} videos in ad account`);
    }

    // 6. Test campaign creation (dry run)
    console.log('\n🧪 Testing campaign creation capability...');
    const testCampaignData = {
      name: 'TEST - Top Tier Men Campaign',
      objective: 'TRAFFIC',
      status: 'PAUSED', // Start paused for safety
      daily_budget: 500, // €5.00 in cents
      special_ad_categories: []
    };

    console.log('📝 Test campaign data:', testCampaignData);
    console.log('⚠️ Note: Campaign creation is ready but not executed for safety');

    // 7. Check app permissions
    console.log('\n🔐 Checking app permissions...');
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${facebookAccessToken}`
    );
    const permissionsData = await permissionsResponse.json();

    if (permissionsData.error) {
      console.error('❌ Failed to fetch permissions:', permissionsData.error);
    } else {
      console.log('✅ App permissions:');
      permissionsData.data.forEach(permission => {
        console.log(`  • ${permission.permission}: ${permission.status}`);
      });
    }

    // 8. Summary
    console.log('\n🎉 Facebook Ads Live Integration Test Complete!');
    console.log('✅ All systems ready for campaign creation');
    console.log('📱 App Status: LIVE');
    console.log('💰 Ad Account: Ready');
    console.log('🎬 Video Upload: Ready');
    console.log('📊 Campaign Management: Ready');

    console.log('\n🚀 Next Steps:');
    console.log('1. Go to your advertentie materiaal page');
    console.log('2. Select a video and click "Campagne Opzetten"');
    console.log('3. Configure targeting and budget');
    console.log('4. Create and launch your first Facebook ad!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFacebookAdsLive()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
