require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBadgeData() {
  console.log('🔍 Checking badge data in database...\n');

  try {
    // Check if user_badges table exists
    console.log('1️⃣ Checking if user_badges table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_badges');

    if (tableError) {
      console.error('❌ Error checking tables:', tableError);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('❌ user_badges table does not exist!');
      console.log('📋 Available tables:');
      const { data: allTables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%badge%');
      
      allTables?.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      return;
    }

    console.log('✅ user_badges table exists');

    // Check table structure
    console.log('\n2️⃣ Checking user_badges table structure...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_badges')
      .order('ordinal_position');

    if (columnError) {
      console.error('❌ Error checking columns:', columnError);
      return;
    }

    console.log('📋 user_badges table columns:');
    columns?.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Check if badges table exists
    console.log('\n3️⃣ Checking if badges table exists...');
    const { data: badgesTable, error: badgesTableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'badges');

    if (badgesTableError) {
      console.error('❌ Error checking badges table:', badgesTableError);
      return;
    }

    if (!badgesTable || badgesTable.length === 0) {
      console.log('❌ badges table does not exist!');
      return;
    }

    console.log('✅ badges table exists');

    // Check badges table structure
    console.log('\n4️⃣ Checking badges table structure...');
    const { data: badgeColumns, error: badgeColumnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'badges')
      .order('ordinal_position');

    if (badgeColumnError) {
      console.error('❌ Error checking badge columns:', badgeColumnError);
      return;
    }

    console.log('📋 badges table columns:');
    badgeColumns?.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Check actual data in user_badges
    console.log('\n5️⃣ Checking actual data in user_badges...');
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(10);

    if (userBadgesError) {
      console.error('❌ Error fetching user_badges:', userBadgesError);
      return;
    }

    console.log(`📊 Found ${userBadges?.length || 0} records in user_badges`);
    if (userBadges && userBadges.length > 0) {
      console.log('📝 Sample user_badges records:');
      userBadges.forEach((record, index) => {
        console.log(`   ${index + 1}. User: ${record.user_id}, Badge: ${record.badge_id}, Unlocked: ${record.unlocked_at}`);
      });
    }

    // Check actual data in badges
    console.log('\n6️⃣ Checking actual data in badges...');
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(10);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log(`📊 Found ${badges?.length || 0} records in badges`);
    if (badges && badges.length > 0) {
      console.log('📝 Sample badges records:');
      badges.forEach((badge, index) => {
        console.log(`   ${index + 1}. ID: ${badge.id}, Name: ${badge.name}, Icon: ${badge.icon_url || 'No icon'}`);
      });
    }

    // Check specific user badges (Rick and Chiel)
    console.log('\n7️⃣ Checking specific user badges...');
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    const { data: rickBadges, error: rickError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', rickId)
      .order('unlocked_at', { ascending: false });

    if (rickError) {
      console.error('❌ Error fetching Rick badges:', rickError);
    } else {
      console.log(`📊 Rick has ${rickBadges?.length || 0} badges`);
      if (rickBadges && rickBadges.length > 0) {
        rickBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.name || 'Unknown'} (${badge.unlocked_at})`);
        });
      }
    }

    const { data: chielBadges, error: chielError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', chielId)
      .order('unlocked_at', { ascending: false });

    if (chielError) {
      console.error('❌ Error fetching Chiel badges:', chielError);
    } else {
      console.log(`📊 Chiel has ${chielBadges?.length || 0} badges`);
      if (chielBadges && chielBadges.length > 0) {
        chielBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.name || 'Unknown'} (${badge.unlocked_at})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBadgeData();
