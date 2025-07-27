# 📚 Boekenkamer Database Setup - Handmatige Instructies

## 🎯 **Doel**
De boekenkamer backend en frontend synchroniseren zodat Rick kan beginnen met het invullen van het platform via de admin dashboard.

## 🔍 **Huidige Status**
- ✅ **Admin Dashboard**: Werkt met mock data (3 boeken)
- ❌ **Frontend**: Gebruikt hardcoded data (verschillende boeken)
- ❌ **Database**: Tabellen bestaan niet (logs tonen "Database table does not exist")

## 📋 **Stap 1: Database Tabellen Aanmaken**

### Ga naar Supabase Dashboard:
1. Open [supabase.com](https://supabase.com)
2. Log in en selecteer je project
3. Ga naar **SQL Editor** in de linker navigatie
4. Klik op **"New query"**

### Kopieer en Plak deze SQL:

```sql
-- =====================================================
-- BOEKENKAMER DATABASE SETUP
-- =====================================================

-- 1. BOOK CATEGORIES TABLE
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

-- 2. BOOKS TABLE
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

-- 3. INSERT DEFAULT CATEGORIES
INSERT INTO book_categories (name, description, icon) VALUES
('Mindset', 'Mentale groei en persoonlijke ontwikkeling', '🧠'),
('Productiviteit', 'Time management en focus', '⚡'),
('Financiën', 'Geld, investeren en business', '💰'),
('Fitness', 'Training en gezondheid', '💪'),
('Leadership', 'Leiderschap en communicatie', '🎯'),
('Filosofie', 'Stoïcisme en levensbeschouwing', '🏛️')
ON CONFLICT (name) DO NOTHING;

-- 4. INSERT SAMPLE BOOKS
INSERT INTO books (title, author, cover_url, description, categories, status, average_rating, review_count) VALUES
('Can''t Hurt Me', 'David Goggins', '/books/canthurtme.jpg', 'David Goggins'' verhaal over hoe hij zijn mentale en fysieke grenzen verlegde.', ARRAY['Mindset', 'Fitness'], 'published', 4.8, 12),
('Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Kleine veranderingen, opmerkelijke resultaten: een bewezen manier om goede gewoontes te bouwen en slechte te doorbreken.', ARRAY['Mindset', 'Productiviteit'], 'published', 4.6, 8),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 'Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen.', ARRAY['Financiën'], 'published', 4.4, 5)
ON CONFLICT (title) DO NOTHING;

-- 5. ENABLE RLS (Row Level Security)
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- Allow public read access to books and categories
CREATE POLICY "Allow public read access to book_categories" ON book_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to books" ON books
    FOR SELECT USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access to book_categories" ON book_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow admin write access to books" ON books
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );
```

### Klik op "Run" om de tabellen aan te maken.

## 📋 **Stap 2: Verificatie**

### Controleer in Supabase:
1. Ga naar **Table Editor**
2. Controleer of je deze tabellen ziet:
   - `book_categories` (6 rijen)
   - `books` (3 rijen)

### Controleer API Routes:
Test deze URLs in je browser:
- `http://localhost:3000/api/admin/books` - Zou 3 boeken moeten tonen
- `http://localhost:3000/api/admin/book-stats` - Zou statistieken moeten tonen

## 📋 **Stap 3: Test de Integratie**

### Admin Dashboard:
1. Ga naar `/dashboard-admin/boekenkamer`
2. Je zou nu **"Live"** moeten zien in plaats van **"Dummy"**
3. De 3 boeken zouden uit de database moeten komen

### Frontend Boekenkamer:
1. Ga naar `/dashboard/boekenkamer`
2. Je zou dezelfde 3 boeken moeten zien als in de admin
3. Categorieën en zoeken zouden moeten werken

## 🎉 **Resultaat**

Na succesvolle setup:
- ✅ **Database tabellen** bestaan en bevatten data
- ✅ **Admin Dashboard** toont echte database data
- ✅ **Frontend** synchroniseert met admin dashboard
- ✅ **Rick kan beginnen** met het invullen van het platform

## 🚨 **Troubleshooting**

### Error: "relation does not exist"
- **Oorzaak**: SQL script is niet correct uitgevoerd
- **Oplossing**: Voer het SQL script opnieuw uit

### Error: "permission denied"
- **Oorzaak**: RLS policies blokkeren toegang
- **Oplossing**: Controleer of je admin rechten hebt

### Geen data zichtbaar
- **Oorzaak**: API routes gebruiken nog mock data
- **Oplossing**: Controleer of de database tabellen bestaan

## 📞 **Hulp Nodig?**

Als je problemen ondervindt:
1. Controleer de Supabase logs
2. Test de API routes individueel
3. Verifieer de database connectie
4. Controleer de RLS policies

## 🚀 **Volgende Stappen**

Zodra de boekenkamer werkt:
1. **Aankondigingen** database setup
2. **Forum Moderatie** database setup
3. **Evenementenbeheer** database setup
4. **Voedingsplannen** database setup 