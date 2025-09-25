import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email en nieuw wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    console.log(`🔐 Resetting password for: ${email}`);

    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return NextResponse.json(
        { error: 'Fout bij ophalen gebruikers' },
        { status: 500 }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    // Update user password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword
      }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Fout bij updaten wachtwoord: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Password updated for: ${email}`);

    return NextResponse.json({
      success: true,
      message: `Wachtwoord succesvol gereset voor ${email}`,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error in reset-password API:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het resetten van het wachtwoord' },
      { status: 500 }
    );
  }
}
