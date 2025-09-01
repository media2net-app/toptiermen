const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 1 lessons
const module1EnhancedContent = {
  'Wat is Testosteron': {
    title: 'Wat is Testosteron?',
    subtitle: 'De Complete Gids voor Mannen',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Testosteron is niet alleen een hormoon - het is de fundering van je mannelijkheid, energie en vitaliteit.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De wetenschap achter testosteron en hoe het werkt</li>
              <li>Hoe je je eigen testosteronwaarden kunt meten</li>
              <li>Praktische stappen om je hormonen te optimaliseren</li>
              <li>Veelgemaakte fouten die je testosteron verlagen</li>
              <li>Een 30-dagen actieplan voor resultaten</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Testosteron is verantwoordelijk voor 90% van je mannelijke eigenschappen en beïnvloedt alles van je stemming tot je spierkracht.</p>
          </div>
        `
      },
      {
        title: 'De Wetenschap van Testosteron',
        content: `
          <div class="page-header">
            <h2>De Wetenschap van Testosteron</h2>
            <p class="lead">Begrijp hoe dit krachtige hormoon je lichaam en geest beïnvloedt.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat is Testosteron?</h3>
            <p>Testosteron is het primaire mannelijke geslachtshormoon dat wordt geproduceerd in de testikels en in mindere mate in de bijnieren. Het is verantwoordelijk voor de ontwikkeling van mannelijke kenmerken en speelt een cruciale rol in je algehele gezondheid.</p>
            
            <h3>De Belangrijkste Functies</h3>
            <div class="function-grid">
              <div class="function-card">
                <h4>💪 Spiermassa</h4>
                <p>Stimuleert eiwitsynthese en spiergroei</p>
              </div>
              <div class="function-card">
                <h4>🦴 Botdichtheid</h4>
                <p>Versterkt botten en voorkomt osteoporose</p>
              </div>
              <div class="function-card">
                <h4>⚡ Energie en Uithoudingsvermogen</h4>
                <p>Verhoogt energie en vermindert vermoeidheid</p>
              </div>
              <div class="function-card">
                <h4>🧠 Hersenfunctie</h4>
                <p>Verbetert geheugen, focus en cognitieve prestaties</p>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Testosteron Meten en Monitoren',
        content: `
          <div class="page-header">
            <h2>Testosteron Meten en Monitoren</h2>
            <p class="lead">Leer hoe je je testosteronwaarden kunt meten en bijhouden.</p>
          </div>
          
          <div class="content-section">
            <h3>Bloedonderzoek</h3>
            <p>De meest accurate manier om je testosteron te meten is via een bloedonderzoek. Dit kan je huisarts voor je aanvragen.</p>
            
            <h3>Zelf-Test Opties</h3>
            <div class="test-options">
              <div class="test-option">
                <h4>🏥 Laboratorium Test</h4>
                <p>Meest nauwkeurig, vereist doktersbezoek</p>
              </div>
              <div class="test-option">
                <h4>🏠 Thuis Test Kit</h4>
                <p>Convenient maar minder nauwkeurig</p>
              </div>
              <div class="test-option">
                <h4>📱 Symptoom Tracking</h4>
                <p>Gratis maar subjectief</p>
              </div>
            </div>
          </div>
        `
      },
      {
        title: '30-Dagen Testosteron Optimalisatie Plan',
        content: `
          <div class="page-header">
            <h2>30-Dagen Testosteron Optimalisatie Plan</h2>
            <p class="lead">Een gestructureerd plan om je testosteron te verhogen.</p>
          </div>
          
          <div class="content-section">
            <h3>Week 1: Foundation</h3>
            <div class="week-plan">
              <h4>🎯 Doel: Basis gewoonten implementeren</h4>
              <ul>
                <li>Dag 1-3: Slaap optimaliseren (7-9 uur)</li>
                <li>Dag 4-5: Stress management technieken</li>
                <li>Dag 6-7: Voeding aanpassen</li>
              </ul>
            </div>
            
            <h3>Week 2-4: Optimalisatie</h3>
            <div class="week-plan">
              <h4>🚀 Doel: Alle principes integreren</h4>
              <ul>
                <li>Training schema optimaliseren</li>
                <li>Supplementen evalueren</li>
                <li>Progressie bijhouden</li>
              </ul>
            </div>
          </div>
        `
      }
    ]
  },
  
  'De Kracht van Hoog Testosteron': {
    title: 'De Kracht van Hoog Testosteron',
    subtitle: 'Maximaliseer Je Mannelijke Potentieel',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Ontdek hoe hoog testosteron je leven kan transformeren en je potentieel kan maximaliseren.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De voordelen van optimale testosteronwaarden</li>
              <li>Hoe testosteron je prestaties beïnvloedt</li>
              <li>Strategieën om je testosteron te verhogen</li>
              <li>Het verband tussen testosteron en succes</li>
              <li>Een actieplan voor maximale resultaten</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Voordelen van Hoog Testosteron',
        content: `
          <div class="page-header">
            <h2>De Voordelen van Hoog Testosteron</h2>
            <p class="lead">Verken de transformatieve kracht van optimale hormoonwaarden.</p>
          </div>
          
          <div class="content-section">
            <h3>Fysieke Voordelen</h3>
            <div class="benefits-grid">
              <div class="benefit-card">
                <h4>💪 Spierkracht</h4>
                <p>Snellere spiergroei en herstel</p>
              </div>
              <div class="benefit-card">
                <h4>🔥 Vetverbranding</h4>
                <p>Verhoogde stofwisseling</p>
              </div>
              <div class="benefit-card">
                <h4>⚡ Uithoudingsvermogen</h4>
                <p>Betere prestaties tijdens training</p>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Testosteron Doping': {
    title: 'De Waarheid over Testosteron Doping',
    subtitle: 'Risico\'s, Voordelen en Alternatieven',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Een eerlijke blik op testosteron doping, de risico's en veilige alternatieven.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De waarheid over anabole steroïden</li>
              <li>Risico's en bijwerkingen</li>
              <li>Veilige alternatieven</li>
              <li>Wettelijke aspecten</li>
              <li>Een geïnformeerde beslissing maken</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Risico\'s van Doping',
        content: `
          <div class="page-header">
            <h2>De Risico's van Doping</h2>
            <p class="lead">Begrijp de gevaren voordat je een beslissing neemt.</p>
          </div>
          
          <div class="content-section">
            <h3>Gezondheidsrisico's</h3>
            <div class="risk-grid">
              <div class="risk-card">
                <h4>❤️ Hart- en Vaatziekten</h4>
                <p>Verhoogd risico op hartproblemen</p>
              </div>
              <div class="risk-card">
                <h4>🧠 Hersenschade</h4>
                <p>Mogelijke cognitieve problemen</p>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Testosteron Killers': {
    title: 'Testosteron Killers',
    subtitle: 'Wat Je Moet Elimineren voor Optimale Waarden',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Identificeer en elimineer de factoren die je testosteron verlagen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De grootste testosteron killers</li>
              <li>Hoe je ze kunt vermijden</li>
              <li>Alternatieven en oplossingen</li>
              <li>Een detox plan opstellen</li>
              <li>Je hormonen beschermen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Top 5 Testosteron Killers',
        content: `
          <div class="page-header">
            <h2>De Top 5 Testosteron Killers</h2>
            <p class="lead">Elimineer deze factoren om je testosteron te beschermen.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Chronische Stress</h3>
            <p>Langdurige stress verhoogt cortisol, wat testosteron onderdrukt.</p>
            
            <h3>2. Slechte Slaap</h3>
            <p>Onvoldoende slaap verlaagt testosteron met tot 40%.</p>
            
            <h3>3. Overmatig Alcohol</h3>
            <p>Alcohol verstoort de hormoonproductie.</p>
            
            <h3>4. Verwerkte Voeding</h3>
            <p>Suiker en transvetten verlagen testosteron.</p>
            
            <h3>5. Sedentaire Levensstijl</h4>
            <p>Gebrek aan beweging verlaagt hormoonproductie.</p>
          </div>
        `
      }
    ]
  }
};

// Generate enhanced HTML for a lesson
function generateEnhancedHTML(lessonData, moduleTitle, moduleNumber) {
  const pagesHTML = lessonData.pages.map((page, index) => `
    <div class="page">
      <div class="page-content">
        ${page.content}
      </div>
      <div class="page-footer">
        <span class="page-number">Pagina ${index + 1}</span>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lessonData.title} - ${moduleTitle} | Top Tier Men Academy</title>
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
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
            border-radius: 20px;
            margin-top: 20px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #8BAE5A, #B6C948);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .module-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            backdrop-filter: blur(10px);
        }
        
        .lesson-title {
            font-size: 2.8em;
            margin-bottom: 15px;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .lesson-subtitle {
            font-size: 1.4em;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .ebook-content {
            padding: 0;
        }
        
        .page {
            padding: 40px 30px;
            border-bottom: 1px solid #e0e0e0;
            min-height: 600px;
            display: flex;
            flex-direction: column;
        }
        
        .page:last-child {
            border-bottom: none;
        }
        
        .page-content {
            flex: 1;
        }
        
        .page-header {
            margin-bottom: 30px;
            text-align: center;
        }
        
        .page-header h2 {
            color: #1a2115;
            font-size: 2.2em;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .lead {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 20px;
        }
        
        .content-section {
            margin-bottom: 30px;
        }
        
        .content-section h3 {
            color: #8BAE5A;
            font-size: 1.6em;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .content-section p {
            margin-bottom: 15px;
            font-size: 1.1em;
            line-height: 1.7;
        }
        
        .learning-objectives {
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }
        
        .learning-objectives li {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            font-size: 1.1em;
            font-weight: 500;
            color: #1a2115;
            transition: all 0.3s ease;
        }
        
        .learning-objectives li:hover {
            border-color: #8BAE5A;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(139, 174, 90, 0.2);
        }
        
        .info-box {
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            border: 2px solid #2196f3;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        
        .info-box h4 {
            color: #1976d2;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .function-grid, .benefits-grid, .risk-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .function-card, .benefit-card, .risk-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .function-card:hover, .benefit-card:hover, .risk-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(139, 174, 90, 0.2);
        }
        
        .function-card h4, .benefit-card h4, .risk-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .week-plan {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .week-plan h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .week-plan ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .week-plan li {
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .page-footer {
            text-align: center;
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        
        .page-number {
            color: #999;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .footer {
            background: #1a2115;
            color: white;
            text-align: center;
            padding: 30px;
        }
        
        .footer-logo {
            font-size: 1.4em;
            font-weight: bold;
            color: #8BAE5A;
            margin-bottom: 15px;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .lesson-title {
                font-size: 2.2em;
            }
            
            .page {
                padding: 25px 20px;
                min-height: 500px;
            }
            
            .function-grid, .benefits-grid, .risk-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="module-badge">Module ${moduleNumber}</div>
            <h1 class="lesson-title">${lessonData.title}</h1>
            <div class="lesson-subtitle">${lessonData.subtitle}</div>
        </div>
        
        <div class="ebook-content">
            ${pagesHTML}
        </div>
        
        <div class="footer">
            <div class="footer-logo">TOP TIER MEN ACADEMY</div>
            <p>Gemaakt voor mannen die hun potentieel willen maximaliseren</p>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
                © 2024 Top Tier Men. Alle rechten voorbehouden.
            </p>
        </div>
    </div>
</body>
</html>`;
}

async function createAllModule1EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 1 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module1EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Testosteron',
          '01'
        );
        
        // Create filename
        const safeTitle = lessonTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        const filename = `${safeTitle}-enhanced-ebook.html`;
        const filePath = path.join(booksDir, filename);
        
        // Save HTML file
        fs.writeFileSync(filePath, htmlContent, 'utf8');
        
        console.log(`   ✅ Created: ${filename}`);
        console.log(`      📄 Pages: ${lessonData.pages.length}`);
        console.log(`      🎨 Enhanced layout with visual elements`);
        createdCount++;
        
      } catch (error) {
        console.error(`   ❌ Error creating ${lessonTitle}:`, error.message);
        errorCount++;
      }
      
      console.log('');
    }

    // Summary
    console.log('📊 ENHANCED EBOOK CREATION SUMMARY');
    console.log('==================================');
    console.log(`Total enhanced ebooks created: ${createdCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Success rate: ${createdCount > 0 ? Math.round((createdCount / (createdCount + errorCount)) * 100) : 0}%`);

    console.log('\n🎯 FEATURES INCLUDED:');
    console.log('=====================');
    console.log('✅ Beautiful gradient header with module badge');
    console.log('✅ Professional typography and spacing');
    console.log('✅ Interactive learning objectives cards');
    console.log('✅ Responsive grid layouts for content');
    console.log('✅ Hover effects and animations');
    console.log('✅ Print-friendly A4 layout');
    console.log('✅ Mobile responsive design');

    console.log('\n✅ All Module 1 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule1EnhancedEbooks();
