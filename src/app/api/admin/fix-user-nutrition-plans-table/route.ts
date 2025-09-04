import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing user_nutrition_plans table schema...');

    // First, check if the table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('user_nutrition_plans')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error checking table:', tableError);
      return NextResponse.json({
        success: false,
        error: `Table check failed: ${tableError.message}`
      }, { status: 500 });
    }

    console.log('✅ Table exists, checking for missing columns...');

    // Try to add the missing customized_data column
    const { error: addColumnError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_nutrition_plans 
        ADD COLUMN IF NOT EXISTS customized_data JSONB;
      `
    });

    if (addColumnError) {
      console.error('❌ Error adding customized_data column:', addColumnError);
      
      // Try alternative approach - direct SQL execution
      console.log('🔄 Trying alternative approach...');
      
      const { error: directError } = await supabaseAdmin
        .from('user_nutrition_plans')
        .select('customized_data')
        .limit(1);

      if (directError && directError.message.includes('customized_data')) {
        console.log('📋 Column customized_data is missing, providing SQL to run manually:');
        
        const sqlCommands = `
-- Run this SQL in your Supabase SQL editor to add the missing column:

ALTER TABLE user_nutrition_plans 
ADD COLUMN IF NOT EXISTS customized_data JSONB;

-- Optional: Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_customized_data 
ON user_nutrition_plans USING GIN (customized_data);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_nutrition_plans' 
AND column_name = 'customized_data';
        `;

        return NextResponse.json({
          success: false,
          error: 'Column customized_data is missing',
          sqlCommands: sqlCommands,
          message: 'Please run the provided SQL commands in your Supabase SQL editor'
        }, { status: 400 });
      }
    }

    console.log('✅ customized_data column added successfully');

    // Also ensure other required columns exist
    const { error: isActiveError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_nutrition_plans 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
      `
    });

    if (isActiveError) {
      console.log('ℹ️ is_active column might already exist or there was an issue:', isActiveError.message);
    } else {
      console.log('✅ is_active column ensured');
    }

    // Test the table structure
    const { data: testData, error: testError } = await supabaseAdmin
      .from('user_nutrition_plans')
      .select('user_id, plan_id, customized_data, is_active, created_at, updated_at')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing table structure:', testError);
      return NextResponse.json({
        success: false,
        error: `Table structure test failed: ${testError.message}`
      }, { status: 500 });
    }

    console.log('✅ Table structure test passed');

    return NextResponse.json({
      success: true,
      message: 'user_nutrition_plans table schema fixed successfully',
      columns: ['user_id', 'plan_id', 'customized_data', 'is_active', 'created_at', 'updated_at']
    });

  } catch (error) {
    console.error('❌ Error in fix-user-nutrition-plans-table API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
