require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
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

async function prepareAlgemeneCampaigns() {
  console.log('📋 Preparing 5 Algemene Prelaunch Campaigns for UI creation...\n');

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

    console.log('\n🎯 Campaign Setup Instructions:\n');
    console.log('1. Start je development server: npm run dev');
    console.log('2. Ga naar: http://localhost:6001/dashboard-marketing/advertentie-materiaal');
    console.log('3. Klik op "Campagne Aanmaken" voor elke algemene video');
    console.log('4. Gebruik de volgende configuraties:\n');

    // Display campaign configurations
    for (let i = 0; i < Math.min(videos.length, PRELAUNCH_CAMPAIGNS.length); i++) {
      const video = videos[i];
      const campaign = PRELAUNCH_CAMPAIGNS[i];
      
      console.log(`📊 Campagne ${i + 1}: ${campaign.name}`);
      console.log(`📹 Video: ${video.name}`);
      console.log(`🎯 Doel: ${campaign.objective}`);
      console.log(`💰 Dagelijks Budget: €${campaign.dailyBudget}`);
      console.log(`👥 Doelgroep: ${campaign.targeting.age_min}-${campaign.targeting.age_max} jaar, ${campaign.targeting.genders[0] === 'all' ? 'Alle geslachten' : campaign.targeting.genders[0] === 'men' ? 'Mannen' : 'Vrouwen'}`);
      console.log(`🌍 Locaties: ${campaign.targeting.locations.join(', ')}`);
      console.log(`📝 Ad Titel: ${campaign.adCreative.title}`);
      console.log(`📄 Ad Tekst: ${campaign.adCreative.body}`);
      console.log(`🔗 Call-to-Action: ${campaign.adCreative.callToAction}`);
      console.log(`🔗 Link URL: https://platform.toptiermen.eu/prelaunch`);
      console.log('');
    }

    console.log('📋 Targeting IDs voor interesses:');
    console.log('- Fitness: 6003384248805, 6003277229371');
    console.log('- Lifestyle: 6003392552125');
    console.log('- Personal Development: 6003748928462');
    console.log('- Gym: 6003283387551');
    console.log('- Workout: 6009986890906');
    console.log('- Bodybuilding: 6003648059946');
    console.log('- CrossFit: 6003092532417');
    console.log('- Self Improvement: 6003400407018');
    console.log('- Motivation: 6002991059568');
    console.log('- Business: 6003352779232');
    console.log('- Entrepreneurship: 6003396973683');
    console.log('- Networking: 6003120739217');
    console.log('- Professional Development: 6004000198906');
    console.log('- Community: 6003651640946');
    console.log('- Social Networking: 6002929355372');
    console.log('- Friendship: 6004100985609');
    console.log('');

    console.log('🎯 Campaign Objectives:');
    console.log('- AWARENESS: Voor breed bereik en bekendheid');
    console.log('- ENGAGEMENT: Voor interactie en community building');
    console.log('- CONSIDERATION: Voor overweging en interesse');
    console.log('- TRAFFIC: Voor website verkeer naar prelaunch pagina');
    console.log('');

    console.log('💡 Tips:');
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
prepareAlgemeneCampaigns()
  .then(() => {
    console.log('\n✅ Campaign preparation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
