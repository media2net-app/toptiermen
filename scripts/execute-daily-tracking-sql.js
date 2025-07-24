const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Daily Mission Tracking...\n');

const sqlContent = `-- =============================================
-- Update Missions Table for Daily Tracking
-- Execute this in Supabase SQL Editor
-- =============================================

-- Add last_completion_date column to user_missions table
ALTER TABLE user_missions 
ADD COLUMN IF NOT EXISTS last_completion_date DATE;

-- Add index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_user_missions_completion_date 
ON user_missions(user_id, last_completion_date);

-- Update existing completed missions to have today's date as completion date
-- (This is for existing data migration)
UPDATE user_missions 
SET last_completion_date = CURRENT_DATE 
WHERE status = 'completed' AND last_completion_date IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN user_missions.last_completion_date IS 
'Date when the mission was last completed (for daily missions, this tracks daily completion)';

-- Success message
SELECT 'Missions table updated for daily tracking! 🎯' as result;`;

console.log('📋 SQL Content to execute:');
console.log('=====================================');
console.log(sqlContent);
console.log('=====================================\n');

console.log('📝 Instructions:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Open the SQL Editor');
console.log('3. Copy and paste the SQL content above');
console.log('4. Click "Run" to execute');
console.log('5. The user_missions table will be updated for daily tracking!\n');

console.log('✅ After running the SQL:');
console.log('🎯 Daily missions will properly track completion dates');
console.log('🔄 Page refresh will maintain completed status for today');
console.log('📅 New day will reset daily missions to "Te Doen"');
console.log('💾 Mission completion will be persistent\n');

console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
console.log('📁 Project: Your TopTiermen project');
console.log('🔧 SQL Editor: Database > SQL Editor'); 