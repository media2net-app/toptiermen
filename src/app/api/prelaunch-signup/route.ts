import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { 
      name,
      email, 
      utm_source, 
      utm_medium, 
      utm_campaign, 
      utm_content, 
      utm_term 
    } = await request.json();

    // Log UTM data for debugging
    if (utm_source || utm_medium || utm_campaign || utm_content || utm_term) {
      console.log('🎯 UTM data received:', { utm_source, utm_medium, utm_campaign, utm_content, utm_term });
    }

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name is required' 
      }, { status: 400 });
    }

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
        name: name.trim(),
        email: email.toLowerCase(),
        source: 'Pre-launch landingspagina',
        status: 'active',
        package: 'BASIC',
        notes: `Signed up via pre-launch landing page${utm_campaign ? ` | Campaign: ${utm_campaign}` : ''}${utm_content ? ` | Ad Set: ${utm_content}` : ''}`,
        subscribed_at: new Date().toISOString(),
        // Store UTM parameters in dedicated columns
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null
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
