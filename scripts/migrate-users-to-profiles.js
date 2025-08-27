require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting Users to Profiles Migration...');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBackup() {
  console.log('📋 STEP 1: Creating Backup');
  console.log('----------------------------------------');
  
  try {
    // Backup profiles table
    const { data: usersBackup, error: usersError } = await supabase
      .from('profiles')
      .select('*');

    if (usersError) {
      console.error('❌ Users backup failed:', usersError.message);
      return false;
    }

    // Backup profiles table
    const { data: profilesBackup, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Profiles backup failed:', profilesError.message);
      return false;
    }

    console.log('✅ Backup created successfully:');
    console.log(`   - Users table: ${usersBackup.length} records`);
    console.log(`   - Profiles table: ${profilesBackup.length} records`);

    // Save backup to file (for safety)
    const fs = require('fs');
    const backupData = {
      timestamp: new Date().toISOString(),
      users: usersBackup,
      profiles: profilesBackup
    };

    fs.writeFileSync('migration-backup.json', JSON.stringify(backupData, null, 2));
    console.log('💾 Backup saved to migration-backup.json');

    return true;
  } catch (error) {
    console.error('❌ Backup creation failed:', error.message);
    return false;
  }
}

async function analyzeMigrationData() {
  console.log('\n📋 STEP 2: Analyzing Migration Data');
  console.log('----------------------------------------');
  
  try {
    // Get all users that need to be migrated
    const { data: usersToMigrate, error: usersError } = await supabase
      .from('profiles')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return false;
    }

    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return false;
    }

    const existingProfileIds = new Set(existingProfiles.map(p => p.id));
    const existingProfileEmails = new Set(existingProfiles.map(p => p.email));

    console.log('📊 Migration Analysis:');
    console.log(`   - Total users to check: ${usersToMigrate.length}`);
    console.log(`   - Existing profiles: ${existingProfiles.length}`);

    // Categorize users
    const usersToInsert = [];
    const usersToUpdate = [];
    const usersToSkip = [];

    usersToMigrate.forEach(user => {
      if (existingProfileIds.has(user.id)) {
        usersToUpdate.push(user);
      } else if (existingProfileEmails.has(user.email)) {
        usersToSkip.push(user);
        console.log(`   ⚠️ Skipping ${user.email} - email already exists in profiles`);
      } else {
        usersToInsert.push(user);
      }
    });

    console.log('\n📋 Migration Categories:');
    console.log(`   - Users to INSERT: ${usersToInsert.length}`);
    console.log(`   - Users to UPDATE: ${usersToUpdate.length}`);
    console.log(`   - Users to SKIP: ${usersToSkip.length}`);

    if (usersToInsert.length > 0) {
      console.log('\n📋 Users to INSERT:');
      usersToInsert.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }

    return { usersToInsert, usersToUpdate, usersToSkip };
  } catch (error) {
    console.error('❌ Migration analysis failed:', error.message);
    return false;
  }
}

async function migrateUsers(migrationData) {
  console.log('\n📋 STEP 3: Executing Migration');
  console.log('----------------------------------------');
  
  try {
    const { usersToInsert, usersToUpdate, usersToSkip } = migrationData;

    // Insert new users
    if (usersToInsert.length > 0) {
      console.log(`🔄 Inserting ${usersToInsert.length} new users...`);
      
      for (const user of usersToInsert) {
        try {
          const profileData = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
            role: user.role || 'user',
            points: user.points || 0,
            missions_completed: user.missions_completed || 0,
            last_login: user.last_login,
            bio: user.bio,
            location: user.location,
            interests: user.interests,
            cover_url: user.cover_url,
            main_goal: user.main_goal,
            posts: user.posts || 0,
            badges: user.badges || 0,
            // Set defaults for new fields
            display_name: user.full_name?.split(' ')[0] || user.email.split('@')[0],
            is_public: true,
            show_email: false,
            show_phone: false,
            affiliate_status: 'inactive',
            total_referrals: 0,
            active_referrals: 0,
            total_earned: 0,
            monthly_earnings: 0,
            rank: 'Beginner'
          };

          const { error } = await supabase
            .from('profiles')
            .insert(profileData);

          if (error) {
            console.error(`❌ Failed to insert ${user.email}:`, error.message);
          } else {
            console.log(`✅ Inserted: ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Error inserting ${user.email}:`, error.message);
        }
      }
    }

    // Update existing users (merge data)
    if (usersToUpdate.length > 0) {
      console.log(`🔄 Updating ${usersToUpdate.length} existing users...`);
      
      for (const user of usersToUpdate) {
        try {
          const updateData = {
            // Only update fields that are not null in profiles table
            ...(user.full_name && { full_name: user.full_name }),
            ...(user.avatar_url && { avatar_url: user.avatar_url }),
            ...(user.bio && { bio: user.bio }),
            ...(user.location && { location: user.location }),
            ...(user.interests && { interests: user.interests }),
            ...(user.main_goal && { main_goal: user.main_goal }),
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

          if (error) {
            console.error(`❌ Failed to update ${user.email}:`, error.message);
          } else {
            console.log(`✅ Updated: ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Error updating ${user.email}:`, error.message);
        }
      }
    }

    console.log('\n✅ Migration completed!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n📋 STEP 4: Verifying Migration');
  console.log('----------------------------------------');
  
  try {
    // Count final records
    const { count: finalProfilesCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting profiles:', countError.message);
      return false;
    }

    console.log(`✅ Final profiles count: ${finalProfilesCount}`);

    // Check for any missing data
    const { data: recentProfiles, error: recentError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ Error fetching recent profiles:', recentError.message);
      return false;
    }

    console.log('\n📊 Recent Profiles (verification):');
    recentProfiles.forEach(profile => {
      console.log(`   - ${profile.email} (${profile.role}) - ${profile.created_at}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting migration process...');
    
    // Step 1: Create backup
    const backupOk = await createBackup();
    if (!backupOk) {
      console.error('❌ Backup failed - stopping migration');
      return;
    }

    // Step 2: Analyze data
    const migrationData = await analyzeMigrationData();
    if (!migrationData) {
      console.error('❌ Analysis failed - stopping migration');
      return;
    }

    // Step 3: Execute migration
    const migrationOk = await migrateUsers(migrationData);
    if (!migrationOk) {
      console.error('❌ Migration failed');
      return;
    }

    // Step 4: Verify migration
    const verificationOk = await verifyMigration();
    if (!verificationOk) {
      console.error('❌ Verification failed');
      return;
    }

    console.log('\n🎉 MIGRATION SUCCESSFUL!');
    console.log('============================================================');
    console.log('✅ Backup created');
    console.log('✅ Data migrated');
    console.log('✅ Migration verified');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Update all code to use profiles table only');
    console.log('   2. Test all functionality');
    console.log('   3. Remove users table (after testing)');
    console.log('');
    console.log('💡 Migration backup saved to: migration-backup.json');

  } catch (error) {
    console.error('❌ Migration process failed:', error.message);
  }
}

main();
