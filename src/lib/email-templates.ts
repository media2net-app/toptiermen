export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const getSneakPreviewEmailTemplate = (name: string, videoUrl: string): EmailTemplate => ({
  subject: '🎬 EXCLUSIEVE SNEAK PREVIEW - Eerste blik op het Top Tier Men Platform',
  html: `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sneak Preview - Top Tier Men Platform</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #ffffff; 
          background-color: #181F17;
          margin: 0;
          padding: 0;
        }
        .email-container { 
          width: 100%; 
          max-width: 100%; 
          margin: 0; 
          background: #181F17;
          border-radius: 0;
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3a5f3a 100%); 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .logo {
          width: 120px;
          height: 60px;
          background: linear-gradient(45deg, #8bae5a, #b6c948);
          border-radius: 8px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
          position: relative;
          z-index: 1;
        }
        .header h1 { 
          color: white; 
          font-size: 32px; 
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .header p { 
          color: #e8f5e8; 
          font-size: 18px;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #181F17;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 20px;
        }
        .intro-text {
          font-size: 16px;
          color: #B6C948;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .video-section {
          background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
          padding: 30px;
          border-radius: 12px;
          margin: 30px 0;
          text-align: center;
          border: 2px solid #8BAE5A;
        }
        .video-thumbnail {
          position: relative;
          background: linear-gradient(45deg, #1a2e1a, #2d4a2d);
          height: 250px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
        }
        .play-button {
          width: 70px;
          height: 70px;
          background: rgba(139, 174, 90, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .play-icon {
          width: 0;
          height: 0;
          border-left: 20px solid white;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          margin-left: 4px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin: 30px 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: rgba(139, 174, 90, 0.05);
          border-left: 4px solid #8BAE5A;
          border-radius: 0 8px 8px 0;
        }
        .feature-icon {
          width: 30px;
          height: 30px;
          background: #8BAE5A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .feature-text {
          color: #D1D5DB;
          font-size: 15px;
        }
        .feature-title {
          color: #B6C948;
          font-weight: 600;
        }
        .timeline-section {
          background: rgba(139, 174, 90, 0.1);
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
          text-align: center;
        }
        .timeline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(139, 174, 90, 0.2);
        }
        .timeline-item:last-child {
          border-bottom: none;
        }
        .timeline-week {
          color: #8BAE5A;
          font-weight: 600;
        }
        .timeline-desc {
          color: #D1D5DB;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #8bae5a 0%, #b6c948 100%);
          color: white;
          padding: 18px 36px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 174, 90, 0.4);
        }
        .exclusive-note {
          background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
          border: 1px solid #8BAE5A;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
        }
        .footer { 
          background: #232D1A; 
          color: #8BAE5A; 
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #8bae5a;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .video-thumbnail {
            height: 200px;
          }
          .play-button {
            width: 60px;
            height: 60px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">TOP TIER MEN</div>
          <h1>🎬 EXCLUSIEVE SNEAK PREVIEW</h1>
          <p>Eerste blik op het Top Tier Men Platform</p>
        </div>
        
        <div class="content">
          <div class="greeting">Beste ${name},</div>
          
          <div class="intro-text">
            Als onderdeel van onze exclusieve pre-launch community ben je een van de eerste die een kijkje mag nemen achter de schermen van het Top Tier Men platform. Deze sneak preview is alleen beschikbaar voor een selecte groep leden - jij bent een van hen.
          </div>
          
          <div class="video-section">
            <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 0 0 20px 0;">
              🎥 PLATFORM SNEAK PREVIEW VIDEO
            </h3>
            
            <div class="video-thumbnail">
              <div class="play-button">
                <div class="play-icon"></div>
              </div>
            </div>
            
            <a href="${videoUrl}" class="cta-button" style="margin: 20px 0; display: inline-block;">
              🎬 BEKIJK SNEAK PREVIEW VIDEO
            </a>
            
            <p style="color: #B6C948; font-size: 14px; margin: 15px 0 0 0;">
              ⏱️ Duurtijd: ~3 minuten | 🔒 Exclusief voor pre-launch leden
            </p>
          </div>
          
          <div style="background: rgba(139, 174, 90, 0.05); border-left: 4px solid #8BAE5A; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 20px 0;">
              🚀 WAT JE IN DE VIDEO ZIET:
            </h3>
            
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">📚</div>
                <div>
                  <div class="feature-title">Academy Modules</div>
                  <div class="feature-text">Complete trainings voor persoonlijke ontwikkeling</div>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">🍽️</div>
                <div>
                  <div class="feature-title">Voedingsplannen</div>
                  <div class="feature-text">Gepersonaliseerde voeding voor jouw doelen</div>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">💪</div>
                <div>
                  <div class="feature-title">Trainingsschema's</div>
                  <div class="feature-text">Workouts afgestemd op jouw niveau</div>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">🤝</div>
                <div>
                  <div class="feature-title">Brotherhood</div>
                  <div class="feature-text">Community van gelijkgestemde top performers</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="timeline-section">
            <h3 style="color: #B6C948; font-size: 18px; font-weight: 700; margin: 0 0 20px 0;">
              ⏰ EXCLUSIEVE TOEGANG TIMELINE
            </h3>
            
            <div class="timeline-item">
              <span class="timeline-week">✅ Week 1:</span>
              <span class="timeline-desc">Platform Preview Video</span>
            </div>
            <div class="timeline-item">
              <span class="timeline-week">📋 Week 2:</span>
              <span class="timeline-desc">Academy Content Sneak Peek</span>
            </div>
            <div class="timeline-item">
              <span class="timeline-week">🎯 Week 3:</span>
              <span class="timeline-desc">Beta Toegang Uitnodiging</span>
            </div>
            <div class="timeline-item">
              <span style="color: #B6C948; font-weight: 700;">🚀 Week 4:</span>
              <span style="color: #FFFFFF; font-weight: 600;">VOLLEDIGE PLATFORM LAUNCH</span>
            </div>
          </div>
          
          <div class="cta-section">
            <a href="${videoUrl}" class="cta-button">
              🎬 BEKIJK SNEAK PREVIEW NU
            </a>
            
            <p style="color: #8BAE5A; font-size: 14px; margin: 16px 0 0 0;">
              💡 Tip: Bekijk de video in fullscreen voor de beste ervaring
            </p>
          </div>
          
          <div class="exclusive-note">
            <p style="color: #B6C948; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
              🔒 EXCLUSIEVE PRE-LAUNCH TOEGANG
            </p>
            <p style="color: #D1D5DB; font-size: 14px; margin: 0;">
              Deze video is alleen beschikbaar voor pre-launch leden. Deel de link niet met anderen om de exclusiviteit te behouden.
            </p>
          </div>
          
          <p style="font-size: 16px; color: #D1D5DB; margin: 30px 0 0 0;">
            Heel binnenkort krijg je toegang tot het volledige platform. Stay tuned voor meer exclusieve content en updates!
          </p>
          
          <p style="font-size: 16px; color: #8BAE5A; font-weight: 600; margin: 24px 0 0 0;">
            Met vriendelijke groet,<br>
            Het Top Tier Men Team
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 16px 0;">
            © 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
          </p>
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            Vragen? Stuur een email naar <a href="mailto:platform@toptiermen.eu">platform@toptiermen.eu</a>
          </p>
          <p style="color: #6B7280; font-size: 12px; margin: 8px 0 0 0;">
            <a href="https://platform.toptiermen.eu">platform.toptiermen.eu</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
🎬 EXCLUSIEVE SNEAK PREVIEW - Eerste blik op het Top Tier Men Platform

Beste ${name},

Als onderdeel van onze exclusieve pre-launch community ben je een van de eerste die een kijkje mag nemen achter de schermen van het Top Tier Men platform. Deze sneak preview is alleen beschikbaar voor een selecte groep leden - jij bent een van hen.

🎥 PLATFORM SNEAK PREVIEW VIDEO
Bekijk de video hier: ${videoUrl}

WAT JE IN DE VIDEO ZIET:
📚 Academy Modules - Complete trainings voor persoonlijke ontwikkeling
🍽️ Voedingsplannen - Gepersonaliseerde voeding voor jouw doelen  
💪 Trainingsschema's - Workouts afgestemd op jouw niveau
🤝 Brotherhood - Community van gelijkgestemde top performers

⏰ EXCLUSIEVE TOEGANG TIMELINE:
✅ Week 1: Platform Preview Video
📋 Week 2: Academy Content Sneak Peek
🎯 Week 3: Beta Toegang Uitnodiging
🚀 Week 4: VOLLEDIGE PLATFORM LAUNCH

🔒 EXCLUSIEVE PRE-LAUNCH TOEGANG
Deze video is alleen beschikbaar voor pre-launch leden. Deel de link niet met anderen om de exclusiviteit te behouden.

Heel binnenkort krijg je toegang tot het volledige platform. Stay tuned voor meer exclusieve content en updates!

Met vriendelijke groet,
Het Top Tier Men Team

---
© 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
Website: https://platform.toptiermen.eu
Contact: platform@toptiermen.eu
  `
});

export const getWelcomeEmailTemplate = (name: string, dashboardUrl: string): EmailTemplate => ({
  subject: 'Welkom bij Top Tier Men - Jouw reis naar succes begint hier',
  html: `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welkom bij Top Tier Men</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #ffffff; 
          background-color: #181F17;
          margin: 0;
          padding: 0;
        }
        .email-container { 
          width: 100%; 
          max-width: 100%; 
          margin: 0; 
          background: #181F17;
          border-radius: 0;
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3a5f3a 100%); 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .logo {
          width: 120px;
          height: 60px;
          background: linear-gradient(45deg, #8bae5a, #b6c948);
          border-radius: 8px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
          position: relative;
          z-index: 1;
        }
        .header h1 { 
          color: white; 
          font-size: 32px; 
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .header p { 
          color: #e8f5e8; 
          font-size: 18px;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #181F17;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 20px;
        }
        .intro-text {
          font-size: 16px;
          color: #B6C948;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }
        .feature-card {
          background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #B6C948;
        }
        .feature-title {
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .feature-desc {
          color: #8BAE5A;
          font-size: 14px;
          line-height: 1.5;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
          border-radius: 12px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #8bae5a 0%, #b6c948 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(139, 174, 90, 0.3);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 174, 90, 0.4);
        }
        .footer { 
          background: #232D1A; 
          color: #8BAE5A; 
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #8bae5a;
          text-decoration: none;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #8bae5a;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .header h1 {
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">TOP TIER MEN</div>
          <h1>Welkom bij Top Tier Men</h1>
          <p>Jouw reis naar excellentie begint nu</p>
        </div>
        
        <div class="content">
          <div class="greeting">Beste ${name},</div>
          
          <div class="intro-text">
            We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers. 
            Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke transformatie.
          </div>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-title">De Broederschap</div>
              <div class="feature-desc">Word onderdeel van een exclusieve community van gelijkgestemden die elkaar naar succes duwen</div>
            </div>
            <div class="feature-card">
              <div class="feature-title">Wekelijkse Video Calls</div>
              <div class="feature-desc">Elke week evalueren we samen je voortgang met alle broeders</div>
            </div>
            <div class="feature-card">
              <div class="feature-title">Persoonlijke Transformatie</div>
              <div class="feature-desc">Ontwikkel jezelf tot een echte Top Tier Man</div>
            </div>
            <div class="feature-card">
              <div class="feature-title">Bewezen Methoden</div>
              <div class="feature-desc">Strategieën die al honderden mensen naar succes hebben geleid</div>
            </div>
          </div>
          
          <div class="cta-section">
            <h3 style="margin-bottom: 20px; color: #ffffff;">Klaar om te beginnen?</h3>
            <a href="${dashboardUrl}" class="cta-button">Ga naar je Dashboard</a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #232D1A; border-radius: 8px;">
            <h4 style="color: #ffffff; margin-bottom: 15px;">Wat je de komende 6 maanden kunt verwachten:</h4>
            <div style="display: grid; gap: 15px;">
              <div>
                <strong style="color: #B6C948;">Maand 1-2: Foundation</strong>
                <ul style="margin-left: 20px; margin-top: 5px; color: #8BAE5A;">
                  <li>Toegang tot alle academy modules en training content</li>
                  <li>Persoonlijke voedingsplannen en trainingsschema's</li>
                  <li>Introductie in de broederschap community</li>
                </ul>
              </div>
              <div>
                <strong style="color: #B6C948;">Maand 3-4: Growth</strong>
                <ul style="margin-left: 20px; margin-top: 5px; color: #8BAE5A;">
                  <li>Diepgaande coaching sessies</li>
                  <li>Community challenges en accountability</li>
                  <li>Wekelijkse evaluaties en voortgang tracking</li>
                </ul>
              </div>
              <div>
                <strong style="color: #B6C948;">Maand 5-6: Mastery</strong>
                <ul style="margin-left: 20px; margin-top: 5px; color: #8BAE5A;">
                  <li>Advanced strategieën en technieken</li>
                  <li>Leadership development</li>
                  <li>Mentorship programma's</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Met vriendelijke groet,<br><strong>Het Top Tier Men Team</strong></p>
          <div class="social-links">
            <a href="#">Website</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            Als je vragen hebt, neem contact op via <a href="mailto:support@toptiermen.com">support@toptiermen.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Welkom bij Top Tier Men - Jouw reis naar succes begint hier
    
    Beste ${name},
    
    We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers. 
    Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke transformatie.
    
    Wat maakt Top Tier Men uniek?
    
    - De Broederschap: Word onderdeel van een exclusieve community van gelijkgestemden die elkaar naar succes duwen
    - Wekelijkse Video Calls: Elke week evalueren we samen je voortgang met alle broeders
    - Persoonlijke Transformatie: Ontwikkel jezelf tot een echte Top Tier Man
    - Bewezen Methoden: Strategieën die al honderden mensen naar succes hebben geleid
    - 24/7 Brotherhood Support: Altijd toegang tot je broeders en coaches
    
    Wat je de komende 6 maanden kunt verwachten:
    
    Maand 1-2: Foundation
    - Toegang tot alle academy modules en training content
    - Persoonlijke voedingsplannen en trainingsschema's
    - Introductie in de broederschap community
    - Eerste wekelijkse video call met alle broeders
    
    Maand 3-4: Growth
    - Diepgaande coaching sessies
    - Community challenges en accountability
    - Wekelijkse evaluaties en voortgang tracking
    - Netwerken met gelijkgestemden
    
    Maand 5-6: Mastery
    - Advanced strategieën en technieken
    - Leadership development
    - Mentorship programma's
    
    Ga naar je dashboard: ${dashboardUrl}
    
    Met vriendelijke groet,
    Het Top Tier Men Team
    
    Website: https://toptiermen.com
    Support: support@toptiermen.com
  `
});

export const getOnboardingReminderTemplate = (name: string, dashboardUrl: string): EmailTemplate => ({
  subject: 'Voltooi je profiel - Je mist belangrijke stappen naar succes',
  html: `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Voltooi je profiel - Top Tier Men</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2c3e50; 
          background-color: #f8f9fa;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .logo {
          width: 120px;
          height: 60px;
          background: linear-gradient(45deg, #8bae5a, #b6c948);
          border-radius: 8px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
          position: relative;
          z-index: 1;
        }
        .header h1 { 
          color: white; 
          font-size: 28px; 
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .header p { 
          color: #ffeaea; 
          font-size: 16px;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .intro-text {
          font-size: 16px;
          color: #5a6c7d;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .steps-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 30px;
          border-radius: 12px;
          margin: 30px 0;
        }
        .step {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #e74c3c;
        }
        .step-number {
          background: #e74c3c;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 15px;
          flex-shrink: 0;
        }
        .step-content h4 {
          color: #2c3e50;
          margin-bottom: 5px;
          font-size: 16px;
        }
        .step-content p {
          color: #6c757d;
          font-size: 14px;
          margin: 0;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }
        .footer { 
          background: #2c3e50; 
          color: #bdc3c7; 
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #8bae5a;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 20px;
          }
          .content {
            padding: 20px;
          }
          .step {
            flex-direction: column;
            text-align: center;
          }
          .step-number {
            margin-right: 0;
            margin-bottom: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">TOP TIER MEN</div>
          <h1>Voltooi je profiel</h1>
          <p>Je mist belangrijke stappen naar succes</p>
        </div>
        
        <div class="content">
          <div class="greeting">Beste ${name},</div>
          
          <div class="intro-text">
            We hebben gemerkt dat je profiel nog niet volledig is ingevuld. Om je de beste ervaring te kunnen bieden 
            en je reis naar excellentie te optimaliseren, hebben we je volledige profiel nodig.
          </div>
          
          <div class="steps-container">
            <h3 style="color: #2c3e50; margin-bottom: 20px; text-align: center;">Voltooi deze belangrijke stappen:</h3>
            
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Persoonlijke Doelen</h4>
                <p>Stel je hoofddoel in en definieer wat succes voor jou betekent</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Fitness Niveau</h4>
                <p>Help ons je trainingsschema te personaliseren</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Voedingsvoorkeuren</h4>
                <p>Krijg een voedingsplan dat bij jouw levensstijl past</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Community Introductie</h4>
                <p>Maak kennis met je broeders en start je eerste missie</p>
              </div>
            </div>
          </div>
          
          <div class="cta-section">
            <h3 style="margin-bottom: 20px; color: #2c3e50;">Klaar om je profiel te voltooien?</h3>
            <p style="color: #6c757d; margin-bottom: 20px;">Het duurt slechts 5 minuten en maakt een wereld van verschil</p>
            <a href="${dashboardUrl}" class="cta-button">Voltooi mijn profiel</a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
            <h4 style="color: #856404; margin-bottom: 10px;">Waarom is dit belangrijk?</h4>
            <p style="color: #856404; font-size: 14px; margin: 0;">
              Een volledig profiel helpt ons om je persoonlijke doelen te begrijpen, je trainingsschema te optimaliseren 
              en je te verbinden met de juiste broeders in de community. Zonder deze informatie mis je waardevolle 
              personalisatie en coaching.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Met vriendelijke groet,<br><strong>Het Top Tier Men Team</strong></p>
          <p style="margin-top: 20px; font-size: 12px;">
            Als je vragen hebt, neem contact op via <a href="mailto:support@toptiermen.com">support@toptiermen.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Voltooi je profiel - Je mist belangrijke stappen naar succes
    
    Beste ${name},
    
    We hebben gemerkt dat je profiel nog niet volledig is ingevuld. Om je de beste ervaring te kunnen bieden 
    en je reis naar excellentie te optimaliseren, hebben we je volledige profiel nodig.
    
    Voltooi deze belangrijke stappen:
    
    1. Persoonlijke Doelen
       Stel je hoofddoel in en definieer wat succes voor jou betekent
    
    2. Fitness Niveau
       Help ons je trainingsschema te personaliseren
    
    3. Voedingsvoorkeuren
       Krijg een voedingsplan dat bij jouw levensstijl past
    
    4. Community Introductie
       Maak kennis met je broeders en start je eerste missie
    
    Waarom is dit belangrijk?
    Een volledig profiel helpt ons om je persoonlijke doelen te begrijpen, je trainingsschema te optimaliseren 
    en je te verbinden met de juiste broeders in de community. Zonder deze informatie mis je waardevolle 
    personalisatie en coaching.
    
    Voltooi je profiel: ${dashboardUrl}
    
    Met vriendelijke groet,
    Het Top Tier Men Team
    
    Support: support@toptiermen.com
  `
});

export const getMarketingEmailTemplate = (name: string, subject: string, content: string, ctaText: string, ctaUrl: string): EmailTemplate => ({
  subject: subject,
  html: `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #ffffff; 
          background-color: #181F17;
          margin: 0;
          padding: 0;
        }
        .email-container { 
          width: 100%; 
          max-width: 100%; 
          margin: 0; 
          background: #181F17;
          border-radius: 0;
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3a5f3a 100%); 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .logo {
          width: 120px;
          height: 60px;
          background: linear-gradient(45deg, #8bae5a, #b6c948);
          border-radius: 8px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
          position: relative;
          z-index: 1;
        }
        .header h1 { 
          color: white; 
          font-size: 28px; 
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .header p { 
          color: #e8f5e8; 
          font-size: 16px;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #181F17;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 20px;
        }
        .intro-text {
          font-size: 16px;
          color: #B6C948;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
          border-radius: 12px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #8bae5a 0%, #b6c948 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(139, 174, 90, 0.3);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 174, 90, 0.4);
        }
        .footer { 
          background: #232D1A; 
          color: #8BAE5A; 
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #8bae5a;
          text-decoration: none;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #8bae5a;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 20px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">TOP TIER MEN</div>
          <h1>Top Tier Men</h1>
          <p>Excellence in every aspect of life</p>
        </div>
        
        <div class="content">
          <div class="greeting">Beste ${name},</div>
          
          <div class="intro-text">
            ${content}
          </div>
          
          <div class="cta-section">
            <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
          </div>
        </div>
        
        <div class="footer">
          <p>Met vriendelijke groet,<br><strong>Het Top Tier Men Team</strong></p>
          <div class="social-links">
            <a href="https://platform.toptiermen.eu">Website</a> | <a href="#">Instagram</a> | <a href="#">LinkedIn</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            Als je vragen hebt, neem contact op via <a href="mailto:platform@toptiermen.eu">platform@toptiermen.eu</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    ${subject}
    
    Beste ${name},
    
    ${content}
    
    ${ctaText}: ${ctaUrl}
    
    Met vriendelijke groet,
    Het Top Tier Men Team
    
    Website: https://platform.toptiermen.eu
    Contact: platform@toptiermen.eu
  `
});

export const getEmailVerificationTemplate = (name: string, verificationUrl: string): EmailTemplate => ({
  subject: 'Verifieer je e-mailadres - Top Tier Men',
  html: `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifieer je e-mailadres - Top Tier Men</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #2c3e50; 
          background-color: #f8f9fa;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .logo {
          width: 120px;
          height: 60px;
          background: linear-gradient(45deg, #8bae5a, #b6c948);
          border-radius: 8px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
          position: relative;
          z-index: 1;
        }
        .header h1 { 
          color: white; 
          font-size: 28px; 
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .header p { 
          color: #e8f4fd; 
          font-size: 16px;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff;
        }
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
        }
        .intro-text {
          font-size: 16px;
          color: #5a6c7d;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .verification-box {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin: 30px 0;
          border: 2px solid #2196f3;
        }
        .verification-button {
          display: inline-block;
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
          margin: 20px 0;
        }
        .verification-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
        }
        .security-note {
          background: #fff3e0;
          border: 1px solid #ffcc02;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .security-note h4 {
          color: #e65100;
          margin-bottom: 10px;
        }
        .security-note p {
          color: #bf360c;
          font-size: 14px;
          margin: 0;
        }
        .footer { 
          background: #2c3e50; 
          color: #bdc3c7; 
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: #8bae5a;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 20px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">TOP TIER MEN</div>
          <h1>Verifieer je e-mailadres</h1>
          <p>Bevestig je account om toegang te krijgen</p>
        </div>
        
        <div class="content">
          <div class="greeting">Beste ${name},</div>
          
          <div class="intro-text">
            Bedankt voor je registratie bij Top Tier Men! Om je account te activeren en toegang te krijgen tot 
            alle functies, moet je je e-mailadres verifiëren.
          </div>
          
          <div class="verification-box">
            <h3 style="color: #1976d2; margin-bottom: 20px;">Klik op de onderstaande knop om je e-mailadres te verifiëren:</h3>
            <a href="${verificationUrl}" class="verification-button">Verifieer mijn e-mailadres</a>
            <p style="color: #5a6c7d; font-size: 14px; margin-top: 15px;">
              Of kopieer deze link naar je browser:<br>
              <a href="${verificationUrl}" style="color: #2196f3; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div class="security-note">
            <h4>Beveiligingsinformatie</h4>
            <p>
              Deze verificatielink is 24 uur geldig. Als je deze e-mail niet hebt aangevraagd, 
              kun je deze negeren. Je account wordt dan niet geactiveerd.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">Na verificatie krijg je toegang tot:</h4>
            <ul style="color: #6c757d; margin-left: 20px;">
              <li>Je persoonlijke dashboard</li>
              <li>Alle training modules en content</li>
              <li>De broederschap community</li>
              <li>Persoonlijke coaching en support</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Met vriendelijke groet,<br><strong>Het Top Tier Men Team</strong></p>
          <p style="margin-top: 20px; font-size: 12px;">
            Als je vragen hebt, neem contact op via <a href="mailto:support@toptiermen.com">support@toptiermen.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Verifieer je e-mailadres - Top Tier Men
    
    Beste ${name},
    
    Bedankt voor je registratie bij Top Tier Men! Om je account te activeren en toegang te krijgen tot 
    alle functies, moet je je e-mailadres verifiëren.
    
    Klik op de onderstaande link om je e-mailadres te verifiëren:
    ${verificationUrl}
    
    Beveiligingsinformatie:
    Deze verificatielink is 24 uur geldig. Als je deze e-mail niet hebt aangevraagd, 
    kun je deze negeren. Je account wordt dan niet geactiveerd.
    
    Na verificatie krijg je toegang tot:
    - Je persoonlijke dashboard
    - Alle training modules en content
    - De broederschap community
    - Persoonlijke coaching en support
    
    Met vriendelijke groet,
    Het Top Tier Men Team
    
    Support: support@toptiermen.com
  `
}); 