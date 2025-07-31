import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const bookId = searchParams.get('bookId');
    const status = searchParams.get('status') || '';
    const rating = searchParams.get('rating');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('book_reviews')
      .select(`
        id,
        book_id,
        user_id,
        rating,
        text,
        status,
        created_at,
        updated_at,
        books(
          id,
          title,
          author,
          cover_url
        ),
        users(
          id,
          full_name,
          username,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (bookId) {
      query = query.eq('book_id', bookId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('book_reviews')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: reviews, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching book reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch book reviews' },
        { status: 500 }
      );
    }

    // Format reviews data
    const formattedReviews = reviews?.map(review => ({
      id: review.id,
      book_id: review.book_id,
      user_id: review.user_id,
      rating: review.rating,
      text: review.text,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at,
      book: review.books ? {
        id: review.books.id,
        title: review.books.title,
        author: review.books.author,
        cover_url: review.books.cover_url
      } : null,
      user: review.users ? {
        id: review.users.id,
        full_name: review.users.full_name || 'Onbekend',
        username: review.users.username || `@${review.users.email?.split('@')[0]}`,
        email: review.users.email
      } : null
    })) || [];

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in book reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, reviewId, data } = body;

    switch (action) {
      case 'approve_review':
        return await approveReview(reviewId);
      
      case 'reject_review':
        return await rejectReview(reviewId, data.reason);
      
      case 'update_review':
        return await updateReview(reviewId, data);
      
      case 'delete_review':
        return await deleteReview(reviewId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in book reviews API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function approveReview(reviewId: string) {
  try {
    // Update review status
    const { error: reviewError } = await supabaseAdmin
      .from('book_reviews')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (reviewError) {
      console.error('Error approving review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to approve review' },
        { status: 500 }
      );
    }

    // Update book average rating
    await updateBookRating(reviewId);

    return NextResponse.json({
      success: true,
      message: 'Review approved successfully'
    });

  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function rejectReview(reviewId: string, reason?: string) {
  try {
    const { error } = await supabaseAdmin
      .from('book_reviews')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Error rejecting review:', error);
      return NextResponse.json(
        { error: 'Failed to reject review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateReview(reviewId: string, data: any) {
  try {
    const { error } = await supabaseAdmin
      .from('book_reviews')
      .update({
        rating: data.rating,
        text: data.text,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    // Update book average rating
    await updateBookRating(reviewId);

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteReview(reviewId: string) {
  try {
    // Get review info before deletion
    const { data: review } = await supabaseAdmin
      .from('book_reviews')
      .select('book_id')
      .eq('id', reviewId)
      .single();

    // Delete the review
    const { error } = await supabaseAdmin
      .from('book_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    // Update book average rating if review was approved
    if (review?.book_id) {
      await updateBookRatingByBookId(review.book_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateBookRating(reviewId: string) {
  try {
    // Get the book_id for this review
    const { data: review } = await supabaseAdmin
      .from('book_reviews')
      .select('book_id')
      .eq('id', reviewId)
      .single();

    if (review?.book_id) {
      await updateBookRatingByBookId(review.book_id);
    }
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
}

async function updateBookRatingByBookId(bookId: string) {
  try {
    // Calculate new average rating and review count
    const { data: stats } = await supabaseAdmin
      .from('book_reviews')
      .select('rating')
      .eq('book_id', bookId)
      .eq('status', 'approved');

    if (stats && stats.length > 0) {
      const totalRating = stats.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / stats.length;
      const reviewCount = stats.length;

      // Update book with new stats
      await supabaseAdmin
        .from('books')
        .update({
          average_rating: Math.round(averageRating * 100) / 100,
          review_count: reviewCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookId);
    }
  } catch (error) {
    console.error('Error updating book rating by book ID:', error);
  }
} 