import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const groupId = searchParams.get('groupId');

    console.log('🏛️ Fetching brotherhood groups...');

    if (groupId) {
      // Get specific group with members and events
      const { data: group, error: groupError } = await supabaseAdmin
        .from('brotherhood_groups')
        .select(`
          *,
          brotherhood_group_members (
            id,
            role,
            joined_at,
            user_id,
            profiles (
              id,
              full_name,
              email,
              avatar_url
            )
          ),
          brotherhood_events (
            id,
            title,
            description,
            event_type,
            event_date,
            location,
            is_online,
            max_attendees,
            status
          )
        `)
        .eq('id', groupId)
        .eq('status', 'active')
        .single();

      if (groupError) {
        console.error('❌ Error fetching group:', groupError);
        return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
      }

      return NextResponse.json({ group });
    } else {
      // Get all active groups
      const { data: groups, error: groupsError } = await supabaseAdmin
        .from('brotherhood_groups')
        .select(`
          *,
          brotherhood_group_members (
            user_id,
            role,
            joined_at
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('❌ Error fetching groups:', groupsError);
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
      }

      return NextResponse.json({ groups });
    }
  } catch (error) {
    console.error('❌ Brotherhood groups API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, max_members, is_private, created_by } = body;

    console.log('🏛️ Creating brotherhood group:', name);

    const { data: group, error: groupError } = await supabaseAdmin
      .from('brotherhood_groups')
      .insert({
        name,
        description,
        category,
        max_members,
        is_private,
        created_by
      })
      .select()
      .single();

    if (groupError) {
      console.error('❌ Error creating group:', groupError);
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    }

    // Add creator as admin member
    const { error: memberError } = await supabaseAdmin
      .from('brotherhood_group_members')
      .insert({
        group_id: group.id,
        user_id: created_by,
        role: 'admin'
      });

    if (memberError) {
      console.error('❌ Error adding creator as member:', memberError);
    }

    console.log('✅ Group created successfully:', group.id);
    return NextResponse.json({ group });
  } catch (error) {
    console.error('❌ Brotherhood groups POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}