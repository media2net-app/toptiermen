// 2.0.3: Standardized API Utilities
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 2.0.1: Supabase client for API routes
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// 2.0.1: Standard API response types
export interface V2ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  version: string;
}

// 2.0.1: Standard error response
export function createErrorResponse(error: string, status: number = 400): NextResponse {
  const response: V2ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    version: '2.0'
  };
  
  return NextResponse.json(response, { status });
}

// 2.0.1: Standard success response
export function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  const response: V2ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    version: '2.0'
  };
  
  return NextResponse.json(response);
}

// 2.0.1: Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{
  user: any;
  supabase: any;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { user: null, supabase, error: 'No authorization header' };
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return { user: null, supabase, error: 'Invalid token format' };
    }

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, supabase, error: 'Invalid or expired token' };
    }

    return { user, supabase };
  } catch (error) {
    console.error('2.0.1: Authentication error:', error);
    return { user: null, supabase: null, error: 'Authentication failed' };
  }
}

// 2.0.1: Admin authorization check
export async function requireAdmin(request: NextRequest): Promise<{
  user: any;
  supabase: any;
  error?: string;
}> {
  const auth = await authenticateRequest(request);
  
  if (auth.error) {
    return auth;
  }

  // Check if user is admin
  const { data: profile, error } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (error || !profile) {
    return { user: null, supabase: auth.supabase, error: 'User profile not found' };
  }

  if (profile.role !== 'admin') {
    return { user: null, supabase: auth.supabase, error: 'Admin access required' };
  }

  return auth;
}

// 2.0.1: Rate limiting utility
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// 2.0.1: Input validation utility
export function validateRequiredFields(data: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// 2.0.1: Database operation wrapper with error handling
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error('2.0.1: Database operation error:', error);
    return { data: null, error: errorMessage };
  }
}

// 2.0.1: Logging utility
export function logApiRequest(request: NextRequest, operation: string, userId?: string) {
  console.log(`2.0.1: API Request - ${operation}`, {
    method: request.method,
    url: request.url,
    userId,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  });
}

// 2.0.1: CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 2.0.1: Standard API handler wrapper
export function withApiHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers: corsHeaders });
    }

    try {
      // Add CORS headers to all responses
      const response = await handler(request);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      console.error('2.0.1: API Handler error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  };
}

// 2.0.1: Pagination utility
export function getPaginationParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// 2.0.1: Search utility
export function buildSearchQuery(baseQuery: any, searchTerm: string, searchFields: string[]) {
  if (!searchTerm) return baseQuery;
  
  const searchConditions = searchFields.map(field => 
    `${field}.ilike.%${searchTerm}%`
  );
  
  return baseQuery.or(searchConditions.join(','));
}

// 2.0.1: Sorting utility
export function buildSortQuery(baseQuery: any, sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') {
  if (!sortBy) return baseQuery;
  
  return baseQuery.order(sortBy, { ascending: sortOrder === 'asc' });
}

// 2.0.1: Cache control headers
export const cacheHeaders = {
  'Cache-Control': 'public, max-age=30, s-maxage=60',
  'X-Cache-Version': '2.0',
  'X-TTM-Version': '2.0'
};

// 2.0.1: No-cache headers for sensitive data
export const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Cache-Version': '2.0',
  'X-TTM-Version': '2.0'
};
