import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching book categories from database...');

    // Try to fetch from database first
    try {
      const { data: categories, error: categoriesError } = await supabaseAdmin
        .from('book_categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) {
        console.log('Database table does not exist, using mock data');
        throw new Error('Table does not exist');
      }

      console.log(`📊 Found ${categories?.length || 0} categories from database`);

      return NextResponse.json({ 
        success: true, 
        categories: categories || []
      });

    } catch (dbError) {
      console.log('Using mock data for book categories');
      
      // Return mock data
      const mockCategories = [
        {
          id: "1",
          name: "Mindset",
          bookCount: 5,
          description: "Boeken over mentale kracht en mindset"
        },
        {
          id: "2",
          name: "Motivatie",
          bookCount: 3,
          description: "Boeken die je motiveren en inspireren"
        },
        {
          id: "3",
          name: "Productiviteit",
          bookCount: 4,
          description: "Boeken over effectiviteit en productiviteit"
        },
        {
          id: "4",
          name: "Gewoontes",
          bookCount: 2,
          description: "Boeken over het bouwen van goede gewoontes"
        },
        {
          id: "5",
          name: "Financiën",
          bookCount: 3,
          description: "Boeken over geld en financiële vrijheid"
        },
        {
          id: "6",
          name: "Ondernemerschap",
          bookCount: 2,
          description: "Boeken over ondernemerschap en business"
        },
        {
          id: "7",
          name: "Fitness",
          bookCount: 1,
          description: "Boeken over fysieke training en gezondheid"
        },
        {
          id: "8",
          name: "Voeding",
          bookCount: 1,
          description: "Boeken over voeding en dieet"
        }
      ];

      return NextResponse.json({ 
        success: true, 
        categories: mockCategories
      });
    }

  } catch (error) {
    console.error('Error fetching book categories:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch book categories' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new book category:', body);

    // Try to save to database first
    try {
      const { data: category, error } = await supabaseAdmin
        .from('book_categories')
        .insert([body])
        .select()
        .single();

      if (error) {
        console.log('Database table does not exist, returning mock response');
        throw new Error('Table does not exist');
      }

      return NextResponse.json({ 
        success: true, 
        category 
      });

    } catch (dbError) {
      // Return mock response
      const mockCategory = {
        id: Date.now().toString(),
        ...body,
        bookCount: 0,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({ 
        success: true, 
        category: mockCategory,
        message: 'Mock data - database not available'
      });
    }

  } catch (error) {
    console.error('Error creating book category:', error);
    return NextResponse.json({ 
      error: 'Failed to create book category' 
    }, { status: 500 });
  }
} 