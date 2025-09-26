import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch tickets for user or admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const adminView = searchParams.get('admin') === 'true';

    if (adminView) {
      // Admin view - get all tickets with user info
      const { data, error } = await supabaseAdmin
        .from('tickets')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets for admin:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else if (userId) {
      // User view - get only their tickets
      const { data, error } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user tickets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Unexpected error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  try {
    console.log('🎫 Creating support ticket...');
    
    const body = await request.json();
    const { userId, subject, message, category } = body;

    console.log('🎫 Ticket data:', { userId, subject, category, messageLength: message?.length });

    // Validate required fields
    if (!userId || !subject || !message || !category) {
      console.error('❌ Missing required fields:', { userId: !!userId, subject: !!subject, message: !!message, category: !!category });
      return NextResponse.json({ 
        error: 'Alle verplichte velden moeten worden ingevuld',
        details: { userId: !!userId, subject: !!subject, message: !!message, category: !!category }
      }, { status: 400 });
    }

    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format:', userId);
      return NextResponse.json({ error: 'Ongeldige gebruiker ID' }, { status: 400 });
    }

    // Validate message length
    if (message.length < 10) {
      console.error('❌ Message too short:', message.length);
      return NextResponse.json({ error: 'Bericht moet minimaal 10 karakters lang zijn' }, { status: 400 });
    }

    // Validate subject length
    if (subject.length < 3) {
      console.error('❌ Subject too short:', subject.length);
      return NextResponse.json({ error: 'Onderwerp moet minimaal 3 karakters lang zijn' }, { status: 400 });
    }

    console.log('🎫 Inserting ticket into database...');
    
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_id: userId,
        subject: subject.trim(),
        message: message.trim(),
        category,
        status: 'open',
        priority: 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating ticket:', error);
      return NextResponse.json({ 
        error: 'Database fout bij het aanmaken van ticket',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ Ticket created successfully:', data.id);
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('❌ Unexpected error creating ticket:', error);
    return NextResponse.json({ 
      error: 'Interne server fout',
      details: error instanceof Error ? error.message : 'Onbekende fout'
    }, { status: 500 });
  }
}
