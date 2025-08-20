import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Diagnosing videos table issues...');
    
    const diagnosis = {
      tableExists: false,
      tableStructure: null,
      sampleData: null,
      errors: [],
      recommendations: []
    };

    // 1. Check if table exists
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .limit(1);

      if (error) {
        diagnosis.errors.push(`Table access error: ${error.message}`);
        diagnosis.recommendations.push('Table may not exist or RLS policies may be blocking access');
      } else {
        diagnosis.tableExists = true;
        console.log('✅ Videos table exists');
      }
    } catch (err) {
      diagnosis.errors.push(`Table check failed: ${err}`);
      diagnosis.recommendations.push('Table does not exist - needs to be created');
    }

    // 2. Check table structure if table exists
    if (diagnosis.tableExists) {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .limit(5);

        if (error) {
          diagnosis.errors.push(`Data fetch error: ${error.message}`);
        } else {
          diagnosis.sampleData = data;
          console.log('✅ Sample data retrieved:', data?.length || 0, 'records');
        }
      } catch (err) {
        diagnosis.errors.push(`Data fetch failed: ${err}`);
      }
    }

    // 3. Check for duplicate entries that might cause 409
    if (diagnosis.tableExists) {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('original_name, count')
          .not('is_deleted', true);

        if (!error && data) {
          const duplicates = data.filter((item: any) => item.count > 1);
          if (duplicates.length > 0) {
            diagnosis.errors.push(`Duplicate entries found: ${duplicates.map((d: any) => d.original_name).join(', ')}`);
            diagnosis.recommendations.push('Remove duplicate entries or fix UNIQUE constraint');
          }
        }
      } catch (err) {
        diagnosis.errors.push(`Duplicate check failed: ${err}`);
      }
    }

    // 4. Check RLS policies
    try {
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'videos');

      if (policyError) {
        diagnosis.errors.push(`RLS policy check failed: ${policyError.message}`);
      } else {
        console.log('✅ RLS policies found:', policies?.length || 0);
      }
    } catch (err) {
      diagnosis.errors.push(`RLS policy check failed: ${err}`);
    }

    console.log('🔍 Diagnosis complete:', diagnosis);
    return NextResponse.json({ 
      success: true, 
      diagnosis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Diagnosis failed', 
      details: error 
    }, { status: 500 });
  }
}
