import { NextRequest, NextResponse } from 'next/server';
import { getMollieServer } from '@/lib/mollie';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    const mollieClient = getMollieServer();
    if (!mollieClient) {
      return NextResponse.json(
        { success: false, error: 'Mollie not configured' },
        { status: 500 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all payments for the period
    const payments = await mollieClient.payments.list({
      limit: 250, // Get maximum payments
      from: startDate.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0]
    });

    // Calculate metrics
    const totalPayments = payments.length;
    const paidPayments = payments.filter(payment => payment.status === 'paid');
    const failedPayments = payments.filter(payment => payment.status === 'failed');
    const pendingPayments = payments.filter(payment => payment.status === 'pending');

    // Calculate revenue
    const totalRevenue = paidPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount.value);
    }, 0);

    // Calculate conversion rate
    const conversionRate = totalPayments > 0 ? (paidPayments.length / totalPayments) * 100 : 0;

    // Group by payment method
    const paymentMethods = paidPayments.reduce((acc, payment) => {
      const method = payment.method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent transactions
    const recentTransactions = paidPayments
      .slice(0, 10)
      .map(payment => ({
        id: payment.id,
        amount: payment.amount.value,
        currency: payment.amount.currency,
        method: payment.method,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt
      }));

    // Calculate daily revenue for the last 7 days
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPayments = paidPayments.filter(payment => {
        const paymentDate = new Date(payment.paidAt || payment.createdAt);
        return paymentDate.toISOString().split('T')[0] === dateStr;
      });
      
      const dayRevenue = dayPayments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount.value);
      }, 0);
      
      dailyRevenue.push({
        date: dateStr,
        revenue: dayRevenue,
        transactions: dayPayments.length
      });
    }

    const financeMetrics = {
      period,
      totalRevenue: totalRevenue.toFixed(2),
      totalTransactions: totalPayments,
      successfulTransactions: paidPayments.length,
      failedTransactions: failedPayments.length,
      pendingTransactions: pendingPayments.length,
      conversionRate: conversionRate.toFixed(1),
      averageTransactionValue: paidPayments.length > 0 ? (totalRevenue / paidPayments.length).toFixed(2) : '0.00',
      paymentMethods,
      recentTransactions,
      dailyRevenue,
      currency: 'EUR',
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: financeMetrics
    });

  } catch (error) {
    console.error('Error fetching Mollie finance metrics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch finance metrics'
      },
      { status: 500 }
    );
  }
}
