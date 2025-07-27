const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBooksTables() {
  try {
    console.log('📚 Setting up books tables...');

    // Create book_categories table
    console.log('Creating book_categories table...');
    const { error: categoriesError } = await supabase
      .from('book_categories')
      .select('*')
      .limit(1);

    if (categoriesError && categoriesError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Table book_categories does not exist, creating...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE book_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            color VARCHAR(7) DEFAULT '#8BAE5A',
            icon VARCHAR(50),
            book_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (createError) {
        console.error('Error creating book_categories table:', createError);
        console.log('Trying alternative approach...');
        
        // Try direct SQL execution
        const { error: directError } = await supabase
          .from('book_categories')
          .insert({ name: 'test' })
          .select();

        if (directError) {
          console.error('Direct table creation also failed:', directError);
          console.log('Please create the tables manually in Supabase dashboard');
          return;
        }
      } else {
        console.log('✅ book_categories table created');
      }
    } else {
      console.log('✅ book_categories table already exists');
    }

    // Create books table
    console.log('Creating books table...');
    const { error: booksError } = await supabase
      .from('books')
      .select('*')
      .limit(1);

    if (booksError && booksError.code === 'PGRST116') {
      console.log('Table books does not exist, creating...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE books (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            cover_url TEXT,
            description TEXT,
            categories TEXT[] DEFAULT '{}',
            affiliate_bol TEXT,
            affiliate_amazon TEXT,
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
            average_rating DECIMAL(3,2) DEFAULT 0,
            review_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (createError) {
        console.error('Error creating books table:', createError);
      } else {
        console.log('✅ books table created');
      }
    } else {
      console.log('✅ books table already exists');
    }

    // Insert default categories
    console.log('Inserting default categories...');
    const categories = [
      { name: 'Mindset', description: 'Mentale groei en persoonlijke ontwikkeling', icon: '🧠' },
      { name: 'Productiviteit', description: 'Time management en focus', icon: '⚡' },
      { name: 'Financiën', description: 'Geld, investeren en business', icon: '💰' },
      { name: 'Fitness', description: 'Training en gezondheid', icon: '💪' },
      { name: 'Leadership', description: 'Leiderschap en communicatie', icon: '🎯' },
      { name: 'Filosofie', description: 'Stoïcisme en levensbeschouwing', icon: '🏛️' }
    ];

    for (const category of categories) {
      const { error: insertError } = await supabase
        .from('book_categories')
        .upsert(category, { onConflict: 'name' });
      
      if (insertError) {
        console.error(`Error inserting category ${category.name}:`, insertError);
      } else {
        console.log(`✅ Category ${category.name} inserted/updated`);
      }
    }

    // Insert sample books
    console.log('Inserting sample books...');
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

    for (const book of books) {
      const { error: insertError } = await supabase
        .from('books')
        .upsert(book, { onConflict: 'title' });
      
      if (insertError) {
        console.error(`Error inserting book ${book.title}:`, insertError);
      } else {
        console.log(`✅ Book ${book.title} inserted/updated`);
      }
    }

    console.log('🎉 Books database setup completed!');
    console.log('📊 You can now use the admin dashboard to manage books');
    console.log('🌐 Frontend will automatically sync with the database');

  } catch (error) {
    console.error('❌ Error setting up books tables:', error);
    console.log('💡 Please create the tables manually in Supabase dashboard using the SQL from create_books_tables.sql');
  }
}

setupBooksTables(); 