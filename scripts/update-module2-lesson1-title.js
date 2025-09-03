const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateModule2Lesson1Title() {
  console.log('🔄 Titel van Module 2 Les 1 aanpassen...\n');

  try {
    // 1. Find Module 2 (order_index = 2)
    console.log('1️⃣ Zoeken naar Module 2...');
    const { data: module2, error: module2Error } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 2)
      .single();

    if (module2Error) {
      console.error('❌ Module 2 fetch error:', module2Error);
      return;
    }

    console.log('✅ Module 2 gevonden:', module2.title);

    // 2. Find Lesson 1 of Module 2 (order_index = 1)
    console.log('\n2️⃣ Zoeken naar Les 1 van Module 2...');
    const { data: lesson1, error: lesson1Error } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', module2.id)
      .eq('order_index', 1)
      .single();

    if (lesson1Error) {
      console.error('❌ Les 1 fetch error:', lesson1Error);
      return;
    }

    console.log('✅ Les 1 gevonden:', {
      id: lesson1.id,
      huidige_titel: lesson1.title,
      nieuwe_titel: 'De basis van Discipline'
    });

    // 3. Update the title
    console.log('\n3️⃣ Titel aanpassen...');
    const { error: updateError } = await supabase
      .from('academy_lessons')
      .update({
        title: 'De basis van Discipline',
        updated_at: new Date().toISOString()
      })
      .eq('id', lesson1.id);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return;
    }

    console.log('✅ Titel succesvol aangepast!');

    // 4. Verify the update
    console.log('\n4️⃣ Wijziging verifiëren...');
    const { data: updatedLesson, error: verifyError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('id', lesson1.id)
      .single();

    if (verifyError) {
      console.error('❌ Verify error:', verifyError);
    } else {
      console.log('✅ Verificatie succesvol:', {
        id: updatedLesson.id,
        oude_titel: lesson1.title,
        nieuwe_titel: updatedLesson.title,
        updated_at: updatedLesson.updated_at
      });
    }

    console.log('\n🎉 Titel van Module 2 Les 1 succesvol aangepast!');
    console.log(`   Van: "${lesson1.title}"`);
    console.log(`   Naar: "De basis van Discipline"`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

updateModule2Lesson1Title();
