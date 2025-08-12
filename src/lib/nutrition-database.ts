// Comprehensive nutrition database with accurate macro values per 100g
export const NUTRITION_DATABASE: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
  // Vlees & Vis
  'Rundvlees (biefstuk)': { calories: 290, protein: 26, carbs: 0, fat: 20 },
  'Rundvlees (gehakt)': { calories: 242, protein: 23, carbs: 0, fat: 15 },
  'Lamsvlees (lende)': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Lamsvlees (schouder)': { calories: 282, protein: 25, carbs: 0, fat: 20 },
  'Varkensvlees (varkenshaas)': { calories: 143, protein: 21, carbs: 0, fat: 6 },
  'Kipfilet': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Kalkoenfilet': { calories: 157, protein: 30, carbs: 0, fat: 3.6 },
  'Zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Tonijn': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  'Eend': { calories: 337, protein: 19, carbs: 0, fat: 28 },
  'Eieren': { calories: 155, protein: 12.5, carbs: 1.1, fat: 11 },
  'Spek': { calories: 417, protein: 37, carbs: 0, fat: 28 },
  'Runderlever': { calories: 135, protein: 20, carbs: 3.9, fat: 3.6 },
  'Kippenlever': { calories: 167, protein: 26, carbs: 0.7, fat: 6.5 },
  'Varkenslever': { calories: 134, protein: 21, carbs: 2.5, fat: 3.7 },
  'Rundernieren': { calories: 99, protein: 17, carbs: 0.3, fat: 3.1 },
  'Lamsnieren': { calories: 97, protein: 16, carbs: 0.8, fat: 3.2 },
  
  // Eieren & Zuivel
  'Griekse yoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'Magere kwark': { calories: 98, protein: 11, carbs: 3.4, fat: 0.3 },
  'Cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  'Melk (volle)': { calories: 61, protein: 3.4, carbs: 4.8, fat: 3.3 },
  'Melk (halfvolle)': { calories: 50, protein: 3.4, carbs: 4.8, fat: 1.8 },
  'Melk (magere)': { calories: 42, protein: 3.4, carbs: 4.8, fat: 0.1 },
  'Amandelmelk': { calories: 17, protein: 0.6, carbs: 0.6, fat: 1.5 },
  'Sojamelk': { calories: 33, protein: 3.3, carbs: 1.8, fat: 1.8 },
  'Feta': { calories: 264, protein: 14.2, carbs: 4.1, fat: 21.3 },
  'Geitenkaas': { calories: 364, protein: 22, carbs: 0.7, fat: 30 },
  
  // Granen & Brood
  'Havermout': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  'Volkoren wrap': { calories: 265, protein: 8.5, carbs: 49, fat: 3.2 },
  'Volkoren boterham': { calories: 247, protein: 13, carbs: 41, fat: 4.2 },
  'Quinoa': { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  'Bruine rijst': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  'Volkoren pasta': { calories: 124, protein: 5, carbs: 25, fat: 1.1 },
  'Muesli': { calories: 340, protein: 8, carbs: 66, fat: 6 },
  
  // Groenten
  'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'Spinazie': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'Paprika': { calories: 31, protein: 1, carbs: 7, fat: 0.3 },
  'Komkommer': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  'Tomaat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'Courgette': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  'Zoete aardappel': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'Aardappel': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'Bloemkool': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  'Sperziebonen': { calories: 31, protein: 1.8, carbs: 7, fat: 0.2 },
  'Kikkererwten': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  'Kidneybonen': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5 },
  'Linzen': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'Tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  'Edamame': { calories: 121, protein: 11, carbs: 9, fat: 5.2 },
  
  // Fruit
  'Blauwe bessen': { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
  'Banaan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'Ananas': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  'Appel': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'Sinaasappel': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  
  // Noten & Zaden
  'Walnoten': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2 },
  'Amandelen': { calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9 },
  'Gemengde noten': { calories: 607, protein: 20, carbs: 19, fat: 54 },
  'Lijnzaad': { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2 },
  'Chiazaad': { calories: 486, protein: 17, carbs: 42, fat: 31 },
  'Pindakaas': { calories: 588, protein: 25, carbs: 20, fat: 50 },
  
  // Vetten & Oliën
  'Boter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'Olijfolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'Kokosolie': { calories: 862, protein: 0, carbs: 0, fat: 100 },
  'Avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  
  // Overige
  'Hummus': { calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6 },
  'Proteïne poeder': { calories: 375, protein: 75, carbs: 12.5, fat: 2.5 },
  'Honing': { calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  'Ahornsiroop': { calories: 260, protein: 0, carbs: 67, fat: 0 },
  'Suiker': { calories: 387, protein: 0, carbs: 100, fat: 0 },
  
  // Kruiden & Specerijen
  'Zout': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'Peper': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'Knoflook': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  'Ui': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  'Gember': { calories: 80, protein: 1.8, carbs: 18, fat: 0.8 },
  'Kurkuma': { calories: 354, protein: 8, carbs: 65, fat: 10 },
  'Oregano': { calories: 265, protein: 9, carbs: 69, fat: 4.3 },
  'Basilicum': { calories: 22, protein: 3.2, carbs: 2.6, fat: 0.6 },
  
  // Dranken & Vloeistoffen
  'Water': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'Koffie': { calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  'Thee': { calories: 1, protein: 0, carbs: 0.2, fat: 0 },
  
  // Voorverpakte producten
  'Falafel': { calories: 333, protein: 13.3, carbs: 31.8, fat: 17.8 },
  'Vegetarische curry': { calories: 120, protein: 4, carbs: 18, fat: 4 },
  'Vegetarische lasagne': { calories: 132, protein: 8, carbs: 18, fat: 4 },
  'Tofu roerbak': { calories: 95, protein: 8, carbs: 4, fat: 5 },
  'Proteïne reep': { calories: 350, protein: 20, carbs: 30, fat: 12 },
  'Griekse yoghurt met honing': { calories: 89, protein: 10, carbs: 8.6, fat: 0.4 },
  'Kokoskwark': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  'Droge worst': { calories: 290, protein: 25, carbs: 0, fat: 20 },
  'Kipreepjes': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Gerookte zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Entrecote': { calories: 290, protein: 26, carbs: 0, fat: 20 },
  'Gebakken lever': { calories: 135, protein: 20, carbs: 3.9, fat: 3.6 },
  'Gebakken eieren': { calories: 155, protein: 12.5, carbs: 1.1, fat: 11 },
  'Rundergehakt': { calories: 242, protein: 23, carbs: 0, fat: 15 },
  'Kabeljauw': { calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  'Tomatensaus': { calories: 29, protein: 1.2, carbs: 6.6, fat: 0.2 },
  'Rijst': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'Pesto': { calories: 303, protein: 2.6, carbs: 6.5, fat: 30 },
  'Bloemkoolpuree': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  'Linzensalade': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'Gegrilde groente': { calories: 35, protein: 2, carbs: 7, fat: 0.3 },
  'Snackgroenten': { calories: 20, protein: 1, carbs: 4, fat: 0.2 },
  'Rijstwafels': { calories: 387, protein: 8, carbs: 80, fat: 2.8 },
  'Eiwitpannenkoeken': { calories: 200, protein: 15, carbs: 20, fat: 8 },
  'Proteïne shake': { calories: 150, protein: 25, carbs: 10, fat: 2 },
  'Omelet': { calories: 155, protein: 12.5, carbs: 1.1, fat: 11 },
  'Bonen': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5 },
  'Olijven': { calories: 115, protein: 0.8, carbs: 6, fat: 10.7 },
  'Handje amandelen': { calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9 },
  'Handje noten': { calories: 607, protein: 20, carbs: 19, fat: 54 },
  'Fruit': { calories: 60, protein: 0.5, carbs: 15, fat: 0.2 },
  'Hamburger zonder brood': { calories: 290, protein: 26, carbs: 0, fat: 20 },
  'Lamskotelet': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Ribeye steak': { calories: 290, protein: 26, carbs: 0, fat: 20 },
  'Roomboter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'Zalmfilet': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Kipfilet met roomboter': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Kipsalade': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Tonijnsalade': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  'Geitenkaas met walnoten': { calories: 364, protein: 22, carbs: 0.7, fat: 30 },
  'Zalm met courgette en pesto': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Biefstuk met bloemkoolpuree': { calories: 290, protein: 26, carbs: 0, fat: 20 },
  'Kipfilet met broccoli': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Sojayoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'Smoothiebowl': { calories: 150, protein: 5, carbs: 25, fat: 3 },
  'Falafel wrap': { calories: 333, protein: 13.3, carbs: 31.8, fat: 17.8 },
  'Vegetarische curry met kikkererwten': { calories: 120, protein: 4, carbs: 18, fat: 4 },
  'Proteïne shake met banaan': { calories: 150, protein: 25, carbs: 10, fat: 2 },
  'Omelet met kipfilet': { calories: 155, protein: 12.5, carbs: 1.1, fat: 11 },
  'Kipfilet met zoete aardappel en broccoli': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Tonijn met quinoa': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  'Rundergehakt met bonen': { calories: 242, protein: 23, carbs: 0, fat: 15 },
  'Cottage cheese met ananas': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  'Zalmfilet met linzen en spinazie': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Kipfilet met volkoren pasta': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Tofu met edamame': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  'Gebakken eieren met spek': { calories: 155, protein: 12.5, carbs: 1.1, fat: 11 }
};

// Helper function to find the best match for an ingredient name
export function findBestMatch(ingredientName: string): string | null {
  const name = ingredientName.toLowerCase().trim();
  
  // Direct matches
  if (NUTRITION_DATABASE[ingredientName]) {
    return ingredientName;
  }
  
  // Partial matches
  for (const key of Object.keys(NUTRITION_DATABASE)) {
    const keyLower = key.toLowerCase();
    
    // Exact word match
    if (keyLower.includes(name) || name.includes(keyLower)) {
      return key;
    }
    
    // Common variations
    if (name.includes('kip') && keyLower.includes('kip')) return key;
    if (name.includes('rund') && keyLower.includes('rund')) return key;
    if (name.includes('zalm') && keyLower.includes('zalm')) return key;
    if (name.includes('ei') && keyLower.includes('ei')) return key;
    if (name.includes('broccoli') && keyLower.includes('broccoli')) return key;
    if (name.includes('spinazie') && keyLower.includes('spinazie')) return key;
    if (name.includes('haver') && keyLower.includes('haver')) return key;
    if (name.includes('noten') && keyLower.includes('noten')) return key;
    if (name.includes('yoghurt') && keyLower.includes('yoghurt')) return key;
    if (name.includes('kaas') && keyLower.includes('kaas')) return key;
  }
  
  return null;
} 