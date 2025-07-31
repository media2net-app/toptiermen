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
*"Succes is niet toevallig. Het is een keuze, een gewoonte, een levensstijl."*`
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
        subject: '⏰ Beperkte tijd: Schrijf je nu in voor 1 september',
        content: `Beste {{name}},

Dit is je laatste kans om je aan te melden voor Toptiermen!

**Waarom nu actie ondernemen?**

🚨 **Beperkte beschikbaarheid**: We accepteren slechts 50 nieuwe leden per maand
💰 **Speciale aanbieding**: 50% korting op je eerste maand (alleen geldig tot 1 september)
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

**Deadline: 1 september 2025**

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
        subject: '⏰ Beperkte tijd: Schrijf je nu in voor 1 september'
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