const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock GitHub commits data (in real scenario, this would come from GitHub API)
const mockGitHubCommits = [
  // Recent commits (last few days)
  {
    date: '2025-01-28',
    commits: [
      {
        id: 'commit-1',
        message: 'fix: Resolve webpack build error and layout issues\n\n- Fix admin layout client component separation\n- Resolve "use client" directive placement\n- Update AdminLayoutClient component structure\n- Fix module resolution errors',
        author: 'Developer',
        files: ['src/app/dashboard-admin/layout.tsx', 'src/app/dashboard-admin/AdminLayoutClient.tsx'],
        added: ['src/app/dashboard-admin/AdminLayoutClient.tsx'],
        modified: ['src/app/dashboard-admin/layout.tsx'],
        removed: []
      }
    ]
  },
  {
    date: '2025-01-27',
    commits: [
      {
        id: 'commit-2',
        message: 'feat: Implement GitHub webhook for automatic project logs\n\n- Add GitHub webhook endpoint\n- Create automatic hours calculation\n- Implement commit analysis and categorization\n- Add webhook setup and testing scripts',
        author: 'Developer',
        files: ['src/app/api/github/webhook/route.ts', 'scripts/setup-github-webhook.js'],
        added: ['src/app/api/github/webhook/route.ts', 'scripts/setup-github-webhook.js'],
        modified: [],
        removed: []
      },
      {
        id: 'commit-3',
        message: 'fix: Video upload improvements and error handling\n\n- Add retry logic with exponential backoff\n- Implement proper error handling for Supabase storage\n- Add cancel functionality for uploads\n- Improve progress tracking and UI feedback',
        author: 'Developer',
        files: ['src/components/VideoUpload.tsx'],
        added: [],
        modified: ['src/components/VideoUpload.tsx'],
        removed: []
      }
    ]
  },
  {
    date: '2025-01-26',
    commits: [
      {
        id: 'commit-4',
        message: 'feat: Remove exercise difficulty and video previews\n\n- Remove "Niveau" field from exercise forms\n- Remove video previews from exercise cards\n- Clean up test video placeholders\n- Update exercise modal and admin interface',
        author: 'Developer',
        files: ['src/app/dashboard-admin/trainingscentrum/ExerciseModal.tsx', 'src/app/dashboard-admin/trainingscentrum/page.tsx'],
        added: [],
        modified: ['src/app/dashboard-admin/trainingscentrum/ExerciseModal.tsx', 'src/app/dashboard-admin/trainingscentrum/page.tsx'],
        removed: []
      }
    ]
  }
];

// Calculate hours based on commit complexity
function calculateHoursFromCommit(commit) {
  let hours = 0.5; // Base hours per commit
  
  const message = commit.message.toLowerCase();
  
  // Feature commits
  if (message.includes('feat') || message.includes('feature') || message.includes('add')) {
    hours += 1.5;
  }
  
  // Bug fixes
  if (message.includes('fix') || message.includes('bug') || message.includes('resolve')) {
    hours += 1.0;
  }
  
  // Major changes
  if (message.includes('major') || message.includes('refactor') || message.includes('rewrite')) {
    hours += 2.0;
  }
  
  // Webhook/API changes
  if (message.includes('webhook') || message.includes('api') || message.includes('endpoint')) {
    hours += 1.5;
  }
  
  // Video/upload changes
  if (message.includes('video') || message.includes('upload')) {
    hours += 1.0;
  }
  
  // Layout/UI changes
  if (message.includes('layout') || message.includes('ui') || message.includes('component')) {
    hours += 1.0;
  }
  
  // Build system changes
  if (message.includes('webpack') || message.includes('build') || message.includes('module')) {
    hours += 1.5;
  }
  
  // Add hours based on file changes
  const totalFiles = (commit.added?.length || 0) + (commit.removed?.length || 0) + (commit.modified?.length || 0);
  if (totalFiles > 5) {
    hours += 1.0;
  } else if (totalFiles > 2) {
    hours += 0.5;
  }
  
  return Math.round(hours * 10) / 10; // Round to 1 decimal
}

// Determine category based on commit message
function determineCategory(commit) {
  const message = commit.message.toLowerCase();
  
  if (message.includes('feat') || message.includes('feature')) {
    return 'feature';
  }
  if (message.includes('fix') || message.includes('bug') || message.includes('resolve')) {
    return 'bugfix';
  }
  if (message.includes('webhook') || message.includes('api')) {
    return 'api';
  }
  if (message.includes('video') || message.includes('upload')) {
    return 'improvement';
  }
  if (message.includes('layout') || message.includes('ui')) {
    return 'ui';
  }
  if (message.includes('webpack') || message.includes('build')) {
    return 'deployment';
  }
  
  return 'improvement';
}

// Extract tags from commit message
function extractTags(commit) {
  const tags = new Set();
  const message = commit.message.toLowerCase();
  
  if (message.includes('webhook')) tags.add('webhook');
  if (message.includes('video') || message.includes('upload')) tags.add('video-upload');
  if (message.includes('layout') || message.includes('ui')) tags.add('ui-improvement');
  if (message.includes('webpack') || message.includes('build')) tags.add('build-system');
  if (message.includes('fix') || message.includes('bug')) tags.add('bugfix');
  if (message.includes('feat') || message.includes('feature')) tags.add('feature');
  if (message.includes('admin')) tags.add('admin-panel');
  if (message.includes('exercise')) tags.add('exercise-management');
  
  return Array.from(tags);
}

async function syncGitHubCommits() {
  console.log('🔄 Syncing GitHub commits with project logs...');
  
  try {
    for (const dayData of mockGitHubCommits) {
      const { date, commits } = dayData;
      
      console.log(`\n📅 Processing ${date}: ${commits.length} commits`);
      
      // Calculate total hours for the day
      let totalHours = 0;
      let allMessages = [];
      let allTags = new Set();
      let allFiles = new Set();
      
      for (const commit of commits) {
        const hours = calculateHoursFromCommit(commit);
        totalHours += hours;
        allMessages.push(commit.message);
        
        // Collect tags
        const tags = extractTags(commit);
        tags.forEach(tag => allTags.add(tag));
        
        // Collect files
        if (commit.files) {
          commit.files.forEach(file => allFiles.add(file));
        }
        
        console.log(`  - ${commit.id}: ${commit.message.split('\n')[0]} (${hours}h)`);
      }
      
      // Check if we already have a log for this date
      const { data: existingLogs } = await supabase
        .from('project_logs')
        .select('*')
        .eq('date', date);
      
      if (existingLogs && existingLogs.length > 0) {
        console.log(`  ⚠️  Log already exists for ${date}, skipping...`);
        continue;
      }
      
      // Create new project log entry
      const dayNumber = Math.floor((new Date(date).getTime() - new Date('2025-05-28').getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const category = determineCategory(commits[0]); // Use first commit's category
      
      const newLog = {
        date: date,
        day_number: dayNumber,
        title: commits.length === 1 ? commits[0].message.split('\n')[0] : `${commits[0].message.split('\n')[0]} +${commits.length - 1} more`,
        description: allMessages.join('\n\n'),
        category: category,
        priority: 'medium',
        hours_spent: totalHours,
        status: 'completed',
        tags: Array.from(allTags),
        related_files: Array.from(allFiles).slice(0, 10), // Limit to 10 files
        impact_score: 3,
        complexity_score: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('project_logs')
        .insert(newLog);
      
      if (insertError) {
        console.error(`  ❌ Error creating log for ${date}:`, insertError);
      } else {
        console.log(`  ✅ Created log for ${date}: ${totalHours}h`);
      }
      
      // Update project statistics
      const { data: existingStats } = await supabase
        .from('project_statistics')
        .select('*')
        .eq('date', date);
      
      if (existingStats && existingStats.length > 0) {
        const existingStat = existingStats[0];
        const updatedHours = existingStat.total_hours_spent + totalHours;
        
        const { error: statsError } = await supabase
          .from('project_statistics')
          .update({
            total_hours_spent: updatedHours,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStat.id);
        
        if (statsError) {
          console.error(`  ❌ Error updating stats for ${date}:`, statsError);
        } else {
          console.log(`  📊 Updated statistics for ${date}: +${totalHours}h`);
        }
      }
    }
    
    console.log('\n✅ GitHub commits sync completed!');
    
    // Show summary
    const { data: recentLogs } = await supabase
      .from('project_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);
    
    if (recentLogs) {
      console.log('\n📋 Recent project logs:');
      recentLogs.forEach(log => {
        console.log(`  - ${log.date}: ${log.title} (${log.hours_spent}h)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error syncing GitHub commits:', error);
  }
}

async function showSyncStatus() {
  console.log('\n📊 Current sync status:');
  
  try {
    const { data: logs, error: logsError } = await supabase
      .from('project_logs')
      .select('date, title, hours_spent')
      .order('date', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('❌ Error fetching logs:', logsError);
    } else {
      console.log(`📝 Found ${logs.length} project logs`);
      logs.forEach(log => {
        console.log(`  - ${log.date}: ${log.title} (${log.hours_spent}h)`);
      });
    }
    
    const { data: stats, error: statsError } = await supabase
      .from('project_statistics')
      .select('date, total_hours_spent')
      .order('date', { ascending: false })
      .limit(5);
    
    if (statsError) {
      console.error('❌ Error fetching stats:', statsError);
    } else {
      console.log(`📊 Found ${stats.length} statistics entries`);
      stats.forEach(stat => {
        console.log(`  - ${stat.date}: ${stat.total_hours_spent}h total`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error showing sync status:', error);
  }
}

// Run the sync
async function main() {
  await showSyncStatus();
  await syncGitHubCommits();
  
  console.log('\n🎉 GitHub commits sync complete!');
  console.log('💡 Next steps:');
  console.log('  1. Set up GitHub webhook for automatic updates');
  console.log('  2. Configure webhook secret in environment');
  console.log('  3. Test with real commits');
}

main().catch(console.error); 