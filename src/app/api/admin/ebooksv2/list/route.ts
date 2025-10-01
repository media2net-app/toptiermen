import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(_req: NextRequest) {
  try {
    const dir = path.join(process.cwd(), 'public', 'ebooksv2');
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.html'))
      .map((e) => ({ name: e.name, url: `/ebooksv2/${e.name}` }));

    return NextResponse.json({ success: true, items: files });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
