const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Task status update function
async function updateTaskStatus(taskId, updates) {
  try {
    console.log(`🔄 Updating task ${taskId} with:`, updates);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/todo-tasks?id=${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Task updated successfully');
      return result;
    } else {
      console.error('❌ Failed to update task:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating task:', error);
    return null;
  }
}

async function startTask(taskId, taskTitle, progressPercentage = 0) {
  try {
    console.log(`🚀 Starting task: ${taskTitle}`);
    console.log(`📊 Progress: ${progressPercentage}%`);
    
    // Update task status to in_progress
    const taskUpdate = {
      status: 'in_progress',
      progress_percentage: progressPercentage,
      start_date: new Date().toISOString()
    };
    
    const taskResult = await updateTaskStatus(taskId, taskUpdate);
    
    if (!taskResult) {
      console.error('❌ Failed to update task status');
      return false;
    }
    
    console.log('🎯 Task started successfully!');
    console.log('📋 Status changed to: in_progress');
    console.log('📊 Progress percentage set to:', progressPercentage + '%');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error starting task:', error);
    return false;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/start-task.js <taskId> <taskTitle> [progressPercentage]');
    console.log('Example: node scripts/start-task.js "11111111-1111-1111-1111-111111111111" "Boekenkamer Frontend Database Integratie" 25');
    process.exit(1);
  }
  
  const [taskId, taskTitle, progressPercentage = 0] = args;
  
  console.log('🎯 Task Start System');
  console.log('===================');
  
  const success = await startTask(taskId, taskTitle, parseInt(progressPercentage));
  
  if (success) {
    console.log('\n✅ Task started successfully!');
    console.log('📋 Check the Planning & To-Do page to see the updated status');
  } else {
    console.log('\n❌ Failed to start task');
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  updateTaskStatus,
  startTask
};

// Run if called directly
if (require.main === module) {
  main();
} 