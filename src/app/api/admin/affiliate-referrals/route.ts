import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all referrals with detailed information
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching all affiliate referrals...');

    const { data: referrals, error } = await supabaseAdmin
      .from('affiliate_referrals')
      .select(`
        *,
        affiliates!inner(
          id,
          affiliate_code,
          user_id,
          profiles!inner(
            full_name,
            email
          )
        ),
        referred_user:profiles!affiliate_referrals_referred_user_id_fkey(
          full_name,
          email
        )
      `)
      .order('referral_date', { ascending: false });

    if (error) {
      console.error('Error fetching referrals:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Format the data for easier consumption
    const formattedReferrals = referrals?.map(referral => ({
      id: referral.id,
      affiliate_id: referral.affiliate_id,
      affiliate_name: referral.affiliates.profiles.full_name,
      affiliate_email: referral.affiliates.profiles.email,
      affiliate_code: referral.affiliates.affiliate_code,
      referred_user_id: referral.referred_user_id,
      referred_user_name: referral.referred_user.full_name,
      referred_user_email: referral.referred_user.email,
      status: referral.status,
      commission_earned: referral.commission_earned,
      monthly_commission: referral.monthly_commission,
      referral_date: referral.referral_date,
      activation_date: referral.activation_date,
      last_payment_date: referral.last_payment_date,
      notes: referral.notes,
      created_at: referral.created_at
    })) || [];

    console.log(`✅ Found ${formattedReferrals.length} referrals`);

    return NextResponse.json({
      success: true,
      referrals: formattedReferrals
    });

  } catch (error) {
    console.error('Error in affiliate-referrals GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliate_id, referred_user_id, status = 'pending', notes } = body;

    console.log('🚀 Creating new referral...', { affiliate_id, referred_user_id });

    if (!affiliate_id || !referred_user_id) {
      return NextResponse.json({
        success: false,
        error: 'affiliate_id and referred_user_id are required'
      }, { status: 400 });
    }

    // Check if affiliate exists
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from('affiliates')
      .select('id, commission_rate')
      .eq('id', affiliate_id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate not found'
      }, { status: 400 });
    }

    // Check if referral already exists
    const { data: existingReferral, error: checkError } = await supabaseAdmin
      .from('affiliate_referrals')
      .select('id')
      .eq('affiliate_id', affiliate_id)
      .eq('referred_user_id', referred_user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing referral:', checkError);
      return NextResponse.json({
        success: false,
        error: checkError.message
      }, { status: 500 });
    }

    if (existingReferral) {
      return NextResponse.json({
        success: false,
        error: 'Referral already exists for this user'
      }, { status: 400 });
    }

    // Calculate monthly commission (example: 10% of subscription)
    const monthlyCommission = 10.00; // This would be calculated based on actual subscription amount

    // Create new referral
    const { data: newReferral, error: createError } = await supabaseAdmin
      .from('affiliate_referrals')
      .insert({
        affiliate_id,
        referred_user_id,
        status,
        monthly_commission: monthlyCommission,
        notes
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating referral:', createError);
      return NextResponse.json({
        success: false,
        error: createError.message
      }, { status: 500 });
    }

    console.log('✅ Referral created successfully:', newReferral.id);

    return NextResponse.json({
      success: true,
      referral: newReferral
    });

  } catch (error) {
    console.error('Error in affiliate-referrals POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Update referral
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, monthly_commission, notes } = body;

    console.log('🔄 Updating referral...', { id, status, monthly_commission });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Referral ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'active') {
        updateData.activation_date = new Date().toISOString();
      }
    }
    if (monthly_commission !== undefined) updateData.monthly_commission = monthly_commission;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedReferral, error } = await supabaseAdmin
      .from('affiliate_referrals')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating referral:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Referral updated successfully:', id);

    return NextResponse.json({
      success: true,
      referral: updatedReferral
    });

  } catch (error) {
    console.error('Error in affiliate-referrals PATCH:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete referral
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ Deleting referral...', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Referral ID is required'
      }, { status: 400 });
    }

    // Delete referral
    const { error } = await supabaseAdmin
      .from('affiliate_referrals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting referral:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Referral deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Referral deleted successfully'
    });

  } catch (error) {
    console.error('Error in affiliate-referrals DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 