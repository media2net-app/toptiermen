import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Default template status (all enabled by default)
const DEFAULT_TEMPLATE_STATUS = {
  'welcome': true,
  'password-reset': true,
  'account-credentials': true,
  'sneak-preview': true,
  'onboarding-welcome': true,
  'challenge-reminder': true,
  'badge-earned': true,
  'newsletter': true
};

export async function GET() {
  try {
    console.log('📧 Fetching email template status...');

    // Get template status from database
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .select('email_template_status')
      .eq('key', 'email_template_status')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching template status:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch template status' 
      }, { status: 500 });
    }

    const templateStatus = settings?.email_template_status || DEFAULT_TEMPLATE_STATUS;

    console.log('✅ Template status fetched:', Object.keys(templateStatus).length, 'templates');

    return NextResponse.json({
      success: true,
      status: templateStatus
    });

  } catch (error) {
    console.error('❌ Error in email-template-status GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, enabled } = await request.json();

    console.log('📧 Updating email template status:', { templateId, enabled });

    if (!templateId || typeof enabled !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'Template ID and enabled status are required' 
      }, { status: 400 });
    }

    // Get current template status
    const { data: settings, error: fetchError } = await supabase
      .from('platform_settings')
      .select('email_template_status')
      .eq('key', 'email_template_status')
      .single();

    let currentStatus = DEFAULT_TEMPLATE_STATUS;
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching current status:', fetchError);
    } else if (settings?.email_template_status) {
      currentStatus = settings.email_template_status;
    }

    // Update the specific template status
    const updatedStatus = {
      ...currentStatus,
      [templateId]: enabled
    };

    // Save to database
    const { error: upsertError } = await supabase
      .from('platform_settings')
      .upsert({
        key: 'email_template_status',
        email_template_status: updatedStatus,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('❌ Error saving template status:', upsertError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save template status' 
      }, { status: 500 });
    }

    console.log('✅ Template status updated:', templateId, '=', enabled);

    return NextResponse.json({
      success: true,
      message: `Template ${templateId} ${enabled ? 'enabled' : 'disabled'} successfully`,
      status: updatedStatus
    });

  } catch (error) {
    console.error('❌ Error in email-template-status POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
