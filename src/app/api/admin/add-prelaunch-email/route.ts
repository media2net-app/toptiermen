import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Add email to prelaunch list
    const { error } = await supabaseAdmin
      .from('prelaunch_emails')
      .insert({
        email,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding prelaunch email:', error);
      return NextResponse.json({ error: 'Failed to add email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in add-prelaunch-email API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}