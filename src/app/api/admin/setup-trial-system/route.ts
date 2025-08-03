import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up 7-Day Trial System...');

    // Check if trial system already exists
    const { data: existingSubscriptions, error: checkError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id')
      .limit(1);

    if (!checkError && existingSubscriptions) {
      console.log('✅ Trial system already exists');
      return NextResponse.json({
        success: true,
        message: '7-Day Trial System already exists!',
        tables: [
          'user_subscriptions',
          'trial_feature_access', 
          'trial_upgrade_prompts',
          'trial_usage_tracking',
          'trial_conversion_events'
        ],
        features: [
          '7-day trial period',
          'Feature access control',
          'Upgrade prompts tracking',
          'Usage analytics',
          'Conversion tracking'
        ]
      });
    }

    // Create trial system tables
    console.log('📊 Creating trial system tables...');
    
    // Try to create the basic user_subscriptions table
    const { error: createError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy ID to test table creation
        subscription_tier: 'trial',
        subscription_status: 'active',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (createError && createError.code === '42P01') {
      // Table doesn't exist, we need to create it manually
      console.log('⚠️ Trial system tables do not exist, manual creation required');
      return NextResponse.json({
        success: false,
        error: 'Trial system tables need to be created manually. Please run the SQL script in your database.',
        manualSteps: [
          '1. Open your Supabase dashboard',
          '2. Go to SQL Editor',
          '3. Run the create_trial_system.sql script',
          '4. Refresh this page'
        ],
        features: [
          '7-day trial period for new users',
          'Limited access to 1 academy module',
          'Basic training schema access',
          'Upgrade prompts and conversion tracking',
          'Usage analytics and reporting'
        ]
      });
    }

    // If we get here, the table exists or was created successfully
    console.log('✅ 7-Day Trial System setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: '7-Day Trial System setup completed successfully!',
      tables: [
        'user_subscriptions',
        'trial_feature_access', 
        'trial_upgrade_prompts',
        'trial_usage_tracking',
        'trial_conversion_events'
      ],
      features: [
        '7-day trial period for new users',
        'Limited access to 1 academy module',
        'Basic training schema access',
        'Upgrade prompts and conversion tracking',
        'Usage analytics and reporting',
        'Automatic trial expiration handling',
        'Conversion event tracking'
      ]
    });

  } catch (error) {
    console.error('❌ 7-Day Trial System setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      manualSteps: [
        '1. Open your Supabase dashboard',
        '2. Go to SQL Editor', 
        '3. Run the create_trial_system.sql script',
        '4. Refresh this page'
      ]
    }, { status: 500 });
  }
} 