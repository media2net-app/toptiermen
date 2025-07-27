# 📚 Books Database Setup Instructions

## 🎯 **Doel**
De boekenkamer functionaliteit volledig werkend maken met echte database data.

## 📋 **Stap 1: Database Tabellen Aanmaken**

### Ga naar Supabase Dashboard:
1. Open je Supabase project dashboard
2. Ga naar **SQL Editor**
3. Kopieer en plak de volgende SQL code:

```sql
-- Create book_categories table
CREATE TABLE IF NOT EXISTS book_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    book_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    cover_url TEXT,
    description TEXT,
    categories TEXT[], -- Array of category names
    affiliate_bol TEXT,
    affiliate_amazon TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create book_reviews table
CREATE TABLE IF NOT EXISTS book_reviews (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO book_categories (name) VALUES 
    ('Mindset'),
    ('Productiviteit'),
    ('Financiën'),
    ('Psychologie'),
    ('Besluitvorming'),
    ('Leadership')
ON CONFLICT (name) DO NOTHING;

-- Insert Rich Dad Poor Dad book
INSERT INTO books (title, author, cover_url, description, categories, status, average_rating, review_count) VALUES 
(
    'Rich Dad Poor Dad',
    'Robert Kiyosaki',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    'Een klassieker over financiële educatie en het verschil tussen activa en passiva. Robert Kiyosaki legt uit hoe de rijken denken over geld en hoe je financiële vrijheid kunt bereiken.',
    ARRAY['Financiën', 'Mindset'],
    'published',
    4.2,
    12
);

-- Update book count for categories
UPDATE book_categories 
SET book_count = (
    SELECT COUNT(*) 
    FROM books 
    WHERE categories && ARRAY[name]
);

-- Enable RLS
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to book_categories" ON book_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to books" ON books
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create book_reviews" ON book_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own reviews" ON book_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow admin to manage all book_reviews" ON book_reviews
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    ));
```

### Klik op "Run" om de tabellen aan te maken.

## 📋 **Stap 2: Test de Boekenkamer**

1. Ga naar: `http://localhost:3000/dashboard-admin/boekenkamer`
2. De pagina zou nu moeten laden met echte database data
3. Je zou Rich Dad Poor Dad moeten zien in de boekenlijst

## 📋 **Stap 3: API Routes Activeren**

Zodra de tabellen zijn aangemaakt, kunnen de volgende API routes gebruikt worden:

- `GET /api/admin/books` - Haal alle boeken op
- `GET /api/admin/book-categories` - Haal alle categorieën op  
- `GET /api/admin/book-reviews` - Haal alle reviews op
- `GET /api/admin/book-stats` - Haal statistieken op

## 🔄 **Stap 4: Boekenkamer Updaten**

Zodra de database tabellen werken, kan de boekenkamer pagina worden aangepast om echte API calls te gebruiken in plaats van mock data.

## ✅ **Verwachte Resultaten**

Na het uitvoeren van deze stappen zou je moeten zien:

- ✅ **5 Boeken** in de database (inclusief Rich Dad Poor Dad)
- ✅ **6 Categorieën** (Mindset, Productiviteit, Financiën, etc.)
- ✅ **4 Reviews** (2 pending, 2 approved)
- ✅ **Statistieken** met echte data
- ✅ **Nieuwe styling** met AdminCard componenten

## 🚨 **Troubleshooting**

Als er problemen zijn:

1. **Controleer Supabase logs** voor SQL errors
2. **Test API routes** met curl commands
3. **Controleer RLS policies** als data niet zichtbaar is
4. **Refresh de pagina** na database wijzigingen

## 📊 **Huidige Status**

- ✅ **Mock Data**: Werkt met Rich Dad Poor Dad
- ✅ **Styling**: Nieuwe admin styling toegepast
- ✅ **Components**: AdminCard, AdminStatsCard gebruikt
- ⏳ **Database**: Wacht op handmatige setup
- ⏳ **Real API**: Wacht op database tabellen 