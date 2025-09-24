const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabaseCompletion() {
  console.log('🔍 Testing database completion...\n');
  
  const tests = [
    // Brotherhood tables
    { name: 'Brotherhood Groups', table: 'brotherhood_groups' },
    { name: 'Brotherhood Events', table: 'brotherhood_events' },
    { name: 'Brotherhood Group Members', table: 'brotherhood_group_members' },
    { name: 'Brotherhood Event Attendees', table: 'brotherhood_event_attendees' },
    
    // Products tables
    { name: 'Product Categories', table: 'product_categories' },
    { name: 'Products', table: 'products' },
    { name: 'Product Reviews', table: 'product_reviews' },
    { name: 'Product Images', table: 'product_images' },
    
    // Workout tables
    { name: 'Workout Templates', table: 'workout_templates' },
    { name: 'Workout Exercises', table: 'workout_exercises' },
    { name: 'Workout Sessions', table: 'workout_sessions' },
    { name: 'Workout Session Exercises', table: 'workout_session_exercises' },
    
    // Mind & Focus tables
    { name: 'Mind Focus Profiles', table: 'mind_focus_profiles' },
    { name: 'Meditation Sessions', table: 'meditation_sessions' },
    { name: 'Journal Entries', table: 'journal_entries' },
    { name: 'Mind Focus Progress', table: 'mind_focus_progress' }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const { data, error } = await supabase
        .from(test.table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: Table exists and accessible`);
        passedTests++;
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Database Completion Results:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Completion: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 CONGRATULATIONS! 100% Database Frontend Complete!');
    console.log('All required tables are created and accessible.');
  } else {
    console.log('\n⚠️  Some tables are missing or not accessible.');
    console.log('Please check the failed tests above.');
  }
  
  // Test API endpoints
  console.log('\n🔗 Testing API endpoints...');
  
  const apiTests = [
    { name: 'Brotherhood Groups API', endpoint: '/api/brotherhood/groups' },
    { name: 'Brotherhood Events API', endpoint: '/api/brotherhood/events' },
    { name: 'Products API', endpoint: '/api/products' },
    { name: 'Books API', endpoint: '/api/books' },
    { name: 'Mind Focus API', endpoint: '/api/mind-focus/profiles' }
  ];
  
  for (const apiTest of apiTests) {
    try {
      const response = await fetch(`http://localhost:3000${apiTest.endpoint}`);
      if (response.ok) {
        console.log(`✅ ${apiTest.name}: API accessible`);
      } else {
        console.log(`❌ ${apiTest.name}: API returned ${response.status}`);
      }
    } catch (err) {
      console.log(`❌ ${apiTest.name}: ${err.message}`);
    }
  }
}

testDatabaseCompletion();
