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
        const supabaseAdmin = getSupabaseAdminClient();
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(userId);
        if (userError || !userData.user) {
          console.log('❌ User not found by email:', userId);
          return NextResponse.json({ 
            success: false, 
            error: 'User not found' 
          }, { status: 404 });
        }
        actualUserId = userData.user.id;
        console.log('✅ Converted email to UUID for schema selection:', actualUserId);
      } catch (error) {
        console.log('❌ Error converting email to UUID for schema selection:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid user ID' 
        }, { status: 400 });
      }
    }
    
    // First, deactivate any existing active schema for this user
    await supabase
      .from('user_training_schemas')
      .update({ is_active: false })
      .eq('user_id', actualUserId);
    
    // Then, activate the new schema
    const { data, error } = await supabase
      .from('user_training_schemas')
      .upsert({
        user_id: actualUserId,
        schema_id: schemaId,
        is_active: true,
        selected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error selecting training schema:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ Training schema selected:', data);
    
    return NextResponse.json({
      success: true,
      selection: data
    });
    
  } catch (error) {
    console.error('❌ Error in training-schema-selection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
