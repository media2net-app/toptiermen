import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json();

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe secret key is required' },
        { status: 400 }
      );
    }

    // Create a test Stripe instance
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-06-30.basil',
    });

    // Test the connection by making a simple API call
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      account: {
        id: account.id,
        business_type: account.business_type,
        country: account.country,
        default_currency: account.default_currency,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      }
    });

  } catch (error: any) {
    console.error('Stripe connection test failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Stripe connection failed',
        details: error.message 
      },
      { status: 400 }
    );
  }
} 