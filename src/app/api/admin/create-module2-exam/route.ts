import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 2 (Discipline & Identiteit) exam...');
    
    // First, get Module 2
    const { data: module2, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 2)
      .single();
    
    if (moduleError || !module2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 2 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 2: ${module2.title}`);
    
    // Create the exam for Module 2
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .upsert({
        module_id: module2.id,
        title: 'Discipline & Identiteit Examen',
        description: 'Test je kennis over discipline, militaire discipline, levensstijl en identiteitsontwikkeling',
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
    
    // Create new questions for Module 2
    const questions = [
      {
        question_text: "Wat is de basis van discipline volgens de module?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Discipline is de basis van alle persoonlijke groei en succes. Het gaat om het vermogen om jezelf te controleren en te focussen op wat belangrijk is.",
        answers: [
          { answer_text: "Het vermogen om jezelf te controleren en te focussen", is_correct: true, order_index: 1 },
          { answer_text: "Het volgen van strikte regels zonder uitzondering", is_correct: false, order_index: 2 },
          { answer_text: "Het vermijden van alle verleidingen", is_correct: false, order_index: 3 },
          { answer_text: "Het perfectioneren van elke handeling", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verschil tussen discipline en motivatie?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Motivatie is tijdelijk en emotioneel, terwijl discipline consistent en betrouwbaar is. Discipline werkt ook wanneer motivatie wegvalt.",
        answers: [
          { answer_text: "Discipline is consistent, motivatie is tijdelijk", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Motivatie is sterker dan discipline", is_correct: false, order_index: 3 },
          { answer_text: "Discipline is alleen voor zwakke mensen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is militaire discipline?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Militaire discipline is een specifieke vorm van discipline die draait om het volgen van orders, respect voor hiërarchie en het uitvoeren van taken onder druk.",
        answers: [
          { answer_text: "Het volgen van orders en respect voor hiërarchie", is_correct: true, order_index: 1 },
          { answer_text: "Het dragen van een uniform", is_correct: false, order_index: 2 },
          { answer_text: "Het gebruik van wapens", is_correct: false, order_index: 3 },
          { answer_text: "Het marcheren in formatie", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Waarom is militaire discipline nuttig in het dagelijks leven?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Militaire discipline leert je om taken uit te voeren onder druk, door te zetten wanneer het moeilijk wordt en respect te hebben voor autoriteit en structuur.",
        answers: [
          { answer_text: "Het leert je doorzetten onder druk en respect voor structuur", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je agressiever", is_correct: false, order_index: 2 },
          { answer_text: "Het helpt je om anderen te bevelen", is_correct: false, order_index: 3 },
          { answer_text: "Het geeft je meer fysieke kracht", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat betekent discipline in je levensstijl?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Discipline in je levensstijl betekent het maken van bewuste keuzes die je gezondheid, productiviteit en welzijn ondersteunen, zelfs wanneer het moeilijk is.",
        answers: [
          { answer_text: "Bewuste keuzes maken voor je gezondheid en welzijn", is_correct: true, order_index: 1 },
          { answer_text: "Altijd hetzelfde eten en drinken", is_correct: false, order_index: 2 },
          { answer_text: "Geen plezier meer hebben in het leven", is_correct: false, order_index: 3 },
          { answer_text: "Strikt volgen van een dieet", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat zijn kernwaarden in de context van identiteit?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "Kernwaarden zijn de fundamentele principes die je gedrag en beslissingen sturen. Ze vormen de basis van je identiteit en bepalen wie je bent.",
        answers: [
          { answer_text: "Fundamentele principes die je gedrag en beslissingen sturen", is_correct: true, order_index: 1 },
          { answer_text: "De regels die anderen voor je opstellen", is_correct: false, order_index: 2 },
          { answer_text: "Tijdelijke voorkeuren die kunnen veranderen", is_correct: false, order_index: 3 },
          { answer_text: "De doelen die je wilt bereiken", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Waarom is het belangrijk om je kernwaarden te kennen?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Het kennen van je kernwaarden helpt je om consistente beslissingen te nemen, je doelen te bepalen en een leven te leiden dat past bij wie je werkelijk bent.",
        answers: [
          { answer_text: "Het helpt je consistente beslissingen te maken en doelen te bepalen", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je populair bij anderen", is_correct: false, order_index: 2 },
          { answer_text: "Het geeft je meer geld", is_correct: false, order_index: 3 },
          { answer_text: "Het voorkomt dat je fouten maakt", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is een Top Tier identiteit?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Een Top Tier identiteit is een sterke, consistente identiteit gebaseerd op discipline, kernwaarden en het streven naar excellentie in alle aspecten van het leven.",
        answers: [
          { answer_text: "Een sterke identiteit gebaseerd op discipline en excellentie", is_correct: true, order_index: 1 },
          { answer_text: "Een identiteit die anderen imponeert", is_correct: false, order_index: 2 },
          { answer_text: "Een perfecte identiteit zonder fouten", is_correct: false, order_index: 3 },
          { answer_text: "Een identiteit die veel geld verdient", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe ontwikkel je discipline in je dagelijks leven?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Discipline ontwikkel je door kleine, consistente acties te ondernemen, gewoontes te bouwen en jezelf verantwoordelijk te houden voor je keuzes.",
        answers: [
          { answer_text: "Door kleine, consistente acties en het bouwen van gewoontes", is_correct: true, order_index: 1 },
          { answer_text: "Door grote, drastische veranderingen te maken", is_correct: false, order_index: 2 },
          { answer_text: "Door anderen te imiteren", is_correct: false, order_index: 3 },
          { answer_text: "Door alleen te doen wat je leuk vindt", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verband tussen discipline en persoonlijke groei?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Discipline is de motor van persoonlijke groei. Zonder discipline blijf je steken in oude patronen en bereik je je doelen niet.",
        answers: [
          { answer_text: "Discipline is de motor van persoonlijke groei", is_correct: true, order_index: 1 },
          { answer_text: "Discipline beperkt persoonlijke groei", is_correct: false, order_index: 2 },
          { answer_text: "Er is geen verband tussen beide", is_correct: false, order_index: 3 },
          { answer_text: "Discipline is alleen nodig voor fysieke groei", is_correct: false, order_index: 4 }
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
    
    console.log('🎉 Module 2 exam created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Module 2 exam created successfully',
      exam: {
        id: exam.id,
        title: exam.title,
        module: module2.title,
        questions_created: questions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in create-module2-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
