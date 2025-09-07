import { NextRequest, NextResponse } from 'next/server';
import { EnormailProvider } from '@/lib/email-providers';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, title, description } = await request.json();

    if (!apiKey || !title) {
      return NextResponse.json(
        { success: false, error: 'API key and title are required' },
        { status: 400 }
      );
    }

    // Create Enormail provider instance
    const enormailProvider = new EnormailProvider(apiKey, 'noreply@toptiermen.eu', 'Top Tier Men');

    // Create list
    const result = await enormailProvider.createList({
      title,
      description: description || ''
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'List successfully created',
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Enormail create list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Enormail list' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enormail create list endpoint - use POST with apiKey, title, and optional description'
  });
}
