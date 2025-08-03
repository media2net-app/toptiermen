import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, notes } = body;

    console.log(`📝 Updating report ${id} with action: ${action}`);

    let updateData: any = {};

    switch (action) {
      case 'resolve':
        updateData = { 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        };
        break;
      case 'dismiss':
        updateData = { 
          status: 'dismissed',
          resolved_at: new Date().toISOString()
        };
        break;
      case 'reopen':
        updateData = { 
          status: 'pending',
          resolved_at: null
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (notes) {
      updateData.moderator_notes = notes;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: report, error } = await supabaseAdmin
      .from('social_feed_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating report:', error);
      return NextResponse.json({ error: `Failed to update report: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Report updated successfully:', report.id);
    return NextResponse.json({ success: true, report });

  } catch (error) {
    console.error('❌ Error in report update API:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🗑️ Deleting report ${id}`);

    const { error } = await supabaseAdmin
      .from('social_feed_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting report:', error);
      return NextResponse.json({ error: `Failed to delete report: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Report deleted successfully:', id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error in report delete API:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 