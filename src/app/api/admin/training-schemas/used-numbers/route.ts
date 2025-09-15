import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get all schema numbers that are currently in use
    const { data: schemas, error } = await supabase
      .from('training_schemas')
      .select('schema_nummer')
      .not('schema_nummer', 'is', null);

    if (error) {
      console.error('Error fetching used schema numbers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch used schema numbers' },
        { status: 500 }
      );
    }

    // Extract the used numbers
    const usedNumbers = schemas
      .map(schema => schema.schema_nummer)
      .filter(num => num !== null) as number[];

    return NextResponse.json({
      success: true,
      usedNumbers: usedNumbers
    });

  } catch (error) {
    console.error('Error in used-numbers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
