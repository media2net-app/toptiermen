require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ebooks = [
  {
    lessonTitle: 'Wat is Testosteron',
    ebookTitle: 'Wat is Testosteron - Ebook',
    fileUrl: '/books/testosteron-basis-ebook.html',
    description: 'Uitgebreid ebook over wat testosteron is, de belangrijkste functies en normale waarden voor mannen.'
  },
  {
    lessonTitle: 'De Kracht van Hoog Testosteron',
    ebookTitle: 'De Kracht van Hoog Testosteron - Ebook',
    fileUrl: '/books/testosteron-kracht-ebook.html',
    description: 'Uitgebreid ebook over de voordelen van optimale testosteronwaarden en hoe dit je leven transformeert.'
  },
  {
    lessonTitle: 'Testosteron Killers: Wat moet je Elimineren',
    ebookTitle: 'Testosteron Killers: Wat moet je Elimineren - Ebook',
    fileUrl: '/books/testosteron-killers-ebook.html',
    description: 'Uitgebreid ebook over factoren die je testosteronproductie verlagen en hoe je deze kunt vermijden.'
  },
  {
    lessonTitle: 'TRT en mijn Visie',
    ebookTitle: 'TRT en mijn Visie - Ebook',
    fileUrl: '/books/testosteron-trt-ebook.html',
    description: 'Uitgebreid ebook over Testosteron Replacement Therapy, wanneer het nodig is en mijn eerlijke visie hierop.'
  },
  {
    lessonTitle: 'De Waarheid over Testosteron Doping',
    ebookTitle: 'De Waarheid over Testosteron Doping - Ebook',
    fileUrl: '/books/testosteron-doping-ebook.html',
    description: 'Uitgebreid ebook over de waarheid achter testosteron doping en anabole steroïden.'
  }
];

async function addTestosteronEbooks() {
  try {
    console.log('🔍 Finding Testosteron module...');
    
    // Get testosteron module
    const { data: testosteronModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'test')
      .single();

    if (moduleError) {
      console.error('❌ Error finding testosteron module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${testosteronModule.title} (ID: ${testosteronModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', testosteronModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // Add ebooks for each lesson
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const ebook = ebooks[i];
      
      if (!ebook) {
        console.log(`⚠️ No ebook template found for lesson: ${lesson.title}`);
        continue;
      }

      console.log(`📚 Processing lesson ${i + 1}: ${lesson.title}`);

      // Check if ebook already exists
      const { data: existingEbook, error: checkError } = await supabase
        .from('academy_ebooks')
        .select('id')
        .eq('lesson_id', lesson.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Ebook doesn't exist, create it
        const { error: insertError } = await supabase
          .from('academy_ebooks')
          .insert({
            lesson_id: lesson.id,
            title: ebook.ebookTitle,
            description: ebook.description,
            file_url: ebook.fileUrl,
            file_size: 1024000,
            page_count: 15,
            status: 'published'
          });

        if (insertError) {
          console.error(`❌ Error creating ebook for lesson ${lesson.title}:`, insertError);
        } else {
          console.log(`✅ Created ebook for: ${lesson.title}`);
        }
      } else if (checkError) {
        console.error(`❌ Error checking ebook for lesson ${lesson.title}:`, checkError);
      } else {
        console.log(`ℹ️ Ebook already exists for: ${lesson.title}`);
      }
    }

    console.log('\n✅ Finished processing all testosteron lessons!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTestosteronEbooks();
