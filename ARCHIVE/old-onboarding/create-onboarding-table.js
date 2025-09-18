const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createOnboardingTable() {
  try {
    console.log('🏗️ Creating onboarding_status table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'create_onboarding_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.log(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with next statement
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n🎉 Onboarding table creation completed!');
    
    // Verify the table was created
    const { data: tableCheck, error: tableError } = await supabase
      .from('onboarding_status')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table verification failed:', tableError.message);
    } else {
      console.log('✅ Onboarding table verified successfully');
    }
    
    // Check if rob's onboarding status was created
    const { data: robStatus, error: robError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', '14d7c55b-4ccd-453f-b79f-403f306f1efb')
      .single();
    
    if (robError) {
      console.log('❌ Rob status check failed:', robError.message);
    } else {
      console.log('✅ Rob onboarding status created:', {
        user_id: robStatus.user_id,
        onboarding_completed: robStatus.onboarding_completed,
        current_step: robStatus.current_step
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating onboarding table:', error);
  }
}

createOnboardingTable(); 