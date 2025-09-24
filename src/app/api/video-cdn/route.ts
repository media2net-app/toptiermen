import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // CDN optimization strategies
    const optimizeVideoUrl = (url: string) => {
      // If already a CDN URL, return as is
      if (url.includes('cloudinary.com') || 
          url.includes('vimeo.com') || 
          url.includes('youtube.com') ||
          url.includes('cdn.')) {
        return {
          original: url,
          optimized: url,
          cdn: 'already-optimized'
        };
      }

      // Try different CDN strategies
      const optimizations = [
        {
          name: 'HTTPS Optimization',
          url: url.replace('http://', 'https://'),
          priority: 1
        },
        {
          name: 'CDN Path',
          url: url.replace('/videos/', '/cdn/videos/'),
          priority: 2
        },
        {
          name: 'Cache Busting',
          url: url + '?v=' + Date.now(),
          priority: 3
        },
        {
          name: 'Compression',
          url: url + '?q=auto&f=auto',
          priority: 4
        }
      ];

      return {
        original: url,
        optimized: optimizations[0].url,
        alternatives: optimizations,
        cdn: 'optimized'
      };
    };

    const optimization = optimizeVideoUrl(videoUrl);

    return NextResponse.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video CDN optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize video URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, quality = 'auto', format = 'mp4' } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Advanced CDN optimization
    const advancedOptimization = {
      original: videoUrl,
      optimized: videoUrl,
      quality,
      format,
      cdn: 'advanced',
      features: {
        adaptiveBitrate: true,
        preload: 'metadata',
        compression: 'auto',
        caching: 'aggressive'
      },
      alternatives: [
        {
          quality: 'high',
          url: videoUrl + '?q=high&f=mp4',
          bandwidth: 'high'
        },
        {
          quality: 'medium', 
          url: videoUrl + '?q=medium&f=mp4',
          bandwidth: 'medium'
        },
        {
          quality: 'low',
          url: videoUrl + '?q=low&f=mp4', 
          bandwidth: 'low'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: advancedOptimization,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advanced video CDN optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize video URL' },
      { status: 500 }
    );
  }
}
