const ingredients = [
  // Vlees & Gevogelte
  { name: "Ribeye Steak", category: "Vlees", calories: 291, protein: 25, carbs: 0, fat: 20.8 },
  { name: "Eieren", category: "Zuivel & Eieren", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Bacon", category: "Vlees", calories: 542, protein: 37, carbs: 1.4, fat: 42 },
  { name: "Kipfilet", category: "Vlees", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Gehakt (Rundvlees)", category: "Vlees", calories: 254, protein: 26, carbs: 0, fat: 17 },
  { name: "Varkenshaas", category: "Vlees", calories: 143, protein: 26, carbs: 0, fat: 4 },
  { name: "Kippendij", category: "Vlees", calories: 209, protein: 26, carbs: 0, fat: 11 },
  { name: "Rundvlees", category: "Vlees", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Lamsvlees", category: "Vlees", calories: 294, protein: 25, carbs: 0, fat: 21 },
  { name: "Kalkoenfilet", category: "Vlees", calories: 135, protein: 30, carbs: 0, fat: 1 },
  
  // Vis & Zeevruchten
  { name: "Zalm", category: "Vis", calories: 208, protein: 25.4, carbs: 0, fat: 12.4 },
  { name: "Tonijn", category: "Vis", calories: 144, protein: 30, carbs: 0, fat: 1 },
  { name: "Makreel", category: "Vis", calories: 205, protein: 19, carbs: 0, fat: 14 },
  { name: "Haring", category: "Vis", calories: 158, protein: 18, carbs: 0, fat: 9 },
  { name: "Garnalen", category: "Zeevruchten", calories: 99, protein: 24, carbs: 0, fat: 0.3 },
  { name: "Kabeljauw", category: "Vis", calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  
  // Zuivel
  { name: "Griekse Yoghurt", category: "Zuivel", calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Kwark", category: "Zuivel", calories: 59, protein: 11, carbs: 3.4, fat: 0.2 },
  { name: "Cottage Cheese", category: "Zuivel", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: "Kaas (Gouda)", category: "Zuivel", calories: 356, protein: 25, carbs: 0, fat: 27 },
  { name: "Feta", category: "Zuivel", calories: 264, protein: 14, carbs: 4, fat: 21 },
  { name: "Mozzarella", category: "Zuivel", calories: 300, protein: 22, carbs: 2, fat: 22 },
  
  // Groenten (voor niet-carnivoor plannen)
  { name: "Broccoli", category: "Groenten", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: "Spinazie", category: "Groenten", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Avocado", category: "Groenten", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: "Zoete Aardappel", category: "Groenten", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: "Rijst (gekookt)", category: "Granen", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Quinoa", category: "Granen", calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  { name: "Havermout", category: "Granen", calories: 389, protein: 17, carbs: 66, fat: 7 },
  
  // Noten & Zaden
  { name: "Amandelen", category: "Noten", calories: 579, protein: 21, carbs: 22, fat: 50 },
  { name: "Walnoten", category: "Noten", calories: 654, protein: 15, carbs: 14, fat: 65 },
  { name: "Chia Zaden", category: "Zaden", calories: 486, protein: 17, carbs: 42, fat: 31 },
  { name: "Lijnzaad", category: "Zaden", calories: 534, protein: 18, carbs: 29, fat: 42 },
  
  // Oliën & Vetten
  { name: "Olijfolie", category: "Oliën", calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "Kokosolie", category: "Oliën", calories: 862, protein: 0, carbs: 0, fat: 100 },
  { name: "Boter", category: "Vetten", calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  { name: "Ghee", category: "Vetten", calories: 900, protein: 0, carbs: 0, fat: 100 }
];

console.log(`📊 Found ${ingredients.length} ingredients to add`);
console.log('✅ Ingredient data ready for API calls');
