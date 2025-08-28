import { NextRequest } from 'next/server';
import { 
  withApiHandler, 
  authenticateRequest, 
  requireAdmin, 
  createSuccessResponse, 
  createErrorResponse,
  logApiRequest,
  checkRateLimit,
  getPaginationParams,
  buildSearchQuery,
  buildSortQuery,
  safeDbOperation,
  cacheHeaders,
  noCacheHeaders,
  validateRequiredFields
} from '@/lib/v2-api-utils';

// 2.0.1: Users API Route with standardized patterns
export const GET = withApiHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`users_get_${clientIp}`, 100, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // Authentication
  const auth = await authenticateRequest(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 401);
  }

  // Log request
  logApiRequest(request, 'GET_USERS', auth.user?.id);

  try {
    const { page, limit, offset } = getPaginationParams(request);
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Build query
    let query = auth.supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply search
    if (searchTerm) {
      query = buildSearchQuery(query, searchTerm, ['email', 'full_name']);
    }

    // Apply sorting
    query = buildSortQuery(query, sortBy, sortOrder);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: result, error: dbError } = await safeDbOperation(
      async () => {
        const { data, error, count } = await query;
        return { data, error, count };
      },
      'Failed to fetch users'
    );

    if (dbError || result?.error) {
      return createErrorResponse(dbError || result?.error, 500);
    }

    if (!result) {
      return createErrorResponse('No data returned from database', 500);
    }

    const { data, count } = result;

    // Add cache headers for public data
    const response = createSuccessResponse({
      users: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

    // Add cache headers
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('2.0.1: Users GET error:', error);
    return createErrorResponse('Internal server error', 500);
  }
});

export const POST = withApiHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`users_post_${clientIp}`, 10, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // Admin authorization required
  const auth = await requireAdmin(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 403);
  }

  // Log request
  logApiRequest(request, 'CREATE_USER', auth.user?.id);

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['email', 'full_name', 'role'];
    const validationError = validateRequiredFields(body, requiredFields);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    // Create user
    const { data, error } = await safeDbOperation(
      () => auth.supabase
        .from('profiles')
        .insert([body])
        .select()
        .single(),
      'Failed to create user'
    );

    if (error) {
      return createErrorResponse(error, 500);
    }

    // Add no-cache headers for sensitive operations
    const response = createSuccessResponse(data, 'User created successfully');
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('2.0.1: Users POST error:', error);
    return createErrorResponse('Internal server error', 500);
  }
});

export const PUT = withApiHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`users_put_${clientIp}`, 50, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // Authentication required
  const auth = await authenticateRequest(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 401);
  }

  // Log request
  logApiRequest(request, 'UPDATE_USER', auth.user?.id);

  try {
    const body = await request.json();
    const userId = body.id || auth.user.id;

    // Users can only update their own profile unless they're admin
    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user.id)
      .single();

    if (profile?.role !== 'admin' && userId !== auth.user.id) {
      return createErrorResponse('Unauthorized to update this user', 403);
    }

    // Update user
    const { data, error } = await safeDbOperation(
      () => auth.supabase
        .from('profiles')
        .update(body)
        .eq('id', userId)
        .select()
        .single(),
      'Failed to update user'
    );

    if (error) {
      return createErrorResponse(error, 500);
    }

    // Add no-cache headers
    const response = createSuccessResponse(data, 'User updated successfully');
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('2.0.1: Users PUT error:', error);
    return createErrorResponse('Internal server error', 500);
  }
});

export const DELETE = withApiHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`users_delete_${clientIp}`, 5, 60000)) {
    return createErrorResponse('Rate limit exceeded', 429);
  }

  // Admin authorization required
  const auth = await requireAdmin(request);
  if (auth.error) {
    return createErrorResponse(auth.error, 403);
  }

  // Log request
  logApiRequest(request, 'DELETE_USER', auth.user?.id);

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('id');

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    // Prevent admin from deleting themselves
    if (userId === auth.user.id) {
      return createErrorResponse('Cannot delete your own account', 400);
    }

    // Delete user
    const { error } = await safeDbOperation(
      () => auth.supabase
        .from('profiles')
        .delete()
        .eq('id', userId),
      'Failed to delete user'
    );

    if (error) {
      return createErrorResponse(error, 500);
    }

    // Add no-cache headers
    const response = createSuccessResponse(null, 'User deleted successfully');
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('2.0.1: Users DELETE error:', error);
    return createErrorResponse('Internal server error', 500);
  }
});
