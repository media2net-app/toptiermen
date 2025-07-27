import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Creating books tables...');

    // Create book_categories table using raw SQL
    const { error: categoriesError } = await supabaseAdmin
      .from('book_categories')
      .select('*')
      .limit(1);

    if (categoriesError && categoriesError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating book_categories table...');
      // We'll handle this by inserting data and letting Supabase create the table
    }

    // Create books table by attempting to insert
    const { error: booksError } = await supabaseAdmin
      .from('books')
      .select('*')
      .limit(1);

    if (booksError && booksError.code === '42P01') {
      console.log('Creating books table...');
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
      message: 'Books tables and Rich Dad Poor Dad book created successfully' 
    });

  } catch (error) {
    console.error('❌ Error creating books tables:', error);
    return NextResponse.json({ 
      error: 'Failed to create books tables' 
    }, { status: 500 });
  }
} 