import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Checking impersonation status for user:', userId);

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Get user profile with impersonation session
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name, admin_impersonation_session')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      console.log('❌ User profile not found:', userError);
      return NextResponse.json({ 
        success: false,
        impersonation: null
      });
    }

    // Check if user has an active impersonation session
    if (userProfile.admin_impersonation_session) {
      try {
        const impersonationData = JSON.parse(userProfile.admin_impersonation_session);
        
        if (impersonationData.status === 'active') {
          // Get target user data
          const { data: targetUser, error: targetError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('id', impersonationData.target_user_id)
            .single();

          if (targetError || !targetUser) {
            console.log('❌ Target user not found:', targetError);
            return NextResponse.json({ 
              success: false,
              impersonation: null
            });
          }

          console.log('✅ Active impersonation session found:', {
            admin: userProfile.email,
            target: targetUser.email
          });

          return NextResponse.json({
            success: true,
            impersonation: impersonationData,
            targetUser: targetUser
          });
        }
      } catch (parseError) {
        console.log('❌ Error parsing impersonation session:', parseError);
        // Clear invalid session data
        await supabase
          .from('profiles')
          .update({ admin_impersonation_session: null })
          .eq('id', userId);
      }
    }

    console.log('ℹ️ No active impersonation session found');
    return NextResponse.json({ 
      success: false,
      impersonation: null
    });

  } catch (error) {
    console.error('❌ Error checking impersonation status:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
