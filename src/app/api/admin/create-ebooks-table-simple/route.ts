import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Creating ebooks table (simple method)...');

    // Check if table already exists
    const { data: existingData, error: checkError } = await supabase
      .from('academy_ebooks')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, we need to create it
      console.log('📚 Table does not exist, creating...');
      
      // For now, we'll return a message that manual creation is needed
      return NextResponse.json({ 
        success: false, 
        error: 'Table creation requires manual SQL execution. Please run the SQL script manually in your Supabase dashboard.',
        sqlScript: `
-- Create ebooks table for Academy lessons
CREATE TABLE IF NOT EXISTS academy_ebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    page_count INTEGER DEFAULT 15,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_academy_ebooks_lesson_id ON academy_ebooks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_academy_ebooks_status ON academy_ebooks(status);

-- Enable RLS
ALTER TABLE academy_ebooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view published ebooks" ON academy_ebooks
    FOR SELECT USING (status = 'published');

-- Allow authenticated users to manage ebooks (you can restrict this later)
CREATE POLICY "Authenticated users can manage ebooks" ON academy_ebooks
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert sample ebook
INSERT INTO academy_ebooks (
    lesson_id,
    title,
    description,
    file_url,
    file_size,
    page_count,
    status
) VALUES (
    (SELECT id FROM academy_lessons WHERE title = 'Wat is Discipline en waarom is dit Essentieel' AND order_index = 1 LIMIT 1),
    'Wat is Discipline en waarom is dit Essentieel - Ebook',
    'Uitgebreid ebook met praktische oefeningen, checklists en reflectie vragen voor de eerste les over discipline.',
    '/books/discipline-basis-ebook.pdf',
    1024000,
    15,
    'published'
) ON CONFLICT DO NOTHING;
        `
      });
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to check table: ${checkError.message}` 
      });
    } else {
      // Table exists, try to insert sample data
      console.log('📚 Table exists, checking for sample data...');
      
      const { data: lessonData, error: lessonError } = await supabase
        .from('academy_lessons')
        .select('id')
        .eq('title', 'Wat is Discipline en waarom is dit Essentieel')
        .eq('order_index', 1)
        .limit(1);

      if (lessonError || !lessonData || lessonData.length === 0) {
        console.error('❌ Error finding lesson:', lessonError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to find lesson: ${lessonError?.message || 'No lesson found'}` 
        });
      }

      const lessonId = lessonData[0].id;

      // Check if sample ebook already exists
      const { data: existingEbook, error: ebookCheckError } = await supabase
        .from('academy_ebooks')
        .select('id')
        .eq('lesson_id', lessonId)
        .single();

      if (ebookCheckError && ebookCheckError.code === 'PGRST116') {
        // Sample ebook doesn't exist, create it
        const { error: insertError } = await supabase
          .from('academy_ebooks')
          .insert({
            lesson_id: lessonId,
            title: 'Wat is Discipline en waarom is dit Essentieel - Ebook',
            description: 'Uitgebreid ebook met praktische oefeningen, checklists en reflectie vragen voor de eerste les over discipline.',
            file_url: '/books/discipline-basis-ebook.pdf',
            file_size: 1024000,
            page_count: 15,
            status: 'published'
          });

        if (insertError) {
          console.error('❌ Error inserting sample ebook:', insertError);
          return NextResponse.json({ 
            success: false, 
            error: `Failed to insert sample ebook: ${insertError.message}` 
          });
        }

        console.log('✅ Sample ebook created successfully');
      } else if (ebookCheckError) {
        console.error('❌ Error checking sample ebook:', ebookCheckError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to check sample ebook: ${ebookCheckError.message}` 
        });
      } else {
        console.log('✅ Sample ebook already exists');
      }

      console.log('✅ Ebooks table setup completed successfully');

      return NextResponse.json({ 
        success: true, 
        message: 'Ebooks table setup completed successfully',
        tableExists: true,
        sampleDataExists: !ebookCheckError || ebookCheckError.code !== 'PGRST116'
      });
    }

  } catch (error) {
    console.error('❌ Error in ebooks table setup:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to setup ebooks table: ${error}` 
    });
  }
}
