import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Checking all academy exams...');
    
    // Get all modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, order_index')
      .order('order_index');
    
    if (modulesError) {
      return NextResponse.json({ 
        success: false, 
        error: modulesError.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${modules?.length || 0} modules`);
    
    // Get all exams
    const { data: exams, error: examsError } = await supabase
      .from('academy_exams')
      .select(`
        id,
        title,
        description,
        passing_score,
        total_questions,
        is_active,
        module_id
      `)
      .order('created_at');
    
    if (examsError) {
      return NextResponse.json({ 
        success: false, 
        error: examsError.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${exams?.length || 0} exams`);
    
    // Check which modules have exams
    const modulesWithExams = modules?.map(module => {
      const moduleExam = exams?.find(exam => exam.module_id === module.id);
      return {
        module: module,
        hasExam: !!moduleExam,
        exam: moduleExam
      };
    });
    
    return NextResponse.json({
      success: true,
      modules: modules || [],
      exams: exams || [],
      modulesWithExams: modulesWithExams || []
    });
    
  } catch (error) {
    console.error('❌ Error in check-all-exams:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
