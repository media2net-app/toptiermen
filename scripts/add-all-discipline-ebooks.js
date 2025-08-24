const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ebooks = [
  {
    lessonTitle: 'Wat is Discipline en waarom is dit Essentieel',
    ebookTitle: 'Wat is Discipline en waarom is dit Essentieel - Ebook',
    fileUrl: '/books/discipline-basis-ebook.html',
    description: 'Uitgebreid ebook met praktische oefeningen, checklists en reflectie vragen voor de eerste les over discipline.'
  },
  {
    lessonTitle: 'Je Identiteit Definiëren',
    ebookTitle: 'Je Identiteit Definiëren - Ebook',
    fileUrl: '/books/identiteit-definieren-ebook.html',
    description: 'Uitgebreid ebook over het definiëren van je identiteit, met praktische oefeningen en een complete worksheet.'
  },
  {
    lessonTitle: 'Discipline van korte termijn naar een levensstijl',
    ebookTitle: 'Discipline van korte termijn naar een levensstijl - Ebook',
    fileUrl: '/books/discipline-levensstijl-ebook.html',
    description: 'Uitgebreid ebook over het transformeren van discipline van een kortetermijnactie naar een levensstijl.'
  },
  {
    lessonTitle: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?',
    ebookTitle: 'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel? - Ebook',
    fileUrl: '/books/identiteit-kernwaarden-ebook.html',
    description: 'Uitgebreid ebook over identiteit en de essentie van kernwaarden in persoonlijke ontwikkeling.'
  },
  {
    lessonTitle: 'Ontdek je kernwaarden en bouw je Top Tier identiteit',
    ebookTitle: 'Ontdek je kernwaarden en bouw je Top Tier identiteit - Ebook',
    fileUrl: '/books/kernwaarden-top-tier-ebook.html',
    description: 'Uitgebreid ebook over het ontdekken van je kernwaarden en het bouwen van een Top Tier identiteit.'
  }
];

async function addAllDisciplineEbooks() {
  try {
    console.log('🔍 Finding Discipline & Identiteit module...');
    
    // Get discipline module
    const { data: disciplineModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'discipline-identiteit')
      .single();

    if (moduleError) {
      console.error('❌ Error finding discipline module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${disciplineModule.title} (ID: ${disciplineModule.id})\n`);

    // Get all lessons for this module
    const { data: lessons, error } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', disciplineModule.id)
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

    console.log('\n✅ Finished processing all discipline lessons!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAllDisciplineEbooks();
