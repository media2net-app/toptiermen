import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🧪 Testing workout sessions API...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Database error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Database connection successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      data: data 
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🧪 Test POST with body:', body);

    // Test insert
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: body.userId || '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
        schema_id: body.schemaId || '550e8400-e29b-41d4-a716-446655440000',
        day_number: body.dayNumber || 1,
        mode: body.mode || 'interactive'
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Insert successful:', data);
    return NextResponse.json({ 
      success: true, 
      session: data 
    });

  } catch (error) {
    console.error('❌ Test POST error:', error);
    return NextResponse.json({ error: 'Test POST failed' }, { status: 500 });
  }
} 