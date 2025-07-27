import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define types for better type safety
interface UpdateTestResult {
  success: boolean;
  error: PostgrestError | Error | null;
  result: any;
}

export async function GET() {
  try {
    console.log('🔍 Debugging Rob\'s XP status...');

    // Step 1: Find Rob's user ID using exec_sql
    const { data: robUserData, error: userError } = await supabase
      .rpc('exec_sql', {
        sql_query: `SELECT id, email, created_at FROM auth.users WHERE email = 'rob@media2net.nl' LIMIT 1;`
      });

    if (userError || !robUserData || robUserData.length === 0) {
      console.error('❌ Rob user not found:', userError);
      return NextResponse.json({ 
        error: 'Rob user not found', 
        details: userError 
      }, { status: 404 });
    }

    const robUser = robUserData[0];
    console.log('✅ Found Rob:', robUser);

    // Step 2: Check Rob's XP record
    const { data: robXP, error: xpError } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', robUser.id)
      .single();

    let xpStatus = 'unknown';
    let xpRecord = null;

    if (xpError) {
      if (xpError.code === 'PGRST116') {
        console.log('⚠️  Rob has no XP record - creating one...');
        
        // Create XP record for Rob
        const { data: newXP, error: createError } = await supabase
          .from('user_xp')
          .insert({
            user_id: robUser.id,
            total_xp: 0,
            current_rank_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating XP record:', createError);
          xpStatus = 'creation_failed';
        } else {
          console.log('✅ Created XP record for Rob:', newXP);
          xpStatus = 'created';
          xpRecord = newXP;
        }
      } else {
        console.error('❌ Error checking Rob\'s XP:', xpError);
        xpStatus = 'error';
      }
    } else {
      console.log('✅ Rob\'s XP record found:', robXP);
      xpStatus = 'exists';
      xpRecord = robXP;
    }

    // Step 3: Check XP transactions
    const { data: transactions, error: txError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', robUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) {
      console.error('❌ Error checking transactions:', txError);
    } else {
      console.log(`✅ Found ${transactions?.length || 0} XP transactions for Rob`);
    }

    // Step 4: Check missions
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', robUser.id);

    if (missionsError) {
      console.error('❌ Error checking missions:', missionsError);
    } else {
      console.log(`✅ Found ${missions?.length || 0} missions for Rob`);
    }

    // Step 5: Test XP update
    let updateTest: UpdateTestResult = { success: false, error: null, result: null };
    
    if (xpRecord) {
      const testXP = 100;
      console.log(`🧪 Testing XP update: adding ${testXP} XP to Rob's account...`);
      
      try {
        const { data: updateResult, error: updateError } = await supabase
          .rpc('exec_sql', {
            sql_query: `UPDATE user_xp SET total_xp = total_xp + ${testXP}, updated_at = NOW() WHERE user_id = '${robUser.id}' RETURNING total_xp;`
          });

        if (updateError) {
          console.error('❌ Error updating XP:', updateError);
          updateTest = { success: false, error: updateError, result: null };
        } else {
          console.log('✅ XP update test successful:', updateResult);
          updateTest = { success: true, error: null, result: updateResult };
        }
      } catch (error) {
        console.error('❌ Exception during XP update test:', error);
        updateTest = { success: false, error: error as Error, result: null };
      }
    }

    // Step 6: Get final XP status
    const { data: finalXP, error: finalError } = await supabase
      .from('user_xp')
      .select('total_xp, current_rank_id, updated_at')
      .eq('user_id', robUser.id)
      .single();

    // Step 7: Check if exec_sql function exists
    let execSqlExists = false;
    try {
      const { data: functionCheck, error: functionError } = await supabase
        .rpc('exec_sql', {
          sql_query: `SELECT 1 as test`
        });

      if (!functionError) {
        execSqlExists = true;
        console.log('✅ exec_sql function exists');
      } else {
        console.log('❌ exec_sql function error:', functionError);
      }
    } catch (error) {
      console.log('❌ exec_sql function not available:', error);
    }

    // Step 8: Check RLS policies
    let rlsPolicies = [];
    try {
      const { data: policies, error: policiesError } = await supabase
        .rpc('exec_sql', {
          sql_query: `
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
            FROM pg_policies 
            WHERE tablename = 'user_xp';
          `
        });

      if (!policiesError && policies) {
        rlsPolicies = policies;
        console.log('✅ RLS policies found:', policies.length);
      } else {
        console.log('❌ Error checking RLS policies:', policiesError);
      }
    } catch (error) {
      console.log('❌ Could not check RLS policies:', error);
    }

    const result = {
      user: robUser,
      xpStatus,
      xpRecord,
      transactions: transactions || [],
      missions: missions || [],
      updateTest,
      finalXP: finalError ? null : finalXP,
      execSqlExists,
      rlsPolicies,
      summary: {
        hasUser: !!robUser,
        hasXPRecord: !!xpRecord,
        transactionCount: transactions?.length || 0,
        missionCount: missions?.length || 0,
        canUpdateXP: updateTest.success,
        execSqlAvailable: execSqlExists
      }
    };

    console.log('🎉 Debug completed:', result.summary);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔧 Fixing Rob\'s XP...');

    // Find Rob's user ID using exec_sql
    const { data: robUserData, error: userError } = await supabase
      .rpc('exec_sql', {
        sql_query: `SELECT id, email FROM auth.users WHERE email = 'rob@media2net.nl' LIMIT 1;`
      });

    if (userError || !robUserData || robUserData.length === 0) {
      return NextResponse.json({ 
        error: 'Rob user not found', 
        details: userError 
      }, { status: 404 });
    }

    const robUser = robUserData[0];

    // Ensure XP record exists
    const { data: existingXP, error: xpCheckError } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', robUser.id)
      .single();

    let xpRecord = existingXP;

    if (xpCheckError && xpCheckError.code === 'PGRST116') {
      // Create XP record
      const { data: newXP, error: createError } = await supabase
        .from('user_xp')
        .insert({
          user_id: robUser.id,
          total_xp: 0,
          current_rank_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ 
          error: 'Failed to create XP record', 
          details: createError 
        }, { status: 500 });
      }

      xpRecord = newXP;
    }

    // Add some test XP
    const testXP = 100;
    const { data: updateResult, error: updateError } = await supabase
      .rpc('exec_sql', {
        sql_query: `UPDATE user_xp SET total_xp = total_xp + ${testXP}, updated_at = NOW() WHERE user_id = '${robUser.id}' RETURNING total_xp;`
      });

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update XP', 
        details: updateError 
      }, { status: 500 });
    }

    // Log the test transaction
    const { error: txError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: robUser.id,
        xp_amount: testXP,
        source_type: 'debug_fix',
        source_id: 0,
        description: 'XP fix - added test XP',
        created_at: new Date().toISOString()
      });

    if (txError) {
      console.error('⚠️  Error logging transaction:', txError);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${testXP} XP to Rob`,
      user: robUser,
      xpRecord,
      updateResult
    });

  } catch (error) {
    console.error('❌ Error fixing XP:', error);
    return NextResponse.json({ 
      error: 'Failed to fix XP', 
      details: error 
    }, { status: 500 });
  }
} 