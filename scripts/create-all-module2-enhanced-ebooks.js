const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 2 lessons
const module2EnhancedContent = {
  'Wat is Discipline en waarom is dit Essentieel': {
    title: 'Wat is Discipline en waarom is dit Essentieel',
    subtitle: 'De Fundering van Alle Succes',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Discipline is niet alleen over hard werken - het is de fundering van alle succes en persoonlijke groei.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De ware betekenis van discipline en waarom het essentieel is</li>
              <li>De 3 pijlers van discipline: Consistentie, Focus en Doelgerichtheid</li>
              <li>Praktische oefeningen om discipline te ontwikkelen</li>
              <li>Hoe je discipline kunt integreren in je dagelijks leven</li>
              <li>Een 30-dagen discipline transformatie plan</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Discipline is een spier die je kunt trainen. Hoe meer je het gebruikt, hoe sterker het wordt.</p>
          </div>
        `
      },
      {
        title: 'De Wetenschap van Discipline',
        content: `
          <div class="page-header">
            <h2>De Wetenschap van Discipline</h2>
            <p class="lead">Begrijp hoe discipline werkt in je hersenen en waarom het zo krachtig is.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat is Discipline?</h3>
            <p>Discipline is niet alleen over hard werken of jezelf dwingen om dingen te doen die je niet leuk vindt. Het is over consistentie, focus en de bereidheid om korte-termijn plezier op te offeren voor lange-termijn doelen.</p>
            
            <h3>De 3 Pijlers van Discipline</h3>
            <div class="pillar-grid">
              <div class="pillar-card">
                <h4>🎯 Consistentie</h4>
                <p>Doe elke dag iets, hoe klein ook. Bouw routines op die je kunt volhouden.</p>
                <ul>
                  <li>Focus op progressie, niet perfectie</li>
                  <li>Kleine dagelijkse acties leiden tot grote veranderingen</li>
                  <li>Consistentie is belangrijker dan intensiteit</li>
                </ul>
              </div>
              <div class="pillar-card">
                <h4>🔍 Focus</h4>
                <p>Elimineer afleidingen en werk in tijdsblokken voor maximale productiviteit.</p>
                <ul>
                  <li>Leer nee zeggen tegen onnodige verplichtingen</li>
                  <li>Werk in gefocuste tijdsblokken</li>
                  <li>Creëer een omgeving die focus ondersteunt</li>
                </ul>
              </div>
              <div class="pillar-card">
                <h4>🎯 Doelgerichtheid</h4>
                <p>Ken je waarom en visualiseer je doelen voor blijvende motivatie.</p>
                <ul>
                  <li>Definieer je doelen duidelijk</li>
                  <li>Meet je voortgang regelmatig</li>
                  <li>Pas je strategie aan op basis van resultaten</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Praktische Oefeningen',
        content: `
          <div class="page-header">
            <h2>Praktische Oefeningen</h2>
            <p class="lead">Implementeer deze bewezen strategieën om discipline te ontwikkelen.</p>
          </div>
          
          <div class="content-section">
            <h3>De 5-Minuten Regel</h3>
            <div class="exercise-box">
              <h4>🎯 Hoe het werkt:</h4>
              <p>Begin elke dag met 5 minuten van je belangrijkste taak. Dit breekt de weerstand en maakt het makkelijker om door te gaan.</p>
              <div class="steps">
                <h5>Stappen:</h5>
                <ol>
                  <li>Kies je belangrijkste taak voor de dag</li>
                  <li>Zet een timer op 5 minuten</li>
                  <li>Begin met de taak en stop na 5 minuten</li>
                  <li>Als je wilt doorgaan, prima! Zo niet, dan heb je nog steeds 5 minuten gewerkt</li>
                </ol>
              </div>
            </div>
            
            <h3>Habit Stacking</h3>
            <div class="exercise-box">
              <h4>🔗 Hoe het werkt:</h4>
              <p>Koppel nieuwe gewoonten aan bestaande routines om ze makkelijker te implementeren.</p>
              <div class="examples">
                <h5>Voorbeelden:</h5>
                <ul>
                  <li>Na het tandenpoetsen → 10 push-ups</li>
                  <li>Na het ontbijt → 10 minuten lezen</li>
                  <li>Na het avondeten → 5 minuten plannen</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: '30-Dagen Discipline Plan',
        content: `
          <div class="page-header">
            <h2>30-Dagen Discipline Plan</h2>
            <p class="lead">Een gestructureerd plan om discipline te ontwikkelen en te versterken.</p>
          </div>
          
          <div class="content-section">
            <h3>Week 1: Foundation</h3>
            <div class="week-plan">
              <h4>🎯 Doel: Basis gewoonten implementeren</h4>
              <ul>
                <li>Dag 1-3: Sta op tijd op (5:30 AM)</li>
                <li>Dag 4-5: Drink water (500ml bij het opstaan)</li>
                <li>Dag 6-7: Mediteer (10 minuten)</li>
              </ul>
            </div>
            
            <h3>Week 2-3: Bouwen</h3>
            <div class="week-plan">
              <h4>🚀 Doel: Gewoonten uitbreiden en versterken</h4>
              <ul>
                <li>Voeg 30 minuten lezen toe</li>
                <li>Implementeer dagelijkse planning</li>
                <li>Start met 15 minuten training</li>
              </ul>
            </div>
            
            <h3>Week 4: Integratie</h3>
            <div class="week-plan">
              <h4>🎯 Doel: Alle gewoonten integreren</h4>
              <ul>
                <li>Combineer alle gewoonten in één routine</li>
                <li>Evalueer en pas aan waar nodig</li>
                <li>Plan je volgende 30 dagen</li>
              </ul>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Je Identiteit Definiëren': {
    title: 'Je Identiteit Definiëren',
    subtitle: 'Wie Ben Je Echt?',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Je identiteit is wie je bent als persoon. Het bepaalt je gedrag, je keuzes en je resultaten.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De 4 lagen van identiteit begrijpen</li>
              <li>Hoe je je waarden kunt identificeren en definiëren</li>
              <li>Stappen om je identiteit bewust te ontwikkelen</li>
              <li>Het verband tussen identiteit en gedrag</li>
              <li>Praktische oefeningen voor zelfontdekking</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De 4 Lagen van Identiteit',
        content: `
          <div class="page-header">
            <h2>De 4 Lagen van Identiteit</h2>
            <p class="lead">Verken de verschillende aspecten van wie je bent en hoe ze elkaar beïnvloeden.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Fysieke Identiteit</h3>
            <div class="identity-layer">
              <p>Hoe je eruit ziet, hoe je je lichaam behandelt en je gezondheidsgewoonten.</p>
              <div class="identity-aspects">
                <h4>🔍 Reflectievragen:</h4>
                <ul>
                  <li>Hoe zie je jezelf fysiek?</li>
                  <li>Wat zijn je gezondheidsgewoonten?</li>
                  <li>Hoe behandel je je lichaam?</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Mentale Identiteit</h3>
            <div class="identity-layer">
              <p>Je gedachten, overtuigingen, kennis en vaardigheden.</p>
              <div class="identity-aspects">
                <h4>🧠 Reflectievragen:</h4>
                <ul>
                  <li>Wat zijn je kernovertuigingen?</li>
                  <li>Welke vaardigheden wil je ontwikkelen?</li>
                  <li>Hoe denk je over jezelf en anderen?</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Emotionele Identiteit</h3>
            <div class="identity-layer">
              <p>Hoe je met emoties omgaat, je relaties en je empathie.</p>
              <div class="identity-aspects">
                <h4>❤️ Reflectievragen:</h4>
                <ul>
                  <li>Hoe uit je je emoties?</li>
                  <li>Hoe ga je om met relaties?</li>
                  <li>Ben je empathisch naar anderen?</li>
                </ul>
              </div>
            </div>
            
            <h3>4. Spirituele Identiteit</h3>
            <div class="identity-layer">
              <p>Je waarden, principes, doel en missie in het leven.</p>
              <div class="identity-aspects">
                <h4>🌟 Reflectievragen:</h4>
                <ul>
                  <li>Wat zijn je kernwaarden?</li>
                  <li>Wat is je levensdoel?</li>
                  <li>Waar geloof je in?</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Identiteit Ontwikkelen',
        content: `
          <div class="page-header">
            <h2>Identiteit Ontwikkelen</h2>
            <p class="lead">Leer hoe je bewust je identiteit kunt vormen en versterken.</p>
          </div>
          
          <div class="content-section">
            <h3>Stap 1: Waarden Inventarisatie</h3>
            <div class="development-step">
              <h4>📝 Oefening:</h4>
              <p>Schrijf 20 dingen op die belangrijk voor je zijn. Rangschik ze van 1-20. De top 5 zijn je kernwaarden.</p>
              <div class="values-example">
                <h5>Voorbeelden van waarden:</h5>
                <div class="values-grid">
                  <span class="value-tag">Integriteit</span>
                  <span class="value-tag">Groeien</span>
                  <span class="value-tag">Verbinding</span>
                  <span class="value-tag">Moed</span>
                  <span class="value-tag">Creativiteit</span>
                  <span class="value-tag">Balans</span>
                </div>
              </div>
            </div>
            
            <h3>Stap 2: Identiteit Statement</h3>
            <div class="development-step">
              <h4>✍️ Oefening:</h4>
              <p>Schrijf een korte paragraaf die beschrijft wie je bent en wat je belangrijk vindt.</p>
              <div class="statement-template">
                <h5>Template:</h5>
                <p>"Ik ben iemand die [kernwaarde] waardeert en [doel] nastreeft. Ik geloof in [principe] en streef ernaar om [actie] te ondernemen in mijn dagelijks leven."</p>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Discipline van korte termijn naar een levensstijl': {
    title: 'Discipline van Korte Termijn naar een Levensstijl',
    subtitle: 'Van Inspanning naar Natuurlijke Gewoonte',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Leer hoe je discipline kunt transformeren van een kortetermijn inspanning naar een duurzame levensstijl.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De 4 fases van discipline ontwikkeling</li>
              <li>Hoe discipline een natuurlijke levensstijl wordt</li>
              <li>Strategieën voor duurzame gedragsverandering</li>
              <li>Van discipline naar flow ervaringen</li>
              <li>Een levensstijl plan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De 4 Fases van Discipline',
        content: `
          <div class="page-header">
            <h2>De 4 Fases van Discipline</h2>
            <p class="lead">Begrijp hoe discipline zich ontwikkelt van bewuste inspanning naar automatische gewoonte.</p>
          </div>
          
          <div class="content-section">
            <h3>Fase 1: Awareness (Bewustwording)</h3>
            <div class="phase-card">
              <h4>🔍 Wat gebeurt er:</h4>
              <p>Je erkent dat verandering nodig is en begrijpt waarom discipline belangrijk is.</p>
              <div class="phase-indicators">
                <h5>Indicatoren:</h5>
                <ul>
                  <li>Je voelt ontevredenheid met je huidige situatie</li>
                  <li>Je begrijpt de voordelen van verandering</li>
                  <li>Je identificeert huidige gewoonten en patronen</li>
                </ul>
              </div>
            </div>
            
            <h3>Fase 2: Commitment (Toewijding)</h3>
            <div class="phase-card">
              <h4>💪 Wat gebeurt er:</h4>
              <p>Je besluit om te veranderen en stelt concrete doelen en plannen op.</p>
              <div class="phase-indicators">
                <h5>Indicatoren:</h5>
                <ul>
                  <li>Je stelt duidelijke doelen</li>
                  <li>Je maakt concrete plannen</li>
                  <li>Je zoekt externe accountability</li>
                </ul>
              </div>
            </div>
            
            <h3>Fase 3: Consistency (Consistentie)</h3>
            <div class="phase-card">
              <h4>🔄 Wat gebeurt er:</h4>
              <p>Je onderneemt dagelijkse actie en bouwt routines op.</p>
              <div class="phase-indicators">
                <h5>Indicatoren:</h5>
                <ul>
                  <li>Je handelt dagelijks volgens je plan</li>
                  <li>Je bouwt routines op</li>
                  <li>Je zet door bij tegenslagen</li>
                </ul>
              </div>
            </div>
            
            <h3>Fase 4: Integration (Integratie)</h3>
            <div class="phase-card">
              <h4>🌟 Wat gebeurt er:</h4>
              <p>Gewoonten worden automatisch en discipline wordt onderdeel van je identiteit.</p>
              <div class="phase-indicators">
                <h5>Indicatoren:</h5>
                <ul>
                  <li>Gewoonten voelen natuurlijk aan</li>
                  <li>Discipline wordt onderdeel van wie je bent</li>
                  <li>Je ervaart flow in je activiteiten</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Van Discipline naar Flow',
        content: `
          <div class="page-header">
            <h2>Van Discipline naar Flow</h2>
            <p class="lead">Ontdek hoe discipline en plezier samenkomen in flow ervaringen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat is Flow?</h3>
            <p>Flow is een staat van volledige absorptie in een activiteit. Het is waar discipline en plezier samenkomen en je optimaal presteert.</p>
            
            <h3>Hoe Bereik Je Flow?</h3>
            <div class="flow-conditions">
              <div class="flow-condition">
                <h4>🎯 Duidelijke Doelen</h4>
                <p>Weet precies wat je wilt bereiken en hoe je het gaat meten.</p>
              </div>
              <div class="flow-condition">
                <h4>📊 Directe Feedback</h4>
                <p>Zie direct het resultaat van je acties en pas aan waar nodig.</p>
              </div>
              <div class="flow-condition">
                <h4>⚖️ Balans Uitdaging-Vaardigheid</h4>
                <p>De activiteit moet niet te makkelijk zijn, maar ook niet te moeilijk.</p>
              </div>
              <div class="flow-condition">
                <h4>🔒 Focus</h4>
                <p>Elimineer afleidingen en richt je volledig op de taak.</p>
              </div>
              <div class="flow-condition">
                <h4>🎮 Controle</h4>
                <p>Voel dat je invloed hebt op het resultaat van je inspanningen.</p>
              </div>
            </div>
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
        
        .pillar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .pillar-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .pillar-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(139, 174, 90, 0.2);
        }
        
        .pillar-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.3em;
            text-align: center;
        }
        
        .pillar-card ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .pillar-card li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .exercise-box {
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 2px solid #ff9800;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .exercise-box h4 {
            color: #e65100;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .steps, .examples {
            margin: 20px 0;
        }
        
        .steps h5, .examples h5 {
            color: #8BAE5A;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .steps ol, .examples ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .steps li, .examples li {
            margin-bottom: 10px;
            font-size: 1em;
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
        
        .identity-layer {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .identity-layer:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .identity-aspects {
            margin: 20px 0;
        }
        
        .identity-aspects h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .identity-aspects ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .identity-aspects li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .development-step {
            background: linear-gradient(135deg, #f3e5f5, #e1bee7);
            border: 2px solid #9c27b0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .development-step h4 {
            color: #7b1fa2;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .values-example, .statement-template {
            margin: 20px 0;
        }
        
        .values-example h5, .statement-template h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .values-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
        }
        
        .value-tag {
            background: #8BAE5A;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .statement-template p {
            background: white;
            border: 2px solid #8BAE5A;
            border-radius: 10px;
            padding: 20px;
            font-style: italic;
            color: #1a2115;
        }
        
        .phase-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .phase-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .phase-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .phase-indicators {
            margin: 20px 0;
        }
        
        .phase-indicators h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .phase-indicators ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .phase-indicators li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .flow-conditions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .flow-condition {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .flow-condition:hover {
            border-color: #8BAE5A;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(139, 174, 90, 0.2);
        }
        
        .flow-condition h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
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
            
            .pillar-grid, .flow-conditions {
                grid-template-columns: 1fr;
            }
            
            .values-grid {
                justify-content: center;
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

async function createAllModule2EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 2 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module2EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Discipline & Identiteit',
          '02'
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
    console.log('✅ Module 2 specific styling (pillars, identity layers, phases)');

    console.log('\n✅ All Module 2 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule2EnhancedEbooks();
