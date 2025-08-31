const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showRealLeads() {
  console.log('📊 REAL LEADS DATA REPORT\n');

  try {
    // 1. Get real leads from leads table
    console.log('1️⃣ REAL LEADS FROM LEADS TABLE:');
    console.log('================================');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
    } else {
      console.log(`✅ Found ${leads?.length || 0} real leads in the database`);
      
      if (leads && leads.length > 0) {
        console.log('\n📧 ALL LEADS WITH EMAIL ADDRESSES:');
        console.log('===================================');
        leads.forEach((lead, index) => {
          console.log(`${index + 1}. ${lead.email} - ${lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'No name'} - Source: ${lead.source || 'Unknown'} - Status: ${lead.status || 'Unknown'} - Created: ${new Date(lead.created_at).toLocaleDateString()}`);
        });

        // Group by source
        const leadsBySource = {};
        leads.forEach(lead => {
          const source = lead.source || 'Unknown';
          if (!leadsBySource[source]) {
            leadsBySource[source] = [];
          }
          leadsBySource[source].push(lead);
        });

        console.log('\n📊 LEADS BY SOURCE:');
        console.log('===================');
        Object.keys(leadsBySource).forEach(source => {
          console.log(`${source}: ${leadsBySource[source].length} leads`);
        });

        // Group by status
        const leadsByStatus = {};
        leads.forEach(lead => {
          const status = lead.status || 'Unknown';
          if (!leadsByStatus[status]) {
            leadsByStatus[status] = [];
          }
          leadsByStatus[status].push(lead);
        });

        console.log('\n📊 LEADS BY STATUS:');
        console.log('===================');
        Object.keys(leadsByStatus).forEach(status => {
          console.log(`${status}: ${leadsByStatus[status].length} leads`);
        });
      }
    }

    // 2. Get users who completed onboarding
    console.log('\n2️⃣ USERS WHO COMPLETED ONBOARDING:');
    console.log('===================================');
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
        console.log('\n🎯 COMPLETED ONBOARDING USERS:');
        console.log('==============================');
        onboardingData.forEach((onboarding, index) => {
          console.log(`${index + 1}. User ID: ${onboarding.user_id} - Completed: ${new Date(onboarding.completed_at).toLocaleDateString()}`);
        });
      }
    }

    // 3. Get all registered users
    console.log('\n3️⃣ ALL REGISTERED USERS:');
    console.log('=========================');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} registered users`);
      
      if (profiles && profiles.length > 0) {
        console.log('\n📧 ALL REGISTERED USER EMAILS:');
        console.log('==============================');
        profiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.email} - ${profile.full_name || 'No name'} - Registered: ${new Date(profile.created_at).toLocaleDateString()}`);
        });
      }
    }

    // 4. Summary
    console.log('\n📋 FINAL SUMMARY:');
    console.log('==================');
    console.log(`📧 Total real leads: ${leads?.length || 0}`);
    console.log(`👤 Total registered users: ${profiles?.length || 0}`);
    console.log(`✅ Users who completed onboarding: ${onboardingData?.length || 0}`);
    console.log('');
    console.log('⚠️  NOTE: The 59 leads I mentioned earlier were from SAMPLE DATA');
    console.log('   The real leads are shown above from the actual database');

  } catch (error) {
    console.error('❌ Error showing real leads:', error);
  }
}

showRealLeads();
