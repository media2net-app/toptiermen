import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this content' },
        { status: 401 }
      );
    }

    // Validate filename to prevent directory traversal
    const filename = params.filename;
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Check if user has access to this ebook (you can add more logic here)
    // For now, we'll allow all authenticated users to access ebooks
    
    // Construct path to ebook file
    const ebookPath = path.join(process.cwd(), 'src', 'lib', 'ebooks', filename);
    
    // Check if file exists
    if (!fs.existsSync(ebookPath)) {
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      );
    }

    // Read and serve the HTML file
    const htmlContent = fs.readFileSync(ebookPath, 'utf-8');
    
    // Return HTML with proper headers
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error serving ebook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
