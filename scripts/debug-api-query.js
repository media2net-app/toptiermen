require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugApiQuery() {
  console.log('🔍 Debugging API query to see why only 4 profiles are returned...\n');

  try {
    // Test the exact same query as the API
    console.log('1️⃣ Testing the exact API query...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profiles?.length || 0} profiles with API query`);
    
    if (profiles) {
      console.log('🔍 Profiles found with API query:');
      profiles.forEach((profile, index) => {
        const name = profile.display_name || profile.full_name || 'Unknown';
        console.log(`   ${index + 1}. ${name} (${profile.email}) - ID: ${profile.id} - Created: ${profile.created_at}`);
      });
    }

    // Test with different ordering
    console.log('\n2️⃣ Testing with different ordering...');
    const { data: profilesAsc, error: profilesAscError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (profilesAscError) {
      console.error('❌ Error fetching profiles (asc):', profilesAscError);
    } else {
      console.log(`📊 Found ${profilesAsc?.length || 0} profiles with ascending order`);
    }

    // Test without ordering
    console.log('\n3️⃣ Testing without ordering...');
    const { data: profilesNoOrder, error: profilesNoOrderError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesNoOrderError) {
      console.error('❌ Error fetching profiles (no order):', profilesNoOrderError);
    } else {
      console.log(`📊 Found ${profilesNoOrder?.length || 0} profiles without ordering`);
    }

    // Test with limit to see if there's a hidden limit
    console.log('\n4️⃣ Testing with high limit...');
    const { data: profilesLimit, error: profilesLimitError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (profilesLimitError) {
      console.error('❌ Error fetching profiles (limit):', profilesLimitError);
    } else {
      console.log(`📊 Found ${profilesLimit?.length || 0} profiles with limit 100`);
    }

    // Test with specific IDs to see if they exist
    console.log('\n5️⃣ Testing specific profile IDs...');
    const testIds = [
      '550e8400-e29b-41d4-a716-446655440001', // Alex
      '550e8400-e29b-41d4-a716-446655440002', // Mark
      '550e8400-e29b-41d4-a716-446655440003', // David
      '550e8400-e29b-41d4-a716-446655440004'  // Thomas
    ];

    for (const id of testIds) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log(`❌ Profile ${id} not found:`, error.message);
      } else {
        const name = profile.display_name || profile.full_name || 'Unknown';
        console.log(`✅ Profile ${id} found: ${name} (${profile.email})`);
      }
    }

    // Test with different client (service role vs anon)
    console.log('\n6️⃣ Testing with different client...');
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: profilesAnon, error: profilesAnonError } = await supabaseAnon
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesAnonError) {
      console.error('❌ Error fetching profiles (anon):', profilesAnonError);
    } else {
      console.log(`📊 Found ${profilesAnon?.length || 0} profiles with anon client`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugApiQuery();
