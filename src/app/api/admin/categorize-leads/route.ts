import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Categorizing leads into batches...');

    // Get all leads ordered by creation date
    console.log('👥 Fetching all leads...');
    
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, created_at')
      .like('email', '%@%')
      .order('created_at', { ascending: true });

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
        details: leadsError.message
      }, { status: 500 });
    }

    console.log(`📊 Found ${leads?.length || 0} leads to categorize`);

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads found to categorize',
        leads: []
      });
    }

    // Categorize leads into batches based on creation date
    console.log('🏷️ Categorizing leads into batches...');
    
    const batchAssignments = leads.map((lead, index) => {
      // First 10 leads = Batch 1 (original prelaunch leads)
      // Next leads = Batch 2, 3, etc.
      const batchNumber = Math.floor(index / 10) + 1;
      
      return {
        lead_id: lead.id,
        email: lead.email,
        full_name: lead.full_name,
        created_at: lead.created_at,
        batch_number: batchNumber,
        batch_name: `Batch ${batchNumber}`,
        campaign_1_sent: batchNumber === 1, // Batch 1 already got Campaign 1
        campaign_2_sent: false,
        campaign_3_sent: false,
        next_campaign: batchNumber === 1 ? 'Campaign 2 (3 september)' : 'Campaign 1 (direct)',
        status: batchNumber === 1 ? 'Campaign 1 completed' : 'Waiting for Campaign 1'
      };
    });

    // Group by batch for overview
    const batchOverview = batchAssignments.reduce((acc, lead) => {
      const batchNum = lead.batch_number;
      if (!acc[batchNum]) {
        acc[batchNum] = {
          batch_number: batchNum,
          batch_name: `Batch ${batchNum}`,
          lead_count: 0,
          leads: [],
          campaign_1_sent: 0,
          campaign_2_sent: 0,
          campaign_3_sent: 0
        };
      }
      
      acc[batchNum].lead_count++;
      acc[batchNum].leads.push(lead);
      if (lead.campaign_1_sent) acc[batchNum].campaign_1_sent++;
      if (lead.campaign_2_sent) acc[batchNum].campaign_2_sent++;
      if (lead.campaign_3_sent) acc[batchNum].campaign_3_sent++;
      
      return acc;
    }, {} as Record<number, any>);

    console.log('✅ Lead categorization completed');

    return NextResponse.json({
      success: true,
      message: 'Lead categorization completed',
      totalLeads: leads.length,
      batchAssignments: batchAssignments,
      batchOverview: Object.values(batchOverview),
      summary: {
        totalBatches: Object.keys(batchOverview).length,
        batch1Leads: batchOverview[1]?.lead_count || 0,
        batch2Leads: batchOverview[2]?.lead_count || 0,
        batch3Leads: batchOverview[3]?.lead_count || 0,
        readyForCampaign2: batchOverview[1]?.lead_count || 0,
        readyForCampaign1: (batchOverview[2]?.lead_count || 0) + (batchOverview[3]?.lead_count || 0)
      }
    });

  } catch (error) {
    console.error('❌ Error in categorize leads:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
