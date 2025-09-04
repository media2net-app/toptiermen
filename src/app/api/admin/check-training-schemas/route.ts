import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if training_schemas table exists and has data
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .limit(10);

    if (schemasError) {
      return NextResponse.json({
        success: false,
        error: schemasError.message,
        tableExists: false
      });
    }

    // Check if training_profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('training_profiles')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      trainingSchemas: {
        count: schemas?.length || 0,
        data: schemas || [],
        error: schemasError?.message
      },
      trainingProfiles: {
        count: profiles?.length || 0,
        data: profiles || [],
        error: profilesError?.message
      }
    });

  } catch (error) {
    console.error('Error checking training schemas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
