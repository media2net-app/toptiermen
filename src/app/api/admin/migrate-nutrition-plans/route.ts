import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Hardcoded plannen uit de frontend
const hardcodedPlans = [
  {
    id: 'balanced',
    name: 'Gebalanceerd',
    description: 'Een mix van alle macronutriënten voor duurzame energie en algehele gezondheid',
    target_calories: 2000,
    target_protein: 150,
    target_carbs: 200,
    target_fat: 70,
    duration_weeks: 4,
    difficulty: 'beginner',
    goal: 'maintenance',
    is_featured: true,
    is_public: true,
    meals: [
      {
        id: 'breakfast-1',
        name: 'Havermout met Blauwe Bessen & Walnoten',
        image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Havermout', amount: 60, unit: 'gram' },
          { name: 'Melk', amount: 250, unit: 'ml' },
          { name: 'Blauwe bessen', amount: 50, unit: 'gram' },
          { name: 'Walnoten', amount: 15, unit: 'gram' }
        ],
        time: '08:00',
        type: 'breakfast'
      },
      {
        id: 'lunch-1',
        name: 'Volkoren Wrap met Kip, Groenten & Hummus',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Volkoren wrap', amount: 1, unit: 'stuk' },
          { name: 'Kipfilet', amount: 100, unit: 'gram' },
          { name: 'Paprika', amount: 50, unit: 'gram' },
          { name: 'Komkommer', amount: 50, unit: 'gram' },
          { name: 'Hummus', amount: 30, unit: 'gram' }
        ],
        time: '13:00',
        type: 'lunch'
      },
      {
        id: 'dinner-1',
        name: 'Zalmfilet met Zoete Aardappel & Broccoli',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Zalmfilet', amount: 150, unit: 'gram' },
          { name: 'Zoete aardappel', amount: 200, unit: 'gram' },
          { name: 'Broccoli', amount: 150, unit: 'gram' }
        ],
        time: '19:00',
        type: 'dinner'
      }
    ]
  },
  {
    id: 'low_carb',
    name: 'Koolhydraatarm / Keto',
    description: 'Minimale koolhydraten, hoog in gezonde vetten. Focus op vetverbranding en een stabiele bloedsuikerspiegel',
    target_calories: 1800,
    target_protein: 120,
    target_carbs: 50,
    target_fat: 140,
    duration_weeks: 4,
    difficulty: 'intermediate',
    goal: 'weight_loss',
    is_featured: true,
    is_public: true,
    meals: [
      {
        id: 'breakfast-1',
        name: 'Griekse Yoghurt met Noten & Lijnzaad',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Griekse yoghurt', amount: 200, unit: 'gram' },
          { name: 'Gemengde noten', amount: 20, unit: 'gram' },
          { name: 'Lijnzaad', amount: 10, unit: 'gram' }
        ],
        time: '08:00',
        type: 'breakfast'
      },
      {
        id: 'lunch-1',
        name: 'Omelet met Spinazie, Tomaat & Feta',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Eieren', amount: 3, unit: 'stuks' },
          { name: 'Spinazie', amount: 50, unit: 'gram' },
          { name: 'Tomaat', amount: 50, unit: 'gram' },
          { name: 'Feta', amount: 30, unit: 'gram' }
        ],
        time: '13:00',
        type: 'lunch'
      },
      {
        id: 'dinner-1',
        name: 'Kipfilet met Courgette & Avocado',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Kipfilet', amount: 150, unit: 'gram' },
          { name: 'Courgette', amount: 100, unit: 'gram' },
          { name: 'Avocado', amount: 50, unit: 'gram' }
        ],
        time: '19:00',
        type: 'dinner'
      }
    ]
  },
  {
    id: 'carnivore',
    name: 'Carnivoor (Rick\'s Aanpak)',
    description: 'Eet zoals de oprichter. Voor maximale eenvoud en het elimineren van potentiële triggers',
    target_calories: 2200,
    target_protein: 200,
    target_carbs: 20,
    target_fat: 150,
    duration_weeks: 4,
    difficulty: 'advanced',
    goal: 'muscle_gain',
    is_featured: true,
    is_public: true,
    meals: [
      {
        id: 'breakfast-1',
        name: 'Ribeye Steak',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Ribeye steak', amount: 250, unit: 'gram' },
          { name: 'Roomboter', amount: 20, unit: 'gram' },
          { name: 'Zout', amount: 5, unit: 'gram' }
        ],
        time: '08:00',
        type: 'breakfast'
      },
      {
        id: 'lunch-1',
        name: 'Kipfilet met Roomboter',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Kipfilet', amount: 200, unit: 'gram' },
          { name: 'Roomboter', amount: 30, unit: 'gram' },
          { name: 'Zout', amount: 5, unit: 'gram' }
        ],
        time: '13:00',
        type: 'lunch'
      },
      {
        id: 'dinner-1',
        name: 'Lamskotelet',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Lamskotelet', amount: 250, unit: 'gram' },
          { name: 'Roomboter', amount: 25, unit: 'gram' },
          { name: 'Zout', amount: 5, unit: 'gram' }
        ],
        time: '19:00',
        type: 'dinner'
      }
    ]
  },
  {
    id: 'high_protein',
    name: 'High Protein',
    description: 'Maximale eiwitinname voor spiergroei. Geoptimaliseerd voor maximale spieropbouw en herstel',
    target_calories: 2500,
    target_protein: 220,
    target_carbs: 180,
    target_fat: 80,
    duration_weeks: 4,
    difficulty: 'intermediate',
    goal: 'muscle_gain',
    is_featured: true,
    is_public: true,
    meals: [
      {
        id: 'breakfast-1',
        name: 'Proteïne Pannenkoeken met Kwark',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Proteïne poeder', amount: 30, unit: 'gram' },
          { name: 'Havermout', amount: 40, unit: 'gram' },
          { name: 'Ei', amount: 1, unit: 'stuks' },
          { name: 'Magere kwark', amount: 100, unit: 'gram' }
        ],
        time: '08:00',
        type: 'breakfast'
      },
      {
        id: 'lunch-1',
        name: 'Kipfilet met Quinoa & Groenten',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Kipfilet', amount: 200, unit: 'gram' },
          { name: 'Quinoa', amount: 100, unit: 'gram' },
          { name: 'Broccoli', amount: 100, unit: 'gram' },
          { name: 'Amandelen', amount: 20, unit: 'gram' }
        ],
        time: '13:00',
        type: 'lunch'
      },
      {
        id: 'dinner-1',
        name: 'Zalm met Zoete Aardappel & Spinazie',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
        ingredients: [
          { name: 'Zalmfilet', amount: 200, unit: 'gram' },
          { name: 'Zoete aardappel', amount: 150, unit: 'gram' },
          { name: 'Spinazie', amount: 100, unit: 'gram' },
          { name: 'Griekse yoghurt', amount: 50, unit: 'gram' }
        ],
        time: '19:00',
        type: 'dinner'
      }
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    // Controleer admin rechten
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Geen autorisatie' }, { status: 401 });
    }

    // Migreer elk plan naar de database
    const migratedPlans: any[] = [];

    for (const plan of hardcodedPlans) {
      // Controleer of plan al bestaat
      const { data: existingPlan } = await supabase
        .from('nutrition_plans')
        .select('id')
        .eq('name', plan.name)
        .single();

      if (existingPlan) {
        // Update bestaand plan
        const { data: updatedPlan, error: updateError } = await supabase
          .from('nutrition_plans')
          .update({
            name: plan.name,
            description: plan.description,
            target_calories: plan.target_calories || 2000,
            target_protein: plan.target_protein || 150,
            target_carbs: plan.target_carbs || 200,
            target_fat: plan.target_fat || 70,
            duration_weeks: plan.duration_weeks || 4,
            difficulty: plan.difficulty || 'beginner',
            goal: plan.goal || 'maintenance',
            is_featured: plan.is_featured || false,
            is_public: plan.is_public || true,
            updated_at: new Date().toISOString()
          })
          .eq('name', plan.name)
          .select()
          .single();

        if (updateError) {
          console.error(`Fout bij updaten plan ${plan.id}:`, updateError);
          continue;
        }

        migratedPlans.push(updatedPlan);
      } else {
        // Maak nieuw plan
        const { data: newPlan, error: insertError } = await supabase
          .from('nutrition_plans')
          .insert({
            name: plan.name,
            description: plan.description,
            target_calories: plan.target_calories || 2000,
            target_protein: plan.target_protein || 150,
            target_carbs: plan.target_carbs || 200,
            target_fat: plan.target_fat || 70,
            duration_weeks: plan.duration_weeks || 4,
            difficulty: plan.difficulty || 'beginner',
            goal: plan.goal || 'maintenance',
            is_featured: plan.is_featured || false,
            is_public: plan.is_public || true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Fout bij aanmaken plan ${plan.id}:`, insertError);
          continue;
        }

        migratedPlans.push(newPlan);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${migratedPlans.length} voedingsplannen succesvol gemigreerd`,
      plans: migratedPlans
    });

  } catch (error) {
    console.error('Fout bij migreren voedingsplannen:', error);
    return NextResponse.json(
      { error: 'Fout bij migreren voedingsplannen' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Haal alle voedingsplannen op uit de database
    const { data: plans, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      plans: plans || []
    });

  } catch (error) {
    console.error('Fout bij ophalen voedingsplannen:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen voedingsplannen' },
      { status: 500 }
    );
  }
}
