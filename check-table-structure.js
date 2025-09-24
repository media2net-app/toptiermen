const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');
  
  try {
    // Check product_categories structure
    console.log('Checking product_categories...');
    const { data: catData, error: catError } = await supabase
      .from('product_categories')
      .select('*')
      .limit(1);
    
    if (catError) {
      console.log('❌ product_categories error:', catError.message);
    } else {
      console.log('✅ product_categories accessible');
    }
    
    // Check products structure
    console.log('Checking products...');
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (prodError) {
      console.log('❌ products error:', prodError.message);
    } else {
      console.log('✅ products accessible');
    }
    
    // Check brotherhood_events structure
    console.log('Checking brotherhood_events...');
    const { data: eventData, error: eventError } = await supabase
      .from('brotherhood_events')
      .select('*')
      .limit(1);
    
    if (eventError) {
      console.log('❌ brotherhood_events error:', eventError.message);
    } else {
      console.log('✅ brotherhood_events accessible');
    }
    
    // Get table info
    console.log('\nGetting table information...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .in('table_name', ['product_categories', 'products', 'brotherhood_events'])
      .order('table_name, ordinal_position');
    
    if (tableError) {
      console.log('❌ Table info error:', tableError.message);
    } else {
      console.log('📋 Table structures:');
      tableInfo?.forEach(row => {
        console.log(`${row.table_name}.${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableStructure();
