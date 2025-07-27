import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching book categories from database...');

    // Fetch categories from database
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('book_categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching book categories:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch book categories' }, { status: 500 });
    }

    // Transform database data to match expected format
    const transformedCategories = categories?.map(category => ({
      id: category.id.toString(),
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      bookCount: category.book_count || 0
    })) || [];

    console.log(`📊 Found ${transformedCategories.length} book categories`);

    return NextResponse.json({ 
      success: true, 
      categories: transformedCategories
    });

  } catch (error) {
    console.error('Error fetching book categories:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch book categories' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new book category:', body);

    const { data: category, error } = await supabaseAdmin
      .from('book_categories')
      .insert([{
        name: body.name,
        description: body.description,
        color: body.color || '#8BAE5A',
        icon: body.icon,
        book_count: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating book category:', error);
      return NextResponse.json({ error: 'Failed to create book category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      category 
    });

  } catch (error) {
    console.error('Error creating book category:', error);
    return NextResponse.json({ 
      error: 'Failed to create book category' 
    }, { status: 500 });
  }
} 