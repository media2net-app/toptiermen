import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    console.log('🧪 Testing training profile save with data:', body);

    // Test if we can insert a training profile
    const { data, error } = await supabase
      .from('training_profiles')
      .upsert({
        user_id: body.user_id || 'test-user-id',
        training_goal: body.training_goal || 'spiermassa',
        training_frequency: body.training_frequency || 3,
        experience_level: body.experience_level || 'beginner',
        equipment_type: body.equipment_type || 'gym'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error in test training profile save:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    console.log('✅ Test training profile saved successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Training profile saved successfully'
    });

  } catch (error) {
    console.error('Error in test training profile:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Test if we can read from training_profiles table
    const { data, error } = await supabase
      .from('training_profiles')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error reading training profiles:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      data: data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error reading training profiles:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
