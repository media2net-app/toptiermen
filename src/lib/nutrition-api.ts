// Nutrition API service using Open Food Facts
export interface NutritionData {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  image?: string;
}

export interface SearchResult {
  products: Array<{
    code: string;
    product_name: string;
    brands?: string;
    categories?: string;
    image_url?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'proteins_100g'?: number;
      'carbohydrates_100g'?: number;
      'fat_100g'?: number;
      'fiber_100g'?: number;
      'sugars_100g'?: number;
      'sodium_100g'?: number;
    };
  }>;
}

class NutritionAPI {
  private baseUrl = 'https://world.openfoodfacts.org';

  async searchIngredients(query: string, limit: number = 20): Promise<NutritionData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SearchResult = await response.json();
      
      return data.products
        .filter(product => product.nutriments && product.product_name)
        .map(product => ({
          id: product.code,
          name: product.product_name,
          category: product.categories?.split(',')[0]?.trim() || 'Overig',
          calories: product.nutriments?.['energy-kcal_100g'] || 0,
          protein: product.nutriments?.['proteins_100g'] || 0,
          carbs: product.nutriments?.['carbohydrates_100g'] || 0,
          fat: product.nutriments?.['fat_100g'] || 0,
          fiber: product.nutriments?.['fiber_100g'],
          sugar: product.nutriments?.['sugars_100g'],
          sodium: product.nutriments?.['sodium_100g'],
          image: product.image_url,
        }));
    } catch (error) {
      console.error('Error searching ingredients:', error);
      return [];
    }
  }

  async getIngredientByBarcode(barcode: string): Promise<NutritionData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v0/product/${barcode}.json`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (!data.product || !data.product.nutriments) {
        return null;
      }
      
      const product = data.product;
      
      return {
        id: product.code,
        name: product.product_name,
        category: product.categories?.split(',')[0]?.trim() || 'Overig',
        calories: product.nutriments['energy-kcal_100g'] || 0,
        protein: product.nutriments['proteins_100g'] || 0,
        carbs: product.nutriments['carbohydrates_100g'] || 0,
        fat: product.nutriments['fat_100g'] || 0,
        fiber: product.nutriments['fiber_100g'],
        sugar: product.nutriments['sugars_100g'],
        sodium: product.nutriments['sodium_100g'],
        image: product.image_url,
      };
    } catch (error) {
      console.error('Error getting ingredient by barcode:', error);
      return null;
    }
  }

  async getPopularIngredients(): Promise<NutritionData[]> {
    // Common ingredients that are frequently used
    const commonIngredients = [
      'kipfilet', 'zalm', 'broccoli', 'rijst', 'olijfolie', 'havermout',
      'banaan', 'quinoa', 'yoghurt', 'tonijn', 'avocado', 'zoete aardappel',
      'spinazie', 'ei', 'pasta', 'tomaat', 'ui', 'knoflook'
    ];

    const results: NutritionData[] = [];
    
    for (const ingredient of commonIngredients.slice(0, 10)) {
      const searchResults = await this.searchIngredients(ingredient, 1);
      if (searchResults.length > 0) {
        results.push(searchResults[0]);
      }
    }
    
    return results;
  }
}

export const nutritionAPI = new NutritionAPI(); 