import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    console.log('🔧 Setting up affiliate fields in profiles table...');

    // First, let's check if the columns already exist
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('affiliate_code, affiliate_status, total_referrals, active_referrals, total_earned, monthly_earnings, last_referral')
      .limit(1);

    if (!checkError && existingData && existingData.length > 0) {
      console.log('✅ Affiliate fields already exist');
      return NextResponse.json({ 
        success: true, 
        message: 'Affiliate fields already exist',
        columns: Object.keys(existingData[0])
      });
    }

    // Since we can't use exec_sql, we'll try to insert a test record to see what columns exist
    console.log('⚠️ Cannot use exec_sql, checking current table structure...');

    // Try to get all profiles to see current structure
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error checking profiles table:', profilesError);
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot access profiles table: ' + profilesError.message 
      }, { status: 500 });
    }

    console.log('📋 Current profiles table columns:', Object.keys(profiles[0] || {}));

    // Check if affiliate_code column exists
    const hasAffiliateCode = profiles[0] && 'affiliate_code' in profiles[0];
    
    if (!hasAffiliateCode) {
      console.log('❌ Affiliate fields do not exist. Manual SQL execution required.');
      return NextResponse.json({ 
        success: false, 
        error: 'Affiliate fields do not exist in the profiles table. Please run the SQL script manually in Supabase SQL Editor:\n\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(50) UNIQUE;\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT \'inactive\';\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_referrals INTEGER DEFAULT 0;\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0.00;\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_earnings DECIMAL(10,2) DEFAULT 0.00;\n' +
               'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_referral TIMESTAMP WITH TIME ZONE;',
        manualSetupRequired: true
      }, { status: 500 });
    }

    // If we get here, the columns exist, so let's update existing profiles with default codes
    console.log('✅ Affiliate fields exist, updating default codes...');

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        affiliate_code: 'DEFAULT_CODE',
        affiliate_status: 'inactive',
        total_referrals: 0,
        active_referrals: 0,
        total_earned: 0.00,
        monthly_earnings: 0.00
      })
      .is('affiliate_code', null)
      .select();

    if (updateError) {
      console.error('❌ Error updating default affiliate codes:', updateError);
    } else {
      console.log('✅ Updated default affiliate codes for', updateData?.length || 0, 'profiles');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Affiliate fields setup completed successfully',
      columns: Object.keys(profiles[0] || {})
    });

  } catch (error) {
    console.error('❌ Unexpected error in affiliate fields setup:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error: ' + (error as Error).message 
    }, { status: 500 });
  }
} 