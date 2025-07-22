const { testConnection } = require('./db-admin');

async function test() {
  console.log('🔍 Testing database connection...');
  const success = await testConnection();
  
  if (success) {
    console.log('🎉 Database connection is working!');
    console.log('✅ You can now use the assistant to execute SQL directly');
  } else {
    console.log('❌ Database connection failed');
    console.log('📋 Please check:');
    console.log('   1. SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.log('   2. exec_sql function is created in database');
    console.log('   3. Service role has proper permissions');
  }
}

test(); 