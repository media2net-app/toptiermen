import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 7 (Voeding & Gezondheid) exam...');
    
    // First, get Module 7
    const { data: module7, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 7)
      .single();
    
    if (moduleError || !module7) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 7 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 7: ${module7.title}`);
    
    // Create the exam for Module 7
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .upsert({
        module_id: module7.id,
        title: 'Voeding & Gezondheid Examen',
        description: 'Test je kennis over voeding, gezondheid, supplementen en levensstijl',
        passing_score: 7,
        total_questions: 10,
        time_limit_minutes: 30,
        is_active: true
      }, {
        onConflict: 'module_id'
      })
      .select()
      .single();
    
    if (examError || !exam) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create exam: ' + examError?.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Created/updated exam: ${exam.title}`);
    
    // Delete existing questions for this exam
    await supabase
      .from('academy_exam_questions')
      .delete()
      .eq('exam_id', exam.id);
    
    console.log('🗑️ Deleted existing questions');
    
    // Create new questions for Module 7
    const questions = [
      {
        question_text: "Wat zijn macronutriënten?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Macronutriënten zijn de grote voedingsstoffen die je lichaam energie geven: koolhydraten, eiwitten en vetten. Ze zijn essentieel voor je dagelijkse functioneren.",
        answers: [
          { answer_text: "Koolhydraten, eiwitten en vetten - de grote energieleveranciers", is_correct: true, order_index: 1 },
          { answer_text: "Vitaminen en mineralen", is_correct: false, order_index: 2 },
          { answer_text: "Alleen eiwitten", is_correct: false, order_index: 3 },
          { answer_text: "Alleen koolhydraten", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van eiwitten voor spiergroei?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Eiwitten zijn de bouwstenen van spieren. Ze helpen bij spierherstel en -groei na training, en zijn essentieel voor het behoud van spiermassa.",
        answers: [
          { answer_text: "Ze zijn de bouwstenen van spieren en helpen bij spierherstel en -groei", is_correct: true, order_index: 1 },
          { answer_text: "Ze geven je alleen energie", is_correct: false, order_index: 2 },
          { answer_text: "Ze zijn alleen belangrijk voor atleten", is_correct: false, order_index: 3 },
          { answer_text: "Ze voorkomen dat je aankomt", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verschil tussen verzadigde en onverzadigde vetten?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Verzadigde vetten zijn meestal vast bij kamertemperatuur en komen uit dierlijke producten. Onverzadigde vetten zijn meestal vloeibaar en komen uit planten - deze zijn gezonder.",
        answers: [
          { answer_text: "Verzadigde vetten zijn meestal vast, onverzadigde vetten zijn meestal vloeibaar en gezonder", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Verzadigde vetten zijn altijd gezonder", is_correct: false, order_index: 3 },
          { answer_text: "Onverzadigde vetten zijn altijd slecht", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van hydratatie?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Hydratatie is cruciaal voor alle lichaamsfuncties: het helpt bij spijsvertering, temperatuurregulatie, gewrichtssmering en het transport van voedingsstoffen.",
        answers: [
          { answer_text: "Het is cruciaal voor alle lichaamsfuncties en helpt bij spijsvertering en temperatuurregulatie", is_correct: true, order_index: 1 },
          { answer_text: "Het is alleen belangrijk tijdens sporten", is_correct: false, order_index: 2 },
          { answer_text: "Het voorkomt alleen uitdroging", is_correct: false, order_index: 3 },
          { answer_text: "Het is alleen belangrijk in de zomer", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat zijn micronutriënten?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Micronutriënten zijn vitaminen en mineralen die je lichaam in kleine hoeveelheden nodig heeft voor verschillende functies, zoals immuunsysteem en energieproductie.",
        answers: [
          { answer_text: "Vitaminen en mineralen die je lichaam in kleine hoeveelheden nodig heeft", is_correct: true, order_index: 1 },
          { answer_text: "Koolhydraten en eiwitten", is_correct: false, order_index: 2 },
          { answer_text: "Alleen vitaminen", is_correct: false, order_index: 3 },
          { answer_text: "Alleen mineralen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van slaap voor gezondheid?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "Slaap is essentieel voor herstel, geheugenconsolidatie, immuunsysteem, hormoonregulatie en mentale gezondheid. Slechte slaap beïnvloedt alle aspecten van je gezondheid.",
        answers: [
          { answer_text: "Het is essentieel voor herstel, geheugen, immuunsysteem en hormoonregulatie", is_correct: true, order_index: 1 },
          { answer_text: "Het is alleen belangrijk voor je hersenen", is_correct: false, order_index: 2 },
          { answer_text: "Het is alleen belangrijk voor kinderen", is_correct: false, order_index: 3 },
          { answer_text: "Het heeft geen invloed op je gezondheid", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van vezels in je voeding?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Vezels helpen bij spijsvertering, houden je langer vol, reguleren bloedsuiker, en ondersteunen een gezonde darmflora.",
        answers: [
          { answer_text: "Ze helpen bij spijsvertering, houden je langer vol en reguleren bloedsuiker", is_correct: true, order_index: 1 },
          { answer_text: "Ze geven je alleen energie", is_correct: false, order_index: 2 },
          { answer_text: "Ze zijn alleen belangrijk voor vegetariërs", is_correct: false, order_index: 3 },
          { answer_text: "Ze voorkomen alleen constipatie", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van regelmatige maaltijden?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Regelmatige maaltijden helpen bij bloedsuikerregulatie, voorkomen overeten, geven je consistente energie, en ondersteunen een gezonde stofwisseling.",
        answers: [
          { answer_text: "Ze helpen bij bloedsuikerregulatie, voorkomen overeten en geven consistente energie", is_correct: true, order_index: 1 },
          { answer_text: "Ze maken je alleen dikker", is_correct: false, order_index: 2 },
          { answer_text: "Ze zijn alleen belangrijk voor diabetici", is_correct: false, order_index: 3 },
          { answer_text: "Ze hebben geen invloed op je gezondheid", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van lichaamsbeweging voor gezondheid?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Lichaamsbeweging verbetert hartgezondheid, spierkracht, botdichtheid, mentale gezondheid, en helpt bij gewichtsbeheer en ziektepreventie.",
        answers: [
          { answer_text: "Het verbetert hartgezondheid, spierkracht, mentale gezondheid en helpt bij ziektepreventie", is_correct: true, order_index: 1 },
          { answer_text: "Het is alleen belangrijk voor gewichtsverlies", is_correct: false, order_index: 2 },
          { answer_text: "Het is alleen belangrijk voor atleten", is_correct: false, order_index: 3 },
          { answer_text: "Het heeft geen invloed op je gezondheid", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van stressmanagement voor gezondheid?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Chronische stress beïnvloedt je immuunsysteem, spijsvertering, slaap, en mentale gezondheid. Effectief stressmanagement is cruciaal voor algehele gezondheid.",
        answers: [
          { answer_text: "Chronische stress beïnvloedt immuunsysteem, spijsvertering, slaap en mentale gezondheid", is_correct: true, order_index: 1 },
          { answer_text: "Stress heeft geen invloed op je gezondheid", is_correct: false, order_index: 2 },
          { answer_text: "Stress is alleen een mentaal probleem", is_correct: false, order_index: 3 },
          { answer_text: "Stress is alleen belangrijk voor werkende mensen", is_correct: false, order_index: 4 }
        ]
      }
    ];
    
    // Insert questions and answers
    for (const questionData of questions) {
      const { data: question, error: questionError } = await supabase
        .from('academy_exam_questions')
        .insert({
          exam_id: exam.id,
          question_text: questionData.question_text,
          question_type: questionData.question_type,
          order_index: questionData.order_index,
          points: questionData.points,
          explanation: questionData.explanation
        })
        .select()
        .single();
      
      if (questionError || !question) {
        console.error(`❌ Error creating question ${questionData.order_index}:`, questionError);
        continue;
      }
      
      // Insert answers for this question
      for (const answerData of questionData.answers) {
        const { error: answerError } = await supabase
          .from('academy_exam_answers')
          .insert({
            question_id: question.id,
            answer_text: answerData.answer_text,
            is_correct: answerData.is_correct,
            order_index: answerData.order_index
          });
        
        if (answerError) {
          console.error(`❌ Error creating answer for question ${questionData.order_index}:`, answerError);
        }
      }
      
      console.log(`✅ Created question ${questionData.order_index}: ${questionData.question_text.substring(0, 50)}...`);
    }
    
    console.log('🎉 Module 7 exam created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Module 7 exam created successfully',
      exam: {
        id: exam.id,
        title: exam.title,
        module: module7.title,
        questions_created: questions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in create-module7-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
