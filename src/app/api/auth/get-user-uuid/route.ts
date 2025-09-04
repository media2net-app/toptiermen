import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Looking up UUID for email:', email);
    
    const { data: userData, error } = await supabase.auth.admin.getUserByEmail(email);
    
    if (error) {
      console.error('❌ Error fetching user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!userData.user) {
      console.log('❌ User not found for email:', email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('✅ Found UUID for email:', userData.user.id);
    
    return NextResponse.json({ 
      uuid: userData.user.id,
      email: userData.user.email 
    });
    
  } catch (error) {
    console.error('❌ Error in get-user-uuid:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
