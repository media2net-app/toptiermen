import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function getMollieKey() {
  return process.env.MOLLIE_API_KEY || process.env.MOLLIE_LIVE_KEY || process.env.MOLLIE_TEST_KEY || '';
}

function toNumber(val?: any): number {
  const n = typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : 0;
  return isFinite(n) ? n : 0;
}

async function fetchPayment(paymentId: string) {
  const key = getMollieKey();
  if (!key) throw new Error('Missing MOLLIE_API_KEY');
  const res = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mollie fetch payment failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    // Mollie sends application/x-www-form-urlencoded by default (id=<paymentId>)
    let paymentId: string | null = null;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      paymentId = (form.get('id') as string) || null;
    } else if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      paymentId = body?.id || body?.paymentId || null;
    } else {
      // Fallback: try query param
      const { searchParams } = new URL(req.url);
      paymentId = searchParams.get('id');
    }

    if (!paymentId) {
      return new NextResponse('missing id', { status: 400 });
    }

    const p = await fetchPayment(paymentId);

    const status: string = p.status || 'unknown';
    const amountIncl = toNumber(p.amount?.value);
    const currency: string = p.amount?.currency || 'EUR';
    const paidAt: string | null = p.paidAt || p.paid_at || null;
    const customerEmail: string | undefined = p.billingEmail || p?.consumerAccount?.holderName;
    const customerName: string | undefined = p?.details?.consumerName || p?.consumerName;
    const metadata = p.metadata || {};
    const referrerCode: string | undefined = metadata.referrer_code || metadata.ref || undefined;

    const amountExcl = Math.round((amountIncl / 1.21) * 100) / 100;
    const nowIso = new Date().toISOString();

    // Upsert order
    const { data: existing, error: selErr } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('mollie_payment_id', paymentId)
      .maybeSingle();
    if (selErr) throw selErr;

    if (!existing) {
      const { error: insErr } = await supabaseAdmin
        .from('orders')
        .insert({
          mollie_payment_id: paymentId,
          amount_incl_vat: amountIncl,
          currency,
          status,
          customer_email: customerEmail || null,
          customer_name: customerName || null,
          referrer_code: referrerCode || null,
          created_at: nowIso,
          paid_at: paidAt,
          updated_at: nowIso,
        });
      if (insErr) throw insErr;
    } else {
      const { error: updErr } = await supabaseAdmin
        .from('orders')
        .update({
          amount_incl_vat: amountIncl,
          currency,
          status,
          customer_email: customerEmail || null,
          customer_name: customerName || null,
          referrer_code: referrerCode || null,
          paid_at: paidAt,
          updated_at: nowIso,
        })
        .eq('mollie_payment_id', paymentId);
      if (updErr) throw updErr;
    }

    // Commission on paid/authorized
    if ((status === 'paid' || status === 'authorized' || paidAt) && referrerCode) {
      const { data: orderRow } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('mollie_payment_id', paymentId)
        .single();
      if (orderRow?.id) {
        const { data: existingComm } = await supabaseAdmin
          .from('affiliate_commissions')
          .select('id')
          .eq('order_id', orderRow.id)
          .maybeSingle();
        if (!existingComm) {
          const commissionAmount = Math.round((amountExcl * 0.20) * 100) / 100;
          const { error: commErr } = await supabaseAdmin
            .from('affiliate_commissions')
            .insert({
              order_id: orderRow.id,
              referrer_code: referrerCode,
              amount_incl_vat: amountIncl,
              amount_excl_vat: amountExcl,
              commission_amount: commissionAmount,
              status: 'approved',
            });
          if (commErr) throw commErr;
        }
      }
    }

    return new NextResponse('ok', { status: 200 });
  } catch (e: any) {
    console.error('mollie webhook error', e);
    // Mollie expects a 200 to stop retries only on success; on error, 500 is fine so it retries
    return new NextResponse('error', { status: 500 });
  }
}
