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

// Hardcoded tasks (same as in the API)
const hardcodedTasks = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Boekenkamer Frontend Database Integratie",
    description: "Frontend pagina voor boekenkamer migreren van mock data naar echte database data uit books, book_categories en book_reviews tabellen",
    category: "frontend",
    priority: "high",
    estimated_hours: 16,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Frontend Team",
    due_date: "2025-08-12",
    start_date: "2025-07-28",
    completion_date: null,
    dependencies: [],
    tags: ["database", "frontend", "books"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Mijn Missies Volledige Database Integratie",
    description: "Volledige database integratie voor user_missions tabel met real-time progress tracking en achievement notifications",
    category: "frontend",
    priority: "high",
    estimated_hours: 8,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Frontend Team",
    due_date: "2025-08-12",
    start_date: "2025-07-30",
    completion_date: null,
    dependencies: [],
    tags: ["missions", "database", "progress"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Challenges Database Schema Design",
    description: "Database tabellen aanmaken voor challenges, user_challenges en challenge_categories met RLS policies en indexes",
    category: "database",
    priority: "high",
    estimated_hours: 12,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Backend Team",
    due_date: "2025-08-15",
    start_date: "2025-08-01",
    completion_date: null,
    dependencies: [],
    tags: ["challenges", "database", "schema"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Challenges API Routes",
    description: "API routes maken voor challenges systeem: /api/challenges, /api/user-challenges, /api/challenge-categories",
    category: "api",
    priority: "high",
    estimated_hours: 16,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Backend Team",
    due_date: "2025-08-17",
    start_date: "2025-08-03",
    completion_date: null,
    dependencies: ["33333333-3333-3333-3333-333333333333"],
    tags: ["api", "challenges", "endpoints"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Challenges Frontend Implementatie",
    description: "Frontend pagina voor challenges systeem met challenge creation, progress tracking en leaderboards",
    category: "frontend",
    priority: "high",
    estimated_hours: 20,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Frontend Team",
    due_date: "2025-08-20",
    start_date: "2025-08-05",
    completion_date: null,
    dependencies: ["33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"],
    tags: ["frontend", "challenges", "ui"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "11111111-1111-1111-1111-111111111112",
    title: "Gebruikersregistratie & Onboarding Flow",
    description: "Verbeterde registratie flow met email verificatie, profiel setup en onboarding wizard",
    category: "frontend",
    priority: "critical",
    estimated_hours: 20,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Frontend Team",
    due_date: "2025-08-18",
    start_date: "2025-08-01",
    completion_date: null,
    dependencies: [],
    tags: ["registration", "onboarding", "email-verification"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    title: "Payment Wall & Abonnement Systeem",
    description: "Stripe integratie voor membership abonnementen met payment wall en subscription management",
    category: "backend",
    priority: "critical",
    estimated_hours: 32,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Backend Team",
    due_date: "2025-08-20",
    start_date: "2025-08-05",
    completion_date: null,
    dependencies: ["11111111-1111-1111-1111-111111111112"],
    tags: ["stripe", "payments", "subscriptions"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "33333333-3333-3333-3333-333333333334",
    title: "Email Flow & Notificaties",
    description: "Comprehensive email systeem met welkom emails, onboarding reminders, en platform updates",
    category: "backend",
    priority: "high",
    estimated_hours: 16,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Backend Team",
    due_date: "2025-08-22",
    start_date: "2025-08-10",
    completion_date: null,
    dependencies: ["11111111-1111-1111-1111-111111111112"],
    tags: ["email", "notifications", "automation"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "44444444-4444-4444-4444-444444444445",
    title: "Google Analytics & Tracking",
    description: "Google Analytics 4 setup met custom events, conversion tracking en user journey analytics",
    category: "integration",
    priority: "high",
    estimated_hours: 12,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Full Stack Team",
    due_date: "2025-08-22",
    start_date: "2025-08-15",
    completion_date: null,
    dependencies: ["11111111-1111-1111-1111-111111111112"],
    tags: ["analytics", "tracking", "conversions"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  },
  {
    id: "55555555-5555-5555-5555-555555555556",
    title: "Final Testing & Launch Preparation",
    description: "Uitgebreide testing, bug fixes en finale voorbereidingen voor platform launch",
    category: "testing",
    priority: "critical",
    estimated_hours: 40,
    actual_hours: 0,
    status: "pending",
    assigned_to: "Full Stack Team",
    due_date: "2025-08-25",
    start_date: "2025-08-18",
    completion_date: null,
    dependencies: ["22222222-2222-2222-2222-222222222223", "33333333-3333-3333-3333-333333333334", "44444444-4444-4444-4444-444444444445"],
    tags: ["testing", "bugfixes", "launch-prep"],
    progress_percentage: 0,
    created_at: "2025-07-27T10:00:00Z"
  }
];

function getStatusColor(status) {
  switch (status) {
    case 'completed': return '🟢';
    case 'in_progress': return '🟡';
    case 'blocked': return '🔴';
    case 'pending': return '⚪';
    default: return '⚪';
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

function formatTask(task, showDetails = false) {
  const statusIcon = getStatusColor(task.status);
  const priorityIcon = getPriorityColor(task.priority);
  
  let output = `${statusIcon} ${priorityIcon} ${task.title}\n`;
  output += `   ID: ${task.id}\n`;
  output += `   Status: ${task.status} (${task.progress_percentage}%)\n`;
  output += `   Priority: ${task.priority}\n`;
  output += `   Category: ${task.category}\n`;
  output += `   Hours: ${task.actual_hours}/${task.estimated_hours}\n`;
  output += `   Due: ${task.due_date}\n`;
  
  if (showDetails) {
    output += `   Description: ${task.description}\n`;
    if (task.dependencies && task.dependencies.length > 0) {
      output += `   Dependencies: ${task.dependencies.join(', ')}\n`;
    }
    if (task.tags && task.tags.length > 0) {
      output += `   Tags: ${task.tags.join(', ')}\n`;
    }
  }
  
  return output;
}

function listTasks(filter = null) {
  console.log('📋 Available Tasks');
  console.log('==================');
  console.log('');
  
  let filteredTasks = hardcodedTasks;
  
  if (filter) {
    filteredTasks = hardcodedTasks.filter(task => 
      task.status === filter || 
      task.priority === filter || 
      task.category === filter ||
      task.title.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  if (filteredTasks.length === 0) {
    console.log('❌ No tasks found matching the filter');
    return;
  }
  
  // Group by status
  const groupedTasks = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    blocked: filteredTasks.filter(t => t.status === 'blocked')
  };
  
  Object.entries(groupedTasks).forEach(([status, tasks]) => {
    if (tasks.length > 0) {
      console.log(`${getStatusColor(status)} ${status.toUpperCase()} (${tasks.length})`);
      console.log('─'.repeat(50));
      
      tasks.forEach(task => {
        console.log(formatTask(task));
        console.log('');
      });
    }
  });
  
  // Summary
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending').length;
  
  console.log('📊 Summary');
  console.log('──────────');
  console.log(`Total tasks: ${totalTasks}`);
  console.log(`Completed: ${completedTasks}`);
  console.log(`In progress: ${inProgressTasks}`);
  console.log(`Pending: ${pendingTasks}`);
  
  const totalEstimatedHours = filteredTasks.reduce((sum, task) => sum + task.estimated_hours, 0);
  const totalActualHours = filteredTasks.reduce((sum, task) => sum + task.actual_hours, 0);
  
  console.log(`Total estimated hours: ${totalEstimatedHours}`);
  console.log(`Total actual hours: ${totalActualHours}`);
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const filter = args[0] || null;
  
  console.log('🎯 Task Management System');
  console.log('========================');
  console.log('');
  
  if (filter) {
    console.log(`🔍 Filtering tasks by: ${filter}`);
    console.log('');
  }
  
  listTasks(filter);
  
  console.log('');
  console.log('💡 Usage Examples:');
  console.log('  node scripts/list-tasks.js                    # List all tasks');
  console.log('  node scripts/list-tasks.js pending            # List pending tasks');
  console.log('  node scripts/list-tasks.js critical           # List critical priority tasks');
  console.log('  node scripts/list-tasks.js frontend           # List frontend tasks');
  console.log('  node scripts/list-tasks.js "database"         # Search for database tasks');
  console.log('');
  console.log('🚀 Task Management Commands:');
  console.log('  node scripts/start-task.js <id> <title>       # Start a task');
  console.log('  node scripts/update-progress.js <id> <title> <progress>  # Update progress');
  console.log('  node scripts/execute-task.js <id> <title> <hours> <desc> # Complete a task');
}

// Export functions for use in other scripts
module.exports = {
  hardcodedTasks,
  listTasks,
  formatTask
};

// Run if called directly
if (require.main === module) {
  main();
} 