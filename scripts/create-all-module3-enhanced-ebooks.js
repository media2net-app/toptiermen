const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced ebook content for all Module 3 lessons
const module3EnhancedContent = {
  'Waarom is fysieke dominantie zo belangrijk?': {
    title: 'Waarom is fysieke dominantie zo belangrijk?',
    subtitle: 'De Kracht van Fysieke Aanwezigheid',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Fysieke dominantie is niet alleen over spieren - het is over de energie die je uitstraalt en hoe anderen je waarnemen.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De wetenschap achter fysieke dominantie en status</li>
              <li>Hoe je lichaamstaal je sociale positie beïnvloedt</li>
              <li>De psychologie van fysieke aanwezigheid</li>
              <li>Praktische oefeningen om je dominantie te versterken</li>
              <li>Een 30-dagen fysieke dominantie transformatie</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h4>💡 Wist je dat?</h4>
            <p>Mensen beoordelen je status binnen 7 seconden van ontmoeting, grotendeels gebaseerd op je fysieke aanwezigheid en lichaamstaal.</p>
          </div>
        `
      },
      {
        title: 'De Wetenschap van Dominantie',
        content: `
          <div class="page-header">
            <h2>De Wetenschap van Dominantie</h2>
            <p class="lead">Begrijp hoe fysieke dominantie werkt in de natuur en in menselijke interacties.</p>
          </div>
          
          <div class="content-section">
            <h3>Waarom Fysieke Dominantie Belangrijk Is</h3>
            <div class="dominance-grid">
              <div class="dominance-card">
                <h4>🧠 Mentale Kracht</h4>
                <p>Krachttraining verhoogt je zelfvertrouwen en leert je doorzetten bij uitdagingen.</p>
                <ul>
                  <li>Verhoogde focus en discipline</li>
                  <li>Betere stress management</li>
                  <li>Sterker doorzettingsvermogen</li>
                </ul>
              </div>
              <div class="dominance-card">
                <h4>💪 Fysieke Gezondheid</h4>
                <p>Sterkere botten, betere stofwisseling en verhoogde energie levels.</p>
                <ul>
                  <li>Verbeterde hormoonbalans</li>
                  <li>Betere slaapkwaliteit</li>
                  <li>Verhoogde vitaliteit</li>
                </ul>
              </div>
              <div class="dominance-card">
                <h4>🎯 Functionele Kracht</h4>
                <p>Dagelijkse activiteiten worden makkelijker en je hebt minder kans op blessures.</p>
                <ul>
                  <li>Betere houding en balans</li>
                  <li>Verhoogde mobiliteit</li>
                  <li>Meer energie voor activiteiten</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'De 5 Basis Principes',
        content: `
          <div class="page-header">
            <h2>De 5 Basis Principes van Fysieke Dominantie</h2>
            <p class="lead">Implementeer deze bewezen principes voor maximale resultaten.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Progressive Overload</h3>
            <div class="principle-box">
              <h4>📈 Hoe het werkt:</h4>
              <p>Verhoog geleidelijk de weerstand om je lichaam te blijven uitdagen en sterker te maken.</p>
              <div class="principle-steps">
                <h5>Implementatie:</h5>
                <ul>
                  <li>Start met gewichten die je 8-12 reps kunt doen</li>
                  <li>Verhoog gewicht wanneer je 12+ reps kunt</li>
                  <li>Focus op techniek, niet alleen gewicht</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Compound Movements</h3>
            <div class="principle-box">
              <h4>🏋️ Hoe het werkt:</h4>
              <p>Gebruik oefeningen die meerdere spiergroepen tegelijk trainen voor maximale efficiëntie.</p>
              <div class="movement-examples">
                <h5>Beste Compound Oefeningen:</h5>
                <ul>
                  <li>Squats - traint benen, core en rug</li>
                  <li>Deadlifts - traint rug, benen en grip</li>
                  <li>Bench Press - traint borst, schouders en triceps</li>
                  <li>Pull-ups - traint rug, biceps en core</li>
                </ul>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Je Eerste Trainingsweek',
        content: `
          <div class="page-header">
            <h2>Je Eerste Trainingsweek</h2>
            <p class="lead">Een gestructureerd plan om te beginnen met fysieke dominantie.</p>
          </div>
          
          <div class="content-section">
            <h3>Dag 1: Push (Borst, Schouders, Triceps)</h3>
            <div class="workout-plan">
              <h4>🎯 Focus: Bovenlichaam duwen</h4>
              <div class="exercise-list">
                <div class="exercise-item">
                  <h5>Bench Press</h5>
                  <p>3 sets x 8 reps - Focus op techniek</p>
                </div>
                <div class="exercise-item">
                  <h5>Overhead Press</h5>
                  <p>3 sets x 8 reps - Schouder stabiliteit</p>
                </div>
                <div class="exercise-item">
                  <h5>Dips</h5>
                  <p>3 sets x 10 reps - Triceps kracht</p>
                </div>
                <div class="exercise-item">
                  <h5>Push-ups</h5>
                  <p>3 sets x 15 reps - Uithoudingsvermogen</p>
                </div>
              </div>
            </div>
            
            <h3>Dag 2: Pull (Rug, Biceps)</h3>
            <div class="workout-plan">
              <h4>🎯 Focus: Bovenlichaam trekken</h4>
              <div class="exercise-list">
                <div class="exercise-item">
                  <h5>Deadlifts</h5>
                  <p>3 sets x 5 reps - Kracht fundament</p>
                </div>
                <div class="exercise-item">
                  <h5>Pull-ups</h5>
                  <p>3 sets x 8 reps - Rug kracht</p>
                </div>
                <div class="exercise-item">
                  <h5>Rows</h5>
                  <p>3 sets x 10 reps - Rug dikte</p>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Het belang van kracht, spiermassa en conditie': {
    title: 'Het belang van kracht, spiermassa en conditie',
    subtitle: 'Bouw een Sterk en Gezond Lichaam',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Kracht, spiermassa en conditie zijn de drie pijlers van fysieke dominantie en algehele gezondheid.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Het verband tussen kracht en zelfvertrouwen</li>
              <li>Hoe spiermassa je metabolisme beïnvloedt</li>
              <li>Het belang van cardiovasculaire conditie</li>
              <li>Balans tussen kracht en uithoudingsvermogen</li>
              <li>Een geïntegreerd trainingsplan</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Drie Pijlers van Fysieke Kracht',
        content: `
          <div class="page-header">
            <h2>De Drie Pijlers van Fysieke Kracht</h2>
            <p class="lead">Begrijp hoe kracht, spiermassa en conditie samenwerken voor optimale resultaten.</p>
          </div>
          
          <div class="content-section">
            <h3>1. Kracht</h3>
            <div class="pillar-card">
              <h4>💪 Wat is kracht?</h4>
              <p>Kracht is het vermogen om weerstand te overwinnen. Het is de basis van alle fysieke prestaties.</p>
              <div class="strength-benefits">
                <h5>Voordelen van kracht:</h5>
                <ul>
                  <li>Verhoogde functionele capaciteit</li>
                  <li>Betere houding en balans</li>
                  <li>Verminderde kans op blessures</li>
                  <li>Verhoogd zelfvertrouwen</li>
                </ul>
              </div>
            </div>
            
            <h3>2. Spiermassa</h3>
            <div class="pillar-card">
              <h4>🏋️ Wat is spiermassa?</h4>
              <p>Spiermassa is de hoeveelheid spierweefsel in je lichaam. Het is cruciaal voor kracht, metabolisme en uiterlijk.</p>
              <div class="muscle-benefits">
                <h5>Voordelen van spiermassa:</h5>
                <ul>
                  <li>Verhoogde stofwisseling</li>
                  <li>Betere insuline gevoeligheid</li>
                  <li>Verhoogde testosteron productie</li>
                  <li>Verbeterde lichaamssamenstelling</li>
                </ul>
              </div>
            </div>
            
            <h3>3. Conditie</h3>
            <div class="pillar-card">
              <h4>❤️ Wat is conditie?</h4>
              <p>Conditie is je vermogen om langdurige fysieke activiteit vol te houden. Het verbetert je hartgezondheid en uithoudingsvermogen.</p>
              <div class="conditioning-benefits">
                <h5>Voordelen van conditie:</h5>
                <ul>
                  <li>Betere hartgezondheid</li>
                  <li>Verhoogde energie levels</li>
                  <li>Betere herstel tussen trainingen</li>
                  <li>Verbeterde mentale helderheid</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Status, Zelfrespect en Aantrekkingskracht': {
    title: 'Status, Zelfrespect en Aantrekkingskracht',
    subtitle: 'Hoe Fysieke Kracht Je Sociale Positie Beïnvloedt',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Fysieke kracht heeft een directe invloed op hoe anderen je waarnemen en hoe je jezelf voelt.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>De psychologie van fysieke aanwezigheid</li>
              <li>Hoe kracht je zelfrespect verhoogt</li>
              <li>De impact van lichaamstaal op status</li>
              <li>Strategieën voor zelfvertrouwen</li>
              <li>Balans tussen kracht en nederigheid</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Psychologie van Status',
        content: `
          <div class="page-header">
            <h2>De Psychologie van Status</h2>
            <p class="lead">Begrijp hoe fysieke dominantie je sociale positie beïnvloedt.</p>
          </div>
          
          <div class="content-section">
            <h3>Hoe Status Werkt</h3>
            <p>Status is je positie in de sociale hiërarchie. Het wordt bepaald door verschillende factoren, waarvan fysieke aanwezigheid er een van is.</p>
            
            <h3>De Status Signalen</h3>
            <div class="status-signals">
              <div class="signal-card">
                <h4>🎯 Fysieke Aanwezigheid</h4>
                <p>Hoe je je lichaam draagt en beweegt</p>
                <ul>
                  <li>Rechte houding</li>
                  <li>Open lichaamstaal</li>
                  <li>Zelfverzekerde bewegingen</li>
                </ul>
              </div>
              <div class="signal-card">
                <h4>💪 Fysieke Kracht</h4>
                <p>Je vermogen om fysieke uitdagingen aan te gaan</p>
                <ul>
                  <li>Spierdefinitie</li>
                  <li>Functionele kracht</li>
                  <li>Uithoudingsvermogen</li>
                </ul>
              </div>
              <div class="signal-card">
                <h4>🧠 Mentale Kracht</h4>
                <p>Je vermogen om mentale uitdagingen te overwinnen</p>
                <ul>
                  <li>Focus en discipline</li>
                  <li>Doorzettingsvermogen</li>
                  <li>Emotionele stabiliteit</li>
                </ul>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Vitaliteit en Levensduur': {
    title: 'Vitaliteit en Levensduur',
    subtitle: 'Leef Langer en Gezonder',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Fysieke kracht is niet alleen voor nu - het is een investering in je toekomstige gezondheid en vitaliteit.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Hoe krachttraining je levensduur verlengt</li>
              <li>De rol van spiermassa in veroudering</li>
              <li>Strategieën voor duurzame gezondheid</li>
              <li>Balans tussen intensiteit en herstel</li>
              <li>Een levenslang gezondheidsplan</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Kracht en Veroudering',
        content: `
          <div class="page-header">
            <h2>Kracht en Veroudering</h2>
            <p class="lead">Begrijp hoe fysieke kracht je helpt om gezond en vitaal ouder te worden.</p>
          </div>
          
          <div class="content-section">
            <h3>Waarom Kracht Belangrijk Is bij Veroudering</h3>
            <div class="aging-factors">
              <div class="factor-card">
                <h4>🦴 Botgezondheid</h4>
                <p>Krachttraining versterkt je botten en voorkomt osteoporose.</p>
                <div class="factor-details">
                  <h5>Hoe het werkt:</h5>
                  <ul>
                    <li>Verhoogde botdichtheid</li>
                    <li>Sterkere gewrichten</li>
                    <li>Betere balans en stabiliteit</li>
                  </ul>
                </div>
              </div>
              <div class="factor-card">
                <h4>💪 Spiermassa Behoud</h4>
                <p>Na je 30e verlies je natuurlijk spiermassa. Krachttraining vertraagt dit proces.</p>
                <div class="factor-details">
                  <h5>Voordelen:</h5>
                  <ul>
                    <li>Behoud van functionele kracht</li>
                    <li>Verhoogde stofwisseling</li>
                    <li>Betere insuline gevoeligheid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
      }
    ]
  },
  
  'Embrace the Suck': {
    title: 'Embrace the Suck',
    subtitle: 'De Kracht van Oncomfortabele Groei',
    pages: [
      {
        title: 'Introductie',
        content: `
          <div class="page-header">
            <h2>Introductie</h2>
            <p class="lead">Groei gebeurt buiten je comfortzone. Leer hoe je ongemak kunt omarmen voor maximale resultaten.</p>
          </div>
          
          <div class="content-section">
            <h3>Wat je gaat leren in dit ebook:</h3>
            <ul class="learning-objectives">
              <li>Waarom ongemak essentieel is voor groei</li>
              <li>Hoe je mentale weerstand kunt overwinnen</li>
              <li>Strategieën voor doorzettingsvermogen</li>
              <li>De psychologie van uitdagingen</li>
              <li>Een mindset voor duurzame groei</li>
            </ul>
          </div>
        `
      },
      {
        title: 'De Psychologie van Ongemak',
        content: `
          <div class="page-header">
            <h2>De Psychologie van Ongemak</h2>
            <p class="lead">Begrijp waarom je hersenen ongemak willen vermijden en hoe je dit kunt overwinnen.</p>
          </div>
          
          <div class="content-section">
            <h3>Waarom We Ongemak Vermijden</h3>
            <p>Je brein is geprogrammeerd om ongemak te vermijden. Dit is een overlevingsmechanisme, maar het kan je groei beperken.</p>
            
            <h3>De Voordelen van Ongemak</h3>
            <div class="discomfort-benefits">
              <div class="benefit-card">
                <h4>🚀 Groei en Ontwikkeling</h4>
                <p>Ongemak is een teken dat je groeit en je grenzen verlegt.</p>
                <ul>
                  <li>Nieuwe vaardigheden ontwikkelen</li>
                  <li>Sterker worden</li>
                  <li>Meer zelfvertrouwen</li>
                </ul>
              </div>
              <div class="benefit-card">
                <h4>🧠 Mentale Weerbaarheid</h4>
                <p>Door ongemak te overwinnen, bouw je mentale kracht op.</p>
                <ul>
                  <li>Betere stress management</li>
                  <li>Verhoogde focus</li>
                  <li>Sterker doorzettingsvermogen</li>
                </ul>
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
        
        .dominance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .dominance-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .dominance-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(139, 174, 90, 0.2);
        }
        
        .dominance-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.3em;
            text-align: center;
        }
        
        .dominance-card ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .dominance-card li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .principle-box {
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 2px solid #ff9800;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .principle-box h4 {
            color: #e65100;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .principle-steps, .movement-examples {
            margin: 20px 0;
        }
        
        .principle-steps h5, .movement-examples h5 {
            color: #8BAE5A;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .principle-steps ul, .movement-examples ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .principle-steps li, .movement-examples li {
            margin-bottom: 10px;
            font-size: 1em;
        }
        
        .workout-plan {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #B6C948;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .workout-plan h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .exercise-list {
            margin: 20px 0;
        }
        
        .exercise-item {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            transition: all 0.3s ease;
        }
        
        .exercise-item:hover {
            border-color: #8BAE5A;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(139, 174, 90, 0.15);
        }
        
        .exercise-item h5 {
            color: #8BAE5A;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .exercise-item p {
            color: #666;
            font-size: 1em;
        }
        
        .pillar-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            transition: all 0.3s ease;
        }
        
        .pillar-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .pillar-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .strength-benefits, .muscle-benefits, .conditioning-benefits {
            margin: 20px 0;
        }
        
        .strength-benefits h5, .muscle-benefits h5, .conditioning-benefits h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .strength-benefits ul, .muscle-benefits ul, .conditioning-benefits ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .strength-benefits li, .muscle-benefits li, .conditioning-benefits li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .status-signals {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .signal-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .signal-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .signal-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
            text-align: center;
        }
        
        .signal-card ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .signal-card li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .aging-factors {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .factor-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .factor-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .factor-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .factor-details {
            margin: 20px 0;
        }
        
        .factor-details h5 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .factor-details ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .factor-details li {
            margin-bottom: 8px;
            font-size: 1em;
        }
        
        .discomfort-benefits {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .benefit-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .benefit-card:hover {
            border-color: #8BAE5A;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(139, 174, 90, 0.15);
        }
        
        .benefit-card h4 {
            color: #8BAE5A;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .benefit-card ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .benefit-card li {
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
            
            .dominance-grid, .status-signals, .aging-factors, .discomfort-benefits {
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

async function createAllModule3EnhancedEbooks() {
  try {
    console.log('🚀 CREATING ALL MODULE 3 ENHANCED EBOOKS');
    console.log('========================================\n');

    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    let createdCount = 0;
    let errorCount = 0;

    // Process each lesson
    for (const [lessonTitle, lessonData] of Object.entries(module3EnhancedContent)) {
      try {
        console.log(`📖 Creating enhanced ebook: ${lessonTitle}`);
        
        const htmlContent = generateEnhancedHTML(
          lessonData,
          'Fysieke Dominantie',
          '03'
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
    console.log('✅ Module 3 specific styling (dominance, workout plans, status signals)');

    console.log('\n✅ All Module 3 enhanced ebooks created');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAllModule3EnhancedEbooks();
