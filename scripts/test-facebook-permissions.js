require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function testPermissions() {
  console.log('🔍 Testing Facebook API permissions...\n');
  
  try {
    // Test 1: Check ad account access
    console.log('📋 Test 1: Checking ad account access...');
    const adAccountResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status,currency,timezone_name`
    );

    if (adAccountResponse.ok) {
      const adAccountData = await adAccountResponse.json();
      console.log(`✅ Ad account access OK:`);
      console.log(`   - ID: ${adAccountData.id}`);
      console.log(`   - Name: ${adAccountData.name}`);
      console.log(`   - Status: ${adAccountData.account_status}`);
      console.log(`   - Currency: ${adAccountData.currency}`);
      console.log(`   - Timezone: ${adAccountData.timezone_name}`);
    } else {
      const errorText = await adAccountResponse.text();
      console.error(`❌ Ad account access failed:`, errorText);
    }

    // Test 2: Check campaigns access
    console.log('\n📋 Test 2: Checking campaigns access...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective&limit=5`
    );

    if (campaignsResponse.ok) {
      const campaignsData = await campaignsResponse.json();
      console.log(`✅ Campaigns access OK: Found ${campaignsData.data?.length || 0} campaigns`);
      
      campaignsData.data?.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name} (${campaign.id}) - ${campaign.status}`);
      });
    } else {
      const errorText = await campaignsResponse.text();
      console.error(`❌ Campaigns access failed:`, errorText);
    }

    // Test 3: Check specific LEADS campaign access
    console.log('\n📋 Test 3: Checking specific LEADS campaign access...');
    const leadsCampaignId = '120232394476410324'; // Zakelijk LEADS
    
    const campaignResponse = await fetch(
      `https://graph.facebook.com/v19.0/${leadsCampaignId}?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective`
    );

    if (campaignResponse.ok) {
      const campaignData = await campaignResponse.json();
      console.log(`✅ LEADS campaign access OK:`);
      console.log(`   - ID: ${campaignData.id}`);
      console.log(`   - Name: ${campaignData.name}`);
      console.log(`   - Status: ${campaignData.status}`);
      console.log(`   - Objective: ${campaignData.objective}`);
    } else {
      const errorText = await campaignResponse.text();
      console.error(`❌ LEADS campaign access failed:`, errorText);
    }

    // Test 4: Check ad sets creation permission
    console.log('\n📋 Test 4: Testing ad set creation permission...');
    const testAdSetResponse = await fetch(
      `https://graph.facebook.com/v19.0/${leadsCampaignId}/adsets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          name: 'TEST - Permission Check',
          campaign_id: leadsCampaignId,
          targeting: {
            age_min: 25,
            age_max: 55,
            genders: [1, 2]
          },
          daily_budget: 1000,
          bid_amount: 100,
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          optimization_goal: 'LEADS',
          status: 'PAUSED',
          start_time: Math.floor(Date.now() / 1000) + 3600
        })
      }
    );

    if (testAdSetResponse.ok) {
      const testAdSetData = await testAdSetResponse.json();
      console.log(`✅ Ad set creation permission OK: Created test ad set (ID: ${testAdSetData.id})`);
      
      // Delete the test ad set
      const deleteResponse = await fetch(
        `https://graph.facebook.com/v19.0/${testAdSetData.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        { method: 'DELETE' }
      );
      
      if (deleteResponse.ok) {
        console.log(`✅ Test ad set deleted successfully`);
      } else {
        console.log(`⚠️  Could not delete test ad set (this is normal)`);
      }
    } else {
      const errorText = await testAdSetResponse.text();
      console.error(`❌ Ad set creation permission failed:`, errorText);
    }

    // Test 5: Check token permissions
    console.log('\n📋 Test 5: Checking token permissions...');
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/permissions?access_token=${FACEBOOK_ACCESS_TOKEN}`
    );

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log(`✅ Token permissions:`);
      
      const requiredPermissions = [
        'ads_management',
        'ads_read',
        'business_management',
        'pages_read_engagement'
      ];
      
      requiredPermissions.forEach(permission => {
        const hasPermission = tokenData.data?.some(p => p.permission === permission && p.status === 'granted');
        console.log(`   - ${permission}: ${hasPermission ? '✅ GRANTED' : '❌ NOT GRANTED'}`);
      });
    } else {
      const errorText = await tokenResponse.text();
      console.error(`❌ Token permissions check failed:`, errorText);
    }

  } catch (error) {
    console.error('❌ Error during permission testing:', error);
  }
}

testPermissions();
