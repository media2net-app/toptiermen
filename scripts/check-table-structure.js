const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  console.log('🔍 Checking Table Structure...\n');

  try {
    // Check user_xp table structure by trying to select all columns
    console.log('📊 user_xp table structure:');
    const { data: xpSample, error: xpError } = await supabase
      .from('user_xp')
      .select('*')
      .limit(1);

    if (xpError) {
      console.error('❌ Error accessing user_xp:', xpError);
    } else {
      console.log('✅ user_xp table accessible');
      if (xpSample && xpSample.length > 0) {
        console.log('Columns:', Object.keys(xpSample[0]));
      } else {
        console.log('Table is empty, but accessible');
      }
    }

    // Check user_badges table structure
    console.log('\n📊 user_badges table structure:');
    const { data: badgesSample, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(1);

    if (badgesError) {
      console.error('❌ Error accessing user_badges:', badgesError);
    } else {
      console.log('✅ user_badges table accessible');
      if (badgesSample && badgesSample.length > 0) {
        console.log('Columns:', Object.keys(badgesSample[0]));
      } else {
        console.log('Table is empty, but accessible');
      }
    }

    // Check xp_transactions table structure
    console.log('\n📊 xp_transactions table structure:');
    const { data: transactionsSample, error: transactionsError } = await supabase
      .from('xp_transactions')
      .select('*')
      .limit(1);

    if (transactionsError) {
      console.error('❌ Error accessing xp_transactions:', transactionsError);
    } else {
      console.log('✅ xp_transactions table accessible');
      if (transactionsSample && transactionsSample.length > 0) {
        console.log('Columns:', Object.keys(transactionsSample[0]));
      } else {
        console.log('Table is empty, but accessible');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkTableStructure(); 