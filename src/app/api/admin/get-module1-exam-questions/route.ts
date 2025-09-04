import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Fetching Module 1 exam questions...');
    
    // First, get Module 1
    const { data: module1, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 1)
      .single();
    
    if (moduleError || !module1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 1 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 1: ${module1.title}`);
    
    // Get the exam for Module 1
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .select('id, title, description')
      .eq('module_id', module1.id)
      .single();
    
    if (examError || !exam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 1 exam not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found exam: ${exam.title}`);
    
    // Get all questions for this exam
    const { data: questions, error: questionsError } = await supabase
      .from('academy_exam_questions')
      .select(`
        id,
        question_text,
        question_type,
        order_index,
        points,
        explanation,
        academy_exam_answers (
          id,
          answer_text,
          is_correct,
          order_index
        )
      `)
      .eq('exam_id', exam.id)
      .order('order_index');
    
    if (questionsError) {
      return NextResponse.json({ 
        success: false, 
        error: questionsError.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${questions?.length || 0} questions`);
    
    return NextResponse.json({
      success: true,
      module: module1,
      exam: exam,
      questions: questions || []
    });
    
  } catch (error) {
    console.error('❌ Error in get-module1-exam-questions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
