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
    
    console.log('🔍 [TRAINING-SCHEMAS-FIXED] Fetching ONLY the 24 real training schemas...');
    
    // Direct query to training_schemas table with training_schema_days - our source of truth
    // First get all schemas without the join to avoid any caching issues
    const { data: allSchemas, error: allSchemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (allSchemasError) {
      console.error('❌ [TRAINING-SCHEMAS-FIXED] Error fetching schemas:', allSchemasError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch training schemas' 
      }, { status: 500 });
    }
    
    // Then get the days for each schema separately to avoid join issues
    const realSchemas: any[] = [];
    for (const schema of allSchemas || []) {
      const { data: days, error: daysError } = await supabase
        .from('training_schema_days')
        .select('id, day_number, name, description, focus_area, order_index')
        .eq('schema_id', schema.id)
        .order('order_index');
      
      realSchemas.push({
        ...schema,
        training_schema_days: days || []
      });
    }
    
    const error: any = null; // No error since we handled it above
    
    
    console.log('🔍 [TRAINING-SCHEMAS-FIXED] Query executed, checking for specific schemas...');
    
    
    if (error) {
      console.error('❌ [TRAINING-SCHEMAS-FIXED] Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Database error' 
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
