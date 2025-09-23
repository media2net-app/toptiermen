import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CRITICAL: Force API to use only our real 24 schemas from Rick's work
// This bypasses any potential caching or external data sources
export async function GET() {
  try {
    // Use direct Supabase client to ensure we get the real data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 [TRAINING-SCHEMAS-FIXED] Fetching ONLY the real training schemas...');
    console.log('🔄 [CACHE-FORCE] Forcing fresh data fetch at:', new Date().toISOString());
    
    // OPTIMIZED: Single efficient query with join to avoid N+1 problem
    console.log('⚡ [PERFORMANCE] Using optimized single query with join...');
    const startTime = Date.now();
    
    const { data: realSchemas, error: allSchemasError } = await supabase
      .from('training_schemas')
      .select(`
        *,
        training_schema_days (
          id,
          day_number,
          name,
          description,
          focus_area,
          order_index
        )
      `)
      .eq('status', 'published')
      .order('schema_nummer', { ascending: true })
      .order('training_goal', { ascending: true })
      .order('equipment_type', { ascending: true })
      .limit(1000);
    
    const queryTime = Date.now() - startTime;
    console.log(`⚡ [PERFORMANCE] Query completed in ${queryTime}ms`);
    
    if (allSchemasError) {
      console.error('❌ [TRAINING-SCHEMAS-FIXED] Error fetching schemas:', allSchemasError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch training schemas' 
      }, { status: 500 });
    }
    
    console.log('✅ [TRAINING-SCHEMAS-FIXED] Real schemas from database:', realSchemas?.length || 0);
    
    // Log the actual schema names to verify we have Rick's work
    if (realSchemas && realSchemas.length > 0) {
      console.log('📋 [TRAINING-SCHEMAS-FIXED] Real schemas:', realSchemas.slice(0, 5).map((s: any) => ({
        name: s.name,
        training_goal: s.training_goal,
        schema_nummer: s.schema_nummer,
        days_count: s.training_schema_days?.length || 0
      })));
    }
    
    // Return ONLY the schemas that actually exist in our database
    // This ensures we don't include any external/cached/mock data
    const validSchemas = realSchemas || [];
    
    console.log('✅ [TRAINING-SCHEMAS-FIXED] Returning schemas count:', validSchemas.length);
    
    return NextResponse.json({
      success: true,
      schemas: validSchemas,
      source: 'database_direct_query',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [TRAINING-SCHEMAS-FIXED] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      source: 'error'
    }, { status: 500 });
  }
}
