import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    
    // First, deactivate any existing active schema for this user
    await supabase
      .from('user_training_schemas')
      .update({ is_active: false })
      .eq('user_id', userId);
    
    // Then, activate the new schema
    const { data, error } = await supabase
      .from('user_training_schemas')
      .upsert({
        user_id: userId,
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
