-- Update books table with missing columns
-- Execute this in Supabase Dashboard > SQL Editor

-- Add missing columns to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS cover TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS book_type TEXT DEFAULT 'ebook',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'Nederlands',
ADD COLUMN IF NOT EXISTS pages INTEGER,
ADD COLUMN IF NOT EXISTS published_year INTEGER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_books_categories ON books USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured);

-- Update existing records to have default values
UPDATE books 
SET 
  cover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
  categories = ARRAY['algemeen'],
  average_rating = 4.0,
  review_count = 0,
  is_featured = false,
  book_type = 'ebook',
  language = 'Nederlands'
WHERE cover IS NULL;

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
  title,
  author,
  categories,
  average_rating,
  review_count,
  is_featured
FROM books 
LIMIT 5;
