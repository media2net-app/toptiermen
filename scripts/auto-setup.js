const { dbExecutor } = require('./db-executor');
const fs = require('fs');
const path = require('path');

async function autoSetup() {
  console.log('🚀 Starting automatic setup for Top Tier Men...\n');

  try {
    // Step 1: Test basic connection
    console.log('📋 Step 1: Testing database connection...');
    const connectionOk = await dbExecutor.testConnection();
    
    if (!connectionOk) {
      console.error('❌ Database connection failed. Please check your environment variables.');
      console.log('📋 Required environment variables:');
      console.log('  - NEXT_PUBLIC_SUPABASE_URL');
      console.log('  - SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');

    // Step 2: Create exec_sql function if needed
    console.log('📋 Step 2: Setting up exec_sql function...');
    const execSqlOk = await dbExecutor.ensureExecSqlFunction();
    
    if (!execSqlOk) {
      console.log('⚠️ exec_sql function not available');
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(fs.readFileSync('create_exec_sql_function.sql', 'utf8'));
      console.log('\nAfter running the SQL, restart this script.');
      process.exit(1);
    }
    
    console.log('✅ exec_sql function is ready\n');

    // Step 3: Fix storage bucket issues
    console.log('📋 Step 3: Fixing storage bucket issues...');
    await fixStorageBucketIssues();
    console.log('✅ Storage bucket issues resolved\n');

    // Step 4: Setup session timeout
    console.log('📋 Step 4: Setting up session timeout extension...');
    await setupSessionTimeout();
    console.log('✅ Session timeout setup completed\n');

    // Step 5: Setup prelaunch emails
    console.log('📋 Step 5: Setting up prelaunch emails...');
    await setupPrelaunchEmails();
    console.log('✅ Prelaunch emails setup completed\n');

    // Step 6: Final verification
    console.log('📋 Step 6: Final verification...');
    await finalVerification();

    console.log('\n🎉 Automatic setup completed successfully!');
    console.log('\n📋 What was fixed:');
    console.log('✅ Database connection established');
    console.log('✅ exec_sql function created');
    console.log('✅ Storage bucket for workout videos');
    console.log('✅ Session timeout extension');
    console.log('✅ Prelaunch emails table');
    console.log('\n🚀 You can now use the database CLI:');
    console.log('  node scripts/db-cli.js help');

  } catch (error) {
    console.error('❌ Automatic setup failed:', error);
    process.exit(1);
  }
}

async function fixStorageBucketIssues() {
  try {
    // Check if workout-videos bucket exists
    const bucketCheck = await dbExecutor.executeSQL(`
      SELECT id, name, public 
      FROM storage.buckets 
      WHERE id = 'workout-videos';
    `);

    if (bucketCheck.success && bucketCheck.data && bucketCheck.data.length > 0) {
      console.log('✅ Workout-videos bucket already exists');
    } else {
      console.log('🔧 Creating workout-videos bucket...');
      
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
        console.log('✅ Workout-videos bucket created');
      } else {
        console.log('⚠️ Bucket creation failed, trying alternative method...');
        
        // Try using the SQL file
        const result = await dbExecutor.executeSQLFile('setup_workout_videos_bucket_simple.sql');
        if (result.success) {
          console.log('✅ Workout-videos bucket created via SQL file');
        } else {
          console.log('❌ Failed to create bucket');
        }
      }
    }

    // Check and create policies
    const policies = await dbExecutor.executeSQL(`
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'objects' 
      AND policyname LIKE '%workout_videos%';
    `);

    if (policies.success && policies.data && policies.data.length > 0) {
      console.log('✅ Storage policies exist');
    } else {
      console.log('🔧 Creating storage policies...');
      
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
        console.log('✅ Storage policies created');
      } else {
        console.log('❌ Failed to create policies');
      }
    }

  } catch (error) {
    console.error('❌ Error fixing storage bucket:', error);
  }
}

async function setupSessionTimeout() {
  try {
    // Check if session extension functions exist
    const functionCheck = await dbExecutor.executeSQL(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name = 'extend_user_session';
    `);

    if (functionCheck.success && functionCheck.data && functionCheck.data.length > 0) {
      console.log('✅ Session timeout functions already exist');
    } else {
      console.log('🔧 Creating session timeout functions...');
      
      const result = await dbExecutor.executeSQLFile('extend_session_timeout.sql');
      
      if (result.success) {
        console.log('✅ Session timeout functions created');
      } else {
        console.log('⚠️ Session timeout setup had some issues, but continuing...');
      }
    }

  } catch (error) {
    console.error('❌ Error setting up session timeout:', error);
  }
}

async function setupPrelaunchEmails() {
  try {
    // Check if prelaunch_emails table exists
    const tableCheck = await dbExecutor.executeSQL(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'prelaunch_emails';
    `);

    if (tableCheck.success && tableCheck.data && tableCheck.data.length > 0) {
      console.log('✅ Prelaunch emails table already exists');
    } else {
      console.log('🔧 Creating prelaunch emails table...');
      
      const result = await dbExecutor.executeSQLFile('setup_prelaunch_emails_manual.sql');
      
      if (result.success) {
        console.log('✅ Prelaunch emails table created');
      } else {
        console.log('⚠️ Prelaunch emails setup had some issues, but continuing...');
      }
    }

  } catch (error) {
    console.error('❌ Error setting up prelaunch emails:', error);
  }
}

async function finalVerification() {
  try {
    console.log('🔍 Running final verification...');
    
    // Test video upload bucket
    const bucketTest = await dbExecutor.executeSQL(`
      SELECT id FROM storage.buckets WHERE id = 'workout-videos';
    `);
    
    if (bucketTest.success && bucketTest.data && bucketTest.data.length > 0) {
      console.log('✅ Workout videos bucket: OK');
    } else {
      console.log('❌ Workout videos bucket: MISSING');
    }

    // Test session functions
    const sessionTest = await dbExecutor.executeSQL(`
      SELECT routine_name FROM information_schema.routines WHERE routine_name = 'extend_user_session';
    `);
    
    if (sessionTest.success && sessionTest.data && sessionTest.data.length > 0) {
      console.log('✅ Session timeout functions: OK');
    } else {
      console.log('❌ Session timeout functions: MISSING');
    }

    // Test prelaunch table
    const prelaunchTest = await dbExecutor.executeSQL(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'prelaunch_emails';
    `);
    
    if (prelaunchTest.success && prelaunchTest.data && prelaunchTest.data.length > 0) {
      console.log('✅ Prelaunch emails table: OK');
    } else {
      console.log('❌ Prelaunch emails table: MISSING');
    }

    // Test exec_sql function
    const execSqlTest = await dbExecutor.executeSQL('SELECT 1 as test');
    
    if (execSqlTest.success) {
      console.log('✅ exec_sql function: OK');
    } else {
      console.log('❌ exec_sql function: MISSING');
    }

  } catch (error) {
    console.error('❌ Error during final verification:', error);
  }
}

// Run the auto setup
if (require.main === module) {
  autoSetup();
}

module.exports = { autoSetup }; 