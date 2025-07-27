import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching badges from database...');

    // Fetch badges from database
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Transform database data to match expected format
    const transformedBadges = badges?.map(badge => ({
      id: badge.id.toString(),
      name: badge.title,
      description: badge.description,
      icon: badge.icon_name || '🏆',
      category: badge.category_id ? `Category ${badge.category_id}` : 'General',
      levels: [], // Default empty array
      trigger: badge.requirements?.type || 'custom',
      conditions: badge.requirements ? [badge.requirements] : [],
      isActive: badge.is_active || false,
      ruleLogic: 'AND' as const,
      timeWindow: 30,
      cooldown: 0
    })) || [];

    console.log(`📊 Found ${transformedBadges.length} badges`);

    return NextResponse.json({ 
      success: true, 
      badges: transformedBadges
    });

  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch badges' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new badge:', body);

    const { data: badge, error } = await supabaseAdmin
      .from('badges')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating badge:', error);
      return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      badge 
    });

  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json({ 
      error: 'Failed to create badge' 
    }, { status: 500 });
  }
} 