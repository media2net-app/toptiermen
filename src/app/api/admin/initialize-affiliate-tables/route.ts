import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Initializing affiliate tables...');

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Create affiliates table
    const { error: createAffiliatesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS affiliates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          affiliate_code VARCHAR(50) NOT NULL UNIQUE,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
          total_referrals INTEGER DEFAULT 0,
          active_referrals INTEGER DEFAULT 0,
          total_earned DECIMAL(10,2) DEFAULT 0.00,
          monthly_earnings DECIMAL(10,2) DEFAULT 0.00,
          last_referral TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (createAffiliatesError) {
      console.error('Error creating affiliates table:', createAffiliatesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create affiliates table',
        details: createAffiliatesError 
      });
    }

    // Create affiliate_referrals table
    const { error: createReferralsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS affiliate_referrals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
          referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
          commission_earned DECIMAL(10,2) DEFAULT 0.00,
          monthly_commission DECIMAL(10,2) DEFAULT 0.00,
          last_payment TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(referred_user_id)
        );
      `
    });

    if (createReferralsError) {
      console.error('Error creating affiliate_referrals table:', createReferralsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create affiliate_referrals table',
        details: createReferralsError 
      });
    }

    // Create indexes
    const { error: createIndexesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
        CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
        CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
      `
    });

    if (createIndexesError) {
      console.error('Error creating indexes:', createIndexesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create indexes',
        details: createIndexesError 
      });
    }

    // Enable RLS
    const { error: enableRLSError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
        ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
      `
    });

    if (enableRLSError) {
      console.error('Error enabling RLS:', enableRLSError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to enable RLS',
        details: enableRLSError 
      });
    }

    // Migrate existing data from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, affiliate_code, affiliate_status, total_referrals, active_referrals, total_earned, monthly_earnings, last_referral')
      .not('affiliate_code', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles for migration:', profilesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch profiles for migration',
        details: profilesError 
      });
    }

    let migratedCount = 0;
    if (profiles && profiles.length > 0) {
      console.log('📊 Migrating', profiles.length, 'affiliate records...');
      
      for (const profile of profiles) {
        const { error: insertError } = await supabase
          .from('affiliates')
          .insert({
            user_id: profile.id,
            affiliate_code: profile.affiliate_code,
            status: profile.affiliate_status || 'active',
            total_referrals: profile.total_referrals || 0,
            active_referrals: profile.active_referrals || 0,
            total_earned: profile.total_earned || 0,
            monthly_earnings: profile.monthly_earnings || 0,
            last_referral: profile.last_referral
          })
          .select();

        if (insertError && !insertError.message.includes('duplicate key')) {
          console.error('Error inserting affiliate:', insertError);
        } else {
          migratedCount++;
        }
      }
    }

    console.log('✅ Affiliate tables initialized successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Affiliate tables initialized successfully',
      migratedCount,
      totalProfiles: profiles?.length || 0
    });

  } catch (error) {
    console.error('Error initializing affiliate tables:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error 
    }, { status: 500 });
  }
} 