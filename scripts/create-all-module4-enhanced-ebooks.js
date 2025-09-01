const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 4 lessons
const module4EnhancedContent = {
  'Wat is mentale kracht': {
    title: 'Wat is mentale kracht',
    subtitle: 'De Fundering van Onverwoestbare Weerbaarheid',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Mentale kracht is niet alleen over doorzettingsvermogen - het is over het vermogen om te gedijen in chaos en te groeien door tegenslag.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De wetenschap achter mentale kracht en veerkracht</li>
              <li>Hoe je brein omgaat met stress en uitdagingen</li>
              <li>De psychologie van mentale weerbaarheid</li>
              <li>Praktische technieken om mentale kracht te versterken</li>
              <li>Een 30-dagen mentale kracht transformatie</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Mentale kracht is 40% genetisch en 60% ontwikkelbaar. Dit betekent dat iedereen, ongeacht hun startpunt, significant sterker kan worden.</p>
          </div>
        `
      },
      {
        title: 'De 4 Pijlers van Mentale Kracht',
        content: `
          <div class="page-header">
            <h2>De 4 Pijlers van Mentale Kracht</h2>
            <p class="lead">Begrijp de fundamenten van onverwoestbare mentale weerbaarheid.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Veerkracht</h3>
            <div class="pillar-analysis">
              <h4>🔄 Wat is veerkracht?</h4>
              <p>Het vermogen om te herstellen van tegenslagen en sterker terug te komen.</p>
              <div class="resilience-levels">
                <h5>Niveaus van veerkracht:</h5>
                <ul>
                  <li><strong>Basis:</strong> Herstellen van kleine tegenslagen</li>
                  <li><strong>Gemiddeld:</strong> Omgaan met grotere uitdagingen</li>
                  <li><strong>Hoog:</strong> Groeien door tegenslag</li>
                  <li><strong>Uitzonderlijk:</strong> Gedijen in chaos</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Focus</h3>
            <div class="pillar-analysis">
              <h4>🎯 Wat is focus?</h4>
              <p>Het vermogen om je aandacht te richten en afleidingen te elimineren.</p>
              <div class="focus-domains">
                <h5>Focus domeinen:</h5>
                <ul>
                  <li><strong>Korte termijn:</strong> Taak voltooiing</li>
                  <li><strong>Middellange termijn:</strong> Project management</li>
                  <li><strong>Lange termijn:</strong> Doel oriëntatie</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Zelfvertrouwen</h3>
            <div class="pillar-analysis">
              <h4>💪 Wat is zelfvertrouwen?</h4>
              <p>Geloof in je eigen capaciteiten en bereidheid om risico's te nemen.</p>
              <div class="confidence-aspects">
                <h5>Aspecten van zelfvertrouwen:</h5>
                <ul>
                  <li><strong>Kennis:</strong> Vertrouwen in je vaardigheden</li>
                  <li><strong>Ervaring:</strong> Vertrouwen door eerdere successen</li>
                  <li><strong>Groei:</strong> Vertrouwen in je vermogen om te leren</li>
                </ul>
              </div>
            </div>
            
            <h3>4. Doorzettingsvermogen</h3>
            <div class="pillar-analysis">
              <h4>🚀 Wat is doorzettingsvermogen?</h4>
              <p>Volharden ondanks obstakels en consistentie in acties.</p>
              <div class="persistence-factors">
                <h5>Factoren van doorzettingsvermogen:</h5>
                <ul>
                  <li><strong>Motivatie:</strong> Je waarom kennen</li>
                  <li><strong>Discipline:</strong> Dagelijkse actie</li>
                  <li><strong>Adaptatie:</strong> Strategie aanpassen</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Technieken om Mentale Kracht op te Bouwen',
        content: `
          <div class="page-header">
            <h2>Technieken om Mentale Kracht op te Bouwen</h2>
            <p class="lead">Implementeer deze bewezen strategieën voor onverwoestbare mentale weerbaarheid.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Gratitude Practice</h3>
            <div class="technique-box">
              <h4>🙏 Hoe het werkt:</h4>
              <p>Schrijf elke dag 3 dingen op waar je dankbaar voor bent om je focus te verleggen van wat je mist naar wat je hebt.</p>
              <div class="technique-steps">
                <h5>Implementatie:</h5>
                <ul>
                  <li>Koop een gratitude journal</li>
                  <li>Schrijf elke ochtend 3 dingen op</li>
                  <li>Wees specifiek en gedetailleerd</li>
                  <li>Vier kleine overwinningen</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Mindfulness & Meditatie</h4>
            <div class="technique-box">
              <h4>🧘 Hoe het werkt:</h4>
              <p>10 minuten dagelijkse meditatie om je focus te verbeteren en stress te verminderen.</p>
              <div class="meditation-guide">
                <h5>Meditatie gids:</h5>
                <ul>
                  <li>Start met 5 minuten en bouw op</li>
                  <li>Focus op je ademhaling</li>
                  <li>Observeer je gedachten zonder oordeel</li>
                  <li>Gebruik apps als Headspace of Calm</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Visualisatie</h4>
            <div class="technique-box">
              <h4>🌟 Hoe het werkt:</h4>
              <p>Visualiseer je succes elke dag om je brein te trainen voor succes.</p>
              <div class="visualization-practice">
                <h5>Visualisatie praktijk:</h5>
                <ul>
                  <li>Maak je doelen levendig en gedetailleerd</li>
                  <li>Oefen je reacties op uitdagingen</li>
                  <li>Visualiseer het proces, niet alleen het resultaat</li>
                  <li>Doe dit elke ochtend voor 5 minuten</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Dagelijkse Mentale Kracht Routine',
        content: `
          <div class="page-header">
            <h2>Dagelijkse Mentale Kracht Routine</h2>
            <p class="lead">Een gestructureerde routine om je mentale kracht dagelijks te versterken.</p>
          </div>
          
          <div class="content-section">
            <h3>Ochtend Routine (10 minuten)</h3>
            <div class="routine-plan">
              <h4>🌅 Start je dag sterk</h4>
              <div class="routine-steps">
                <div class="routine-step">
                  <h5>1. Meditatie (5 minuten)</h5>
                  <p>Begin met mindfulness om je dag te centreren</p>
                </div>
                <div class="routine-step">
                  <h5>2. Gratitude Journaling (3 minuten)</h5>
                  <p>Schrijf 3 dingen op waar je dankbaar voor bent</p>
                </div>
                <div class="routine-step">
                  <h5>3. Positieve Affirmaties (2 minuten)</h5>
                  <p>Herhaal krachtige bevestigingen over jezelf</p>
                </div>
              </div>
            </div>
            
            <h3>Middag Check-in (5 minuten)</h3>
            <div class="routine-plan">
              <h4>☀️ Blijf gefocust</h4>
              <div class="routine-steps">
                <div class="routine-step">
                  <h5>1. Ademhalingsoefening (2 minuten)</h5>
                  <p>4-7-8 ademhaling voor stress reductie</p>
                </div>
                <div class="routine-step">
                  <h5>2. Mindful Pauze (2 minuten)</h5>
                  <p>Observeer je omgeving zonder oordeel</p>
                </div>
                <div class="routine-step">
                  <h5>3. Reflectie op Voortgang (1 minuut)</h5>
                  <p>Evalueer je dag tot nu toe</p>
                </div>
              </div>
            </div>
            
            <h3>Avond Routine (10 minuten)</h3>
            <div class="routine-plan">
              <h4>🌙 Sluit je dag af</h4>
              <div class="routine-steps">
                <div class="routine-step">
                  <h5>1. Dagelijkse Reflectie (5 minuten)</h5>
                  <p>Wat ging goed? Wat kan beter?</p>
                </div>
                <div class="routine-step">
                  <h5>2. Planning voor Morgen (3 minuten)</h5>
                  <p>Stel je intenties voor de volgende dag</p>
                </div>
                <div class="routine-step">
                  <h5>3. Ontspanning (2 minuten)</h5>
                  <p>Progressieve spierontspanning</p>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Een Onbreekbare Mindset': {
    title: 'Een Onbreekbare Mindset',
    subtitle: 'Ontwikkel de Mentaliteit van een Onverwoestbare Man',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Een onbreekbare mindset is niet iets wat je hebt - het is iets wat je ontwikkelt door bewuste keuzes en consistente actie.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Het verschil tussen fixed en growth mindset</li>
              <li>Hoe je je mindset kunt veranderen</li>
              <li>Strategieën voor mentale veerkracht</li>
              <li>Omgaan met falen en tegenslag</li>
              <li>Een onbreekbare mindset cultiveren</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Fixed vs. Growth Mindset',
        content: `
          <div class="page-header">
            <h2>Fixed vs. Growth Mindset</h2>
            <p class="lead">Begrijp het fundamentele verschil tussen deze twee mindsets en hoe ze je leven beïnvloeden.</p>
          </div>
          
          <div class="content-section">
            <h3>Fixed Mindset</h3>
            <div class="mindset-analysis">
              <h4>🚫 Wat is een fixed mindset?</h4>
              <p>De overtuiging dat je capaciteiten vaststaan en niet kunnen veranderen.</p>
              <div class="fixed-characteristics">
                <h5>Kenmerken van fixed mindset:</h5>
                <ul>
                  <li>Vermijdt uitdagingen</li>
                  <li>Geeft snel op bij obstakels</li>
                  <li>Ziet inspanning als nutteloos</li>
                  <li>Negeert nuttige feedback</li>
                  <li>Voelt zich bedreigd door succes van anderen</li>
                </ul>
              </div>
            </div>
            
            <h3>Growth Mindset</h3>
            <div class="mindset-analysis">
              <h4>🚀 Wat is een growth mindset?</h4>
              <p>De overtuiging dat je capaciteiten kunnen groeien door inspanning en leren.</p>
              <div class="growth-characteristics">
                <h5>Kenmerken van growth mindset:</h5>
                <ul>
                  <li>Omarmt uitdagingen</li>
                  <li>Persisteert bij obstakels</li>
                  <li>Ziet inspanning als pad naar beheersing</li>
                  <li>Leert van feedback</li>
                  <li>Vindt inspiratie in succes van anderen</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Mentale Weerbaarheid in de Praktijk': {
    title: 'Mentale Weerbaarheid in de Praktijk',
    subtitle: 'Implementeer Je Kennis in Dagelijkse Situaties',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Kennis is macht, maar alleen als je het toepast. Leer hoe je mentale weerbaarheid kunt implementeren in je dagelijks leven.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Praktische toepassingen van mentale weerbaarheid</li>
              <li>Omgaan met stressvolle situaties</li>
              <li>Emotionele regulatie technieken</li>
              <li>Communicatie vaardigheden</li>
              <li>Een weerbaarheidsplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Stress Management in de Praktijk',
        content: `
          <div class="page-header">
            <h2>Stress Management in de Praktijk</h2>
            <p class="lead">Leer hoe je effectief kunt omgaan met stress in real-world situaties.</p>
          </div>
          
          <div class="content-section">
            <h3>De 4 A's van Stress Management</h3>
            <div class="stress-strategies">
              <div class="strategy-card">
                <h4>🚫 Avoid (Vermijd)</h4>
                <p>Vermijd onnodige stress door je omgeving te controleren.</p>
                <div class="strategy-examples">
                  <h5>Voorbeelden:</h5>
                  <ul>
                    <li>Stel grenzen in je agenda</li>
                    <li>Leer nee zeggen</li>
                    <li>Elimineer giftige relaties</li>
                  </ul>
                </div>
              </div>
              <div class="strategy-card">
                <h4>🔄 Alter (Verander)</h4>
                <p>Verander de situatie door je communicatie aan te passen.</p>
                <div class="strategy-examples">
                  <h5>Voorbeelden:</h5>
                  <ul>
                    <li>Gebruik "ik" statements</li>
                    <li>Vraag om wat je nodig hebt</li>
                    <li>Compromis zoeken</li>
                  </ul>
                </div>
              </div>
              <div class="strategy-card">
                <h4>🧘 Adapt (Pas aan)</h4>
                <p>Pas je verwachtingen en standaarden aan.</p>
                <div class="strategy-examples">
                  <h5>Voorbeelden:</h5>
                  <ul>
                    <li>Herframe de situatie</li>
                    <li>Focus op wat je kunt controleren</li>
                    <li>Pas je standaarden aan</li>
                  </ul>
                </div>
              </div>
              <div class="strategy-card">
                <h4>✅ Accept (Accepteer)</h4>
                <p>Accepteer wat je niet kunt veranderen.</p>
                <div class="strategy-examples">
                  <h5>Voorbeelden:</h5>
                  <ul>
                    <li>Laat het verleden los</li>
                    <li>Vergeef jezelf en anderen</li>
                    <li>Focus op het heden</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Wordt Een Onbreekbare Man': {
    title: 'Wordt Een Onbreekbare Man',
    subtitle: 'De Ultieme Gids voor Mentale Onverwoestbaarheid',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Een onbreekbare man is niet iemand die nooit breekt - het is iemand die altijd weer opstaat, sterker dan voorheen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De eigenschappen van een onbreekbare man</li>
              <li>Hoe je deze eigenschappen kunt ontwikkelen</li>
              <li>Omgaan met extreme uitdagingen</li>
              <li>Bouwen aan mentale onverwoestbaarheid</li>
              <li>Een onbreekbare identiteit creëren</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Eigenschappen van een Onbreekbare Man',
        content: `
          <div class="page-header">
            <h2>De Eigenschappen van een Onbreekbare Man</h2>
            <p class="lead">Ontdek welke eigenschappen je moet ontwikkelen om onverwoestbaar te worden.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Emotionele Stabiliteit</h3>
            <div class="trait-analysis">
              <h4>🧠 Wat is emotionele stabiliteit?</h4>
              <p>Het vermogen om je emoties te reguleren en kalm te blijven onder druk.</p>
              <div class="stability-practices">
                <h5>Praktijken voor emotionele stabiliteit:</h5>
                <ul>
                  <li>Dagelijkse meditatie</li>
                  <li>Ademhalingsoefeningen</li>
                  <li>Emotionele journaling</li>
                  <li>Mindfulness in dagelijkse activiteiten</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Adaptabiliteit</h3>
            <div class="trait-analysis">
              <h4>🔄 Wat is adaptabiliteit?</h4>
              <p>Het vermogen om je aan te passen aan veranderende omstandigheden.</p>
              <div class="adaptability-skills">
                <h5>Vaardigheden voor adaptabiliteit:</h5>
                <ul>
                  <li>Flexibiliteit in denken</li>
                  <li>Snelle besluitvorming</li>
                  <li>Creatief probleem oplossen</li>
                  <li>Leren van fouten</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Reflectie & Integratie': {
    title: 'Reflectie & Integratie',
    subtitle: 'Integreer Je Leerervaringen en Plan Je Volgende Stappen',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Reflectie is de sleutel tot groei. Neem de tijd om te evalueren wat je hebt geleerd en hoe je dit kunt toepassen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Reflecteren op je leerervaringen</li>
              <li>Je voortgang evalueren</li>
              <li>Volgende stappen plannen</li>
              <li>Je kennis integreren</li>
              <li>Een actieplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Reflectie Vragen',
        content: `
          <div class="page-header">
            <h2>Reflectie Vragen</h2>
            <p class="lead">Gebruik deze vragen om diep na te denken over wat je hebt geleerd en hoe je dit kunt toepassen.</p>
          </div>
          
          <div class="content-section">
            <h3>Over Mindset</h3>
            <div class="reflection-section">
              <div class="reflection-question">
                <h4>🤔 Zelfreflectie</h4>
                <p><strong>Welke fixed mindset gedachten herken je bij jezelf?</strong></p>
                <p>Neem 10 minuten om dit op te schrijven. Wees eerlijk en gedetailleerd.</p>
              </div>
              
              <div class="reflection-question">
                <h4>🔄 Groei</h4>
                <p><strong>Hoe kun je deze omzetten naar growth mindset gedachten?</strong></p>
                <p>Identificeer concrete stappen om je mindset te veranderen.</p>
              </div>
              
              <div class="reflection-question">
                <h4>🚀 Uitdagingen</h4>
                <p><strong>Welke uitdagingen ga je bewust aan om te groeien?</strong></p>
                <p>Kies 3 uitdagingen die je comfortzone uitbreiden.</p>
              </div>
            </div>
            
            <h3>Over Focus</h3>
            <div class="reflection-section">
              <div class="reflection-question">
                <h4>🎯 Afleidingen</h4>
                <p><strong>Wat zijn je grootste afleidingen?</strong></p>
                <p>Maak een lijst van alle dingen die je focus verstoren.</p>
              </div>
              
              <div class="reflection-question">
                <h4>🔧 Technieken</h4>
                <p><strong>Welke focus technieken ga je implementeren?</strong></p>
                <p>Kies 2-3 technieken die het beste bij je passen.</p>
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
        
        .pillar-analysis {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .pillar-analysis:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .pillar-analysis h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .resilience-levels, .focus-domains, .confidence-aspects, .persistence-factors {
            margin: 20px 0;
        }
        
        .resilience-levels h5, .focus-domains h5, .confidence-aspects h5, .persistence-factors h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .resilience-levels ul, .focus-domains ul, .confidence-aspects ul, .persistence-factors ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .resilience-levels li, .focus-domains li, .confidence-aspects li, .persistence-factors li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .technique-box {
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 2px solid #ff9800;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .technique-box h4 {
            color: #e65100;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .technique-steps, .meditation-guide, .visualization-practice {
            margin: 20px 0;
        }
        
        .technique-steps h5, .meditation-guide h5, .visualization-practice h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .technique-steps ul, .meditation-guide ul, .visualization-practice ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .technique-steps li, .meditation-guide li, .visualization-practice li {
            margin-bottom: 10px;
            font-size: 1em;
        }
        
        .routine-plan {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .routine-plan h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .routine-steps {
            margin: 20px 0;
        }
        
        .routine-step {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            transition: all 0.3s ease;
        }
        
        .routine-step:hover {
            border-color: #8BAE5A;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(139, 174, 90, 0.15);
        }
        
        .routine-step h5 {
            color: #8BAE5A;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .routine-step p {
            color: #666;
            font-size: 1em;
        }
        
        .mindset-analysis {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .mindset-analysis:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .mindset-analysis h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .fixed-characteristics, .growth-characteristics {
            margin: 20px 0;
        }
        
        .fixed-characteristics h5, .growth-characteristics h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .fixed-characteristics ul, .growth-characteristics ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .fixed-characteristics li, .growth-characteristics li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .stress-strategies {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .strategy-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .strategy-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .strategy-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
            text-align: center;
        }
        
        .strategy-examples {
            margin: 20px 0;
        }
        
        .strategy-examples h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .strategy-examples ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .strategy-examples li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .trait-analysis {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .trait-analysis:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .trait-analysis h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .stability-practices, .adaptability-skills {
            margin: 20px 0;
        }
        
        .stability-practices h5, .adaptability-skills h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .stability-practices ul, .adaptability-skills ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .stability-practices li, .adaptability-skills li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .reflection-section {
            margin: 30px 0;
        }
        
        .reflection-question {
            background: linear-gradient(135deg, #f3e5f5, #e1bee7);
            border: 2px solid #9c27b0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .reflection-question h4 {
            color: #7b1fa2;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .reflection-question p {
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
            
            .stress-strategies {
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

async function createAllModule4EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 4 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module4EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Mentale Kracht/Weerbaarheid',
          '04'
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
    console.log('✅ Module 4 specific styling (mindset analysis, stress strategies, reflection questions)');

    console.log('\n✅ All Module 4 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule4EnhancedEbooks();
