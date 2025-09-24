import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const equipment = searchParams.get('equipment');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('isPublic') === 'true';

    console.log('💪 Fetching workout templates...');

    let query = supabase
      .from('workout_templates')
      .select(`
        *,
        workout_categories (
          id,
          name,
          description,
          icon,
          color
        ),
        workout_template_exercises (
          id,
          order_index,
          sets,
          reps,
          rest_seconds,
          notes,
          exercises (
            id,
            name,
            description,
            instructions,
            video_url,
            image_url,
            muscle_groups,
            equipment_type,
            difficulty_level
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (isPublic) {
      query = query.eq('is_public', true);
    }

    if (userId) {
      query = query.or(`is_public.eq.true,created_by.eq.${userId}`);
    }

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty_level', difficulty);
    }

    if (equipment && equipment !== 'all') {
      query = query.contains('equipment_needed', [equipment]);
    }

    const { data: templates, error: templatesError } = await query;

    if (templatesError) {
      console.error('❌ Error fetching workout templates:', templatesError);
      return NextResponse.json({ error: 'Failed to fetch workout templates' }, { status: 500 });
    }

    // Get categories for filter dropdown
    const { data: categories, error: categoriesError } = await supabase
      .from('workout_categories')
      .select('id, name, description, icon, color')
      .order('name');

    if (categoriesError) {
      console.error('❌ Error fetching workout categories:', categoriesError);
    }

    console.log(`✅ Successfully fetched ${templates?.length || 0} workout templates`);
    return NextResponse.json({ 
      templates: templates || [], 
      categories: categories || []
    });
  } catch (error) {
    console.error('❌ Workout templates API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category_id,
      difficulty_level,
      estimated_duration_minutes,
      equipment_needed,
      target_audience,
      created_by,
      is_public,
      exercises
    } = body;

    console.log('💪 Creating workout template:', name);

    // Create workout template
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        name,
        description,
        category_id,
        difficulty_level,
        estimated_duration_minutes,
        equipment_needed,
        target_audience,
        created_by,
        is_public
      })
      .select()
      .single();

    if (templateError) {
      console.error('❌ Error creating workout template:', templateError);
      return NextResponse.json({ error: 'Failed to create workout template' }, { status: 500 });
    }

    // Create template exercises
    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((exercise: any, index: number) => ({
        template_id: template.id,
        exercise_id: exercise.exercise_id,
        order_index: index,
        sets: exercise.sets || 3,
        reps: exercise.reps || '8-12',
        rest_seconds: exercise.rest_seconds || 60,
        notes: exercise.notes || null
      }));

      const { error: exercisesError } = await supabase
        .from('workout_template_exercises')
        .insert(exercisesData);

      if (exercisesError) {
        console.error('❌ Error creating template exercises:', exercisesError);
      }
    }

    console.log('✅ Workout template created successfully:', template.id);
    return NextResponse.json({ template });
  } catch (error) {
    console.error('❌ Workout templates POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
