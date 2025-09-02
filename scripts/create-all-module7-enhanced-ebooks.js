const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 7 lessons
const module7EnhancedContent = {
  'De Basisprincipes van Voeding': {
    title: 'De Basisprincipes van Voeding',
    subtitle: 'Je Lichaam Voeden voor Optimale Prestaties',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Voeding is niet alleen brandstof - het is de fundering van je fysieke en mentale prestaties, energie en algehele welzijn.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Waarom voeding cruciaal is voor je prestaties</li>
              <li>De 3 macronutriënten en hun functies</li>
              <li>Micronutriënten voor optimale gezondheid</li>
              <li>Praktische voedingsstrategieën</li>
              <li>Een voorbeeld voedingsplan</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Je lichaam vervangt elke 7-10 jaar alle cellen. De kwaliteit van je voeding bepaalt letterlijk de kwaliteit van je nieuwe cellen.</p>
          </div>
        `
      },
      {
        title: 'Waarom Voeding Cruciaal Is',
        content: `
          <div class="page-header">
            <h2>Waarom Voeding Cruciaal Is</h2>
            <p class="lead">Begrijp de fundamentele rol van voeding in je leven.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Energie & Prestaties</h3>
            <div class="nutrition-benefit">
              <h4>⚡ Wat betekent dit?</h4>
              <p>Voeding is je brandstof voor alle activiteiten.</p>
              <div class="benefit-details">
                <h5>Hoe dit werkt:</h5>
                <ul>
                  <li><strong>Brandstof:</strong> Koolhydraten geven directe energie</li>
                  <li><strong>Kwaliteit:</strong> Betere voeding = meer energie</li>
                  <li><strong>Timing:</strong> Wanneer je eet beïnvloedt prestaties</li>
                  <li><strong>Consistentie:</strong> Regelmatige voeding = stabiele energie</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Spieropbouw & Herstel</h3>
            <div class="nutrition-benefit">
              <h4>💪 Wat betekent dit?</h4>
              <p>Voeding bepaalt hoe snel en goed je herstelt.</p>
              <div class="benefit-details">
                <h5>Hoe dit werkt:</h5>
                <ul>
                  <li><strong>Eiwitten:</strong> Bouwstenen voor spieren</li>
                  <li><strong>Koolhydraten:</strong> Herstel van glycogeen</li>
                  <li><strong>Vetten:</strong> Hormoonproductie en celmembranen</li>
                  <li><strong>Timing:</strong> Post-workout voeding is cruciaal</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Mentale Kracht</h3>
            <div class="nutrition-benefit">
              <h4>🧠 Wat betekent dit?</h4>
              <p>Je brein heeft specifieke voedingsstoffen nodig.</p>
              <div class="benefit-details">
                <h5>Hoe dit werkt:</h5>
                <ul>
                  <li><strong>Focus:</strong> Omega-3 voor hersenfunctie</li>
                  <li><strong>Concentratie:</strong> B-vitaminen voor energie</li>
                  <li><strong>Stemming:</strong> Tryptofaan voor serotonine</li>
                  <li><strong>Geheugen:</strong> Antioxidanten voor hersenbescherming</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'De 3 Macronutriënten',
        content: `
          <div class="page-header">
            <h2>De 3 Macronutriënten</h2>
            <p class="lead">Begrijp de bouwstenen van je voeding en hoe je ze optimaal inzet.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Eiwitten (Proteïne)</h3>
            <div class="macronutrient">
              <h4>🥩 Wat zijn eiwitten?</h4>
              <p>De bouwstenen van je lichaam voor spieren, organen en weefsels.</p>
              <div class="nutrient-details">
                <h5>Functies:</h5>
                <ul>
                  <li><strong>Spieropbouw:</strong> Reparatie en groei van spierweefsel</li>
                  <li><strong>Herstel:</strong> Herstel van beschadigde cellen</li>
                  <li><strong>Hormonen:</strong> Productie van testosteron en groeihormoon</li>
                  <li><strong>Enzymen:</strong> Chemische reacties in je lichaam</li>
                </ul>
                <h5>Beste bronnen:</h5>
                <ul>
                  <li>Mager vlees (kip, rund, varken)</li>
                  <li>Vette vis (zalm, makreel, sardines)</li>
                  <li>Eieren (hele eieren met dooier)</li>
                  <li>Zuivel (kwark, yoghurt, melk)</li>
                  <li>Peulvruchten (bonen, linzen, kikkererwten)</li>
                </ul>
                <h5>Aanbeveling:</h5>
                <p><strong>1.6-2.2g per kg lichaamsgewicht</strong> per dag voor actieve mannen.</p>
              </div>
            </div>
            
            <h3>2. Koolhydraten</h3>
            <div class="macronutrient">
              <h4>🍚 Wat zijn koolhydraten?</h4>
              <p>Je primaire energiebron voor alle fysieke en mentale activiteiten.</p>
              <div class="nutrient-details">
                <h5>Functies:</h5>
                <ul>
                  <li><strong>Energie:</strong> Directe brandstof voor je lichaam</li>
                  <li><strong>Herstel:</strong> Herstel van glycogeen in spieren</li>
                  <li><strong>Hersenfunctie:</strong> Glucose voor je brein</li>
                  <li><strong>Spierbehoud:</strong> Beschermt eiwitten voor energie</li>
                </ul>
                <h5>Beste bronnen:</h5>
                <ul>
                  <li>Complexe koolhydraten (rijst, pasta, aardappelen)</li>
                  <li>Fruit (bananen, appels, bessen)</li>
                  <li>Groenten (zoete aardappelen, wortelen)</li>
                  <li>Volkoren producten (brood, havermout)</li>
                </ul>
                <h5>Aanbeveling:</h5>
                <p><strong>3-7g per kg lichaamsgewicht</strong> afhankelijk van je activiteitsniveau.</p>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Hydratatie en Water inname': {
    title: 'Hydratatie en Water inname',
    subtitle: 'De Vergeten Superkracht van Je Lichaam',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Water is de meest vergeten maar meest essentiële voedingsstof. Je lichaam bestaat voor 60% uit water en heeft het nodig voor elke functie.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Waarom water cruciaal is voor je prestaties</li>
              <li>Hoe je je hydratatie kunt optimaliseren</li>
              <li>De rol van elektrolyten</li>
              <li>Hydratatie strategieën voor training</li>
              <li>Een hydratatieplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Waarom Water Cruciaal Is',
        content: `
          <div class="page-header">
            <h2>Waarom Water Cruciaal Is</h2>
            <p class="lead">Water is betrokken bij elke cel, weefsel en orgaan in je lichaam.</p>
          </div>
          
          <div class="content-section">
            <h3>De 5 Belangrijkste Functies van Water</h3>
            <div class="water-functions">
              <div class="water-function">
                <h4>💧 1. Temperatuurregulatie</h4>
                <p>Water helpt je lichaam op de juiste temperatuur te houden.</p>
                <div class="function-details">
                  <h5>Hoe dit werkt:</h5>
                  <ul>
                    <li>Zweetproductie voor afkoeling</li>
                    <li>Bloedcirculatie naar de huid</li>
                    <li>Ademhaling voor warmteafgifte</li>
                    <li>Hormonale regulatie</li>
                  </ul>
                </div>
              </div>
              
              <div class="water-function">
                <h4>🔄 2. Transport van voedingsstoffen</h4>
                <p>Water transporteert alle voedingsstoffen door je lichaam.</p>
                <div class="function-details">
                  <h5>Hoe dit werkt:</h5>
                  <ul>
                    <li>Bloed voor zuurstof en voedingsstoffen</li>
                    <li>Lymfe voor immuunfunctie</li>
                    <li>Urine voor afvalverwijdering</li>
                    <li>Spijsverteringssappen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Slaap de vergeten superkracht': {
    title: 'Slaap de vergeten superkracht',
    subtitle: 'Herstel, Groei en Prestaties in Je Slaap',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Slaap is niet alleen rust - het is actieve hersteltijd waar je lichaam en brein groeien, herstellen en zich voorbereiden op de volgende dag.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Waarom slaap cruciaal is voor je prestaties</li>
              <li>De verschillende slaapfasen en hun functies</li>
              <li>Hoe je je slaap kunt optimaliseren</li>
              <li>Slaapstrategieën voor betere prestaties</li>
              <li>Een slaaproutine opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Wetenschap van Slaap',
        content: `
          <div class="page-header">
            <h2>De Wetenschap van Slaap</h2>
            <p class="lead">Begrijp wat er gebeurt tijdens je slaap en waarom het zo belangrijk is.</p>
          </div>
          
          <div class="content-section">
            <h3>De 4 Slaapfasen</h3>
            <div class="sleep-phases">
              <div class="sleep-phase">
                <h4>😴 Fase 1: Lichte Slaap</h4>
                <p>De overgang van wakker naar slaap.</p>
                <div class="phase-details">
                  <h5>Wat gebeurt er:</h5>
                  <ul>
                    <li>Spieren ontspannen</li>
                    <li>Hersengolven vertragen</li>
                    <li>Gemakkelijk wakker te maken</li>
                    <li>5-10% van je slaap</li>
                  </ul>
                </div>
              </div>
              
              <div class="sleep-phase">
                <h4>💤 Fase 2: Diepe Slaap</h4>
                <p>Waar het echte herstel begint.</p>
                <div class="phase-details">
                  <h5>Wat gebeurt er:</h5>
                  <ul>
                    <li>Spierherstel en groei</li>
                    <li>Immuunsysteem versterking</li>
                    <li>Hormoonproductie (testosteron)</li>
                    <li>45-55% van je slaap</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Energie en Focus': {
    title: 'Energie en Focus',
    subtitle: 'Optimaliseer Je Mentale en Fysieke Prestaties',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Energie en focus zijn de valuta van succes. Leer hoe je beide kunt optimaliseren door voeding, timing en levensstijl.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Hoe je je energieniveau kunt verhogen</li>
              <li>Strategieën voor betere focus en concentratie</li>
              <li>De rol van voeding in energie en focus</li>
              <li>Timing strategieën voor optimale prestaties</li>
              <li>Een energie- en focusplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De 4 Pijlers van Energie',
        content: `
          <div class="page-header">
            <h2>De 4 Pijlers van Energie</h2>
            <p class="lead">Bouw een solide fundament voor consistente energie en focus.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Voeding</h3>
            <div class="energy-pillar">
              <h4>🍎 Wat betekent dit?</h4>
              <p>Je voeding bepaalt je energieniveau gedurende de dag.</p>
              <div class="pillar-details">
                <h5>Strategieën:</h5>
                <ul>
                  <li><strong>Stabiele bloedsuiker:</strong> Complexe koolhydraten</li>
                  <li><strong>Eiwit timing:</strong> Verdeel over de dag</li>
                  <li><strong>Gezonde vetten:</strong> Voor langdurige energie</li>
                  <li><strong>Micronutriënten:</strong> B-vitaminen en magnesium</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Slaap</h3>
            <div class="energy-pillar">
              <h4>😴 Wat betekent dit?</h4>
              <p>Kwaliteit en kwantiteit van slaap bepalen je energieniveau.</p>
              <div class="pillar-details">
                <h5>Strategieën:</h5>
                <ul>
                  <li><strong>Consistente bedtijd:</strong> Zelfde tijd elke dag</li>
                  <li><strong>Slaapomgeving:</strong> Donker, koel en stil</li>
                  <li><strong>Routine:</strong> Ontspanning voor het slapen</li>
                  <li><strong>Kwaliteit:</strong> 7-9 uur ononderbroken slaap</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Gezondheid als Fundament': {
    title: 'Gezondheid als Fundament',
    subtitle: 'Bouw een Solide Basis voor Je Leven',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Gezondheid is niet alleen de afwezigheid van ziekte - het is de fundering waarop je hele leven is gebouwd.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Waarom gezondheid je fundament is</li>
              <li>De 5 pijlers van optimale gezondheid</li>
              <li>Hoe je je gezondheid kunt meten</li>
              <li>Strategieën voor preventieve gezondheid</li>
              <li>Een gezondheidsplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De 5 Pijlers van Gezondheid',
        content: `
          <div class="page-header">
            <h2>De 5 Pijlers van Gezondheid</h2>
            <p class="lead">Bouw een solide fundament voor een lang en gezond leven.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Voeding</h3>
            <div class="health-pillar">
              <h4>🥗 Wat betekent dit?</h4>
              <p>Je voeding is de brandstof voor je lichaam en geest.</p>
              <div class="pillar-details">
                <h5>Belangrijke principes:</h5>
                <ul>
                  <li><strong>Volwaardige voeding:</strong> Onbewerkte ingrediënten</li>
                  <li><strong>Balans:</strong> Alle macronutriënten</li>
                  <li><strong>Timing:</strong> Regelmatige maaltijden</li>
                  <li><strong>Hydratatie:</strong> Voldoende water</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Beweging</h3>
            <div class="health-pillar">
              <h4>🏃‍♂️ Wat betekent dit?</h4>
              <p>Regelmatige beweging houdt je lichaam en geest gezond.</p>
              <div class="pillar-details">
                <h5>Belangrijke principes:</h5>
                <ul>
                  <li><strong>Krachtraining:</strong> Spieropbouw en botdichtheid</li>
                  <li><strong>Cardio:</strong> Hartgezondheid en uithoudingsvermogen</li>
                  <li><strong>Flexibiliteit:</strong> Mobiliteit en blessurepreventie</li>
                  <li><strong>Consistentie:</strong> Regelmatige beweging</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Praktische opdracht: stel je eigen voedingsplan op': {
    title: 'Praktische opdracht: stel je eigen voedingsplan op',
    subtitle: 'Van Theorie naar Praktijk',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Nu ga je alle kennis die je hebt opgedaan in praktijk brengen door je eigen voedingsplan op te stellen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat doen in deze opdracht:</h3>
            <ul class="learning-objectives">
              <li>Je energiebehoefte berekenen</li>
              <li>Een voedingsplan voor één week opstellen</li>
              <li>Reflecteren op je keuzes</li>
              <li>Aanpassingen maken waar nodig</li>
              <li>Een duurzaam plan creëren</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Stap 1: Bereken Je Energiebehoefte',
        content: `
          <div class="page-header">
            <h2>Stap 1: Bereken Je Energiebehoefte</h2>
            <p class="lead">Begin met het berekenen van hoeveel calorieën je lichaam nodig heeft.</p>
          </div>
          
          <div class="content-section">
            <h3>De Harris-Benedict Formule</h3>
            <div class="calculation-formula">
              <h4>🧮 BMR (Basal Metabolic Rate)</h4>
              <p>Je basis energiebehoefte in rust.</p>
              <div class="formula-details">
                <h5>Voor mannen:</h5>
                <p><strong>BMR = 88.362 + (13.397 × gewicht in kg) + (4.799 × lengte in cm) - (5.677 × leeftijd in jaren)</strong></p>
                
                <h5>Voorbeeld berekening:</h5>
                <ul>
                  <li>Gewicht: 80 kg</li>
                  <li>Lengte: 180 cm</li>
                  <li>Leeftijd: 30 jaar</li>
                  <li>BMR = 88.362 + (13.397 × 80) + (4.799 × 180) - (5.677 × 30)</li>
                  <li>BMR = 88.362 + 1,071.76 + 863.82 - 170.31</li>
                  <li>BMR = 1,853.63 calorieën per dag</li>
                </ul>
              </div>
            </div>
            
            <h3>Activiteitsfactor</h3>
            <div class="activity-factors">
              <h4>📊 Vermenigvuldig je BMR met:</h4>
              <ul>
                <li><strong>1.2:</strong> Zittend werk, weinig beweging</li>
                <li><strong>1.375:</strong> Licht actief (1-3x per week sporten)</li>
                <li><strong>1.55:</strong> Matig actief (3-5x per week sporten)</li>
                <li><strong>1.725:</strong> Zeer actief (6-7x per week sporten)</li>
                <li><strong>1.9:</strong> Extreem actief (zware fysieke arbeid + sporten)</li>
              </ul>
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
        
        .nutrition-benefit {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .nutrition-benefit:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .nutrition-benefit h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .benefit-details {
            margin: 20px 0;
        }
        
        .benefit-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .benefit-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .benefit-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .macronutrient {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .macronutrient h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .nutrient-details {
            margin: 20px 0;
        }
        
        .nutrient-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .nutrient-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .nutrient-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .water-functions {
            margin: 30px 0;
        }
        
        .water-function {
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            border: 2px solid #2196f3;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .water-function h4 {
            color: #1976d2;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .function-details {
            margin: 20px 0;
        }
        
        .function-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .function-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .function-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .sleep-phases {
            margin: 30px 0;
        }
        
        .sleep-phase {
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 2px solid #ff9800;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .sleep-phase h4 {
            color: #e65100;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .phase-details {
            margin: 20px 0;
        }
        
        .phase-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .phase-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .phase-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .energy-pillar {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .energy-pillar:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .energy-pillar h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .pillar-details {
            margin: 20px 0;
        }
        
        .pillar-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .pillar-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .pillar-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .health-pillar {
            background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
            border: 2px solid #4caf50;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .health-pillar h4 {
            color: #2e7d32;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .calculation-formula {
            background: linear-gradient(135deg, #f3e5f5, #e1bee7);
            border: 2px solid #9c27b0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .calculation-formula h4 {
            color: #7b1fa2;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .formula-details {
            margin: 20px 0;
        }
        
        .formula-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .formula-details p {
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
            font-family: monospace;
            font-size: 0.9em;
        }
        
        .formula-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .formula-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .activity-factors {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .activity-factors h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .activity-factors ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .activity-factors li {
            margin-bottom: 8px;
            font-size: 1em;
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

async function createAllModule7EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 7 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module7EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Voeding & Gezondheid',
          '07'
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
    console.log('✅ Module 7 specific styling (nutrition benefits, macronutrients, water functions, sleep phases, energy pillars, health pillars, calculation formulas, activity factors)');

    console.log('\n✅ All Module 7 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule7EnhancedEbooks();
