require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Campaign configuration for 1 campaign with 2 ad sets for Zakelijk
const ZAKELIJK_CAMPAIGN = {
  name: 'TTM - Zakelijk Prelaunch Campagne',
  objective: 'TRAFFIC',
  status: 'PAUSED',
  campaign_daily_budget: 10, // Total budget for all ad sets (2 x €5)
  ad_sets: [
    {
      name: 'TTM - Zakelijk - Business Professionals',
      daily_budget: 5,
      targeting: {
        age_min: 28,
        age_max: 45,
        genders: ['all'],
        locations: ['NL', 'BE'],
        interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125'],
        behaviors: []
      },
      ad_creative: {
        title: 'Voor Business Professionals',
        body: 'Balans tussen werk en gezondheid. Top Tier Men biedt een community waar ambitieuze professionals hun fitness en mindset kunnen ontwikkelen. Meld je aan voor exclusieve toegang.',
        link_url: 'https://platform.toptiermen.eu/prelaunch',
        call_to_action_type: 'LEARN_MORE'
      }
    },
    {
      name: 'TTM - Zakelijk - Entrepreneurs & Leaders',
      daily_budget: 5,
      targeting: {
        age_min: 30,
        age_max: 50,
        genders: ['all'],
        locations: ['NL'],
        interests: ['6003384248805', '6003277229371', '6009986890906', '6002929355372'],
        behaviors: []
      },
      ad_creative: {
        title: 'Voor Ondernemers en Leiders',
        body: 'Als ondernemer of leider moet je altijd op je best zijn. Top Tier Men helpt je je fysieke en mentale prestaties te optimaliseren. Meld je aan voor de wachtrij.',
        link_url: 'https://platform.toptiermen.eu/prelaunch',
        call_to_action_type: 'SIGN_UP'
      }
    }
  ]
};

async function createZakelijkMultiAdSetCampaign() {
  console.log('🚀 Creating 1 Zakelijk Campaign with 2 Ad Sets...\n');

  try {
    // Get zakelijk videos from database
    console.log('📹 Fetching zakelijk videos...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, name, original_name, file_path, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('target_audience', 'Zakelijk')
      .eq('is_deleted', false)
      .order('name', { ascending: true });

    if (videosError || !videos || videos.length === 0) {
      console.error('❌ No zakelijk videos found in database');
      return;
    }

    console.log(`✅ Found ${videos.length} zakelijk videos:`);
    videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.name} (${video.original_name})`);
    });

    // Add video URLs to ad sets
    const campaignData = {
      ...ZAKELIJK_CAMPAIGN,
      ad_sets: ZAKELIJK_CAMPAIGN.ad_sets.map((adSet, index) => ({
        ...adSet,
        video_url: videos[index]?.file_path,
        video_name: videos[index]?.name
      }))
    };

    console.log('\n📋 Campaign Configuration:');
    console.log(`🎯 Campaign Name: ${campaignData.name}`);
    console.log(`🎯 Objective: ${campaignData.objective}`);
    console.log(`💰 Total Daily Budget: €${campaignData.campaign_daily_budget}`);
    console.log(`📊 Number of Ad Sets: ${campaignData.ad_sets.length}`);
    console.log(`🔗 Landing Page: https://platform.toptiermen.eu/prelaunch`);

    console.log('\n📊 Ad Sets Configuration:');
    campaignData.ad_sets.forEach((adSet, index) => {
      console.log(`\n  ${index + 1}. ${adSet.name}`);
      console.log(`     💰 Daily Budget: €${adSet.daily_budget}`);
      console.log(`     👥 Targeting: ${adSet.targeting.age_min}-${adSet.targeting.age_max} jaar, ${adSet.targeting.genders[0] === 'all' ? 'Alle geslachten' : adSet.targeting.genders[0] === 'men' ? 'Mannen' : 'Vrouwen'}`);
      console.log(`     🌍 Locations: ${adSet.targeting.locations.join(', ')}`);
      console.log(`     📹 Video: ${adSet.video_name}`);
      console.log(`     📝 Ad Title: ${adSet.ad_creative.title}`);
    });

    console.log('\n🎯 Creating campaign via API...');
    
    try {
      const response = await fetch('http://localhost:6001/api/facebook/create-multi-adset-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('\n✅ Campaign created successfully!');
        console.log(`📊 Campaign ID: ${result.data.campaign.id}`);
        console.log(`📊 Campaign Name: ${result.data.campaign.name}`);
        console.log(`📊 Campaign Status: ${result.data.campaign.status}`);
        console.log(`📊 Campaign Objective: ${result.data.campaign.objective}`);
        
        console.log('\n📊 Ad Sets created:');
        result.data.adSets.forEach((adSet, index) => {
          console.log(`  ${index + 1}. ${adSet.name} (ID: ${adSet.id})`);
        });
        
        console.log('\n📊 Ads created:');
        result.data.ads.forEach((ad, index) => {
          console.log(`  ${index + 1}. ${ad.name} (ID: ${ad.id})`);
        });

        console.log('\n🎉 All done! Campaign structure:');
        console.log('📊 1 Campaign');
        console.log('📊 2 Ad Sets (one for each zakelijk video)');
        console.log('📊 2 Ads (one for each ad set)');
        console.log('📊 Total daily budget: €120');
        console.log('📊 All ads link to prelaunch page for email collection');
        
        console.log('\n🔧 Next steps:');
        console.log('1. Check the campaign in Facebook Ads Manager');
        console.log('2. Activate the campaign when ready');
        console.log('3. Monitor performance and adjust as needed');
        console.log('4. Focus on email collection for the prelaunch waitlist');

      } else {
        console.error('❌ Campaign creation failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error calling API:', error.message);
      console.log('\n💡 Alternative: Create manually via UI');
      console.log('1. Start development server: npm run dev');
      console.log('2. Go to: http://localhost:6001/dashboard-marketing/advertentie-materiaal');
      console.log('3. Use the campaign configuration above');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createZakelijkMultiAdSetCampaign()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
