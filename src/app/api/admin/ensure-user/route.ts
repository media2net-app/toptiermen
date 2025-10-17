import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const full_name = (body.full_name as string) || email.split('@')[0];
    const username = (body.username as string) || full_name;
    const package_type = (body.package_type as string) || 'Basic Tier';

    if (!email) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 });
    }

    // Try to find existing auth user by listing users (no direct search API)
    let authUser: any | null = null;
    try {
      let page = 1;
      const perPage = 200;
      for (let i = 0; i < 10; i++) { // up to 2000 users
        const { data, error } = await (supabaseAdmin as any).auth.admin.listUsers({ page, perPage });
        if (error) break;
        const found = data.users?.find((u: any) => String(u.email || '').toLowerCase() === email);
        if (found) { authUser = found; break; }
        if (!data?.users || data.users.length < perPage) break;
        page++;
      }
    } catch {}

    // Create auth user if not found
    if (!authUser) {
      const tempPassword = generateTempPassword();
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name, username }
      });
      if (createErr || !created?.user) {
        return NextResponse.json({ error: createErr?.message || 'Kon auth user niet aanmaken' }, { status: 400 });
      }
      authUser = created.user;
    }

    const userId = authUser.id as string;

    // Upsert profile
    let subscription_tier = 'basic';
    if (package_type === 'Premium Tier') subscription_tier = 'premium';
    if (package_type === 'Lifetime Tier') subscription_tier = 'lifetime';

    const { error: profileUpsertErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name,
        display_name: username,
        package_type,
        subscription_tier
      }, { onConflict: 'id' });
    if (profileUpsertErr) {
      return NextResponse.json({ error: 'Profiel upsert mislukt: ' + profileUpsertErr.message }, { status: 400 });
    }

    // Ensure onboarding_status exists
    const { data: existingOnb } = await supabaseAdmin
      .from('onboarding_status')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingOnb) {
      await supabaseAdmin
        .from('onboarding_status')
        .insert({ user_id: userId, onboarding_completed: false, current_step: 0 });
    }

    return NextResponse.json({
      success: true,
      user: { id: userId, email, full_name, username, package_type },
      message: 'User ensured successfully (auth/profile/onboarding ready)'
    });
  } catch (e: any) {
    console.error('ensure-user error', e);
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 });
  }
}
