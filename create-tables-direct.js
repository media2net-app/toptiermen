const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract connection details from Supabase URL
const url = new URL(supabaseUrl);
const host = url.hostname;
const port = 5432;
const database = 'postgres';
const user = 'postgres';
const password = supabaseServiceKey;

console.log('📚 Creating books tables via direct PostgreSQL connection...');
console.log('Host:', host);
console.log('Database:', database);

const client = new Client({
  host,
  port,
  database,
  user,
  password,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTablesDirect() {
  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n📊 Creating book_categories table...');
    
    const createCategoriesTable = `
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

    await client.query(createCategoriesTable);
    console.log('✅ book_categories table created');

    console.log('\n📚 Creating books table...');
    
    const createBooksTable = `
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

    await client.query(createBooksTable);
    console.log('✅ books table created');

    console.log('\n📊 Inserting sample data...');
    
    // Insert categories
    const categories = [
      { name: 'Mindset', description: 'Mentale groei en persoonlijke ontwikkeling', icon: '🧠' },
      { name: 'Productiviteit', description: 'Time management en focus', icon: '⚡' },
      { name: 'Financiën', description: 'Geld, investeren en business', icon: '💰' },
      { name: 'Fitness', description: 'Training en gezondheid', icon: '💪' },
      { name: 'Leadership', description: 'Leiderschap en communicatie', icon: '🎯' },
      { name: 'Filosofie', description: 'Stoïcisme en levensbeschouwing', icon: '🏛️' }
    ];

    for (const category of categories) {
      const insertCategory = `
        INSERT INTO book_categories (name, description, icon)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO NOTHING;
      `;
      
      await client.query(insertCategory, [category.name, category.description, category.icon]);
      console.log(`✅ Category ${category.name} inserted/updated`);
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

    for (const book of books) {
      const insertBook = `
        INSERT INTO books (title, author, cover_url, description, categories, status, average_rating, review_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (title) DO NOTHING;
      `;
      
      await client.query(insertBook, [
        book.title,
        book.author,
        book.cover_url,
        book.description,
        book.categories,
        book.status,
        book.average_rating,
        book.review_count
      ]);
      console.log(`✅ Book ${book.title} inserted/updated`);
    }

    console.log('\n🎉 Books database setup completed successfully!');
    console.log('🌐 You can now use the admin dashboard at /dashboard-admin/boekenkamer');

  } catch (error) {
    console.error('❌ Error setting up books database:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

createTablesDirect(); 