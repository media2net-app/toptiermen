import { NextRequest, NextResponse } from 'next/server';
import { EnormailProvider } from '@/lib/email-providers';

export async function POST(request: NextRequest) {
  try {
    const { 
      apiKey, 
      listId, 
      contactData 
    } = await request.json();

    if (!apiKey || !listId || !contactData?.email) {
      return NextResponse.json(
        { success: false, error: 'API key, list ID, and contact email are required' },
        { status: 400 }
      );
    }

    // Create Enormail provider instance
    const enormailProvider = new EnormailProvider(apiKey, 'noreply@toptiermen.eu', 'Top Tier Men');

    // Add contact to list
    const result = await enormailProvider.addContactToList(listId, contactData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Lead successfully added to Enormail list',
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Enormail leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add lead to Enormail' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enormail leads endpoint - use POST with apiKey, listId, and contactData'
  });
}
