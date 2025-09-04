import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Checking training schemas in database...');
    
    // Get all training schemas
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .order('created_at');
    
    if (schemasError) {
      return NextResponse.json({ 
        success: false, 
        error: schemasError.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${schemas?.length || 0} training schemas`);
    
    // Analyze the schemas by different criteria
    const analysis = {
      totalSchemas: schemas?.length || 0,
      byStatus: {},
      byTrainingGoal: {},
      byCategory: {},
      byDifficulty: {},
      byEquipment: {},
      allSchemas: schemas || []
    };
    
    // Group by status
    schemas?.forEach(schema => {
      const status = schema.status || 'unknown';
      analysis.byStatus[status] = (analysis.byStatus[status] || 0) + 1;
    });
    
    // Group by training_goal
    schemas?.forEach(schema => {
      const goal = schema.training_goal || 'unknown';
      analysis.byTrainingGoal[goal] = (analysis.byTrainingGoal[goal] || 0) + 1;
    });
    
    // Group by category (equipment type)
    schemas?.forEach(schema => {
      const category = schema.category || 'unknown';
      analysis.byCategory[category] = (analysis.byCategory[category] || 0) + 1;
    });
    
    // Group by difficulty
    schemas?.forEach(schema => {
      const difficulty = schema.difficulty || 'unknown';
      analysis.byDifficulty[difficulty] = (analysis.byDifficulty[difficulty] || 0) + 1;
    });
    
    // Show sample schemas
    const sampleSchemas = schemas?.slice(0, 5).map(schema => ({
      id: schema.id,
      name: schema.name,
      training_goal: schema.training_goal,
      category: schema.category,
      difficulty: schema.difficulty,
      status: schema.status,
      description: schema.description?.substring(0, 100) + '...'
    }));
    
    return NextResponse.json({
      success: true,
      analysis: analysis,
      sampleSchemas: sampleSchemas,
      message: `Found ${schemas?.length || 0} training schemas in database`
    });
    
  } catch (error) {
    console.error('❌ Error in check-training-schemas-database:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
