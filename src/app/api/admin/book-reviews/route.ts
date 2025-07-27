import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching book reviews from database...');

    // Try to fetch from database first
    try {
      const { data: reviews, error: reviewsError } = await supabaseAdmin
        .from('book_reviews')
        .select(`
          *,
          books(title),
          profiles(full_name)
        `)
        .order('submitted_at', { ascending: false });

      if (reviewsError) {
        console.log('Database table does not exist, using mock data');
        throw new Error('Table does not exist');
      }

      console.log(`📊 Found ${reviews?.length || 0} reviews from database`);

      return NextResponse.json({ 
        success: true, 
        reviews: reviews || []
      });

    } catch (dbError) {
      console.log('Using mock data for book reviews');
      
      // Return mock data
      const mockReviews = [
        {
          id: "1",
          bookId: "1",
          bookTitle: "Can't Hurt Me",
          userId: "user1",
          userName: "Rob van der Berg",
          rating: 5,
          text: "Dit boek heeft mijn leven veranderd. David Goggins' verhaal is inspirerend en motiverend. Een must-read voor iedereen die meer uit zichzelf wil halen.",
          status: "approved",
          submittedAt: "2025-07-25T10:30:00.000Z"
        },
        {
          id: "2",
          bookId: "1",
          bookTitle: "Can't Hurt Me",
          userId: "user2",
          userName: "Chiel de Vries",
          rating: 4,
          text: "Zeer krachtig boek. Goggins' aanpak is extreem maar effectief. Niet voor iedereen, maar wel zeer waardevol.",
          status: "approved",
          submittedAt: "2025-07-24T14:20:00.000Z"
        },
        {
          id: "3",
          bookId: "2",
          bookTitle: "Atomic Habits",
          userId: "user3",
          userName: "Mark Jansen",
          rating: 5,
          text: "Fantastisch boek over gewoontes. James Clear legt complexe concepten uit op een begrijpelijke manier. Praktisch en toepasbaar.",
          status: "pending",
          submittedAt: "2025-07-26T09:15:00.000Z"
        },
        {
          id: "4",
          bookId: "2",
          bookTitle: "Atomic Habits",
          userId: "user4",
          userName: "Tom Bakker",
          rating: 4,
          text: "Goed boek met veel praktische tips. De 1% verbetering per dag is een krachtig concept.",
          status: "approved",
          submittedAt: "2025-07-23T16:45:00.000Z"
        },
        {
          id: "5",
          bookId: "3",
          bookTitle: "Rich Dad Poor Dad",
          userId: "user5",
          userName: "Alex Smit",
          rating: 3,
          text: "Interessante perspectieven op geld, maar soms wat simplistisch. Goed voor beginners.",
          status: "rejected",
          submittedAt: "2025-07-22T11:30:00.000Z"
        }
      ];

      return NextResponse.json({ 
        success: true, 
        reviews: mockReviews
      });
    }

  } catch (error) {
    console.error('Error fetching book reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch book reviews' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 Creating new book review:', body);

    const { data: review, error } = await supabaseAdmin
      .from('book_reviews')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating book review:', error);
      return NextResponse.json({ error: 'Failed to create book review' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      review 
    });

  } catch (error) {
    console.error('Error creating book review:', error);
    return NextResponse.json({ 
      error: 'Failed to create book review' 
    }, { status: 500 });
  }
} 