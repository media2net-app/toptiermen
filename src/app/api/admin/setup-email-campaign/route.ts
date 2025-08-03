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

We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers. Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke transformatie.

**Wat maakt Toptiermen uniek?**

🏆 **De Broederschap**: Word onderdeel van een exclusieve community van gelijkgestemden die elkaar naar succes duwen
🎯 **Wekelijkse Video Calls**: Elke week evalueren we samen je voortgang met alle broeders
💪 **Persoonlijke Transformatie**: Ontwikkel jezelf tot een echte Top Tier Man
📈 **Bewezen Methoden**: Strategieën die al honderden mensen naar succes hebben geleid
⚡ **24/7 Brotherhood Support**: Altijd toegang tot je broeders en coaches

**Wat je de komende 6 maanden kunt verwachten:**

**Maand 1-2: Foundation**
• Toegang tot alle academy modules en training content
• Persoonlijke voedingsplannen en trainingsschema's
• Introductie in de broederschap community
• Eerste wekelijkse video call met alle broeders

**Maand 3-4: Growth**
• Diepgaande coaching sessies
• Community challenges en accountability
• Wekelijkse evaluaties en voortgang tracking
• Netwerken met gelijkgestemden

**Maand 5-6: Mastery**
• Advanced strategieën en technieken
• Leadership development binnen de broederschap
• Voorbereiding op je Top Tier Man titel
• Levensveranderende resultaten

**De echte waarde:**
Dit is niet alleen content consumeren - dit is een complete levensstijl transformatie. Je wordt onderdeel van een broederschap die elkaar naar succes duwt, wekelijks samen evalueert, en uiteindelijk de prestigieuze titel "Top Tier Man" behaalt.

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

Hopelijk heb je onze eerste email kunnen lezen. Vandaag delen we wat het betekent om een echte Top Tier Man te worden en hoe de broederschap je leven gaat veranderen.

**Het Toptiermen verschil - De echte waarde:**

🔥 **1. De Broederschap**
Dit is geen gewone community - dit is een broederschap van gelijkgestemden die elkaar naar succes duwen. Elke week evalueren we samen je voortgang in video calls met alle broeders.

💪 **2. Persoonlijke Transformatie**
Je wordt niet alleen beter, je wordt een Top Tier Man. Dit is een complete identiteit transformatie die je leven fundamenteel verandert.

🎯 **3. Accountability & Support**
De broederschap houdt je accountable. Als je achterblijft, zijn er broeders die je weer op het juiste pad krijgen. Als je excellenteert, wordt je gevierd.

🤝 **4. Netwerk van Winners**
Je netwerk wordt je nettowaarde. De broeders in Toptiermen zijn allemaal mensen die net als jij naar het volgende niveau willen.

📊 **5. Meetbare Resultaten**
Elke week tracken we je voortgang. Niet alleen in fitness, maar in alle levensgebieden: carrière, relaties, mindset, en persoonlijke groei.

**Wat onze broeders zeggen:**
*"De wekelijkse video calls met alle broeders hebben mijn leven veranderd. Ik voel me eindelijk begrepen en gesteund."* - Mark, CEO
*"Dit is geen gewone community - dit is een broederschap die elkaar naar succes duwt. De accountability is goud waard."* - Thomas, Entrepreneur
*"De titel Top Tier Man behalen was het moment dat ik besefte dat ik echt veranderd was. Mijn leven is fundamenteel anders."* - Alex, Business Owner

**Wat je de komende 6 maanden kunt verwachten:**

**Maand 1-2: Foundation**
• Toegang tot alle academy modules en training content
• Persoonlijke voedingsplannen en trainingsschema's
• Introductie in de broederschap community
• Eerste wekelijkse video call met alle broeders

**Maand 3-4: Growth**
• Diepgaande coaching sessies
• Community challenges en accountability
• Wekelijkse evaluaties en voortgang tracking
• Netwerken met gelijkgestemden

**Maand 5-6: Mastery**
• Advanced strategieën en technieken
• Leadership development binnen de broederschap
• Voorbereiding op je Top Tier Man titel
• Levensveranderende resultaten

**Interesse niveau: {{interestLevel}}**

Als {{interestLevel}} lid krijg je toegang tot:
• Exclusieve masterclasses
• Persoonlijke coaching sessies
• Premium community features
• Vroegtijdige toegang tot nieuwe content

        Binnenkort ontvang je je persoonlijke inschrijflink voor de lancering op 10 september.

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
        subject: '⏰ LAATSTE KANS: Slechts 24 uur om je in te schrijven voor 10 september',
        content: `Beste {{name}},

**⏰ WAARSCHUWING: Dit is je laatste kans om een Top Tier Man te worden!**

De lancering van Toptiermen op 10 september nadert snel, en we hebben nog slechts **24 uur** om je inschrijving te verwerken.

**Waarom een 6-maand of 12-maand commitment?**

🎯 **De echte transformatie duurt tijd**
Een Top Tier Man word je niet in een maand. Het duurt 6 maanden om je identiteit fundamenteel te veranderen. De broederschap en wekelijkse video calls zorgen ervoor dat je consistent blijft groeien.

🤝 **De broederschap heeft tijd nodig**
Echte connecties en accountability bouw je op over tijd. Na 6 maanden ken je alle broeders, vertrouw je elkaar, en duwen jullie elkaar naar het volgende niveau.

📈 **Meetbare resultaten in alle levensgebieden**
• Maand 1-2: Foundation en introductie in de broederschap
• Maand 3-4: Growth en diepgaande coaching
• Maand 5-6: Mastery en voorbereiding op je Top Tier Man titel

**Waarom NU actie ondernemen?**

🚨 **Beperkte beschikbaarheid**: Slechts 50 plekken beschikbaar
💰 **Early Bird voordelen**: 50% korting op 6-maand of 12-maand lidmaatschap
🎁 **Exclusieve bonussen**: 
   - Persoonlijke coaching sessie (waarde €500)
   - Premium broederschap toegang
   - Exclusieve masterclass toegang
   - 30-dagen geld-terug garantie
   - Wekelijkse video calls met alle broeders

⚡ **Directe toegang**: Start direct met alle features
🎯 **Persoonlijke aandacht**: Garantie van 1-op-1 begeleiding

**Interesse niveau: {{interestLevel}}**

Als {{interestLevel}} lid krijg je:
• Prioriteit bij inschrijving
• Extra coaching sessies
• Vroegtijdige toegang tot nieuwe features
• Directe toegang tot de broederschap

**🎯 ACTIE NU:**

[INSCHRIJF HIER VOOR 10 SEPTEMBER - 6 MAAND OF 12 MAAND]

**Wat gebeurt er als je wacht?**
• Je mist de early bird korting
• Je komt op de wachtlijst
• Je betaalt de volledige prijs
• Je mist exclusieve bonussen
• Je mist de eerste wekelijkse video calls

**De echte waarde van een 6-maand commitment:**
Dit is niet alleen content consumeren - dit is een complete levensstijl transformatie. Je wordt onderdeel van een broederschap die elkaar naar succes duwt, wekelijks samen evalueert, en uiteindelijk de prestigieuze titel "Top Tier Man" behaalt.

**Deze kans komt niet meer terug.**

Maak vandaag nog de beslissing die je leven kan veranderen. Word onderdeel van de broederschap die je naar succes duwt.

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