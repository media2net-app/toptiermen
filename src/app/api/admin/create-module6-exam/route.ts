import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 6 (Brotherhood) exam...');
    
    // First, get Module 6
    const { data: module6, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 6)
      .single();
    
    if (moduleError || !module6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 6 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 6: ${module6.title}`);
    
    // Create the exam for Module 6
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .upsert({
        module_id: module6.id,
        title: 'Brotherhood Examen',
        description: 'Test je kennis over brotherhood, mannelijke vriendschappen, netwerken en sociale verbindingen',
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
    
    // Create new questions for Module 6
    const questions = [
      {
        question_text: "Wat is brotherhood?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Brotherhood is een diepe, betekenisvolle verbinding tussen mannen die gebaseerd is op wederzijds respect, steun en het delen van waarden en doelen.",
        answers: [
          { answer_text: "Een diepe, betekenisvolle verbinding tussen mannen gebaseerd op respect en steun", is_correct: true, order_index: 1 },
          { answer_text: "Een groep mannen die samen sporten", is_correct: false, order_index: 2 },
          { answer_text: "Een exclusieve club voor rijke mannen", is_correct: false, order_index: 3 },
          { answer_text: "Een online community voor mannen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Waarom is brotherhood belangrijk voor mannen?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Brotherhood geeft mannen emotionele steun, motivatie, verantwoordelijkheid en een gevoel van verbondenheid. Het helpt bij persoonlijke groei en mentale gezondheid.",
        answers: [
          { answer_text: "Het geeft emotionele steun, motivatie en helpt bij persoonlijke groei", is_correct: true, order_index: 1 },
          { answer_text: "Het helpt je om meer geld te verdienen", is_correct: false, order_index: 2 },
          { answer_text: "Het maakt je populair bij vrouwen", is_correct: false, order_index: 3 },
          { answer_text: "Het is alleen belangrijk voor jonge mannen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat zijn de kenmerken van een gezonde mannelijke vriendschap?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Gezonde mannelijke vriendschappen zijn gebaseerd op wederzijds respect, eerlijkheid, steun tijdens moeilijke tijden, en het uitdagen van elkaar om te groeien.",
        answers: [
          { answer_text: "Wederzijds respect, eerlijkheid, steun en elkaar uitdagen om te groeien", is_correct: true, order_index: 1 },
          { answer_text: "Altijd hetzelfde doen en denken", is_correct: false, order_index: 2 },
          { answer_text: "Alleen plezier maken en feesten", is_correct: false, order_index: 3 },
          { answer_text: "Elkaar nooit bekritiseren", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe bouw je betekenisvolle mannelijke vriendschappen op?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Betekenisvolle vriendschappen bouw je op door consistentie, kwetsbaarheid, wederzijdse steun, en het delen van ervaringen en doelen.",
        answers: [
          { answer_text: "Door consistentie, kwetsbaarheid, wederzijdse steun en het delen van ervaringen", is_correct: true, order_index: 1 },
          { answer_text: "Door veel geld uit te geven aan vrienden", is_correct: false, order_index: 2 },
          { answer_text: "Door altijd de leider te zijn", is_correct: false, order_index: 3 },
          { answer_text: "Door alleen over oppervlakkige dingen te praten", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verschil tussen netwerken en vriendschap?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Netwerken is gericht op professionele voordelen en kansen, terwijl vriendschap gebaseerd is op emotionele verbinding en wederzijdse steun zonder verwachtingen.",
        answers: [
          { answer_text: "Netwerken is professioneel gericht, vriendschap is emotioneel gebaseerd", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Netwerken is belangrijker dan vriendschap", is_correct: false, order_index: 3 },
          { answer_text: "Vriendschap is alleen voor persoonlijke doelen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Waarom is kwetsbaarheid belangrijk in mannelijke vriendschappen?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "Kwetsbaarheid creëert diepere verbindingen, bouwt vertrouwen op, en helpt mannen om emotionele steun te geven en te ontvangen.",
        answers: [
          { answer_text: "Het creëert diepere verbindingen en bouwt vertrouwen op", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je zwak in de ogen van anderen", is_correct: false, order_index: 2 },
          { answer_text: "Het is alleen belangrijk voor vrouwen", is_correct: false, order_index: 3 },
          { answer_text: "Het voorkomt dat je respect krijgt", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van verantwoordelijkheid in brotherhood?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Verantwoordelijkheid in brotherhood betekent dat je je vrienden helpt om hun beste zelf te worden, hen uitdaagt om te groeien, en hen steunt tijdens moeilijke tijden.",
        answers: [
          { answer_text: "Het betekent je vrienden helpen om hun beste zelf te worden en hen uitdagen om te groeien", is_correct: true, order_index: 1 },
          { answer_text: "Het betekent altijd ja zeggen tegen je vrienden", is_correct: false, order_index: 2 },
          { answer_text: "Het betekent je vrienden nooit bekritiseren", is_correct: false, order_index: 3 },
          { answer_text: "Het betekent alleen plezier maken", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe beïnvloedt brotherhood je persoonlijke groei?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Brotherhood versnelt persoonlijke groei door feedback, uitdagingen, steun tijdens moeilijke tijden, en het delen van ervaringen en lessen.",
        answers: [
          { answer_text: "Het versnelt groei door feedback, uitdagingen en het delen van ervaringen", is_correct: true, order_index: 1 },
          { answer_text: "Het vertraagt groei door afleiding", is_correct: false, order_index: 2 },
          { answer_text: "Het heeft geen invloed op persoonlijke groei", is_correct: false, order_index: 3 },
          { answer_text: "Het maakt groei onnodig", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van gedeelde waarden in brotherhood?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Gedeelde waarden creëren een sterke basis voor brotherhood, zorgen voor consistentie in gedrag, en helpen bij het maken van moeilijke beslissingen.",
        answers: [
          { answer_text: "Ze creëren een sterke basis en zorgen voor consistentie in gedrag", is_correct: true, order_index: 1 },
          { answer_text: "Ze beperken je vrijheid", is_correct: false, order_index: 2 },
          { answer_text: "Ze zijn alleen belangrijk voor religieuze groepen", is_correct: false, order_index: 3 },
          { answer_text: "Ze maken vriendschappen saai", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe onderhoud je langdurige mannelijke vriendschappen?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Langdurige vriendschappen onderhoud je door consistentie, wederzijdse steun, het accepteren van veranderingen, en het blijven investeren in de relatie.",
        answers: [
          { answer_text: "Door consistentie, wederzijdse steun en het blijven investeren in de relatie", is_correct: true, order_index: 1 },
          { answer_text: "Door altijd hetzelfde te blijven", is_correct: false, order_index: 2 },
          { answer_text: "Door alleen contact te hebben wanneer je iets nodig hebt", is_correct: false, order_index: 3 },
          { answer_text: "Door nooit ruzie te maken", is_correct: false, order_index: 4 }
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
    
    console.log('🎉 Module 6 exam created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Module 6 exam created successfully',
      exam: {
        id: exam.id,
        title: exam.title,
        module: module6.title,
        questions_created: questions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in create-module6-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
