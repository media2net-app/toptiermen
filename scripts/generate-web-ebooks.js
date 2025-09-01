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

// HTML template for ebooks
function generateEbookHTML(lessonTitle, moduleTitle, moduleNumber, lessonContent, lessonDescription, lessonDuration, lessonType) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lessonTitle} - ${moduleTitle} | Top Tier Men Academy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #1a2115 0%, #232d1a 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #8BAE5A;
        }
        
        .module-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8BAE5A, #B6C948);
            color: #1a2115;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .lesson-title {
            font-size: 2.5em;
            color: #1a2115;
            margin-bottom: 15px;
            font-weight: 700;
            line-height: 1.2;
        }
        
        .module-title {
            font-size: 1.3em;
            color: #8BAE5A;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .lesson-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 14px;
        }
        
        .meta-icon {
            width: 16px;
            height: 16px;
            background: #8BAE5A;
            border-radius: 50%;
        }
        
        .content {
            font-size: 16px;
            line-height: 1.8;
            color: #333;
        }
        
        .content h1 {
            color: #1a2115;
            font-size: 2em;
            margin: 40px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #8BAE5A;
        }
        
        .content h2 {
            color: #1a2115;
            font-size: 1.6em;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #B6C948;
        }
        
        .content h3 {
            color: #1a2115;
            font-size: 1.3em;
            margin: 25px 0 12px 0;
            font-weight: 600;
        }
        
        .content h4 {
            color: #1a2115;
            font-size: 1.1em;
            margin: 20px 0 10px 0;
            font-weight: 600;
        }
        
        .content p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        .content ul, .content ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .content li {
            margin-bottom: 8px;
        }
        
        .content strong {
            color: #1a2115;
            font-weight: 600;
        }
        
        .content em {
            color: #8BAE5A;
            font-style: italic;
        }
        
        .content blockquote {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-left: 4px solid #8BAE5A;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            font-style: italic;
        }
        
        .content code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        .content pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #8BAE5A;
            color: #666;
            font-size: 14px;
        }
        
        .footer-logo {
            font-size: 1.2em;
            font-weight: bold;
            color: #8BAE5A;
            margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                padding: 20px 15px;
            }
            
            .lesson-title {
                font-size: 2em;
            }
            
            .lesson-meta {
                flex-direction: column;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="module-badge">Module ${moduleNumber}</div>
            <h1 class="lesson-title">${lessonTitle}</h1>
            <div class="module-title">${moduleTitle}</div>
            <p style="color: #666; font-size: 16px; max-width: 600px; margin: 0 auto;">
                ${lessonDescription || 'Uitgebreide lesmateriaal en praktische oefeningen voor persoonlijke groei en ontwikkeling.'}
            </p>
            <div class="lesson-meta">
                <div class="meta-item">
                    <div class="meta-icon"></div>
                    <span>Duur: ${lessonDuration || '15-20 minuten'}</span>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"></div>
                    <span>Type: ${lessonType || 'Les'}</span>
                </div>
            </div>
        </div>
        
        <div class="content">
            ${lessonContent || '<p>Lesmateriaal wordt geladen...</p>'}
        </div>
        
        <div class="footer">
            <div class="footer-logo">TOP TIER MEN ACADEMY</div>
            <p>Gemaakt voor mannen die hun potentieel willen maximaliseren</p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                © 2024 Top Tier Men. Alle rechten voorbehouden.
            </p>
        </div>
    </div>
</body>
</html>`;
}

async function generateWebEbooks() {
  try {
    console.log('📚 GENERATING WEB EBOOKS');
    console.log('========================\n');

    // Get all modules ordered by order_index
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ No modules found');
      return;
    }

    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    // Process each module
    for (const module of modules) {
      console.log(`📚 MODULE ${module.order_index.toString().padStart(2, '0')}: ${module.title}`);
      console.log('='.repeat(50));

      // Get all lessons for this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select(`
          id,
          title,
          order_index,
          status,
          content,
          duration,
          type,
          academy_ebooks (
            id,
            title,
            status,
            file_url
          )
        `)
        .eq('module_id', module.id)
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error(`❌ Error fetching lessons for module ${module.title}:`, lessonsError);
        continue;
      }

      if (!lessons || lessons.length === 0) {
        console.log('   ⚠️ No lessons found for this module\n');
        continue;
      }

      // Process each lesson
      for (const lesson of lessons) {
        totalProcessed++;
        const lessonNumber = lesson.order_index + 1;
        const ebooks = lesson.academy_ebooks || [];
        
        console.log(`   📖 ${lessonNumber.toString().padStart(2, '0')}. ${lesson.title}`);
        
        // Check if lesson already has a web version
        const hasWebVersion = ebooks.some(ebook => 
          ebook.file_url && ebook.file_url.includes('.html')
        );
        
        if (hasWebVersion) {
          console.log(`      ✅ Web version already exists`);
          continue;
        }
        
        // Generate web version
        try {
                     const htmlContent = generateEbookHTML(
             lesson.title,
             module.title,
             module.order_index.toString().padStart(2, '0'),
             lesson.content,
             null, // description not available
             lesson.duration,
             lesson.type
           );
          
          // Create filename
          const safeTitle = lesson.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          
          const filename = `${safeTitle}-ebook.html`;
          const fileUrl = `/books/${filename}`;
          
          // Save HTML file to public/books directory
          const publicDir = path.join(process.cwd(), 'public', 'books');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          
          const filePath = path.join(publicDir, filename);
          fs.writeFileSync(filePath, htmlContent, 'utf8');
          
          console.log(`      ✅ Generated: ${filename}`);
          
          // Update or create ebook record
          if (ebooks.length > 0) {
            // Update existing ebook record
            const existingEbook = ebooks[0];
            const { error: updateError } = await supabase
              .from('academy_ebooks')
              .update({
                file_url: fileUrl,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingEbook.id);
            
            if (updateError) {
              console.error(`         ❌ Error updating ebook:`, updateError);
              totalErrors++;
            } else {
              console.log(`         ✅ Updated ebook record`);
              totalUpdated++;
            }
          } else {
            // Create new ebook record
            const { error: insertError } = await supabase
              .from('academy_ebooks')
              .insert({
                lesson_id: lesson.id,
                title: `${lesson.title} - Ebook`,
                file_url: fileUrl,
                status: 'published',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error(`         ❌ Error creating ebook:`, insertError);
              totalErrors++;
            } else {
              console.log(`         ✅ Created ebook record`);
              totalUpdated++;
            }
          }
          
        } catch (error) {
          console.error(`         ❌ Error generating web ebook:`, error.message);
          totalErrors++;
        }
        
        console.log('');
      }
      
      console.log('');
    }

    // Summary
    console.log('📊 GENERATION SUMMARY');
    console.log('=====================');
    console.log(`Total lessons processed: ${totalProcessed}`);
    console.log(`Ebooks updated/created: ${totalUpdated}`);
    console.log(`Errors encountered: ${totalErrors}`);
    console.log(`Success rate: ${totalProcessed > 0 ? Math.round(((totalProcessed - totalErrors) / totalProcessed) * 100) : 0}%`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the generation
generateWebEbooks().then(() => {
  console.log('\n✅ Web ebook generation completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
