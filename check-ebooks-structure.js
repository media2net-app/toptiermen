const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEbooksStructure() {
  console.log('🔍 CHECKING ACADEMY_EBOOKS TABLE STRUCTURE...');
  
  try {
    // Get a sample record to see the structure
    const { data: ebooks, error } = await supabase
      .from('academy_ebooks')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching ebooks:', error);
      return;
    }

    if (ebooks && ebooks.length > 0) {
      console.log('📊 ACADEMY_EBOOKS TABLE STRUCTURE:');
      console.log('Available columns:');
      Object.keys(ebooks[0]).forEach(key => {
        console.log(`  • ${key}: ${typeof ebooks[0][key]}`);
      });
      console.log('');
      console.log('📋 Sample record:');
      console.log(JSON.stringify(ebooks[0], null, 2));
    } else {
      console.log('❌ No ebooks found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkEbooksStructure();
