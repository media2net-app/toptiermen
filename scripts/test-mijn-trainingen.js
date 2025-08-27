const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMijnTrainingen() {
  console.log('🧪 Testing Mijn Trainingen functionality...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
  const baseUrl = 'http://localhost:3000';

  try {
    // Step 1: Check current user's selected schema
    console.log('📋 Step 1: Checking user\'s selected schema...');
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('selected_schema_id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.log('❌ Error fetching user data:', userError.message);
      return;
    }

    console.log('👤 User selected schema ID:', userData.selected_schema_id || 'None');

    // Step 2: Test the API endpoint
    console.log('\n📋 Step 2: Testing API endpoint...');
    const response = await fetch(`${baseUrl}/api/user-training-schema?userId=${userId}`);
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log('- Has Active Schema:', data.hasActiveSchema);
    console.log('- Message:', data.message);
    
    if (data.hasActiveSchema) {
      console.log('- Schema Name:', data.schema?.name);
      console.log('- Schema Category:', data.schema?.category);
      console.log('- Days Count:', data.days?.length);
      console.log('- Progress:', data.progress ? `${data.progress.completed_days}/${data.progress.total_days}` : 'None');
    }

    // Step 3: If no schema selected, test setting one
    if (!userData.selected_schema_id) {
      console.log('\n📋 Step 3: No schema selected, testing schema selection...');
      
      // Get available schemas
      const { data: schemas, error: schemasError } = await supabase
        .from('training_schemas')
        .select('*')
        .eq('status', 'published')
        .limit(1);

      if (schemasError) {
        console.log('❌ Error fetching schemas:', schemasError.message);
        return;
      }

      if (schemas && schemas.length > 0) {
        const schemaToSelect = schemas[0];
        console.log('📋 Found schema to select:', schemaToSelect.name);

        // Update user's selected schema
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ selected_schema_id: schemaToSelect.id })
          .eq('id', userId);

        if (updateError) {
          console.log('❌ Error updating user schema:', updateError.message);
        } else {
          console.log('✅ Successfully selected schema:', schemaToSelect.name);

          // Test API again
          console.log('\n📋 Step 4: Testing API after schema selection...');
          const response2 = await fetch(`${baseUrl}/api/user-training-schema?userId=${userId}`);
          const data2 = await response2.json();
          
          console.log('📊 Updated API Response:');
          console.log('- Has Active Schema:', data2.hasActiveSchema);
          console.log('- Schema Name:', data2.schema?.name);
          console.log('- Days Count:', data2.days?.length);
        }
      } else {
        console.log('⚠️  No published schemas available');
      }
    }

    // Step 4: Test with a user that has no schema
    console.log('\n📋 Step 5: Testing with user without schema...');
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const response3 = await fetch(`${baseUrl}/api/user-training-schema?userId=${testUserId}`);
    const data3 = await response3.json();
    
    console.log('📊 No Schema User Response:');
    console.log('- Has Active Schema:', data3.hasActiveSchema);
    console.log('- Message:', data3.message);

    console.log('\n🎉 Mijn Trainingen functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMijnTrainingen(); 