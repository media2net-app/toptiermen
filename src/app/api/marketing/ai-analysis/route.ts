import { NextRequest, NextResponse } from 'next/server';
import { aiMLEngine } from '@/lib/ai-ml-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type');
    const adId = searchParams.get('adId');
    const platform = searchParams.get('platform');

    if (!analysisType || !adId || !platform) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: type, adId, platform',
        data: null
      }, { status: 400 });
    }

    // Mock ad data for demonstration
    const mockAdData = {
      id: adId,
      title: 'Amazing Product - Limited Time Offer!',
      description: 'Discover the incredible benefits of our revolutionary product. Don\'t miss out on this exclusive opportunity.',
      imageUrl: 'https://example.com/ad-image.jpg',
      videoUrl: 'https://example.com/ad-video.mp4',
      duration: 30
    };

    let result;

    switch (analysisType) {
      case 'nlp':
        result = await aiMLEngine.analyzeAdContent(mockAdData, platform);
        break;
      case 'image':
        result = await aiMLEngine.analyzeVisualContent(mockAdData, platform);
        break;
      case 'voice':
        result = await aiMLEngine.analyzeVoiceContent(mockAdData, platform);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analysis type. Supported types: nlp, image, voice',
          data: null
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      analysisType,
      adId,
      platform,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform AI analysis',
      data: null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisType, adData, platform, userId, competitorId } = body;

    if (!analysisType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: analysisType',
        data: null
      }, { status: 400 });
    }

    let result;

    switch (analysisType) {
      case 'nlp':
        if (!adData || !platform) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameters for NLP analysis: adData, platform',
            data: null
          }, { status: 400 });
        }
        result = await aiMLEngine.analyzeAdContent(adData, platform);
        break;

      case 'image':
        if (!adData || !platform) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameters for image analysis: adData, platform',
            data: null
          }, { status: 400 });
        }
        result = await aiMLEngine.analyzeVisualContent(adData, platform);
        break;

      case 'voice':
        if (!adData || !platform) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameters for voice analysis: adData, platform',
            data: null
          }, { status: 400 });
        }
        result = await aiMLEngine.analyzeVoiceContent(adData, platform);
        break;

      case 'behavior':
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameter for behavioral analysis: userId',
            data: null
          }, { status: 400 });
        }
        result = await aiMLEngine.analyzeBehavioralPatterns(userId, body.userData || {});
        break;

      case 'prediction':
        if (!competitorId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameter for predictive modeling: competitorId',
            data: null
          }, { status: 400 });
        }
        result = await aiMLEngine.generatePredictiveModel(competitorId, body.competitorData || {});
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analysis type. Supported types: nlp, image, voice, behavior, prediction',
          data: null
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform AI analysis',
      data: null
    }, { status: 500 });
  }
} 