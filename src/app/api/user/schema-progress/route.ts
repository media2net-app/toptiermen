import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching schema progress for user:', userId);

    // Get user's training profile to determine which schemas they should have access to
    const { data: profile, error: profileError } = await supabase
      .from('user_training_profiles')
      .select('training_goal, training_frequency, equipment_type')
      .eq('user_id', userId)
      .single();

    const hasProfile = !profileError && !!profile;
    if (!hasProfile) {
      console.log('⚠️ No training profile found for user, proceeding with defaults');
    }

    // Also fetch selected schema from profiles
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('selected_schema_id')
      .eq('id', userId)
      .single();

    // Get user's schema progress for the current training goal
    let progressQuery = supabase
      .from('user_training_schema_progress')
      .select(`
        schema_id,
        completed_days,
        total_days,
        current_day,
        started_at,
        completed_at,
        training_schemas!inner(
          id,
          name,
          schema_nummer,
          training_goal,
          equipment_type
        )
      `)
      .eq('user_id', userId);
    if (hasProfile) {
      progressQuery = progressQuery
        .eq('training_schemas.training_goal', (profile as any).training_goal)
        .eq('training_schemas.equipment_type', (profile as any).equipment_type);
    }
    let { data: progressData, error: progressError } = await progressQuery;

    // Fallback: if join fails, fetch plain rows then enrich with schemas
    let schemaMap: Record<string, any> = {};
    if (progressError) {
      console.log('⚠️ Error fetching progress with join, retrying without join:', progressError);
      const { data: plainProgress, error: plainErr } = await supabase
        .from('user_training_schema_progress')
        .select('schema_id, completed_days, total_days, current_day, started_at, completed_at')
        .eq('user_id', userId);
      if (plainErr) {
        console.log('❌ Plain progress fetch also failed:', plainErr);
        return NextResponse.json({
          unlockedSchemas: { 1: true, 2: false, 3: false },
          message: 'Error fetching progress'
        });
      }
      progressData = plainProgress as any[];
      const schemaIds = Array.from(new Set((plainProgress || []).map((p: any) => p.schema_id))).filter(Boolean);
      if (schemaIds.length > 0) {
        const { data: schemas, error: schErr } = await supabase
          .from('training_schemas')
          .select('id, name, schema_nummer, training_goal, equipment_type')
          .in('id', schemaIds as any);
        if (!schErr && schemas) {
          schemaMap = (schemas as any[]).reduce((acc: any, s: any) => { acc[s.id] = s; return acc; }, {});
        }
      }
    }

    // Calculate which schemas should be unlocked
    const unlockedSchemas = { 1: true, 2: false, 3: false };
    const freq = Math.max(1, (hasProfile ? (profile as any)?.training_frequency : undefined) ?? 7);
    
    let selectedSchema: any = null;
    let progress: any = null;

    if (progressData && progressData.length > 0) {
      // Find Schema 1 progress
      const schema1Progress = progressData.find((p: any) => {
        const ts: any = (p as any).training_schemas || schemaMap[p.schema_id];
        return ts && ts.schema_nummer === 1;
      });
      
      if (schema1Progress) {
        // Compute weeks from completed_days respecting training_frequency
        const totalDays1 = (schema1Progress.total_days ?? schema1Progress.completed_days ?? 0) as number;
        // If completed_at is set, treat as 8 weeks completed
        const weeksCompleted = schema1Progress.completed_at ? 8 : Math.floor(totalDays1 / freq);
        
        if (weeksCompleted >= 8) {
          unlockedSchemas[2] = true;
          
          // Check if user has completed 8 weeks of Schema 2
          const schema2Progress = progressData.find((p: any) => {
            const ts: any = (p as any).training_schemas || schemaMap[p.schema_id];
            return ts && ts.schema_nummer === 2;
          });
          if (schema2Progress) {
            const totalDays2 = (schema2Progress.total_days ?? schema2Progress.completed_days ?? 0) as number;
            const schema2WeeksCompleted = schema2Progress.completed_at ? 8 : Math.floor(totalDays2 / freq);
            if (schema2WeeksCompleted >= 8) {
              unlockedSchemas[3] = true;
            }
          }
        }
      }

      // Build selected schema + progress block for frontend (Mijn Trainingen)
      const selId = userProfile?.selected_schema_id as string | null;
      let selectedRow = selId
        ? progressData.find((p: any) => p.schema_id === selId)
        : undefined;
      if (!selectedRow) {
        selectedRow = progressData.find((p: any) => {
          const ts: any = (p as any).training_schemas || schemaMap[p.schema_id];
          return ts && ts.schema_nummer === 1;
        }) || undefined;
      }
      if (selectedRow) {
        const ts: any = (selectedRow as any).training_schemas || schemaMap[(selectedRow as any).schema_id];
        selectedSchema = ts ? {
          id: ts.id,
          name: ts.name,
          schema_nummer: ts.schema_nummer,
          training_goal: ts.training_goal,
          equipment_type: ts.equipment_type,
        } : null;
        const totalDays = (selectedRow.total_days ?? selectedRow.completed_days ?? 0) as number;
        const weeksCompleted = selectedRow.completed_at ? 8 : Math.floor(totalDays / freq);
        progress = {
          completed_days: selectedRow.completed_days ?? 0,
          total_days: totalDays,
          current_day: selectedRow.current_day ?? 1,
          started_at: selectedRow.started_at ?? null,
          completed_at: selectedRow.completed_at ?? null,
          weeksCompleted,
          isCompleted8Weeks: weeksCompleted >= 8,
        };
      }
    }

    console.log('✅ Schema progress calculated:', {
      userId,
      trainingGoal: hasProfile ? (profile as any)?.training_goal : null,
      equipmentType: hasProfile ? (profile as any)?.equipment_type : null,
      unlockedSchemas,
      progressData: progressData?.length || 0
    });

    return NextResponse.json({
      unlockedSchemas,
      trainingProfile: hasProfile ? profile : null,
      selectedSchema,
      progress,
      progressData: progressData || [],
      message: hasProfile ? 'Schema progress fetched successfully' : 'Schema progress fetched successfully (no training profile, used defaults)'
    });

  } catch (error) {
    console.error('❌ Error in schema progress GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      unlockedSchemas: { 1: true, 2: false, 3: false }
    }, { status: 500 });
  }
}
