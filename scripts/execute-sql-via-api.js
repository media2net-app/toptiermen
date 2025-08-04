require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function executeSQLViaAPI() {
  console.log('🚀 Executing SQL via API for Push Notifications Setup...\n');

  try {
    // Read the SQL file
    const sqlPath = 'scripts/setup-push-notifications-direct.sql';
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement via API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`📋 SQL: ${statement.substring(0, 100)}...`);
        
        try {
          const response = await fetch('http://localhost:3000/api/admin/execute-sql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: statement })
          });

          const result = await response.json();
          
          if (result.success) {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            if (result.message) {
              console.log(`   Message: ${result.message}`);
            }
          } else {
            console.log(`⚠️  Statement ${i + 1} failed:`, result.error);
          }
        } catch (apiError) {
          console.log(`⚠️  Statement ${i + 1} failed (API error):`, apiError.message);
        }
      }
    }

    console.log('\n🎉 SQL execution completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check if the push_subscriptions table was created');
    console.log('2. Test the push notification functionality');
    console.log('3. Verify the environment variables are set correctly');

  } catch (error) {
    console.error('❌ Error executing SQL:', error);
  }
}

// Run execution
executeSQLViaAPI(); 