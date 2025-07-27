const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Debugging database tables...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTables() {
  try {
    console.log('\n📊 Testing book_categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('book_categories')
      .select('*')
      .limit(1);

    if (categoriesError) {
      console.log('❌ book_categories error:', categoriesError);
    } else {
      console.log('✅ book_categories exists, count:', categories?.length || 0);
    }

    console.log('\n📚 Testing books table...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .limit(1);

    if (booksError) {
      console.log('❌ books error:', booksError);
    } else {
      console.log('✅ books exists, count:', books?.length || 0);
    }

    console.log('\n🔍 Testing schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT table_name, table_schema 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('books', 'book_categories')
          ORDER BY table_name;
        `
      });

    if (schemaError) {
      console.log('❌ Schema query error:', schemaError);
    } else {
      console.log('✅ Schema query result:', schemaData);
    }

  } catch (error) {
    console.error('❌ General error:', error);
  }
}

debugTables(); 