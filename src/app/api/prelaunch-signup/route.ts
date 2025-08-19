import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    console.log('📧 Pre-launch signup attempt:', email);

    // First check if email already exists
    const { data: existingEmail, error: checkError } = await supabaseAdmin
      .from('prelaunch_emails')
      .select('id, email, subscribed_at')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing email:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database error' 
      }, { status: 500 });
    }

    // If email already exists
    if (existingEmail) {
      console.log('⚠️ Email already exists:', email);
      return NextResponse.json({
        success: false,
        alreadyExists: true,
        message: 'Je bent al toegevoegd aan de wachtlijst!',
        subscribedAt: existingEmail.subscribed_at
      });
    }

    // Add new email to prelaunch list
    const { data: newEmail, error: insertError } = await supabaseAdmin
      .from('prelaunch_emails')
      .insert({
        email: email.toLowerCase(),
        source: 'Pre-launch landingspagina',
        status: 'active',
        package: 'BASIC',
        notes: 'Signed up via pre-launch landing page',
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error adding email to prelaunch list:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to add email to waitlist' 
      }, { status: 500 });
    }

    console.log('✅ Email added to prelaunch list:', newEmail);

    return NextResponse.json({
      success: true,
      message: 'Je bent succesvol toegevoegd aan de wachtlijst!',
      data: newEmail
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
