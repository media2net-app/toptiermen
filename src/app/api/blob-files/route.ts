import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    // Check if we have the required token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    console.log('📂 Fetching files from blob store...');

    // List all files in the blob store
    const { blobs } = await list();

    console.log('✅ Found files:', blobs.length);

    // Format the response
    const files = blobs.map(blob => ({
      pathname: blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      contentType: blob.contentType
    }));

    return NextResponse.json({
      success: true,
      totalFiles: blobs.length,
      files: files
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch blob files:', error);
    return NextResponse.json(
      { error: `Failed to fetch files: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 