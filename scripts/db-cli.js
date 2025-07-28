#!/usr/bin/env node

const { dbExecutor } = require('./db-executor');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Help function
function showHelp() {
  console.log(`
🚀 Database CLI Tool voor Top Tier Men

📋 Beschikbare commando's:

  test                    - Test database connectie
  list-tables            - Toon alle tabellen
  describe <table>       - Toon tabel structuur
  execute <file.sql>     - Voer SQL bestand uit
  execute-multiple <dir> - Voer alle .sql bestanden in directory uit
  backup <table>         - Maak backup van tabel
  setup-workout-videos   - Setup workout videos storage bucket
  setup-session-timeout  - Setup sessie timeout verlenging
  setup-prelaunch        - Setup prelaunch emails tabel
  fix-storage-bucket     - Fix storage bucket problemen

📝 Voorbeelden:
  node scripts/db-cli.js test
  node scripts/db-cli.js list-tables
  node scripts/db-cli.js describe users
  node scripts/db-cli.js execute setup_workout_videos_bucket_simple.sql
  node scripts/db-cli.js setup-workout-videos
  node scripts/db-cli.js setup-session-timeout

🔧 Environment variables nodig:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
`);
}

// Execute command
async function executeCommand() {
  try {
    switch (command) {
      case 'test':
        console.log('🧪 Testing database connection...\n');
        await dbExecutor.testConnection();
        break;

      case 'list-tables':
        console.log('📋 Listing all tables...\n');
        await dbExecutor.listTables();
        break;

      case 'describe':
        const tableName = args[1];
        if (!tableName) {
          console.error('❌ Table name required: node scripts/db-cli.js describe <table>');
          process.exit(1);
        }
        console.log(`📋 Describing table: ${tableName}\n`);
        await dbExecutor.describeTable(tableName);
        break;

      case 'execute':
        const filePath = args[1];
        if (!filePath) {
          console.error('❌ File path required: node scripts/db-cli.js execute <file.sql>');
          process.exit(1);
        }
        console.log(`📖 Executing SQL file: ${filePath}\n`);
        await dbExecutor.executeSQLFile(filePath);
        break;

      case 'execute-multiple':
        const dirPath = args[1] || '.';
        console.log(`📁 Executing all SQL files in: ${dirPath}\n`);
        
        const sqlFiles = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.sql'))
          .map(file => path.join(dirPath, file));
        
        if (sqlFiles.length === 0) {
          console.log('❌ No SQL files found in directory');
          process.exit(1);
        }
        
        console.log(`📝 Found ${sqlFiles.length} SQL files:`);
        sqlFiles.forEach(file => console.log(`  - ${file}`));
        console.log();
        
        await dbExecutor.executeMultipleFiles(sqlFiles);
        break;

      case 'backup':
        const backupTable = args[1];
        if (!backupTable) {
          console.error('❌ Table name required: node scripts/db-cli.js backup <table>');
          process.exit(1);
        }
        console.log(`💾 Creating backup of table: ${backupTable}\n`);
        await dbExecutor.backupTable(backupTable);
        break;

      case 'setup-workout-videos':
        console.log('🏋️ Setting up workout videos storage bucket...\n');
        await setupWorkoutVideos();
        break;

      case 'setup-session-timeout':
        console.log('⏰ Setting up session timeout extension...\n');
        await setupSessionTimeout();
        break;

      case 'setup-prelaunch':
        console.log('📧 Setting up prelaunch emails...\n');
        await setupPrelaunchEmails();
        break;

      case 'fix-storage-bucket':
        console.log('🔧 Fixing storage bucket issues...\n');
        await fixStorageBucket();
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.error('❌ Unknown command:', command);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Command execution failed:', error);
    process.exit(1);
  }
}

// Setup workout videos storage bucket
async function setupWorkoutVideos() {
  try {
    // First test connection
    const connectionOk = await dbExecutor.testConnection();
    if (!connectionOk) {
      console.error('❌ Database connection failed');
      return;
    }

    // Execute the workout videos setup
    const result = await dbExecutor.executeSQLFile('setup_workout_videos_bucket_simple.sql');
    
    if (result.success) {
      console.log('✅ Workout videos storage bucket setup completed successfully!');
      console.log('🎉 Video uploads should now work in the training center');
    } else {
      console.error('❌ Workout videos setup failed');
      console.log('📋 Please check the errors above and run manually if needed');
    }
  } catch (error) {
    console.error('❌ Error setting up workout videos:', error);
  }
}

// Setup session timeout extension
async function setupSessionTimeout() {
  try {
    // First test connection
    const connectionOk = await dbExecutor.testConnection();
    if (!connectionOk) {
      console.error('❌ Database connection failed');
      return;
    }

    // Execute the session timeout setup
    const result = await dbExecutor.executeSQLFile('extend_session_timeout.sql');
    
    if (result.success) {
      console.log('✅ Session timeout extension setup completed successfully!');
      console.log('🎉 Users will no longer be automatically logged out');
      console.log('📋 Remember to also update JWT expiry in Supabase Dashboard');
    } else {
      console.error('❌ Session timeout setup failed');
      console.log('📋 Please check the errors above and run manually if needed');
    }
  } catch (error) {
    console.error('❌ Error setting up session timeout:', error);
  }
}

// Setup prelaunch emails
async function setupPrelaunchEmails() {
  try {
    // First test connection
    const connectionOk = await dbExecutor.testConnection();
    if (!connectionOk) {
      console.error('❌ Database connection failed');
      return;
    }

    // Execute the prelaunch emails setup
    const result = await dbExecutor.executeSQLFile('setup_prelaunch_emails_manual.sql');
    
    if (result.success) {
      console.log('✅ Prelaunch emails setup completed successfully!');
      console.log('🎉 Prelaunch page should now work in admin dashboard');
    } else {
      console.error('❌ Prelaunch emails setup failed');
      console.log('📋 Please check the errors above and run manually if needed');
    }
  } catch (error) {
    console.error('❌ Error setting up prelaunch emails:', error);
  }
}

// Fix storage bucket issues
async function fixStorageBucket() {
  try {
    console.log('🔍 Checking storage bucket status...');
    
    // Check if workout-videos bucket exists
    const bucketCheck = await dbExecutor.executeSQL(`
      SELECT id, name, public 
      FROM storage.buckets 
      WHERE id = 'workout-videos';
    `);

    if (bucketCheck.success && bucketCheck.data && bucketCheck.data.length > 0) {
      console.log('✅ Workout-videos bucket exists');
      console.log('📊 Bucket info:', bucketCheck.data[0]);
    } else {
      console.log('❌ Workout-videos bucket does not exist');
      console.log('🔧 Creating bucket...');
      
      const createBucket = await dbExecutor.executeSQL(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'workout-videos',
          'workout-videos',
          true,
          524288000,
          ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime']
        );
      `);

      if (createBucket.success) {
        console.log('✅ Workout-videos bucket created successfully');
      } else {
        console.error('❌ Failed to create bucket:', createBucket.error);
      }
    }

    // Check and create policies
    console.log('🔒 Checking storage policies...');
    
    const policies = await dbExecutor.executeSQL(`
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'objects' 
      AND policyname LIKE '%workout_videos%';
    `);

    if (policies.success && policies.data && policies.data.length > 0) {
      console.log('✅ Storage policies exist');
      console.log('📊 Policies:', policies.data.map(p => p.policyname));
    } else {
      console.log('❌ Storage policies missing');
      console.log('🔧 Creating policies...');
      
      const policySQL = `
        CREATE POLICY IF NOT EXISTS "workout_videos_upload" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_view_auth" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_view_public" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'workout-videos'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_update" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_delete" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );
      `;

      const createPolicies = await dbExecutor.executeSQL(policySQL);
      
      if (createPolicies.success) {
        console.log('✅ Storage policies created successfully');
      } else {
        console.error('❌ Failed to create policies:', createPolicies.error);
      }
    }

    console.log('🎉 Storage bucket fix completed!');
    console.log('📋 Video uploads should now work properly');

  } catch (error) {
    console.error('❌ Error fixing storage bucket:', error);
  }
}

// Run the command
if (args.length === 0) {
  showHelp();
} else {
  executeCommand();
} 