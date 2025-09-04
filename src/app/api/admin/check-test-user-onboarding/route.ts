import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const testUserId = 'test.user.1756630044380@toptiermen.test';
    
    console.log('🔍 Checking onboarding status for test user:', testUserId);
    
    // Get all onboarding records for test user
    const { data: records, error } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching records:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('📊 Found records:', records);
    
    return NextResponse.json({
      userId: testUserId,
      recordCount: records?.length || 0,
      records: records || [],
      latestRecord: records?.[0] || null
    });
    
  } catch (error) {
    console.error('❌ Error in check-test-user-onboarding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
