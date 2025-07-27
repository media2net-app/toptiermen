-- =====================================================
-- BOEKENKAMER DATABASE SETUP - SIMPLIFIED VERSION
-- =====================================================

-- =====================================================
-- 1. BOOK CATEGORIES TABLE
-- =====================================================
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

-- =====================================================
-- 2. BOOKS TABLE
-- =====================================================
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

-- =====================================================
-- 3. INSERT SAMPLE DATA
-- =====================================================

-- Insert book categories
INSERT INTO book_categories (name, description, color, icon) VALUES
('Mindset', 'Mentale groei en persoonlijke ontwikkeling', '#8BAE5A', '🧠'),
('Productiviteit', 'Time management en focus', '#FFD700', '⚡'),
('Financiën', 'Geld, investeren en business', '#f0a14f', '💰'),
('Fitness', 'Training en gezondheid', '#FF6B6B', '💪'),
('Leadership', 'Leiderschap en communicatie', '#4ECDC4', '🎯'),
('Filosofie', 'Stoïcisme en levensbeschouwing', '#9B59B6', '🏛️')
ON CONFLICT (name) DO NOTHING;

-- Insert books
INSERT INTO books (title, author, cover_url, description, categories, status, average_rating, review_count) VALUES
('Can''t Hurt Me', 'David Goggins', '/books/canthurtme.jpg', 'David Goggins'' verhaal over hoe hij zijn mentale en fysieke grenzen verlegde.', ARRAY['Mindset', 'Fitness'], 'published', 4.8, 12),
('Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Kleine veranderingen, opmerkelijke resultaten: een bewezen manier om goede gewoontes te bouwen en slechte te doorbreken.', ARRAY['Mindset', 'Productiviteit'], 'published', 4.6, 8),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 'Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen.', ARRAY['Financiën'], 'published', 4.4, 5)
ON CONFLICT (title) DO NOTHING;

-- =====================================================
-- 4. UPDATE BOOK COUNTS
-- =====================================================

-- Update book counts in categories
UPDATE book_categories 
SET book_count = (
    SELECT COUNT(*) 
    FROM books 
    WHERE categories && ARRAY[book_categories.name]
);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Book categories: Everyone can read, only admins can write
CREATE POLICY "book_categories_read_policy" ON book_categories
    FOR SELECT USING (true);

CREATE POLICY "book_categories_write_policy" ON book_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Books: Everyone can read, only admins can write
CREATE POLICY "books_read_policy" ON books
    FOR SELECT USING (true);

CREATE POLICY "books_write_policy" ON books
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

-- Check if tables were created successfully
SELECT 'book_categories' as table_name, COUNT(*) as row_count FROM book_categories
UNION ALL
SELECT 'books' as table_name, COUNT(*) as row_count FROM books; 