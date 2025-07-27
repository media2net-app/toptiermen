import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching book statistics from database...');

    // Fetch books count
    const { count: totalBooks, error: booksError } = await supabaseAdmin
      .from('books')
      .select('*', { count: 'exact', head: true });

    if (booksError) {
      console.error('Error fetching books count:', booksError);
      return NextResponse.json({ 
        error: 'Failed to fetch book statistics',
        details: booksError 
      }, { status: 500 });
    }

    // Fetch published books count
    const { count: publishedBooks, error: publishedError } = await supabaseAdmin
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Fetch draft books count
    const { count: draftBooks, error: draftError } = await supabaseAdmin
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    // Fetch categories count
    const { count: totalCategories, error: categoriesError } = await supabaseAdmin
      .from('book_categories')
      .select('*', { count: 'exact', head: true });

    // Calculate average rating from books
    const { data: booksWithRatings, error: ratingsError } = await supabaseAdmin
      .from('books')
      .select('average_rating')
      .not('average_rating', 'is', null);

    const averageRating = booksWithRatings && booksWithRatings.length > 0 
      ? booksWithRatings.reduce((sum, book) => sum + (book.average_rating || 0), 0) / booksWithRatings.length 
      : 0;

    // Calculate total reviews
    const { data: booksWithReviews, error: reviewsError } = await supabaseAdmin
      .from('books')
      .select('review_count');

    const totalReviews = booksWithReviews && booksWithReviews.length > 0
      ? booksWithReviews.reduce((sum, book) => sum + (book.review_count || 0), 0)
      : 0;

    // For now, set pending reviews to 0 (we'll add book_reviews table later)
    const pendingReviews = 0;

    const bookStats = {
      totalBooks: totalBooks || 0,
      publishedBooks: publishedBooks || 0,
      draftBooks: draftBooks || 0,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: totalReviews,
      pendingReviews: pendingReviews,
      totalCategories: totalCategories || 0
    };

    console.log('✅ Book statistics calculated from database:', bookStats);

    return NextResponse.json({ 
      success: true, 
      bookStats 
    });

  } catch (error) {
    console.error('Error fetching book statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch book statistics' 
    }, { status: 500 });
  }
} 