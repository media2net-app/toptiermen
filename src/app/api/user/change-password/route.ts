import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();
    
    console.log('🔧 Changing password for user');
    
    if (!newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Nieuw wachtwoord is vereist'
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Nieuw wachtwoord moet minimaal 8 karakters lang zijn'
      }, { status: 400 });
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json({
        success: false,
        error: 'Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten'
      }, { status: 400 });
    }

    // Get the authorization header to get the current user's session
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Geen geldige authenticatie'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Error getting user:', userError);
      return NextResponse.json({
        success: false,
        error: 'Gebruiker niet gevonden'
      }, { status: 401 });
    }

    // Update the password using admin API (no current password required, user must be authenticated via token)
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message || 'Fout bij het wijzigen van wachtwoord'
      }, { status: 400 });
    }

    console.log('✅ Password changed successfully for user:', user.email);
    
    return NextResponse.json({
      success: true,
      message: 'Wachtwoord succesvol gewijzigd'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Interne server fout'
    }, { status: 500 });
  }
}
