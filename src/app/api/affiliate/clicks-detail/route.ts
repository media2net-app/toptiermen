import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Affiliate code is required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase();
    console.log('📊 Fetching detailed click data for affiliate code:', normalizedCode);

    // Fetch detailed click data
    const { data: clicks, error } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('*')
      .eq('code', normalizedCode)
      .order('clicked_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching detailed clicks:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Process the data to make it more readable
    const processedClicks = (clicks || []).map(click => ({
      id: click.id,
      clicked_at: click.clicked_at,
      ip_address: click.ip_address,
      referrer: click.referrer || 'Direct',
      user_agent: click.user_agent,
      // Extract browser info from user agent
      browser: extractBrowserInfo(click.user_agent),
      // Extract device info from user agent
      device: extractDeviceInfo(click.user_agent),
      // Determine if it's a test click (localhost or curl)
      is_test: isTestClick(click.ip_address, click.user_agent)
    }));

    return NextResponse.json({
      success: true,
      clicks: processedClicks,
      total: processedClicks.length
    });

  } catch (e: any) {
    console.error('Error in affiliate clicks detail API:', e);
    return NextResponse.json({ success: false, error: e.message || 'Internal server error' }, { status: 500 });
  }
}

function extractBrowserInfo(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('curl')) return 'curl/API Test';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Other';
}

function extractDeviceInfo(userAgent: string | null): string {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('curl')) return 'API Test';
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  
  return 'Desktop';
}

function isTestClick(ipAddress: string | null, userAgent: string | null): boolean {
  if (!ipAddress || !userAgent) return false;
  
  // Check for localhost IPs
  if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return true;
  }
  
  // Check for curl/API tests
  if (userAgent.includes('curl')) {
    return true;
  }
  
  return false;
}

