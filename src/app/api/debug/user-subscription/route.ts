import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    // Get user profile data - first check what columns exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found', details: profileError }, { status: 404 });
    }

    // Also check user_subscriptions table
    const { data: userSub, error: userSubError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    // Map package_type to tier for access control
    const packageType = profile.package_type || 'Basic Tier';
    let tier = 'basic';
    
    if (packageType === 'Premium Tier') {
      tier = 'premium';
    } else if (packageType === 'Lifetime Tier') {
      tier = 'lifetime';
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        package_type: profile.package_type,
        status: profile.status,
        mapped_tier: tier
      },
      user_subscription: userSub || null,
      user_subscription_error: userSubError?.message || null,
      computed_access: {
        hasTrainingAccess: tier === 'premium' || tier === 'lifetime',
        hasNutritionAccess: tier === 'premium' || tier === 'lifetime',
        isBasic: tier === 'basic'
      }
    });
  } catch (error) {
    console.error('Debug subscription error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
