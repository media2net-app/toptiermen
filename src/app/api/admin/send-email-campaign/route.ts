import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stepId, action } = body;

    if (!stepId || !action) {
      return NextResponse.json({ 
        error: 'Step ID and action are required' 
      }, { status: 400 });
    }

    if (action === 'send_test') {
      // Send test email to admin
      return await sendTestEmail(stepId);
    } else if (action === 'send_to_leads') {
      // Send email to all active leads
      return await sendToLeads(stepId);
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "send_test" or "send_to_leads"' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in send-email-campaign:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function sendTestEmail(stepId: string) {
  try {
    // Get email step details
    const { data: step, error: stepError } = await supabaseAdmin
      .from('email_campaign_steps')
      .select('*')
      .eq('id', stepId)
      .single();

    if (stepError || !step) {
      return NextResponse.json({ 
        error: 'Email step not found' 
      }, { status: 404 });
    }

    // For now, just return success (email sending will be implemented later)
    console.log('Test email would be sent for step:', step.name);
    
    return NextResponse.json({
      success: true,
      message: `Test email prepared for step: ${step.name}`,
      step: {
        name: step.name,
        subject: step.subject,
        content: step.content
      }
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email' 
    }, { status: 500 });
  }
}

async function sendToLeads(stepId: string) {
  try {
    // Get email step details
    const { data: step, error: stepError } = await supabaseAdmin
      .from('email_campaign_steps')
      .select('*')
      .eq('id', stepId)
      .single();

    if (stepError || !step) {
      return NextResponse.json({ 
        error: 'Email step not found' 
      }, { status: 404 });
    }

    // Get all active leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('prelaunch_emails')
      .select('*')
      .eq('status', 'active');

    if (leadsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch leads' 
      }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active leads found to send emails to',
        sentCount: 0
      });
    }

    // For now, just return success (email sending will be implemented later)
    console.log(`Would send email to ${leads.length} leads for step: ${step.name}`);
    
    return NextResponse.json({
      success: true,
      message: `Email campaign prepared for ${leads.length} leads`,
      step: {
        name: step.name,
        subject: step.subject
      },
      sentCount: leads.length,
      leads: leads.map(lead => ({
        email: lead.email,
        name: lead.name || 'Lead',
        interestLevel: lead.interest_level || 'Medium'
      }))
    });

  } catch (error) {
    console.error('Error sending to leads:', error);
    return NextResponse.json({ 
      error: 'Failed to send emails to leads' 
    }, { status: 500 });
  }
} 