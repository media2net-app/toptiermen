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
    console.log('📚 Creating ebooks table...');

    // Create ebooks table using direct SQL
    const { error: createTableError } = await supabase
      .from('academy_ebooks')
      .select('id')
      .limit(1);
    
    if (createTableError && createTableError.code === '42P01') {
      // Table doesn't exist, create it using raw SQL
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql_query: `
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
        `
      });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to create table: ${createError.message}` 
        });
      }
    } else if (createTableError) {
      console.error('❌ Error checking table:', createTableError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to check table: ${createTableError.message}` 
      });
    }

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create table: ${createTableError.message}` 
      });
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_academy_ebooks_lesson_id ON academy_ebooks(lesson_id);
        CREATE INDEX IF NOT EXISTS idx_academy_ebooks_status ON academy_ebooks(status);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Enable RLS
        ALTER TABLE academy_ebooks ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    }

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Create RLS policies
        DROP POLICY IF EXISTS "Users can view published ebooks" ON academy_ebooks;
        CREATE POLICY "Users can view published ebooks" ON academy_ebooks
            FOR SELECT USING (status = 'published');

        DROP POLICY IF EXISTS "Admins can manage all ebooks" ON academy_ebooks;
        CREATE POLICY "Admins can manage all ebooks" ON academy_ebooks
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.user_id = auth.uid() 
                    AND user_profiles.role = 'admin'
                )
            );
      `
    });

    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
    }

    // Insert sample ebook for the first lesson
    const { error: insertError } = await supabase.rpc('execute_sql', {
      sql_query: `
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
      `
    });

    if (insertError) {
      console.error('❌ Error inserting sample ebook:', insertError);
    }

    // Create trigger for updated_at
    const { error: triggerError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Create function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_academy_ebooks_updated_at ON academy_ebooks;
        CREATE TRIGGER update_academy_ebooks_updated_at 
            BEFORE UPDATE ON academy_ebooks 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
    }

    console.log('✅ Ebooks table created successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Ebooks table created successfully',
      errors: {
        createTable: createTableError ? String(createTableError) : null,
        index: indexError ? String(indexError) : null,
        rls: rlsError ? String(rlsError) : null,
        policy: policyError ? String(policyError) : null,
        insert: insertError ? String(insertError) : null,
        trigger: triggerError ? String(triggerError) : null
      }
    });

  } catch (error) {
    console.error('❌ Error creating ebooks table:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to create ebooks table: ${error}` 
    });
  }
}
