import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    console.log('📚 Rejecting book review:', reviewId);

    const { data: review, error } = await supabaseAdmin
      .from('book_reviews')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting book review:', error);
      return NextResponse.json({ error: 'Failed to reject book review' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      review 
    });

  } catch (error) {
    console.error('Error rejecting book review:', error);
    return NextResponse.json({ 
      error: 'Failed to reject book review' 
    }, { status: 500 });
  }
} 