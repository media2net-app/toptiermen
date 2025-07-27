const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBooksDatabase() {
  console.log('📚 Setting up books database with direct operations...');

  try {
    // 1. Create book categories
    console.log('📖 Creating book categories...');
    const categories = [
      {
        name: 'Mindset & Psychologie',
        description: 'Boeken over persoonlijke ontwikkeling, mindset en psychologie',
        color: '#8BAE5A',
        icon: '🧠',
        book_count: 0
      },
      {
        name: 'Productiviteit & Focus',
        description: 'Boeken over time management, productiviteit en focus',
        color: '#FFD700',
        icon: '⚡',
        book_count: 0
      },
      {
        name: 'Financiën & Business',
        description: 'Boeken over geld, investeren en ondernemerschap',
        color: '#f0a14f',
        icon: '💰',
        book_count: 0
      },
      {
        name: 'Fitness & Gezondheid',
        description: 'Boeken over training, voeding en gezondheid',
        color: '#FF6B6B',
        icon: '💪',
        book_count: 0
      },
      {
        name: 'Leadership & Communicatie',
        description: 'Boeken over leiderschap, communicatie en sociale vaardigheden',
        color: '#4ECDC4',
        icon: '🎯',
        book_count: 0
      },
      {
        name: 'Filosofie & Spiritualiteit',
        description: 'Boeken over filosofie, spiritualiteit en levensbeschouwing',
        color: '#9B59B6',
        icon: '🕊️',
        book_count: 0
      }
    ];

    const { data: createdCategories, error: categoriesError } = await supabase
      .from('book_categories')
      .insert(categories)
      .select();

    if (categoriesError) {
      console.error('❌ Error creating categories:', categoriesError);
      if (categoriesError.code === '42P01') {
        console.log('💡 Book categories table does not exist. Please create it manually in Supabase.');
        console.log('📖 See create_books_tables.sql for the table structure.');
        return;
      }
    } else {
      console.log(`✅ Created ${createdCategories.length} book categories`);
    }

    // 2. Create books
    console.log('📚 Creating books...');
    const books = [
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        description: 'Een klassieker over financiële educatie en het verschil tussen activa en passiva. Robert Kiyosaki legt uit hoe de rijken denken over geld en hoe je financiële vrijheid kunt bereiken.',
        categories: ['Financiën & Business'],
        status: 'published',
        average_rating: 4.2,
        review_count: 12,
        view_count: 0
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        description: 'Een praktische gids voor het bouwen van goede gewoontes en het breken van slechte gewoontes. James Clear legt uit hoe kleine veranderingen tot opmerkelijke resultaten kunnen leiden.',
        categories: ['Mindset & Psychologie', 'Productiviteit & Focus'],
        status: 'published',
        average_rating: 4.5,
        review_count: 8,
        view_count: 0
      },
      {
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        description: 'Het verhaal van David Goggins over hoe hij zijn mentale en fysieke grenzen verlegde. Een inspirerend boek over discipline, doorzettingsvermogen en mentale weerbaarheid.',
        categories: ['Mindset & Psychologie', 'Fitness & Gezondheid'],
        status: 'published',
        average_rating: 4.8,
        review_count: 15,
        view_count: 0
      },
      {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        description: 'Een diepgaande analyse van hoe mensen denken over geld en waarom we vaak irrationele financiële beslissingen nemen.',
        categories: ['Financiën & Business'],
        status: 'published',
        average_rating: 4.3,
        review_count: 6,
        view_count: 0
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        description: 'Een gids voor het ontwikkelen van focus en het vermijden van afleidingen in een wereld vol digitale prikkels.',
        categories: ['Productiviteit & Focus'],
        status: 'published',
        average_rating: 4.1,
        review_count: 9,
        view_count: 0
      }
    ];

    const { data: createdBooks, error: booksError } = await supabase
      .from('books')
      .insert(books)
      .select();

    if (booksError) {
      console.error('❌ Error creating books:', booksError);
      if (booksError.code === '42P01') {
        console.log('💡 Books table does not exist. Please create it manually in Supabase.');
        console.log('📖 See create_books_tables.sql for the table structure.');
        return;
      }
    } else {
      console.log(`✅ Created ${createdBooks.length} books`);
    }

    // 3. Create sample reviews (if we have books and users)
    console.log('⭐ Creating sample reviews...');
    
    // Get first user for reviews
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('⚠️ No users found, skipping reviews');
    } else if (createdBooks && createdBooks.length > 0) {
      const reviews = [
        {
          book_id: createdBooks[0].id,
          user_id: users[0].id,
          rating: 5,
          text: 'Fantastisch boek! Heeft mijn kijk op geld volledig veranderd.',
          status: 'approved'
        },
        {
          book_id: createdBooks[1].id,
          user_id: users[0].id,
          rating: 4,
          text: 'Zeer praktisch en toepasbaar. Aanrader voor iedereen die gewoontes wil veranderen.',
          status: 'approved'
        },
        {
          book_id: createdBooks[2].id,
          user_id: users[0].id,
          rating: 5,
          text: 'Inspirerend en motiverend. David Goggins is een echte warrior.',
          status: 'approved'
        }
      ];

      const { data: createdReviews, error: reviewsError } = await supabase
        .from('book_reviews')
        .insert(reviews)
        .select();

      if (reviewsError) {
        console.error('❌ Error creating reviews:', reviewsError);
        if (reviewsError.code === '42P01') {
          console.log('💡 Book reviews table does not exist. Please create it manually in Supabase.');
        }
      } else {
        console.log(`✅ Created ${createdReviews.length} reviews`);
      }
    }

    console.log('🎉 Books database setup completed!');
    console.log('📚 You can now use the Boekenkamer with real database data.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('💡 Please create the database tables manually in Supabase first.');
    console.log('📖 See create_books_tables.sql for the table structure.');
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting books database setup...');
  await setupBooksDatabase();
}

main().catch(console.error); 