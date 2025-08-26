const fs = require('fs');
const path = require('path');

console.log('🔍 V2.0: Testing Login Functionality...\n');

// Check if environment variables are loaded
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Supabase environment variables found');
  } else {
    console.log('❌ Missing Supabase environment variables');
  }
} else {
  console.log('❌ .env.local file not found');
}

// Check if login page exists and has proper structure
const loginPagePath = path.join(process.cwd(), 'src/app/login/page.tsx');
if (fs.existsSync(loginPagePath)) {
  console.log('✅ Login page exists');
  
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');
  const hasSignIn = loginContent.includes('signIn');
  const hasForm = loginContent.includes('form');
  const hasEmail = loginContent.includes('email');
  const hasPassword = loginContent.includes('password');
  
  if (hasSignIn && hasForm && hasEmail && hasPassword) {
    console.log('✅ Login page has proper structure');
  } else {
    console.log('❌ Login page missing required elements');
  }
} else {
  console.log('❌ Login page not found');
}

// Check if SupabaseAuthContext exists
const authContextPath = path.join(process.cwd(), 'src/contexts/SupabaseAuthContext.tsx');
if (fs.existsSync(authContextPath)) {
  console.log('✅ SupabaseAuthContext exists');
  
  const authContent = fs.readFileSync(authContextPath, 'utf8');
  const hasSignInFunction = authContent.includes('signIn');
  const hasSupabaseClient = authContent.includes('createClient');
  
  if (hasSignInFunction && hasSupabaseClient) {
    console.log('✅ Auth context has proper structure');
  } else {
    console.log('❌ Auth context missing required functions');
  }
} else {
  console.log('❌ SupabaseAuthContext not found');
}

// Check if globals.css exists
const cssPath = path.join(process.cwd(), 'src/app/globals.css');
if (fs.existsSync(cssPath)) {
  console.log('✅ globals.css exists');
  
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const hasTailwind = cssContent.includes('@tailwind');
  const hasCustomVars = cssContent.includes('--background');
  
  if (hasTailwind && hasCustomVars) {
    console.log('✅ CSS has proper structure');
  } else {
    console.log('❌ CSS missing required styles');
  }
} else {
  console.log('❌ globals.css not found');
}

console.log('\n📊 Login Test Summary:');
console.log('1. Check if localhost:3000 is accessible');
console.log('2. Check if login page loads without errors');
console.log('3. Check if CSS styles are applied');
console.log('4. Check if form submission works');
console.log('5. Check browser console for errors');
