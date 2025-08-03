import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating sample affiliate data...');

    // First, get existing users from profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .limit(10);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No users found in profiles table'
      }, { status: 400 });
    }

    console.log(`📊 Found ${profiles.length} users to create affiliates for`);

    const createdAffiliates: any[] = [];
    const createdReferrals: any[] = [];

    // Create affiliates for each user
    for (let i = 0; i < Math.min(profiles.length, 5); i++) {
      const profile = profiles[i];
      
      // Generate unique affiliate code
      const affiliateCode = `AFF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Create affiliate
      const { data: affiliate, error: affiliateError } = await supabaseAdmin
        .from('affiliates')
        .insert({
          user_id: profile.id,
          affiliate_code: affiliateCode,
          status: i < 3 ? 'active' : 'inactive',
          commission_rate: 10.00 + (i * 2), // Different commission rates
          notes: `Sample affiliate for ${profile.full_name}`
        })
        .select('*')
        .single();

      if (affiliateError) {
        console.error(`Error creating affiliate for ${profile.full_name}:`, affiliateError);
        continue;
      }

      createdAffiliates.push(affiliate);

      // Create some referrals for this affiliate
      const numReferrals = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numReferrals; j++) {
        // Find a different user to refer
        const referredUser = profiles.find(p => p.id !== profile.id);
        if (!referredUser) continue;

        const { data: referral, error: referralError } = await supabaseAdmin
          .from('affiliate_referrals')
          .insert({
            affiliate_id: affiliate.id,
            referred_user_id: referredUser.id,
            status: j < 2 ? 'active' : 'pending',
            commission_earned: j < 2 ? Math.floor(Math.random() * 50) + 10 : 0,
            monthly_commission: j < 2 ? Math.floor(Math.random() * 15) + 5 : 0,
            notes: `Sample referral ${j + 1} for ${profile.full_name}`
          })
          .select('*')
          .single();

        if (!referralError && referral) {
          createdReferrals.push(referral);
        }
      }
    }

    // Create some commission payments
    const createdPayments: any[] = [];
    for (const affiliate of createdAffiliates) {
      if (affiliate.status === 'active') {
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from('affiliate_commission_payments')
          .insert({
            affiliate_id: affiliate.id,
            amount: Math.floor(Math.random() * 100) + 20,
            payment_type: 'monthly',
            status: 'paid',
            payment_date: new Date().toISOString(),
            processed_date: new Date().toISOString(),
            notes: `Sample payment for ${affiliate.affiliate_code}`
          })
          .select('*')
          .single();

        if (!paymentError && payment) {
          createdPayments.push(payment);
        }
      }
    }

    console.log(`✅ Created ${createdAffiliates.length} affiliates, ${createdReferrals.length} referrals, and ${createdPayments.length} payments`);

    return NextResponse.json({
      success: true,
      message: 'Sample affiliate data created successfully',
      data: {
        affiliates: createdAffiliates.length,
        referrals: createdReferrals.length,
        payments: createdPayments.length
      }
    });

  } catch (error) {
    console.error('❌ Error creating sample affiliate data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 