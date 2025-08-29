import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stepId, action } = body;

    if (!stepId || !action) {
      return NextResponse.json({ 
        error: 'Step ID and action are required' 
      }, { status: 400 });
    }

    if (action === 'send_test') {
      // Send test email to admin
      return await sendTestEmail(stepId);
    } else if (action === 'send_to_leads') {
      // Send email to all active leads
      return await sendToLeads(stepId);
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "send_test" or "send_to_leads"' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in send-email-campaign:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function sendTestEmail(stepId: string) {
  try {
    // Hardcoded email steps for now
    const hardcodedSteps = {
      '1': {
        name: 'Welkom & Introductie',
        subject: '🎯 Welkom bij Top Tier Men - Jouw reis naar excellentie begint hier',
        content: `Beste {{name}},

Je hebt de eerste stap gezet naar een leven van excellentie. Als onderdeel van onze exclusieve broederschap krijg je toegang tot bewezen strategieën, persoonlijke voedings- en trainingsplannen en een community van gelijkgestemde mannen die elkaar naar succes duwen.

🎯 **EXCLUSIEVE PRE-LAUNCH TOEGANG**

Je behoort tot de exclusieve lijst van pre-launch leden! In de komende dagen ontvang je sneak previews van het platform, exclusieve content en diepgaande inzichten in wat Top Tier Men voor jou kan betekenen. Deze previews zijn alleen beschikbaar voor een selecte groep - jij bent een van hen.

⏰ **Nog ${Math.ceil((new Date('2025-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dagen tot de officiële launch!** (10 september 2025)

**Wat is Top Tier Men?**

Top Tier Men is een exclusieve community van mannen die streven naar excellentie in alle aspecten van hun leven. Onder leiding van Rick Cuijpers, oud marinier en ervaren coach, bieden we een complete aanpak voor fysieke, mentale en professionele groei.

**Wat maakt ons uniek?**

• **Bewezen Methoden**: Gebaseerd op militaire discipline en real-world ervaring
• **Persoonlijke Aanpak**: Individuele voedings- en trainingsplannen op maat
• **Community Support**: Een broederschap van gelijkgestemde mannen
• **Holistische Groei**: Focus op lichaam, geest en carrière

**Platform Features:**

🎓 **Academy (7 Modules, 36 Lessen)**
• Module 1: Testosteron
• Module 2: Discipline & Identiteit
• Module 3: Fysieke Dominantie
• Module 4: Mentale Kracht/Weerbaarheid
• Module 5: Business and Finance
• Module 6: Brotherhood
• Module 7: Voeding & Gezondheid

🤝 **Brotherhood Community** - Exclusieve community van gelijkgestemden
🏆 **Badges & Achievements** - Verdien badges voor je prestaties
🔥 **Dagelijkse Challenges** - Uitdagende opdrachten elke dag
📚 **Digitale Boekenkamer** - Curated library met topboeken
🍖 **Op Maat Voedingsplannen** - Gepersonaliseerde voeding
💪 **Op Maat Trainingsschema's** - Persoonlijke workout plans
📊 **Progress Tracking** - Houd je vooruitgang bij
📱 **Mobile App** - Toegang overal en altijd
🎯 **Goal Setting & Planning** - Doelgericht werken aan groei
⚡ **Accountability System** - Elkaar scherp houden
📅 **Event Calendar** - Brotherhood events en meetups
🧠 **Mindset Training** - Mentale training en ontwikkeling

**Wat je kunt verwachten:**

In de komende dagen ontvang je:
• Exclusieve sneak previews van het platform
• Diepgaande inzichten in onze methoden
• Persoonlijke verhalen van community leden
• Voorbereidingen voor de officiële launch

**Klaar om te beginnen?**

Je reis naar excellentie begint nu. Blijf alert op je inbox voor de volgende updates.

Met broederschap,
Rick Cuijpers
Oud marinier & Founder Top Tier Men

---
*Dit is een exclusieve pre-launch email. Je bent een van de weinigen die toegang heeft tot deze content.*`
      },
      '2': {
        name: 'Waarde & Voordelen',
        subject: '💎 Ontdek hoe Toptiermen jouw leven kan veranderen',
        content: `Beste {{name}},

Hopelijk heb je onze eerste email kunnen lezen. Vandaag willen we je meer vertellen over de concrete voordelen van Toptiermen.

**Wat maakt ons uniek:**

🎯 **Persoonlijke coaching van ervaren professionals**
Onze coaches hebben honderden mensen geholpen hun doelen te bereiken. Ze begrijpen de uitdagingen die je tegenkomt en weten hoe je ze kunt overwinnen.

🏆 **Een community van gelijkgestemden**
Je wordt onderdeel van een selecte groep mannen die net als jij streven naar excellentie. Deze community motiveert, inspireert en ondersteunt je op je reis.

📊 **Bewezen resultaten**
Onze methoden zijn getest en bewezen effectief. Gemiddeld zien onze leden binnen 3 maanden:
• 40% meer energie en focus
• 60% betere prestaties op werk
• 80% verbetering in relaties
• 100% meer zelfvertrouwen

⚡ **24/7 toegang tot support**
Je staat er niet alleen voor. Ons team is altijd beschikbaar om je vragen te beantwoorden en je te motiveren.

**Wat je krijgt:**

✅ **Persoonlijk actieplan** - Op maat gemaakt voor jouw doelen
✅ **Dagelijkse coaching** - Motivatie en begeleiding wanneer je het nodig hebt
✅ **Exclusieve workshops** - Maandelijkse live sessies met experts
✅ **Community toegang** - Connect met gelijkgestemden
✅ **Premium content** - Toegang tot alle trainingsmateriaal
✅ **Resultaat tracking** - Meet je voortgang en vier je successen

**Interesse niveau: {{interestLevel}}**

Gezien je interesse niveau ({{interestLevel}}), denken we dat je perfect past in onze community.

Binnenkort ontvang je meer informatie over hoe je kunt beginnen.

Met vriendelijke groet,
Het Toptiermen Team

---
*"De beste investering die je kunt doen, is in jezelf."*`
      },
      '3': {
        name: 'Call-to-Action',
        subject: '⏰ Beperkte tijd: Schrijf je nu in voor 10 september',
        content: `Beste {{name}},

Dit is je laatste kans om je aan te melden voor Toptiermen!

**Waarom nu actie ondernemen?**

🚨 **Beperkte beschikbaarheid**: We accepteren slechts 50 nieuwe leden per maand
        💰 **Speciale aanbieding**: 50% korting op je eerste maand (alleen geldig tot 10 september)
🎯 **Directe start**: Begin vandaag nog met je persoonlijke groei
🏆 **Exclusieve toegang**: Word onderdeel van onze elite community

**Wat je mist als je niet nu actie onderneemt:**

❌ Toegang tot persoonlijke coaching
❌ Deelname aan exclusieve workshops
❌ Community van gelijkgestemden
❌ Bewezen strategieën voor succes
❌ 24/7 support en motivatie

**Wat je krijgt als je nu besluit:**

✅ **Directe toegang** tot alle premium features
✅ **Persoonlijk actieplan** binnen 24 uur
✅ **Eerste coaching sessie** binnen 48 uur
✅ **Community toegang** direct na aanmelding
✅ **50% korting** op je eerste maand

**Interesse niveau: {{interestLevel}}**

Gezien je interesse niveau ({{interestLevel}}), weten we dat je serieus bent over persoonlijke groei. Laat deze kans niet voorbij gaan!

**Klik hier om je nu aan te melden:**
[INSCHRIJVEN VOOR TOPTIERMEN]

**Of bel ons direct:**
📞 +31 6 12345678

        **Deadline: 10 september 2025**

Na deze datum sluiten we de inschrijvingen voor de komende maand.

Met vriendelijke groet,
Het Toptiermen Team

---
*"De beste tijd om te planten was 20 jaar geleden. De tweede beste tijd is nu."*`
      }
    };

    const step = hardcodedSteps[stepId as keyof typeof hardcodedSteps];

    if (!step) {
      return NextResponse.json({ 
        error: 'Email step not found' 
      }, { status: 404 });
    }

    // For now, just return success (email sending will be implemented later)
    console.log('Test email would be sent for step:', step.name);
    
    return NextResponse.json({
      success: true,
      message: `Test email prepared for step: ${step.name}`,
      step: {
        name: step.name,
        subject: step.subject,
        content: step.content
      }
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email' 
    }, { status: 500 });
  }
}

async function sendToLeads(stepId: string) {
  try {
    // Hardcoded email steps for now
    const hardcodedSteps = {
      '1': {
        name: 'Welkom & Introductie',
        subject: '🎯 Welkom bij Toptiermen - Jouw reis naar succes begint hier'
      },
      '2': {
        name: 'Waarde & Voordelen',
        subject: '💎 Ontdek hoe Toptiermen jouw leven kan veranderen'
      },
      '3': {
        name: 'Call-to-Action',
        subject: '⏰ Beperkte tijd: Schrijf je nu in voor 10 september'
      }
    };

    const step = hardcodedSteps[stepId as keyof typeof hardcodedSteps];

    if (!step) {
      return NextResponse.json({ 
        error: 'Email step not found' 
      }, { status: 404 });
    }

    // Get all active leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('prelaunch_emails')
      .select('*')
      .eq('status', 'active');

    if (leadsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch leads' 
      }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active leads found to send emails to',
        sentCount: 0
      });
    }

    // For now, just return success (email sending will be implemented later)
    console.log(`Would send email to ${leads.length} leads for step: ${step.name}`);
    
    return NextResponse.json({
      success: true,
      message: `Email campaign prepared for ${leads.length} leads`,
      step: {
        name: step.name,
        subject: step.subject
      },
      sentCount: leads.length,
      leads: leads.map(lead => ({
        email: lead.email,
        name: lead.name || 'Lead',
        interestLevel: lead.interest_level || 'Medium'
      }))
    });

  } catch (error) {
    console.error('Error sending to leads:', error);
    return NextResponse.json({ 
      error: 'Failed to send emails to leads' 
    }, { status: 500 });
  }
} 