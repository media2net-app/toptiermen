import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 3 (Fysieke Dominantie) exam...');
    
    // First, get Module 3
    const { data: module3, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('order_index', 3)
      .single();
    
    if (moduleError || !module3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Module 3 not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Found Module 3: ${module3.title}`);
    
    // Create the exam for Module 3
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .upsert({
        module_id: module3.id,
        title: 'Fysieke Dominantie Examen',
        description: 'Test je kennis over fysieke dominantie, kracht, uiterlijk en lichaamstaal',
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
    
    // Create new questions for Module 3
    const questions = [
      {
        question_text: "Wat is fysieke dominantie?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Fysieke dominantie is het vermogen om je fysieke aanwezigheid te gebruiken om respect en autoriteit uit te stralen, zonder agressief te zijn.",
        answers: [
          { answer_text: "Het vermogen om respect en autoriteit uit te stralen met je fysieke aanwezigheid", is_correct: true, order_index: 1 },
          { answer_text: "Het intimideren van anderen met je lichaam", is_correct: false, order_index: 2 },
          { answer_text: "Het hebben van de grootste spieren", is_correct: false, order_index: 3 },
          { answer_text: "Het winnen van fysieke gevechten", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Waarom is fysieke dominantie belangrijk?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Fysieke dominantie helpt je om respect te krijgen, zelfvertrouwen uit te stralen en je doelen te bereiken door je aanwezigheid en lichaamstaal.",
        answers: [
          { answer_text: "Het helpt je respect te krijgen en zelfvertrouwen uit te stralen", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je populair bij vrouwen", is_correct: false, order_index: 2 },
          { answer_text: "Het voorkomt dat anderen je aanvallen", is_correct: false, order_index: 3 },
          { answer_text: "Het geeft je meer geld", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het verschil tussen kracht en macht?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Kracht is fysiek vermogen, terwijl macht de invloed is die je hebt over anderen en situaties. Beide zijn belangrijk voor fysieke dominantie.",
        answers: [
          { answer_text: "Kracht is fysiek vermogen, macht is invloed over anderen", is_correct: true, order_index: 1 },
          { answer_text: "Er is geen verschil tussen beide", is_correct: false, order_index: 2 },
          { answer_text: "Macht is sterker dan kracht", is_correct: false, order_index: 3 },
          { answer_text: "Kracht is alleen voor atleten", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe ontwikkel je fysieke kracht?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Fysieke kracht ontwikkel je door consistente training, progressieve overbelasting en het bouwen van sterke gewoontes in de gym.",
        answers: [
          { answer_text: "Door consistente training en progressieve overbelasting", is_correct: true, order_index: 1 },
          { answer_text: "Door alleen cardio te doen", is_correct: false, order_index: 2 },
          { answer_text: "Door supplementen te nemen", is_correct: false, order_index: 3 },
          { answer_text: "Door veel te eten", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is de rol van uiterlijk bij fysieke dominantie?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Uiterlijk speelt een belangrijke rol omdat het de eerste indruk bepaalt. Een verzorgd uiterlijk toont discipline en zelfrespect.",
        answers: [
          { answer_text: "Het bepaalt de eerste indruk en toont discipline", is_correct: true, order_index: 1 },
          { answer_text: "Het is het enige dat telt", is_correct: false, order_index: 2 },
          { answer_text: "Het maakt geen verschil", is_correct: false, order_index: 3 },
          { answer_text: "Het is alleen belangrijk voor vrouwen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is lichaamstaal en waarom is het belangrijk?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "Lichaamstaal is de non-verbale communicatie die je uitzendt. Het is belangrijk omdat het je zelfvertrouwen en status toont zonder woorden.",
        answers: [
          { answer_text: "Non-verbale communicatie die je zelfvertrouwen en status toont", is_correct: true, order_index: 1 },
          { answer_text: "De manier waarop je praat", is_correct: false, order_index: 2 },
          { answer_text: "De kleding die je draagt", is_correct: false, order_index: 3 },
          { answer_text: "De muziek die je luistert", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Welke lichaamshouding straalt dominantie uit?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Een rechte houding, open borst, schouders naar achteren en oogcontact straalt dominantie en zelfvertrouwen uit.",
        answers: [
          { answer_text: "Rechte houding, open borst en schouders naar achteren", is_correct: true, order_index: 1 },
          { answer_text: "Gebogen houding en ogen naar beneden", is_correct: false, order_index: 2 },
          { answer_text: "Gekruiste armen en benen", is_correct: false, order_index: 3 },
          { answer_text: "Kleine bewegingen en friemelen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe beïnvloedt fysieke fitheid je mentale staat?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Fysieke fitheid verbetert je mentale staat door endorfines vrij te maken, zelfvertrouwen te vergroten en stress te verminderen.",
        answers: [
          { answer_text: "Het verbetert je mentale staat door endorfines en zelfvertrouwen", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt je agressiever", is_correct: false, order_index: 2 },
          { answer_text: "Het heeft geen effect op je mentale staat", is_correct: false, order_index: 3 },
          { answer_text: "Het maakt je alleen fysiek sterker", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het belang van consistentie bij fysieke ontwikkeling?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Consistentie is cruciaal omdat fysieke ontwikkeling tijd kost. Kleine, dagelijkse acties leiden tot grote resultaten op lange termijn.",
        answers: [
          { answer_text: "Kleine, dagelijkse acties leiden tot grote resultaten op lange termijn", is_correct: true, order_index: 1 },
          { answer_text: "Het maakt geen verschil hoe vaak je traint", is_correct: false, order_index: 2 },
          { answer_text: "Je kunt alles in één keer bereiken", is_correct: false, order_index: 3 },
          { answer_text: "Consistentie is alleen belangrijk voor beginners", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoe combineer je fysieke dominantie met respect voor anderen?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Fysieke dominantie moet gebaseerd zijn op zelfvertrouwen en respect, niet op intimidatie. Het gaat om het uitstralen van kracht zonder anderen te schaden.",
        answers: [
          { answer_text: "Door zelfvertrouwen uit te stralen zonder anderen te intimideren", is_correct: true, order_index: 1 },
          { answer_text: "Door altijd de sterkste te zijn", is_correct: false, order_index: 2 },
          { answer_text: "Door anderen te domineren", is_correct: false, order_index: 3 },
          { answer_text: "Door alleen voor jezelf te zorgen", is_correct: false, order_index: 4 }
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
    
    console.log('🎉 Module 3 exam created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Module 3 exam created successfully',
      exam: {
        id: exam.id,
        title: exam.title,
        module: module3.title,
        questions_created: questions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in create-module3-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
