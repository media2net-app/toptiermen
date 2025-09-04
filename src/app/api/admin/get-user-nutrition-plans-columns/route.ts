import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Getting user_nutrition_plans table columns...');

    // Try to get existing records to see the structure
    const { data, error } = await supabaseAdmin
      .from('user_nutrition_plans')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error getting table data:', error);
      return NextResponse.json({
        success: false,
        error: `Failed to get table data: ${error.message}`
      }, { status: 500 });
    }

    console.log('✅ Table data retrieved:', data);

    // If we have data, show the structure
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Available columns:', columns);

      return NextResponse.json({
        success: true,
        message: 'Table structure retrieved',
        columns: columns,
        sampleData: data[0]
      });
    } else {
      // No data, try to create a test record to see what columns are required
      console.log('📋 No existing data, trying to create test record...');
      
      const testRecord = {
        user_id: 'test-user-id',
        plan_id: 'test-plan-id'
      };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('user_nutrition_plans')
        .insert(testRecord)
        .select();

      if (insertError) {
        console.error('❌ Test insert failed:', insertError);
        return NextResponse.json({
          success: false,
          error: `Test insert failed: ${insertError.message}`,
          message: 'Cannot determine table structure'
        }, { status: 500 });
      } else {
        console.log('✅ Test record created successfully');
        
        const columns = Object.keys(insertData[0]);
        
        // Clean up test record
        await supabaseAdmin
          .from('user_nutrition_plans')
          .delete()
          .eq('user_id', 'test-user-id')
          .eq('plan_id', 'test-plan-id');

        return NextResponse.json({
          success: true,
          message: 'Table structure determined from test insert',
          columns: columns,
          sampleData: insertData[0]
        });
      }
    }

  } catch (error) {
    console.error('❌ Error in get-user-nutrition-plans-columns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
