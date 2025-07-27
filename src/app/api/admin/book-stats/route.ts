import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching book statistics...');

    // Fetch all required data in parallel
    const [
      { data: books, error: booksError },
      { data: categories, error: categoriesError },
      { data: reviews, error: reviewsError }
    ] = await Promise.all([
      supabaseAdmin.from('books').select('*'),
      supabaseAdmin.from('book_categories').select('*'),
      supabaseAdmin.from('book_reviews').select('*')
    ]);

    if (booksError) console.error('Error fetching books:', booksError);
    if (categoriesError) console.error('Error fetching categories:', categoriesError);
    if (reviewsError) console.error('Error fetching reviews:', reviewsError);

    // Calculate book statistics
    const totalBooks = books?.length || 0;
    const publishedBooks = books?.filter(b => b.status === 'published').length || 0;
    const draftBooks = books?.filter(b => b.status === 'draft').length || 0;
    
    // Calculate average rating
    const totalRating = books?.reduce((sum, book) => sum + (book.average_rating || 0), 0) || 0;
    const averageRating = totalBooks > 0 ? Math.round((totalRating / totalBooks) * 10) / 10 : 0;
    
    // Calculate review statistics
    const totalReviews = reviews?.length || 0;
    const pendingReviews = reviews?.filter(r => r.status === 'pending').length || 0;
    const totalCategories = categories?.length || 0;

    const bookStats = {
      totalBooks,
      publishedBooks,
      draftBooks,
      averageRating,
      totalReviews,
      pendingReviews,
      totalCategories
    };

    console.log('📊 Book stats calculated:', {
      totalBooks,
      publishedBooks,
      averageRating,
      totalReviews,
      pendingReviews
    });

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