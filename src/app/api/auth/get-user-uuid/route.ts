import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdminClient();
    
    console.log('🔍 Looking up UUID for email:', email);
    
    // Try to find user in auth.users table directly
    const { data: userData, error } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('❌ Error fetching user:', error);
      // If direct query fails, try alternative approach
      try {
        // Use RPC function if available
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_by_email', { user_email: email });
        
        if (rpcError) {
          console.error('❌ RPC error:', rpcError);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        if (rpcData) {
          console.log('✅ Found UUID via RPC:', rpcData.id);
          return NextResponse.json({ 
            uuid: rpcData.id,
            email: rpcData.email 
          });
        }
      } catch (rpcError) {
        console.error('❌ RPC failed:', rpcError);
      }
      
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!userData) {
      console.log('❌ User not found for email:', email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('✅ Found UUID for email:', userData.id);
    
    return NextResponse.json({ 
      uuid: userData.id,
      email: userData.email 
    });
    
  } catch (error) {
    console.error('❌ Error in get-user-uuid:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
