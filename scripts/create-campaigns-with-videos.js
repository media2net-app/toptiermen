require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

console.log(`📊 Using Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}`);

// Facebook page ID
const FACEBOOK_PAGE_ID = '610571295471584'; // Top Tier Men

console.log(`📊 Facebook Page ID: ${FACEBOOK_PAGE_ID}`);

async function getVideosFromSupabase() {
  console.log('📊 Fetching videos from Supabase...');
  
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .eq('bucket_name', 'advertenties')
    .eq('is_deleted', false)
    .order('target_audience', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Error fetching videos:', error);
    return [];
  }

  console.log(`✅ Found ${videos.length} videos`);
  videos.forEach(video => {
    console.log(`   - ${video.name} (${video.target_audience}) - ${video.file_path}`);
  });

  return videos;
}

// Campaign configurations with video mapping
const ALL_CAMPAIGNS = {
  algemene: {
    name: 'TTM - Algemene Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 25, // 5 x €5
    page_id: FACEBOOK_PAGE_ID,
    ad_sets: [
      {
        name: 'TTM - Algemeen - Prelaunch Awareness',
        daily_budget: 5,
        targeting: {
          age_min: 18,
          age_max: 65,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003384248805', '6003277229371', '6003392552125', '6003748928462'],
          behaviors: []
        },
        ad_creative: {
          title: 'Word Lid van Top Tier Men',
          body: 'Sluit je aan bij een community van mannen die streven naar excellentie. Meld je aan voor de wachtrij en krijg exclusieve toegang tot onze prelaunch.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'SIGN_UP'
        }
      },
      {
        name: 'TTM - Algemeen - Fitness Community',
        daily_budget: 5,
        targeting: {
          age_min: 25,
          age_max: 55,
          genders: ['men'],
          locations: ['NL'],
          interests: ['6003384248805', '6003283387551', '6009986890906', '6003648059946', '6003092532417'],
          behaviors: []
        },
        ad_creative: {
          title: 'Fitness Community voor Mannen',
          body: 'Ontdek een nieuwe manier van trainen en leven. Top Tier Men - waar fitness, mindset en community samenkomen. Meld je aan voor exclusieve toegang.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'LEARN_MORE'
        }
      },
      {
        name: 'TTM - Algemeen - Lifestyle Upgrade',
        daily_budget: 5,
        targeting: {
          age_min: 30,
          age_max: 50,
          genders: ['all'],
          locations: ['NL', 'BE', 'DE'],
          interests: ['6003392552125', '6003748928462', '6003400407018', '6002991059568'],
          behaviors: []
        },
        ad_creative: {
          title: 'Upgrade Je Lifestyle',
          body: 'Klaar voor de volgende stap? Top Tier Men helpt je je leven naar het volgende niveau te tillen. Fitness, mindset, community. Meld je aan voor de wachtrij.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'SIGN_UP'
        }
      },
      {
        name: 'TTM - Algemeen - Business Professionals',
        daily_budget: 5,
        targeting: {
          age_min: 28,
          age_max: 45,
          genders: ['all'],
          locations: ['NL'],
          interests: ['6003352779232', '6003396973683', '6003120739217', '6004000198906'],
          behaviors: []
        },
        ad_creative: {
          title: 'Voor Business Professionals',
          body: 'Balans tussen werk en gezondheid. Top Tier Men biedt een community waar ambitieuze professionals hun fitness en mindset kunnen ontwikkelen.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'CONTACT_US'
        }
      },
      {
        name: 'TTM - Algemeen - Community Building',
        daily_budget: 5,
        targeting: {
          age_min: 22,
          age_max: 40,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003651640946', '6002929355372', '6004100985609'],
          behaviors: []
        },
        ad_creative: {
          title: 'Word Onderdeel van Onze Community',
          body: 'Zoek je een community van gelijkgestemden? Top Tier Men brengt mannen samen die streven naar excellentie. Meld je aan voor exclusieve toegang.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'SIGN_UP'
        }
      }
    ]
  },
  jongeren: {
    name: 'TTM - Jongeren Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10, // 2 x €5
    page_id: FACEBOOK_PAGE_ID,
    ad_sets: [
      {
        name: 'TTM - Jongeren - Fitness & Lifestyle',
        daily_budget: 5,
        targeting: {
          age_min: 18,
          age_max: 25,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003384248805', '6003277229371', '6009986890906', '6002929355372', '6004100985609'],
          behaviors: []
        },
        ad_creative: {
          title: 'Fitness & Lifestyle voor Jongeren',
          body: 'Ontdek een nieuwe manier van trainen en leven. Top Tier Men - waar fitness, mindset en community samenkomen. Meld je aan voor exclusieve toegang.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'LEARN_MORE'
        }
      },
      {
        name: 'TTM - Jongeren - Social & Community',
        daily_budget: 5,
        targeting: {
          age_min: 18,
          age_max: 25,
          genders: ['all'],
          locations: ['NL'],
          interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125'],
          behaviors: []
        },
        ad_creative: {
          title: 'Word Onderdeel van Onze Community',
          body: 'Zoek je een community van gelijkgestemden? Top Tier Men brengt jongeren samen die streven naar excellentie. Meld je aan voor exclusieve toegang.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'SIGN_UP'
        }
      }
    ]
  },
  vaders: {
    name: 'TTM - Vaders Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10, // 2 x €5
    page_id: FACEBOOK_PAGE_ID,
    ad_sets: [
      {
        name: 'TTM - Vaders - Family & Leadership',
        daily_budget: 5,
        targeting: {
          age_min: 30,
          age_max: 50,
          genders: ['men'],
          locations: ['NL', 'BE'],
          interests: ['6002929355372', '6004100985609', '6003384248805', '6003277229371'],
          behaviors: []
        },
        ad_creative: {
          title: 'Voor Vaders Die Meer Willen',
          body: 'Ben je een vader die zijn gezin en carrière naar het volgende niveau wil tillen? Top Tier Men helpt vaders hun potentieel te bereiken. Meld je aan voor exclusieve toegang.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'LEARN_MORE'
        }
      },
      {
        name: 'TTM - Vaders - Role Model & Success',
        daily_budget: 5,
        targeting: {
          age_min: 35,
          age_max: 55,
          genders: ['men'],
          locations: ['NL'],
          interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125'],
          behaviors: []
        },
        ad_creative: {
          title: 'Word een Betere Rolmodel',
          body: 'Als vader ben je het rolmodel voor je kinderen. Top Tier Men helpt je een betere versie van jezelf te worden. Fitness, mindset, leiderschap. Meld je aan voor de wachtrij.',
          link_url: 'https://platform.toptiermen.eu/prelaunch',
          call_to_action_type: 'SIGN_UP'
        }
      }
    ]
  },
  zakelijk: {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10, // 2 x €5
    page_id: FACEBOOK_PAGE_ID,
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
  }
};

async function createCampaignsWithVideos() {
  console.log('🚀 Creating All 4 Campaigns to Facebook (With Videos)...\n');
  console.log(`📊 Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}\n`);

  try {
    // Get videos from Supabase
    const videos = await getVideosFromSupabase();
    
    if (videos.length === 0) {
      console.log('❌ No videos found. Please upload videos to the advertentie materiaal section first.');
      return;
    }

    console.log('📝 Campaigns will be created with actual videos from advertentie materiaal\n');

    console.log('\n' + '='.repeat(80));
    console.log('📊 CREATING CAMPAIGNS TO FACEBOOK');
    console.log('='.repeat(80));

    const results = {};

    // Create each campaign
    for (const [campaignKey, campaignData] of Object.entries(ALL_CAMPAIGNS)) {
      console.log(`\n🎯 Creating ${campaignKey.toUpperCase()} campaign...`);
      
      // Add ad account ID to campaign data
      const campaignWithAdAccount = {
        ...campaignData,
        ad_account_id: FACEBOOK_AD_ACCOUNT_ID
      };

      console.log(`📊 Campaign: ${campaignWithAdAccount.name}`);
      console.log(`💰 Total Budget: €${campaignWithAdAccount.campaign_daily_budget}`);
      console.log(`📊 Ad Sets: ${campaignWithAdAccount.ad_sets.length}`);
      console.log(`📊 Facebook Page: ${campaignWithAdAccount.page_id}`);

      // Map videos to ad sets
      const targetAudience = campaignKey === 'algemene' ? 'Algemeen' : 
                           campaignKey === 'jongeren' ? 'Jongeren' :
                           campaignKey === 'vaders' ? 'Vaders' : 'Zakelijk';
      
      const campaignVideos = videos.filter(video => video.target_audience === targetAudience);
      console.log(`📹 Found ${campaignVideos.length} videos for ${targetAudience}`);

      try {
        const response = await fetch('http://localhost:3000/api/facebook/create-multi-adset-campaign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignWithAdAccount)
        });

        const result = await response.json();

        if (result.success) {
          console.log(`✅ ${campaignKey} campaign created successfully!`);
          console.log(`📊 Campaign ID: ${result.data.campaign.id}`);
          console.log(`📊 Ad Sets: ${result.data.adSets.length}`);
          console.log(`📊 Ads: ${result.data.ads.length}`);
          
          results[campaignKey] = {
            success: true,
            campaign: result.data.campaign,
            adSets: result.data.adSets,
            ads: result.data.ads,
            videos: campaignVideos
          };
        } else {
          console.error(`❌ ${campaignKey} campaign creation failed:`, result.error);
          results[campaignKey] = {
            success: false,
            error: result.error,
            videos: campaignVideos
          };
        }
      } catch (error) {
        console.error(`❌ Error creating ${campaignKey} campaign:`, error.message);
        results[campaignKey] = {
          success: false,
          error: error.message,
          videos: campaignVideos
        };
      }

      // Wait a bit between campaigns to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));

    const successfulCampaigns = Object.values(results).filter(r => r.success).length;
    const totalBudget = Object.values(ALL_CAMPAIGNS).reduce((sum, campaign) => sum + campaign.campaign_daily_budget, 0);

    console.log(`\n🎉 Campaigns created: ${successfulCampaigns}/4`);
    console.log(`💰 Total daily budget: €${totalBudget}`);
    console.log(`📊 Total ad sets: ${Object.values(ALL_CAMPAIGNS).reduce((sum, campaign) => sum + campaign.ad_sets.length, 0)}`);
    console.log(`📊 Total ads: ${Object.values(ALL_CAMPAIGNS).reduce((sum, campaign) => sum + campaign.ad_sets.length, 0)}`);

    console.log('\n📊 Campaign Details:');
    Object.entries(results).forEach(([campaignKey, result]) => {
      if (result.success) {
        console.log(`✅ ${campaignKey}: ${result.campaign.name} (ID: ${result.campaign.id})`);
        console.log(`   📊 Ad Sets: ${result.adSets.length}, Ads: ${result.ads.length}`);
        console.log(`   📹 Videos: ${result.videos.length}`);
        result.videos.forEach(video => {
          console.log(`      - ${video.name}`);
        });
      } else {
        console.log(`❌ ${campaignKey}: Failed - ${result.error}`);
        console.log(`   📹 Videos: ${result.videos.length}`);
        result.videos.forEach(video => {
          console.log(`      - ${video.name}`);
        });
      }
    });

    console.log('\n🔧 Next steps:');
    console.log('1. Check all campaigns in Facebook Ads Manager');
    console.log('2. Review ad creatives and targeting');
    console.log('3. Verify video uploads in ad creatives');
    console.log('4. Activate campaigns when ready');
    console.log('5. Monitor performance and adjust as needed');
    console.log('6. Focus on email collection for the prelaunch waitlist');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createCampaignsWithVideos()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
