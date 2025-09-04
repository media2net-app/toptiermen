import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔧 Creating exam tables...');
    
    const sqlCommands = `
-- Run these SQL commands in your Supabase SQL editor to create the exam system:

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create academy_exams table
CREATE TABLE IF NOT EXISTS academy_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER NOT NULL DEFAULT 7 CHECK (passing_score >= 1 AND passing_score <= 10),
    total_questions INTEGER NOT NULL DEFAULT 10 CHECK (total_questions >= 1 AND total_questions <= 20),
    time_limit_minutes INTEGER DEFAULT 30 CHECK (time_limit_minutes >= 5 AND time_limit_minutes <= 120),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academy_exam_questions table
CREATE TABLE IF NOT EXISTS academy_exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES academy_exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
    order_index INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 1 CHECK (points >= 1 AND points <= 5),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academy_exam_answers table
CREATE TABLE IF NOT EXISTS academy_exam_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES academy_exam_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_exam_attempts table
CREATE TABLE IF NOT EXISTS user_exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES academy_exams(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions >= 1),
    passed BOOLEAN NOT NULL DEFAULT false,
    time_taken_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_exam_answers table
CREATE TABLE IF NOT EXISTS user_exam_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES user_exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES academy_exam_questions(id) ON DELETE CASCADE,
    selected_answer_id UUID REFERENCES academy_exam_answers(id),
    is_correct BOOLEAN NOT NULL DEFAULT false,
    points_earned INTEGER NOT NULL DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academy_exams_module_id ON academy_exams(module_id);
CREATE INDEX IF NOT EXISTS idx_academy_exams_active ON academy_exams(is_active);
CREATE INDEX IF NOT EXISTS idx_academy_exam_questions_exam_id ON academy_exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_academy_exam_questions_order ON academy_exam_questions(exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_academy_exam_answers_question_id ON academy_exam_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_academy_exam_answers_correct ON academy_exam_answers(question_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_user_id ON user_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_exam_id ON user_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_attempts_passed ON user_exam_attempts(user_id, exam_id, passed);
    `;
    
    console.log('📋 SQL commands generated for exam tables');
    
    return NextResponse.json({
      success: true,
      message: 'SQL commands generated. Run these in Supabase SQL editor to create exam tables.',
      sqlCommands: sqlCommands
    });
    
  } catch (error) {
    console.error('❌ Error generating SQL commands:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
