import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Initializing books database with sample data...');

    // 1. Insert default categories
    console.log('Inserting default categories...');
    const categories = [
      { name: 'Mindset', description: 'Mentale groei en persoonlijke ontwikkeling', icon: '🧠' },
      { name: 'Productiviteit', description: 'Time management en focus', icon: '⚡' },
      { name: 'Financiën', description: 'Geld, investeren en business', icon: '💰' },
      { name: 'Fitness', description: 'Training en gezondheid', icon: '💪' },
      { name: 'Leadership', description: 'Leiderschap en communicatie', icon: '🎯' },
      { name: 'Filosofie', description: 'Stoïcisme en levensbeschouwing', icon: '🏛️' }
    ];

    let categoriesInserted = 0;
    for (const category of categories) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from('book_categories')
          .upsert(category, { onConflict: 'name' });
        
        if (insertError) {
          console.error(`Error inserting category ${category.name}:`, insertError);
        } else {
          console.log(`✅ Category ${category.name} inserted/updated`);
          categoriesInserted++;
        }
      } catch (error) {
        console.error(`Failed to insert category ${category.name}:`, error);
      }
    }

    // 2. Insert sample books
    console.log('Inserting sample books...');
    const books = [
      {
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        cover_url: '/books/canthurtme.jpg',
        description: 'David Goggins\' verhaal over hoe hij zijn mentale en fysieke grenzen verlegde.',
        categories: ['Mindset', 'Fitness'],
        status: 'published',
        average_rating: 4.8,
        review_count: 12
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        description: 'Kleine veranderingen, opmerkelijke resultaten: een bewezen manier om goede gewoontes te bouwen en slechte te doorbreken.',
        categories: ['Mindset', 'Productiviteit'],
        status: 'published',
        average_rating: 4.6,
        review_count: 8
      },
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        description: 'Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen.',
        categories: ['Financiën'],
        status: 'published',
        average_rating: 4.4,
        review_count: 5
      }
    ];

    let booksInserted = 0;
    for (const book of books) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from('books')
          .upsert(book, { onConflict: 'title' });
        
        if (insertError) {
          console.error(`Error inserting book ${book.title}:`, insertError);
        } else {
          console.log(`✅ Book ${book.title} inserted/updated`);
          booksInserted++;
        }
      } catch (error) {
        console.error(`Failed to insert book ${book.title}:`, error);
      }
    }

    // 3. Get final counts
    let finalCategoriesCount = 0;
    let finalBooksCount = 0;

    try {
      const { count: categoriesCount } = await supabaseAdmin
        .from('book_categories')
        .select('*', { count: 'exact', head: true });
      finalCategoriesCount = categoriesCount || 0;
    } catch (error) {
      console.error('Error counting categories:', error);
    }

    try {
      const { count: booksCount } = await supabaseAdmin
        .from('books')
        .select('*', { count: 'exact', head: true });
      finalBooksCount = booksCount || 0;
    } catch (error) {
      console.error('Error counting books:', error);
    }

    console.log(`✅ Initialization completed: ${finalCategoriesCount} categories, ${finalBooksCount} books`);

    return NextResponse.json({ 
      success: true, 
      message: 'Books database initialized successfully',
      stats: {
        categories: finalCategoriesCount,
        books: finalBooksCount,
        categoriesInserted,
        booksInserted
      }
    });

  } catch (error) {
    console.error('❌ Error initializing books database:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize books database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 