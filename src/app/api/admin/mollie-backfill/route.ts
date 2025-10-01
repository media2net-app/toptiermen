import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function getMollieKey() {
  // Prefer explicit API key; fall back to test/live keys if provided
  return process.env.MOLLIE_API_KEY || process.env.MOLLIE_TEST_KEY || process.env.MOLLIE_LIVE_KEY || '';
}

function toNumber(val?: any): number {
  const n = typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : 0;
  return isFinite(n) ? n : 0;
}

async function fetchMolliePayments(limit = 250, from?: string) {
  const key = getMollieKey();
  if (!key) throw new Error('Missing MOLLIE_API_KEY (or *_TEST/LIVE_KEY)');

  const url = new URL('https://api.mollie.com/v2/payments');
  url.searchParams.set('limit', String(limit));
  if (from) url.searchParams.set('from', from);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mollie list payments failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function POST(_req: NextRequest) {
  try {
    let total = 0;
    let inserted = 0;
    let updated = 0;
    let commissions = 0;

    let cursor: string | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;
      const data = await fetchMolliePayments(250, cursor);
      const payments: any[] = data?._embedded?.payments || [];
      total += payments.length;

      for (const p of payments) {
        const paymentId: string = p.id;
        const amountIncl = toNumber(p.amount?.value);
        const currency: string = p.amount?.currency || 'EUR';
        const status: string = p.status || 'unknown';
        const customerEmail: string | undefined = p.billingEmail || p?.consumerAccount?.holderName;
        const customerName: string | undefined = p?.details?.consumerName || p?.consumerName;
        const paidAt: string | null = p.paidAt || p.paid_at || null;
        const metadata = p.metadata || {};
        const referrerCode: string | undefined = metadata.referrer_code || metadata.ref || undefined;

        // Upsert into orders by mollie_payment_id
        const { data: existing, error: selErr } = await supabaseAdmin
          .from('orders')
          .select('id, status')
          .eq('mollie_payment_id', paymentId)
          .maybeSingle();
        if (selErr) throw selErr;

        const amountExcl = Math.round((amountIncl / 1.21) * 100) / 100; // 21% vat
        const nowIso = new Date().toISOString();

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
          inserted++;
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
          updated++;
        }

        // Create commission if paid and referrer exists and not already created
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
              commissions++;
            }
          }
        }
      }

      cursor = data?._links?.next?.href ? new URL(data._links.next.href).searchParams.get('from') || undefined : undefined;
      // Stop after a few pages to avoid heavy backfill by default
      if (pageCount >= 4) break;
    } while (cursor);

    return NextResponse.json({ success: true, total, inserted, updated, commissions });
  } catch (e: any) {
    console.error('mollie-backfill error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
