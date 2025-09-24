import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🛍️ Fetching products...');

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });

  } catch (error) {
    console.error('❌ Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}