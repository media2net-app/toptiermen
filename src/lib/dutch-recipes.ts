// Nederlandse Recepten Database - Gratis implementatie
// Bevat populaire Nederlandse gerechten met exacte macro's
// Uitgebreid met fitness-georiënteerde maaltijden voor afvallen en spiermassa

export interface DutchIngredient {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  allergens?: string[];
  dietTags?: string[];
}

export interface DutchRecipe {
  id: string;
  name: string;
  description: string;
  mealType: 'ontbijt' | 'lunch' | 'diner' | 'snack';
  cuisine: 'nederlands' | 'internationaal';
  prepTime: number; // in minuten
  cookTime: number; // in minuten
  servings: number;
  difficulty: 'makkelijk' | 'gemiddeld' | 'moeilijk';
  image: string;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    amount: number;
    unit: string;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  dietTags: string[];
  allergens: string[];
  popularity: number;
  fitnessGoal?: 'weight-loss' | 'muscle-gain' | 'maintenance';
}

// Nederlandse ingrediënten database
export const dutchIngredients: DutchIngredient[] = [
  // Groenten
  {
    id: 'aardappel',
    name: 'Aardappel',
    category: 'groenten',
    calories: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    sugar: 0.8,
    sodium: 5,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij']
  },
  {
    id: 'wortel',
    name: 'Wortel',
    category: 'groenten',
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    sugar: 4.7,
    sodium: 69,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij']
  },
  {
    id: 'ui',
    name: 'Ui',
    category: 'groenten',
    calories: 40,
    protein: 1.1,
    carbs: 9,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.7,
    sodium: 4,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij']
  },
  {
    id: 'boerenkool',
    name: 'Boerenkool',
    category: 'groenten',
    calories: 49,
    protein: 4.3,
    carbs: 8.8,
    fat: 0.9,
    fiber: 3.6,
    sugar: 1.3,
    sodium: 38,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij']
  },
  {
    id: 'spinazie',
    name: 'Spinazie',
    category: 'groenten',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    sodium: 79,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij']
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'groenten',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    sodium: 33,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij', 'hoog-eiwit-groente']
  },
  {
    id: 'paprika',
    name: 'Paprika',
    category: 'groenten',
    calories: 31,
    protein: 1,
    carbs: 7,
    fat: 0.3,
    fiber: 2.1,
    sugar: 4.2,
    sodium: 4,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij', 'vitamine-c']
  },
  {
    id: 'courgette',
    name: 'Courgette',
    category: 'groenten',
    calories: 17,
    protein: 1.2,
    carbs: 3.1,
    fat: 0.3,
    fiber: 1,
    sugar: 2.5,
    sodium: 8,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij', 'laag-calorie']
  },
  {
    id: 'tomaat',
    name: 'Tomaat',
    category: 'groenten',
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    sugar: 2.6,
    sodium: 5,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij', 'lycopeen']
  },
  {
    id: 'komkommer',
    name: 'Komkommer',
    category: 'groenten',
    calories: 16,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    sugar: 1.7,
    sodium: 2,
    dietTags: ['vegan', 'vegetarisch', 'glutenvrij', 'hydratatie']
  },

  // Vlees
  {
    id: 'rundvlees',
    name: 'Rundvlees (mager)',
    category: 'vlees',
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    fiber: 0,
    sugar: 0,
    sodium: 72,
    dietTags: ['hoog-eiwit', 'keto', 'ijzer']
  },
  {
    id: 'kipfilet',
    name: 'Kipfilet',
    category: 'vlees',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    dietTags: ['hoog-eiwit', 'mager', 'keto', 'spiermassa']
  },
  {
    id: 'varkensvlees',
    name: 'Varkensvlees (mager)',
    category: 'vlees',
    calories: 242,
    protein: 27,
    carbs: 0,
    fat: 14,
    fiber: 0,
    sugar: 0,
    sodium: 62,
    dietTags: ['hoog-eiwit']
  },
  {
    id: 'kalkoenfilet',
    name: 'Kalkoenfilet',
    category: 'vlees',
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 1.2,
    fiber: 0,
    sugar: 0,
    sodium: 70,
    dietTags: ['hoog-eiwit', 'mager', 'keto', 'spiermassa']
  },

  // Vis
  {
    id: 'zalm',
    name: 'Zalm',
    category: 'vis',
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    dietTags: ['omega-3', 'hoog-eiwit', 'keto', 'spiermassa']
  },
  {
    id: 'tonijn',
    name: 'Tonijn',
    category: 'vis',
    calories: 144,
    protein: 30,
    carbs: 0,
    fat: 1,
    fiber: 0,
    sugar: 0,
    sodium: 39,
    dietTags: ['hoog-eiwit', 'mager', 'keto', 'spiermassa']
  },
  {
    id: 'kabeljauw',
    name: 'Kabeljauw',
    category: 'vis',
    calories: 105,
    protein: 23,
    carbs: 0,
    fat: 0.9,
    fiber: 0,
    sugar: 0,
    sodium: 78,
    dietTags: ['hoog-eiwit', 'mager', 'keto', 'spiermassa']
  },

  // Zuivel
  {
    id: 'melk',
    name: 'Melk (volle)',
    category: 'zuivel',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0,
    sugar: 4.8,
    sodium: 43,
    allergens: ['lactose'],
    dietTags: ['calcium', 'spiermassa']
  },
  {
    id: 'kaas',
    name: 'Goudse kaas',
    category: 'zuivel',
    calories: 356,
    protein: 25,
    carbs: 1.3,
    fat: 28,
    fiber: 0,
    sugar: 0.5,
    sodium: 819,
    allergens: ['lactose'],
    dietTags: ['calcium', 'hoog-eiwit', 'keto', 'spiermassa']
  },
  {
    id: 'yoghurt',
    name: 'Griekse yoghurt',
    category: 'zuivel',
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    sugar: 3.2,
    sodium: 36,
    allergens: ['lactose'],
    dietTags: ['probiotica', 'hoog-eiwit', 'spiermassa']
  },
  {
    id: 'kwark',
    name: 'Kwark (natuurlijk)',
    category: 'zuivel',
    calories: 67,
    protein: 12,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    sugar: 3.2,
    sodium: 40,
    allergens: ['lactose'],
    dietTags: ['hoog-eiwit', 'spiermassa', 'caseine']
  },
  {
    id: 'eieren',
    name: 'Eieren (heel)',
    category: 'zuivel',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    allergens: ['eieren'],
    dietTags: ['hoog-eiwit', 'spiermassa', 'vitamine-d']
  },
  {
    id: 'eiwit',
    name: 'Eiwit',
    category: 'zuivel',
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0,
    sugar: 0.7,
    sodium: 166,
    allergens: ['eieren'],
    dietTags: ['hoog-eiwit', 'mager', 'spiermassa']
  },

  // Granen
  {
    id: 'volkorenbrood',
    name: 'Volkorenbrood',
    category: 'granen',
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    fiber: 7,
    sugar: 4.7,
    sodium: 455,
    allergens: ['gluten'],
    dietTags: ['vezelrijk', 'complexe-koolhydraten']
  },
  {
    id: 'havermout',
    name: 'Havermout',
    category: 'granen',
    calories: 389,
    protein: 16.9,
    carbs: 66,
    fat: 6.9,
    fiber: 10.6,
    sugar: 0.8,
    sodium: 2,
    dietTags: ['vezelrijk', 'volkoren', 'complexe-koolhydraten', 'spiermassa']
  },
  {
    id: 'rijst',
    name: 'Bruine rijst',
    category: 'granen',
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 5,
    dietTags: ['volkoren', 'glutenvrij', 'complexe-koolhydraten']
  },
  {
    id: 'quinoa',
    name: 'Quinoa',
    category: 'granen',
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    sodium: 7,
    dietTags: ['hoog-eiwit', 'glutenvrij', 'complexe-koolhydraten', 'spiermassa']
  },
  {
    id: 'pasta-volkoren',
    name: 'Volkoren pasta',
    category: 'granen',
    calories: 124,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    fiber: 3.2,
    sugar: 0.6,
    sodium: 6,
    allergens: ['gluten'],
    dietTags: ['vezelrijk', 'complexe-koolhydraten']
  },

  // Noten & Zaden
  {
    id: 'amandelen',
    name: 'Amandelen',
    category: 'noten',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12.5,
    sugar: 4.8,
    sodium: 1,
    allergens: ['noten'],
    dietTags: ['gezond-vet', 'hoog-eiwit', 'keto', 'spiermassa']
  },
  {
    id: 'walnoten',
    name: 'Walnoten',
    category: 'noten',
    calories: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
    fiber: 6.7,
    sugar: 2.6,
    sodium: 2,
    allergens: ['noten'],
    dietTags: ['omega-3', 'gezond-vet', 'keto']
  },
  {
    id: 'pindakaas',
    name: 'Pindakaas (natuurlijk)',
    category: 'noten',
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 6,
    sugar: 9,
    sodium: 17,
    allergens: ['noten'],
    dietTags: ['hoog-eiwit', 'gezond-vet', 'spiermassa']
  },
  {
    id: 'chiazaad',
    name: 'Chiazaad',
    category: 'noten',
    calories: 486,
    protein: 17,
    carbs: 42,
    fat: 31,
    fiber: 34,
    sugar: 0,
    sodium: 16,
    dietTags: ['omega-3', 'vezelrijk', 'hoog-eiwit', 'spiermassa']
  },

  // Oliën & Vetten
  {
    id: 'olijfolie',
    name: 'Olijfolie',
    category: 'oliën',
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    dietTags: ['gezond-vet', 'keto']
  },
  {
    id: 'boter',
    name: 'Boter',
    category: 'oliën',
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    fiber: 0,
    sugar: 0.1,
    sodium: 11,
    allergens: ['lactose'],
    dietTags: ['keto']
  },
  {
    id: 'kokosolie',
    name: 'Kokosolie',
    category: 'oliën',
    calories: 862,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    dietTags: ['mct-vetten', 'keto']
  },

  // Fruit
  {
    id: 'banaan',
    name: 'Banaan',
    category: 'fruit',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    sodium: 1,
    dietTags: ['kalium', 'complexe-koolhydraten', 'spiermassa']
  },
  {
    id: 'appel',
    name: 'Appel',
    category: 'fruit',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    dietTags: ['vezelrijk', 'antioxidanten']
  },
  {
    id: 'blauwe-bessen',
    name: 'Blauwe bessen',
    category: 'fruit',
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    dietTags: ['antioxidanten', 'laag-calorie']
  }
];

// Nederlandse recepten database - Uitgebreid met 100 fitness-georiënteerde maaltijden
export const dutchRecipes: DutchRecipe[] = [
  // ===== ONTBIJTEN (25 recepten) =====
  
  // SPIERMASSA ONTBIJTEN
  {
    id: 'proteine-ontbijt-bowl',
    name: 'Proteïne Ontbijt Bowl',
    description: 'Eiwitrijk ontbijt met kwark, havermout en bessen - perfect voor spiermassa opbouwen',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 5,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'kwark', ingredientName: 'Kwark (natuurlijk)', amount: 200, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 50, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Meng kwark met havermout in een kom',
      'Snijd banaan in plakjes en voeg toe',
      'Garneer met blauwe bessen en gehakte amandelen',
      'Laat 5 minuten staan zodat havermout zacht wordt'
    ],
    nutrition: {
      calories: 420,
      protein: 35,
      carbs: 45,
      fat: 12,
      fiber: 8,
      sugar: 20,
      sodium: 45
    },
    dietTags: ['hoog-eiwit', 'spiermassa', 'vezelrijk'],
    allergens: ['lactose'],
    popularity: 92,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'eiwit-omelet-groenten',
    name: 'Eiwit Omelet met Groenten',
    description: 'Mager eiwitrijke omelet met verse groenten - ideaal voor afvallen',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'eiwit', ingredientName: 'Eiwit', amount: 200, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 50, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 5, unit: 'ml' }
    ],
    instructions: [
      'Klop eiwitten los in een kom',
      'Snijd groenten fijn',
      'Verhit olijfolie in een pan',
      'Voeg groenten toe en bak 2 minuten',
      'Giet eiwitten erover en bak tot gaar'
    ],
    nutrition: {
      calories: 180,
      protein: 28,
      carbs: 8,
      fat: 6,
      fiber: 3,
      sugar: 4,
      sodium: 380
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: ['eieren'],
    popularity: 88,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'havermout-banaan-noten',
    name: 'Havermout met Banaan en Noten',
    description: 'Energierijk ontbijt met complexe koolhydraten en gezonde vetten',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 80, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 200, unit: 'ml' }
    ],
    instructions: [
      'Kook havermout met melk tot zacht',
      'Snijd banaan in plakjes',
      'Garneer met gehakte amandelen',
      'Serveer warm'
    ],
    nutrition: {
      calories: 380,
      protein: 15,
      carbs: 65,
      fat: 12,
      fiber: 9,
      sugar: 25,
      sodium: 120
    },
    dietTags: ['complexe-koolhydraten', 'spiermassa', 'vezelrijk'],
    allergens: ['lactose'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kwark-bessen-granola',
    name: 'Kwark met Bessen en Granola',
    description: 'Eiwitrijk ontbijt met antioxidanten en crunch',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'kwark', ingredientName: 'Kwark', amount: 200, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 30, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Schep kwark in een kom',
      'Voeg bessen toe',
      'Garneer met havermout en honing'
    ],
    nutrition: {
      calories: 280,
      protein: 26,
      carbs: 25,
      fat: 8,
      fiber: 4,
      sugar: 18,
      sodium: 80
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'eieren-volkoren-toast',
    name: 'Eieren op Volkoren Toast',
    description: 'Klassiek eiwitrijk ontbijt met vezels',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 5,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenbrood', amount: 60, unit: 'g' },
      { ingredientId: 'boter', ingredientName: 'Boter', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Bak eieren in boter',
      'Rooster volkorenbrood',
      'Serveer eieren op toast'
    ],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 25,
      fat: 18,
      fiber: 4,
      sugar: 3,
      sodium: 380
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['eieren', 'gluten', 'lactose'],
    popularity: 82,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'smoothie-bowl-groen',
    name: 'Groene Smoothie Bowl',
    description: 'Vitamine-rijk ontbijt met spinazie en fruit',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-smoothie.jpg',
    ingredients: [
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 50, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 150, unit: 'g' },
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Blend spinazie, banaan en yoghurt',
      'Giet in kom',
      'Garneer met chiazaad'
    ],
    nutrition: {
      calories: 220,
      protein: 18,
      carbs: 30,
      fat: 6,
      fiber: 6,
      sugar: 20,
      sodium: 60
    },
    dietTags: ['vitamine-rijk', 'antioxidanten', 'laag-calorie'],
    allergens: ['lactose'],
    popularity: 84,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'pannenkoeken-eiwit',
    name: 'Eiwitrijke Pannenkoeken',
    description: 'Nederlandse pannenkoeken met extra eiwit',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'eiwit', ingredientName: 'Eiwit', amount: 200, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 60, unit: 'g' },
      { ingredientId: 'kwark', ingredientName: 'Kwark', amount: 100, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Meng alle ingrediënten tot beslag',
      'Bak pannenkoeken in hete pan',
      'Serveer met fruit'
    ],
    nutrition: {
      calories: 280,
      protein: 32,
      carbs: 35,
      fat: 4,
      fiber: 5,
      sugar: 8,
      sodium: 200
    },
    dietTags: ['hoog-eiwit', 'mager', 'spiermassa'],
    allergens: ['eieren', 'lactose'],
    popularity: 86,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-burrito',
    name: 'Ontbijt Burrito',
    description: 'Mexicaans geïnspireerd eiwitrijk ontbijt',
    mealType: 'ontbijt',
    cuisine: 'internationaal',
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 80, unit: 'g' },
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren tortilla', amount: 50, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Bak eieren en kip',
      'Warm tortilla op',
      'Vul met eieren, kip en groenten',
      'Rol op en serveer'
    ],
    nutrition: {
      calories: 380,
      protein: 35,
      carbs: 25,
      fat: 15,
      fiber: 4,
      sugar: 3,
      sodium: 420
    },
    dietTags: ['hoog-eiwit', 'spiermassa'],
    allergens: ['eieren', 'gluten'],
    popularity: 83,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'yoghurt-parfait',
    name: 'Yoghurt Parfait',
    description: 'Gelaagd ontbijt met yoghurt, fruit en noten',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 200, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Laag yoghurt in glas',
      'Voeg fruit toe',
      'Garneer met noten en havermout'
    ],
    nutrition: {
      calories: 320,
      protein: 22,
      carbs: 25,
      fat: 15,
      fiber: 6,
      sugar: 18,
      sodium: 80
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 89,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-sandwich',
    name: 'Eiwitrijke Ontbijt Sandwich',
    description: 'Gevulde sandwich met eieren en groenten',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenbrood', amount: 80, unit: 'g' },
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 30, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Bak eieren',
      'Rooster brood',
      'Beleg met eieren en groenten'
    ],
    nutrition: {
      calories: 340,
      protein: 20,
      carbs: 35,
      fat: 12,
      fiber: 6,
      sugar: 4,
      sodium: 450
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['eieren', 'gluten'],
    popularity: 81,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'chia-pudding',
    name: 'Chia Pudding',
    description: 'Vezelrijk ontbijt met chiazaad en fruit',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 30, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 200, unit: 'ml' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Meng chiazaad met melk',
      'Laat 4 uur in koelkast staan',
      'Garneer met fruit en noten'
    ],
    nutrition: {
      calories: 280,
      protein: 12,
      carbs: 35,
      fat: 12,
      fiber: 12,
      sugar: 20,
      sodium: 100
    },
    dietTags: ['vezelrijk', 'omega-3', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-wraps',
    name: 'Ontbijt Wraps',
    description: 'Gevulde wraps met eieren en groenten',
    mealType: 'ontbijt',
    cuisine: 'internationaal',
    prepTime: 12,
    cookTime: 8,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren tortilla', amount: 60, unit: 'g' },
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 50, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Bak eieren met groenten',
      'Warm tortilla op',
      'Vul en rol op'
    ],
    nutrition: {
      calories: 300,
      protein: 18,
      carbs: 30,
      fat: 12,
      fiber: 4,
      sugar: 3,
      sodium: 380
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['eieren', 'gluten'],
    popularity: 82,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-salade',
    name: 'Ontbijt Salade',
    description: 'Lichte salade met eieren en groenten',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 5,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 50, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 50, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Kook eieren hard',
      'Snijd groenten',
      'Meng alles in kom'
    ],
    nutrition: {
      calories: 180,
      protein: 16,
      carbs: 8,
      fat: 10,
      fiber: 3,
      sugar: 4,
      sodium: 200
    },
    dietTags: ['hoog-eiwit', 'laag-calorie', 'mager'],
    allergens: ['eieren'],
    popularity: 78,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'ontbijt-smoothie',
    name: 'Ontbijt Smoothie',
    description: 'Vullende smoothie met eiwit en vezels',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-smoothie.jpg',
    ingredients: [
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 150, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 30, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Doe alle ingrediënten in blender',
      'Mix tot gladde smoothie',
      'Serveer direct'
    ],
    nutrition: {
      calories: 320,
      protein: 20,
      carbs: 40,
      fat: 12,
      fiber: 6,
      sugar: 25,
      sodium: 80
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 86,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-bowl-vegan',
    name: 'Vegan Ontbijt Bowl',
    description: 'Plantaardig ontbijt met quinoa en fruit',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'quinoa', ingredientName: 'Quinoa', amount: 80, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Kook quinoa',
      'Snijd fruit',
      'Meng alles in kom',
      'Garneer met noten'
    ],
    nutrition: {
      calories: 380,
      protein: 12,
      carbs: 65,
      fat: 12,
      fiber: 8,
      sugar: 25,
      sodium: 10
    },
    dietTags: ['vegan', 'hoog-eiwit', 'vezelrijk'],
    allergens: ['noten'],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-pap',
    name: 'Havermout Pap',
    description: 'Traditionele Nederlandse havermout pap',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 100, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 300, unit: 'ml' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Kook havermout met melk',
      'Roer tot pap dik wordt',
      'Voeg honing toe'
    ],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 70,
      fat: 12,
      fiber: 10,
      sugar: 30,
      sodium: 150
    },
    dietTags: ['complexe-koolhydraten', 'vezelrijk', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 88,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-granola',
    name: 'Zelfgemaakte Granola',
    description: 'Gezonde granola met noten en zaden',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: 'gemiddeld',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 200, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 50, unit: 'g' },
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 20, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Meng alle ingrediënten',
      'Bak 25 minuten op 180°C',
      'Laat afkoelen en bewaar'
    ],
    nutrition: {
      calories: 180,
      protein: 8,
      carbs: 25,
      fat: 8,
      fiber: 4,
      sugar: 8,
      sodium: 5
    },
    dietTags: ['vezelrijk', 'omega-3', 'spiermassa'],
    allergens: [],
    popularity: 82,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-muesli',
    name: 'Muesli met Yoghurt',
    description: 'Klassieke muesli met verse yoghurt',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 60, unit: 'g' },
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 200, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Meng havermout met yoghurt',
      'Snijd banaan in plakjes',
      'Garneer met noten'
    ],
    nutrition: {
      calories: 340,
      protein: 20,
      carbs: 45,
      fat: 12,
      fiber: 6,
      sugar: 25,
      sodium: 100
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-toast',
    name: 'Avocado Toast',
    description: 'Trendy toast met avocado en ei',
    mealType: 'ontbijt',
    cuisine: 'internationaal',
    prepTime: 8,
    cookTime: 5,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenbrood', amount: 60, unit: 'g' },
      { ingredientId: 'avocado', ingredientName: 'Avocado', amount: 50, unit: 'g' },
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 50, unit: 'g' },
      { ingredientId: 'zout', ingredientName: 'Zout', amount: 2, unit: 'g' }
    ],
    instructions: [
      'Rooster brood',
      'Prak avocado',
      'Bak ei',
      'Beleg toast met avocado en ei'
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 25,
      fat: 20,
      fiber: 6,
      sugar: 2,
      sodium: 400
    },
    dietTags: ['gezond-vet', 'vezelrijk', 'spiermassa'],
    allergens: ['eieren', 'gluten'],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-pannenkoeken-gezond',
    name: 'Gezonde Pannenkoeken',
    description: 'Pannenkoeken met volkorenmeel en fruit',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenmeel', amount: 100, unit: 'g' },
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 200, unit: 'ml' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' }
    ],
    instructions: [
      'Meng ingrediënten tot beslag',
      'Bak pannenkoeken',
      'Serveer met fruit'
    ],
    nutrition: {
      calories: 280,
      protein: 15,
      carbs: 45,
      fat: 8,
      fiber: 6,
      sugar: 15,
      sodium: 200
    },
    dietTags: ['vezelrijk', 'complexe-koolhydraten', 'spiermassa'],
    allergens: ['eieren', 'gluten', 'lactose'],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-wentelteefjes',
    name: 'Gezonde Wentelteefjes',
    description: 'Nederlandse wentelteefjes met volkorenbrood',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 8,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenbrood', amount: 120, unit: 'g' },
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 100, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 100, unit: 'ml' },
      { ingredientId: 'kaneel', ingredientName: 'Kaneel', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Klop eieren met melk en kaneel',
      'Doop brood in mengsel',
      'Bak in pan tot goudbruin'
    ],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 40,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 350
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['eieren', 'gluten', 'lactose'],
    popularity: 83,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'ontbijt-broodje-gezond',
    name: 'Gezond Broodje',
    description: 'Volkoren broodje met eiwitrijke vulling',
    mealType: 'ontbijt',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 5,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/eiwit-omelet.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenbrood', amount: 80, unit: 'g' },
      { ingredientId: 'kaas', ingredientName: 'Goudse kaas', amount: 30, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 50, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Snijd brood open',
      'Beleg met kaas en groenten',
      'Serveer'
    ],
    nutrition: {
      calories: 280,
      protein: 15,
      carbs: 35,
      fat: 12,
      fiber: 6,
      sugar: 4,
      sodium: 450
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['gluten', 'lactose'],
    popularity: 80,
    fitnessGoal: 'muscle-gain'
  },

  // ===== LUNCH (25 recepten) =====
  
  // SPIERMASSA LUNCH
  {
    id: 'quinoa-kip-bowl',
    name: 'Quinoa Kip Bowl',
    description: 'Eiwitrijke bowl met quinoa, kip en groenten - perfect voor spiermassa',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'quinoa', ingredientName: 'Quinoa', amount: 100, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Kook quinoa volgens verpakking',
      'Gril kipfilet tot gaar',
      'Stoom broccoli en paprika',
      'Snijd kip in stukjes',
      'Meng alles in een kom'
    ],
    nutrition: {
      calories: 480,
      protein: 52,
      carbs: 45,
      fat: 15,
      fiber: 8,
      sugar: 6,
      sodium: 220
    },
    dietTags: ['hoog-eiwit', 'complexe-koolhydraten', 'spiermassa'],
    allergens: [],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kipfilet-salade',
    name: 'Kipfilet Salade',
    description: 'Mager eiwitrijke salade met kipfilet en verse groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 12,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 100, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Gril kipfilet 12 minuten tot gaar',
      'Snijd alle groenten in stukjes',
      'Meng groenten in een kom',
      'Snijd kip in reepjes en voeg toe',
      'Besprenkel met olijfolie en breng op smaak'
    ],
    nutrition: {
      calories: 320,
      protein: 48,
      carbs: 12,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 180
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: [],
    popularity: 90,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'zalm-groenten',
    name: 'Gegrilde Zalm met Groenten',
    description: 'Omega-3 rijke lunch met zalm en gestoomde groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Zalmfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'sperziebonen', ingredientName: 'Sperziebonen', amount: 100, unit: 'g' },
      { ingredientId: 'citroen', ingredientName: 'Citroen', amount: 20, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Gril zalm 12 minuten tot gaar',
      'Stoom broccoli en sperziebonen',
      'Besprenkel met citroensap en olijfolie',
      'Serveer met verse kruiden'
    ],
    nutrition: {
      calories: 380,
      protein: 42,
      carbs: 15,
      fat: 18,
      fiber: 8,
      sugar: 6,
      sodium: 280
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['vis'],
    popularity: 92,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kalkoen-wok',
    name: 'Kalkoen Wok met Groenten',
    description: 'Snelle wok met mager kalkoen en verse groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 12,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kalkoen-wok.jpg',
    ingredients: [
      { ingredientId: 'kalkoen', ingredientName: 'Kalkoenfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'sojasaus', ingredientName: 'Sojasaus', amount: 15, unit: 'ml' }
    ],
    instructions: [
      'Snijd kalkoen in reepjes',
      'Verhit wokpan met olie',
      'Bak kalkoen 5 minuten',
      'Voeg groenten toe en wok 7 minuten',
      'Breng op smaak met sojasaus'
    ],
    nutrition: {
      calories: 320,
      protein: 45,
      carbs: 18,
      fat: 8,
      fiber: 6,
      sugar: 8,
      sodium: 420
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: ['soja'],
    popularity: 85,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'tuna-salade',
    name: 'Tonijn Salade',
    description: 'Eiwitrijke salade met verse tonijn en groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'tonijn', ingredientName: 'Tonijn in water', amount: 120, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 100, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Laat tonijn uitlekken',
      'Snijd groenten in stukjes',
      'Meng alles in een kom',
      'Besprenkel met olijfolie'
    ],
    nutrition: {
      calories: 280,
      protein: 38,
      carbs: 10,
      fat: 12,
      fiber: 4,
      sugar: 6,
      sodium: 320
    },
    dietTags: ['hoog-eiwit', 'omega-3', 'mager'],
    allergens: ['vis'],
    popularity: 87,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'eieren-salade',
    name: 'Eieren Salade',
    description: 'Klassieke eieren salade met groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'eieren', ingredientName: 'Eieren', amount: 150, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 100, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'mayonaise', ingredientName: 'Lichte mayonaise', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Kook eieren hard',
      'Snijd eieren en groenten',
      'Meng met mayonaise',
      'Serveer op spinazie'
    ],
    nutrition: {
      calories: 320,
      protein: 24,
      carbs: 8,
      fat: 22,
      fiber: 4,
      sugar: 4,
      sodium: 380
    },
    dietTags: ['hoog-eiwit', 'spiermassa'],
    allergens: ['eieren'],
    popularity: 83,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-wraps',
    name: 'Kip Wraps',
    description: 'Gevulde wraps met kip en groenten',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 12,
    cookTime: 10,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren tortilla', amount: 80, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 120, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Gril kipfilet',
      'Snijd groenten',
      'Warm tortilla op',
      'Vul met kip en groenten',
      'Rol op en serveer'
    ],
    nutrition: {
      calories: 380,
      protein: 35,
      carbs: 35,
      fat: 12,
      fiber: 6,
      sugar: 6,
      sodium: 420
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['gluten', 'lactose'],
    popularity: 86,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'zalm-salade',
    name: 'Zalm Salade',
    description: 'Luxe salade met gerookte zalm',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Gerookte zalm', amount: 100, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 100, unit: 'g' },
      { ingredientId: 'avocado', ingredientName: 'Avocado', amount: 50, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'citroen', ingredientName: 'Citroen', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Snijd zalm en groenten',
      'Meng in kom',
      'Besprenkel met citroensap',
      'Serveer'
    ],
    nutrition: {
      calories: 320,
      protein: 28,
      carbs: 8,
      fat: 20,
      fiber: 6,
      sugar: 4,
      sodium: 280
    },
    dietTags: ['omega-3', 'gezond-vet', 'spiermassa'],
    allergens: ['vis'],
    popularity: 89,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-curry',
    name: 'Milde Kip Curry',
    description: 'Gezonde curry met kip en groenten',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/kalkoen-wok.jpg',
    ingredients: [
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'curry', ingredientName: 'Curry poeder', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Snijd kip in stukjes',
      'Bak ui en kip',
      'Voeg groenten toe',
      'Kruid met curry',
      'Laat 15 minuten sudderen'
    ],
    nutrition: {
      calories: 350,
      protein: 42,
      carbs: 20,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 280
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'spiermassa'],
    allergens: [],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'tuna-sandwich',
    name: 'Tonijn Sandwich',
    description: 'Volkoren sandwich met tonijn',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkorenbrood', amount: 120, unit: 'g' },
      { ingredientId: 'tonijn', ingredientName: 'Tonijn in water', amount: 100, unit: 'g' },
      { ingredientId: 'mayonaise', ingredientName: 'Lichte mayonaise', amount: 15, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 50, unit: 'g' },
      { ingredientId: 'sla', ingredientName: 'Sla', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Meng tonijn met mayonaise',
      'Beleg brood met tonijn',
      'Voeg groenten toe',
      'Serveer'
    ],
    nutrition: {
      calories: 380,
      protein: 32,
      carbs: 40,
      fat: 12,
      fiber: 6,
      sugar: 4,
      sodium: 480
    },
    dietTags: ['hoog-eiwit', 'omega-3', 'spiermassa'],
    allergens: ['gluten', 'vis'],
    popularity: 82,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-pasta',
    name: 'Kip Pasta',
    description: 'Volkoren pasta met kip en groenten',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren pasta', amount: 100, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 120, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Kook pasta volgens verpakking',
      'Gril kipfilet',
      'Stoom broccoli',
      'Meng alles met olijfolie'
    ],
    nutrition: {
      calories: 420,
      protein: 38,
      carbs: 55,
      fat: 12,
      fiber: 8,
      sugar: 6,
      sodium: 280
    },
    dietTags: ['hoog-eiwit', 'complexe-koolhydraten', 'spiermassa'],
    allergens: ['gluten'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'zalm-pasta',
    name: 'Zalm Pasta',
    description: 'Pasta met zalm en groenten',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren pasta', amount: 100, unit: 'g' },
      { ingredientId: 'zalm', ingredientName: 'Zalmfilet', amount: 120, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'citroen', ingredientName: 'Citroen', amount: 20, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Kook pasta',
      'Gril zalm',
      'Stoom broccoli',
      'Meng met citroen en olijfolie'
    ],
    nutrition: {
      calories: 450,
      protein: 40,
      carbs: 55,
      fat: 15,
      fiber: 8,
      sugar: 4,
      sodium: 320
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['gluten', 'vis'],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-rijst',
    name: 'Kip met Rijst',
    description: 'Bruine rijst met kip en groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'rijst', ingredientName: 'Bruine rijst', amount: 100, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'sojasaus', ingredientName: 'Sojasaus', amount: 15, unit: 'ml' }
    ],
    instructions: [
      'Kook bruine rijst',
      'Gril kipfilet',
      'Stoom groenten',
      'Meng alles met sojasaus'
    ],
    nutrition: {
      calories: 480,
      protein: 45,
      carbs: 65,
      fat: 8,
      fiber: 8,
      sugar: 6,
      sodium: 380
    },
    dietTags: ['hoog-eiwit', 'complexe-koolhydraten', 'spiermassa'],
    allergens: ['soja'],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'tuna-rijst',
    name: 'Tonijn met Rijst',
    description: 'Bruine rijst met tonijn en groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 25,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'rijst', ingredientName: 'Bruine rijst', amount: 100, unit: 'g' },
      { ingredientId: 'tonijn', ingredientName: 'Tonijn in water', amount: 120, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Kook bruine rijst',
      'Laat tonijn uitlekken',
      'Stoom groenten',
      'Meng alles met olijfolie'
    ],
    nutrition: {
      calories: 420,
      protein: 38,
      carbs: 65,
      fat: 8,
      fiber: 8,
      sugar: 6,
      sodium: 320
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['vis'],
    popularity: 83,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-soep',
    name: 'Kip Soep',
    description: 'Huisgemaakte kippensoep met groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 200, unit: 'g' },
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'selderij', ingredientName: 'Selderij', amount: 50, unit: 'g' },
      { ingredientId: 'bouillon', ingredientName: 'Kippenbouillon', amount: 500, unit: 'ml' }
    ],
    instructions: [
      'Snijd groenten',
      'Kook bouillon',
      'Voeg kip en groenten toe',
      'Laat 25 minuten koken'
    ],
    nutrition: {
      calories: 280,
      protein: 35,
      carbs: 15,
      fat: 8,
      fiber: 4,
      sugar: 6,
      sodium: 480
    },
    dietTags: ['hoog-eiwit', 'hydraterend', 'spiermassa'],
    allergens: [],
    popularity: 86,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'zalm-soep',
    name: 'Zalm Soep',
    description: 'Romige zalmsoep met groenten',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Zalmfilet', amount: 200, unit: 'g' },
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 200, unit: 'ml' },
      { ingredientId: 'bouillon', ingredientName: 'Visbouillon', amount: 300, unit: 'ml' }
    ],
    instructions: [
      'Snijd groenten',
      'Kook bouillon',
      'Voeg zalm en groenten toe',
      'Voeg melk toe en pureer'
    ],
    nutrition: {
      calories: 320,
      protein: 38,
      carbs: 12,
      fat: 15,
      fiber: 3,
      sugar: 8,
      sodium: 420
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['vis', 'lactose'],
    popularity: 88,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-burger',
    name: 'Kip Burger',
    description: 'Gezonde kipburger met volkoren broodje',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 15,
    cookTime: 12,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren broodje', amount: 80, unit: 'g' },
      { ingredientId: 'sla', ingredientName: 'Sla', amount: 30, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 50, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Vorm kip tot burger',
      'Gril 12 minuten',
      'Beleg broodje met groenten',
      'Serveer'
    ],
    nutrition: {
      calories: 380,
      protein: 42,
      carbs: 35,
      fat: 10,
      fiber: 6,
      sugar: 4,
      sodium: 420
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: ['gluten'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'zalm-burger',
    name: 'Zalm Burger',
    description: 'Gezonde zalmburger met volkoren broodje',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 15,
    cookTime: 12,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Zalmfilet', amount: 150, unit: 'g' },
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren broodje', amount: 80, unit: 'g' },
      { ingredientId: 'sla', ingredientName: 'Sla', amount: 30, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 50, unit: 'g' },
      { ingredientId: 'citroen', ingredientName: 'Citroen', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Vorm zalm tot burger',
      'Gril 12 minuten',
      'Beleg broodje met groenten',
      'Besprenkel met citroen'
    ],
    nutrition: {
      calories: 400,
      protein: 40,
      carbs: 35,
      fat: 15,
      fiber: 6,
      sugar: 4,
      sodium: 380
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['gluten', 'vis'],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-pizza',
    name: 'Kip Pizza',
    description: 'Gezonde pizza met kip en groenten',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 20,
    cookTime: 15,
    servings: 1,
    difficulty: 'moeilijk',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren pizzadeeg', amount: 150, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 120, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'kaas', ingredientName: 'Geraspte kaas', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Rol deeg uit',
      'Beleg met tomatensaus',
      'Voeg kip en groenten toe',
      'Besprenkel met kaas',
      'Bak 15 minuten'
    ],
    nutrition: {
      calories: 480,
      protein: 35,
      carbs: 55,
      fat: 18,
      fiber: 8,
      sugar: 6,
      sodium: 520
    },
    dietTags: ['hoog-eiwit', 'complexe-koolhydraten', 'spiermassa'],
    allergens: ['gluten', 'lactose'],
    popularity: 89,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-lasagne',
    name: 'Kip Lasagne',
    description: 'Gezonde lasagne met kip en groenten',
    mealType: 'lunch',
    cuisine: 'internationaal',
    prepTime: 25,
    cookTime: 30,
    servings: 2,
    difficulty: 'moeilijk',
    image: '/images/recipes/quinoa-kip-bowl.jpg',
    ingredients: [
      { ingredientId: 'volkorenbrood', ingredientName: 'Volkoren lasagnebladen', amount: 120, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 200, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 200, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 100, unit: 'g' },
      { ingredientId: 'kaas', ingredientName: 'Geraspte kaas', amount: 80, unit: 'g' }
    ],
    instructions: [
      'Bak kip en ui',
      'Maak tomatensaus',
      'Laag lasagnebladen, kip, saus',
      'Besprenkel met kaas',
      'Bak 30 minuten'
    ],
    nutrition: {
      calories: 520,
      protein: 42,
      carbs: 45,
      fat: 22,
      fiber: 8,
      sugar: 8,
      sodium: 580
    },
    dietTags: ['hoog-eiwit', 'complexe-koolhydraten', 'spiermassa'],
    allergens: ['gluten', 'lactose'],
    popularity: 91,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-stamppot',
    name: 'Kip Stamppot',
    description: 'Nederlandse stamppot met kip',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/stamppot-boenkool-fitness.jpg',
    ingredients: [
      { ingredientId: 'aardappel', ingredientName: 'Aardappelen', amount: 300, unit: 'g' },
      { ingredientId: 'boerenkool', ingredientName: 'Boerenkool', amount: 200, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 200, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'boter', ingredientName: 'Boter', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Kook aardappelen',
      'Stoom boerenkool',
      'Gril kipfilet',
      'Stamp alles samen',
      'Breng op smaak'
    ],
    nutrition: {
      calories: 480,
      protein: 38,
      carbs: 55,
      fat: 15,
      fiber: 10,
      sugar: 6,
      sodium: 320
    },
    dietTags: ['nederlands', 'hoog-eiwit', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 88,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kip-hutspot',
    name: 'Kip Hutspot',
    description: 'Nederlandse hutspot met kip',
    mealType: 'lunch',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    difficulty: 'gemiddeld',
    image: '/images/recipes/hutspot-fitness.jpg',
    ingredients: [
      { ingredientId: 'aardappel', ingredientName: 'Aardappelen', amount: 300, unit: 'g' },
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 200, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 100, unit: 'g' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 200, unit: 'g' },
      { ingredientId: 'boter', ingredientName: 'Boter', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Kook aardappelen en wortel',
      'Bak ui',
      'Gril kipfilet',
      'Stamp alles samen',
      'Breng op smaak'
    ],
    nutrition: {
      calories: 460,
      protein: 38,
      carbs: 60,
      fat: 12,
      fiber: 12,
      sugar: 8,
      sodium: 280
    },
    dietTags: ['nederlands', 'hoog-eiwit', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 86,
    fitnessGoal: 'muscle-gain'
  },

  // FITNESS DINER - Spiermassa & Afvallen
  {
    id: 'zalm-met-groenten',
    name: 'Gegrilde Zalm met Groenten',
    description: 'Omega-3 rijke zalm met gestoomde groenten - ideaal voor herstel',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Zalm', amount: 200, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 150, unit: 'g' },
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Verhit oven op 200°C',
      'Leg zalm op bakplaat met olijfolie',
      'Bak 15 minuten tot gaar',
      'Stoom broccoli en wortelen',
      'Serveer samen'
    ],
    nutrition: {
      calories: 450,
      protein: 52,
      carbs: 18,
      fat: 22,
      fiber: 8,
      sugar: 8,
      sodium: 180
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['vis'],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kalkoen-wok-groenten',
    name: 'Kalkoen Wok met Groenten',
    description: 'Mager kalkoen met wokgroenten - perfect voor afvallen',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 12,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kalkoen-wok.jpg',
    ingredients: [
      { ingredientId: 'kalkoenfilet', ingredientName: 'Kalkoenfilet', amount: 200, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 150, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'courgette', ingredientName: 'Courgette', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Snijd kalkoen in reepjes',
      'Snijd alle groenten',
      'Verhit olijfolie in wokpan',
      'Bak kalkoen 5 minuten',
      'Voeg groenten toe en wok 7 minuten'
    ],
    nutrition: {
      calories: 380,
      protein: 62,
      carbs: 15,
      fat: 12,
      fiber: 8,
      sugar: 8,
      sodium: 160
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: [],
    popularity: 82,
    fitnessGoal: 'weight-loss'
  },

  // FITNESS SNACKS - Spiermassa & Afvallen
  {
    id: 'proteine-smoothie',
    name: 'Proteïne Smoothie',
    description: 'Eiwitrijke smoothie met banaan en bessen - perfect na training',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-smoothie.jpg',
    ingredients: [
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 200, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Doe alle ingrediënten in blender',
      'Mix tot gladde smoothie',
      'Serveer direct'
    ],
    nutrition: {
      calories: 280,
      protein: 22,
      carbs: 35,
      fat: 8,
      fiber: 5,
      sugar: 25,
      sodium: 40
    },
    dietTags: ['hoog-eiwit', 'spiermassa', 'post-workout'],
    allergens: ['lactose'],
    popularity: 89,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kwark-met-noten',
    name: 'Kwark met Noten',
    description: 'Eenvoudige eiwitrijke snack - ideaal voor afvallen',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 2,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'kwark', ingredientName: 'Kwark (natuurlijk)', amount: 200, unit: 'g' },
      { ingredientId: 'walnoten', ingredientName: 'Walnoten', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Schep kwark in kom',
      'Hak walnoten fijn',
      'Garneer kwark met noten'
    ],
    nutrition: {
      calories: 220,
      protein: 26,
      carbs: 8,
      fat: 12,
      fiber: 2,
      sugar: 6,
      sodium: 80
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: ['lactose'],
    popularity: 84,
    fitnessGoal: 'weight-loss'
  },

  // KLASSIEKE NEDERLANDSE GERECHTEN (aangepast voor fitness)
  {
    id: 'stamppot-boenkool-fitness',
    name: 'Stamppot Boerenkool (Fitness Versie)',
    description: 'Klassieke stamppot met extra eiwit en minder vet - aangepast voor fitness doelen',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'makkelijk',
    image: '/images/recipes/stamppot-boenkool-fitness.jpg',
    ingredients: [
      { ingredientId: 'aardappel', ingredientName: 'Aardappel', amount: 800, unit: 'g' },
      { ingredientId: 'boerenkool', ingredientName: 'Boerenkool', amount: 500, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 1, unit: 'stuk' },
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 200, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 15, unit: 'ml' }
    ],
    instructions: [
      'Schil en snijd aardappelen in gelijke stukken',
      'Kook aardappelen in gezouten water tot gaar',
      'Voeg boerenkool toe en kook nog 5 minuten mee',
      'Giet af en stamp alles fijn',
      'Gril kipfilet apart en snijd in stukjes',
      'Meng kip door de stamppot en besprenkel met olijfolie'
    ],
    nutrition: {
      calories: 380,
      protein: 28,
      carbs: 52,
      fat: 10,
      fiber: 9,
      sugar: 5,
      sodium: 420
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: [],
    popularity: 91,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'hutspot-fitness',
    name: 'Hutspot (Fitness Versie)',
    description: 'Traditionele hutspot met extra eiwit en minder vet',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 20,
    cookTime: 45,
    servings: 4,
    difficulty: 'makkelijk',
    image: '/images/recipes/hutspot-fitness.jpg',
    ingredients: [
      { ingredientId: 'aardappel', ingredientName: 'Aardappel', amount: 600, unit: 'g' },
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 600, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 2, unit: 'stukken' },
      { ingredientId: 'kalkoenfilet', ingredientName: 'Kalkoenfilet', amount: 200, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Schil en snijd alle groenten in gelijke stukken',
      'Kook alles samen in gezouten water tot gaar',
      'Giet af en stamp fijn met stamper',
      'Gril kalkoenfilet apart en snijd in stukjes',
      'Meng kalkoen door hutspot en besprenkel met olijfolie'
    ],
    nutrition: {
      calories: 320,
      protein: 24,
      carbs: 48,
      fat: 8,
      fiber: 10,
      sugar: 9,
      sodium: 380
    },
    dietTags: ['hoog-eiwit', 'vezelrijk', 'spiermassa'],
    allergens: [],
    popularity: 86,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'proteine-smoothie-banaan',
    name: 'Proteïne Smoothie met Banaan',
    description: 'Eiwitrijke smoothie met banaan en noten',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-smoothie.jpg',
    ingredients: [
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 200, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Doe alle ingrediënten in blender',
      'Mix tot gladde smoothie',
      'Serveer direct'
    ],
    nutrition: {
      calories: 320,
      protein: 22,
      carbs: 35,
      fat: 12,
      fiber: 6,
      sugar: 25,
      sodium: 80
    },
    dietTags: ['hoog-eiwit', 'post-workout', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 88,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kwark-noten',
    name: 'Kwark met Noten',
    description: 'Eiwitrijke snack met kwark en gezonde noten',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'kwark', ingredientName: 'Kwark', amount: 200, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Schep kwark in kom',
      'Garneer met gehakte amandelen',
      'Besprenkel met honing'
    ],
    nutrition: {
      calories: 280,
      protein: 26,
      carbs: 15,
      fat: 12,
      fiber: 3,
      sugar: 12,
      sodium: 60
    },
    dietTags: ['hoog-eiwit', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'eiwit-repen',
    name: 'Zelfgemaakte Eiwit Repen',
    description: 'Gezonde eiwitrepen met noten en zaden',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 0,
    servings: 8,
    difficulty: 'gemiddeld',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 200, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 100, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 60, unit: 'g' },
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Meng alle ingrediënten',
      'Druk in bakplaat',
      'Laat 2 uur in koelkast staan',
      'Snijd in repen'
    ],
    nutrition: {
      calories: 180,
      protein: 8,
      carbs: 25,
      fat: 8,
      fiber: 4,
      sugar: 12,
      sodium: 5
    },
    dietTags: ['vezelrijk', 'omega-3', 'spiermassa'],
    allergens: [],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'fruit-noten-mix',
    name: 'Fruit en Noten Mix',
    description: 'Gezonde mix van gedroogd fruit en noten',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 30, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Gedroogde banaan', amount: 20, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Gedroogde blauwe bessen', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Meng noten en fruit',
      'Serveer in kom'
    ],
    nutrition: {
      calories: 220,
      protein: 8,
      carbs: 25,
      fat: 12,
      fiber: 5,
      sugar: 18,
      sodium: 5
    },
    dietTags: ['antioxidanten', 'omega-3', 'spiermassa'],
    allergens: ['noten'],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'yoghurt-bessen',
    name: 'Yoghurt met Bessen',
    description: 'Lichte snack met yoghurt en verse bessen',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 150, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Schep yoghurt in kom',
      'Voeg bessen toe',
      'Besprenkel met honing'
    ],
    nutrition: {
      calories: 180,
      protein: 16,
      carbs: 20,
      fat: 6,
      fiber: 3,
      sugar: 18,
      sodium: 60
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'weight-loss'],
    allergens: ['lactose'],
    popularity: 86,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'groente-sticks',
    name: 'Groente Sticks met Hummus',
    description: 'Gezonde groente sticks met zelfgemaakte hummus',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'kikkererwten', ingredientName: 'Kikkererwten', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Snijd groenten in sticks',
      'Maak hummus van kikkererwten',
      'Serveer samen'
    ],
    nutrition: {
      calories: 120,
      protein: 6,
      carbs: 20,
      fat: 3,
      fiber: 8,
      sugar: 8,
      sodium: 120
    },
    dietTags: ['vezelrijk', 'laag-calorie', 'weight-loss'],
    allergens: [],
    popularity: 82,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'eiwit-pannenkoekjes',
    name: 'Mini Eiwit Pannenkoekjes',
    description: 'Kleine eiwitrijke pannenkoekjes',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 10,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'eiwit', ingredientName: 'Eiwit', amount: 150, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 40, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 50, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Meng ingrediënten tot beslag',
      'Bak kleine pannenkoekjes',
      'Serveer met fruit'
    ],
    nutrition: {
      calories: 240,
      protein: 24,
      carbs: 25,
      fat: 8,
      fiber: 4,
      sugar: 12,
      sodium: 120
    },
    dietTags: ['hoog-eiwit', 'post-workout', 'spiermassa'],
    allergens: ['eieren'],
    popularity: 89,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'chia-pudding-snack',
    name: 'Chia Pudding Snack',
    description: 'Vezelrijke chia pudding met fruit',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 25, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 150, unit: 'ml' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 50, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Meng chiazaad met melk',
      'Laat 4 uur in koelkast staan',
      'Garneer met fruit en honing'
    ],
    nutrition: {
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 8,
      fiber: 8,
      sugar: 18,
      sodium: 80
    },
    dietTags: ['vezelrijk', 'omega-3', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'noten-mix',
    name: 'Gezonde Noten Mix',
    description: 'Mix van verschillende noten en zaden',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' },
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 10, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Meng noten en zaden',
      'Besprenkel met honing',
      'Serveer'
    ],
    nutrition: {
      calories: 160,
      protein: 6,
      carbs: 12,
      fat: 12,
      fiber: 4,
      sugar: 8,
      sodium: 5
    },
    dietTags: ['omega-3', 'gezond-vet', 'spiermassa'],
    allergens: ['noten'],
    popularity: 83,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'fruit-smoothie',
    name: 'Fruit Smoothie',
    description: 'Vitamine-rijke smoothie met vers fruit',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/proteine-smoothie.jpg',
    ingredients: [
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 100, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 100, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 100, unit: 'ml' }
    ],
    instructions: [
      'Doe alle ingrediënten in blender',
      'Mix tot gladde smoothie',
      'Serveer direct'
    ],
    nutrition: {
      calories: 220,
      protein: 12,
      carbs: 35,
      fat: 6,
      fiber: 4,
      sugar: 28,
      sodium: 80
    },
    dietTags: ['vitamine-rijk', 'antioxidanten', 'weight-loss'],
    allergens: ['lactose'],
    popularity: 87,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'eiwit-pannenkoekjes-mini',
    name: 'Mini Eiwit Pannenkoekjes',
    description: 'Kleine eiwitrijke pannenkoekjes',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 10,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/proteine-ontbijt-bowl.jpg',
    ingredients: [
      { ingredientId: 'eiwit', ingredientName: 'Eiwit', amount: 150, unit: 'g' },
      { ingredientId: 'havermout', ingredientName: 'Havermout', amount: 40, unit: 'g' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 50, unit: 'g' },
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Meng ingrediënten tot beslag',
      'Bak kleine pannenkoekjes',
      'Serveer met fruit'
    ],
    nutrition: {
      calories: 240,
      protein: 24,
      carbs: 25,
      fat: 8,
      fiber: 4,
      sugar: 12,
      sodium: 120
    },
    dietTags: ['hoog-eiwit', 'post-workout', 'spiermassa'],
    allergens: ['eieren'],
    popularity: 89,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'chia-pudding-snack',
    name: 'Chia Pudding Snack',
    description: 'Vezelrijke chia pudding met fruit',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 25, unit: 'g' },
      { ingredientId: 'melk', ingredientName: 'Melk', amount: 150, unit: 'ml' },
      { ingredientId: 'banaan', ingredientName: 'Banaan', amount: 50, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Meng chiazaad met melk',
      'Laat 4 uur in koelkast staan',
      'Garneer met fruit en honing'
    ],
    nutrition: {
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 8,
      fiber: 8,
      sugar: 18,
      sodium: 80
    },
    dietTags: ['vezelrijk', 'omega-3', 'spiermassa'],
    allergens: ['lactose'],
    popularity: 85,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'noten-mix-gezond',
    name: 'Gezonde Noten Mix',
    description: 'Mix van verschillende noten en zaden',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'amandelen', ingredientName: 'Amandelen', amount: 20, unit: 'g' },
      { ingredientId: 'chiazaad', ingredientName: 'Chiazaad', amount: 10, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Meng noten en zaden',
      'Besprenkel met honing',
      'Serveer'
    ],
    nutrition: {
      calories: 160,
      protein: 6,
      carbs: 12,
      fat: 12,
      fiber: 4,
      sugar: 8,
      sodium: 5
    },
    dietTags: ['omega-3', 'gezond-vet', 'spiermassa'],
    allergens: ['noten'],
    popularity: 83,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'yoghurt-bessen-snack',
    name: 'Yoghurt met Bessen',
    description: 'Lichte snack met yoghurt en verse bessen',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kwark-noten.jpg',
    ingredients: [
      { ingredientId: 'yoghurt', ingredientName: 'Griekse yoghurt', amount: 150, unit: 'g' },
      { ingredientId: 'blauwe-bessen', ingredientName: 'Blauwe bessen', amount: 50, unit: 'g' },
      { ingredientId: 'honing', ingredientName: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Schep yoghurt in kom',
      'Voeg bessen toe',
      'Besprenkel met honing'
    ],
    nutrition: {
      calories: 180,
      protein: 16,
      carbs: 20,
      fat: 6,
      fiber: 3,
      sugar: 18,
      sodium: 60
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'weight-loss'],
    allergens: ['lactose'],
    popularity: 86,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'groente-sticks-hummus',
    name: 'Groente Sticks met Hummus',
    description: 'Gezonde groente sticks met zelfgemaakte hummus',
    mealType: 'snack',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'kikkererwten', ingredientName: 'Kikkererwten', amount: 50, unit: 'g' }
    ],
    instructions: [
      'Snijd groenten in sticks',
      'Maak hummus van kikkererwten',
      'Serveer samen'
    ],
    nutrition: {
      calories: 120,
      protein: 6,
      carbs: 20,
      fat: 3,
      fiber: 8,
      sugar: 8,
      sodium: 120
    },
    dietTags: ['vezelrijk', 'laag-calorie', 'weight-loss'],
    allergens: [],
    popularity: 82,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'kip-curry-diner',
    name: 'Kip Curry Diner',
    description: 'Gezonde curry met kip en groenten',
    mealType: 'diner',
    cuisine: 'internationaal',
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/kalkoen-wok.jpg',
    ingredients: [
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'curry', ingredientName: 'Curry poeder', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Snijd kip in stukjes',
      'Bak ui en kip',
      'Voeg groenten toe',
      'Kruid met curry',
      'Laat 15 minuten sudderen'
    ],
    nutrition: {
      calories: 350,
      protein: 42,
      carbs: 20,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 280
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'spiermassa'],
    allergens: [],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'zalm-groenten-diner',
    name: 'Zalm met Groenten Diner',
    description: 'Omega-3 rijke zalm met gestoomde groenten',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Zalmfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'sperziebonen', ingredientName: 'Sperziebonen', amount: 100, unit: 'g' },
      { ingredientId: 'citroen', ingredientName: 'Citroen', amount: 20, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Gril zalm 12 minuten tot gaar',
      'Stoom broccoli en sperziebonen',
      'Besprenkel met citroensap en olijfolie',
      'Serveer met verse kruiden'
    ],
    nutrition: {
      calories: 380,
      protein: 42,
      carbs: 15,
      fat: 18,
      fiber: 8,
      sugar: 6,
      sodium: 280
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['vis'],
    popularity: 92,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kalkoen-wok-diner',
    name: 'Kalkoen Wok Diner',
    description: 'Snelle wok met mager kalkoen en verse groenten',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 10,
    cookTime: 12,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kalkoen-wok.jpg',
    ingredients: [
      { ingredientId: 'kalkoen', ingredientName: 'Kalkoenfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'sojasaus', ingredientName: 'Sojasaus', amount: 15, unit: 'ml' }
    ],
    instructions: [
      'Snijd kalkoen in reepjes',
      'Verhit wokpan met olie',
      'Bak kalkoen 5 minuten',
      'Voeg groenten toe en wok 7 minuten',
      'Breng op smaak met sojasaus'
    ],
    nutrition: {
      calories: 320,
      protein: 45,
      carbs: 18,
      fat: 8,
      fiber: 6,
      sugar: 8,
      sodium: 420
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: ['soja'],
    popularity: 85,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'tonijn-salade-diner',
    name: 'Tonijn Salade Diner',
    description: 'Eiwitrijke salade met verse tonijn en groenten',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'tonijn', ingredientName: 'Tonijn in water', amount: 120, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 100, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Laat tonijn uitlekken',
      'Snijd groenten in stukjes',
      'Meng alles in een kom',
      'Besprenkel met olijfolie'
    ],
    nutrition: {
      calories: 280,
      protein: 38,
      carbs: 10,
      fat: 12,
      fiber: 4,
      sugar: 6,
      sodium: 320
    },
    dietTags: ['hoog-eiwit', 'omega-3', 'mager'],
    allergens: ['vis'],
    popularity: 87,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'kipfilet-groenten-diner',
    name: 'Kipfilet met Groenten Diner',
    description: 'Mager eiwitrijke maaltijd met kip en groenten',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 12,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/kipfilet-salade.jpg',
    ingredients: [
      { ingredientId: 'kipfilet', ingredientName: 'Kipfilet', amount: 150, unit: 'g' },
      { ingredientId: 'spinazie', ingredientName: 'Spinazie', amount: 100, unit: 'g' },
      { ingredientId: 'tomaat', ingredientName: 'Tomaat', amount: 100, unit: 'g' },
      { ingredientId: 'komkommer', ingredientName: 'Komkommer', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Gril kipfilet 12 minuten tot gaar',
      'Snijd alle groenten in stukjes',
      'Meng groenten in een kom',
      'Snijd kip in reepjes en voeg toe',
      'Besprenkel met olijfolie en breng op smaak'
    ],
    nutrition: {
      calories: 320,
      protein: 48,
      carbs: 12,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 180
    },
    dietTags: ['hoog-eiwit', 'mager', 'laag-calorie'],
    allergens: [],
    popularity: 90,
    fitnessGoal: 'weight-loss'
  },
  {
    id: 'zalm-met-groenten-diner',
    name: 'Zalm met Groenten Diner',
    description: 'Omega-3 rijke zalm met gestoomde groenten',
    mealType: 'diner',
    cuisine: 'nederlands',
    prepTime: 15,
    cookTime: 15,
    servings: 1,
    difficulty: 'makkelijk',
    image: '/images/recipes/zalm-groenten.jpg',
    ingredients: [
      { ingredientId: 'zalm', ingredientName: 'Zalm', amount: 200, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 150, unit: 'g' },
      { ingredientId: 'wortel', ingredientName: 'Wortel', amount: 100, unit: 'g' },
      { ingredientId: 'olijfolie', ingredientName: 'Olijfolie', amount: 10, unit: 'ml' }
    ],
    instructions: [
      'Verhit oven op 200°C',
      'Leg zalm op bakplaat met olijfolie',
      'Bak 15 minuten tot gaar',
      'Stoom broccoli en wortelen',
      'Serveer samen'
    ],
    nutrition: {
      calories: 450,
      protein: 52,
      carbs: 18,
      fat: 22,
      fiber: 8,
      sugar: 8,
      sodium: 180
    },
    dietTags: ['omega-3', 'hoog-eiwit', 'spiermassa'],
    allergens: ['vis'],
    popularity: 87,
    fitnessGoal: 'muscle-gain'
  },
  {
    id: 'kalkoen-curry-diner',
    name: 'Kalkoen Curry Diner',
    description: 'Gezonde curry met kalkoen en groenten',
    mealType: 'diner',
    cuisine: 'internationaal',
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    difficulty: 'gemiddeld',
    image: '/images/recipes/kalkoen-wok.jpg',
    ingredients: [
      { ingredientId: 'kalkoenfilet', ingredientName: 'Kalkoenfilet', amount: 150, unit: 'g' },
      { ingredientId: 'broccoli', ingredientName: 'Broccoli', amount: 100, unit: 'g' },
      { ingredientId: 'paprika', ingredientName: 'Paprika', amount: 100, unit: 'g' },
      { ingredientId: 'ui', ingredientName: 'Ui', amount: 50, unit: 'g' },
      { ingredientId: 'curry', ingredientName: 'Curry poeder', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Snijd kalkoen in stukjes',
      'Bak ui en kalkoen',
      'Voeg groenten toe',
      'Kruid met curry',
      'Laat 15 minuten sudderen'
    ],
    nutrition: {
      calories: 350,
      protein: 42,
      carbs: 20,
      fat: 12,
      fiber: 6,
      sugar: 8,
      sodium: 280
    },
    dietTags: ['hoog-eiwit', 'antioxidanten', 'spiermassa'],
    allergens: [],
    popularity: 84,
    fitnessGoal: 'muscle-gain'
  }
];

// Helper functies
export function calculateRecipeNutrition(ingredients: Array<{ingredientId: string, amount: number}>) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalSodium = 0;

  ingredients.forEach(({ ingredientId, amount }) => {
    const ingredient = dutchIngredients.find(i => i.id === ingredientId);
    if (ingredient) {
      const multiplier = amount / 100; // Per 100g basis
      totalCalories += ingredient.calories * multiplier;
      totalProtein += ingredient.protein * multiplier;
      totalCarbs += ingredient.carbs * multiplier;
      totalFat += ingredient.fat * multiplier;
      totalFiber += ingredient.fiber * multiplier;
      totalSugar += ingredient.sugar * multiplier;
      totalSodium += ingredient.sodium * multiplier;
    }
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    sugar: Math.round(totalSugar * 10) / 10,
    sodium: Math.round(totalSodium)
  };
}

export function getIngredientsByCategory(category: string) {
  return dutchIngredients.filter(ingredient => ingredient.category === category);
}

export function searchRecipes(query: string, filters?: {
  mealType?: string;
  cuisine?: string;
  dietTags?: string[];
  fitnessGoal?: 'weight-loss' | 'muscle-gain' | 'maintenance';
}) {
  let results = dutchRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(query.toLowerCase()) ||
    recipe.description.toLowerCase().includes(query.toLowerCase())
  );

  if (filters) {
    if (filters.mealType) {
      results = results.filter(recipe => recipe.mealType === filters.mealType);
    }
    if (filters.cuisine) {
      results = results.filter(recipe => recipe.cuisine === filters.cuisine);
    }
    if (filters.dietTags) {
      results = results.filter(recipe => 
        filters.dietTags!.some(tag => recipe.dietTags.includes(tag))
      );
    }
    if (filters.fitnessGoal) {
      results = results.filter(recipe => recipe.fitnessGoal === filters.fitnessGoal);
    }
  }

  return results.sort((a, b) => b.popularity - a.popularity);
}

// Nieuwe fitness-specifieke functies
export function getRecipesByFitnessGoal(goal: 'weight-loss' | 'muscle-gain' | 'maintenance') {
  return dutchRecipes.filter(recipe => recipe.fitnessGoal === goal);
}

export function getHighProteinRecipes(minProtein: number = 20) {
  return dutchRecipes.filter(recipe => recipe.nutrition.protein >= minProtein);
}

export function getLowCalorieRecipes(maxCalories: number = 400) {
  return dutchRecipes.filter(recipe => recipe.nutrition.calories <= maxCalories);
}

export function getPostWorkoutRecipes() {
  return dutchRecipes.filter(recipe => 
    recipe.dietTags.includes('post-workout') || 
    (recipe.nutrition.protein >= 20 && recipe.nutrition.carbs >= 30)
  );
}
