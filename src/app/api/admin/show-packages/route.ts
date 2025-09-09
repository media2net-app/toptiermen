import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting all prelaunch packages for display...');

    const { data, error } = await supabase
      .from('prelaunch_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    // Create HTML response
    const html = `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prelaunch Pakketten - Database View</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #181F17; 
            color: white; 
            margin: 20px; 
          }
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
          }
          h1 { 
            color: #8BAE5A; 
            text-align: center; 
            margin-bottom: 30px; 
          }
          .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
          }
          .stat-card { 
            background: #232D1A; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            border: 1px solid #3A4D23; 
          }
          .stat-number { 
            font-size: 2em; 
            font-weight: bold; 
            color: #8BAE5A; 
          }
          .stat-label { 
            color: #B6C948; 
            margin-top: 5px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            background: #232D1A; 
            border-radius: 10px; 
            overflow: hidden; 
          }
          th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #3A4D23; 
          }
          th { 
            background: #3A4D23; 
            color: #8BAE5A; 
            font-weight: bold; 
          }
          tr:hover { 
            background: #2A3A20; 
          }
          .status-paid { 
            color: #4ade80; 
            font-weight: bold; 
          }
          .status-pending { 
            color: #fbbf24; 
            font-weight: bold; 
          }
          .package-basic { 
            color: #60a5fa; 
          }
          .package-premium { 
            color: #a78bfa; 
          }
          .package-lifetime { 
            color: #fbbf24; 
          }
          .price { 
            font-weight: bold; 
            color: #8BAE5A; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎯 Prelaunch Pakketten - Database View</h1>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${data?.length || 0}</div>
              <div class="stat-label">Totaal Aankopen</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data?.filter(p => p.payment_status === 'paid').length || 0}</div>
              <div class="stat-label">Betaald</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data?.filter(p => p.payment_status === 'pending').length || 0}</div>
              <div class="stat-label">In Behandeling</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data?.filter(p => p.is_test_payment).length || 0}</div>
              <div class="stat-label">Test Betalingen</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Naam & Email</th>
                <th>Pakket</th>
                <th>Betalingsperiode</th>
                <th>Originele Prijs</th>
                <th>Korting Prijs</th>
                <th>Status</th>
                <th>Type</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              ${data?.map(pkg => `
                <tr>
                  <td>${pkg.id}</td>
                  <td>
                    <strong>${pkg.full_name}</strong><br>
                    <small>${pkg.email}</small>
                  </td>
                  <td class="package-${pkg.package_id}">${pkg.package_name}</td>
                  <td>${pkg.payment_period}</td>
                  <td class="price">€${pkg.original_price}</td>
                  <td class="price">€${pkg.discounted_price}</td>
                  <td class="status-${pkg.payment_status}">${pkg.payment_status}</td>
                  <td>${pkg.is_test_payment ? 'Test' : 'Live'}</td>
                  <td>${new Date(pkg.created_at).toLocaleDateString('nl-NL')}</td>
                </tr>
              `).join('') || '<tr><td colspan="9" style="text-align: center; padding: 40px;">Geen data gevonden</td></tr>'}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; color: #B6C948;">
            <p>🔄 <a href="/dashboard-admin/prelaunch-pakketten" style="color: #8BAE5A;">Ga terug naar Admin Dashboard</a></p>
            <p>📊 <a href="/api/admin/get-all-packages" style="color: #8BAE5A;">JSON Data View</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error getting packages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
