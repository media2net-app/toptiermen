const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'create_xp_transactions_table.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Setting up XP Transactions Table...');
console.log('');
console.log('📋 SQL Content to execute:');
console.log('=====================================');
console.log(sqlContent);
console.log('=====================================');
console.log('');
console.log('📝 Instructions:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Open the SQL Editor');
console.log('3. Copy and paste the SQL content above');
console.log('4. Click "Run" to execute');
console.log('5. The xp_transactions table will be created!');
console.log('');
console.log('✅ After running the SQL:');
console.log('🎯 XP from missions will appear in the XP history');
console.log('📊 Badges & Rangen page will show all XP transactions');
console.log('🔗 Missions will be properly tracked in the database');
console.log('');
console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
console.log('📁 Project: Your TopTiermen project');
console.log('🔧 SQL Editor: Database > SQL Editor'); 