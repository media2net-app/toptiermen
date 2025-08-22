require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Campaign configurations overview
const CAMPAIGNS_OVERVIEW = {
  algemene: {
    name: 'TTM - Algemene Prelaunch Campagne',
    objective: 'TRAFFIC',
    daily_budget: 150,
    ad_sets: [
      {
        name: 'TTM - Algemeen - Prelaunch Awareness',
        daily_budget: 25,
        video: 'algemeen_01',
        targeting: '18-65 jaar, alle geslachten, NL/BE',
        ad_title: 'Word Lid van Top Tier Men'
      },
      {
        name: 'TTM - Algemeen - Fitness Community',
        daily_budget: 30,
        video: 'algemeen_02',
        targeting: '25-55 jaar, mannen, NL',
        ad_title: 'Fitness Community voor Mannen'
      },
      {
        name: 'TTM - Algemeen - Lifestyle Upgrade',
        daily_budget: 35,
        video: 'algemeen_03',
        targeting: '30-50 jaar, alle geslachten, NL/BE/DE',
        ad_title: 'Upgrade Je Lifestyle'
      },
      {
        name: 'TTM - Algemeen - Business Professionals',
        daily_budget: 40,
        video: 'algemeen_04',
        targeting: '28-45 jaar, alle geslachten, NL',
        ad_title: 'Voor Business Professionals'
      },
      {
        name: 'TTM - Algemeen - Community Building',
        daily_budget: 20,
        video: 'algemeen_05',
        targeting: '22-40 jaar, alle geslachten, NL/BE',
        ad_title: 'Word Onderdeel van Onze Community'
      }
    ]
  },
  jongeren: {
    name: 'TTM - Jongeren Prelaunch Campagne',
    objective: 'TRAFFIC',
    daily_budget: 80,
    ad_sets: [
      {
        name: 'TTM - Jongeren - Fitness & Lifestyle',
        daily_budget: 45,
        video: 'jongeren_01',
        targeting: '18-25 jaar, alle geslachten, NL/BE',
        ad_title: 'Fitness & Lifestyle voor Jongeren'
      },
      {
        name: 'TTM - Jongeren - Social & Community',
        daily_budget: 35,
        video: 'jongeren_02',
        targeting: '18-25 jaar, alle geslachten, NL',
        ad_title: 'Word Onderdeel van Onze Community'
      }
    ]
  }
};

async function showAllCampaignsOverview() {
  console.log('📊 Facebook Campaigns Overview\n');

  try {
    // Get all videos from database
    console.log('📹 Fetching all videos...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('target_audience', { ascending: true })
      .order('name', { ascending: true });

    if (videosError || !videos || videos.length === 0) {
      console.error('❌ No videos found in database');
      return;
    }

    console.log(`✅ Found ${videos.length} videos:`);
    
    // Group videos by target audience
    const videosByAudience = {};
    videos.forEach(video => {
      if (!videosByAudience[video.target_audience]) {
        videosByAudience[video.target_audience] = [];
      }
      videosByAudience[video.target_audience].push(video);
    });

    Object.entries(videosByAudience).forEach(([audience, audienceVideos]) => {
      console.log(`\n🎯 ${audience} (${audienceVideos.length} videos):`);
      audienceVideos.forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.name} (${video.original_name})`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 CAMPAIGN CONFIGURATIONS OVERVIEW');
    console.log('='.repeat(80));

    // Show Algemene Campaign
    console.log('\n🎯 ALGEMENE CAMPAIGN:');
    console.log(`📊 Campaign Name: ${CAMPAIGNS_OVERVIEW.algemene.name}`);
    console.log(`🎯 Objective: ${CAMPAIGNS_OVERVIEW.algemene.objective}`);
    console.log(`💰 Total Daily Budget: €${CAMPAIGNS_OVERVIEW.algemene.daily_budget}`);
    console.log(`📊 Number of Ad Sets: ${CAMPAIGNS_OVERVIEW.algemene.ad_sets.length}`);
    console.log(`🔗 Landing Page: https://platform.toptiermen.eu/prelaunch`);
    
    console.log('\n📊 Ad Sets:');
    CAMPAIGNS_OVERVIEW.algemene.ad_sets.forEach((adSet, index) => {
      console.log(`\n  ${index + 1}. ${adSet.name}`);
      console.log(`     💰 Daily Budget: €${adSet.daily_budget}`);
      console.log(`     📹 Video: ${adSet.video}`);
      console.log(`     👥 Targeting: ${adSet.targeting}`);
      console.log(`     📝 Ad Title: ${adSet.ad_title}`);
    });

    console.log('\n' + '-'.repeat(80));

    // Show Jongeren Campaign
    console.log('\n🎯 JONGEREN CAMPAIGN:');
    console.log(`📊 Campaign Name: ${CAMPAIGNS_OVERVIEW.jongeren.name}`);
    console.log(`🎯 Objective: ${CAMPAIGNS_OVERVIEW.jongeren.objective}`);
    console.log(`💰 Total Daily Budget: €${CAMPAIGNS_OVERVIEW.jongeren.daily_budget}`);
    console.log(`📊 Number of Ad Sets: ${CAMPAIGNS_OVERVIEW.jongeren.ad_sets.length}`);
    console.log(`🔗 Landing Page: https://platform.toptiermen.eu/prelaunch`);
    
    console.log('\n📊 Ad Sets:');
    CAMPAIGNS_OVERVIEW.jongeren.ad_sets.forEach((adSet, index) => {
      console.log(`\n  ${index + 1}. ${adSet.name}`);
      console.log(`     💰 Daily Budget: €${adSet.daily_budget}`);
      console.log(`     📹 Video: ${adSet.video}`);
      console.log(`     👥 Targeting: ${adSet.targeting}`);
      console.log(`     📝 Ad Title: ${adSet.ad_title}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    
    const totalBudget = CAMPAIGNS_OVERVIEW.algemene.daily_budget + CAMPAIGNS_OVERVIEW.jongeren.daily_budget;
    const totalAdSets = CAMPAIGNS_OVERVIEW.algemene.ad_sets.length + CAMPAIGNS_OVERVIEW.jongeren.ad_sets.length;
    
    console.log(`📊 Total Campaigns: 2`);
    console.log(`📊 Total Ad Sets: ${totalAdSets}`);
    console.log(`📊 Total Ads: ${totalAdSets}`);
    console.log(`💰 Total Daily Budget: €${totalBudget}`);
    console.log(`🎯 All Objectives: TRAFFIC (website verkeer naar prelaunch)`);
    console.log(`🔗 All Landing Pages: https://platform.toptiermen.eu/prelaunch`);
    
    console.log('\n🎯 Campaign Creation Commands:');
    console.log('1. Algemene Campaign: node scripts/create-algemene-multi-adset-campaign.js');
    console.log('2. Jongeren Campaign: node scripts/create-jongeren-multi-adset-campaign.js');
    
    console.log('\n💡 Tips:');
    console.log('- Start alle campagnes gepauzeerd (veiligheid)');
    console.log('- Test één campagne eerst met laag budget');
    console.log('- Monitor de prestaties en pas aan waar nodig');
    console.log('- Focus op e-mail verzameling voor de prelaunch wachtrij');
    console.log('- Gebruik de prelaunch pagina als landing page');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
showAllCampaignsOverview()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
