#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need fixing (based on grep search)
const filesToFix = [
  'src/app/api/missions-simple/route.ts',
  'src/app/api/fix-chiel-streak/route.ts',
  'src/app/api/debug-rob-xp/route.ts',
  'src/app/api/dashboard-stats/route.ts',
  'src/app/api/missions-real/route.ts',
  'src/app/api/missions/route.ts',
  'src/app/api/fix-user-streak/route.ts',
  'src/app/api/workout-sessions/route.ts',
  'src/app/api/workout-sessions/test/route.ts',
  'src/app/api/workout-sessions/complete/route.ts',
  'src/app/api/check-tables/route.ts',
  'src/app/api/members-data/route.ts',
  'src/app/api/user-preferences/route.ts',
  'src/app/api/challenges/route.ts',
  'src/app/api/user-training-schema/route.ts',
  'src/app/api/onboarding-data/route.ts'
];

const supabaseClientPattern = /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY!\s*\);/;

const replacementCode = `// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};`;

const functionStartPattern = /export async function (GET|POST|PUT|DELETE)/;

console.log('🔧 Fixing Supabase client initialization in API routes...');

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace the problematic Supabase client initialization
    if (supabaseClientPattern.test(content)) {
      content = content.replace(supabaseClientPattern, replacementCode);
      modified = true;
      console.log(`✅ Fixed Supabase client in: ${filePath}`);
    }

    // Add supabase initialization in each function
    const lines = content.split('\n');
    const newLines = [];
    let inFunction = false;
    let supabaseInitialized = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      newLines.push(line);

      // Check if we're entering a function
      if (functionStartPattern.test(line)) {
        inFunction = true;
        supabaseInitialized = false;
        continue;
      }

      // If we're in a function and haven't initialized supabase yet, add it after the first try block
      if (inFunction && !supabaseInitialized && line.includes('try {')) {
        // Find the next line after try {
        const nextLine = lines[i + 1];
        if (nextLine && !nextLine.includes('const supabase = getSupabaseClient()')) {
          newLines.push('    // Initialize Supabase client');
          newLines.push('    const supabase = getSupabaseClient();');
          newLines.push('');
          supabaseInitialized = true;
        }
      }
    }

    if (modified || content !== newLines.join('\n')) {
      fs.writeFileSync(filePath, newLines.join('\n'));
      console.log(`✅ Updated functions in: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('🎉 Supabase client fixes completed!'); 