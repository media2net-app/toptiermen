import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 4 (Mentale Kracht/Weerbaarheid) exam...');
    
    // First, get Module 4
    const { data: module4, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 4)
      .single();
    
    if (moduleError || !module4) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 4 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 4: ${module4.title}`);
    
    // Create the exam for Module 4
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .upsert({
        module_id: module4.id,
        title: 'Mentale Kracht & Weerbaarheid Examen',
        description: 'Test je kennis over mentale kracht, weerbaarheid, stress management en mentale gezondheid',
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
    
    // Create new questions for Module 4
    const questions = [
      {
        question_text: "Wat is mentale kracht?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Mentale kracht is het vermogen om om te gaan met uitdagingen, stress en tegenslagen zonder jezelf te verliezen. Het gaat om veerkracht en doorzettingsvermogen.",
        answers: [
          { answer_text: "Het vermogen om om te gaan met uitdagingen en tegenslagen", is_correct: true, order_index: 1 },
          { answer_text: "Het vermijden van alle problemen", is_correct: false, order_index: 2 },
          { answer_text: "Het hebben van een perfecte mentale staat", is_correct: false, order_index: 3 },
          { answer_text: "Het negeren van je emoties", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is weerbaarheid?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Weerbaarheid is het vermogen om terug te veren na tegenslagen en sterker te worden van moeilijke ervaringen. Het is de basis van mentale kracht.",
        answers: [
          { answer_text: "Het vermogen om terug te veren na tegenslagen en sterker te worden", is_correct: true, order_index: 1 },
          { answer_text: "Het vermijden van alle moeilijke situaties", is_correct: false, order_index: 2 },
          { answer_text: "Het hebben van een dikke huid", is_correct: false, order_index: 3 },
          { answer_text: "Het negeren van pijn en verdriet", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe ontwikkel je mentale kracht?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Mentale kracht ontwikkel je door uitdagingen aan te gaan, je comfortzone te verlaten, en te leren van je fouten en tegenslagen.",
        answers: [
          { answer_text: "Door uitdagingen aan te gaan en je comfortzone te verlaten", is_correct: true, order_index: 1 },
          { answer_text: "Door alleen makkelijke taken te doen", is_correct: false, order_index: 2 },
          { answer_text: "Door anderen te imiteren", is_correct: false, order_index: 3 },
          { answer_text: "Door perfectie na te streven", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is stress en hoe beïnvloedt het je?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Stress is de reactie van je lichaam op druk en uitdagingen. Het kan zowel positief (motiverend) als negatief (schadelijk) zijn, afhankelijk van hoe je ermee omgaat.",
        answers: [
          { answer_text: "De reactie van je lichaam op druk, kan positief of negatief zijn", is_correct: true, order_index: 1 },
          { answer_text: "Altijd schadelijk voor je gezondheid", is_correct: false, order_index: 2 },
          { answer_text: "Iets dat je moet vermijden", is_correct: false, order_index: 3 },
          { answer_text: "Alleen een mentaal probleem", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat zijn gezonde manieren om met stress om te gaan?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Gezonde stress management omvat regelmatige lichaamsbeweging, voldoende slaap, gezonde voeding, sociale steun en ontspanningstechnieken.",
        answers: [
          { answer_text: "Lichaamsbeweging, slaap, gezonde voeding en ontspanning", is_correct: true, order_index: 1 },
          { answer_text: "Alcohol en drugs gebruiken", is_correct: false, order_index: 2 },
          { answer_text: "Problemen negeren", is_correct: false, order_index: 3 },
          { answer_text: "Alleen werken en geen tijd voor jezelf", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van zelfbewustzijn?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "Zelfbewustzijn helpt je om je eigen gedrag, emoties en reacties te begrijpen. Het is de basis voor persoonlijke groei en betere besluitvorming.",
        answers: [
          { answer_text: "Het helpt je je eigen gedrag en emoties te begrijpen", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je egoïstisch", is_correct: false, order_index: 2 },
          { answer_text: "Het is alleen belangrijk voor psychologen", is_correct: false, order_index: 3 },
          { answer_text: "Het voorkomt dat je fouten maakt", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe beïnvloedt je mindset je prestaties?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Je mindset bepaalt hoe je uitdagingen benadert. Een groeimindset helpt je om te leren van fouten en door te zetten, terwijl een vaste mindset je beperkt.",
        answers: [
          { answer_text: "Een groeimindset helpt je om te leren van fouten en door te zetten", is_correct: true, order_index: 1 },
          { answer_text: "Mindset heeft geen invloed op prestaties", is_correct: false, order_index: 2 },
          { answer_text: "Alleen talent bepaalt je prestaties", is_correct: false, order_index: 3 },
          { answer_text: "Je mindset is vast en kan niet veranderen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van doelen stellen?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Doelen geven je richting en motivatie. Ze helpen je om gefocust te blijven en je voortgang te meten, wat essentieel is voor mentale kracht.",
        answers: [
          { answer_text: "Ze geven je richting, motivatie en helpen je gefocust te blijven", is_correct: true, order_index: 1 },
          { answer_text: "Ze beperken je vrijheid", is_correct: false, order_index: 2 },
          { answer_text: "Ze zijn alleen belangrijk voor carrière", is_correct: false, order_index: 3 },
          { answer_text: "Ze veroorzaken alleen stress", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe bouw je zelfvertrouwen op?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Zelfvertrouwen bouw je op door kleine successen te vieren, je comfortzone te verlaten, en te leren van je ervaringen en feedback.",
        answers: [
          { answer_text: "Door kleine successen te vieren en je comfortzone te verlaten", is_correct: true, order_index: 1 },
          { answer_text: "Door anderen te overtreffen", is_correct: false, order_index: 2 },
          { answer_text: "Door perfectie na te streven", is_correct: false, order_index: 3 },
          { answer_text: "Door alleen makkelijke taken te doen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van sociale steun voor mentale kracht?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Sociale steun geeft je een gevoel van verbondenheid, helpt je om stress te delen, en biedt perspectief en motivatie tijdens moeilijke tijden.",
        answers: [
          { answer_text: "Het geeft verbondenheid, helpt stress te delen en biedt perspectief", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je afhankelijk van anderen", is_correct: false, order_index: 2 },
          { answer_text: "Het is alleen belangrijk voor zwakke mensen", is_correct: false, order_index: 3 },
          { answer_text: "Het heeft geen invloed op mentale kracht", is_correct: false, order_index: 4 }
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
    
    console.log('🎉 Module 4 exam created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Module 4 exam created successfully',
      exam: {
        id: exam.id,
        title: exam.title,
        module: module4.title,
        questions_created: questions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in create-module4-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
