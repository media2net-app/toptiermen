import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const schemaId = searchParams.get('schemaId');
    const dayNumber = searchParams.get('dayNumber');

    if (!schemaId || !dayNumber) {
      return NextResponse.json({ 
        error: 'Missing required parameters: schemaId and dayNumber' 
      }, { status: 400 });
    }

    // Get the day for this schema and day number
    const { data: dayData, error: dayError } = await supabase
      .from('training_schema_days')
      .select('*')
      .eq('schema_id', schemaId)
      .eq('day_number', parseInt(dayNumber))
      .single();

    if (dayError) {
      console.error('Error loading day:', dayError);
      return NextResponse.json({ 
        error: 'Failed to load training day' 
      }, { status: 500 });
    }

    // Get exercises for this day
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('training_schema_exercises')
      .select(`
        *,
        exercises (
          id,
          name,
          description,
          instructions,
          video_url,
          muscle_group,
          equipment,
          difficulty
        )
      `)
      .eq('schema_day_id', dayData.id)
      .order('order_index');

    if (exercisesError) {
      console.error('Error loading exercises:', exercisesError);
      return NextResponse.json({ 
        error: 'Failed to load exercises' 
      }, { status: 500 });
    }

    // Get schema info
    const { data: schemaData, error: schemaError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('id', schemaId)
      .single();

    if (schemaError) {
      console.error('Error loading schema:', schemaError);
      return NextResponse.json({ 
        error: 'Failed to load training schema' 
      }, { status: 500 });
    }

    // Transform data to match frontend format
    const transformedExercises = exercisesData.map((ex, index) => ({
      id: ex.id,
      name: ex.exercise_name,
      targetSets: ex.sets || ex.target_sets || 4,
      reps: ex.reps?.toString() || ex.target_reps || '8-12',
      rest: `${ex.rest_time || ex.rest_time_seconds || 90}s`,
      completed: false,
      currentSet: 0,
      notes: ex.notes || undefined,
      videoUrl: ex.exercises?.video_url || undefined,
      instructions: ex.exercises?.instructions ? 
        ex.exercises.instructions.split('\n').filter(line => line.trim()) : 
        [
          "Voeten plat op de grond",
          "Controleer je houding",
          "Adem uit tijdens de krachtfase",
          "Adem in tijdens de negatieve fase"
        ],
      alternatives: [
        { name: "Machine variant", reason: "Vrije gewichten niet beschikbaar" },
        { name: "Bodyweight variant", reason: "Geen apparatuur beschikbaar" }
      ],
      sets: Array.from({ length: ex.sets || ex.target_sets || 4 }, (_, i) => ({
        prevWeight: 0,
        prevReps: 0,
        weight: "",
        reps: "",
        done: false,
        feedback: ""
      }))
    }));

    const workoutData = {
      name: `${schemaData.name} - Dag ${dayNumber}`,
      exercises: transformedExercises,
      schemaInfo: {
        id: schemaData.id,
        name: schemaData.name,
        description: schemaData.description,
        training_goal: schemaData.training_goal,
        rep_range: schemaData.rep_range,
        rest_time_seconds: schemaData.rest_time_seconds,
        equipment_type: schemaData.equipment_type
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: workoutData 
    });

  } catch (error) {
    console.error('Error in workout-data API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
