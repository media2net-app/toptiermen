import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source = 'Social Media', package: packageType = 'BASIC', notes } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('📧 Adding prelaunch email:', { email, name, source, package: packageType, notes });

    // Insert the email into the prelaunch_emails table
    const { data, error } = await supabaseAdmin
      .from('prelaunch_emails')
      .upsert({
        email,
        name,
        source,
        status: 'active',
        package: packageType,
        notes,
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding prelaunch email:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log('✅ Prelaunch email added successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Email added to prelaunch list successfully',
      data
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 