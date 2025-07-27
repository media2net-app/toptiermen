import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching books from database...');

    // Fetch from database
    const { data: books, error: booksError } = await supabaseAdmin
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (booksError) {
      console.error('Error fetching books:', booksError);
      return NextResponse.json({ 
        error: 'Failed to fetch books',
        details: booksError 
      }, { status: 500 });
    }

    // Transform database data to match expected format
    const transformedBooks = books?.map(book => ({
      id: book.id.toString(),
      title: book.title,
      author: book.author,
      cover: book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      categories: book.categories || [],
      description: book.description || '',
      affiliateBol: book.affiliate_bol,
      affiliateAmazon: book.affiliate_amazon,
      status: book.status || 'draft',
      averageRating: book.average_rating || 0,
      reviewCount: book.review_count || 0
    })) || [];

    console.log(`📊 Found ${transformedBooks.length} books from database`);

    return NextResponse.json({ 
      success: true, 
      books: transformedBooks
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch books' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new book:', body);

    // Transform frontend data to database format
    const bookData = {
      title: body.title,
      author: body.author,
      cover_url: body.cover,
      description: body.description,
      categories: body.categories,
      affiliate_bol: body.affiliateBol,
      affiliate_amazon: body.affiliateAmazon,
      status: body.status,
      average_rating: body.averageRating || 0,
      review_count: body.reviewCount || 0
    };

    const { data: book, error } = await supabaseAdmin
      .from('books')
      .insert([bookData])
      .select()
      .single();

    if (error) {
      console.error('Error creating book:', error);
      return NextResponse.json({ 
        error: 'Failed to create book',
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      book 
    });

  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ 
      error: 'Failed to create book' 
    }, { status: 500 });
  }
} 