import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  const isRick = userEmail.toLowerCase().includes('rick') || 
                 userEmail.toLowerCase().includes('cuijpers');
  const isChrome = userAgent.includes('Chrome');
  
  const response = NextResponse.json({
    success: true,
    data: {
      userEmail,
      isRick,
      isChrome,
      userAgent,
      timestamp: new Date().toISOString(),
      cacheStrategy: isRick && isChrome ? 'rick-chrome-no-cache' : 
                    isRick ? 'rick-other-no-cache' : 'normal-caching'
    }
  });
  
  // Apply cache headers based on user
  if (isRick && isChrome) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Cache-Strategy', 'rick-chrome-no-cache');
    response.headers.set('X-Cache-Bust', Date.now().toString());
  } else if (isRick) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Strategy', 'rick-other-no-cache');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    response.headers.set('X-Cache-Strategy', 'normal-caching');
  }
  
  return response;
}
