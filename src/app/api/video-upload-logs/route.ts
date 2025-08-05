import { NextResponse } from 'next/server';
import { getVideoUploadLogs, getVideoUploadStats } from '@/lib/video-upload-logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const fileName = searchParams.get('fileName');

    console.log('📊 Video upload logs API called:', { action, fileName });

    switch (action) {
      case 'logs':
        const logs = getVideoUploadLogs();
        return NextResponse.json({
          success: true,
          logs,
          totalLogs: logs.length
        });

      case 'stats':
        const stats = getVideoUploadStats();
        return NextResponse.json({
          success: true,
          stats
        });

      case 'file':
        if (!fileName) {
          return NextResponse.json({
            success: false,
            error: 'fileName parameter is required'
          });
        }
        const fileLogs = getVideoUploadLogs().filter(log => log.fileName === fileName);
        return NextResponse.json({
          success: true,
          logs: fileLogs,
          totalLogs: fileLogs.length
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Video upload logs API',
          availableActions: ['logs', 'stats', 'file'],
          example: '/api/video-upload-logs?action=logs'
        });
    }

  } catch (error: any) {
    console.error('❌ Video upload logs API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
} 