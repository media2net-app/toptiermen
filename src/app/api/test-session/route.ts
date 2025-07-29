import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
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
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Test Session - Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Geen autorisatie header gevonden',
        session: null
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 Test Session - Token length:', token.length);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    console.log('🔍 Test Session - User auth result:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      error: error?.message 
    });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: `Authenticatie fout: ${error.message}`,
        session: null
      });
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Geen gebruiker gevonden',
        session: null
      });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'unknown'
      },
      session: 'valid'
    });

  } catch (error) {
    console.error('❌ Test Session error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      session: null
    });
  }
} 