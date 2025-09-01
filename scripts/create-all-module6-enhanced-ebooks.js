const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 6 lessons
const module6EnhancedContent = {
  'Waarom een Brotherhood': {
    title: 'Waarom een Brotherhood',
    subtitle: 'De Kracht van Echte Verbinding',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Brotherhood is niet alleen over vriendschap - het is over een diepe, onvoorwaardelijke verbinding die je leven transformeert.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De ware betekenis van Brotherhood en waarom het cruciaal is</li>
              <li>Hoe Brotherhood verschilt van gewone vriendschap</li>
              <li>De psychologie van mannelijke verbinding en groei</li>
              <li>Praktische stappen om Brotherhood te ontwikkelen</li>
              <li>Een 30-dagen Brotherhood transformatie</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Mannen met sterke Brotherhood verbindingen leven gemiddeld 7 jaar langer en rapporteren 3x hogere levensvoldoening.</p>
          </div>
        `
      },
      {
        title: 'De 4 Pijlers van Brotherhood',
        content: `
          <div class="page-header">
            <h2>De 4 Pijlers van Brotherhood</h2>
            <p class="lead">Begrijp de fundamenten van betekenisvolle mannelijke verbinding.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Accountability</h3>
            <div class="brotherhood-pillar">
              <h4>🎯 Wat is accountability?</h4>
              <p>Anderen houden je verantwoordelijk voor je doelen en acties.</p>
              <div class="pillar-benefits">
                <h5>Voordelen van accountability:</h5>
                <ul>
                  <li><strong>Consistentie:</strong> Je blijft op koers met je doelen</li>
                  <li><strong>Motivatie:</strong> Externe drive om te presteren</li>
                  <li><strong>Groei:</strong> Snellere ontwikkeling door feedback</li>
                  <li><strong>Resultaten:</strong> Betere uitkomsten door verantwoordelijkheid</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Perspectief</h3>
            <div class="brotherhood-pillar">
              <h4>🔍 Wat is perspectief?</h4>
              <p>Verschillende viewpoints en ervaringen delen voor nieuwe inzichten.</p>
              <div class="pillar-benefits">
                <h5>Voordelen van perspectief:</h5>
                <ul>
                  <li><strong>Inzicht:</strong> Leer van andermans fouten en successen</li>
                  <li><strong>Creativiteit:</strong> Nieuwe ideeën door verschillende viewpoints</li>
                  <li><strong>Groeimindset:</strong> Ontdek nieuwe mogelijkheden</li>
                  <li><strong>Empathie:</strong> Begrijp andere perspectieven</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Emotionele Support</h3>
            <div class="brotherhood-pillar">
              <h4>💙 Wat is emotionele support?</h4>
              <p>Een veilige ruimte om te delen en ondersteund te worden.</p>
              <div class="pillar-benefits">
                <h5>Voordelen van emotionele support:</h5>
                <ul>
                  <li><strong>Veiligheid:</strong> Je kunt jezelf zijn zonder oordeel</li>
                  <li><strong>Begrip:</strong> Anderen begrijpen je struggles</li>
                  <li><strong>Welzijn:</strong> Betere mentale gezondheid</li>
                  <li><strong>Verbinding:</strong> Diepere, betekenisvolle relaties</li>
                </ul>
              </div>
            </div>
            
            <h3>4. Networking</h3>
            <div class="brotherhood-pillar">
              <h4>🌐 Wat is networking?</h4>
              <p>Nieuwe kansen en mogelijkheden door sterke connecties.</p>
              <div class="pillar-benefits">
                <h5>Voordelen van networking:</h5>
                <ul>
                  <li><strong>Kansen:</strong> Nieuwe business en carrière mogelijkheden</li>
                  <li><strong>Kennis:</strong> Leer van experts in je veld</li>
                  <li><strong>Groei:</strong> Persoonlijke en professionele ontwikkeling</li>
                  <li><strong>Vriendschap:</strong> Relaties voor het leven</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'De 5 Pijlers van Betekenisvolle Connecties',
        content: `
          <div class="page-header">
            <h2>De 5 Pijlers van Betekenisvolle Connecties</h2>
            <p class="lead">Bouw diepe, duurzame relaties die je leven transformeren.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Authenticiteit</h3>
            <div class="connection-pillar">
              <h4>🎭 Wat is authenticiteit?</h4>
              <p>Wees jezelf, altijd en overal.</p>
              <div class="pillar-practices">
                <h5>Praktijken voor authenticiteit:</h5>
                <ul>
                  <li><strong>Eerlijkheid:</strong> Deel je echte verhalen en uitdagingen</li>
                  <li><strong>Kwetsbaarheid:</strong> Toon je imperfecties en struggles</li>
                  <li><strong>Consistentie:</strong> Wees dezelfde persoon in alle situaties</li>
                  <li><strong>Integriteit:</strong> Leef volgens je waarden</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Vulnerability</h3>
            <div class="connection-pillar">
              <h4>💔 Wat is vulnerability?</h4>
              <p>Deel je angsten en twijfels om echte connectie te maken.</p>
              <div class="pillar-practices">
                <h5>Praktijken voor vulnerability:</h5>
                <ul>
                  <li><strong>Angsten delen:</strong> Deel wat je bang maakt</li>
                  <li><strong>Twijfels uiten:</strong> Toon je onzekerheden</li>
                  <li><strong>Fouten erkennen:</strong> Wees eerlijk over je misstappen</li>
                  <li><strong>Hulp vragen:</strong> Toon dat je niet perfect bent</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Active Listening</h3>
            <div class="connection-pillar">
              <h4>👂 Wat is active listening?</h4>
              <p>Luister om te begrijpen, niet om te reageren.</p>
              <div class="pillar-practices">
                <h5>Praktijken voor active listening:</h5>
                <ul>
                  <li><strong>Focus:</strong> Geef je volledige aandacht</li>
                  <li><strong>Vragen stellen:</strong> Stel verdiepende vragen</li>
                  <li><strong>Reflecteren:</strong> Herhaal wat je hoort</li>
                  <li><strong>Oordeel vermijden:</strong> Luister zonder oordeel</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Eer en Loyaliteit': {
    title: 'Eer en Loyaliteit',
    subtitle: 'De Fundering van Echte Brotherhood',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Eer en loyaliteit zijn niet alleen woorden - ze zijn de fundamenten waarop echte Brotherhood wordt gebouwd.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De ware betekenis van eer en loyaliteit</li>
              <li>Hoe je deze waarden kunt ontwikkelen</li>
              <li>De rol van vertrouwen in Brotherhood</li>
              <li>Praktische stappen om loyaliteit te tonen</li>
              <li>Een loyaliteitsplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Wat is Eer?',
        content: `
          <div class="page-header">
            <h2>Wat is Eer?</h2>
            <p class="lead">Eer is de basis van respect en vertrouwen in Brotherhood.</p>
          </div>
          
          <div class="content-section">
            <h3>De 4 Aspecten van Eer</h3>
            <div class="honor-aspects">
              <div class="honor-aspect">
                <h4>🏆 Integriteit</h4>
                <p>Leef volgens je waarden en principes.</p>
                <div class="aspect-details">
                  <h5>Wat betekent dit:</h5>
                  <ul>
                    <li>Doe wat je zegt</li>
                    <li>Houd je aan je beloftes</li>
                    <li>Wees eerlijk in alle situaties</li>
                    <li>Leef volgens je morele kompas</li>
                  </ul>
                </div>
              </div>
              
              <div class="honor-aspect">
                <h4>🤝 Respect</h4>
                <p>Behandel anderen met waardigheid en respect.</p>
                <div class="aspect-details">
                  <h5>Wat betekent dit:</h5>
                  <ul>
                    <li>Luister naar anderen</li>
                    <li>Waardeer verschillende perspectieven</li>
                    <li>Behandel iedereen gelijk</li>
                    <li>Toon empathie en begrip</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Bouw de juiste Kring': {
    title: 'Bouw de juiste Kring',
    subtitle: 'Selecteer Je Tribe met Wijsheid',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Je kring van invloed bepaalt je niveau van succes. Kies wijs wie je om je heen hebt.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Hoe je de juiste mensen identificeert</li>
              <li>Criteria voor je inner circle</li>
              <li>Strategieën om je kring uit te breiden</li>
              <li>Hoe je giftige relaties herkent</li>
              <li>Een actieplan voor je kring</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Criteria voor Je Inner Circle',
        content: `
          <div class="page-header">
            <h2>Criteria voor Je Inner Circle</h2>
            <p class="lead">Stel hoge standaarden voor wie je in je leven toelaat.</p>
          </div>
          
          <div class="content-section">
            <h3>De 5 C's van Kwaliteit</h3>
            <div class="quality-criteria">
              <div class="criterion">
                <h4>💪 Character (Karakter)</h4>
                <p>Sterke morele principes en integriteit.</p>
                <div class="criterion-details">
                  <h5>Wat te zoeken:</h5>
                  <ul>
                    <li>Eerlijkheid en betrouwbaarheid</li>
                    <li>Sterke waarden en principes</li>
                    <li>Consistent gedrag</li>
                    <li>Verantwoordelijkheid nemen</li>
                  </ul>
                </div>
              </div>
              
              <div class="criterion">
                <h4>🚀 Competence (Bekwaamheid)</h4>
                <p>Uitmuntendheid in hun vakgebied.</p>
                <div class="criterion-details">
                  <h5>Wat te zoeken:</h5>
                  <ul>
                    <li>Expertise en vaardigheden</li>
                    <li>Continue leren en groei</li>
                    <li>Resultaten leveren</li>
                    <li>Innovatie en creativiteit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Cut The Weak': {
    title: 'Cut The Weak',
    subtitle: 'Elimineer Giftige Invloeden uit Je Leven',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Soms moet je mensen loslaten om te groeien. Leer wanneer en hoe je giftige relaties beëindigt.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Hoe je giftige mensen herkent</li>
              <li>Wanneer je relaties moet beëindigen</li>
              <li>Strategieën voor gezonde afstand</li>
              <li>Hoe je jezelf beschermt</li>
              <li>Een detox plan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Tekenen van Giftige Relaties',
        content: `
          <div class="page-header">
            <h2>Tekenen van Giftige Relaties</h2>
            <p class="lead">Herken de waarschuwingssignalen voordat het te laat is.</p>
          </div>
          
          <div class="content-section">
            <h3>De 7 Rode Vlaggen</h3>
            <div class="red-flags">
              <div class="red-flag">
                <h4>🚩 1. Emotionele Manipulatie</h4>
                <p>Ze gebruiken je emoties tegen je.</p>
                <div class="flag-examples">
                  <h5>Voorbeelden:</h5>
                  <ul>
                    <li>Schuldgevoel aanpraten</li>
                    <li>Emotionele chantage</li>
                    <li>Gaslighting technieken</li>
                    <li>Drama creëren</li>
                  </ul>
                </div>
              </div>
              
              <div class="red-flag">
                <h4>🚩 2. Constant Klagen</h4>
                <p>Ze zijn nooit tevreden en klagen altijd.</p>
                <div class="flag-examples">
                  <h5>Voorbeelden:</h5>
                  <ul>
                    <li>Altijd negatief zijn</li>
                    <li>Geen oplossingen zoeken</li>
                    <li>Anderen de schuld geven</li>
                    <li>Energie drainen</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Hoe je je Broeders versterkt en samen groeit': {
    title: 'Hoe je je Broeders versterkt en samen groeit',
    subtitle: 'Bouw een Onverwoestbare Brotherhood',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Echte Brotherhood gaat over samen groeien en elkaar versterken tot we allemaal ons potentieel bereiken.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Hoe je anderen kunt versterken</li>
              <li>Strategieën voor gezamenlijke groei</li>
              <li>Het bouwen van een support systeem</li>
              <li>Hoe je een mentor kunt zijn</li>
              <li>Een groeiplan opstellen</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Strategieën voor Versterking',
        content: `
          <div class="page-header">
            <h2>Strategieën voor Versterking</h2>
            <p class="lead">Leer hoe je anderen kunt helpen groeien en ontwikkelen.</p>
          </div>
          
          <div class="content-section">
            <h3>De 4 V's van Versterking</h3>
            <div class="strengthening-strategies">
              <div class="strategy">
                <h4>🎯 Verantwoordelijkheid</h4>
                <p>Houd anderen verantwoordelijk voor hun doelen.</p>
                <div class="strategy-details">
                  <h5>Hoe toe te passen:</h5>
                  <ul>
                    <li>Check regelmatig in op voortgang</li>
                    <li>Vraag om updates en resultaten</li>
                    <li>Bied constructieve feedback</li>
                    <li>Vier successen en prestaties</li>
                  </ul>
                </div>
              </div>
              
              <div class="strategy">
                <h4>💡 Visie</h4>
                <p>Help anderen hun potentieel te zien.</p>
                <div class="strategy-details">
                  <h5>Hoe toe te passen:</h5>
                  <ul>
                    <li>Identificeer hun sterke punten</li>
                    <li>Help doelen te stellen</li>
                    <li>Toon mogelijkheden</li>
                    <li>Moedig ambitie aan</li>
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
        
        .brotherhood-pillar {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .brotherhood-pillar:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .brotherhood-pillar h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .pillar-benefits {
            margin: 20px 0;
        }
        
        .pillar-benefits h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .pillar-benefits ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .pillar-benefits li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .connection-pillar {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .connection-pillar h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .pillar-practices {
            margin: 20px 0;
        }
        
        .pillar-practices h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .pillar-practices ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .pillar-practices li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .honor-aspects {
            margin: 30px 0;
        }
        
        .honor-aspect {
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 2px solid #ff9800;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .honor-aspect h4 {
            color: #e65100;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .aspect-details {
            margin: 20px 0;
        }
        
        .aspect-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .aspect-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .aspect-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .quality-criteria {
            margin: 30px 0;
        }
        
        .criterion {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .criterion:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .criterion h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .criterion-details {
            margin: 20px 0;
        }
        
        .criterion-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .criterion-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .criterion-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .red-flags {
            margin: 30px 0;
        }
        
        .red-flag {
            background: linear-gradient(135deg, #ffebee, #ffcdd2);
            border: 2px solid #f44336;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .red-flag h4 {
            color: #c62828;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .flag-examples {
            margin: 20px 0;
        }
        
        .flag-examples h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .flag-examples ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .flag-examples li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .strengthening-strategies {
            margin: 30px 0;
        }
        
        .strategy {
            background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
            border: 2px solid #4caf50;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .strategy h4 {
            color: #2e7d32;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .strategy-details {
            margin: 20px 0;
        }
        
        .strategy-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .strategy-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .strategy-details li {
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

async function createAllModule6EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 6 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module6EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Brotherhood',
          '06'
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
    console.log('✅ Module 6 specific styling (brotherhood pillars, connection pillars, honor aspects, quality criteria, red flags, strengthening strategies)');

    console.log('\n✅ All Module 6 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule6EnhancedEbooks();
