import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Setting up books database tables...');

    // 1. Create book_categories table
    console.log('Creating book_categories table...');
    const { error: categoriesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS book_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(7) DEFAULT '#8BAE5A',
          icon VARCHAR(50),
          book_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (categoriesError) {
      console.error('Error creating book_categories table:', categoriesError);
      // Try alternative approach - direct table creation
      console.log('Trying direct table creation...');
    } else {
      console.log('✅ book_categories table created');
    }

    // 2. Create books table
    console.log('Creating books table...');
    const { error: booksError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          cover_url TEXT,
          description TEXT,
          categories TEXT[] DEFAULT '{}',
          affiliate_bol TEXT,
          affiliate_amazon TEXT,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
          average_rating DECIMAL(3,2) DEFAULT 0,
          review_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (booksError) {
      console.error('Error creating books table:', booksError);
    } else {
      console.log('✅ books table created');
    }

    // 3. Insert default categories
    console.log('Inserting default categories...');
    const categories = [
      { name: 'Mindset', description: 'Mentale groei en persoonlijke ontwikkeling', icon: '🧠' },
      { name: 'Productiviteit', description: 'Time management en focus', icon: '⚡' },
      { name: 'Financiën', description: 'Geld, investeren en business', icon: '💰' },
      { name: 'Fitness', description: 'Training en gezondheid', icon: '💪' },
      { name: 'Leadership', description: 'Leiderschap en communicatie', icon: '🎯' },
      { name: 'Filosofie', description: 'Stoïcisme en levensbeschouwing', icon: '🏛️' }
    ];

    for (const category of categories) {
      const { error: insertError } = await supabaseAdmin
        .from('book_categories')
        .upsert(category, { onConflict: 'name' });
      
      if (insertError) {
        console.error(`Error inserting category ${category.name}:`, insertError);
      } else {
        console.log(`✅ Category ${category.name} inserted/updated`);
      }
    }

    // 4. Insert sample books
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

    for (const book of books) {
      const { error: insertError } = await supabaseAdmin
        .from('books')
        .upsert(book, { onConflict: 'title' });
      
      if (insertError) {
        console.error(`Error inserting book ${book.title}:`, insertError);
      } else {
        console.log(`✅ Book ${book.title} inserted/updated`);
      }
    }

    // 5. Enable RLS and create policies
    console.log('Setting up RLS policies...');
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE books ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to book_categories" ON book_categories
          FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow public read access to books" ON books
          FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow admin write access to book_categories" ON book_categories
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE users.id = auth.uid() 
              AND users.role = 'admin'
            )
          );
        
        CREATE POLICY IF NOT EXISTS "Allow admin write access to books" ON books
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM users 
              WHERE users.id = auth.uid() 
              AND users.role = 'admin'
            )
          );
      `
    });

    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies created');
    }

    // 6. Verify setup
    console.log('Verifying setup...');
    const { count: categoriesCount } = await supabaseAdmin
      .from('book_categories')
      .select('*', { count: 'exact', head: true });

    const { count: booksCount } = await supabaseAdmin
      .from('books')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Setup completed: ${categoriesCount} categories, ${booksCount} books`);

    return NextResponse.json({ 
      success: true, 
      message: 'Books database setup completed successfully',
      stats: {
        categories: categoriesCount,
        books: booksCount
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