import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching ranks from database...');

    // Fetch ranks from database
    const { data: ranks, error: ranksError } = await supabaseAdmin
      .from('ranks')
      .select('*')
      .order('rank_order', { ascending: true });

    if (ranksError) {
      console.error('Error fetching ranks:', ranksError);
      return NextResponse.json({ error: 'Failed to fetch ranks' }, { status: 500 });
    }

    // Transform database data to match expected format
    const transformedRanks = ranks?.map(rank => ({
      id: rank.id.toString(),
      name: rank.name,
      level: rank.rank_order,
      color: getRankColor(rank.rank_order),
      requirements: `${rank.xp_needed} XP, ${rank.badges_needed} badges`,
      benefits: rank.unlock_description
    })) || [];

    console.log(`📊 Found ${transformedRanks.length} ranks`);

    return NextResponse.json({ 
      success: true, 
      ranks: transformedRanks
    });

  } catch (error) {
    console.error('Error fetching ranks:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ranks' 
    }, { status: 500 });
  }
}

// Helper function to get color based on rank level
function getRankColor(rankOrder: number): string {
  const colors = [
    '#8BAE5A', // Green for Recruit
    '#f0a14f', // Orange for Warrior
    '#FFD700', // Gold for Elite
    '#8B5CF6', // Purple for Veteran
    '#EF4444', // Red for Legend
    '#3B82F6'  // Blue for default
  ];
  return colors[rankOrder - 1] || colors[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new rank:', body);

    const { data: rank, error } = await supabaseAdmin
      .from('ranks')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating rank:', error);
      return NextResponse.json({ error: 'Failed to create rank' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      rank 
    });

  } catch (error) {
    console.error('Error creating rank:', error);
    return NextResponse.json({ 
      error: 'Failed to create rank' 
    }, { status: 500 });
  }
} 