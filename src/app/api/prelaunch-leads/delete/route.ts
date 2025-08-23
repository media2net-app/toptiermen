import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!leadId && !email) {
      return NextResponse.json(
        { success: false, error: 'Lead ID or email is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('prelaunch_leads')
      .delete();

    if (leadId) {
      query = query.eq('id', leadId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error deleting lead:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    console.log('✅ Lead deleted successfully:', { leadId, email, data });

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
      deletedLead: data
    });

  } catch (error) {
    console.error('❌ Error in delete lead API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
