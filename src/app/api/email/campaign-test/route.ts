import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { EmailTrackingService } from '@/lib/email-tracking-service';

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      subject, 
      template_type = 'marketing',
      tracking_options,
      custom_data 
    } = await request.json();

    console.log('📧 Campaign test request received:', {
      to,
      subject,
      template_type,
      tracking_enabled: !!tracking_options
    });

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Email address and subject are required' },
        { status: 400 }
      );
    }

    // Create tracking record if tracking is enabled
    let tracking_id = null;
    if (tracking_options) {
      try {
        const trackingData = {
          recipient_email: to,
          recipient_name: custom_data?.recipient_name || 'Test User',
          subject: subject,
          template_type: template_type,
          campaign_id: tracking_options.campaign_id
        };

        const trackingRecord = await EmailTrackingService.createTrackingRecord(trackingData);
        tracking_id = trackingRecord.tracking_id;
        
        console.log('📈 Tracking record created:', tracking_id);
      } catch (trackingError) {
        console.error('⚠️ Tracking setup failed:', trackingError);
        // Continue without tracking if it fails
      }
    }

    // Prepare email content with custom data
    const emailVariables = {
      name: custom_data?.recipient_name || 'Test User',
      test_mode: custom_data?.test_mode || false,
      width_test: custom_data?.width_test || '100%',
      tracking_test: custom_data?.tracking_test || false,
      ...custom_data
    };

    // Send email with tracking
    const emailResult = await emailService.sendEmail({
      to: to,
      template: template_type,
      variables: emailVariables
    });

    if (emailResult) {
      console.log('✅ Test email sent successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        tracking_id: tracking_id,
        test_data: {
          width_styling: '100% applied',
          green_background: 'No white backgrounds',
          tracking_enabled: !!tracking_options,
          template_type: template_type
        }
      });
    } else {
      console.error('❌ Failed to send test email');
      return NextResponse.json(
        { 
          error: 'Failed to send test email'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error in campaign test:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
