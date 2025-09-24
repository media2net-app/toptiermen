const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendUpdateEmail() {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Top Tier Men" <${process.env.SMTP_FROM || 'noreply@toptiermen.eu'}>`,
    to: 'chielvanderzee@gmail.com',
    subject: 'Platform gereed voor gebruik!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #B6C948, #3A4D23); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #B6C948; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { background: #B6C948; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Platform Update</h1>
            <h2>Top Tier Men Platform is gereed!</h2>
          </div>
          
          <div class="content">
            <p>Beste Chiel,</p>
            
            <p>We zijn sinds de laatste update hard achter de schermen bezig geweest het platform 100% werkend te maken. We kunnen nu eindelijk melden dat het platform gereed is voor gebruik.</p>
            
            <div class="highlight">
              <h3>🎯 Wat is er verbeterd:</h3>
              <ul>
                <li>✅ Volledig werkende login/authenticatie systeem</li>
                <li>✅ Database schemas voor alle modules (Brotherhood, Producten, Workouts, Mind & Focus)</li>
                <li>✅ Mobile-responsive design voor alle pagina's</li>
                <li>✅ Uitgebreide Academy ebooks (21,000+ karakters per les)</li>
                <li>✅ CDN video optimalisatie voor snellere laadtijden</li>
                <li>✅ Admin dashboard functionaliteit</li>
                <li>✅ Affiliate marketing systeem</li>
                <li>✅ Boekenkamer met Amazon affiliate links</li>
              </ul>
            </div>
            
            <h3>🔧 Technische verbeteringen:</h3>
            <ul>
              <li><strong>Database:</strong> Alle SQL schemas zijn geïmplementeerd en getest</li>
              <li><strong>Performance:</strong> Login systeem geoptimaliseerd voor snellere authenticatie</li>
              <li><strong>Mobile:</strong> Alle pagina's zijn volledig responsive</li>
              <li><strong>Content:</strong> Academy ebooks uitgebreid met uitgebreide samenvattingen</li>
              <li><strong>Video:</strong> CDN integratie voor betere video streaming</li>
            </ul>
            
            <div class="highlight">
              <h3>📱 Platform Status:</h3>
              <p><strong>Live URL:</strong> <a href="https://platform.toptiermen.eu" style="color: white;">https://platform.toptiermen.eu</a></p>
              <p><strong>Status:</strong> ✅ Volledig operationeel</p>
              <p><strong>Versie:</strong> 3.1 Improved</p>
            </div>
            
            <h3>🎯 Volgende stappen:</h3>
            <p>Het platform is nu klaar voor gebruik door alle leden. Alle core functionaliteiten zijn werkend en getest.</p>
            
            <div class="highlight">
              <p><strong>⚠️ Belangrijk:</strong> Ervaar je toch nog problemen tijdens het gebruik van het platform, mail dan rechtstreeks naar <a href="mailto:rick@toptiermen.eu" style="color: white;">rick@toptiermen.eu</a></p>
            </div>
            
            <p>Binnen nu en 2 weken staat onze eerste groeps video call gepland, meer info hierover volgt. In de eerste call gaan we kennismaken met elkaar, en is er ruimte om functies en wensen te bespreken van het platform.</p>
            
            <p>Met vriendelijke groet,<br>
            <strong>Top Tier Men Team</strong></p>
          </div>
          
          <div class="footer">
            <p>Top Tier Men Platform | Versie 3.1 Improved</p>
            <p>Deze mail is alleen verstuurd naar chielvanderzee@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📧 Versturen van platform update email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email succesvol verstuurd:', info.messageId);
    console.log('📬 Ontvanger: chielvanderzee@gmail.com');
    console.log('📋 Onderwerp: Platform gereed voor gebruik!');
  } catch (error) {
    console.error('❌ Fout bij versturen email:', error);
  }
}

sendUpdateEmail();
