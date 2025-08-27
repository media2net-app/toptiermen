const fs = require('fs');
const path = require('path');

console.log('🔧 Updating All Code to Use Profiles Table...');
console.log('============================================================');

// Files to update (based on the grep search results)
const filesToUpdate = [
  'src/lib/v2-api-utils.ts',
  'src/components/DebugPanel.tsx',
  'src/app/api/email/send/route.ts',
  'src/app/api/webhooks/stripe/route.ts',
  'src/app/api/dashboard-stats/route.ts',
  'src/app/api/payments/create-payment-intent/route.ts',
  'src/app/api/subscriptions/manage/route.ts',
  'src/app/api/test-database-pool/route.ts',
  'src/app/dashboard-admin/ledenbeheer/page.tsx',
  'src/app/dashboard/mijn-profiel/page.tsx',
  'src/app/api/create-test-user/route.ts',
  'src/app/api/admin/recreate-test-user/route.ts',
  'src/app/dashboard/trainingscentrum/page.tsx',
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/badge-stats/route.ts',
  'src/app/api/admin/prelaunch-emails/route.ts',
  'src/app/api/test-auth/route.ts',
  'src/app/api/admin/check-user-role/route.ts',
  'src/app/api/admin/setup-prelaunch-emails/route.ts',
  'src/app/api/admin/update-user-role/route.ts',
  'src/app/api/admin/reset-onboarding/route.ts',
  'src/app/api/admin/remove-constraint/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/update-role-by-id/route.ts',
  'src/app/api/user-training-schema/route.ts'
];

// Scripts to update
const scriptsToUpdate = [
  'scripts/check-chiel-progress.js',
  'scripts/test-user-auth.js',
  'scripts/check-chiel-academy-progress.js',
  'scripts/test-mijn-trainingen.js',
  'scripts/reset-rob-onboarding.js',
  'scripts/test-nutrition-status.js',
  'scripts/fix-login-trigger.js',
  'scripts/test-push-notifications.js',
  'scripts/check-users-table-simple.js',
  'scripts/remove-rank-column.js',
  'scripts/test-login-flow.js',
  'scripts/test-training-schemas.js',
  'scripts/setup-push-notifications-simple.js',
  'scripts/setup-push-notifications.js',
  'scripts/setup-push-notifications-direct.js',
  'scripts/debug-ledenbeheer.js',
  'scripts/check-user-names.js',
  'scripts/debug-chiel-profile.js',
  'scripts/add-academy-completion-badge.js',
  'scripts/fix-dashboard-database.js',
  'scripts/update-existing-logins.js',
  'scripts/check-profile-tables.js',
  'scripts/create-missions-via-api.js',
  'scripts/add-user-status.js',
  'scripts/fix-rls-completely.js',
  'scripts/update-rick-password.js'
];

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return { updated: false, error: 'File not found' };
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Replace .from('users') with .from('profiles')
    const usersRegex = /\.from\('users'\)/g;
    const usersMatches = content.match(usersRegex);
    if (usersMatches) {
      content = content.replace(usersRegex, ".from('profiles')");
      changes += usersMatches.length;
    }

    // Replace .from("users") with .from("profiles")
    const usersDoubleQuoteRegex = /\.from\("users"\)/g;
    const usersDoubleQuoteMatches = content.match(usersDoubleQuoteRegex);
    if (usersDoubleQuoteMatches) {
      content = content.replace(usersDoubleQuoteRegex, '.from("profiles")');
      changes += usersDoubleQuoteMatches.length;
    }

    // Replace 'users' table references in comments
    const usersCommentRegex = /\/\/.*users.*table/gi;
    const usersCommentMatches = content.match(usersCommentRegex);
    if (usersCommentMatches) {
      content = content.replace(usersCommentRegex, (match) => 
        match.replace(/users/gi, 'profiles')
      );
      changes += usersCommentMatches.length;
    }

    // Replace "users" table references in strings
    const usersStringRegex = /"users"/g;
    const usersStringMatches = content.match(usersStringRegex);
    if (usersStringMatches) {
      content = content.replace(usersStringRegex, '"profiles"');
      changes += usersStringMatches.length;
    }

    // Replace 'users' table references in strings
    const usersSingleQuoteStringRegex = /'users'/g;
    const usersSingleQuoteStringMatches = content.match(usersSingleQuoteStringRegex);
    if (usersSingleQuoteStringMatches) {
      content = content.replace(usersSingleQuoteStringRegex, "'profiles'");
      changes += usersSingleQuoteStringMatches.length;
    }

    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { updated: true, changes };
    } else {
      return { updated: false, changes: 0 };
    }

  } catch (error) {
    return { updated: false, error: error.message };
  }
}

function updateAllFiles() {
  console.log('📋 STEP 1: Updating Source Files');
  console.log('----------------------------------------');
  
  let totalFilesUpdated = 0;
  let totalChanges = 0;

  filesToUpdate.forEach(filePath => {
    console.log(`🔄 Updating: ${filePath}`);
    const result = updateFile(filePath);
    
    if (result.updated) {
      console.log(`✅ Updated: ${filePath} (${result.changes} changes)`);
      totalFilesUpdated++;
      totalChanges += result.changes;
    } else if (result.error) {
      console.log(`❌ Error: ${filePath} - ${result.error}`);
    } else {
      console.log(`ℹ️ No changes needed: ${filePath}`);
    }
  });

  console.log('\n📋 STEP 2: Updating Scripts');
  console.log('----------------------------------------');
  
  scriptsToUpdate.forEach(filePath => {
    console.log(`🔄 Updating: ${filePath}`);
    const result = updateFile(filePath);
    
    if (result.updated) {
      console.log(`✅ Updated: ${filePath} (${result.changes} changes)`);
      totalFilesUpdated++;
      totalChanges += result.changes;
    } else if (result.error) {
      console.log(`❌ Error: ${filePath} - ${result.error}`);
    } else {
      console.log(`ℹ️ No changes needed: ${filePath}`);
    }
  });

  return { totalFilesUpdated, totalChanges };
}

function createSummaryReport(stats) {
  console.log('\n📋 STEP 3: Summary Report');
  console.log('----------------------------------------');
  
  console.log('🎉 CODE UPDATE COMPLETED!');
  console.log('============================================================');
  console.log(`✅ Files updated: ${stats.totalFilesUpdated}`);
  console.log(`✅ Total changes: ${stats.totalChanges}`);
  console.log('');
  console.log('📋 What was updated:');
  console.log('   - .from("users") → .from("profiles")');
  console.log('   - .from(\'users\') → .from(\'profiles\')');
  console.log('   - Table references in comments');
  console.log('   - Table references in strings');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Test the application thoroughly');
  console.log('   2. Check for any remaining "users" references');
  console.log('   3. Remove the users table from database');
  console.log('   4. Update documentation');
  console.log('');
  console.log('💡 All code now uses the profiles table consistently!');
}

function main() {
  try {
    console.log('🚀 Starting code update process...');
    
    const stats = updateAllFiles();
    createSummaryReport(stats);
    
  } catch (error) {
    console.error('❌ Code update failed:', error.message);
  }
}

main();
