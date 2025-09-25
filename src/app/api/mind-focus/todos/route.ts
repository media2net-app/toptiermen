import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const { data: todos, error } = await supabase
      .from('mind_focus_todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch todos' }, { status: 500 });
    }

    return NextResponse.json({ success: true, todos });
  } catch (error) {
    console.error('Error in GET /api/mind-focus/todos:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, text, category } = await request.json();

    if (!userId || !text) {
      return NextResponse.json({ success: false, error: 'User ID and text are required' }, { status: 400 });
    }

    const { data: todo, error } = await supabase
      .from('mind_focus_todos')
      .insert([
        {
          user_id: userId,
          text: text.trim(),
          completed: false,
          category: category || 'general',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      return NextResponse.json({ success: false, error: 'Failed to create todo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error('Error in POST /api/mind-focus/todos:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, todoId, completed } = await request.json();

    if (!userId || !todoId || typeof completed !== 'boolean') {
      return NextResponse.json({ success: false, error: 'User ID, todo ID, and completed status are required' }, { status: 400 });
    }

    const { data: todo, error } = await supabase
      .from('mind_focus_todos')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', todoId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      return NextResponse.json({ success: false, error: 'Failed to update todo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error('Error in PUT /api/mind-focus/todos:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, todoId } = await request.json();

    if (!userId || !todoId) {
      return NextResponse.json({ success: false, error: 'User ID and todo ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('mind_focus_todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting todo:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete todo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/mind-focus/todos:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
