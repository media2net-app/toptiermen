import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') || 'created_at').toString();
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toString();

    console.log('🛍️ Fetching products...', { category, search, sortBy, sortOrder });

    // Whitelist sort columns to prevent SQL injection
    const SORT_COLUMNS: Record<string, string> = {
      created_at: 'created_at',
      name: 'name',
      price: 'price',
      rating: 'rating',
    };
    const sortColumn = SORT_COLUMNS[sortBy] || 'created_at';
    const ascending = sortOrder.toLowerCase() === 'asc';

    // Build basic query (no joins to avoid RLS/relationship issues)
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order(sortColumn, { ascending })
      .limit(100);

    if (category && category !== 'all') {
      const catId = isNaN(Number(category)) ? category : Number(category);
      query = query.eq('category_id', catId as any);
    }
    if (search) {
      // Search across name and description
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('❌ Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Also provide categories for filters (lightweight)
    const { data: categories, error: catError } = await supabaseAdmin
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });
    if (catError) {
      console.warn('⚠️ Could not fetch categories for filters:', catError.message);
    }

    return NextResponse.json({ products: data || [], categories: categories || [] });
  } catch (error) {
    console.error('❌ Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}