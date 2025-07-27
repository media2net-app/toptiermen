import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;
    const body = await request.json();
    
    console.log('📚 Updating book:', bookId, body);

    const { data: book, error } = await supabaseAdmin
      .from('books')
      .update({
        title: body.title,
        author: body.author,
        cover_url: body.cover,
        description: body.description,
        categories: body.categories,
        affiliate_bol: body.affiliateBol,
        affiliate_amazon: body.affiliateAmazon,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId)
      .select()
      .single();

    if (error) {
      console.error('Error updating book:', error);
      return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      book 
    });

  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ 
      error: 'Failed to update book' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id;
    
    console.log('📚 Deleting book:', bookId);

    const { error } = await supabaseAdmin
      .from('books')
      .delete()
      .eq('id', bookId);

    if (error) {
      console.error('Error deleting book:', error);
      return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ 
      error: 'Failed to delete book' 
    }, { status: 500 });
  }
} 