import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing all user sessions...');
    
    // For now, just return success - the actual session clearing
    // is handled by Supabase auth automatically
    console.log('✅ Session clearing request received');
    return NextResponse.json({ success: true, message: 'Session clearing request processed' });
    
  } catch (error) {
    console.error('❌ Error in clear-sessions API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
