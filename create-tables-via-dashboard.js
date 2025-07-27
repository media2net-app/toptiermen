const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📚 Creating books tables via dashboard API...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesViaDashboard() {
  try {
    console.log('\n🔍 Step 1: Checking if tables exist...');
    
    // First, let's check if the tables exist by trying to query them
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('book_categories')
      .select('*')
      .limit(1);

    if (categoriesError && categoriesError.code === 'PGRST116') {
      console.log('❌ book_categories table does not exist');
      console.log('💡 Trying to create it by inserting data...');
      
      // Try to create the table by inserting data
      const { error: insertError } = await supabase
        .from('book_categories')
        .insert({
          name: 'Test Category',
          description: 'Test description',
          icon: '📚'
        });

      if (insertError) {
        console.log('❌ Cannot create table via insert:', insertError);
        console.log('💡 Manual SQL execution required');
        return;
      } else {
        console.log('✅ book_categories table created via insert');
        // Clean up test data
        await supabase
          .from('book_categories')
          .delete()
          .eq('name', 'Test Category');
      }
    } else {
      console.log('✅ book_categories table exists');
    }

    const { data: booksData, error: booksError } = await supabase
      .from('books')
      .select('*')
      .limit(1);

    if (booksError && booksError.code === 'PGRST116') {
      console.log('❌ books table does not exist');
      console.log('💡 Trying to create it by inserting data...');
      
      // Try to create the table by inserting data
      const { error: insertError } = await supabase
        .from('books')
        .insert({
          title: 'Test Book',
          author: 'Test Author',
          description: 'Test description',
          status: 'draft'
        });

      if (insertError) {
        console.log('❌ Cannot create table via insert:', insertError);
        console.log('💡 Manual SQL execution required');
        return;
      } else {
        console.log('✅ books table created via insert');
        // Clean up test data
        await supabase
          .from('books')
          .delete()
          .eq('title', 'Test Book');
      }
    } else {
      console.log('✅ books table exists');
    }

    console.log('\n📊 Step 2: Inserting sample data...');
    
    // Insert categories
    const categories = [
      { name: 'Mindset', description: 'Mentale groei en persoonlijke ontwikkeling', icon: '🧠' },
      { name: 'Productiviteit', description: 'Time management en focus', icon: '⚡' },
      { name: 'Financiën', description: 'Geld, investeren en business', icon: '💰' },
      { name: 'Fitness', description: 'Training en gezondheid', icon: '💪' },
      { name: 'Leadership', description: 'Leiderschap en communicatie', icon: '🎯' },
      { name: 'Filosofie', description: 'Stoïcisme en levensbeschouwing', icon: '🏛️' }
    ];

    let categoriesInserted = 0;
    for (const category of categories) {
      const { error: insertError } = await supabase
        .from('book_categories')
        .upsert(category, { onConflict: 'name' });
      
      if (insertError) {
        console.log(`❌ Error inserting category ${category.name}:`, insertError);
      } else {
        console.log(`✅ Category ${category.name} inserted/updated`);
        categoriesInserted++;
      }
    }

    // Insert books
    const books = [
      {
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        cover_url: '/books/canthurtme.jpg',
        description: 'David Goggins\' verhaal over hoe hij zijn mentale en fysieke grenzen verlegde.',
        categories: ['Mindset', 'Fitness'],
        status: 'published',
        average_rating: 4.8,
        review_count: 12
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        description: 'Kleine veranderingen, opmerkelijke resultaten: een bewezen manier om goede gewoontes te bouwen en slechte te doorbreken.',
        categories: ['Mindset', 'Productiviteit'],
        status: 'published',
        average_rating: 4.6,
        review_count: 8
      },
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        description: 'Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen.',
        categories: ['Financiën'],
        status: 'published',
        average_rating: 4.4,
        review_count: 5
      }
    ];

    let booksInserted = 0;
    for (const book of books) {
      const { error: insertError } = await supabase
        .from('books')
        .upsert(book, { onConflict: 'title' });
      
      if (insertError) {
        console.log(`❌ Error inserting book ${book.title}:`, insertError);
      } else {
        console.log(`✅ Book ${book.title} inserted/updated`);
        booksInserted++;
      }
    }

    console.log('\n🎉 Books database setup completed successfully!');
    console.log(`📊 Results: ${categoriesInserted} categories, ${booksInserted} books`);

  } catch (error) {
    console.error('❌ Error setting up books database:', error);
  }
}

createTablesViaDashboard(); 