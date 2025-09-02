import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple placeholder response
    return NextResponse.json({
      success: true,
      message: 'Announcement stats endpoint',
      data: {
        total: 0,
        published: 0,
        draft: 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 