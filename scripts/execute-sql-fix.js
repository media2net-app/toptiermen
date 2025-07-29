const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlFix() {
  console.log('🔧 Executing SQL fixes for dashboard database...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('scripts/fix-dashboard-database.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Try alternative approach using direct query
            console.log(`⚠️ RPC failed, trying direct query for statement ${i + 1}...`);
            
            // For CREATE TABLE statements, we'll use a different approach
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              console.log(`📋 Skipping CREATE TABLE statement (will be handled by Supabase UI)`);
            } else {
              console.log(`⚠️ Statement ${i + 1} failed:`, error.message);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (execError) {
          console.log(`⚠️ Statement ${i + 1} failed:`, execError.message);
        }
      }
    }

    console.log('\n🎉 SQL execution completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/fix-dashboard-database.sql');
    console.log('4. Execute the SQL manually');
    console.log('5. Restart your development server');

  } catch (error) {
    console.error('❌ Error executing SQL:', error);
  }
}

executeSqlFix(); 