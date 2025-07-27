const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBooksDatabase() {
  console.log('📚 Setting up books database...');

  try {
    // Read the SQL script
    const fs = require('fs');
    const sqlScript = fs.readFileSync('create_books_tables.sql', 'utf8');

    console.log('📖 SQL script loaded, executing...');

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });

          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            // Continue with next statement
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
          // Continue with next statement
        }
      }
    }

    console.log('🎉 Books database setup completed!');

    // Verify the setup
    console.log('🔍 Verifying setup...');
    
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('count')
      .limit(1);

    if (booksError) {
      console.error('❌ Books table verification failed:', booksError);
    } else {
      console.log('✅ Books table exists and is accessible');
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('book_categories')
      .select('count')
      .limit(1);

    if (categoriesError) {
      console.error('❌ Book categories table verification failed:', categoriesError);
    } else {
      console.log('✅ Book categories table exists and is accessible');
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('book_reviews')
      .select('count')
      .limit(1);

    if (reviewsError) {
      console.error('❌ Book reviews table verification failed:', reviewsError);
    } else {
      console.log('✅ Book reviews table exists and is accessible');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Check if exec_sql function exists
async function checkExecSqlFunction() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1;'
    });

    if (error) {
      console.error('❌ exec_sql function not available:', error);
      console.log('💡 Please create the exec_sql function in your Supabase database first.');
      console.log('📖 See setup_database_access.md for instructions.');
      process.exit(1);
    } else {
      console.log('✅ exec_sql function is available');
    }
  } catch (err) {
    console.error('❌ Error checking exec_sql function:', err);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting books database setup...');
  
  await checkExecSqlFunction();
  await setupBooksDatabase();
  
  console.log('🎉 Setup completed successfully!');
  console.log('📚 You can now use the Boekenkamer with real database data.');
}

main().catch(console.error); 