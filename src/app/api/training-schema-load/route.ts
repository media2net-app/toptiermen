import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const schemaId = searchParams.get('schemaId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required.' 
      }, { status: 400 });
    }

    let query = supabase
      .from('custom_training_schemas')
      .select('*')
      .eq('user_id', userId);

    // If schemaId is provided, get specific schema
    if (schemaId) {
      query = query.eq('base_schema_id', schemaId);
    } else {
      // Otherwise get active schema
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading custom training schema:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to load custom training schema.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data || null,
      message: data ? 'Custom training schema loaded successfully!' : 'No custom schema found.' 
    });

  } catch (error: any) {
    console.error('Error in training-schema-load:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
