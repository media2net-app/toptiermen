import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Setting up books tables...');

    // Create book_categories table
    const { error: categoriesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS book_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          book_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (categoriesError) {
      console.error('Error creating book_categories table:', categoriesError);
    } else {
      console.log('✅ book_categories table created');
    }

    // Create books table
    const { error: booksError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          cover_url TEXT,
          description TEXT,
          categories TEXT[],
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

    // Create book_reviews table
    const { error: reviewsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS book_reviews (
          id SERIAL PRIMARY KEY,
          book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          text TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (reviewsError) {
      console.error('Error creating book_reviews table:', reviewsError);
    } else {
      console.log('✅ book_reviews table created');
    }

    // Insert default categories
    const categories = ['Mindset', 'Productiviteit', 'Financiën', 'Psychologie', 'Besluitvorming', 'Leadership'];
    
    for (const categoryName of categories) {
      const { error: insertError } = await supabaseAdmin
        .from('book_categories')
        .upsert({ name: categoryName }, { onConflict: 'name' });
      
      if (insertError) {
        console.error(`Error inserting category ${categoryName}:`, insertError);
      }
    }
    console.log('✅ Default categories inserted');

    // Insert Rich Dad Poor Dad book
    const { error: bookError } = await supabaseAdmin
      .from('books')
      .insert({
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        description: 'Een klassieker over financiële educatie en het verschil tussen activa en passiva. Robert Kiyosaki legt uit hoe de rijken denken over geld en hoe je financiële vrijheid kunt bereiken.',
        categories: ['Financiën', 'Mindset'],
        status: 'published',
        average_rating: 4.2,
        review_count: 12
      });

    if (bookError) {
      console.error('Error inserting Rich Dad Poor Dad:', bookError);
    } else {
      console.log('✅ Rich Dad Poor Dad book inserted');
    }

    // Update book counts
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        UPDATE book_categories 
        SET book_count = (
          SELECT COUNT(*) 
          FROM books 
          WHERE categories && ARRAY[name]
        );
      `
    });

    if (updateError) {
      console.error('Error updating book counts:', updateError);
    } else {
      console.log('✅ Book counts updated');
    }

    console.log('🎉 Books tables setup completed!');

    return NextResponse.json({ 
      success: true, 
      message: 'Books tables setup completed successfully' 
    });

  } catch (error) {
    console.error('❌ Error setting up books tables:', error);
    return NextResponse.json({ 
      error: 'Failed to setup books tables' 
    }, { status: 500 });
  }
} 