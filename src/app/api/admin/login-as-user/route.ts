import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase client with service role key for admin operations
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUserId, adminUserId } = body;

    console.log('🔐 Admin login as user request:', { targetUserId, adminUserId });

    if (!targetUserId || !adminUserId) {
      return NextResponse.json({ 
        error: 'Target user ID and admin user ID are required' 
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Verify admin user has admin privileges
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', adminUserId)
      .single();

    if (adminError || !adminUser) {
      console.log('❌ Admin user not found:', adminError);
      return NextResponse.json({ 
        error: 'Admin user not found' 
      }, { status: 404 });
    }

    // Check if user is admin
    if (adminUser.role !== 'admin') {
      console.log('❌ User is not admin:', adminUser);
      return NextResponse.json({ 
        error: 'Unauthorized: Admin privileges required' 
      }, { status: 403 });
    }

    // Get target user data
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      console.log('❌ Target user not found:', targetError);
      return NextResponse.json({ 
        error: 'Target user not found' 
      }, { status: 404 });
    }

    // Create a special session token for admin impersonation
    // This will be used to identify that this is an admin session
    const impersonationData = {
      admin_user_id: adminUserId,
      target_user_id: targetUserId,
      admin_email: adminUser.email,
      target_email: targetUser.email,
      impersonated_at: new Date().toISOString(),
      session_type: 'admin_impersonation'
    };

    // Store impersonation session in admin user's profile for tracking
    const sessionId = `impersonation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('profiles')
      .update({
        admin_impersonation_session: JSON.stringify({
          sessionId,
          target_user_id: targetUserId,
          target_email: targetUser.email,
          started_at: new Date().toISOString(),
          status: 'active'
        })
      })
      .eq('id', adminUserId)
      .select()
      .single();

    if (sessionError) {
      console.log('⚠️ Could not store impersonation session:', sessionError);
      // Continue anyway, this is just for tracking
    }

    console.log('✅ Admin impersonation successful:', {
      admin: adminUser.email,
      target: targetUser.email,
      sessionId: sessionData?.id
    });

    // Return success with impersonation data
    return NextResponse.json({
      success: true,
      message: `Successfully logged in as ${targetUser.email}`,
      impersonation: impersonationData,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
        role: targetUser.role
      },
      adminUser: {
        id: adminUser.id,
        email: adminUser.email
      },
      sessionId: sessionData?.id
    });

  } catch (error) {
    console.error('❌ Error in admin login as user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, adminUserId } = body;

    console.log('🔐 Ending admin impersonation:', { sessionId, adminUserId });

    if (!sessionId || !adminUserId) {
      return NextResponse.json({ 
        error: 'Session ID and admin user ID are required' 
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // End the impersonation session by clearing it from admin profile
    const { error: sessionError } = await supabase
      .from('profiles')
      .update({
        admin_impersonation_session: null
      })
      .eq('id', adminUserId);

    if (sessionError) {
      console.log('⚠️ Could not end impersonation session:', sessionError);
    }

    console.log('✅ Admin impersonation ended successfully');

    return NextResponse.json({
      success: true,
      message: 'Impersonation session ended'
    });

  } catch (error) {
    console.error('❌ Error ending admin impersonation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
