import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Save financial profile
    const { data: financialProfile, error: profileError } = await supabaseAdmin
      .from('user_financial_profiles')
      .upsert({
        user_id: userId,
        net_worth: profile.netWorth,
        monthly_income: profile.monthlyIncome,
        monthly_expenses: profile.monthlyExpenses,
        savings_rate_percentage: profile.savingsRate,
        passive_income_goal: profile.passiveIncomeGoal,
        risk_tolerance: profile.riskTolerance,
        investment_categories: profile.investmentCategories,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error saving financial profile:', profileError);
      return NextResponse.json({ error: 'Failed to save financial profile' }, { status: 500 });
    }

    // Save financial goals
    if (profile.goals && profile.goals.length > 0) {
      const goalsData = profile.goals.map((goal: any) => ({
        user_id: userId,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: 0,
        target_date: goal.targetDate,
        category: goal.category,
        status: 'active'
      }));

      const { error: goalsError } = await supabaseAdmin
        .from('financial_goals')
        .upsert(goalsData, {
          onConflict: 'user_id,title'
        });

      if (goalsError) {
        console.error('Error saving financial goals:', goalsError);
        // Don't fail the entire request if goals fail
      }
    }

    return NextResponse.json({ 
      success: true, 
      profile: financialProfile 
    });

  } catch (error) {
    console.error('Error in finance profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get financial profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching financial profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch financial profile' }, { status: 500 });
    }

    // Get financial goals
    const { data: goals, error: goalsError } = await supabaseAdmin
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error('Error fetching financial goals:', goalsError);
      // Don't fail the entire request if goals fail
    }

    // Get recent transactions
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      // Don't fail the entire request if transactions fail
    }

    return NextResponse.json({
      profile: profile || null,
      goals: goals || [],
      transactions: transactions || []
    });

  } catch (error) {
    console.error('Error in finance profile GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { goalId, currentAmount } = await request.json();

    if (!goalId || currentAmount === undefined) {
      return NextResponse.json({ error: 'Goal ID and current amount are required' }, { status: 400 });
    }

    // Update the goal's current amount
    const { data: updatedGoal, error: updateError } = await supabaseAdmin
      .from('financial_goals')
      .update({
        current_amount: currentAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating goal progress:', updateError);
      return NextResponse.json({ error: 'Failed to update goal progress' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      goal: updatedGoal 
    });

  } catch (error) {
    console.error('Error in finance profile PATCH API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
