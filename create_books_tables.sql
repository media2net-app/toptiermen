-- =====================================================
-- BOEKENKAMER DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BOOK CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS book_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    cover_url TEXT,
    description TEXT,
    categories TEXT[] DEFAULT '{}',
    affiliate_bol TEXT,
    affiliate_amazon TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BOOK REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS book_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, user_id)
);

-- =====================================================
-- 4. INSERT INITIAL DATA
-- =====================================================

-- Insert book categories
INSERT INTO book_categories (name, description, color, icon) VALUES
('Mindset & Psychologie', 'Boeken over persoonlijke ontwikkeling, mindset en psychologie', '#8BAE5A', '🧠'),
('Productiviteit & Focus', 'Boeken over time management, productiviteit en focus', '#FFD700', '⚡'),
('Financiën & Business', 'Boeken over geld, investeren en ondernemerschap', '#f0a14f', '💰'),
('Fitness & Gezondheid', 'Boeken over training, voeding en gezondheid', '#FF6B6B', '💪'),
('Leadership & Communicatie', 'Boeken over leiderschap, communicatie en sociale vaardigheden', '#4ECDC4', '🎯'),
('Filosofie & Spiritualiteit', 'Boeken over filosofie, spiritualiteit en levensbeschouwing', '#9B59B6', '🕊️')
ON CONFLICT (name) DO NOTHING;

-- Insert books
INSERT INTO books (title, author, cover_url, description, categories, status, average_rating, review_count) VALUES
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 'Een klassieker over financiële educatie en het verschil tussen activa en passiva. Robert Kiyosaki legt uit hoe de rijken denken over geld en hoe je financiële vrijheid kunt bereiken.', ARRAY['Financiën & Business'], 'published', 4.2, 12),
('Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Een praktische gids voor het bouwen van goede gewoontes en het breken van slechte gewoontes. James Clear legt uit hoe kleine veranderingen tot opmerkelijke resultaten kunnen leiden.', ARRAY['Mindset & Psychologie', 'Productiviteit & Focus'], 'published', 4.5, 8),
('Can''t Hurt Me', 'David Goggins', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Het verhaal van David Goggins over hoe hij zijn mentale en fysieke grenzen verlegde. Een inspirerend boek over discipline, doorzettingsvermogen en mentale weerbaarheid.', ARRAY['Mindset & Psychologie', 'Fitness & Gezondheid'], 'published', 4.8, 15),
('The Psychology of Money', 'Morgan Housel', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 'Een diepgaande analyse van hoe mensen denken over geld en waarom we vaak irrationele financiële beslissingen nemen.', ARRAY['Financiën & Business'], 'published', 4.3, 6),
('Deep Work', 'Cal Newport', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Een gids voor het ontwikkelen van focus en het vermijden van afleidingen in een wereld vol digitale prikkels.', ARRAY['Productiviteit & Focus'], 'published', 4.1, 9)
ON CONFLICT (title) DO NOTHING;

-- Insert sample reviews
INSERT INTO book_reviews (book_id, user_id, rating, text, status) VALUES
((SELECT id FROM books WHERE title = 'Rich Dad Poor Dad' LIMIT 1), 
 (SELECT id FROM users LIMIT 1), 5, 'Fantastisch boek! Heeft mijn kijk op geld volledig veranderd.', 'approved'),
((SELECT id FROM books WHERE title = 'Atomic Habits' LIMIT 1), 
 (SELECT id FROM users LIMIT 1), 4, 'Zeer praktisch en toepasbaar. Aanrader voor iedereen die gewoontes wil veranderen.', 'approved'),
((SELECT id FROM books WHERE title = 'Can''t Hurt Me' LIMIT 1), 
 (SELECT id FROM users LIMIT 1), 5, 'Inspirerend en motiverend. David Goggins is een echte warrior.', 'approved')
ON CONFLICT (book_id, user_id) DO NOTHING;

-- =====================================================
-- 5. UPDATE BOOK COUNTS
-- =====================================================

-- Update book counts in categories
UPDATE book_categories 
SET book_count = (
    SELECT COUNT(*) 
    FROM books 
    WHERE categories && ARRAY[book_categories.name]
);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;

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

-- Book reviews: Users can read all, write their own, admins can moderate
CREATE POLICY "book_reviews_read_policy" ON book_reviews
    FOR SELECT USING (true);

CREATE POLICY "book_reviews_insert_policy" ON book_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "book_reviews_update_policy" ON book_reviews
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "book_reviews_delete_policy" ON book_reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_categories ON books USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- Book reviews indexes
CREATE INDEX IF NOT EXISTS idx_book_reviews_book_id ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_status ON book_reviews(status);
CREATE INDEX IF NOT EXISTS idx_book_reviews_rating ON book_reviews(rating);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_book_categories_name ON book_categories(name);

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_book_categories_updated_at 
    BEFORE UPDATE ON book_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_reviews_updated_at 
    BEFORE UPDATE ON book_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update book statistics
CREATE OR REPLACE FUNCTION update_book_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update average rating and review count for the book
    UPDATE books 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM book_reviews 
            WHERE book_id = NEW.book_id 
            AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM book_reviews 
            WHERE book_id = NEW.book_id 
            AND status = 'approved'
        )
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for book statistics
CREATE TRIGGER update_book_statistics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON book_reviews
    FOR EACH ROW EXECUTE FUNCTION update_book_statistics();

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'book_categories' as table_name, COUNT(*) as row_count FROM book_categories
UNION ALL
SELECT 'books' as table_name, COUNT(*) as row_count FROM books
UNION ALL
SELECT 'book_reviews' as table_name, COUNT(*) as row_count FROM book_reviews;

-- Check if RLS policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('book_categories', 'books', 'book_reviews');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Boekenkamer database setup voltooid!';
    RAISE NOTICE '📚 % boek categorieën aangemaakt', (SELECT COUNT(*) FROM book_categories);
    RAISE NOTICE '📖 % boeken toegevoegd', (SELECT COUNT(*) FROM books);
    RAISE NOTICE '⭐ % reviews geplaatst', (SELECT COUNT(*) FROM book_reviews);
    RAISE NOTICE '🔒 RLS policies geactiveerd voor beveiliging';
    RAISE NOTICE '⚡ Performance indexes aangemaakt';
END $$; 