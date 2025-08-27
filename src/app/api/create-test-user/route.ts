import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();
    
    console.log('🔧 Creating test user:', email);
    
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    // Create new user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 400 });
    }

    if (authData.user) {
      console.log('✅ Auth user created:', authData.user.email);
      
      // Create user profile using admin client
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            role: 'ADMIN'
          }
        ])
        .select();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        return NextResponse.json({
          success: false,
          error: 'Auth user created but failed to create profile'
        }, { status: 400 });
      }

      console.log('✅ User profile created');
      
      return NextResponse.json({
        success: true,
        message: 'Test user created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          password: password // Only for testing!
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create auth user'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Create test user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 