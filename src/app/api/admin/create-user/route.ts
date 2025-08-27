import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, username, rank, status, password } = body;

    // Validate required fields
    if (!email || !full_name || !password) {
      return NextResponse.json(
        { error: 'E-mail, volledige naam en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        username: username || null
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Fout bij het aanmaken van gebruiker' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Gebruiker kon niet worden aangemaakt' },
        { status: 500 }
      );
    }

            // Create user record in profiles table
        const { error: userError } = await supabaseAdmin
          .from('profiles')
          .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        username: username || null,
        status: status || 'active',
        role: 'user',
        points: 0,
        missions_completed: 0
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      // Don't fail completely, user was created in auth
    }

            // Create profile record
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        display_name: username || full_name,
        rank: rank || 'Rookie',
        points: 0,
        missions_completed: 0,
        badges: 0,
        posts: 0
      });

    if (profileError) {
      console.error('Error creating profile record:', profileError);
      // Don't fail completely, user was created in auth
    }

            // Create onboarding status record
        const { error: onboardingError } = await supabaseAdmin
          .from('onboarding_status')
          .insert({
        user_id: authData.user.id,
        onboarding_completed: false,
        current_step: 0
      });

    if (onboardingError) {
      console.error('Error creating onboarding status:', onboardingError);
      // Don't fail completely, user was created in auth
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        full_name: full_name,
        username: username,
        rank: rank || 'Rookie',
        status: status || 'active'
      },
      message: `Gebruiker ${full_name} succesvol aangemaakt!`
    });

  } catch (error) {
    console.error('Error in create-user API:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het aanmaken van de gebruiker' },
      { status: 500 }
    );
  }
} 