import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goal = searchParams.get('goal') || 'kracht_uithouding';
    const equipment = searchParams.get('equipment') || 'gym';

    // Get all schemas matching the goal and equipment
    const { data: schemas, error } = await supabaseAdmin
      .from('training_schemas')
      .select(`
        id,
        name,
        schema_nummer,
        training_goal,
        equipment_type,
        status,
        training_schema_days!inner(
          day_number
        )
      `)
      .eq('training_goal', goal)
      .eq('equipment_type', equipment)
      .order('schema_nummer', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count days for each schema
    const schemasWithDayCount = schemas?.map(schema => ({
      id: schema.id,
      name: schema.name,
      schema_nummer: schema.schema_nummer,
      training_goal: schema.training_goal,
      equipment_type: schema.equipment_type,
      status: schema.status,
      days_count: schema.training_schema_days?.length || 0
    })) || [];

    return NextResponse.json({
      success: true,
      query: { goal, equipment },
      schemas: schemasWithDayCount,
      total: schemasWithDayCount.length
    });

  } catch (error) {
    console.error('❌ Error in debug schemas route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

