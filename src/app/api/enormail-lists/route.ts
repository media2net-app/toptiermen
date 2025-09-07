import { NextRequest, NextResponse } from 'next/server';
import { EnormailProvider } from '@/lib/email-providers';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, page = 1 } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Create Enormail provider instance
    const enormailProvider = new EnormailProvider(apiKey, 'noreply@toptiermen.eu', 'Top Tier Men');

    // Get lists
    const result = await enormailProvider.getLists(page);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Lists retrieved successfully',
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Enormail lists error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get Enormail lists' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enormail lists endpoint - use POST with apiKey and optional page number'
  });
}
