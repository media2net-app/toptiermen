import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    console.log(`📝 Updating post ${id} with action: ${action}`);

    let updateData: any = {};

    switch (action) {
      case 'hide':
        updateData = { is_hidden: true, status: 'hidden' };
        break;
      case 'unhide':
        updateData = { is_hidden: false, status: 'active' };
        break;
      case 'pin':
        updateData = { is_pinned: true };
        break;
      case 'unpin':
        updateData = { is_pinned: false };
        break;
      case 'remove':
        updateData = { status: 'removed' };
        break;
      case 'restore':
        updateData = { status: 'active' };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: post, error } = await supabaseAdmin
      .from('social_feed_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating post:', error);
      return NextResponse.json({ error: `Failed to update post: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Post updated successfully:', post.id);
    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error('❌ Error in post update API:', error);
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
    console.log(`🗑️ Deleting post ${id}`);

    const { error } = await supabaseAdmin
      .from('social_feed_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting post:', error);
      return NextResponse.json({ error: `Failed to delete post: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Post deleted successfully:', id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error in post delete API:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 