import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all affiliates with detailed information
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching all affiliates...');

    const { data: affiliates, error } = await supabaseAdmin
      .from('affiliate_dashboard')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching affiliates:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log(`✅ Found ${affiliates?.length || 0} affiliates`);

    return NextResponse.json({
      success: true,
      affiliates: affiliates || []
    });

  } catch (error) {
    console.error('Error in affiliates GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new affiliate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, affiliate_code, commission_rate = 10.00, notes } = body;

    console.log('🚀 Creating new affiliate...', { user_id, affiliate_code });

    if (!user_id || !affiliate_code) {
      return NextResponse.json({
        success: false,
        error: 'user_id and affiliate_code are required'
      }, { status: 400 });
    }

    // Check if user already has an affiliate account
    const { data: existingAffiliate, error: checkError } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing affiliate:', checkError);
      return NextResponse.json({
        success: false,
        error: checkError.message
      }, { status: 500 });
    }

    if (existingAffiliate) {
      return NextResponse.json({
        success: false,
        error: 'User already has an affiliate account'
      }, { status: 400 });
    }

    // Check if affiliate code is unique
    const { data: existingCode, error: codeError } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliate_code)
      .single();

    if (codeError && codeError.code !== 'PGRST116') {
      console.error('Error checking affiliate code:', codeError);
      return NextResponse.json({
        success: false,
        error: codeError.message
      }, { status: 500 });
    }

    if (existingCode) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate code already exists'
      }, { status: 400 });
    }

    // Create new affiliate
    const { data: newAffiliate, error: createError } = await supabaseAdmin
      .from('affiliates')
      .insert({
        user_id,
        affiliate_code,
        commission_rate,
        notes,
        status: 'active'
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating affiliate:', createError);
      return NextResponse.json({
        success: false,
        error: createError.message
      }, { status: 500 });
    }

    console.log('✅ Affiliate created successfully:', newAffiliate.id);

    return NextResponse.json({
      success: true,
      affiliate: newAffiliate
    });

  } catch (error) {
    console.error('Error in affiliates POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Update affiliate
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, commission_rate, notes } = body;

    console.log('🔄 Updating affiliate...', { id, status, commission_rate });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (commission_rate !== undefined) updateData.commission_rate = commission_rate;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedAffiliate, error } = await supabaseAdmin
      .from('affiliates')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating affiliate:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Affiliate updated successfully:', id);

    return NextResponse.json({
      success: true,
      affiliate: updatedAffiliate
    });

  } catch (error) {
    console.error('Error in affiliates PATCH:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete affiliate
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ Deleting affiliate...', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate ID is required'
      }, { status: 400 });
    }

    // Check if affiliate has any referrals
    const { data: referrals, error: referralsError } = await supabaseAdmin
      .from('affiliate_referrals')
      .select('id')
      .eq('affiliate_id', id);

    if (referralsError) {
      console.error('Error checking referrals:', referralsError);
      return NextResponse.json({
        success: false,
        error: referralsError.message
      }, { status: 500 });
    }

    if (referrals && referrals.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete affiliate with existing referrals'
      }, { status: 400 });
    }

    // Delete affiliate
    const { error } = await supabaseAdmin
      .from('affiliates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting affiliate:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Affiliate deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Affiliate deleted successfully'
    });

  } catch (error) {
    console.error('Error in affiliates DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 