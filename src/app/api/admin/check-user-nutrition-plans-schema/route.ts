import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking user_nutrition_plans table schema...');

    // Try to get the table structure by attempting to select all columns
    const { data, error } = await supabaseAdmin
      .from('user_nutrition_plans')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error checking table:', error);
      return NextResponse.json({
        success: false,
        error: `Table check failed: ${error.message}`
      }, { status: 500 });
    }

    // Try to insert a test record to see what columns are available
    const testRecord = {
      user_id: 'test-user-id',
      plan_id: 'test-plan-id'
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_nutrition_plans')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      
      // Try with different column names
      const alternativeColumns = [
        'customized_plan',
        'plan_data',
        'user_data',
        'custom_data',
        'data'
      ];

      const availableColumns: string[] = [];
      
      for (const col of alternativeColumns) {
        const testRecordWithCol = {
          user_id: 'test-user-id',
          plan_id: 'test-plan-id',
          [col]: { test: 'data' }
        };

        const { error: colError } = await supabaseAdmin
          .from('user_nutrition_plans')
          .insert(testRecordWithCol)
          .select();

        if (!colError) {
          availableColumns.push(col);
          console.log(`✅ Column ${col} is available`);
          
          // Clean up test record
          await supabaseAdmin
            .from('user_nutrition_plans')
            .delete()
            .eq('user_id', 'test-user-id')
            .eq('plan_id', 'test-plan-id');
        } else {
          console.log(`❌ Column ${col} is not available:`, colError.message);
        }
      }

      return NextResponse.json({
        success: false,
        error: 'customized_data column does not exist',
        availableColumns: availableColumns,
        message: 'Please add the customized_data column manually or use one of the available columns'
      }, { status: 400 });
    } else {
      console.log('✅ Basic insert test passed');
      
      // Clean up test record
      await supabaseAdmin
        .from('user_nutrition_plans')
        .delete()
        .eq('user_id', 'test-user-id')
        .eq('plan_id', 'test-plan-id');

      return NextResponse.json({
        success: true,
        message: 'Table structure check completed',
        data: insertData
      });
    }

  } catch (error) {
    console.error('❌ Error in check-user-nutrition-plans-schema API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
