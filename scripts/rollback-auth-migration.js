#!/usr/bin/env node

// 🔄 ROLLBACK SCRIPT - Restore alle bestanden naar legacy auth system

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BACKUP_DIR = 'src/auth-systems/migration-backups';

console.log('🔄 Starting auth migration rollback...');

if (!fs.existsSync(BACKUP_DIR)) {
  console.log('❌ No backup directory found. Nothing to rollback.');
  process.exit(1);
}

// Find all backup files
const backupFiles = glob.sync(`${BACKUP_DIR}/*`);

if (backupFiles.length === 0) {
  console.log('❌ No backup files found. Nothing to rollback.');
  process.exit(1);
}

console.log(`📁 Found ${backupFiles.length} backup files`);

let restoredFiles = 0;

backupFiles.forEach(backupPath => {
  const fileName = path.basename(backupPath);
  
  // Find original file location
  const possiblePaths = [
    `src/app/**/${fileName}`,
    `src/components/**/${fileName}`,
    `src/hooks/**/${fileName}`,
    `src/lib/**/${fileName}`,
    `src/pages/**/${fileName}`,
    `src/**/${fileName}`
  ];

  let originalPath = null;
  
  for (const pattern of possiblePaths) {
    const matches = glob.sync(pattern);
    if (matches.length > 0) {
      originalPath = matches[0];
      break;
    }
  }

  if (originalPath && fs.existsSync(originalPath)) {
    // Restore backup
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(originalPath, backupContent);
    
    console.log(`✅ Restored: ${originalPath}`);
    restoredFiles++;
  } else {
    console.log(`⚠️ Could not find original location for: ${fileName}`);
  }
});

console.log('\n📊 Rollback Summary:');
console.log(`   Backup files: ${backupFiles.length}`);
console.log(`   Files restored: ${restoredFiles}`);

if (restoredFiles > 0) {
  console.log('\n✅ Rollback completed!');
  console.log('🔄 Your application has been restored to legacy auth system');
  
  // Update environment variable
  console.log('\n📝 Don\'t forget to update your .env.local:');
  console.log('NEXT_PUBLIC_AUTH_SYSTEM=legacy');
} else {
  console.log('\n❌ No files were restored');
}

console.log('\n🔄 Next steps:');
console.log('1. Update NEXT_PUBLIC_AUTH_SYSTEM=legacy in .env.local');
console.log('2. Restart development server: npm run dev');
console.log('3. Test your application');

module.exports = { restoredFiles };
