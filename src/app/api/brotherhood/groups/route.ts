import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch brotherhood groups
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('is_public');

    let query = supabase
      .from('brotherhood_groups')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    }

    const { data: groups, error } = await query;

    if (error) {
      console.error('Error fetching brotherhood groups:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch groups' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      groups 
    });

  } catch (error) {
    console.error('Error in brotherhood groups GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Create new brotherhood group
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      max_members = 50,
      is_public = true
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description' 
      }, { status: 400 });
    }

    const { data: group, error } = await supabase
      .from('brotherhood_groups')
      .insert({
        name,
        description,
        category,
        max_members,
        is_public,
        created_by: user.id,
        member_count: 1 // Creator is first member
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brotherhood group:', error);
      return NextResponse.json({ 
        error: 'Failed to create group' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      group 
    });

  } catch (error) {
    console.error('Error in brotherhood groups POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
