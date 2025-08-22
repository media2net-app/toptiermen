require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const facebookAdAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!facebookAccessToken || !facebookAdAccountId) {
  console.error('❌ Missing Facebook environment variables');
  console.log('📝 Please add the following to your .env.local file:');
  console.log('FACEBOOK_ACCESS_TOKEN=your_facebook_access_token');
  console.log('FACEBOOK_AD_ACCOUNT_ID=your_facebook_ad_account_id');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Campaign configurations for prelaunch email collection
const PRELAUNCH_CAMPAIGNS = [
  {
    name: 'TTM - Algemeen - Prelaunch Awareness',
    objective: 'AWARENESS',
    dailyBudget: 25,
    targeting: {
      age_min: 18,
      age_max: 65,
      genders: ['all'],
      locations: ['NL', 'BE'],
      interests: ['6003384248805', '6003277229371', '6003392552125', '6003748928462'],
      behaviors: []
    },
    adCreative: {
      title: 'Word Lid van Top Tier Men',
      body: 'Sluit je aan bij een community van mannen die streven naar excellentie. Meld je aan voor de wachtrij en krijg exclusieve toegang tot onze prelaunch.',
      callToAction: 'SIGN_UP'
    }
  },
  {
    name: 'TTM - Algemeen - Fitness Community',
    objective: 'ENGAGEMENT',
    dailyBudget: 30,
    targeting: {
      age_min: 25,
      age_max: 55,
      genders: ['men'],
      locations: ['NL'],
      interests: ['6003384248805', '6003283387551', '6009986890906', '6003648059946', '6003092532417'],
      behaviors: []
    },
    adCreative: {
      title: 'Fitness Community voor Mannen',
      body: 'Ontdek een nieuwe manier van trainen en leven. Top Tier Men - waar fitness, mindset en community samenkomen. Meld je aan voor exclusieve toegang.',
      callToAction: 'LEARN_MORE'
    }
  },
  {
    name: 'TTM - Algemeen - Lifestyle Upgrade',
    objective: 'CONSIDERATION',
    dailyBudget: 35,
    targeting: {
      age_min: 30,
      age_max: 50,
      genders: ['all'],
      locations: ['NL', 'BE', 'DE'],
      interests: ['6003392552125', '6003748928462', '6003400407018', '6002991059568'],
      behaviors: []
    },
    adCreative: {
      title: 'Upgrade Je Lifestyle',
      body: 'Klaar voor de volgende stap? Top Tier Men helpt je je leven naar het volgende niveau te tillen. Fitness, mindset, community. Meld je aan voor de wachtrij.',
      callToAction: 'SIGN_UP'
    }
  },
  {
    name: 'TTM - Algemeen - Business Professionals',
    objective: 'TRAFFIC',
    dailyBudget: 40,
    targeting: {
      age_min: 28,
      age_max: 45,
      genders: ['all'],
      locations: ['NL'],
      interests: ['6003352779232', '6003396973683', '6003120739217', '6004000198906'],
      behaviors: []
    },
    adCreative: {
      title: 'Voor Business Professionals',
      body: 'Balans tussen werk en gezondheid. Top Tier Men biedt een community waar ambitieuze professionals hun fitness en mindset kunnen ontwikkelen.',
      callToAction: 'CONTACT_US'
    }
  },
  {
    name: 'TTM - Algemeen - Community Building',
    objective: 'ENGAGEMENT',
    dailyBudget: 20,
    targeting: {
      age_min: 22,
      age_max: 40,
      genders: ['all'],
      locations: ['NL', 'BE'],
      interests: ['6003651640946', '6002929355372', '6004100985609'],
      behaviors: []
    },
    adCreative: {
      title: 'Word Onderdeel van Onze Community',
      body: 'Zoek je een community van gelijkgestemden? Top Tier Men brengt mannen samen die streven naar excellentie. Meld je aan voor exclusieve toegang.',
      callToAction: 'SIGN_UP'
    }
  }
];

async function createAlgemenePrelaunchCampaigns() {
  console.log('🚀 Creating 5 Algemene Prelaunch Campaigns...\n');

  try {
    // Get algemene videos from database
    console.log('📹 Fetching algemene videos...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, name, original_name, file_path, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('target_audience', 'Algemeen')
      .eq('is_deleted', false)
      .order('name', { ascending: true });

    if (videosError || !videos || videos.length === 0) {
      console.error('❌ No algemene videos found in database');
      return;
    }

    console.log(`✅ Found ${videos.length} algemene videos:`);
    videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.name} (${video.original_name})`);
    });

    // Create campaigns for each video
    for (let i = 0; i < Math.min(videos.length, PRELAUNCH_CAMPAIGNS.length); i++) {
      const video = videos[i];
      const campaignConfig = PRELAUNCH_CAMPAIGNS[i];
      
      console.log(`\n🎯 Creating campaign ${i + 1}/5: ${campaignConfig.name}`);
      console.log(`📹 Using video: ${video.name}`);

      const campaignData = {
        name: campaignConfig.name,
        objective: campaignConfig.objective,
        status: 'PAUSED', // Start paused for safety
        daily_budget: campaignConfig.dailyBudget,
        targeting: campaignConfig.targeting,
        ad_creative: {
          title: campaignConfig.adCreative.title,
          body: campaignConfig.adCreative.body,
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: campaignConfig.adCreative.callToAction
        },
        video_url: video.file_path,
        video_name: video.name
      };

      try {
        const response = await fetch('http://localhost:6001/api/facebook/create-campaign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        });

        const result = await response.json();

        if (result.success) {
          console.log(`✅ Campaign created successfully!`);
          console.log(`   Campaign ID: ${result.data.campaign.id}`);
          console.log(`   Ad Set ID: ${result.data.adSet.id}`);
          console.log(`   Ad ID: ${result.data.ad.id}`);
          console.log(`   Status: ${result.data.campaign.status}`);
          console.log(`   Budget: €${campaignConfig.dailyBudget}/day`);
        } else {
          console.error(`❌ Campaign creation failed:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error creating campaign:`, error.message);
      }

      // Wait a bit between campaigns to avoid rate limiting
      if (i < Math.min(videos.length, PRELAUNCH_CAMPAIGNS.length) - 1) {
        console.log('⏳ Waiting 2 seconds before next campaign...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 All campaigns created!');
    console.log('\n📋 Summary:');
    console.log('- 5 algemene prelaunch campagnes aangemaakt');
    console.log('- Alle campagnes starten gepauzeerd (veiligheid)');
    console.log('- Dagelijks budget: €20-40 per campagne');
    console.log('- Gericht op e-mail verzameling voor prelaunch');
    console.log('- Link naar: https://platform.toptiermen.eu/prelaunch');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Controleer de campagnes in Facebook Ads Manager');
    console.log('2. Activeer de campagnes één voor één');
    console.log('3. Monitor de prestaties en pas aan waar nodig');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createAlgemenePrelaunchCampaigns()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
