export interface TestUserEmailData {
  name: string;
  email: string;
  testUserId: string;
  feedbackUrl: string;
  platformUrl: string;
  loginUrl: string;
  password?: string; // Add password field
}

export const getTestUserWelcomeEmailTemplate = (data: TestUserEmailData) => {
  const { name, email, testUserId, feedbackUrl, platformUrl, loginUrl, password = 'TestPassword123!' } = data;
  
  return {
    subject: '🎯 Welkom bij Top Tier Men - Je bent een Test User!',
    html: `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welkom bij Top Tier Men - Test User</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: 'Figtree', sans-serif; 
                  line-height: 1.6; 
                  color: #F3F3F1; 
                  background-color: #141A15;
                  margin: 0;
                  padding: 0;
              }
              
              .email-container { 
                  width: 100%; 
                  max-width: 100%; 
                  margin: 0; 
                  background: #141A15;
                  border-radius: 0;
                  overflow: hidden;
              }
              
              .header { 
                  background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3a5f3a 100%); 
                  padding: 50px 30px;
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
                  width: 140px;
                  height: 70px;
                  background: linear-gradient(45deg, #8bae5a, #b6c948);
                  border-radius: 12px;
                  margin: 0 auto 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 800;
                  font-size: 18px;
                  color: #141A15;
                  position: relative;
                  z-index: 1;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .header h1 { 
                  color: white; 
                  font-size: 42px; 
                  font-weight: 700;
                  margin-bottom: 15px;
                  position: relative;
                  z-index: 1;
                  text-align: center;
              }
              
              .header .subtitle { 
                  color: #8BAE5A; 
                  font-size: 22px;
                  font-weight: 600;
                  position: relative;
                  z-index: 1;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .content { 
                  padding: 50px 40px; 
                  background: #141A15;
              }
              
              .greeting {
                  font-size: 28px;
                  font-weight: 700;
                  color: #F3F3F1;
                  margin-bottom: 25px;
                  text-align: center;
              }
              
              .test-user-badge {
                  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                  color: #141A15;
                  padding: 15px 30px;
                  border-radius: 25px;
                  font-weight: 800;
                  font-size: 18px;
                  text-align: center;
                  margin: 30px auto;
                  display: inline-block;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
              }
              
              .intro-section {
                  background: linear-gradient(135deg, #1F2D17 0%, #2A3D1A 100%);
                  padding: 40px;
                  border-radius: 15px;
                  margin: 30px 0;
                  border: 2px solid #8BAE5A;
                  text-align: center;
              }
              
              .intro-text {
                  font-size: 18px;
                  color: #B6C948;
                  margin-bottom: 20px;
                  line-height: 1.8;
                  font-weight: 500;
              }
              
              .test-info-section {
                  background: rgba(255, 215, 0, 0.1);
                  padding: 40px;
                  border-radius: 15px;
                  margin: 40px 0;
                  border-left: 5px solid #FFD700;
              }
              
              .test-info-title {
                  font-size: 24px;
                  font-weight: 700;
                  color: #F3F3F1;
                  margin-bottom: 30px;
                  text-align: center;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .test-info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  margin: 30px 0;
              }
              
              .test-info-card {
                  background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
                  padding: 25px;
                  border-radius: 12px;
                  border-left: 4px solid #FFD700;
                  text-align: center;
              }
              
              .test-info-emoji {
                  font-size: 32px;
                  margin-bottom: 15px;
                  display: block;
              }
              
              .test-info-title {
                  font-weight: 700;
                  color: #F3F3F1;
                  margin-bottom: 10px;
                  font-size: 16px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              
              .test-info-desc {
                  color: #8BAE5A;
                  font-size: 14px;
                  line-height: 1.6;
                  font-weight: 500;
              }
              
              .cta-section {
                  text-align: center;
                  margin: 50px 0;
                  padding: 40px;
                  background: #141A15;
                  border-radius: 15px;
                  border: 3px solid #8BAE5A;
              }
              
              .cta-title {
                  font-size: 26px;
                  font-weight: 800;
                  color: #F3F3F1;
                  margin-bottom: 20px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .cta-subtitle {
                  font-size: 16px;
                  color: #B6C948;
                  margin-bottom: 30px;
                  font-weight: 500;
              }
              
              .cta-button {
                  display: inline-block;
                  background: #8BAE5A;
                  color: #141A15;
                  padding: 20px 40px;
                  text-decoration: none;
                  border-radius: 12px;
                  font-weight: 800;
                  font-size: 18px;
                  transition: all 0.3s ease;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  border: 3px solid #8BAE5A;
                  box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3);
                  margin: 10px;
              }
              
              .cta-button:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 12px 35px rgba(139, 174, 90, 0.4);
                  background: #B6C948;
              }
              
              .feedback-section {
                  background: rgba(139, 174, 90, 0.1);
                  padding: 40px;
                  border-radius: 15px;
                  margin: 40px 0;
                  border-left: 5px solid #8BAE5A;
              }
              
              .feedback-title {
                  font-size: 24px;
                  font-weight: 700;
                  color: #F3F3F1;
                  margin-bottom: 30px;
                  text-align: center;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .footer { 
                  background: linear-gradient(135deg, #232D1A 0%, #1F2D17 100%); 
                  color: #8BAE5A; 
                  padding: 40px;
                  text-align: center;
                  font-size: 14px;
                  font-weight: 500;
              }
              
              .footer a {
                  color: #B6C948;
                  text-decoration: none;
                  font-weight: 600;
              }
              
              .footer-signature {
                  font-size: 16px;
                  font-weight: 700;
                  color: #F3F3F1;
                  margin-bottom: 20px;
              }
              
              .login-credentials {
                  background: rgba(255, 215, 0, 0.15);
                  padding: 30px;
                  border-radius: 15px;
                  margin: 40px 0;
                  border: 2px solid #FFD700;
                  text-align: center;
              }
              
              .login-credentials h3 {
                  color: #F3F3F1;
                  font-size: 20px;
                  font-weight: 700;
                  margin-bottom: 20px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              
              .credential-item {
                  background: rgba(139, 174, 90, 0.1);
                  padding: 15px;
                  border-radius: 8px;
                  margin: 10px 0;
                  border-left: 4px solid #8BAE5A;
              }
              
              .credential-label {
                  color: #B6C948;
                  font-weight: 600;
                  font-size: 14px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-bottom: 5px;
              }
              
              .credential-value {
                  color: #F3F3F1;
                  font-weight: 700;
                  font-size: 16px;
                  font-family: 'Courier New', monospace;
              }
              
              @media (max-width: 600px) {
                  .test-info-grid {
                      grid-template-columns: 1fr;
                  }
                  .header h1 {
                      font-size: 28px;
                  }
                  .content {
                      padding: 30px 20px;
                  }
                  .intro-section,
                  .test-info-section,
                  .cta-section,
                  .feedback-section {
                      padding: 25px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 200px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
                  <h1>Welkom bij de Broederschap</h1>
                  <div class="subtitle">Je bent een Test User!</div>
              </div>
              
              <div class="content">
                  <div class="greeting">Beste ${name},</div>
                  
                  <div class="test-user-badge">
                      🧪 TEST USER - EXCLUSIEVE TOEGANG
                  </div>
                  
                  <div class="intro-section">
                      <div class="intro-text">
                          Je hebt de eerste stap gezet naar een leven van <strong>excellentie</strong>. Als <strong>Test User</strong> van het Top Tier Men platform krijg je exclusieve toegang tot alle features voordat ze live gaan.
                      </div>
                      <div class="intro-text">
                          🎯 <strong>EXCLUSIEVE TEST USER TOEGANG</strong><br>
                          Je behoort tot een selecte groep test users die het platform mogen uitproberen en feedback mogen geven. Jouw input is cruciaal voor het perfectioneren van het platform voor de officiële launch.
                      </div>
                  </div>
                  
                  <div class="test-info-section">
                      <div class="test-info-title">Wat betekent Test User zijn?</div>
                      <div class="test-info-grid">
                          <div class="test-info-card">
                              <div class="test-info-emoji">🔍</div>
                              <div class="test-info-title">Vroege Toegang</div>
                              <div class="test-info-desc">Test alle features voordat ze live gaan</div>
                          </div>
                          <div class="test-info-card">
                              <div class="test-info-emoji">💬</div>
                              <div class="test-info-title">Feedback Geven</div>
                              <div class="test-info-desc">Help het platform te verbeteren</div>
                          </div>
                          <div class="test-info-card">
                              <div class="test-info-emoji">🎁</div>
                              <div class="test-info-title">Exclusieve Voordelen</div>
                              <div class="test-info-desc">Speciale perks voor test users</div>
                          </div>
                          <div class="test-info-card">
                              <div class="test-info-emoji">🚀</div>
                              <div class="test-info-title">Vooraanstaande Rol</div>
                              <div class="test-info-desc">Onderdeel van de ontwikkeling</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="login-credentials">
                      <h3>🔐 Jouw Login Gegevens</h3>
                      <div class="credential-item">
                          <div class="credential-label">Email</div>
                          <div class="credential-value">${email}</div>
                      </div>
                      <div class="credential-item">
                          <div class="credential-label">Wachtwoord</div>
                          <div class="credential-value">${password}</div>
                      </div>
                  </div>
                  
                  <div class="cta-section">
                      <div class="cta-title">Klaar om te beginnen?</div>
                      <div class="cta-subtitle">
                          Log in op het platform en begin met het verkennen van alle features
                      </div>
                      <a href="${loginUrl}" class="cta-button">
                          🚀 Platform Betreden
                      </a>
                  </div>
                  
                  <div class="feedback-section">
                      <div class="feedback-title">Jouw Feedback is Cruciaal</div>
                      <div class="intro-text">
                          Als test user is jouw feedback onmisbaar voor het perfectioneren van het platform. 
                          Deel je ervaringen, suggesties en eventuele problemen die je tegenkomt.
                      </div>
                      <div style="text-align: center; margin-top: 30px;">
                          <a href="${feedbackUrl}" class="cta-button" style="background: #FFD700; color: #141A15; border-color: #FFD700;">
                              💬 Feedback Geven
                          </a>
                      </div>
                  </div>
                  
                  <div style="background: rgba(139, 174, 90, 0.1); padding: 30px; border-radius: 12px; margin: 40px 0; border-left: 4px solid #8BAE5A;">
                      <h3 style="color: #F3F3F1; margin-bottom: 20px; text-align: center;">Test User Details</h3>
                      <div style="color: #8BAE5A; font-size: 14px; line-height: 1.8;">
                          <p><strong>Test User ID:</strong> ${testUserId}</p>
                          <p><strong>Email:</strong> ${email}</p>
                          <p><strong>Status:</strong> Actief Test User</p>
                          <p><strong>Toegang:</strong> Volledige platform toegang</p>
                      </div>
                  </div>
              </div>
              
              <div class="footer">
                  <div class="footer-signature">Top Tier Men</div>
                  <p>Exclusieve Test User Email</p>
                  <p>Jouw feedback helpt ons het platform te perfectioneren</p>
                  <p>
                      <a href="${platformUrl}">Platform</a> | 
                      <a href="${feedbackUrl}">Feedback</a> | 
                      <a href="mailto:support@toptiermen.eu">Support</a>
                  </p>
                  <p style="margin-top: 20px; font-size: 12px; color: #8BAE5A;">
                      Dit is een exclusieve test user email. Je bent een van de weinigen die toegang heeft tot deze content.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `,
    text: `
      Welkom bij Top Tier Men - Je bent een Test User!
      
      Beste ${name},
      
      🧪 TEST USER - EXCLUSIEVE TOEGANG
      
      Je hebt de eerste stap gezet naar een leven van excellentie. Als Test User van het Top Tier Men platform krijg je exclusieve toegang tot alle features voordat ze live gaan.
      
      🎯 EXCLUSIEVE TEST USER TOEGANG
      Je behoort tot een selecte groep test users die het platform mogen uitproberen en feedback mogen geven. Jouw input is cruciaal voor het perfectioneren van het platform voor de officiële launch.
      
      Wat betekent Test User zijn?
      - 🔍 Vroege Toegang: Test alle features voordat ze live gaan
      - 💬 Feedback Geven: Help het platform te verbeteren
      - 🎁 Exclusieve Voordelen: Speciale perks voor test users
      - 🚀 Vooraanstaande Rol: Onderdeel van de ontwikkeling
      
      🔐 Jouw Login Gegevens:
      Email: ${email}
      Wachtwoord: ${password}
      
      Klaar om te beginnen?
      Log in op het platform en begin met het verkennen van alle features
      
      Platform Betreden: ${loginUrl}
      
      Jouw Feedback is Cruciaal
      Als test user is jouw feedback onmisbaar voor het perfectioneren van het platform. 
      Deel je ervaringen, suggesties en eventuele problemen die je tegenkomt.
      
      Feedback Geven: ${feedbackUrl}
      
      Test User Details:
      - Test User ID: ${testUserId}
      - Email: ${email}
      - Status: Actief Test User
      - Toegang: Volledige platform toegang
      
      Met broederschap,
      Het Top Tier Men Team
      
      ---
      Dit is een exclusieve test user email. Je bent een van de weinigen die toegang heeft tot deze content.
    `
  };
};
