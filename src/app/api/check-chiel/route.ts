import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    console.log('🔍 Checking for Chiel in database...');
    
    // Check if Chiel exists in users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'chiel@media2net.nl');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: usersError.message
      });
    }
    
    console.log('📊 Found users:', users?.length || 0);
    
    // Check all users in the system
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at');
    
    if (allUsersError) {
      console.error('❌ Error fetching all users:', allUsersError);
    }
    
    // Try to create Chiel if he doesn't exist
    if (!users || users.length === 0) {
      console.log('⚠️ Chiel not found, attempting to create...');
      
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'chiel@media2net.nl',
        password: 'W4t3rk0k3r^',
        email_confirm: true,
        user_metadata: {
          full_name: 'Chiel'
        }
      });
      
      if (authError) {
        console.error('❌ Error creating auth user:', authError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create auth user',
          details: authError.message,
          allUsers: allUsers || []
        });
      }
      
      if (authData.user) {
        // Create profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: 'chiel@media2net.nl',
              full_name: 'Chiel',
              role: 'admin'
            }
          ]);
        
        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
          return NextResponse.json({
            success: false,
            error: 'Failed to create profile',
            details: profileError.message,
            authUser: authData.user,
            allUsers: allUsers || []
          });
        }
        
        console.log('✅ Chiel created successfully!');
        return NextResponse.json({
          success: true,
          message: 'Chiel created successfully',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: 'admin'
          },
          allUsers: allUsers || []
        });
      }
    } else {
      console.log('✅ Chiel found:', users[0]);
      return NextResponse.json({
        success: true,
        message: 'Chiel exists',
        user: users[0],
        allUsers: allUsers || []
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unexpected state',
      allUsers: allUsers || []
    });

  } catch (error) {
    console.error('❌ Check Chiel error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 