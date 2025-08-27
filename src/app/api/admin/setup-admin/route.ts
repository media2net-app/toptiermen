import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up admin account...');

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'admin@toptiermen.com')
      .single();

    if (existingAdmin && existingAdmin.role === 'admin') {
      console.log('✅ Admin account already exists');
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account already exists',
        email: 'admin@toptiermen.com',
        password: 'Admin123!'
      });
    }

    // Create admin user in auth.users
    const adminUserId = crypto.randomUUID();
    
    const { error: authError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, 
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
          created_at, updated_at
        ) VALUES (
          '${adminUserId}',
          (SELECT id FROM auth.instances LIMIT 1),
          'authenticated',
          'authenticated',
          'admin@toptiermen.com',
          crypt('Admin123!', gen_salt('bf')),
          NOW(),
          '{"provider": "email", "providers": ["email"]}',
          '{}',
          NOW(),
          NOW()
        ) ON CONFLICT (email) DO NOTHING;
      `
    });

    if (authError && !authError.message.includes('duplicate key')) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // Add role column if it doesn't exist
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
      `
    });

    // Insert admin user into public.profiles table
    const { error: userError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: adminUserId,
        email: 'admin@toptiermen.com',
        full_name: 'Platform Administrator',
        rank: 'Elite',
        points: 1000,
        missions_completed: 50,
        bio: 'Top Tier Men Platform Administrator',
        location: 'Netherlands',
        interests: ['Leadership', 'Management', 'Technology', 'Community'],
        role: 'admin',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }

    console.log('✅ Admin account created successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully',
      email: 'admin@toptiermen.com',
      password: 'Admin123!',
      userId: adminUserId
    });

  } catch (error) {
    console.error('Error in setup-admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 