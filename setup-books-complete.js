const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📚 Complete books database setup...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBooksComplete() {
  try {
    console.log('\n🔧 Step 1: Creating exec_sql function...');
    
    // First, create the exec_sql function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing function if it exists
        DROP FUNCTION IF EXISTS exec_sql(text);

        -- Create a proper exec_sql function that returns query results
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS json AS $$
        DECLARE
            result json;
            error_msg text;
        BEGIN
            -- Execute the SQL query and return results as JSON
            EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
            
            -- If no results, return empty array
            IF result IS NULL THEN
                result := '[]'::json;
            END IF;
            
            RETURN result;
            
        EXCEPTION WHEN OTHERS THEN
            -- Return error information
            error_msg := SQLERRM;
            RETURN json_build_object(
                'error', error_msg,
                'success', false
            );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute permission to service_role
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
      `
    });

    if (functionError) {
      console.log('❌ Error creating exec_sql function:', functionError);
      console.log('Trying to use existing function...');
    } else {
      console.log('✅ exec_sql function created successfully');
    }

    console.log('\n📊 Step 2: Creating book_categories table...');
    
    // Create book_categories table
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS book_categories (
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

    if (categoriesError) {
      console.log('❌ Error creating book_categories table:', categoriesError);
      return;
    }

    console.log('✅ book_categories table created');

    console.log('\n📚 Step 3: Creating books table...');
    
    // Create books table
    const { error: booksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS books (
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

    if (booksError) {
      console.log('❌ Error creating books table:', booksError);
      return;
    }

    console.log('✅ books table created');

    console.log('\n📊 Step 4: Inserting sample data...');
    
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

    console.log('\n🎉 Books database setup completed!');
    console.log(`📊 Results: ${categoriesInserted} categories, ${booksInserted} books`);
    console.log('🌐 You can now use the admin dashboard at /dashboard-admin/boekenkamer');

  } catch (error) {
    console.error('❌ Error setting up books database:', error);
  }
}

setupBooksComplete(); 