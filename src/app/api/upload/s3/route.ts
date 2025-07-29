import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToS3, generatePresignedUploadUrl, generateFileKey } from '@/lib/s3';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No authorization header');
      return NextResponse.json(
        { error: 'Geen autorisatie header gevonden' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 Token length:', token.length);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    console.log('🔍 User auth result:', { user: !!user, error: error?.message });
    
    if (error) {
      console.error('❌ Auth error:', error);
      return NextResponse.json(
        { error: `Authenticatie fout: ${error.message}` },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json(
        { error: 'Geen gebruiker gevonden' },
        { status: 401 }
      );
    }
    
    console.log('✅ User authenticated:', user.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
    }

    // Validate file type (video files)
    const allowedTypes = [
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed.' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileKey = generateFileKey(file.name, folder);

    console.log('🚀 Starting S3 upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileKey,
      userId: user.id
    });

    // Upload to S3
    const uploadResult = await uploadToS3(file, fileKey, file.type);

    if (!uploadResult.success) {
      console.error('❌ S3 upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: `Upload failed: ${uploadResult.error}` },
        { status: 500 }
      );
    }

    console.log('✅ S3 upload successful:', {
      url: uploadResult.url,
      key: uploadResult.key
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate presigned URL for direct upload
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const contentType = searchParams.get('contentType');
    const folder = searchParams.get('folder') || 'uploads';

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileKey = generateFileKey(fileName, folder);

    // Generate presigned URL
    const presignedResult = await generatePresignedUploadUrl(fileKey, contentType);

    if (!presignedResult.success) {
      return NextResponse.json(
        { error: `Failed to generate presigned URL: ${presignedResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploadUrl: presignedResult.url,
      key: fileKey,
      publicUrl: `https://${process.env.S3_BUCKET_NAME || 'toptiermen'}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${fileKey}`
    });

  } catch (error) {
    console.error('❌ Presigned URL generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 