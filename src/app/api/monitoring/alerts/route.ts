import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🚨 Fetching system alerts...');

    // Start monitoring if not already started
    await monitoringSystem.startMonitoring();

    let alerts;
    if (resolved === 'false') {
      alerts = monitoringSystem.getUnresolvedAlerts();
    } else {
      // For now, just get unresolved alerts as we don't have a method for all alerts
      alerts = monitoringSystem.getUnresolvedAlerts();
    }

    // Filter by severity if specified
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Filter by type if specified  
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    // Limit results
    alerts = alerts.slice(0, limit);

    // Calculate alert statistics
    const stats = {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      },
      byType: {
        performance: alerts.filter(a => a.type === 'performance').length,
        error: alerts.filter(a => a.type === 'error').length,
        security: alerts.filter(a => a.type === 'security').length,
        capacity: alerts.filter(a => a.type === 'capacity').length
      },
      resolved: alerts.filter(a => a.resolved).length,
      unresolved: alerts.filter(a => !a.resolved).length
    };

    const response = {
      success: true,
      alerts: alerts.sort((a, b) => b.timestamp - a.timestamp), // Sort by newest first
      stats,
      filters: { resolved, severity, type, limit },
      timestamp: new Date().toISOString()
    };

    console.log('✅ System alerts retrieved:', alerts.length, 'alerts');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching system alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, resolvedBy, alert } = body;

    switch (action) {
      case 'resolve':
        if (!alertId) {
          return NextResponse.json(
            { success: false, error: 'alertId is required for resolve action' },
            { status: 400 }
          );
        }

        const resolved = monitoringSystem.resolveAlert(alertId, resolvedBy);
        if (!resolved) {
          return NextResponse.json(
            { success: false, error: 'Alert not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          action: 'alert_resolved',
          alertId,
          resolvedBy,
          timestamp: new Date().toISOString()
        });

      case 'create':
        if (!alert) {
          return NextResponse.json(
            { success: false, error: 'alert data is required for create action' },
            { status: 400 }
          );
        }

        // Validate alert structure
        const requiredFields = ['type', 'severity', 'title', 'description'];
        for (const field of requiredFields) {
          if (!alert[field]) {
            return NextResponse.json(
              { success: false, error: `${field} is required in alert data` },
              { status: 400 }
            );
          }
        }

        // Add alert with generated ID and timestamp
        const newAlert = {
          id: `manual_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          resolved: false,
          actions: [],
          ...alert
        };

        monitoringSystem.addAlert(newAlert);

        return NextResponse.json({
          success: true,
          action: 'alert_created',
          alert: newAlert,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action. Supported actions: resolve, create' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Error in alerts POST:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed', details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'alertId parameter is required' },
        { status: 400 }
      );
    }

    // For now, we'll just resolve the alert instead of deleting
    // In a real implementation, you might want to actually remove it
    const resolved = monitoringSystem.resolveAlert(alertId, 'system_cleanup');

    if (!resolved) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      action: 'alert_deleted',
      alertId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error deleting alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert', details: error },
      { status: 500 }
    );
  }
}
