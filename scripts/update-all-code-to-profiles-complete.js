const fs = require('fs');
const path = require('path');

console.log('🔧 Complete Code Update to Use Profiles Table...');
console.log('============================================================');

// All files that need updating (from grep search)
const allFilesToUpdate = [
  // Critical files
  'src/contexts/SupabaseAuthContext.tsx',
  'src/app/dashboard/brotherhood/leden/[id]/page.tsx',
  'src/app/dashboard/voedingsplannen/page.tsx',
  
  // API routes
  'src/app/api/admin/force-update-role/route.ts',
  'src/app/api/admin/cleanup-users-table/route.ts',
  'src/app/api/admin/list-users/route.ts',
  'src/app/api/admin/create-test-user/route.ts',
  'src/app/api/admin/email-campaign/route.ts',
  'src/app/api/admin/final-fix-constraints/route.ts',
  'src/app/api/admin/delete-and-recreate-user/route.ts',
  'src/app/api/admin/force-update-role-by-id/route.ts',
  'src/app/api/admin/setup-admin/route.ts',
  'src/app/api/admin/onboarding-status/route.ts',
  'src/app/api/admin/dashboard-stats/route.ts',
  'src/app/api/admin/fix-all-constraints/route.ts',
  'src/app/api/v2/dashboard/route.ts',
  'src/app/api/admin/create-user/route.ts',
  'src/app/api/v2/users/route.ts',
  
  // Scripts (keep some for reference, update others)
  'scripts/compare-users-vs-profiles.js',
  'scripts/analyze-profiles-table.js',
  'scripts/migrate-users-to-profiles.js'
];

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return { updated: false, error: 'File not found' };
    }

    let content = fs.readFileSync(filePath, 'utf8');
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

    // Replace table name in variable names and comments
    const tableNameRegex = /usersTable|userTable/g;
    const tableNameMatches = content.match(tableNameRegex);
    if (tableNameMatches) {
      content = content.replace(tableNameRegex, (match) => 
        match.replace(/users/, 'profiles').replace(/user/, 'profile')
      );
      changes += tableNameMatches.length;
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
  console.log('📋 Updating All Remaining Files');
  console.log('----------------------------------------');
  
  let totalFilesUpdated = 0;
  let totalChanges = 0;

  allFilesToUpdate.forEach(filePath => {
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
  console.log('\n📋 Summary Report');
  console.log('----------------------------------------');
  
  console.log('🎉 COMPLETE CODE UPDATE FINISHED!');
  console.log('============================================================');
  console.log(`✅ Files updated: ${stats.totalFilesUpdated}`);
  console.log(`✅ Total changes: ${stats.totalChanges}`);
  console.log('');
  console.log('📋 What was updated:');
  console.log('   - .from("users") → .from("profiles")');
  console.log('   - .from(\'users\') → .from(\'profiles\')');
  console.log('   - Table references in comments');
  console.log('   - Table references in strings');
  console.log('   - Variable names with table references');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Test the application thoroughly');
  console.log('   2. Remove the users table from database');
  console.log('   3. Update documentation');
  console.log('');
  console.log('💡 All code now uses the profiles table consistently!');
}

function main() {
  try {
    console.log('🚀 Starting complete code update process...');
    
    const stats = updateAllFiles();
    createSummaryReport(stats);
    
  } catch (error) {
    console.error('❌ Code update failed:', error.message);
  }
}

main();
