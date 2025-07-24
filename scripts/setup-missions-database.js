const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'create_missions_tables_simple.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Setting up Missions Database...');
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
console.log('5. The missions system will be created!');
console.log('');
console.log('✅ After running the SQL, your missions will be persistent!');
console.log('🎯 The API will automatically use the database instead of dummy data');
console.log('');
console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
console.log('📁 Project: Your TopTiermen project');
console.log('🔧 SQL Editor: Database > SQL Editor'); 