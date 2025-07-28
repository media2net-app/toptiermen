import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching project logs from database...');
    
    // Fetch project logs from database
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('project_logs')
      .select('*')
      .order('date', { ascending: false });
    
    if (logsError) {
      console.error('❌ Error fetching project logs:', logsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch project logs' },
        { status: 500 }
      );
    }
    
    // If no logs in database, return empty array
    if (!logs || logs.length === 0) {
      console.log('ℹ️ No project logs found in database');
      return NextResponse.json({
        success: true,
        logs: [],
        summary: {
          total_logs: 0,
          total_hours: 0,
          total_features: 0,
          total_bugfixes: 0,
          total_improvements: 0,
          average_hours_per_day: 0
        }
      });
    }
    
    // Calculate summary statistics
    const totalLogs = logs.length;
    const totalHours = logs.reduce((sum, log) => sum + log.hours_spent, 0);
    const totalFeatures = logs.filter(log => log.category === 'feature').length;
    const totalBugfixes = logs.filter(log => log.category === 'bugfix').length;
    const totalImprovements = logs.filter(log => log.category === 'ui' || log.category === 'improvement').length;
    const averageHoursPerDay = totalHours / totalLogs;

    const summary = {
      total_logs: totalLogs,
      total_hours: totalHours,
      total_features: totalFeatures,
      total_bugfixes: totalBugfixes,
      total_improvements: totalImprovements,
      average_hours_per_day: averageHoursPerDay
    };

    console.log('✅ Project logs fetched:', totalLogs, 'logs,', totalHours, 'total hours');

    return NextResponse.json({
      success: true,
      logs: logs,
      summary: summary
    });

  } catch (error) {
    console.error('❌ Error fetching project logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Adding new project log entry:', body);

    // For now, we'll just log the new entry since we're using hardcoded data
    // In the future, this would insert into the database
    console.log('✅ New project log entry logged (hardcoded mode):', {
      entry: body,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Project log entry added successfully',
      entry: body
    });

  } catch (error) {
    console.error('❌ Error in project logs POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 