import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('📢 Fetching announcement categories from database...');

    const { data: categories, error } = await supabaseAdmin
      .from('announcement_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching announcement categories:', error);
      return NextResponse.json({ error: 'Failed to fetch announcement categories' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedCategories = categories?.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      announcementCount: category.announcement_count || 0,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    })) || [];

    console.log(`✅ Fetched ${transformedCategories.length} announcement categories`);

    return NextResponse.json({
      success: true,
      categories: transformedCategories
    });

  } catch (error) {
    console.error('Error fetching announcement categories:', error);
    return NextResponse.json({
      error: 'Failed to fetch announcement categories'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📢 Creating new announcement category:', body);

    const { data: category, error } = await supabaseAdmin
      .from('announcement_categories')
      .insert({
        name: body.name,
        description: body.description,
        color: body.color || '#8BAE5A',
        icon: body.icon || '📢'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement category:', error);
      return NextResponse.json({ error: 'Failed to create announcement category' }, { status: 500 });
    }

    // Transform the response
    const transformedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      announcementCount: category.announcement_count || 0,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    return NextResponse.json({
      success: true,
      category: transformedCategory
    });

  } catch (error) {
    console.error('Error creating announcement category:', error);
    return NextResponse.json({
      error: 'Failed to create announcement category'
    }, { status: 500 });
  }
} 