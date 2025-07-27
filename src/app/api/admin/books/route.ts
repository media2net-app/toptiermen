import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching books from database...');

    // Fetch books from database
    const { data: books, error: booksError } = await supabaseAdmin
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (booksError) {
      console.error('Error fetching books:', booksError);
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
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

    console.log(`📊 Found ${transformedBooks.length} books`);

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

    const { data: book, error } = await supabaseAdmin
      .from('books')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating book:', error);
      return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
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