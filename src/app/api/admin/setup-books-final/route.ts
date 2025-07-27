import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Final books setup - creating tables via Supabase...');

    // Since we can't create tables via the client, we'll provide clear instructions
    // and create a simple test to verify if tables exist
    
    console.log('🔍 Checking if tables exist...');
    
    const { error: categoriesError } = await supabaseAdmin
      .from('book_categories')
      .select('*')
      .limit(1);

    const { error: booksError } = await supabaseAdmin
      .from('books')
      .select('*')
      .limit(1);

    if (categoriesError && categoriesError.code === 'PGRST116') {
      console.log('❌ book_categories table does not exist');
      return NextResponse.json({ 
        error: 'Database tables do not exist',
        message: 'The books tables need to be created manually in Supabase',
        instructions: {
          step1: 'Go to https://supabase.com and log into your project',
          step2: 'Navigate to SQL Editor in the left sidebar',
          step3: 'Click "New query"',
          step4: 'Copy and paste the entire content from create_books_tables.sql',
          step5: 'Click "Run" to execute the SQL',
          step6: 'Verify tables exist in Table Editor',
          step7: 'Test the admin dashboard at /dashboard-admin/boekenkamer'
        },
        sqlFile: 'create_books_tables.sql',
        status: 'manual_setup_required'
      }, { status: 400 });
    }

    if (booksError && booksError.code === 'PGRST116') {
      console.log('❌ books table does not exist');
      return NextResponse.json({ 
        error: 'Database tables do not exist',
        message: 'The books tables need to be created manually in Supabase',
        instructions: {
          step1: 'Go to https://supabase.com and log into your project',
          step2: 'Navigate to SQL Editor in the left sidebar',
          step3: 'Click "New query"',
          step4: 'Copy and paste the entire content from create_books_tables.sql',
          step5: 'Click "Run" to execute the SQL',
          step6: 'Verify tables exist in Table Editor',
          step7: 'Test the admin dashboard at /dashboard-admin/boekenkamer'
        },
        sqlFile: 'create_books_tables.sql',
        status: 'manual_setup_required'
      }, { status: 400 });
    }

    console.log('✅ Tables exist, inserting sample data...');

    // Insert sample data
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
      const { error: insertError } = await supabaseAdmin
        .from('book_categories')
        .upsert(category, { onConflict: 'name' });
      
      if (insertError) {
        console.log(`❌ Error inserting category ${category.name}:`, insertError);
      } else {
        console.log(`✅ Category ${category.name} inserted/updated`);
        categoriesInserted++;
      }
    }

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
      const { error: insertError } = await supabaseAdmin
        .from('books')
        .upsert(book, { onConflict: 'title' });
      
      if (insertError) {
        console.log(`❌ Error inserting book ${book.title}:`, insertError);
      } else {
        console.log(`✅ Book ${book.title} inserted/updated`);
        booksInserted++;
      }
    }

    console.log('🎉 Books database setup completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Books database setup completed successfully',
      stats: {
        categoriesInserted,
        booksInserted
      }
    });

  } catch (error) {
    console.error('❌ Error setting up books database:', error);
    return NextResponse.json({ 
      error: 'Failed to setup books database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 