import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching book reviews from database...');

    // Fetch reviews from database
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('book_reviews')
      .select(`
        *,
        books(title),
        profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching book reviews:', reviewsError);
      return NextResponse.json({ error: 'Failed to fetch book reviews' }, { status: 500 });
    }

    // Transform database data to match expected format
    const transformedReviews = reviews?.map(review => ({
      id: review.id.toString(),
      bookId: review.book_id.toString(),
      bookTitle: review.books?.title || 'Unknown Book',
      userId: review.user_id.toString(),
      userName: review.profiles?.full_name || 'Anonymous',
      rating: review.rating || 0,
      text: review.text || '',
      status: review.status || 'pending',
      submittedAt: review.created_at
    })) || [];

    console.log(`📊 Found ${transformedReviews.length} book reviews`);

    return NextResponse.json({ 
      success: true, 
      reviews: transformedReviews
    });

  } catch (error) {
    console.error('Error fetching book reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch book reviews' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new book review:', body);

    const { data: review, error } = await supabaseAdmin
      .from('book_reviews')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating book review:', error);
      return NextResponse.json({ error: 'Failed to create book review' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      review 
    });

  } catch (error) {
    console.error('Error creating book review:', error);
    return NextResponse.json({ 
      error: 'Failed to create book review' 
    }, { status: 500 });
  }
} 