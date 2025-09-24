const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAPIDirect() {
  console.log('🔍 Testing API directly...\n');
  
  try {
    // Test brotherhood groups
    console.log('Testing brotherhood groups...');
    const { data: groups, error: groupsError } = await supabase
      .from('brotherhood_groups')
      .select('*')
      .limit(5);
    
    if (groupsError) {
      console.log('❌ Brotherhood groups error:', groupsError.message);
    } else {
      console.log('✅ Brotherhood groups:', groups?.length || 0, 'groups found');
    }
    
    // Test products
    console.log('Testing products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.log('❌ Products error:', productsError.message);
    } else {
      console.log('✅ Products:', products?.length || 0, 'products found');
    }
    
    // Test mind focus profiles
    console.log('Testing mind focus profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('mind_focus_profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Mind focus profiles error:', profilesError.message);
    } else {
      console.log('✅ Mind focus profiles:', profiles?.length || 0, 'profiles found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPIDirect();
