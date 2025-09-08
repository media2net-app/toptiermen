import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

export async function GET(
  request: Request,
  { params }: { params: { schemaId: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const schemaId = params.schemaId;

    if (!schemaId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schema ID is required' 
      }, { status: 400 });
    }

    console.log('🔍 Fetching detailed training schema:', schemaId);

    // Get the main schema
    const { data: schema, error: schemaError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('id', schemaId)
      .single();

    if (schemaError) {
      console.error('❌ Error fetching schema:', schemaError);
      return NextResponse.json({ 
        success: false, 
        error: 'Schema not found' 
      }, { status: 404 });
    }

    // Get the training days for this schema
    const { data: days, error: daysError } = await supabase
      .from('training_schema_days')
      .select('*')
      .eq('schema_id', schemaId)
      .order('day_number');

    if (daysError) {
      console.error('❌ Error fetching schema days:', daysError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch training days' 
      }, { status: 500 });
    }

    // Get exercises for each day with video URLs
    const daysWithExercises = await Promise.all(
      (days || []).map(async (day) => {
        const { data: exercises, error: exercisesError } = await supabase
          .from('training_schema_exercises')
          .select('*')
          .eq('schema_day_id', day.id)
          .order('order_index');

        if (exercisesError) {
          console.error(`❌ Error fetching exercises for day ${day.id}:`, exercisesError);
          return {
            ...day,
            training_schema_exercises: []
          };
        }

        // Get video URLs for each exercise
        const exercisesWithVideos = await Promise.all(
          (exercises || []).map(async (exercise) => {
            if (exercise.exercise_id) {
              const { data: exerciseDetails, error: exerciseError } = await supabase
                .from('exercises')
                .select('video_url')
                .eq('id', exercise.exercise_id)
                .single();

              if (exerciseError) {
                console.error(`❌ Error fetching video for exercise ${exercise.exercise_id}:`, exerciseError);
                return {
                  ...exercise,
                  video_url: null
                };
              }

              return {
                ...exercise,
                video_url: exerciseDetails?.video_url || null
              };
            }

            return {
              ...exercise,
              video_url: null
            };
          })
        );

        return {
          ...day,
          training_schema_exercises: exercisesWithVideos
        };
      })
    );

    const detailedSchema = {
      ...schema,
      training_schema_days: daysWithExercises
    };

    console.log('✅ Detailed training schema fetched successfully');
    console.log(`📊 Schema: ${schema.name}, Days: ${daysWithExercises.length}, Total exercises: ${daysWithExercises.reduce((total, day) => total + (day.training_schema_exercises?.length || 0), 0)}`);

    return NextResponse.json({
      success: true,
      schema: detailedSchema
    });

  } catch (error) {
    console.error('❌ Error in training-schema-detail GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
