const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRealLeads() {
  console.log('🔍 Checking for real leads data...\n');

  try {
    // 1. Check profiles table for users (potential leads)
    console.log('1️⃣ Checking profiles table for registered users...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, onboarding_completed')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} registered users in profiles table`);
      
      if (profiles && profiles.length > 0) {
        console.log('\n📧 RECENT REGISTERED USERS (potential leads):');
        console.log('==============================================');
        profiles.slice(0, 10).forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.email} - ${profile.full_name || 'No name'} - ${new Date(profile.created_at).toLocaleDateString()}`);
        });
        
        if (profiles.length > 10) {
          console.log(`... and ${profiles.length - 10} more users`);
        }
      }
    }

    // 2. Check if there's a specific leads table
    console.log('\n2️⃣ Checking for dedicated leads table...');
    const possibleLeadsTables = [
      'leads',
      'facebook_leads',
      'marketing_leads',
      'contact_submissions',
      'newsletter_signups'
    ];

    for (const tableName of possibleLeadsTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table "${tableName}" exists`);
          const { data: allData, error: allError } = await supabase
            .from(tableName)
            .select('*');
          
          if (!allError && allData) {
            console.log(`   📊 Contains ${allData.length} records`);
            if (allData.length > 0) {
              console.log(`   📋 Sample columns: ${Object.keys(allData[0]).join(', ')}`);
            }
          }
        } else {
          console.log(`❌ Table "${tableName}" does not exist`);
        }
      } catch (err) {
        console.log(`❌ Table "${tableName}" does not exist`);
      }
    }

    // 3. Check onboarding_status for completed onboarding (potential leads)
    console.log('\n3️⃣ Checking onboarding completion (potential leads)...');
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('user_id, onboarding_completed, completed_at')
      .eq('onboarding_completed', true)
      .order('completed_at', { ascending: false });

    if (onboardingError) {
      console.error('❌ Error fetching onboarding data:', onboardingError);
    } else {
      console.log(`✅ Found ${onboardingData?.length || 0} users who completed onboarding`);
      
      if (onboardingData && onboardingData.length > 0) {
        console.log('\n🎯 USERS WHO COMPLETED ONBOARDING (qualified leads):');
        console.log('==================================================');
        onboardingData.slice(0, 10).forEach((onboarding, index) => {
          console.log(`${index + 1}. User ID: ${onboarding.user_id} - Completed: ${new Date(onboarding.completed_at).toLocaleDateString()}`);
        });
        
        if (onboardingData.length > 10) {
          console.log(`... and ${onboardingData.length - 10} more completed users`);
        }
      }
    }

    // 4. Check Facebook Ads table (the sample data I created)
    console.log('\n4️⃣ Checking Facebook Ads table (sample data)...');
    const { data: facebookAds, error: facebookError } = await supabase
      .from('facebook_ads')
      .select('*');

    if (facebookError) {
      console.error('❌ Error fetching Facebook Ads data:', facebookError);
    } else {
      console.log(`✅ Found ${facebookAds?.length || 0} Facebook Ads records`);
      
      if (facebookAds && facebookAds.length > 0) {
        console.log('⚠️  NOTE: This is SAMPLE DATA I created for testing, not real Facebook Ads data');
        console.log('   The 59 leads mentioned earlier are from this sample data');
        console.log('   Real Facebook Ads data would need to be imported from Facebook Ads Manager');
      }
    }

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    console.log('============');
    console.log('The 59 leads I mentioned are from SAMPLE DATA in the facebook_ads table.');
    console.log('To get real Facebook Ads leads, you need to:');
    console.log('1. Export data from Facebook Ads Manager');
    console.log('2. Import it into the facebook_ads table');
    console.log('3. Or connect Facebook Ads API for real-time data');
    console.log('');
    console.log('Real leads would be the registered users in the profiles table.');

  } catch (error) {
    console.error('❌ Error checking real leads:', error);
  }
}

checkRealLeads();
