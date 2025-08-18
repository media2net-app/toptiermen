import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Hardcoded plannen uit de frontend
const hardcodedPlans = [
  {
    id: 'balanced',
    name: 'Gebalanceerd',
    subtitle: 'Voor duurzame energie en algehele gezondheid',
    description: 'Een mix van alle macronutriënten',
    icon: '🥗',
    color: 'from-green-500 to-emerald-600',
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
    subtitle: 'Focus op vetverbranding en een stabiele bloedsuikerspiegel',
    description: 'Minimale koolhydraten, hoog in gezonde vetten',
    icon: '🥑',
    color: 'from-purple-500 to-indigo-600',
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
    subtitle: 'Voor maximale eenvoud en het elimineren van potentiële triggers',
    description: 'Eet zoals de oprichter',
    icon: '🥩',
    color: 'from-red-500 to-orange-600',
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
    subtitle: 'Geoptimaliseerd voor maximale spieropbouw en herstel',
    description: 'Maximale eiwitinname voor spiergroei',
    icon: '💪',
    color: 'from-blue-500 to-cyan-600',
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
    const migratedPlans = [];

    for (const plan of hardcodedPlans) {
      // Controleer of plan al bestaat
      const { data: existingPlan } = await supabase
        .from('nutrition_plans')
        .select('id')
        .eq('plan_id', plan.id)
        .single();

      if (existingPlan) {
        // Update bestaand plan
        const { data: updatedPlan, error: updateError } = await supabase
          .from('nutrition_plans')
          .update({
            name: plan.name,
            subtitle: plan.subtitle,
            description: plan.description,
            icon: plan.icon,
            color: plan.color,
            meals: plan.meals,
            updated_at: new Date().toISOString()
          })
          .eq('plan_id', plan.id)
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
            plan_id: plan.id,
            name: plan.name,
            subtitle: plan.subtitle,
            description: plan.description,
            icon: plan.icon,
            color: plan.color,
            meals: plan.meals,
            is_active: true,
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
