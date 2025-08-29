import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { leads, source = 'manual' } = await request.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No leads provided or invalid format'
      }, { status: 400 });
    }

    console.log(`📥 Importing ${leads.length} leads...`);

    const importLog: {
      import_date: string;
      total_leads: number;
      successful_imports: number;
      failed_imports: number;
      error_details: Array<{row: number; email: string; error: string}>;
    } = {
      import_date: new Date().toISOString(),
      total_leads: leads.length,
      successful_imports: 0,
      failed_imports: 0,
      error_details: []
    };

    const processedLeads: Array<{
      email: string;
      first_name: string;
      last_name: string;
      full_name: string;
      source: string;
      status: string;
    }> = [];
    const errors: string[] = [];

    // Process each lead
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      
      try {
        // Validate email
        if (!lead.email || !lead.email.includes('@')) {
          throw new Error('Invalid email address');
        }

        // Clean and validate names
        let firstName = lead.first_name || lead.firstName || '';
        let lastName = lead.last_name || lead.lastName || '';
        let fullName = lead.full_name || lead.fullName || '';

        // If full name is provided but no first/last, try to split
        if (fullName && !firstName && !lastName) {
          const nameParts = fullName.trim().split(' ');
          if (nameParts.length >= 2) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
          } else {
            firstName = fullName;
          }
        }

        // Clean names (remove extra spaces, capitalize)
        firstName = firstName.trim().replace(/\s+/g, ' ');
        lastName = lastName.trim().replace(/\s+/g, ' ');
        
        // Capitalize first letter of each name
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

        const processedLead = {
          email: lead.email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          source: source,
          status: 'active'
        };

        processedLeads.push(processedLead);
        importLog.successful_imports++;

      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        importLog.failed_imports++;
        importLog.error_details.push({
          row: i + 1,
          email: lead.email,
          error: errorMsg
        });
      }
    }

    // Insert leads into database
    if (processedLeads.length > 0) {
      const { data: insertedLeads, error: insertError } = await supabaseAdmin
        .from('leads')
        .insert(processedLeads)
        .select('id, email, first_name, last_name, full_name');

      if (insertError) {
        console.error('❌ Error inserting leads:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to insert leads into database',
          details: insertError.message
        }, { status: 500 });
      }

      console.log(`✅ Successfully imported ${insertedLeads?.length || 0} leads`);
    }

    // Save import log
    await supabaseAdmin
      .from('lead_import_logs')
      .insert([importLog]);

    return NextResponse.json({
      success: true,
      message: `Lead import completed`,
      results: {
        total: leads.length,
        successful: importLog.successful_imports,
        failed: importLog.failed_imports,
        errors: errors,
        imported_leads: processedLeads
      }
    });

  } catch (error) {
    console.error('❌ Error in lead import API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
