import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      );
    }

    console.log(`🔐 Updating password for: ${email}`);

    // First, get the user ID by email
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Fout bij het ophalen van gebruikers' },
        { status: 500 }
      );
    }

    const user = users?.users?.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    // Now update the password with the correct user ID
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Fout bij het bijwerken van wachtwoord' },
        { status: 400 }
      );
    }

    console.log(`✅ Password updated for: ${email}`);

    return NextResponse.json({
      success: true,
      message: `Wachtwoord succesvol bijgewerkt voor ${email}`,
      user: {
        id: user.id,
        email: email
      }
    });

  } catch (error) {
    console.error('❌ Error in update-user-password API:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het bijwerken van het wachtwoord' },
      { status: 500 }
    );
  }
}
