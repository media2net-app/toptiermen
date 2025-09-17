import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, schemaId } = body;

    if (!userId || !schemaId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and Schema ID are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🎯 Selecting training schema:', { userId, schemaId });
    
    // Check if userId is an email and convert to UUID if needed
    let actualUserId = userId;
    if (userId.includes('@')) {
      try {
        // Use the existing get-user-uuid API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/get-user-uuid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userId })
        });
        
        if (response.ok) {
          const { uuid } = await response.json();
          actualUserId = uuid;
          console.log('✅ Converted email to UUID for schema selection:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID');
          return NextResponse.json({ 
            success: false, 
            error: 'User not found' 
          }, { status: 404 });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID for schema selection:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid user ID' 
        }, { status: 400 });
      }
    }
    
    // Store schema selection in profiles table
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ selected_schema_id: schemaId })
      .eq('id', actualUserId)
      .select();

    if (updateError) {
      console.error('❌ Error updating profile with schema selection:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save schema selection' 
      }, { status: 500 });
    }

    console.log('✅ Training schema selected and saved:', { userId: actualUserId, schemaId });
    
    return NextResponse.json({
      success: true,
      message: 'Training schema selection saved successfully',
      data: updateData
    });
    
  } catch (error) {
    console.error('❌ Error in training-schema-selection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
