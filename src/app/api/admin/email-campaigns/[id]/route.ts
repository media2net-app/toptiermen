import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, subject, status, template_type } = body;

    console.log('📧 Updating email campaign:', id, body);

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (status !== undefined) updateData.status = status;
    if (template_type !== undefined) updateData.template_type = template_type;
    updateData.updated_at = new Date().toISOString();

    const { data: campaign, error: updateError } = await supabaseAdmin
      .from('email_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating email campaign:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update email campaign' 
      }, { status: 500 });
    }

    console.log('✅ Updated email campaign:', id);

    return NextResponse.json({ 
      success: true, 
      campaign 
    });

  } catch (error) {
    console.error('❌ Error in email campaign PATCH:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('📧 Deleting email campaign:', id);

    const { error: deleteError } = await supabaseAdmin
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting email campaign:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete email campaign' 
      }, { status: 500 });
    }

    console.log('✅ Deleted email campaign:', id);

    return NextResponse.json({ 
      success: true,
      message: 'Email campaign deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in email campaign DELETE:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
