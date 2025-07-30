import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checking if email campaign table already exists...');

    // First, check if table already exists and has data
    const { data: existingSteps, error: checkError } = await supabaseAdmin
      .from('email_campaign_steps')
      .select('*')
      .order('step_number', { ascending: true });

    if (!checkError && existingSteps && existingSteps.length > 0) {
      console.log('✅ Email campaign table already exists with data');
      return NextResponse.json({
        success: true,
        message: 'Email campaign table already exists and is ready to use',
        status: 'completed',
        recordsFound: existingSteps.length,
        steps: existingSteps
      });
    }

    console.log('🚀 Setting up email campaign table...');

    // Create table SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.email_campaign_steps (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          step_number INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          subject VARCHAR(500) NOT NULL,
          content TEXT,
          delay_days INTEGER DEFAULT 0,
          status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
          sent_count INTEGER DEFAULT 0,
          open_rate DECIMAL(5,2) DEFAULT 0,
          click_rate DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Try direct table creation first
    const { error: directError } = await supabaseAdmin
      .from('email_campaign_steps')
      .select('id')
      .limit(1);
    
    if (directError && directError.code === '42P01') {
      // Table doesn't exist, try to create it manually
      console.log('Table does not exist, attempting manual creation...');
      
      // Since RPC doesn't work, we'll create the table structure by inserting a dummy record
      // This will trigger table creation if it doesn't exist
      const { error: insertError } = await supabaseAdmin
        .from('email_campaign_steps')
        .insert({
          step_number: 0,
          name: 'Dummy Step',
          subject: 'Dummy Subject',
          content: 'Dummy content for table creation',
          delay_days: 0,
          status: 'draft'
        });
      
      if (insertError) {
        console.error('Error creating table via insert:', insertError);
        return NextResponse.json({ 
          success: false, 
          error: 'Table creation failed. Please create manually in Supabase dashboard.',
          sql: createTableSQL
        });
      }
      
      // Delete the dummy record
      await supabaseAdmin
        .from('email_campaign_steps')
        .delete()
        .eq('step_number', 0);
    }

    console.log('✅ Table created/verified');

    // Note: RLS setup will need to be done manually in Supabase dashboard
    // since the RPC function is not available
    console.log('⚠️ RLS setup needs to be done manually in Supabase dashboard');

    // Insert default email steps
    const defaultSteps = [
      {
        step_number: 1,
        name: 'Welkom & Introductie',
        subject: '🎯 Welkom bij Toptiermen - Jouw reis naar succes begint hier',
        content: `Beste {{name}},

Welkom bij Toptiermen! 🚀

We zijn verheugd dat je interesse hebt getoond in onze exclusieve community van top performers. Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke groei.

**Wat maakt Toptiermen uniek?**

🏆 **Persoonlijke Mastery**: Ontwikkel jezelf tot de beste versie van jezelf
🤝 **Elite Community**: Word onderdeel van een selecte groep gelijkgestemden
📈 **Bewezen Methoden**: Strategieën die al honderden mensen naar succes hebben geleid
🎯 **Resultaatgericht**: Meetbare verbeteringen in alle levensgebieden
⚡ **24/7 Support**: Altijd toegang tot coaching en motivatie

**Wat je kunt verwachten:**
• Persoonlijke begeleiding van ervaren coaches
• Een community die je motiveert en ondersteunt
• Bewezen strategieën voor succes in werk, gezondheid en relaties
• Directe toegang tot alle premium features
• Exclusieve workshops en masterclasses

**Interesse niveau: {{interestLevel}}**

We hebben je geregistreerd met interesse niveau: {{interestLevel}}. Dit helpt ons om je de meest relevante informatie te sturen.

Binnenkort ontvang je meer details over hoe we jou kunnen helpen je doelen te bereiken.

Met vriendelijke groet,
Het Toptiermen Team

---
*"Succes is niet toevallig. Het is een keuze, een gewoonte, een levensstijl."*`,
        delay_days: 0,
        status: 'draft'
      },
      {
        step_number: 2,
        name: 'Waarde & Voordelen',
        subject: '💎 Ontdek de 5 geheimen van top performers',
        content: `Beste {{name}},

Hopelijk heb je onze eerste email kunnen lezen. Vandaag delen we de 5 geheimen die top performers onderscheiden van de rest.

**Het Toptiermen verschil:**

🔥 **1. Mindset Mastery**
Leer hoe succesvolle mensen denken en handelen. Ontwikkel een onstuitbare mindset die obstakels omzet in kansen.

💪 **2. Fysieke Excellentie**
Optimaliseer je lichaam voor maximale prestaties. Van voeding tot training, we geven je de tools voor fysieke superioriteit.

🎯 **3. Strategische Focus**
Leer prioriteiten stellen en je energie richten op wat écht belangrijk is. Stop met verspillen van tijd aan onbelangrijke zaken.

🤝 **4. Netwerk Effect**
Word onderdeel van een netwerk van succesvolle mensen. Je netwerk is je nettowaarde.

📊 **5. Resultaat Tracking**
Meet, analyseer en verbeter constant. Wat je meet, kun je verbeteren.

**Wat onze leden zeggen:**
*"Toptiermen heeft mijn leven veranderd. Ik ben productiever, gezonder en succesvoller dan ooit."* - Mark, CEO
*"De community alleen al is goud waard. Zoveel gelijkgestemden die elkaar ondersteunen."* - Sarah, Entrepreneur

**Interesse niveau: {{interestLevel}}**

Als {{interestLevel}} lid krijg je toegang tot:
• Exclusieve masterclasses
• Persoonlijke coaching sessies
• Premium community features
• Vroegtijdige toegang tot nieuwe content

Binnenkort ontvang je je persoonlijke inschrijflink voor de lancering op 1 september.

Met vriendelijke groet,
Het Toptiermen Team

---
*"De beste investering die je kunt doen, is in jezelf."*`,
        delay_days: 3,
        status: 'draft'
      },
      {
        step_number: 3,
        name: 'Call-to-Action',
        subject: '⏰ LAATSTE KANS: Slechts 24 uur om je in te schrijven voor 1 september',
        content: `Beste {{name}},

**⏰ WAARSCHUWING: Dit is je laatste kans!**

De lancering van Toptiermen op 1 september nadert snel, en we hebben nog slechts **24 uur** om je inschrijving te verwerken.

**Waarom NU actie ondernemen?**

🚨 **Beperkte beschikbaarheid**: Slechts 50 plekken beschikbaar
💰 **Early Bird voordelen**: 50% korting op het eerste jaar
🎁 **Exclusieve bonussen**: 
   - Persoonlijke coaching sessie (waarde €500)
   - Premium community toegang
   - Exclusieve masterclass toegang
   - 30-dagen geld-terug garantie

⚡ **Directe toegang**: Start direct met alle features
🎯 **Persoonlijke aandacht**: Garantie van 1-op-1 begeleiding

**Interesse niveau: {{interestLevel}}**

Als {{interestLevel}} lid krijg je:
• Prioriteit bij inschrijving
• Extra coaching sessies
• Vroegtijdige toegang tot nieuwe features

**🎯 ACTIE NU:**

[INSCHRIJF HIER VOOR 1 SEPTEMBER]

**Wat gebeurt er als je wacht?**
• Je mist de early bird korting
• Je komt op de wachtlijst
• Je betaalt de volledige prijs
• Je mist exclusieve bonussen

**Deze kans komt niet meer terug.**

Maak vandaag nog de beslissing die je leven kan veranderen. Duizenden mensen hebben al hun doelen bereikt met Toptiermen. Jij kunt de volgende zijn.

Met vriendelijke groet,
Het Toptiermen Team

P.S. Heb je vragen? Antwoord gewoon op deze email of bel direct: +31 6 12345678

---
*"De beste tijd om te planten was 20 jaar geleden. De tweede beste tijd is nu."*`,
        delay_days: 7,
        status: 'draft'
      }
    ];

    for (const step of defaultSteps) {
      const { error: insertError } = await supabaseAdmin
        .from('email_campaign_steps')
        .upsert(step, { onConflict: 'step_number' });

      if (insertError) {
        console.log(`⚠️ Insert warning for step ${step.step_number}:`, insertError.message);
      } else {
        console.log(`✅ Inserted/updated: Step ${step.step_number}`);
      }
    }

    // Test the table
    const { data: testData, error: testError } = await supabaseAdmin
      .from('email_campaign_steps')
      .select('*')
      .order('step_number', { ascending: true });

    if (testError) {
      console.error('❌ Test query failed:', testError);
      return NextResponse.json({ success: false, error: 'Table test failed: ' + testError.message });
    }

    console.log('🎉 Email campaign setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Email campaign table setup completed',
      recordsCreated: testData?.length || 0,
      steps: testData
    });

  } catch (error) {
    console.error('💥 Setup error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 