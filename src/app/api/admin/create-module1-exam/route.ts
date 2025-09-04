import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Module 1 (Testosteron) exam with updated questions...');
    
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
    
    // Create the exam
    const { data: exam, error: examError } = await supabase
      .from('academy_exams')
      .insert({
        module_id: module1.id,
        title: 'Module 1: Testosteron Examen',
        description: 'Test je kennis over testosteron, de belangrijkste functies, testosteron killers en optimalisatie strategieën.',
        passing_score: 7,
        total_questions: 10,
        time_limit_minutes: 30,
        is_active: true
      })
      .select()
      .single();
    
    if (examError) {
      console.error('❌ Error creating exam:', examError);
      return NextResponse.json({ 
        success: false, 
        error: examError.message 
      }, { status: 500 });
    }
    
    console.log(`✅ Created exam: ${exam.title}`);
    
    // New exam questions based on current accessible content
    const questions = [
      {
        question_text: "Wat is de primaire functie van testosteron in het mannelijk lichaam?",
        question_type: "multiple_choice",
        order_index: 1,
        points: 1,
        explanation: "Testosteron is het belangrijkste mannelijke geslachtshormoon dat een cruciale rol speelt in fysieke en mentale welzijn.",
        answers: [
          { answer_text: "Het reguleren van de bloedsuikerspiegel", is_correct: false, order_index: 1 },
          { answer_text: "Het stimuleren van spiergroei en mannelijke eigenschappen", is_correct: true, order_index: 2 },
          { answer_text: "Het verbeteren van de spijsvertering", is_correct: false, order_index: 3 },
          { answer_text: "Het verlagen van de bloeddruk", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Waar wordt testosteron voornamelijk geproduceerd?",
        question_type: "multiple_choice",
        order_index: 2,
        points: 1,
        explanation: "Testosteron wordt voornamelijk geproduceerd in de testikels en in kleinere hoeveelheden in de bijnieren.",
        answers: [
          { answer_text: "In de lever", is_correct: false, order_index: 1 },
          { answer_text: "In de testikels", is_correct: true, order_index: 2 },
          { answer_text: "In de hersenen", is_correct: false, order_index: 3 },
          { answer_text: "In de maag", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat zijn normale testosteronwaarden voor mannen tussen 19-39 jaar?",
        question_type: "multiple_choice",
        order_index: 3,
        points: 1,
        explanation: "Voor mannen tussen 19-39 jaar liggen de normale waarden tussen 264-916 ng/dL.",
        answers: [
          { answer_text: "100-200 ng/dL", is_correct: false, order_index: 1 },
          { answer_text: "264-916 ng/dL", is_correct: true, order_index: 2 },
          { answer_text: "1000-2000 ng/dL", is_correct: false, order_index: 3 },
          { answer_text: "50-150 ng/dL", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Met hoeveel procent daalt testosteron natuurlijk per jaar na je 30ste?",
        question_type: "multiple_choice",
        order_index: 4,
        points: 1,
        explanation: "Testosteronwaarden dalen natuurlijk met ongeveer 1-2% per jaar na je 30ste.",
        answers: [
          { answer_text: "5-10%", is_correct: false, order_index: 1 },
          { answer_text: "1-2%", is_correct: true, order_index: 2 },
          { answer_text: "10-15%", is_correct: false, order_index: 3 },
          { answer_text: "0.5-1%", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Welke van de volgende is GEEN belangrijke functie van testosteron?",
        question_type: "multiple_choice",
        order_index: 5,
        points: 1,
        explanation: "Testosteron helpt bij spiergroei, botdichtheid, energie, libido, mentale scherpte, gemoedstoestand en vetverbranding, maar niet bij het reguleren van de hartslag.",
        answers: [
          { answer_text: "Spiermassa en kracht stimuleren", is_correct: false, order_index: 1 },
          { answer_text: "Botdichtheid versterken", is_correct: false, order_index: 2 },
          { answer_text: "Hartslag reguleren", is_correct: true, order_index: 3 },
          { answer_text: "Energie en uithoudingsvermogen verhogen", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is de grootste testosteron killer?",
        question_type: "multiple_choice",
        order_index: 6,
        points: 1,
        explanation: "Chronische stress verhoogt cortisol, wat testosteron onderdrukt. Dit is een van de grootste testosteron killers.",
        answers: [
          { answer_text: "Chronische stress", is_correct: true, order_index: 1 },
          { answer_text: "Veel water drinken", is_correct: false, order_index: 2 },
          { answer_text: "Regelmatig sporten", is_correct: false, order_index: 3 },
          { answer_text: "Voldoende slaap", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Hoeveel kan onvoldoende slaap je testosteron verlagen?",
        question_type: "multiple_choice",
        order_index: 7,
        points: 1,
        explanation: "Onvoldoende slaap kan testosteron met tot 40% verlagen, wat een significante impact heeft op je hormoonhuishouding.",
        answers: [
          { answer_text: "5-10%", is_correct: false, order_index: 1 },
          { answer_text: "Tot 40%", is_correct: true, order_index: 2 },
          { answer_text: "Tot 80%", is_correct: false, order_index: 3 },
          { answer_text: "Geen impact", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Welke voeding verlaagt testosteron het meest?",
        question_type: "multiple_choice",
        order_index: 8,
        points: 1,
        explanation: "Verwerkte voeding met suiker en transvetten verlaagt testosteron aanzienlijk.",
        answers: [
          { answer_text: "Groenten en fruit", is_correct: false, order_index: 1 },
          { answer_text: "Mager vlees", is_correct: false, order_index: 2 },
          { answer_text: "Verwerkte voeding met suiker en transvetten", is_correct: true, order_index: 3 },
          { answer_text: "Noten en zaden", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Wat is het effect van een sedentaire levensstijl op testosteron?",
        question_type: "multiple_choice",
        order_index: 9,
        points: 1,
        explanation: "Gebrek aan beweging verlaagt de hormoonproductie, inclusief testosteron.",
        answers: [
          { answer_text: "Het verhoogt testosteron", is_correct: false, order_index: 1 },
          { answer_text: "Het heeft geen effect", is_correct: false, order_index: 2 },
          { answer_text: "Het verlaagt hormoonproductie", is_correct: true, order_index: 3 },
          { answer_text: "Het stabiliseert testosteron", is_correct: false, order_index: 4 }
        ]
      },
      {
        question_text: "Welke van de volgende symptomen wijst op lage testosteronwaarden?",
        question_type: "multiple_choice",
        order_index: 10,
        points: 1,
        explanation: "Vermoeidheid en gebrek aan energie zijn belangrijke symptomen van lage testosteronwaarden, samen met verminderde spierkracht, toename van lichaamsvet, depressie, verminderd libido en concentratieproblemen.",
        answers: [
          { answer_text: "Hoge energie en motivatie", is_correct: false, order_index: 1 },
          { answer_text: "Vermoeidheid en gebrek aan energie", is_correct: true, order_index: 2 },
          { answer_text: "Verhoogd libido", is_correct: false, order_index: 3 },
          { answer_text: "Betere concentratie", is_correct: false, order_index: 4 }
        ]
      }
    ];
    
    // Insert questions and answers
    let questionsCreated = 0;
    let answersCreated = 0;
    
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
      
      if (questionError) {
        console.error(`❌ Error creating question ${questionData.order_index}:`, questionError);
        continue;
      }
      
      questionsCreated++;
      
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
        } else {
          answersCreated++;
        }
      }
    }
    
    console.log(`✅ Created ${questionsCreated} questions and ${answersCreated} answers`);
    
    return NextResponse.json({
      success: true,
      message: 'Module 1 exam created successfully',
      exam: exam,
      questionsCreated: questionsCreated,
      answersCreated: answersCreated
    });
    
  } catch (error) {
    console.error('❌ Error in create-module1-exam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
