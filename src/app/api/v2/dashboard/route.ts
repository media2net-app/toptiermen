import { NextRequest } from 'next/server';
import { 
  withApiHandler, 
  authenticateRequest, 
  requireAdmin, 
  createSuccessResponse, 
  createErrorResponse,
  checkRateLimit,
  logApiRequest,
  getPaginationParams,
  buildSearchQuery,
  buildSortQuery,
  safeDbOperation,
  cacheHeaders,
  noCacheHeaders
} from '@/lib/v2-api-utils';
import { getSupabaseClient } from '@/lib/supabase/client';

// V2.0: Dashboard API Route with enhanced monitoring and error handling
export const GET = withApiHandler(async (request: NextRequest) => {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  
  // V2.0: Rate limiting
  if (!checkRateLimit(`dashboard_get_${clientIp}`, 50, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // V2.0: Authentication
  const auth = await authenticateRequest(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 401);
  }

  // V2.0: Log request
  logApiRequest(request, 'GET_DASHBOARD', auth.user?.id);

  try {
    // V2.0: Get dashboard data with error recovery
    const dashboardData = await safeDbOperation(async () => {
      const supabase = getSupabaseClient();
      
      // V2.0: Parallel data fetching for better performance
      const [
        userProfile,
        notifications,
        recentActivity,
        stats
      ] = await Promise.all([
        // User profile
        supabase
          .from('users')
          .select('*')
          .eq('id', auth.user?.id)
          .single(),
        
        // Notifications
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', auth.user?.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Recent activity
        supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', auth.user?.id)
          .order('created_at', { ascending: false })
          .limit(20),
        
        // User stats
        supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', auth.user?.id)
          .single()
      ]);

      return {
        userProfile: userProfile.data,
        notifications: notifications.data || [],
        recentActivity: recentActivity.data || [],
        stats: stats.data || {},
        timestamp: new Date().toISOString()
      };
    }, 'Failed to fetch dashboard data');

    // V2.0: Success response with cache headers
    const response = createSuccessResponse({
      dashboard: dashboardData,
      version: '2.0',
      timestamp: new Date().toISOString()
    });

    // V2.0: Set cache headers for dashboard data
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('V2.0: Dashboard API error:', error);
    return createErrorResponse('Failed to load dashboard data', 500);
  }
});

// V2.0: Update dashboard preferences
export const PUT = withApiHandler(async (request: NextRequest) => {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  
  // V2.0: Rate limiting for updates
  if (!checkRateLimit(`dashboard_put_${clientIp}`, 20, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // V2.0: Authentication
  const auth = await authenticateRequest(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 401);
  }

  // V2.0: Log request
  logApiRequest(request, 'PUT_DASHBOARD', auth.user?.id);

  try {
    const body = await request.json();
    const { preferences, settings } = body;

    // V2.0: Validate required fields
    if (!preferences && !settings) {
      return createErrorResponse('No data provided for update', 400);
    }

    // V2.0: Update dashboard preferences with error recovery
    const updatedData = await safeDbOperation(async () => {
      const supabase = getSupabaseClient();
      
      const updates: any = {};
      
      if (preferences) {
        updates.preferences = preferences;
      }
      
      if (settings) {
        updates.settings = settings;
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', auth.user?.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    }, 'Failed to update dashboard preferences');

    // V2.0: Success response with no-cache headers for updates
    const response = createSuccessResponse({
      user: updatedData,
      message: 'Dashboard preferences updated successfully',
      version: '2.0',
      timestamp: new Date().toISOString()
    });

    // V2.0: Set no-cache headers for updated data
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('V2.0: Dashboard update error:', error);
    return createErrorResponse('Failed to update dashboard preferences', 500);
  }
});

// V2.0: Delete dashboard data (admin only)
export const DELETE = withApiHandler(async (request: NextRequest) => {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  
  // V2.0: Rate limiting for deletions
  if (!checkRateLimit(`dashboard_delete_${clientIp}`, 5, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // V2.0: Authentication and admin authorization
  const auth = await authenticateRequest(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 401);
  }

  const adminCheck = await requireAdmin(auth.user);
  if (adminCheck.error) {
    return createErrorResponse(adminCheck.error, 403);
  }

  // V2.0: Log request
  logApiRequest(request, 'DELETE_DASHBOARD', auth.user?.id);

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return createErrorResponse('User ID is required for deletion', 400);
    }

    // V2.0: Delete user dashboard data with error recovery
    const deletionResult = await safeDbOperation(async () => {
      const supabase = getSupabaseClient();
      
      // V2.0: Cascade delete related data
      const deletions = await Promise.all([
        // Delete notifications
        supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId),
        
        // Delete user activity
        supabase
          .from('user_activity')
          .delete()
          .eq('user_id', userId),
        
        // Delete user stats
        supabase
          .from('user_stats')
          .delete()
          .eq('user_id', userId),
        
        // Delete user preferences
        supabase
          .from('users')
          .update({
            preferences: null,
            settings: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      ]);

      return {
        deleted: true,
        affectedTables: ['notifications', 'user_activity', 'user_stats', 'users'],
        timestamp: new Date().toISOString()
      };
    }, 'Failed to delete dashboard data');

    // V2.0: Success response
    const response = createSuccessResponse({
      result: deletionResult,
      message: 'Dashboard data deleted successfully',
      version: '2.0',
      timestamp: new Date().toISOString()
    });

    // V2.0: Set no-cache headers
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('V2.0: Dashboard deletion error:', error);
    return createErrorResponse('Failed to delete dashboard data', 500);
  }
});
