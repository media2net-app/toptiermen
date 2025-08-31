const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
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

// Function to fix navigator references
function fixNavigatorReferences(content) {
  let fixed = content;
  
  // Fix direct navigator references
  const navigatorPatterns = [
    // navigator.userAgent
    {
      pattern: /navigator\.userAgent/g,
      replacement: 'typeof navigator !== \'undefined\' ? navigator.userAgent : \'Unknown\''
    },
    // navigator.onLine
    {
      pattern: /navigator\.onLine/g,
      replacement: 'typeof navigator !== \'undefined\' ? navigator.onLine : true'
    },
    // navigator.standalone
    {
      pattern: /\(window\.navigator as any\)\.standalone/g,
      replacement: 'typeof navigator !== \'undefined\' ? (navigator as any).standalone : false'
    },
    // navigator.clipboard
    {
      pattern: /navigator\.clipboard/g,
      replacement: 'typeof navigator !== \'undefined\' ? navigator.clipboard : null'
    },
    // 'serviceWorker' in navigator
    {
      pattern: /'serviceWorker' in navigator/g,
      replacement: 'typeof navigator !== \'undefined\' && \'serviceWorker\' in navigator'
    },
    // navigator.serviceWorker
    {
      pattern: /navigator\.serviceWorker/g,
      replacement: 'typeof navigator !== \'undefined\' ? navigator.serviceWorker : null'
    }
  ];
  
  navigatorPatterns.forEach(({ pattern, replacement }) => {
    fixed = fixed.replace(pattern, replacement);
  });
  
  return fixed;
}

// Main execution
console.log('🔧 Fixing all navigator references...');

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

let fixedCount = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    const fixedContent = fixNavigatorReferences(content);
    
    if (originalContent !== fixedContent) {
      fs.writeFileSync(file, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with navigator references!`);
console.log('🚀 All navigator errors should now be resolved.');
