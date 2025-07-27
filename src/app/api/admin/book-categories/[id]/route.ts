import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const body = await request.json();
    
    console.log('📚 Updating book category:', categoryId, body);

    const { data: category, error } = await supabaseAdmin
      .from('book_categories')
      .update({
        name: body.name,
        description: body.description,
        color: body.color,
        icon: body.icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating book category:', error);
      return NextResponse.json({ error: 'Failed to update book category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      category 
    });

  } catch (error) {
    console.error('Error updating book category:', error);
    return NextResponse.json({ 
      error: 'Failed to update book category' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    
    console.log('📚 Deleting book category:', categoryId);

    const { error } = await supabaseAdmin
      .from('book_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting book category:', error);
      return NextResponse.json({ error: 'Failed to delete book category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Book category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book category:', error);
    return NextResponse.json({ 
      error: 'Failed to delete book category' 
    }, { status: 500 });
  }
} 