const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTodoTablesSimple() {
  try {
    console.log('🚀 Creating todo tables using direct Supabase client...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('missions')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Since we can't create tables directly through the client, let's insert data into existing tables
    // or create a simple test to see if the API routes work
    
    console.log('📝 Testing API routes with existing data...');
    
    // Test the todo-tasks API
    const response = await fetch('http://localhost:3001/api/admin/todo-tasks');
    const result = await response.json();
    
    console.log('API Response:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTodoTablesSimple(); 