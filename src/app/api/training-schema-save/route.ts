import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { userId, schemaId, customData, customName, customDescription } = await request.json();

    if (!userId || !schemaId || !customData) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID, Schema ID, and custom data are required.' 
      }, { status: 400 });
    }

    // Deactivate all other custom schemas for this user
    await supabase
      .from('custom_training_schemas')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Save or update the custom schema
    const { data, error } = await supabase
      .from('custom_training_schemas')
      .upsert({
        user_id: userId,
        base_schema_id: schemaId,
        custom_name: customName || null,
        custom_description: customDescription || null,
        custom_data: customData,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,base_schema_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving custom training schema:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save custom training schema.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Custom training schema saved successfully!' 
    });

  } catch (error: any) {
    console.error('Error in training-schema-save:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
