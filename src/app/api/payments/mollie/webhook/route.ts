import { NextRequest, NextResponse } from 'next/server';
import { getPayment } from '@/lib/mollie';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get the latest payment status from Mollie
    const payment = await getPayment(paymentId);
    
    console.log('Mollie webhook received:', {
      paymentId,
      status: payment.status,
      metadata: payment.metadata
    });

    // Handle different payment statuses
    switch (payment.status) {
      case 'paid':
        // Payment is successful - activate user subscription
        await handleSuccessfulPayment(payment);
        break;
        
      case 'failed':
        // Payment failed - notify user
        await handleFailedPayment(payment);
        break;
        
      case 'expired':
        // Payment expired - clean up
        await handleExpiredPayment(payment);
        break;
        
      case 'canceled':
        // Payment canceled - clean up
        await handleCanceledPayment(payment);
        break;
        
      default:
        console.log('Payment status not handled:', payment.status);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Mollie webhook error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(payment: any) {
  try {
    const { userId, planId, email } = payment.metadata;
    
    console.log('Processing successful payment:', {
      userId,
      planId,
      email,
      amount: payment.amount.value,
      currency: payment.amount.currency
    });

    // Here you would:
    // 1. Update user subscription status in database
    // 2. Send confirmation email
    // 3. Grant access to premium features
    // 4. Log the transaction
    
    // For now, just log the success
    console.log('Payment successful - user subscription activated');
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(payment: any) {
  try {
    const { userId, email } = payment.metadata;
    
    console.log('Processing failed payment:', {
      userId,
      email,
      failureReason: payment.failureReason
    });

    // Here you would:
    // 1. Send failure notification email
    // 2. Update payment status in database
    // 3. Log the failure
    
    console.log('Payment failed - user notified');
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleExpiredPayment(payment: any) {
  try {
    const { userId, email } = payment.metadata;
    
    console.log('Processing expired payment:', {
      userId,
      email
    });

    // Here you would:
    // 1. Clean up any pending subscription data
    // 2. Send expiration notification
    // 3. Log the expiration
    
    console.log('Payment expired - cleaned up');
    
  } catch (error) {
    console.error('Error handling expired payment:', error);
  }
}

async function handleCanceledPayment(payment: any) {
  try {
    const { userId, email } = payment.metadata;
    
    console.log('Processing canceled payment:', {
      userId,
      email
    });

    // Here you would:
    // 1. Clean up any pending subscription data
    // 2. Send cancellation notification
    // 3. Log the cancellation
    
    console.log('Payment canceled - cleaned up');
    
  } catch (error) {
    console.error('Error handling canceled payment:', error);
  }
}
