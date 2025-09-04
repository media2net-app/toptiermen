import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 5 (Business and Finance) exam...');
    
    // First, get Module 5
    const { data: module5, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 5)
      .single();
    
    if (moduleError || !module5) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 5 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 5: ${module5.title}`);
    
    // Create the exam for Module 5
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .upsert({
        module_id: module5.id,
        title: 'Business & Finance Examen',
        description: 'Test je kennis over business, financiën, investeren en ondernemerschap',
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
    
    // Create new questions for Module 5
    const questions = [
      {
        question_text: "Wat is het verschil tussen activa en passiva?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Activa zijn dingen die je geld opleveren (zoals investeringen), terwijl passiva dingen zijn die je geld kosten (zoals schulden).",
        answers: [
          { answer_text: "Activa leveren geld op, passiva kosten geld", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Activa zijn duurder dan passiva", is_correct: false, order_index: 3 },
          { answer_text: "Passiva zijn belangrijker dan activa", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is compound interest (samengestelde rente)?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Compound interest is rente die je verdient over zowel je oorspronkelijke investering als over de eerder verdiende rente. Het is de kracht achter lange termijn investeringen.",
        answers: [
          { answer_text: "Rente die je verdient over je investering én over eerder verdiende rente", is_correct: true, order_index: 1 },
          { answer_text: "Rente die je alleen over je oorspronkelijke investering verdient", is_correct: false, order_index: 2 },
          { answer_text: "Rente die je moet betalen over leningen", is_correct: false, order_index: 3 },
          { answer_text: "Rente die alleen banken verdienen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van diversificatie bij investeren?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Diversificatie betekent je geld spreiden over verschillende investeringen om risico te verminderen. Het voorkomt dat je alles verliest als één investering slecht presteert.",
        answers: [
          { answer_text: "Het vermindert risico door je geld te spreiden over verschillende investeringen", is_correct: true, order_index: 1 },
          { answer_text: "Het verhoogt je winst", is_correct: false, order_index: 2 },
          { answer_text: "Het maakt investeren makkelijker", is_correct: false, order_index: 3 },
          { answer_text: "Het is alleen voor rijke mensen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is cashflow?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Cashflow is de beweging van geld in en uit je zakken. Positieve cashflow betekent dat er meer geld binnenkomt dan eruit gaat.",
        answers: [
          { answer_text: "De beweging van geld in en uit je zakken", is_correct: true, order_index: 1 },
          { answer_text: "Het geld dat je op de bank hebt staan", is_correct: false, order_index: 2 },
          { answer_text: "Het geld dat je verdient met je baan", is_correct: false, order_index: 3 },
          { answer_text: "Het geld dat je uitgeeft", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verschil tussen een ondernemer en een werknemer?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Een ondernemer neemt risico's en bouwt systemen die geld genereren, terwijl een werknemer tijd verkoopt voor geld. Ondernemers hebben meer controle over hun inkomen.",
        answers: [
          { answer_text: "Ondernemers bouwen systemen die geld genereren, werknemers verkopen tijd", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Werknemers verdienen meer dan ondernemers", is_correct: false, order_index: 3 },
          { answer_text: "Ondernemers werken minder hard", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is de 50/30/20 regel voor budgetteren?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "De 50/30/20 regel betekent: 50% van je inkomen voor essentiële uitgaven, 30% voor persoonlijke uitgaven, en 20% voor sparen en investeren.",
        answers: [
          { answer_text: "50% essentiële uitgaven, 30% persoonlijke uitgaven, 20% sparen/investeren", is_correct: true, order_index: 1 },
          { answer_text: "50% sparen, 30% uitgaven, 20% investeren", is_correct: false, order_index: 2 },
          { answer_text: "50% investeren, 30% sparen, 20% uitgaven", is_correct: false, order_index: 3 },
          { answer_text: "50% uitgaven, 30% sparen, 20% investeren", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van een emergency fund (noodfonds)?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Een emergency fund is geld dat je apart houdt voor onverwachte uitgaven. Het voorkomt dat je schulden moet maken bij tegenslagen.",
        answers: [
          { answer_text: "Het voorkomt dat je schulden moet maken bij onverwachte uitgaven", is_correct: true, order_index: 1 },
          { answer_text: "Het helpt je om meer te investeren", is_correct: false, order_index: 2 },
          { answer_text: "Het geeft je meer rente dan een spaarrekening", is_correct: false, order_index: 3 },
          { answer_text: "Het is alleen belangrijk voor ondernemers", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verschil tussen goede en slechte schulden?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Goede schulden zijn investeringen die je geld opleveren (zoals een hypotheek voor een huurhuis), terwijl slechte schulden dingen zijn die je geld kosten (zoals creditcard schulden).",
        answers: [
          { answer_text: "Goede schulden leveren geld op, slechte schulden kosten geld", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Goede schulden zijn kleiner dan slechte schulden", is_correct: false, order_index: 3 },
          { answer_text: "Slechte schulden zijn belangrijker dan goede schulden", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van financiële educatie?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Financiële educatie helpt je om betere beslissingen te maken over geld, schulden te vermijden, en je financiële toekomst te plannen.",
        answers: [
          { answer_text: "Het helpt je betere beslissingen te maken over geld en je toekomst te plannen", is_correct: true, order_index: 1 },
          { answer_text: "Het is alleen belangrijk voor rijke mensen", is_correct: false, order_index: 2 },
          { answer_text: "Het maakt je gierig", is_correct: false, order_index: 3 },
          { answer_text: "Het is te ingewikkeld voor gewone mensen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is de kracht van passief inkomen?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Passief inkomen is geld dat je verdient zonder actief te werken. Het geeft je vrijheid en tijd, en helpt je om financiële onafhankelijkheid te bereiken.",
        answers: [
          { answer_text: "Het geeft je vrijheid en tijd, en helpt je financiële onafhankelijkheid te bereiken", is_correct: true, order_index: 1 },
          { answer_text: "Het is makkelijk te verdienen", is_correct: false, order_index: 2 },
          { answer_text: "Het is alleen voor ondernemers", is_correct: false, order_index: 3 },
          { answer_text: "Het is minder waard dan actief inkomen", is_correct: false, order_index: 4 }
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
    
    console.log('🎉 Module 5 exam created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Module 5 exam created successfully',
      exam: {
        id: exam.id,
        title: exam.title,
        module: module5.title,
        questions_created: questions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in create-module5-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
