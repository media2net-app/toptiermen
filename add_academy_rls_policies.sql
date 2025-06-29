-- Add RLS policies for academy tables
-- Run this SQL in your Supabase SQL editor

-- Enable RLS on academy tables
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_exam_questions ENABLE ROW LEVEL SECURITY;

-- Policies for academy_modules
-- Everyone can view published modules
CREATE POLICY "Anyone can view published modules" ON academy_modules
  FOR SELECT USING (status = 'published');

-- Admin users can view all modules
CREATE POLICY "Admin can view all modules" ON academy_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can insert modules
CREATE POLICY "Admin can insert modules" ON academy_modules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can update modules
CREATE POLICY "Admin can update modules" ON academy_modules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can delete modules
CREATE POLICY "Admin can delete modules" ON academy_modules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policies for academy_lessons
-- Everyone can view lessons from published modules
CREATE POLICY "Anyone can view lessons from published modules" ON academy_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_modules 
      WHERE academy_modules.id = academy_lessons.module_id 
      AND academy_modules.status = 'published'
    )
  );

-- Admin users can view all lessons
CREATE POLICY "Admin can view all lessons" ON academy_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can insert lessons
CREATE POLICY "Admin can insert lessons" ON academy_lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can update lessons
CREATE POLICY "Admin can update lessons" ON academy_lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can delete lessons
CREATE POLICY "Admin can delete lessons" ON academy_lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policies for academy_lesson_attachments
-- Everyone can view attachments from published modules
CREATE POLICY "Anyone can view attachments from published modules" ON academy_lesson_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_lessons 
      JOIN academy_modules ON academy_modules.id = academy_lessons.module_id
      WHERE academy_lessons.id = academy_lesson_attachments.lesson_id 
      AND academy_modules.status = 'published'
    )
  );

-- Admin users can view all attachments
CREATE POLICY "Admin can view all attachments" ON academy_lesson_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can insert attachments
CREATE POLICY "Admin can insert attachments" ON academy_lesson_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can update attachments
CREATE POLICY "Admin can update attachments" ON academy_lesson_attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can delete attachments
CREATE POLICY "Admin can delete attachments" ON academy_lesson_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policies for academy_exam_questions
-- Everyone can view questions from published modules
CREATE POLICY "Anyone can view questions from published modules" ON academy_exam_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM academy_lessons 
      JOIN academy_modules ON academy_modules.id = academy_lessons.module_id
      WHERE academy_lessons.id = academy_exam_questions.lesson_id 
      AND academy_modules.status = 'published'
    )
  );

-- Admin users can view all questions
CREATE POLICY "Admin can view all questions" ON academy_exam_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can insert questions
CREATE POLICY "Admin can insert questions" ON academy_exam_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can update questions
CREATE POLICY "Admin can update questions" ON academy_exam_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can delete questions
CREATE POLICY "Admin can delete questions" ON academy_exam_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 