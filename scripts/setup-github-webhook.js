const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupGitHubWebhook() {
  console.log('🚀 Setting up GitHub webhook for automatic project log updates...');
  
  try {
    // Test the webhook endpoint
    console.log('\n📋 Webhook Setup Instructions:');
    console.log('1. Go to your GitHub repository settings');
    console.log('2. Navigate to Webhooks');
    console.log('3. Click "Add webhook"');
    console.log('4. Set Payload URL to: https://your-domain.com/api/github/webhook');
    console.log('5. Set Content type to: application/json');
    console.log('6. Set Secret to a secure random string');
    console.log('7. Select "Just the push event"');
    console.log('8. Click "Add webhook"');
    
    console.log('\n🔧 Environment Variables to Add:');
    console.log('GITHUB_WEBHOOK_SECRET=your_webhook_secret_here');
    
    console.log('\n📊 Current Project Logs Status:');
    
    // Get current project logs
    const { data: logs, error: logsError } = await supabase
      .from('project_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('❌ Error fetching logs:', logsError);
    } else {
      console.log(`📝 Found ${logs.length} recent project logs`);
      logs.forEach(log => {
        console.log(`  - ${log.date}: ${log.title} (${log.hours_spent}h)`);
      });
    }
    
    // Get project statistics
    const { data: stats, error: statsError } = await supabase
      .from('project_statistics')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (statsError) {
      console.error('❌ Error fetching stats:', statsError);
    } else {
      console.log(`📊 Found ${stats.length} recent statistics entries`);
      stats.forEach(stat => {
        console.log(`  - ${stat.date}: ${stat.total_hours_spent}h total`);
      });
    }
    
    console.log('\n✅ Webhook setup instructions provided!');
    console.log('💡 The webhook will automatically:');
    console.log('  - Calculate hours based on commit complexity');
    console.log('  - Categorize work (feature, bugfix, etc.)');
    console.log('  - Update project logs and statistics');
    console.log('  - Extract tags and related files');
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
  }
}

async function testWebhook() {
  console.log('\n🧪 Testing webhook functionality...');
  
  try {
    // Create a test push event
    const testPushEvent = {
      ref: 'refs/heads/main',
      before: 'abc123',
      after: 'def456',
      commits: [
        {
          id: 'test-commit-1',
          message: 'feat: Add new user authentication system\n\n- Implement login/logout\n- Add password reset\n- Update user profile',
          timestamp: new Date().toISOString(),
          author: {
            name: 'Test Developer',
            email: 'test@example.com'
          },
          url: 'https://github.com/test/repo/commit/test-commit-1',
          added: ['src/auth/login.tsx', 'src/auth/logout.tsx'],
          removed: [],
          modified: ['src/components/Header.tsx']
        },
        {
          id: 'test-commit-2',
          message: 'fix: Resolve webpack build error\n\n- Fix module resolution\n- Update dependencies',
          timestamp: new Date().toISOString(),
          author: {
            name: 'Test Developer',
            email: 'test@example.com'
          },
          url: 'https://github.com/test/repo/commit/test-commit-2',
          added: [],
          removed: [],
          modified: ['package.json', 'webpack.config.js']
        }
      ],
      repository: {
        name: 'toptiermen',
        full_name: 'test/toptiermen'
      },
      pusher: {
        name: 'Test Developer',
        email: 'test@example.com'
      },
      head_commit: {
        id: 'test-commit-2',
        message: 'fix: Resolve webpack build error',
        timestamp: new Date().toISOString(),
        author: {
          name: 'Test Developer',
          email: 'test@example.com'
        },
        url: 'https://github.com/test/repo/commit/test-commit-2',
        added: [],
        removed: [],
        modified: ['package.json', 'webpack.config.js']
      }
    };
    
    console.log('📝 Test push event created:');
    console.log(`  - ${testPushEvent.commits.length} commits`);
    console.log(`  - Branch: ${testPushEvent.ref}`);
    console.log(`  - Author: ${testPushEvent.pusher.name}`);
    
    // Calculate expected hours
    const commit1Hours = 2.5; // feat + auth + multiple files
    const commit2Hours = 1.0; // fix + build + dependencies
    const totalExpectedHours = commit1Hours + commit2Hours;
    
    console.log(`⏱️  Expected hours: ${totalExpectedHours}h`);
    console.log(`  - Commit 1 (feat): ~${commit1Hours}h`);
    console.log(`  - Commit 2 (fix): ~${commit2Hours}h`);
    
    console.log('\n💡 To test the webhook:');
    console.log('1. Set up the webhook in GitHub');
    console.log('2. Make a real push to the main branch');
    console.log('3. Check the project logs for automatic updates');
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

async function showWebhookLogs() {
  console.log('\n📋 Recent webhook activity would appear here...');
  console.log('💡 After setting up the webhook, you can monitor:');
  console.log('  - GitHub webhook delivery logs');
  console.log('  - Project logs table for new entries');
  console.log('  - Project statistics for updated hours');
}

// Run the setup
async function main() {
  await setupGitHubWebhook();
  await testWebhook();
  await showWebhookLogs();
  
  console.log('\n🎉 GitHub webhook setup complete!');
  console.log('📚 Next steps:');
  console.log('  1. Configure the webhook in GitHub');
  console.log('  2. Add GITHUB_WEBHOOK_SECRET to .env.local');
  console.log('  3. Deploy your application');
  console.log('  4. Test with a real push');
}

main().catch(console.error); 