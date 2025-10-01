import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Clones all existing nutrition plans into V2 variants with unique plan_id suffix "-v2".
// Idempotent: if a V2 copy already exists for a plan_id, it will be skipped.
export async function POST(_request: NextRequest) {
  try {
    // Fetch original plans (exclude any already suffixed with -v2)
    const { data: originals, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals
      `)
      .order('created_at', { ascending: true });

    if (fetchError) {
      return NextResponse.json({ error: `Failed to fetch plans: ${fetchError.message}` }, { status: 500 });
    }

    const basePlans = (originals || []).filter(p => !(p.plan_id || '').endsWith('-v2'));

    if (basePlans.length === 0) {
      return NextResponse.json({ success: true, message: 'No base plans found to clone', cloned: [] });
    }

    // Determine which V2 plan_ids already exist
    const { data: existingV2, error: existingError } = await supabaseAdmin
      .from('nutrition_plans')
      .select('plan_id');

    if (existingError) {
      return NextResponse.json({ error: `Failed to check existing V2 plans: ${existingError.message}` }, { status: 500 });
    }

    const existingSet = new Set((existingV2 || []).map(r => r.plan_id));

    const toInsert = basePlans
      .filter(p => !existingSet.has(`${p.plan_id}-v2`))
      .map(p => ({
        plan_id: `${p.plan_id}-v2`,
        name: p.name, // keep same display name to be an exact copy visually
        description: p.description,
        target_calories: p.target_calories,
        target_protein: p.target_protein,
        target_carbs: p.target_carbs,
        target_fat: p.target_fat,
        protein_percentage: p.protein_percentage,
        carbs_percentage: p.carbs_percentage,
        fat_percentage: p.fat_percentage,
        duration_weeks: p.duration_weeks,
        difficulty: p.difficulty,
        goal: p.goal,
        is_featured: p.is_featured,
        is_public: p.is_public,
        meals: p.meals,
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, message: 'All base plans already have V2 copies', cloned: [] });
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('nutrition_plans')
      .insert(toInsert)
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals,
        created_at,
        updated_at
      `);

    if (insertError) {
      return NextResponse.json({ error: `Failed to clone plans: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, cloned: inserted || [] });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
