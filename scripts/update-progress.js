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

async function updateTaskProgress(taskId, taskTitle, progressPercentage, additionalHours = 0, notes = '') {
  try {
    console.log(`📊 Updating progress for task: ${taskTitle}`);
    console.log(`📈 Progress: ${progressPercentage}%`);
    console.log(`⏱️  Additional hours: ${additionalHours}`);
    
    if (notes) {
      console.log(`📝 Notes: ${notes}`);
    }
    
    // Update task progress
    const taskUpdate = {
      progress_percentage: progressPercentage
    };
    
    // If additional hours provided, update actual hours
    if (additionalHours > 0) {
      taskUpdate.actual_hours = additionalHours;
    }
    
    const taskResult = await updateTaskStatus(taskId, taskUpdate);
    
    if (!taskResult) {
      console.error('❌ Failed to update task progress');
      return false;
    }
    
    console.log('📊 Progress updated successfully!');
    console.log('📋 Progress percentage set to:', progressPercentage + '%');
    
    if (additionalHours > 0) {
      console.log('⏱️  Additional hours logged:', additionalHours);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating task progress:', error);
    return false;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node scripts/update-progress.js <taskId> <taskTitle> <progressPercentage> [additionalHours] [notes]');
    console.log('Example: node scripts/update-progress.js "11111111-1111-1111-1111-111111111111" "Boekenkamer Frontend Database Integratie" 75 4 "Completed database schema integration"');
    process.exit(1);
  }
  
  const [taskId, taskTitle, progressPercentage, additionalHours = 0, ...notesParts] = args;
  const notes = notesParts.join(' ');
  
  console.log('📊 Task Progress Update System');
  console.log('==============================');
  
  const success = await updateTaskProgress(taskId, taskTitle, parseInt(progressPercentage), parseInt(additionalHours), notes);
  
  if (success) {
    console.log('\n✅ Progress updated successfully!');
    console.log('📋 Check the Planning & To-Do page to see the updated progress');
  } else {
    console.log('\n❌ Failed to update progress');
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  updateTaskStatus,
  updateTaskProgress
};

// Run if called directly
if (require.main === module) {
  main();
} 