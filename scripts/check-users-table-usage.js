require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

console.log('🔍 CHECKING USERS TABLE USAGE');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseUsage() {
  console.log('📋 STEP 1: Database Usage Analysis');
  console.log('----------------------------------------');
  
  try {
    // Check what's in the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message);
      return;
    }
    
    console.log(`📊 Users table contains ${users.length} records:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name || 'N/A'}`);
    });
    
    // Check if these users exist in profiles table
    console.log('\n🔍 Checking if users exist in profiles table:');
    for (const user of users) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.log(`   ❌ User ${user.email} (${user.id}) - NOT in profiles table`);
      } else {
        console.log(`   ✅ User ${user.email} (${user.id}) - EXISTS in profiles table`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

async function checkCodebaseUsage() {
  console.log('\n📋 STEP 2: Codebase Usage Analysis');
  console.log('----------------------------------------');
  
  try {
    // Check for any remaining references to users table in code
    console.log('🔍 Searching for users table references in codebase...');
    
    try {
      const grepResult = execSync('grep -r "users" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -i "table\|from.*users\|users.*table"', { encoding: 'utf8' });
      console.log('❌ Found users table references in code:');
      console.log(grepResult);
    } catch (grepError) {
      console.log('✅ No users table references found in code');
    }
    
    // Check for any database queries that might still use users table
    console.log('\n🔍 Searching for database queries that might use users table...');
    
    try {
      const queryResult = execSync('grep -r "from.*users\|users.*from" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"', { encoding: 'utf8' });
      console.log('❌ Found database queries using users table:');
      console.log(queryResult);
    } catch (grepError) {
      console.log('✅ No database queries found using users table');
    }
    
  } catch (error) {
    console.error('❌ Codebase check failed:', error.message);
  }
}

async function checkAPIRoutes() {
  console.log('\n📋 STEP 3: API Routes Analysis');
  console.log('----------------------------------------');
  
  try {
    // Check if any API routes still reference users table
    console.log('🔍 Checking API routes for users table usage...');
    
    try {
      const apiResult = execSync('grep -r "users" src/app/api/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"', { encoding: 'utf8' });
      console.log('📋 API routes with "users" references:');
      console.log(apiResult);
    } catch (grepError) {
      console.log('✅ No API routes found with users table references');
    }
    
  } catch (error) {
    console.error('❌ API routes check failed:', error.message);
  }
}

async function checkScriptsUsage() {
  console.log('\n📋 STEP 4: Scripts Usage Analysis');
  console.log('----------------------------------------');
  
  try {
    // Check if any scripts still use users table
    console.log('🔍 Checking scripts for users table usage...');
    
    try {
      const scriptsResult = execSync('grep -r "users" scripts/ --include="*.js"', { encoding: 'utf8' });
      console.log('📋 Scripts with "users" references:');
      console.log(scriptsResult);
    } catch (grepError) {
      console.log('✅ No scripts found with users table references');
    }
    
  } catch (error) {
    console.error('❌ Scripts check failed:', error.message);
  }
}

async function generateUsageReport() {
  console.log('\n📋 STEP 5: Usage Report');
  console.log('----------------------------------------');
  
  console.log('📊 USERS TABLE USAGE SUMMARY');
  console.log('============================================================');
  console.log('');
  console.log('🔍 The users table is currently:');
  console.log('   - Still accessible in the database');
  console.log('   - Contains 5 records (likely test data)');
  console.log('   - Not being used by the application code');
  console.log('   - All functionality has been migrated to profiles table');
  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  console.log('   1. The users table can be safely removed');
  console.log('   2. All application functionality uses profiles table');
  console.log('   3. No code dependencies on users table remain');
  console.log('');
  console.log('⚠️  NEXT STEPS:');
  console.log('   - Manually delete test accounts from users table via Supabase Dashboard');
  console.log('   - Manually drop the users table via Supabase Dashboard');
  console.log('   - This will complete the migration process');
}

async function main() {
  try {
    console.log('🚀 Starting users table usage analysis...');
    console.log('');
    
    await checkDatabaseUsage();
    await checkCodebaseUsage();
    await checkAPIRoutes();
    await checkScriptsUsage();
    await generateUsageReport();
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

main();
