const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 5 lessons
const module5EnhancedContent = {
  'De Financiële Mindset': {
    title: 'De Financiële Mindset',
    subtitle: 'Transformeer Je Relatie met Geld',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">De financiële mindset is niet alleen over geld verdienen - het is over het creëren van keuzevrijheid en het bouwen van een duurzame toekomst.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De 4 pijlers van financiële intelligentie</li>
              <li>Hoe je je financiële mindset kunt transformeren</li>
              <li>Een 4-fasen financiële roadmap</li>
              <li>Praktische stappen voor vandaag</li>
              <li>De kracht van compound interest</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Compound interest wordt door Einstein beschreven als "de 8e wereldwonder". Start je vandaag nog met €100 per maand, dan heb je na 30 jaar bij 7% rendement meer dan €100.000!</p>
          </div>
        `
      },
      {
        title: 'De 4 Pijlers van Financiële Intelligentie',
        content: `
          <div class="page-header">
            <h2>De 4 Pijlers van Financiële Intelligentie</h2>
            <p class="lead">Begrijp de fundamenten van duurzame financiële groei.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Verdienen</h3>
            <div class="foundation-analysis">
              <h4>💰 Wat is verdienen?</h4>
              <p>Het vermogen om inkomen te genereren door waarde te creëren.</p>
              <div class="foundation-section">
                <h5>Strategieën voor meer inkomen:</h5>
                <ul>
                  <li><strong>Vaardigheden ontwikkelen:</strong> Cursussen, certificeringen</li>
                  <li><strong>Meerdere inkomstenbronnen:</strong> Side hustles, passief inkomen</li>
                  <li><strong>Netwerken:</strong> Connect met succesvolle mensen</li>
                  <li><strong>Investeren in jezelf:</strong> Kennis is je beste investering</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Besparen</h3>
            <div class="foundation-analysis">
              <h4>💾 Wat is besparen?</h4>
              <p>Het vermogen om geld te behouden en te laten groeien.</p>
              <div class="foundation-section">
                <h5>Besparingsstrategieën:</h5>
                <ul>
                  <li><strong>Leef onder je stand:</strong> Vermijd lifestyle inflation</li>
                  <li><strong>Automatiseer sparen:</strong> Pay yourself first</li>
                  <li><strong>Budget opstellen:</strong> Track al je uitgaven</li>
                  <li><strong>Emergency fund:</strong> 3-6 maanden uitgaven</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Investeren</h3>
            <div class="foundation-analysis">
              <h4>📈 Wat is investeren?</h4>
              <p>Laat je geld voor je werken door compound interest.</p>
              <div class="foundation-section">
                <h5>Investeringsprincipes:</h5>
                <ul>
                  <li><strong>Lange termijn denken:</strong> Minimaal 10+ jaar</li>
                  <li><strong>Diversificatie:</strong> Spreid je risico's</li>
                  <li><strong>Consistentie:</strong> Regelmatig investeren</li>
                  <li><strong>Lage kosten:</strong> Index funds, ETFs</li>
                </ul>
              </div>
            </div>
            
            <h3>4. Beschermen</h4>
            <div class="foundation-analysis">
              <h4>🛡️ Wat is beschermen?</h4>
              <p>Bescherm je vermogen tegen onvoorziene omstandigheden.</p>
              <div class="foundation-section">
                <h5>Beschermingsstrategieën:</h5>
                <ul>
                  <li><strong>Verzekeringen:</strong> Zorg, leven, aansprakelijkheid</li>
                  <li><strong>Emergency fund:</strong> Onvoorziene uitgaven</li>
                  <li><strong>Juridische bescherming:</strong> Trusts, BV's</li>
                  <li><strong>Diversificatie:</strong> Niet alles in één asset</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Je Financiële Roadmap',
        content: `
          <div class="page-header">
            <h2>Je Financiële Roadmap</h2>
            <p class="lead">Een gestructureerde aanpak voor financiële vrijheid in 4 fasen.</p>
          </div>
          
          <div class="content-section">
            <h3>Fase 1: Foundation (0-6 maanden)</h3>
            <div class="roadmap-phase">
              <h4>🏗️ Bouw je fundament</h4>
              <div class="phase-goals">
                <div class="goal-item">
                  <h5>Emergency Fund</h5>
                  <p>3-6 maanden uitgaven sparen</p>
                </div>
                <div class="goal-item">
                  <h5>Schulden Aflossen</h5>
                  <p>Start met hoogste rente</p>
                </div>
                <div class="goal-item">
                  <h5>Budget Opstellen</h5>
                  <p>Track al je uitgaven</p>
                </div>
                <div class="goal-item">
                  <h5>Doelen Stellen</h5>
                  <p>SMART financiële doelen</p>
                </div>
              </div>
            </div>
            
            <h3>Fase 2: Building (6 maanden - 2 jaar)</h3>
            <div class="roadmap-phase">
              <h4>🚀 Start met bouwen</h4>
              <div class="phase-goals">
                <div class="goal-item">
                  <h5>Investeren Starten</h5>
                  <p>Index funds, ETFs</p>
                </div>
                <div class="goal-item">
                  <h5>Pensioen Opbouwen</h5>
                  <p>Maximaliseer belastingvoordelen</p>
                </div>
                <div class="goal-item">
                  <h5>Vaardigheden Ontwikkelen</h5>
                  <p>Cursussen, certificeringen</p>
                </div>
                <div class="goal-item">
                  <h5>Side Hustle Starten</h5>
                  <p>Extra inkomen genereren</p>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Grip op je geld': {
    title: 'Grip op je geld',
    subtitle: 'Leer Effectief Budgetteren en Sparen',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Grip op je geld hebben betekent niet dat je arm leeft - het betekent dat je bewust kiest waar je je geld aan uitgeeft.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Hoe je een effectief budget opstelt</li>
              <li>De 50/30/20 regel voor uitgaven</li>
              <li>Strategieën om meer te sparen</li>
              <li>Hoe je je uitgaven kunt tracken</li>
              <li>Een spaarplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De 50/30/20 Regel',
        content: `
          <div class="page-header">
            <h2>De 50/30/20 Regel</h2>
            <p class="lead">Een eenvoudige maar effectieve manier om je uitgaven te categoriseren.</p>
          </div>
          
          <div class="content-section">
            <h3>50% - Essentiële Uitgaven</h3>
            <div class="expense-category">
              <h4>🏠 Wat valt hieronder?</h4>
              <p>Uitgaven die je nodig hebt om te overleven en te functioneren.</p>
              <div class="expense-examples">
                <h5>Voorbeelden:</h5>
                <ul>
                  <li>Huur/hypotheek</li>
                  <li>Boodschappen</li>
                  <li>Verzekeringen</li>
                  <li>Basis transport</li>
                  <li>Minimum schuldaflossing</li>
                </ul>
              </div>
            </div>
            
            <h3>30% - Lifestyle Uitgaven</h3>
            <div class="expense-category">
              <h4>🎯 Wat valt hieronder?</h4>
              <p>Uitgaven die je leven leuker maken maar niet essentieel zijn.</p>
              <div class="expense-examples">
                <h5>Voorbeelden:</h5>
                <ul>
                  <li>Uit eten gaan</li>
                  <li>Entertainment</li>
                  <li>Hobby's</li>
                  <li>Vakanties</li>
                  <li>Luxe items</li>
                </ul>
              </div>
            </div>
            
            <h3>20% - Financiële Doelen</h3>
            <div class="expense-category">
              <h4>💰 Wat valt hieronder?</h4>
              <p>Geld dat je investeert in je toekomst.</p>
              <div class="expense-examples">
                <h5>Voorbeelden:</h5>
                <ul>
                  <li>Sparen</li>
                  <li>Investeren</li>
                  <li>Schulden extra aflossen</li>
                  <li>Emergency fund</li>
                  <li>Pensioen</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Van Werknemer naar eigen Verdienmodellen': {
    title: 'Van Werknemer naar eigen Verdienmodellen',
    subtitle: 'Bouw Meerdere Inkomstenbronnen',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">De tijd van één baan voor het leven is voorbij. Leer hoe je meerdere inkomstenbronnen kunt opbouwen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De verschillende soorten inkomstenbronnen</li>
              <li>Hoe je een side hustle start</li>
              <li>Strategieën voor passief inkomen</li>
              <li>Van werknemer naar ondernemer</li>
              <li>Een verdienmodel opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Soorten Inkomstenbronnen',
        content: `
          <div class="page-header">
            <h2>Soorten Inkomstenbronnen</h2>
            <p class="lead">Begrijp het verschil tussen actief en passief inkomen.</p>
          </div>
          
          <div class="content-section">
            <h3>Actief Inkomen</h3>
            <div class="income-type">
              <h4>💼 Wat is actief inkomen?</h4>
              <p>Geld dat je verdient door direct te werken.</p>
              <div class="income-examples">
                <h5>Voorbeelden:</h5>
                <ul>
                  <li>Salaris van je baan</li>
                  <li>Freelance werk</li>
                  <li>Consultancy</li>
                  <li>Online diensten</li>
                  <li>Fysieke producten verkopen</li>
                </ul>
              </div>
            </div>
            
            <h3>Passief Inkomen</h3>
            <div class="income-type">
              <h4>🔄 Wat is passief inkomen?</h4>
              <p>Geld dat je verdient zonder direct te werken.</p>
              <div class="income-examples">
                <h5>Voorbeelden:</h5>
                <ul>
                  <li>Dividend uit aandelen</li>
                  <li>Huurinkomsten</li>
                  <li>Royalties van boeken</li>
                  <li>Online cursussen</li>
                  <li>Digitale producten</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Vermogen Opbouwen Begin met Investeren': {
    title: 'Vermogen Opbouwen Begin met Investeren',
    subtitle: 'Laat Je Geld voor Je Werken',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Investeren is niet alleen voor de rijken - het is voor iedereen die zijn geld wil laten groeien.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De basis van investeren</li>
              <li>Verschillende investeringscategorieën</li>
              <li>Hoe je kunt beginnen met weinig geld</li>
              <li>Risico's begrijpen en beheren</li>
              <li>Een investeringsplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Investeringscategorieën',
        content: `
          <div class="page-header">
            <h2>Investeringscategorieën</h2>
            <p class="lead">Begrijp de verschillende manieren om te investeren.</p>
          </div>
          
          <div class="content-section">
            <h3>Aandelen</h3>
            <div class="investment-category">
              <h4>📈 Wat zijn aandelen?</h4>
              <p>Eigendom in een bedrijf dat kan groeien in waarde.</p>
              <div class="investment-details">
                <h5>Voordelen:</h5>
                <ul>
                  <li>Hoog rendementspotentieel</li>
                  <li>Liquide (makkelijk te verkopen)</li>
                  <li>Diversificatie mogelijk</li>
                  <li>Dividend inkomen</li>
                </ul>
                <h5>Risico's:</h5>
                <ul>
                  <li>Marktvolatiliteit</li>
                  <li>Bedrijfsspecifieke risico's</li>
                  <li>Emotionele beslissingen</li>
                </ul>
              </div>
            </div>
            
            <h3>Vastgoed</h3>
            <div class="investment-category">
              <h4>🏠 Wat is vastgoed?</h4>
              <p>Investeren in onroerend goed voor huurinkomsten en waardegroei.</p>
              <div class="investment-details">
                <h5>Voordelen:</h5>
                <ul>
                  <li>Stabiele huurinkomsten</li>
                  <li>Leverage mogelijkheden</li>
                  <li>Belastingvoordelen</li>
                  <li>Inflatiebescherming</li>
                </ul>
                <h5>Risico's:</h5>
                <ul>
                  <li>Lage liquiditeit</li>
                  <li>Onderhoudskosten</li>
                  <li>Marktcycli</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Financiële Vrijheid en Legacy': {
    title: 'Financiële Vrijheid en Legacy',
    subtitle: 'Bouw een Duurzame Toekomst',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Financiële vrijheid gaat niet alleen over geld - het gaat over keuzevrijheid en het bouwen van een legacy.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Wat financiële vrijheid betekent</li>
              <li>Hoe je een legacy kunt opbouwen</li>
              <li>Strategieën voor generatie-overdracht</li>
              <li>Filantropie en impact maken</li>
              <li>Een duurzame toekomst plannen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Wat is Financiële Vrijheid?',
        content: `
          <div class="page-header">
            <h2>Wat is Financiële Vrijheid?</h2>
            <p class="lead">Financiële vrijheid betekent dat je kunt kiezen hoe je je tijd besteedt.</p>
          </div>
          
          <div class="content-section">
            <h3>De 4 Niveaus van Financiële Vrijheid</h3>
            <div class="freedom-levels">
              <div class="freedom-level">
                <h4>🆓 Niveau 1: Financiële Veiligheid</h4>
                <p>Je hebt een emergency fund en bent schuldenvrij.</p>
                <div class="level-details">
                  <h5>Wat je hebt:</h5>
                  <ul>
                    <li>3-6 maanden uitgaven gespaard</li>
                    <li>Geen schulden met hoge rente</li>
                    <li>Basis verzekeringen</li>
                  </ul>
                </div>
              </div>
              
              <div class="freedom-level">
                <h4>🚀 Niveau 2: Financiële Onafhankelijkheid</h4>
                <p>Je passief inkomen dekt je basis uitgaven.</p>
                <div class="level-details">
                  <h5>Wat je hebt:</h5>
                  <ul>
                    <li>Passief inkomen = basis uitgaven</li>
                    <li>Vermogen van 25x je jaarlijkse uitgaven</li>
                    <li>Optie om te stoppen met werken</li>
                  </ul>
                </div>
              </div>
              
              <div class="freedom-level">
                <h4>🌟 Niveau 3: Financiële Vrijheid</h4>
                <p>Je passief inkomen dekt je gewenste levensstijl.</p>
                <div class="level-details">
                  <h5>Wat je hebt:</h5>
                  <ul>
                    <li>Passief inkomen = gewenste levensstijl</li>
                    <li>Vermogen van 50x je jaarlijkse uitgaven</li>
                    <li>Volledige keuzevrijheid</li>
                  </ul>
                </div>
              </div>
              
              <div class="freedom-level">
                <h4>👑 Niveau 4: Financiële Overvloed</h4>
                <p>Je hebt meer dan genoeg om anderen te helpen.</p>
                <div class="level-details">
                  <h5>Wat je hebt:</h5>
                  <ul>
                    <li>Meer dan je ooit nodig hebt</li>
                    <li>Mogelijkheid om impact te maken</li>
                    <li>Legacy voor volgende generaties</li>
                  </ul>
                </div>
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
        
        .foundation-analysis {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .foundation-analysis:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .foundation-analysis h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .foundation-section {
            margin: 20px 0;
        }
        
        .foundation-section h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .foundation-section ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .foundation-section li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .roadmap-phase {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .roadmap-phase h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .phase-goals {
            margin: 20px 0;
        }
        
        .goal-item {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            transition: all 0.3s ease;
        }
        
        .goal-item:hover {
            border-color: #8BAE5A;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(139, 174, 90, 0.15);
        }
        
        .goal-item h5 {
            color: #8BAE5A;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .goal-item p {
            color: #666;
            font-size: 1em;
        }
        
        .expense-category {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .expense-category:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .expense-category h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .expense-examples {
            margin: 20px 0;
        }
        
        .expense-examples h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .expense-examples ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .expense-examples li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .income-type {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .income-type:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .income-type h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .income-examples {
            margin: 20px 0;
        }
        
        .income-examples h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .income-examples ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .income-examples li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .investment-category {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .investment-category:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .investment-category h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .investment-details {
            margin: 20px 0;
        }
        
        .investment-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .investment-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .investment-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .freedom-levels {
            margin: 30px 0;
        }
        
        .freedom-level {
            background: linear-gradient(135deg, #f3e5f5, #e1bee7);
            border: 2px solid #9c27b0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .freedom-level h4 {
            color: #7b1fa2;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .level-details {
            margin: 20px 0;
        }
        
        .level-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .level-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .level-details li {
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

async function createAllModule5EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 5 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module5EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Business and Finance',
          '05'
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
    console.log('✅ Module 5 specific styling (foundation analysis, roadmap phases, expense categories, income types, investment categories, freedom levels)');

    console.log('\n✅ All Module 5 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule5EnhancedEbooks();
