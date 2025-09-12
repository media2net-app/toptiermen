import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Optimizing training_schemas database indexes...');
    
    // Create indexes for better performance
    const indexes = [
      {
        name: 'idx_training_schemas_goal',
        table: 'training_schemas',
        column: 'training_goal',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_schemas_goal ON training_schemas(training_goal);'
      },
      {
        name: 'idx_training_schemas_equipment',
        table: 'training_schemas',
        column: 'equipment_type',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_schemas_equipment ON training_schemas(equipment_type);'
      },
      {
        name: 'idx_training_schemas_status',
        table: 'training_schemas',
        column: 'status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_schemas_status ON training_schemas(status);'
      },
      {
        name: 'idx_training_schemas_filter',
        table: 'training_schemas',
        column: 'composite',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_schemas_filter ON training_schemas(training_goal, equipment_type, status);'
      },
      {
        name: 'idx_training_profiles_user',
        table: 'training_profiles',
        column: 'user_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_profiles_user ON training_profiles(user_id);'
      },
      {
        name: 'idx_training_schema_days_schema',
        table: 'training_schema_days',
        column: 'schema_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_schema_days_schema ON training_schema_days(schema_id);'
      }
    ];
    
    const results: Array<{
      name: string;
      success: boolean;
      error?: string;
      message?: string;
    }> = [];
    
    for (const index of indexes) {
      try {
        console.log(`📊 Creating index: ${index.name}`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: index.sql });
        
        if (error) {
          console.error(`❌ Error creating index ${index.name}:`, error);
          results.push({
            name: index.name,
            success: false,
            error: error.message
          });
        } else {
          console.log(`✅ Index created: ${index.name}`);
          results.push({
            name: index.name,
            success: true,
            message: 'Index created successfully'
          });
        }
      } catch (err) {
        console.error(`❌ Exception creating index ${index.name}:`, err);
        results.push({
          name: index.name,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    // Test query performance
    console.log('🧪 Testing query performance...');
    const startTime = Date.now();
    
    const { data: testData, error: testError } = await supabase
      .from('training_schemas')
      .select(`
        *,
        training_schema_days (
          id,
          day_number,
          name
        )
      `)
      .eq('status', 'published')
      .eq('training_goal', 'spiermassa')
      .eq('equipment_type', 'Gym')
      .limit(10);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    if (testError) {
      console.error('❌ Test query failed:', testError);
    } else {
      console.log(`✅ Test query completed in ${queryTime}ms, returned ${testData?.length || 0} results`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database optimization completed',
      indexes: results,
      performance: {
        testQueryTime: queryTime,
        testResults: testData?.length || 0,
        testError: testError?.message || null
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database optimization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
