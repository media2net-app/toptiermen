const fs = require('fs');
const path = require('path');

// Specific fixes for problematic files
const fixes = [
  {
    file: 'src/app/dashboard-admin/ebooks-setup/page.tsx',
    find: /typeof navigator !== 'undefined' \? navigator\.clipboard : null\.writeText/g,
    replace: 'navigator.clipboard.writeText'
  },
  {
    file: 'src/components/ApiAdForm.tsx',
    find: /typeof navigator !== 'undefined' \? navigator\.clipboard : null\.writeText/g,
    replace: 'navigator.clipboard.writeText'
  },
  {
    file: 'src/app/dashboard/mijn-profiel/page.tsx',
    find: /typeof navigator !== 'undefined' \? navigator\.clipboard : null\.writeText/g,
    replace: 'navigator.clipboard.writeText'
  },
  {
    file: 'src/app/dashboard-marketing/api-advertentie-maken/page.tsx',
    find: /typeof navigator !== 'undefined' \? navigator\.clipboard : null\.writeText/g,
    replace: 'navigator.clipboard.writeText'
  }
];

console.log('🔧 Applying final navigator fixes...');

fixes.forEach(({ file, find, replace }) => {
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

console.log('🎉 Final navigator fixes completed!');
