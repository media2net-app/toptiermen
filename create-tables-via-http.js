const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📚 Creating books tables via direct HTTP requests...');
console.log('URL:', supabaseUrl);

// Extract project ID from URL
const projectId = supabaseUrl.split('//')[1].split('.')[0];
const apiUrl = `https://${projectId}.supabase.co/rest/v1/rpc/exec_sql`;

async function makeRequest(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ sql });

    const options = {
      hostname: `${projectId}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function createTablesViaHttp() {
  try {
    console.log('\n🔧 Step 1: Creating exec_sql function...');
    
    const createFunctionSQL = `
      -- Drop existing function if it exists
      DROP FUNCTION IF EXISTS exec_sql(text);

      -- Create a proper exec_sql function
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
    `;

    const { status, data } = await makeRequest(createFunctionSQL);
    console.log('Function creation response:', status, data);

    console.log('\n📊 Step 2: Creating book_categories table...');
    
    const createCategoriesSQL = `
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
    `;

    const { status: catStatus, data: catData } = await makeRequest(createCategoriesSQL);
    console.log('Categories table creation response:', catStatus, catData);

    console.log('\n📚 Step 3: Creating books table...');
    
    const createBooksSQL = `
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
    `;

    const { status: bookStatus, data: bookData } = await makeRequest(createBooksSQL);
    console.log('Books table creation response:', bookStatus, bookData);

    console.log('\n🔒 Step 4: Disabling RLS temporarily...');
    
    const disableRLSSQL = `
      ALTER TABLE book_categories DISABLE ROW LEVEL SECURITY;
      ALTER TABLE books DISABLE ROW LEVEL SECURITY;
    `;

    const { status: rlsStatus, data: rlsData } = await makeRequest(disableRLSSQL);
    console.log('RLS disable response:', rlsStatus, rlsData);

    console.log('\n📊 Step 5: Inserting sample data...');
    
    const insertCategoriesSQL = `
      INSERT INTO book_categories (name, description, icon) VALUES
      ('Mindset', 'Mentale groei en persoonlijke ontwikkeling', '🧠'),
      ('Productiviteit', 'Time management en focus', '⚡'),
      ('Financiën', 'Geld, investeren en business', '💰'),
      ('Fitness', 'Training en gezondheid', '💪'),
      ('Leadership', 'Leiderschap en communicatie', '🎯'),
      ('Filosofie', 'Stoïcisme en levensbeschouwing', '🏛️')
      ON CONFLICT (name) DO NOTHING;
    `;

    const { status: insertCatStatus, data: insertCatData } = await makeRequest(insertCategoriesSQL);
    console.log('Categories insert response:', insertCatStatus, insertCatData);

    const insertBooksSQL = `
      INSERT INTO books (title, author, cover_url, description, categories, status, average_rating, review_count) VALUES
      ('Can''t Hurt Me', 'David Goggins', '/books/canthurtme.jpg', 'David Goggins'' verhaal over hoe hij zijn mentale en fysieke grenzen verlegde.', ARRAY['Mindset', 'Fitness'], 'published', 4.8, 12),
      ('Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Kleine veranderingen, opmerkelijke resultaten: een bewezen manier om goede gewoontes te bouwen en slechte te doorbreken.', ARRAY['Mindset', 'Productiviteit'], 'published', 4.6, 8),
      ('Rich Dad Poor Dad', 'Robert Kiyosaki', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 'Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen.', ARRAY['Financiën'], 'published', 4.4, 5)
      ON CONFLICT (title) DO NOTHING;
    `;

    const { status: insertBookStatus, data: insertBookData } = await makeRequest(insertBooksSQL);
    console.log('Books insert response:', insertBookStatus, insertBookData);

    console.log('\n🔒 Step 6: Re-enabling RLS with proper policies...');
    
    const enableRLSSQL = `
      ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE books ENABLE ROW LEVEL SECURITY;

      -- Book categories: Everyone can read, only admins can write
      DROP POLICY IF EXISTS "book_categories_read_policy" ON book_categories;
      CREATE POLICY "book_categories_read_policy" ON book_categories
          FOR SELECT USING (true);

      DROP POLICY IF EXISTS "book_categories_write_policy" ON book_categories;
      CREATE POLICY "book_categories_write_policy" ON book_categories
          FOR ALL USING (
              EXISTS (
                  SELECT 1 FROM users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );

      -- Books: Everyone can read, only admins can write
      DROP POLICY IF EXISTS "books_read_policy" ON books;
      CREATE POLICY "books_read_policy" ON books
          FOR SELECT USING (true);

      DROP POLICY IF EXISTS "books_write_policy" ON books;
      CREATE POLICY "books_write_policy" ON books
          FOR ALL USING (
              EXISTS (
                  SELECT 1 FROM users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'admin'
              )
          );
    `;

    const { status: policiesStatus, data: policiesData } = await makeRequest(enableRLSSQL);
    console.log('RLS policies response:', policiesStatus, policiesData);

    console.log('\n🎉 Books database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up books database:', error);
  }
}

createTablesViaHttp(); 