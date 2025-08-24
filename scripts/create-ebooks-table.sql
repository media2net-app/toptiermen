-- Create ebooks table for Academy lessons
CREATE TABLE IF NOT EXISTS academy_ebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER, -- in bytes
    page_count INTEGER DEFAULT 15,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_academy_ebooks_lesson_id ON academy_ebooks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_academy_ebooks_status ON academy_ebooks(status);

-- Enable RLS
ALTER TABLE academy_ebooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view published ebooks" ON academy_ebooks
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all ebooks" ON academy_ebooks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Insert sample ebook for the first lesson (Discipline & Identiteit - Les 1)
INSERT INTO academy_ebooks (
    lesson_id,
    title,
    description,
    file_url,
    file_size,
    page_count,
    status
) VALUES (
    (SELECT id FROM academy_lessons WHERE title = 'De Basis van Discipline' AND order_index = 1 LIMIT 1),
    'De Basis van Discipline - Ebook',
    'Uitgebreid ebook met praktische oefeningen, checklists en reflectie vragen voor de eerste les over discipline.',
    '/books/discipline-basis-ebook.pdf',
    1024000, -- 1MB example
    15,
    'published'
) ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_academy_ebooks_updated_at 
    BEFORE UPDATE ON academy_ebooks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
