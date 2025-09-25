import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST - Record modal view or close
export async function POST(request: NextRequest) {
  try {
    console.log('📋 Recording week completion modal view...');
    
    const body = await request.json();
    const { userId, schemaId, weekNumber, action } = body;

    console.log('📋 Modal view data:', { 
      userId, 
      schemaId, 
      weekNumber, 
      action 
    });

    if (!userId || !schemaId || !weekNumber || !action) {
      console.error('❌ Missing required fields:', { 
        userId: !!userId, 
        schemaId: !!schemaId, 
        weekNumber: !!weekNumber, 
        action: !!action 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['shown', 'closed'].includes(action)) {
      console.error('❌ Invalid action:', action);
      return NextResponse.json({ error: 'Invalid action. Must be "shown" or "closed"' }, { status: 400 });
    }

    // Check if modal view record already exists
    const { data: existingView, error: checkError } = await supabaseAdmin
      .from('user_week_completion_modal_views')
      .select('id, modal_shown_at, modal_closed_at')
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .eq('week_number', weekNumber)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing modal view:', checkError);
      return NextResponse.json({ error: 'Failed to check existing modal view' }, { status: 500 });
    }

    if (existingView) {
      console.log('📋 Modal view record exists, updating...');
      
      // Update existing record
      const updateData: any = {};
      
      if (action === 'shown' && !existingView.modal_shown_at) {
        updateData.modal_shown_at = new Date().toISOString();
      } else if (action === 'closed' && !existingView.modal_closed_at) {
        updateData.modal_closed_at = new Date().toISOString();
      }
      
      if (Object.keys(updateData).length === 0) {
        console.log('📋 No update needed for modal view record');
        return NextResponse.json({ success: true, data: existingView, isUpdate: false });
      }
      
      const { data, error } = await supabaseAdmin
        .from('user_week_completion_modal_views')
        .update(updateData)
        .eq('id', existingView.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating modal view:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('✅ Modal view updated successfully:', data.id);
      return NextResponse.json({ success: true, data, isUpdate: true });
    } else {
      console.log('📋 Creating new modal view record...');
      
      // Create new record
      const insertData: any = {
        user_id: userId,
        schema_id: schemaId,
        week_number: weekNumber
      };
      
      if (action === 'shown') {
        insertData.modal_shown_at = new Date().toISOString();
      } else if (action === 'closed') {
        insertData.modal_shown_at = new Date().toISOString();
        insertData.modal_closed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabaseAdmin
        .from('user_week_completion_modal_views')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating modal view:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('✅ Modal view created successfully:', data.id);
      return NextResponse.json({ success: true, data, isUpdate: false });
    }

  } catch (error) {
    console.error('❌ Unexpected error recording modal view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check if modal should be shown
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const schemaId = searchParams.get('schemaId');
    const weekNumber = searchParams.get('weekNumber');

    if (!userId || !schemaId || !weekNumber) {
      return NextResponse.json({ error: 'Missing userId, schemaId, or weekNumber' }, { status: 400 });
    }

    console.log('📋 Checking modal view status for:', { userId, schemaId, weekNumber });

    const { data, error } = await supabaseAdmin
      .from('user_week_completion_modal_views')
      .select('*')
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .eq('week_number', weekNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking modal view:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no record exists, modal can be shown
    if (!data) {
      console.log('✅ No modal view record found, modal can be shown');
      return NextResponse.json({ success: true, canShow: true, data: null });
    }

    // If record exists and modal was closed, don't show again
    if (data.modal_closed_at) {
      console.log('❌ Modal was already closed, should not be shown');
      return NextResponse.json({ success: true, canShow: false, data });
    }

    // If record exists but modal wasn't closed, can show again (in case of page refresh)
    console.log('✅ Modal view record exists but not closed, can be shown');
    return NextResponse.json({ success: true, canShow: true, data });

  } catch (error) {
    console.error('❌ Unexpected error checking modal view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
