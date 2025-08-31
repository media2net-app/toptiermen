const fs = require('fs');
const path = require('path');

function checkBreadcrumbs(directory, basePath = '') {
  const results = {
    withBreadcrumbs: [],
    withoutBreadcrumbs: [],
    total: 0
  };

  function scanDirectory(dir, currentPath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (item === 'page.tsx' || item.endsWith('.tsx')) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const hasBreadcrumb = fileContent.includes('Breadcrumb') || fileContent.includes('createBreadcrumbs');
        
        const pagePath = path.join(basePath, currentPath, item === 'page.tsx' ? '' : item.replace('.tsx', ''));
        
        if (hasBreadcrumb) {
          results.withBreadcrumbs.push(pagePath);
        } else {
          results.withoutBreadcrumbs.push(pagePath);
        }
        results.total++;
      }
    }
  }
  
  scanDirectory(directory);
  return results;
}

// Check dashboard pages
const dashboardPath = path.join(__dirname, '../src/app/dashboard');
const results = checkBreadcrumbs(dashboardPath, '/dashboard');

console.log('🔍 BREADCRUMBS AUDIT RAPPORT\n');

console.log('✅ PAGINA\'S MET BREADCRUMBS:');
results.withBreadcrumbs.forEach(page => {
  console.log(`   ✓ ${page}`);
});

console.log('\n❌ PAGINA\'S ZONDER BREADCRUMBS:');
results.withoutBreadcrumbs.forEach(page => {
  console.log(`   ✗ ${page}`);
});

console.log(`\n📊 SAMENVATTING:`);
console.log(`   - Totaal pagina's: ${results.total}`);
console.log(`   - Met breadcrumbs: ${results.withBreadcrumbs.length}`);
console.log(`   - Zonder breadcrumbs: ${results.withoutBreadcrumbs.length}`);
console.log(`   - Percentage met breadcrumbs: ${Math.round((results.withBreadcrumbs.length / results.total) * 100)}%`);

// Suggest which pages need breadcrumbs
if (results.withoutBreadcrumbs.length > 0) {
  console.log('\n🎯 PAGINA\'S DIE BREADCRUMBS NODIG HEBBEN:');
  results.withoutBreadcrumbs.forEach(page => {
    console.log(`   - ${page}`);
  });
}
