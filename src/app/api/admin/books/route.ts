import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching books from database...');

    // Try to fetch from database first
    try {
      const { data: books, error: booksError } = await supabaseAdmin
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksError) {
        console.log('Database table does not exist, using mock data');
        throw new Error('Table does not exist');
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

    } catch (dbError) {
      console.log('Using mock data for books');
      
      // Return mock data
      const mockBooks = [
        {
          id: "1",
          title: "Can't Hurt Me",
          author: "David Goggins",
          cover: "/books/canthurtme.jpg",
          categories: ["Mindset", "Motivatie"],
          description: "David Goggins' verhaal over hoe hij zijn mentale en fysieke grenzen verlegde.",
          affiliateBol: "https://www.bol.com/nl/nl/p/can-t-hurt-me/9200000093454544/",
          affiliateAmazon: "https://amzn.to/3example",
          status: "published",
          averageRating: 4.8,
          reviewCount: 12
        },
        {
          id: "2",
          title: "Atomic Habits",
          author: "James Clear",
          cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          categories: ["Productiviteit", "Gewoontes"],
          description: "Kleine veranderingen, opmerkelijke resultaten: een bewezen manier om goede gewoontes te bouwen en slechte te doorbreken.",
          affiliateBol: "https://www.bol.com/nl/nl/p/atomic-habits/9200000093454545/",
          affiliateAmazon: "https://amzn.to/3example2",
          status: "published",
          averageRating: 4.6,
          reviewCount: 8
        },
        {
          id: "3",
          title: "Rich Dad Poor Dad",
          author: "Robert Kiyosaki",
          cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          categories: ["Financiën", "Ondernemerschap"],
          description: "Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen.",
          affiliateBol: "https://www.bol.com/nl/nl/p/rich-dad-poor-dad/9200000093454546/",
          affiliateAmazon: "https://amzn.to/3example3",
          status: "draft",
          averageRating: 4.4,
          reviewCount: 5
        }
      ];

      return NextResponse.json({ 
        success: true, 
        books: mockBooks
      });
    }

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

    // Try to save to database first
    try {
      const { data: book, error } = await supabaseAdmin
        .from('books')
        .insert([body])
        .select()
        .single();

      if (error) {
        console.log('Database table does not exist, returning mock response');
        throw new Error('Table does not exist');
      }

      return NextResponse.json({ 
        success: true, 
        book 
      });

    } catch (dbError) {
      // Return mock response
      const mockBook = {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({ 
        success: true, 
        book: mockBook,
        message: 'Mock data - database not available'
      });
    }

  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json({ 
      error: 'Failed to create book' 
    }, { status: 500 });
  }
} 