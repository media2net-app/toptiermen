require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addChielTasks() {
  try {
    console.log('📝 Adding new tasks for Chiel...');

    const tasks = [
      {
        title: 'Nieuwe leden standaard voorstellen op forum',
        description: 'Automatisch nieuwe leden voorstellen op het forum zodat ze zich kunnen introduceren aan de community. Dit moet gebeuren zodra een nieuw lid zich registreert.',
        category: 'community',
        priority: 'high',
        estimated_hours: 4.0,
        status: 'pending',
        assigned_to: 'Chiel',
        due_date: '2025-01-31',
        start_date: '2025-01-15',
        progress_percentage: 0,
        tags: ['forum', 'onboarding', 'community', 'automation']
      },
      {
        title: 'Automatisch vriendverzoek Rick en Chiel naar nieuwe leden',
        description: 'Automatisch vriendverzoeken sturen van Rick en Chiel naar nieuwe leden zodra ze zich registreren. Dit zorgt voor directe connectie en persoonlijke betrokkenheid.',
        category: 'community',
        priority: 'high',
        estimated_hours: 3.0,
        status: 'pending',
        assigned_to: 'Chiel',
        due_date: '2025-01-31',
        start_date: '2025-01-15',
        progress_percentage: 0,
        tags: ['friend-request', 'onboarding', 'community', 'automation']
      }
    ];

    for (const task of tasks) {
      console.log(`📋 Adding task: ${task.title}`);
      
      const { data: newTask, error } = await supabase
        .from('todo_tasks')
        .insert([{
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding task "${task.title}":`, error);
      } else {
        console.log(`✅ Task added successfully: ${newTask.id}`);
      }
    }

    console.log('🎉 All tasks for Chiel have been added!');
    
    // Verify the tasks were added
    const { data: chielTasks, error: fetchError } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('assigned_to', 'Chiel')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching Chiel tasks:', fetchError);
    } else {
      console.log(`📊 Total tasks for Chiel: ${chielTasks.length}`);
      chielTasks.forEach(task => {
        console.log(`  - ${task.title} (${task.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addChielTasks();
