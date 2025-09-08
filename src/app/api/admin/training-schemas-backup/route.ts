import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Fetching training schemas backup data...');
    
    // Fetch all training schemas with their days and exercises
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select(`
        *,
        training_schema_days (
          *,
          training_schema_exercises (
            *
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (schemasError) {
      console.error('❌ Error fetching training schemas:', schemasError);
      return NextResponse.json({ 
        success: false, 
        error: schemasError.message 
      }, { status: 500 });
    }
    
    // Calculate statistics
    const totalSchemas = schemas?.length || 0;
    const publishedSchemas = schemas?.filter(s => s.status === 'published').length || 0;
    const draftSchemas = schemas?.filter(s => s.status === 'draft').length || 0;
    const totalDays = schemas?.reduce((sum, schema) => sum + (schema.training_schema_days?.length || 0), 0) || 0;
    const totalExercises = schemas?.reduce((sum, schema) => {
      return sum + (schema.training_schema_days?.reduce((daySum, day) => {
        return daySum + (day.training_schema_exercises?.length || 0);
      }, 0) || 0);
    }, 0) || 0;
    
    const statistics = {
      totalSchemas,
      publishedSchemas,
      draftSchemas,
      totalDays,
      totalExercises,
      backupDate: new Date().toISOString()
    };
    
    console.log('✅ Training schemas backup data fetched successfully');
    console.log(`📊 Statistics: ${totalSchemas} schemas, ${publishedSchemas} published, ${draftSchemas} draft, ${totalDays} days, ${totalExercises} exercises`);
    
    return NextResponse.json({
      success: true,
      data: {
        schemas: schemas || [],
        statistics
      }
    });
    
  } catch (error) {
    console.error('❌ Error in training-schemas-backup API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
