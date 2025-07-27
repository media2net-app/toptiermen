import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch missions
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'active')
      .limit(10);

    if (missionsError) {
      console.log('⚠️ Error fetching missions:', missionsError.message);
    }

    // Fetch training schemas
    const { data: trainingSchemas, error: trainingError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('status', 'published')
      .limit(6);

    if (trainingError) {
      console.log('⚠️ Error fetching training schemas:', trainingError.message);
    }

    // Fetch nutrition plans
    const { data: nutritionPlans, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('status', 'active')
      .limit(6);

    if (nutritionError) {
      console.log('⚠️ Error fetching nutrition plans:', nutritionError.message);
    }

    // Fetch challenges
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('status', 'active')
      .limit(8);

    if (challengesError) {
      console.log('⚠️ Error fetching challenges:', challengesError.message);
    }

    // Return mock data if database tables don't exist
    const mockMissions = [
      {
        id: '1',
        title: 'Doe 50 push-ups',
        description: 'Versterk je bovenlichaam',
        icon: '💪',
        category: 'fitness'
      },
      {
        id: '2',
        title: 'Mediteer 10 minuten',
        description: 'Verbeter je focus en mentale gezondheid',
        icon: '🧘',
        category: 'mindset'
      },
      {
        id: '3',
        title: 'Lees 30 minuten',
        description: 'Blijf leren en groeien',
        icon: '📚',
        category: 'development'
      },
      {
        id: '4',
        title: 'Neem een koude douche',
        description: 'Versterk je discipline en immuunsysteem',
        icon: '🚿',
        category: 'discipline'
      },
      {
        id: '5',
        title: 'Maak je bed op',
        description: 'Start je dag met discipline',
        icon: '🛏️',
        category: 'discipline'
      },
      {
        id: '6',
        title: 'Drink 2L water',
        description: 'Blijf gehydrateerd',
        icon: '💧',
        category: 'health'
      },
      {
        id: '7',
        title: 'Plan je dag',
        description: 'Organiseer je taken en doelen',
        icon: '📋',
        category: 'productivity'
      },
      {
        id: '8',
        title: 'Gratitude journal',
        description: 'Schrijf 3 dingen op waar je dankbaar voor bent',
        icon: '🙏',
        category: 'mindset'
      }
    ];

    const mockTrainingSchemas = [
      {
        id: '1',
        name: 'Beginner Full Body',
        description: 'Perfect voor beginners - 3x per week full body training',
        category: 'Gym',
        difficulty: 'Beginner'
      },
      {
        id: '2',
        name: 'Intermediate Push/Pull',
        description: 'Voor gevorderden - push en pull dagen afgewisseld',
        category: 'Gym',
        difficulty: 'Intermediate'
      },
      {
        id: '3',
        name: 'Outdoor Calisthenics',
        description: 'Bodyweight training voor buiten - geen apparatuur nodig',
        category: 'Outdoor',
        difficulty: 'Beginner'
      },
      {
        id: '4',
        name: 'Advanced Strength',
        description: 'Kracht training voor ervaren sporters',
        category: 'Gym',
        difficulty: 'Advanced'
      }
    ];

    const mockNutritionPlans = [
      {
        id: '1',
        name: 'Balanced Lifestyle',
        description: 'Gebalanceerd voedingsplan voor algemene gezondheid',
        category: 'balanced'
      },
      {
        id: '2',
        name: 'Low Carb Performance',
        description: 'Koolhydraatarm plan voor vetverlies en energie',
        category: 'low_carb'
      },
      {
        id: '3',
        name: 'High Protein Muscle',
        description: 'Eiwitrijk plan voor spieropbouw',
        category: 'high_protein'
      },
      {
        id: '4',
        name: 'Carnivore Diet',
        description: 'Vlees-gebaseerd plan voor optimale gezondheid',
        category: 'carnivore'
      }
    ];

    const mockChallenges = [
      {
        id: '1',
        title: '30 Days of Push-ups',
        description: 'Doe elke dag push-ups, beginnend met 10 en oplopend',
        duration: 30,
        difficulty: 'medium'
      },
      {
        id: '2',
        title: 'Cold Shower Challenge',
        description: 'Neem 30 dagen lang koude douches',
        duration: 30,
        difficulty: 'hard'
      },
      {
        id: '3',
        title: 'Reading Habit',
        description: 'Lees 21 dagen lang minimaal 20 minuten per dag',
        duration: 21,
        difficulty: 'easy'
      },
      {
        id: '4',
        title: 'No Social Media',
        description: '30 dagen geen sociale media voor meer focus',
        duration: 30,
        difficulty: 'hard'
      },
      {
        id: '5',
        title: 'Early Bird',
        description: 'Sta 21 dagen lang om 6:00 op',
        duration: 21,
        difficulty: 'medium'
      },
      {
        id: '6',
        title: 'Gratitude Challenge',
        description: 'Schrijf 14 dagen lang 3 dankbaarheden op',
        duration: 14,
        difficulty: 'easy'
      }
    ];

    return NextResponse.json({
      missions: missions || mockMissions,
      trainingSchemas: trainingSchemas || mockTrainingSchemas,
      nutritionPlans: nutritionPlans || mockNutritionPlans,
      challenges: challenges || mockChallenges
    });

  } catch (error) {
    console.error('❌ Error in onboarding data API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 