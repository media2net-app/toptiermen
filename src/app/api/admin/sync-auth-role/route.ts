import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: 'userId or email is required' }, { status: 400 });
    }

    // Resolve user id if only email provided
    let resolvedId = userId as string | undefined;
    if (!resolvedId && email) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      if (error || !data) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      resolvedId = data.id;
    }

    // Fetch role from profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, email, id')
      .eq('id', resolvedId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Update auth.users metadata
    const { error: authUpdateError } = await (supabaseAdmin as any).auth.admin.updateUserById(profile.id, {
      user_metadata: { role: profile.role }
    });

    if (authUpdateError) {
      return NextResponse.json({ success: false, error: authUpdateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Auth metadata role synced', user: { id: profile.id, email: profile.email, role: profile.role } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
