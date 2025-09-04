import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Adding customized_data column to user_nutrition_plans table...');

    // Try to add the column using a direct SQL query
    const { data, error } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: 'ALTER TABLE user_nutrition_plans ADD COLUMN IF NOT EXISTS customized_data JSONB;'
      });

    if (error) {
      console.error('❌ Error adding column via exec_sql:', error);
      
      // Try alternative approach - check if we can use a different method
      console.log('🔄 Trying alternative approach...');
      
      // Try to insert a test record to see what columns exist
      const { data: testInsert, error: testError } = await supabaseAdmin
        .from('user_nutrition_plans')
        .insert({
          user_id: 'test-user-id',
          plan_id: 'test-plan-id',
          customized_data: { test: 'data' }
        })
        .select();

      if (testError) {
        console.log('❌ Test insert failed:', testError.message);
        
        // If the error mentions customized_data, the column doesn't exist
        if (testError.message.includes('customized_data')) {
          return NextResponse.json({
            success: false,
            error: 'Column customized_data does not exist and cannot be added programmatically',
            message: 'Please run this SQL in your Supabase SQL editor:',
            sql: 'ALTER TABLE user_nutrition_plans ADD COLUMN IF NOT EXISTS customized_data JSONB;'
          }, { status: 400 });
        }
      } else {
        // If test insert succeeded, the column exists
        console.log('✅ Column customized_data already exists');
        
        // Clean up test record
        await supabaseAdmin
          .from('user_nutrition_plans')
          .delete()
          .eq('user_id', 'test-user-id')
          .eq('plan_id', 'test-plan-id');
      }
    } else {
      console.log('✅ Column customized_data added successfully');
    }

    // Also ensure is_active column exists
    const { error: isActiveError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: 'ALTER TABLE user_nutrition_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;'
      });

    if (isActiveError) {
      console.log('ℹ️ is_active column might already exist:', isActiveError.message);
    } else {
      console.log('✅ is_active column ensured');
    }

    // Test the final table structure
    const { data: testData, error: testError } = await supabaseAdmin
      .from('user_nutrition_plans')
      .select('user_id, plan_id, customized_data, is_active')
      .limit(1);

    if (testError) {
      console.error('❌ Final test failed:', testError);
      return NextResponse.json({
        success: false,
        error: `Final test failed: ${testError.message}`,
        message: 'The table structure is still not correct. Please check the database schema.'
      }, { status: 500 });
    }

    console.log('✅ Final test passed - table structure is correct');

    return NextResponse.json({
      success: true,
      message: 'user_nutrition_plans table structure is now correct',
      columns: ['user_id', 'plan_id', 'customized_data', 'is_active']
    });

  } catch (error) {
    console.error('❌ Error in add-customized-data-column API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
