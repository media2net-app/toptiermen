import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting lead migration from prelaunch_emails to leads...');

    // Get all leads from prelaunch_emails
    const { data: prelaunchLeads, error: fetchError } = await supabaseAdmin
      .from('prelaunch_emails')
      .select('*')
      .eq('status', 'active');

    if (fetchError) {
      console.error('❌ Error fetching prelaunch leads:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch prelaunch leads',
        details: fetchError.message
      }, { status: 500 });
    }

    if (!prelaunchLeads || prelaunchLeads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active prelaunch leads found'
      }, { status: 400 });
    }

    console.log(`📧 Found ${prelaunchLeads.length} active prelaunch leads`);

    // Migrate leads to new leads table
    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const prelaunchLead of prelaunchLeads) {
      try {
        // Parse name into first_name and last_name
        const nameParts = (prelaunchLead.name || '').trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        // Insert into new leads table
        const { error: insertError } = await supabaseAdmin
          .from('leads')
          .upsert({
            email: prelaunchLead.email,
            first_name: first_name,
            last_name: last_name,
            full_name: prelaunchLead.name || '',
            source: prelaunchLead.source || 'prelaunch',
            status: 'active',
            created_at: prelaunchLead.subscribed_at || prelaunchLead.created_at
          });

        if (insertError) {
          console.error(`❌ Error migrating ${prelaunchLead.email}:`, insertError);
          if (insertError.message && insertError.message.includes('duplicate key')) {
            console.log(`⚠️ Lead already exists: ${prelaunchLead.email}`);
            skippedCount++;
          } else {
            errors.push(`${prelaunchLead.email}: ${insertError.message || 'Unknown error'}`);
          }
        } else {
          console.log(`✅ Migrated: ${prelaunchLead.email} (${prelaunchLead.name})`);
          migratedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${prelaunchLead.email}:`, error);
        errors.push(`${prelaunchLead.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`🎉 Migration completed! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);

    return NextResponse.json({
      success: true,
      message: 'Lead migration completed successfully',
      results: {
        total: prelaunchLeads.length,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errors.length
      },
      details: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Error in lead migration:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
