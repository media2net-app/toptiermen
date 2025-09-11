import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Adding Rich Dad Poor Dad book...');

    // First, ensure the books table exists
    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
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

    if (tableError) {
      console.error('Error creating books table:', tableError);
    }

    // Insert Rich Dad Poor Dad book
    const { data: book, error: bookError } = await supabaseAdmin
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
      })
      .select()
      .single();

    if (bookError) {
      console.error('Error inserting Rich Dad Poor Dad:', bookError);
      return NextResponse.json({ 
        error: 'Failed to add book',
        details: bookError 
      }, { status: 500 });
    }

    console.log('✅ Rich Dad Poor Dad book added successfully:', book);

    return NextResponse.json({ 
      success: true, 
      book,
      message: 'Rich Dad Poor Dad book added successfully' 
    });

  } catch (error) {
    console.error('❌ Error adding book:', error);
    return NextResponse.json({ 
      error: 'Failed to add book' 
    }, { status: 500 });
  }
} 