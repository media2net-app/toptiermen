const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTodoDatabase() {
  try {
    console.log('🧪 Testing todo_tasks database...');
    
    // Test 1: Check if table exists
    console.log('📋 Test 1: Checking if table exists...');
    const { data: existingData, error: testError } = await supabase
      .from('todo_tasks')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Table does not exist or has permission issues:', testError.message);
      console.log('💡 You need to create the table first. Run the SQL from TODOS_DATABASE_SETUP.md');
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    
    // Test 2: Count existing tasks
    console.log('📊 Test 2: Counting existing tasks...');
    const { count, error: countError } = await supabase
      .from('todo_tasks')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting tasks:', countError.message);
    } else {
      console.log(`✅ Found ${count} existing tasks`);
    }
    
    // Test 3: Insert a test task
    console.log('➕ Test 3: Inserting test task...');
    const testTask = {
      title: 'Test Task - Database Connection',
      description: 'This task confirms the database is working correctly',
      category: 'testing',
      priority: 'low',
      estimated_hours: 1,
      status: 'pending',
      assigned_to: 'Chiel',
      due_date: '2025-12-31'
    };
    
    const { data: newTask, error: insertError } = await supabase
      .from('todo_tasks')
      .insert([testTask])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test task:', insertError.message);
      console.log('💡 This indicates a database permission or schema issue');
    } else {
      console.log('✅ Test task inserted successfully:', newTask.id);
      
      // Test 4: Update the test task
      console.log('✏️ Test 4: Updating test task...');
      const { data: updatedTask, error: updateError } = await supabase
        .from('todo_tasks')
        .update({ 
          status: 'in_progress',
          progress_percentage: 50 
        })
        .eq('id', newTask.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating test task:', updateError.message);
      } else {
        console.log('✅ Test task updated successfully');
      }
      
      // Test 5: Delete the test task
      console.log('🗑️ Test 5: Deleting test task...');
      const { error: deleteError } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('id', newTask.id);
      
      if (deleteError) {
        console.error('❌ Error deleting test task:', deleteError.message);
      } else {
        console.log('✅ Test task deleted successfully');
      }
    }
    
    // Test 6: Test search functionality
    console.log('🔍 Test 6: Testing search functionality...');
    const { data: searchResults, error: searchError } = await supabase
      .from('todo_tasks')
      .select('*')
      .ilike('title', '%test%')
      .limit(5);
    
    if (searchError) {
      console.error('❌ Error searching tasks:', searchError.message);
    } else {
      console.log(`✅ Search found ${searchResults.length} tasks with 'test' in title`);
    }
    
    console.log('🎉 All database tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTodoDatabase(); 