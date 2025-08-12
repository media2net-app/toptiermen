import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Screenshot upload API called');
    
    const formData = await request.formData();
    const file = formData.get('screenshot') as File;
    
    if (!file) {
      return NextResponse.json({ 
        error: 'No screenshot file provided' 
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'File must be an image' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `screenshots/${timestamp}-${file.name}`;

    console.log('📸 Uploading screenshot:', filename);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('bug-screenshots')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error uploading screenshot:', error);
      return NextResponse.json({ 
        error: 'Failed to upload screenshot' 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('bug-screenshots')
      .getPublicUrl(filename);

    console.log('✅ Screenshot uploaded successfully:', urlData.publicUrl);

    return NextResponse.json({ 
      success: true,
      url: urlData.publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('❌ Error in screenshot upload API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 