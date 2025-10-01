import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)ttm_ref=([^;]+)/);
    const code = match ? decodeURIComponent(match[1]) : null;

    if (!code) {
      return NextResponse.json({ hasRef: false });
    }

    return NextResponse.json({ hasRef: true, code });
  } catch (e) {
    return NextResponse.json({ hasRef: false });
  }
}
