import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

// GitHub webhook secret (should be set in environment variables)
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
  added: string[];
  removed: string[];
  modified: string[];
}

interface GitHubPushEvent {
  ref: string;
  before: string;
  after: string;
  commits: GitHubCommit[];
  repository: {
    name: string;
    full_name: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  head_commit: GitHubCommit;
}

// Calculate hours based on commit complexity
function calculateHoursFromCommits(commits: GitHubCommit[]): number {
  let totalHours = 0;
  
  for (const commit of commits) {
    let commitHours = 0.5; // Base hours per commit
    
    // Add hours based on message complexity
    const message = commit.message.toLowerCase();
    
    // Feature commits
    if (message.includes('feat') || message.includes('feature') || message.includes('add')) {
      commitHours += 1.0;
    }
    
    // Bug fixes
    if (message.includes('fix') || message.includes('bug') || message.includes('resolve')) {
      commitHours += 0.5;
    }
    
    // Major changes
    if (message.includes('major') || message.includes('refactor') || message.includes('rewrite')) {
      commitHours += 2.0;
    }
    
    // Database changes
    if (message.includes('db') || message.includes('database') || message.includes('schema')) {
      commitHours += 1.5;
    }
    
    // API changes
    if (message.includes('api') || message.includes('endpoint') || message.includes('route')) {
      commitHours += 1.0;
    }
    
    // UI changes
    if (message.includes('ui') || message.includes('component') || message.includes('style')) {
      commitHours += 0.75;
    }
    
    // Testing
    if (message.includes('test') || message.includes('spec')) {
      commitHours += 0.25;
    }
    
    // Documentation
    if (message.includes('doc') || message.includes('readme') || message.includes('comment')) {
      commitHours += 0.25;
    }
    
    // Add hours based on file changes
    const totalFiles = (commit.added?.length || 0) + (commit.removed?.length || 0) + (commit.modified?.length || 0);
    if (totalFiles > 10) {
      commitHours += 1.0; // Large changes
    } else if (totalFiles > 5) {
      commitHours += 0.5; // Medium changes
    }
    
    // Cap hours per commit (max 4 hours)
    commitHours = Math.min(commitHours, 4.0);
    
    totalHours += commitHours;
  }
  
  return Math.round(totalHours * 10) / 10; // Round to 1 decimal
}

// Determine category based on commit messages
function determineCategory(commits: GitHubCommit[]): string {
  const messages = commits.map(c => c.message.toLowerCase()).join(' ');
  
  if (messages.includes('feat') || messages.includes('feature') || messages.includes('add')) {
    return 'feature';
  }
  if (messages.includes('fix') || messages.includes('bug') || messages.includes('resolve')) {
    return 'bugfix';
  }
  if (messages.includes('db') || messages.includes('database') || messages.includes('schema')) {
    return 'database';
  }
  if (messages.includes('api') || messages.includes('endpoint') || messages.includes('route')) {
    return 'api';
  }
  if (messages.includes('ui') || messages.includes('component') || message.includes('style')) {
    return 'ui';
  }
  if (messages.includes('test') || messages.includes('spec')) {
    return 'testing';
  }
  if (messages.includes('doc') || messages.includes('readme')) {
    return 'documentation';
  }
  
  return 'improvement';
}

// Determine priority based on commit messages
function determinePriority(commits: GitHubCommit[]): string {
  const messages = commits.map(c => c.message.toLowerCase()).join(' ');
  
  if (messages.includes('critical') || messages.includes('urgent') || messages.includes('hotfix')) {
    return 'critical';
  }
  if (messages.includes('important') || messages.includes('major')) {
    return 'high';
  }
  if (messages.includes('minor') || messages.includes('small')) {
    return 'low';
  }
  
  return 'medium';
}

// Extract tags from commit messages
function extractTags(commits: GitHubCommit[]): string[] {
  const tags = new Set<string>();
  
  for (const commit of commits) {
    const message = commit.message.toLowerCase();
    
    // Extract common patterns
    if (message.includes('login') || message.includes('auth')) tags.add('authentication');
    if (message.includes('video') || message.includes('upload')) tags.add('video-upload');
    if (message.includes('admin') || message.includes('dashboard')) tags.add('admin-panel');
    if (message.includes('layout') || message.includes('ui')) tags.add('ui-improvement');
    if (message.includes('webpack') || message.includes('build')) tags.add('build-system');
    if (message.includes('error') || message.includes('fix')) tags.add('bugfix');
    if (message.includes('performance') || message.includes('optimize')) tags.add('optimization');
    if (message.includes('database') || message.includes('db')) tags.add('database');
    if (message.includes('api') || message.includes('endpoint')) tags.add('api');
    if (message.includes('test') || message.includes('spec')) tags.add('testing');
  }
  
  return Array.from(tags);
}

// Get related files from commits
function getRelatedFiles(commits: GitHubCommit[]): string[] {
  const files = new Set<string>();
  
  for (const commit of commits) {
    if (commit.added) commit.added.forEach(f => files.add(f));
    if (commit.modified) commit.modified.forEach(f => files.add(f));
    if (commit.removed) commit.removed.forEach(f => files.add(f));
  }
  
  return Array.from(files).slice(0, 10); // Limit to 10 files
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 GitHub webhook received');
    
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Verify webhook signature
    if (WEBHOOK_SECRET && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    const event = request.headers.get('x-github-event');
    
    if (event !== 'push') {
      console.log(`ℹ️ Ignoring non-push event: ${event}`);
      return NextResponse.json({ message: 'Event ignored' });
    }
    
    const pushEvent: GitHubPushEvent = JSON.parse(body);
    
    // Only process pushes to main branch
    if (pushEvent.ref !== 'refs/heads/main' && pushEvent.ref !== 'refs/heads/master') {
      console.log(`ℹ️ Ignoring push to non-main branch: ${pushEvent.ref}`);
      return NextResponse.json({ message: 'Non-main branch ignored' });
    }
    
    if (!pushEvent.commits || pushEvent.commits.length === 0) {
      console.log('ℹ️ No commits in push event');
      return NextResponse.json({ message: 'No commits to process' });
    }
    
    console.log(`📝 Processing ${pushEvent.commits.length} commits from ${pushEvent.pusher.name}`);
    
    // Calculate hours and metadata
    const hoursSpent = calculateHoursFromCommits(pushEvent.commits);
    const category = determineCategory(pushEvent.commits);
    const priority = determinePriority(pushEvent.commits);
    const tags = extractTags(pushEvent.commits);
    const relatedFiles = getRelatedFiles(pushEvent.commits);
    
    // Create title from commit messages
    const titles = pushEvent.commits.map(c => c.message.split('\n')[0]).slice(0, 3);
    const title = titles.length === 1 ? titles[0] : `${titles[0]} +${titles.length - 1} more`;
    
    // Create description
    const description = pushEvent.commits.map(c => c.message).join('\n\n');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have a log entry for today
    const { data: existingLogs } = await supabaseAdmin
      .from('project_logs')
      .select('id, hours_spent, title, description')
      .eq('date', today)
      .eq('category', category);
    
    if (existingLogs && existingLogs.length > 0) {
      // Update existing log
      const existingLog = existingLogs[0];
      const updatedHours = existingLog.hours_spent + hoursSpent;
      const updatedTitle = `${existingLog.title} + GitHub push`;
      const updatedDescription = `${existingLog.description}\n\n--- GitHub Push ---\n${description}`;
      
      const { error: updateError } = await supabaseAdmin
        .from('project_logs')
        .update({
          hours_spent: updatedHours,
          title: updatedTitle,
          description: updatedDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLog.id);
      
      if (updateError) {
        console.error('❌ Error updating existing log:', updateError);
        return NextResponse.json({ error: 'Failed to update log' }, { status: 500 });
      }
      
      console.log(`✅ Updated existing log for ${today}: +${hoursSpent}h (total: ${updatedHours}h)`);
    } else {
      // Create new log entry
      const dayNumber = Math.floor((new Date(today).getTime() - new Date('2025-05-28').getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const newLog = {
        date: today,
        day_number: dayNumber,
        title: title,
        description: description,
        category: category,
        priority: priority,
        hours_spent: hoursSpent,
        status: 'completed',
        tags: tags,
        related_files: relatedFiles,
        impact_score: 3,
        complexity_score: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabaseAdmin
        .from('project_logs')
        .insert(newLog);
      
      if (insertError) {
        console.error('❌ Error creating new log:', insertError);
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
      }
      
      console.log(`✅ Created new log for ${today}: ${hoursSpent}h`);
    }
    
    // Update project statistics
    const { data: existingStats } = await supabaseAdmin
      .from('project_statistics')
      .select('*')
      .eq('date', today);
    
    if (existingStats && existingStats.length > 0) {
      const existingStat = existingStats[0];
      const updatedHours = existingStat.total_hours_spent + hoursSpent;
      
      const { error: statsError } = await supabaseAdmin
        .from('project_statistics')
        .update({
          total_hours_spent: updatedHours,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStat.id);
      
      if (statsError) {
        console.error('❌ Error updating statistics:', statsError);
      } else {
        console.log(`📊 Updated statistics for ${today}: +${hoursSpent}h (total: ${updatedHours}h)`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${pushEvent.commits.length} commits`,
      hours_added: hoursSpent,
      category: category,
      priority: priority
    });
    
  } catch (error) {
    console.error('❌ Error processing GitHub webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 