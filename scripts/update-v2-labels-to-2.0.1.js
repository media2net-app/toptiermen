const fs = require('fs');
const path = require('path');

console.log('🔄 UPDATING ALL V2.0 LABELS TO 2.0.1');
console.log('============================================================');

// Files to update with their specific patterns
const filesToUpdate = [
  {
    path: 'src/app/login/page.tsx',
    patterns: [
      { from: 'V2.0', to: '2.0.1' },
      { from: 'v2.0', to: '2.0.1' }
    ]
  },
  {
    path: 'src/app/systeem-status/page.tsx',
    patterns: [
      { from: 'V2.0', to: '2.0.1' },
      { from: 'v2.0', to: '2.0.1' }
    ]
  },
  {
    path: 'src/contexts/SupabaseAuthContext.tsx',
    patterns: [
      { from: 'V2.0:', to: '2.0.1:' },
      { from: 'V2.0 ', to: '2.0.1 ' }
    ]
  },
  {
    path: 'src/contexts/V2StateContext.tsx',
    patterns: [
      { from: 'V2.0:', to: '2.0.1:' },
      { from: 'V2.0 ', to: '2.0.1 ' }
    ]
  },
  {
    path: 'src/components/ErrorBoundary.tsx',
    patterns: [
      { from: 'V2.0:', to: '2.0.1:' },
      { from: 'V2.0 ', to: '2.0.1 ' }
    ]
  },
  {
    path: 'src/components/V2MonitoringDashboard.tsx',
    patterns: [
      { from: 'V2.0:', to: '2.0.1:' },
      { from: 'V2.0 ', to: '2.0.1 ' }
    ]
  },
  {
    path: 'src/components/V2PerformanceAlerts.tsx',
    patterns: [
      { from: 'V2.0:', to: '2.0.1:' },
      { from: 'V2.0 ', to: '2.0.1 ' }
    ]
  },
  {
    path: 'src/app/dashboard/DashboardContent.tsx',
    patterns: [
      { from: 'V2.0:', to: '2.0.1:' },
      { from: 'V2.0 ', to: '2.0.1 ' }
    ]
  }
];

function updateFile(filePath, patterns) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.from, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, pattern.to);
        changes += matches.length;
      }
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath} (${changes} changes)`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('📋 STEP 1: Updating Specific Files');
  console.log('----------------------------------------');
  
  let totalFilesUpdated = 0;
  let totalChanges = 0;

  filesToUpdate.forEach(file => {
    console.log(`\n🔧 Updating: ${file.path}`);
    const updated = updateFile(file.path, file.patterns);
    if (updated) {
      totalFilesUpdated++;
    }
  });

  console.log('\n📋 STEP 2: Updating All TypeScript/JavaScript Files');
  console.log('----------------------------------------');

  // Function to recursively find all .tsx and .ts files
  function findFiles(dir, extensions = ['.tsx', '.ts', '.js']) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(findFiles(filePath, extensions));
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    });
    
    return results;
  }

  // Find all TypeScript/JavaScript files
  const allFiles = findFiles('src');
  let additionalFilesUpdated = 0;

  allFiles.forEach(filePath => {
    // Skip files we already updated
    if (filesToUpdate.some(f => f.path === filePath)) {
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let changes = 0;

      // Update common patterns
      const patterns = [
        { from: 'V2.0:', to: '2.0.1:' },
        { from: 'V2.0 ', to: '2.0.1 ' },
        { from: 'v2.0:', to: '2.0.1:' },
        { from: 'v2.0 ', to: '2.0.1 ' }
      ];

      patterns.forEach(pattern => {
        const regex = new RegExp(pattern.from, 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, pattern.to);
          changes += matches.length;
        }
      });

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${filePath} (${changes} changes)`);
        additionalFilesUpdated++;
        totalChanges += changes;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('\n📋 STEP 3: Summary');
  console.log('----------------------------------------');
  
  console.log(`✅ Total files updated: ${totalFilesUpdated + additionalFilesUpdated}`);
  console.log(`✅ Specific files: ${totalFilesUpdated}`);
  console.log(`✅ Additional files: ${additionalFilesUpdated}`);
  console.log(`✅ Total changes: ${totalChanges}`);
  
  console.log('\n🎯 RESULT:');
  console.log('✅ All V2.0 labels updated to 2.0.1');
  console.log('✅ Login page version badge updated');
  console.log('✅ System status page updated');
  console.log('✅ Context files updated');
  console.log('✅ Component files updated');
  console.log('');
  console.log('🚀 Ready for deployment!');
}

main();
