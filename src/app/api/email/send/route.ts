import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, template, variables, userId } = await request.json();

    if (!email || !template) {
      return NextResponse.json(
        { error: 'Email and template are required' },
        { status: 400 }
      );
    }

    // Verify user exists if userId is provided
    if (userId) {
      const { data: user, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Use user data if not provided in variables
      if (!variables.name && user.full_name) {
        variables.name = user.full_name;
      }
    }

    const success = await emailService.sendEmail({
      to: email,
      template,
      variables: variables || {},
    });

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 