#!/usr/bin/env node

// 🔄 MIGRATION SCRIPT - Update alle imports naar optimal auth system
// Voorzichtige migration met backup van gewijzigde bestanden

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = 'src/auth-systems/migration-backups';

console.log('🚀 Starting auth system migration...');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);

// Ensure backup directory exists
if (!DRY_RUN && !fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Find all TypeScript/JavaScript files that might use auth
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: [
    'src/auth-systems/**',
    'src/contexts/SupabaseAuthContext.tsx', // Keep original
    'src/lib/supabase.ts', // Keep original
  ]
});

console.log(`📁 Found ${files.length} files to scan`);

let changedFiles = 0;
let totalChanges = 0;

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileChanges = 0;

  // Track changes made
  const changes = [];

  // 1. Replace import statement
  if (newContent.includes("from '@/contexts/SupabaseAuthContext'")) {
    newContent = newContent.replace(
      /import\s*{\s*useSupabaseAuth\s*}\s*from\s*'@\/contexts\/SupabaseAuthContext'/g,
      "import { useAuth } from '@/auth-systems/optimal/useAuth'"
    );
    
    changes.push('Updated import statement');
    fileChanges++;
  }

  // 2. Replace hook usage
  if (newContent.includes('useSupabaseAuth(')) {
    newContent = newContent.replace(/useSupabaseAuth\(/g, 'useAuth(');
    changes.push('Updated hook usage');
    fileChanges++;
  }

  // 3. Replace SupabaseAuthProvider with AuthProvider (optional)
  if (newContent.includes('SupabaseAuthProvider')) {
    newContent = newContent.replace(/SupabaseAuthProvider/g, 'AuthProvider');
    newContent = newContent.replace(
      /from\s*'@\/contexts\/SupabaseAuthContext'/g,
      "from '@/auth-systems/optimal/AuthProvider'"
    );
    changes.push('Updated provider component');
    fileChanges++;
  }

  // Only process files that have changes
  if (fileChanges > 0) {
    console.log(`\n📝 ${filePath}:`);
    changes.forEach(change => console.log(`   - ${change}`));

    if (!DRY_RUN) {
      // Create backup
      const backupPath = path.join(BACKUP_DIR, path.basename(filePath));
      fs.writeFileSync(backupPath, content);
      
      // Write updated file
      fs.writeFileSync(filePath, newContent);
      console.log(`   ✅ Updated (backup: ${backupPath})`);
    } else {
      console.log(`   📋 Would update (dry run)`);
    }

    changedFiles++;
    totalChanges += fileChanges;
  }
});

console.log('\n📊 Migration Summary:');
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files changed: ${changedFiles}`);
console.log(`   Total changes: ${totalChanges}`);

if (DRY_RUN) {
  console.log('\n🔍 This was a DRY RUN - no files were changed');
  console.log('Run without --dry-run to perform actual migration');
} else {
  console.log('\n✅ Migration completed!');
  console.log(`📁 Backups saved in: ${BACKUP_DIR}`);
}

console.log('\n🔄 Next steps:');
console.log('1. Test your application thoroughly');
console.log('2. Check for any TypeScript errors');
console.log('3. Verify all auth flows work correctly');
console.log('4. Run: npm run dev to start development server');

// Add rollback instructions
if (!DRY_RUN && changedFiles > 0) {
  console.log('\n🚨 Rollback instructions (if needed):');
  console.log('1. Stop development server');
  console.log('2. Run: node scripts/rollback-auth-migration.js');
  console.log('3. Restart development server');
}

module.exports = { changedFiles, totalChanges };
