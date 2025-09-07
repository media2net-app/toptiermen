import { NextRequest, NextResponse } from 'next/server';
import { EnormailProvider } from '@/lib/email-providers';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, fromEmail, fromName } = await request.json();

    if (!apiKey || !fromEmail || !fromName) {
      return NextResponse.json(
        { success: false, error: 'API key, from email, and from name are required' },
        { status: 400 }
      );
    }

    // Create Enormail provider instance
    const enormailProvider = new EnormailProvider(apiKey, fromEmail, fromName);

    // Test the connection
    const connectionTest = await enormailProvider.testConnection();

    if (connectionTest.success) {
      return NextResponse.json({
        success: true,
        message: 'Enormail connection successful!',
        data: connectionTest.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: connectionTest.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Enormail test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test Enormail connection' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enormail test endpoint - use POST with apiKey, fromEmail, and fromName'
  });
}