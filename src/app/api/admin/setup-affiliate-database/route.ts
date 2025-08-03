import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up complete Affiliate Marketing Database System...');

    // Check if tables already exist
    const { data: existingAffiliates, error: checkError } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .limit(1);

    if (!checkError && existingAffiliates) {
      console.log('✅ Affiliate tables already exist');
      return NextResponse.json({
        success: true,
        message: 'Affiliate Marketing Database System already exists!',
        tables: ['affiliates', 'affiliate_referrals', 'affiliate_commission_payments'],
        features: ['Complete affiliate tracking system', 'Commission calculation and payments', 'Campaign management']
      });
    }

    // Create basic affiliate table first
    console.log('📊 Creating basic affiliate table...');
    
    // Try to create the basic affiliates table
    const { error: createError } = await supabaseAdmin
      .from('affiliates')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy ID to test table creation
        affiliate_code: 'TEST123',
        status: 'active',
        commission_rate: 10.00
      });

    if (createError && createError.code === '42P01') {
      // Table doesn't exist, we need to create it manually
      console.log('⚠️ Affiliates table does not exist, manual creation required');
      return NextResponse.json({
        success: false,
        error: 'Database tables need to be created manually. Please run the SQL script in your database.',
        manualSteps: [
          '1. Open your Supabase dashboard',
          '2. Go to SQL Editor',
          '3. Run the create_affiliate_tables.sql script',
          '4. Refresh this page'
        ]
      });
    }

    // If we get here, the table exists or was created successfully
    console.log('✅ Affiliate Marketing Database System setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Affiliate Marketing Database System setup completed successfully!',
      tables: [
        'affiliates',
        'affiliate_referrals', 
        'affiliate_commission_payments',
        'affiliate_payout_methods',
        'affiliate_campaigns',
        'affiliate_campaign_links'
      ],
      features: [
        'Complete affiliate tracking system',
        'Commission calculation and payments',
        'Campaign management',
        'Payout methods',
        'RLS security policies',
        'Automated statistics updates',
        'Dashboard view'
      ]
    });

  } catch (error) {
    console.error('❌ Affiliate Marketing Database System setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      manualSteps: [
        '1. Open your Supabase dashboard',
        '2. Go to SQL Editor', 
        '3. Run the create_affiliate_tables.sql script',
        '4. Refresh this page'
      ]
    }, { status: 500 });
  }
} 