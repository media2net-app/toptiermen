import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isConfigured = !!process.env.BLOB_READ_WRITE_TOKEN && 
                        process.env.BLOB_READ_WRITE_TOKEN.length > 0;
    
    return NextResponse.json({
      isConfigured,
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
      storeName: 'toptiermen-final-blob'
    });
  } catch (error) {
    console.error('Error checking blob config:', error);
    return NextResponse.json({
      isConfigured: false,
      error: 'Failed to check configuration'
    }, { status: 500 });
  }
} 