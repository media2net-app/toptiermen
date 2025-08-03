import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Check if we have the required token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    console.log('📥 Starting file upload process...');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: MP4, MOV, AVI, WEBM, MKV, QuickTime' },
        { status: 400 }
      );
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 500MB' },
        { status: 400 }
      );
    }

    // Generate unique filename in the videos-workout folder
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileExt = file.name.split('.').pop();
    const randomSuffix = Math.random().toString(36).substring(2);
    const filename = `videos-workout/${timestamp}-${randomSuffix}.${fileExt}`;

    console.log('🔄 Uploading video to Vercel Blob:', filename);

    console.log('🚀 Starting Vercel Blob upload...');

    // Upload using Vercel Blob with timeout
    const uploadPromise = put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 3600, // 1 hour cache for videos
      contentType: file.type
    });

    // Add timeout to prevent hanging (longer for large files)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 5 minutes')), 300000);
    });

    const { url } = await Promise.race([uploadPromise, timeoutPromise]) as any;

    console.log('✅ Video uploaded successfully:', url);

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename
    });

  } catch (error: any) {
    console.error('❌ Video upload failed:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 