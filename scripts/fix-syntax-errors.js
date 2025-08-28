const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/voedingsplannen/page.tsx');

console.log('🔧 Fixing syntax errors in voedingsplannen page...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix missing commas after createMealWithMacros calls
  // Pattern: 'dinner'\n            )\n          ]\n        },
  // Should be: 'dinner'\n            ),\n          ]\n        },
  
  // Replace all instances where a createMealWithMacros call ends without a comma
  content = content.replace(
    /'dinner'\s*\n\s*\)\s*\n\s*\]\s*\n\s*\},/g,
    "'dinner'\n            ),\n          ]\n        },"
  );
  
  content = content.replace(
    /'lunch'\s*\n\s*\)\s*\n\s*\]\s*\n\s*\},/g,
    "'lunch'\n            ),\n          ]\n        },"
  );
  
  content = content.replace(
    /'breakfast'\s*\n\s*\)\s*\n\s*\]\s*\n\s*\},/g,
    "'breakfast'\n            ),\n          ]\n        },"
  );
  
  // Also fix any other missing commas in the meals array
  content = content.replace(
    /\)\s*\n\s*\]\s*\n\s*\},/g,
    "),\n          ]\n        },"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Syntax errors fixed!');
  console.log('📝 File updated:', filePath);
  
} catch (error) {
  console.error('❌ Error fixing syntax:', error.message);
}
