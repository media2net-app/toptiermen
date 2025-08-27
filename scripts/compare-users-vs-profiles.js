require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Comparing Users vs Profiles Tables...');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function compareTables() {
  console.log('📋 STEP 1: Compare Table Structures');
  console.log('----------------------------------------');
  
  try {
    // Get sample from profiles table
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    // Get sample from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else if (users && users.length > 0) {
      console.log('✅ Users table structure:');
      console.log(JSON.stringify(users[0], null, 2));
      
      console.log('\n📊 Users Table Columns:');
      Object.keys(users[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof users[0][key]} (${users[0][key]})`);
      });
    }

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('\n✅ Profiles table structure:');
      console.log(JSON.stringify(profiles[0], null, 2));
      
      console.log('\n📊 Profiles Table Columns:');
      Object.keys(profiles[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof profiles[0][key]} (${profiles[0][key]})`);
      });
    }

  } catch (error) {
    console.error('❌ Comparison error:', error.message);
  }
}

async function checkDataOverlap() {
  console.log('\n📋 STEP 2: Check Data Overlap');
  console.log('----------------------------------------');
  
  try {
    // Count records in each table
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Record Counts:');
    console.log(`   - Users table: ${usersCount || 0} records`);
    console.log(`   - Profiles table: ${profilesCount || 0} records`);

    // Check for overlapping emails
    const { data: users, error: usersListError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(10);

    const { data: profiles, error: profilesListError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(10);

    if (!usersListError && !profilesListError) {
      console.log('\n📊 Sample Data Comparison:');
      console.log('Users table sample:');
      users?.forEach(user => console.log(`   - ${user.email} (${user.id})`));
      
      console.log('\nProfiles table sample:');
      profiles?.forEach(profile => console.log(`   - ${profile.email} (${profile.id})`));
    }

  } catch (error) {
    console.error('❌ Data overlap check error:', error.message);
  }
}

async function analyzeTablePurposes() {
  console.log('\n📋 STEP 3: Analyze Table Purposes');
  console.log('----------------------------------------');
  
  console.log('🔍 Table Analysis:');
  console.log('');
  console.log('📊 Users Table:');
  console.log('   - Purpose: Appears to be an older/alternative user table');
  console.log('   - Contains: Basic user info, forum status, admin notes');
  console.log('   - Structure: Simpler, fewer fields');
  console.log('');
  console.log('📊 Profiles Table:');
  console.log('   - Purpose: Comprehensive user profile with all features');
  console.log('   - Contains: Full profile data, affiliate system, gamification');
  console.log('   - Structure: More comprehensive, modern design');
  console.log('');
  console.log('🎯 Recommendation Analysis:');
  console.log('   - Profiles table is more feature-complete');
  console.log('   - Users table might be legacy/old version');
  console.log('   - Need to check which table is actively used');
}

async function checkActiveUsage() {
  console.log('\n📋 STEP 4: Check Active Usage');
  console.log('----------------------------------------');
  
  try {
    // Check recent activity in both tables
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, created_at, last_login')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at, last_login')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📊 Recent Activity:');
    console.log('Users table (recent):');
    recentUsers?.forEach(user => {
      console.log(`   - ${user.email} (created: ${user.created_at}, last login: ${user.last_login})`);
    });
    
    console.log('\nProfiles table (recent):');
    recentProfiles?.forEach(profile => {
      console.log(`   - ${profile.email} (created: ${profile.created_at}, last login: ${profile.last_login})`);
    });

  } catch (error) {
    console.error('❌ Usage check error:', error.message);
  }
}

async function provideRecommendations() {
  console.log('\n📋 STEP 5: Recommendations');
  console.log('----------------------------------------');
  
  console.log('🎯 RECOMMENDED APPROACH:');
  console.log('');
  console.log('✅ OPTION 1: Use Profiles Table (RECOMMENDED)');
  console.log('   - More comprehensive feature set');
  console.log('   - Better designed for the application');
  console.log('   - Includes affiliate system, gamification');
  console.log('   - Action: Migrate all code to use profiles table');
  console.log('');
  console.log('⚠️ OPTION 2: Merge Tables');
  console.log('   - Combine both tables into one');
  console.log('   - More complex migration required');
  console.log('   - Risk of data loss');
  console.log('   - Action: Create migration script');
  console.log('');
  console.log('❌ OPTION 3: Keep Both (NOT RECOMMENDED)');
  console.log('   - Confusing for developers');
  console.log('   - Risk of data inconsistency');
  console.log('   - Maintenance nightmare');
  console.log('');
  console.log('💡 IMMEDIATE ACTION:');
  console.log('   1. Decide on single table approach');
  console.log('   2. Update all code to use chosen table');
  console.log('   3. Migrate data if needed');
  console.log('   4. Remove unused table');
}

async function main() {
  try {
    await compareTables();
    await checkDataOverlap();
    await analyzeTablePurposes();
    await checkActiveUsage();
    await provideRecommendations();
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

main();
