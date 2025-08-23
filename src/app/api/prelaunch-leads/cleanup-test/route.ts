import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning up test leads...');

    // Delete test leads
    const { data: deletedData, error: deleteError } = await supabase
      .from('prelaunch_leads')
      .delete()
      .in('email', ['chiel@media2net.nl', 'test@test.com', 'admin@test.com'])
      .select();

    if (deleteError) {
      console.error('❌ Error deleting test leads:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete test leads' },
        { status: 500 }
      );
    }

    console.log('✅ Test leads deleted:', deletedData);

    // Get updated leads count
    const { data: remainingLeads, error: countError } = await supabase
      .from('prelaunch_leads')
      .select('*');

    if (countError) {
      console.error('❌ Error counting remaining leads:', countError);
    } else {
      console.log('📊 Remaining leads count:', remainingLeads?.length || 0);
    }

    return NextResponse.json({
      success: true,
      message: 'Test leads cleaned up successfully',
      deletedLeads: deletedData,
      remainingLeadsCount: remainingLeads?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in cleanup API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
