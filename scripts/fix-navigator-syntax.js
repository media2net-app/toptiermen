const fs = require('fs');
const path = require('path');

// Files that need manual fixes
const manualFixes = [
  {
    file: 'src/app/clear-cache/page.tsx',
    find: /const registrations = await typeof navigator !== 'undefined' \? navigator\.serviceWorker : null\.getRegistrations\(\);/g,
    replace: 'const registrations = await navigator.serviceWorker.getRegistrations();'
  },
  {
    file: 'src/components/CacheIssueHelper.tsx',
    find: /const registrations = await typeof navigator !== 'undefined' \? navigator\.serviceWorker : null\.getRegistrations\(\);/g,
    replace: 'const registrations = await navigator.serviceWorker.getRegistrations();'
  },
  {
    file: 'src/components/CacheTestPanel.tsx',
    find: /const registrations = await typeof navigator !== 'undefined' \? navigator\.serviceWorker : null\.getRegistrations\(\);/g,
    replace: 'const registrations = await navigator.serviceWorker.getRegistrations();'
  }
];

console.log('🔧 Fixing navigator syntax errors...');

manualFixes.forEach(({ file, find, replace }) => {
  try {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      content = content.replace(find, replace);
      
      if (originalContent !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('🎉 Navigator syntax fixes completed!');
