const fs = require('fs');
const path = require('path');

// Add dynamic rendering to prevent navigator errors
function addDynamicRendering(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has dynamic export
    if (content.includes('export const dynamic = \'force-dynamic\'')) {
      console.log(`✅ Already has dynamic rendering: ${filePath}`);
      return;
    }
    
    // Add dynamic exports after imports
    const lines = content.split('\n');
    const importEndIndex = lines.findIndex(line => 
      line.trim() === '' && 
      lines[lines.indexOf(line) - 1] && 
      lines[lines.indexOf(line) - 1].includes('import')
    );
    
    if (importEndIndex !== -1) {
      lines.splice(importEndIndex + 1, 0, '', '// Force dynamic rendering to prevent navigator errors', 'export const dynamic = \'force-dynamic\';', 'export const revalidate = 0;', '');
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`✅ Added dynamic rendering to: ${filePath}`);
    } else {
      console.log(`⚠️ Could not find import section in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Find all dashboard page files
function findDashboardPages(dir) {
  const pages = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'page.tsx' || item === 'page.js') {
        // Only process dashboard pages
        if (fullPath.includes('/dashboard/')) {
          pages.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory('./src/app');
  return pages;
}

// Main execution
console.log('🔧 Adding dynamic rendering to dashboard pages...\n');

const dashboardPages = findDashboardPages('./src/app');
console.log(`📁 Found ${dashboardPages.length} dashboard pages`);

for (const page of dashboardPages) {
  addDynamicRendering(page);
}

console.log('\n✅ Dynamic rendering fix completed!');
console.log('💡 This will prevent "navigator is not defined" errors during build.');
