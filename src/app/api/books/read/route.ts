import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// /api/books/read
// GET:    ?userId=...                  -> returns { bookIds: number[] }
// POST:   { userId, bookId }           -> marks as read (upsert)
// DELETE: { userId, bookId }           -> unmarks as read (delete)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('book_reviews')
      .select('book_id')
      .eq('user_id', userId);

    if (error) {
      console.error('GET read books error:', error);
      return NextResponse.json({ error: 'Failed to fetch read books' }, { status: 500 });
    }

    // book_id column is text in schema; coerce to number for frontend
    const bookIds = (data || [])
      .map((row: any) => Number(row.book_id))
      .filter((n: any) => Number.isFinite(n));
    return NextResponse.json({ bookIds });
  } catch (e) {
    console.error('GET read books exception:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bookId } = body || {};
    if (!userId || typeof bookId !== 'number') {
      return NextResponse.json({ error: 'userId and numeric bookId are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('book_reviews')
      .upsert({ user_id: userId, book_id: String(bookId) }, { onConflict: 'user_id,book_id' });

    if (error) {
      console.error('POST mark read error:', error);
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('POST mark read exception:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bookId } = body || {};
    if (!userId || typeof bookId !== 'number') {
      return NextResponse.json({ error: 'userId and numeric bookId are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('book_reviews')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', String(bookId));

    if (error) {
      console.error('DELETE unmark read error:', error);
      return NextResponse.json({ error: 'Failed to unmark as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE unmark read exception:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
