require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// HTML Template for ebooks
function createEbookHTML(title, moduleTitle, lessonContent = '') {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Top Tier Men Academy</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
        }
        
        .ebook-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #8BAE5A 0%, #3A4D23 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.025em;
        }
        
        .header .subtitle {
            font-size: 1.2rem;
            font-weight: 400;
            color: white;
            opacity: 1;
        }
        
        .content {
            padding: 50px;
        }
        
        .toc {
            background: #f8fafc;
            border-left: 4px solid #8BAE5A;
            padding: 30px;
            margin: 30px 0;
            border-radius: 8px;
        }
        
        .toc h2 {
            color: #8BAE5A;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .toc ol {
            list-style: none;
            counter-reset: toc-counter;
        }
        
        .toc li {
            counter-increment: toc-counter;
            margin-bottom: 8px;
            padding-left: 30px;
            position: relative;
        }
        
        .toc li::before {
            content: counter(toc-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: #8BAE5A;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .toc a {
            color: #374151;
            text-decoration: none;
            font-weight: 500;
        }
        
        .toc a:hover {
            color: #8BAE5A;
        }
        
        .chapter {
            margin: 40px 0;
        }
        
        .chapter h2 {
            color: #8BAE5A;
            font-size: 1.8rem;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .chapter h3 {
            color: #374151;
            font-size: 1.4rem;
            margin: 25px 0 15px 0;
        }
        
        .chapter p {
            margin-bottom: 15px;
            color: #4b5563;
        }
        
        .chapter ul, .chapter ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        .chapter li {
            margin-bottom: 8px;
            color: #4b5563;
        }
        
        .highlight-box {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        
        .highlight-box h4 {
            color: #0c4a6e;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .action-item {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        
        .action-item h4 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .content {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="ebook-container">
        <div class="header">
            <h1>${title}</h1>
            <div class="subtitle">${moduleTitle} - Top Tier Men Academy</div>
        </div>
        
        <div class="content">
            <div class="toc">
                <h2>Inhoudsopgave</h2>
                <ol>
                    <li><a href="#intro">Inleiding</a></li>
                    <li><a href="#main-content">Hoofdinhoud</a></li>
                    <li><a href="#practical-tips">Praktische Tips</a></li>
                    <li><a href="#reflection">Reflectie Vragen</a></li>
                    <li><a href="#next-steps">Volgende Stappen</a></li>
                </ol>
            </div>
            
            <div class="chapter">
                <h2 id="intro">Inleiding</h2>
                <p>Welkom bij deze les van de ${moduleTitle} module. In deze les gaan we dieper in op ${title.toLowerCase()} en hoe dit je kan helpen om een Top Tier Man te worden.</p>
                
                <div class="highlight-box">
                    <h4>🎯 Wat je gaat leren</h4>
                    <ul>
                        <li>De fundamenten van ${title.toLowerCase()}</li>
                        <li>Praktische toepassingen in je dagelijks leven</li>
                        <li>Strategieën voor langdurige implementatie</li>
                        <li>Hoe dit past in je Top Tier Men reis</li>
                    </ul>
                </div>
            </div>
            
            <div class="chapter">
                <h2 id="main-content">Hoofdinhoud</h2>
                ${lessonContent || `
                <p>Deze les behandelt de essentiële aspecten van ${title.toLowerCase()} en hoe dit je kan helpen om je doelen te bereiken.</p>
                
                <h3>De Belangrijkste Principes</h3>
                <p>Om ${title.toLowerCase()} effectief te implementeren, moet je begrijpen dat het niet alleen gaat om kennis, maar vooral om consistente actie.</p>
                
                <h3>Waarom Dit Belangrijk Is</h3>
                <p>Top Tier Men begrijpen dat succes niet toevallig gebeurt. Het is het resultaat van bewuste keuzes en consistente actie.</p>
                `}
            </div>
            
            <div class="chapter">
                <h2 id="practical-tips">Praktische Tips</h2>
                <div class="action-item">
                    <h4>💪 Direct Toepasbaar</h4>
                    <ul>
                        <li>Begin vandaag nog met kleine stappen</li>
                        <li>Houd je voortgang bij in een dagboek</li>
                        <li>Zoek een accountability partner</li>
                        <li>Vier je kleine overwinningen</li>
                    </ul>
                </div>
            </div>
            
            <div class="chapter">
                <h2 id="reflection">Reflectie Vragen</h2>
                <p>Neem de tijd om over deze vragen na te denken:</p>
                <ul>
                    <li>Hoe kan je ${title.toLowerCase()} implementeren in je huidige situatie?</li>
                    <li>Welke uitdagingen verwacht je en hoe ga je ze overwinnen?</li>
                    <li>Hoe zal dit je helpen om je doelen te bereiken?</li>
                    <li>Welke ondersteuning heb je nodig om succesvol te zijn?</li>
                </ul>
            </div>
            
            <div class="chapter">
                <h2 id="next-steps">Volgende Stappen</h2>
                <p>Nu je deze les hebt afgerond, is het tijd om actie te ondernemen:</p>
                <ol>
                    <li>Implementeer minstens één tip uit deze les</li>
                    <li>Plan je volgende acties</li>
                    <li>Deel je ervaringen met je broeders</li>
                    <li>Ga door naar de volgende les</li>
                </ol>
                
                <div class="highlight-box">
                    <h4>🎯 Herinnering</h4>
                    <p>Onthoud: Top Tier Men worden niet geboren, ze worden gemaakt door consistente actie en onwrikbare discipline.</p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Top Tier Men Academy. Alle rechten voorbehouden.</p>
            <p>Deze ebook is onderdeel van de ${moduleTitle} module.</p>
        </div>
    </div>
</body>
</html>`;
}

async function createAllAcademyEbooks() {
  try {
    console.log('📚 Creating HTML ebooks for all Academy modules...\n');

    // 1. Get all published modules with lessons
    console.log('1️⃣ Fetching all published modules and lessons...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        status,
        academy_lessons(
          id,
          title,
          order_index,
          status,
          content
        )
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules\n`);

    // 2. Create books directory if it doesn't exist
    const booksDir = path.join(__dirname, '../public/books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    // 3. Process each module
    let totalEbooksCreated = 0;
    let totalEbooksSkipped = 0;

    for (const module of modules || []) {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      
      console.log(`📚 Processing module: ${module.title} (${publishedLessons.length} lessons)`);
      
      for (const lesson of publishedLessons) {
        // Create filename based on existing naming convention
        const moduleSlug = module.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const filename = `${moduleSlug}-${lessonSlug}-ebook.html`;
        const filepath = path.join(booksDir, filename);
        
        // Check if file already exists
        if (fs.existsSync(filepath)) {
          console.log(`   ⏭️  Skipped: ${filename} (already exists)`);
          totalEbooksSkipped++;
          continue;
        }
        
        // Create ebook content
        const ebookHTML = createEbookHTML(lesson.title, module.title, lesson.content);
        
        // Write file
        fs.writeFileSync(filepath, ebookHTML, 'utf8');
        console.log(`   ✅ Created: ${filename}`);
        totalEbooksCreated++;
      }
      
      console.log('');
    }

    // 4. Summary
    console.log('📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total Modules Processed: ${modules?.length || 0}`);
    console.log(`Ebooks Created: ${totalEbooksCreated}`);
    console.log(`Ebooks Skipped: ${totalEbooksSkipped}`);
    console.log(`Total Ebooks: ${totalEbooksCreated + totalEbooksSkipped}`);
    
    if (totalEbooksCreated > 0) {
      console.log('\n🎉 Successfully created HTML ebooks!');
      console.log('📁 Files saved in: public/books/');
    } else {
      console.log('\nℹ️  All ebooks already exist!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAllAcademyEbooks();
