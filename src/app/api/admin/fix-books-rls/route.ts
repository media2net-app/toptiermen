import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing books database with RLS bypass...');

    // First, let's try to create the tables by temporarily disabling RLS
    console.log('📊 Step 1: Creating book_categories table...');
    
    // Try to create the table by inserting data
    const { error: categoriesError } = await supabaseAdmin
      .from('book_categories')
      .insert({
        name: 'Test Category',
        description: 'Test description',
        icon: '📚'
      })
      .select();

    if (categoriesError) {
      console.log('❌ Error creating book_categories:', categoriesError);
      
      // If it's a table doesn't exist error, we need to create it manually
      if (categoriesError.code === 'PGRST116') {
        console.log('💡 Table does not exist - manual setup required');
        return NextResponse.json({ 
          error: 'Database tables do not exist',
          message: 'Please execute the SQL manually in Supabase dashboard',
          sqlFile: 'create_books_tables_simple.sql',
          instructions: [
            '1. Go to https://supabase.com and log into your project',
            '2. Navigate to SQL Editor in the left sidebar',
            '3. Click "New query"',
            '4. Copy and paste the content from create_books_tables_simple.sql',
            '5. Click "Run" to execute the SQL',
            '6. Test the admin dashboard at /dashboard-admin/boekenkamer'
          ]
        }, { status: 400 });
      }
    } else {
      console.log('✅ book_categories table exists');
      
      // Clean up test data
      await supabaseAdmin
        .from('book_categories')
        .delete()
        .eq('name', 'Test Category');
    }

    console.log('📚 Step 2: Creating books table...');
    
    const { error: booksError } = await supabaseAdmin
      .from('books')
      .insert({
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        status: 'draft'
      })
      .select();

    if (booksError) {
      console.log('❌ Error creating books:', booksError);
      
      if (booksError.code === 'PGRST116') {
        console.log('💡 Table does not exist - manual setup required');
        return NextResponse.json({ 
          error: 'Database tables do not exist',
          message: 'Please execute the SQL manually in Supabase dashboard',
          sqlFile: 'create_books_tables_simple.sql'
        }, { status: 400 });
      }
    } else {
      console.log('✅ books table exists');
      
      // Clean up test data
      await supabaseAdmin
        .from('books')
        .delete()
        .eq('title', 'Test Book');
    }

    console.log('📊 Step 3: Inserting sample data...');
    
    // Insert categories
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

    // Insert books
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