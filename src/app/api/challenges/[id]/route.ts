import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// PUT - Update challenge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { progress, current_day, status, streak } = body;

    // Update challenge
    const { data: challenge, error } = await supabase
      .from('challenges')
      .update({
        progress,
        current_day,
        status,
        streak,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating challenge:', error);
      return NextResponse.json({ 
        error: 'Failed to update challenge' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      challenge 
    });

  } catch (error) {
    console.error('Error in challenge PUT:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Delete challenge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete challenge
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting challenge:', error);
      return NextResponse.json({ 
        error: 'Failed to delete challenge' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Challenge deleted successfully' 
    });

  } catch (error) {
    console.error('Error in challenge DELETE:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
