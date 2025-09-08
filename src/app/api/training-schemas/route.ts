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
    
    // Direct query to training_schemas table - our source of truth
    const { data: realSchemas, error } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [TRAINING-SCHEMAS-FIXED] Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('✅ [TRAINING-SCHEMAS-FIXED] Real schemas from database:', realSchemas?.length || 0);
    
    // Log the actual schema names to verify we have Rick's work
    if (realSchemas && realSchemas.length > 0) {
      console.log('📋 [TRAINING-SCHEMAS-FIXED] Real schemas:', realSchemas.slice(0, 5).map(s => s.name));
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
