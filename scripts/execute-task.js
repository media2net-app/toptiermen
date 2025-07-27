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

// Task execution functions
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

async function addProjectLogEntry(entry) {
  try {
    console.log('📝 Adding project log entry:', entry.title);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/project-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Project log entry added successfully');
      return result;
    } else {
      console.error('❌ Failed to add project log entry:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error adding project log entry:', error);
    return null;
  }
}

async function executeTask(taskId, taskTitle, hoursSpent, description) {
  try {
    console.log(`🚀 Executing task: ${taskTitle}`);
    console.log(`⏱️  Hours spent: ${hoursSpent}`);
    console.log(`📝 Description: ${description}`);
    
    // Update task status to completed
    const taskUpdate = {
      status: 'completed',
      progress_percentage: 100,
      actual_hours: hoursSpent,
      completion_date: new Date().toISOString()
    };
    
    const taskResult = await updateTaskStatus(taskId, taskUpdate);
    
    if (!taskResult) {
      console.error('❌ Failed to update task status');
      return false;
    }
    
    // Add project log entry
    const today = new Date().toISOString().split('T')[0];
    const logEntry = {
      id: `log-${today}-${taskId.slice(0, 8)}`,
      date: today,
      title: `Completed: ${taskTitle}`,
      description: description,
      hours_spent: hoursSpent,
      category: 'task-completion',
      milestone: 'Task Execution',
      created_at: new Date().toISOString()
    };
    
    const logResult = await addProjectLogEntry(logEntry);
    
    if (!logResult) {
      console.error('❌ Failed to add project log entry');
      return false;
    }
    
    console.log('🎉 Task execution completed successfully!');
    console.log('📊 Task marked as completed');
    console.log('📝 Project log entry added');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error executing task:', error);
    return false;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node scripts/execute-task.js <taskId> <taskTitle> <hoursSpent> <description>');
    console.log('Example: node scripts/execute-task.js "11111111-1111-1111-1111-111111111111" "Boekenkamer Frontend Database Integratie" 8 "Completed frontend database integration for books module"');
    process.exit(1);
  }
  
  const [taskId, taskTitle, hoursSpent, ...descriptionParts] = args;
  const description = descriptionParts.join(' ');
  
  console.log('🎯 Task Execution System');
  console.log('=======================');
  
  const success = await executeTask(taskId, taskTitle, parseInt(hoursSpent), description);
  
  if (success) {
    console.log('\n✅ Task execution completed successfully!');
    console.log('📋 Check the Planning & To-Do page to see the updated status');
    console.log('📊 Check the Project Logs page to see the new entry');
  } else {
    console.log('\n❌ Task execution failed');
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  updateTaskStatus,
  addProjectLogEntry,
  executeTask
};

// Run if called directly
if (require.main === module) {
  main();
} 