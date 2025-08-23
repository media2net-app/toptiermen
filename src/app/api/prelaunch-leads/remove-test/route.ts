import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  try {
    console.log('🗑️ Removing test lead: chiel@media2net.nl');

    // First, let's check if the lead exists
    const { data: existingLead, error: checkError } = await supabase
      .from('prelaunch_leads')
      .select('*')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (checkError) {
      console.error('❌ Error checking lead:', checkError);
      return NextResponse.json(
        { success: false, error: 'Lead not found or error checking' },
        { status: 404 }
      );
    }

    console.log('📋 Found lead to delete:', existingLead);

    // Now delete the lead
    const { data: deletedLead, error: deleteError } = await supabase
      .from('prelaunch_leads')
      .delete()
      .eq('email', 'chiel@media2net.nl')
      .select()
      .single();

    if (deleteError) {
      console.error('❌ Error deleting lead:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    console.log('✅ Lead deleted successfully:', deletedLead);

    // Get updated count
    const { data: remainingLeads, error: countError } = await supabase
      .from('prelaunch_leads')
      .select('*');

    if (countError) {
      console.error('❌ Error counting remaining leads:', countError);
    }

    return NextResponse.json({
      success: true,
      message: 'Test lead removed successfully',
      deletedLead,
      remainingLeadsCount: remainingLeads?.length || 0,
      previousCount: (remainingLeads?.length || 0) + 1
    });

  } catch (error) {
    console.error('❌ Error in remove test API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
