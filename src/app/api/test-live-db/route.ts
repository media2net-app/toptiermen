import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('🧪 Testing live Supabase database connection...');
    
    // Test basic connection with users table (which should exist)
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .limit(3);

    if (usersError) {
      throw new Error(`Users query failed: ${usersError.message}`);
    }

    // Test forum_posts table
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('forum_posts')
      .select('id, title')
      .limit(3);

    if (postsError) {
      console.log('⚠️ Forum posts query failed:', postsError.message);
    }

    // Test academy_modules table
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('academy_modules')
      .select('id, title')
      .limit(3);

    if (modulesError) {
      console.log('⚠️ Academy modules query failed:', modulesError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Live Supabase database connection successful',
      data: {
        users: users?.length || 0,
        posts: posts?.length || 0,
        modules: modules?.length || 0
      },
      sampleUsers: users?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.full_name
      })) || []
    });
  } catch (error) {
    console.error('❌ Live database connection error:', error);
    return NextResponse.json({
      error: 'Live database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 