import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all nutrition plans with complete data
    const { data: plans, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nutrition plans:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch nutrition plans'
      }, { status: 500 });
    }

    // Calculate statistics - check both meals and weekly_plan structures
    const plansWithData = plans.filter(plan => {
      if (!plan.meals) return false;
      
      // Check if it has weekly_plan with actual data
      if (plan.meals.weekly_plan) {
        const weeklyPlan = plan.meals.weekly_plan;
        return Object.values(weeklyPlan).some((day: any) => {
          if (day && day.dailyTotals) {
            return day.dailyTotals.calories > 0;
          }
          return false;
        });
      }
      
      // Fallback to old structure
      return Object.keys(plan.meals).length > 0;
    });
    
    const totalDays = plans.reduce((sum, plan) => {
      if (!plan.meals) return sum;
      
      // Count days with actual data in weekly_plan
      if (plan.meals.weekly_plan) {
        const weeklyPlan = plan.meals.weekly_plan;
        return sum + Object.values(weeklyPlan).filter((day: any) => {
          return day && day.dailyTotals && day.dailyTotals.calories > 0;
        }).length;
      }
      
      // Fallback to old structure
      return sum + Object.keys(plan.meals).length;
    }, 0);

    const statistics = {
      totalPlans: plans.length,
      plansWithData: plansWithData.length,
      totalDays: totalDays,
      backupDate: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        plans: plans || [],
        statistics
      }
    });

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
