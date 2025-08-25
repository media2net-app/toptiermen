require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addWelcomeVideoTasks() {
  try {
    console.log('🎥 Adding welcome video tasks for all members...\n');

    // First, get all users from the profiles table
    console.log('📋 Fetching all users...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    // Check if welcome video tasks already exist
    console.log('\n🔍 Checking for existing welcome video tasks...');
    const { data: existingTasks, error: existingError } = await supabase
      .from('todo_tasks')
      .select('id, assigned_to, title')
      .ilike('title', '%welkomstvideo%');

    if (existingError) {
      console.error('❌ Error checking existing tasks:', existingError);
      return;
    }

    const existingTaskUsers = new Set(existingTasks?.map(task => task.assigned_to) || []);
    console.log(`📊 Found ${existingTasks?.length || 0} existing welcome video tasks`);

    // Filter out users who already have the task
    const usersNeedingTask = users.filter(user => !existingTaskUsers.has(user.full_name));
    console.log(`📋 ${usersNeedingTask.length} users need welcome video task`);

    if (usersNeedingTask.length === 0) {
      console.log('✅ All users already have welcome video tasks!');
      return;
    }

    // Create welcome video tasks for each user
    console.log('\n🎬 Creating welcome video tasks...');
    const tasksToInsert = usersNeedingTask.map(user => ({
      title: "Welkomstvideo Opnemen",
      description: `Neem een welkomstvideo op van ongeveer 1 minuut voor de camera. Vertel wie je bent, wat je doelen zijn, en wat je hoopt te bereiken met Top Tier Men. Plaats de video vervolgens op het forum onder het "Even voorstellen" topic.`,
      category: "community",
      priority: "high",
      status: "pending",
      assigned_to: user.full_name,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      estimated_hours: 1.5,
      progress_percentage: 0,
      tags: ["welkomstvideo", "forum", "community", "introductie"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert tasks in batches to avoid overwhelming the database
    const batchSize = 5;
    let insertedCount = 0;

    for (let i = 0; i < tasksToInsert.length; i += batchSize) {
      const batch = tasksToInsert.slice(i, i + batchSize);
      
      const { data: insertedTasks, error: insertError } = await supabase
        .from('todo_tasks')
        .insert(batch)
        .select('id, assigned_to, title');

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        continue;
      }

      insertedCount += insertedTasks?.length || 0;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedTasks?.length || 0} tasks`);
      
      // Small delay between batches
      if (i + batchSize < tasksToInsert.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n🎉 Successfully added ${insertedCount} welcome video tasks!`);
    
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Existing tasks: ${existingTasks?.length || 0}`);
    console.log(`   New tasks added: ${insertedCount}`);
    console.log(`   Users with task: ${existingTasks?.length + insertedCount}`);

    // Show users who got new tasks
    if (insertedCount > 0) {
      console.log('\n👥 Users who received welcome video tasks:');
      usersNeedingTask.forEach(user => {
        console.log(`   - ${user.full_name} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error adding welcome video tasks:', error);
  }
}

// Run the script
addWelcomeVideoTasks();
