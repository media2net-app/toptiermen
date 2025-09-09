import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing RLS policies...');

    const fixPoliciesSQL = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Admin can view all prelaunch packages" ON prelaunch_packages;
      DROP POLICY IF EXISTS "Admin can insert prelaunch packages" ON prelaunch_packages;
      DROP POLICY IF EXISTS "Admin can update prelaunch packages" ON prelaunch_packages;

      -- Create new policies that allow inserts without authentication
      CREATE POLICY "Allow inserts for payment API" ON prelaunch_packages
        FOR INSERT WITH CHECK (true);

      CREATE POLICY "Admin can view all prelaunch packages" ON prelaunch_packages
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );

      CREATE POLICY "Admin can update prelaunch packages" ON prelaunch_packages
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
          )
        );
    `;

    // Try to execute the SQL
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: fixPoliciesSQL 
    });

    if (error) {
      console.error('Error fixing RLS policies:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    console.log('✅ RLS policies fixed successfully');
    return NextResponse.json({
      success: true,
      message: 'RLS policies fixed successfully'
    });

  } catch (error) {
    console.error('Error fixing RLS policies:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
