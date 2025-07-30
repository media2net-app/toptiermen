-- Create email_campaign_steps table
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

-- Enable RLS
ALTER TABLE public.email_campaign_steps ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can manage email campaign steps" ON public.email_campaign_steps
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert default email steps
INSERT INTO public.email_campaign_steps (step_number, name, subject, content, delay_days, status) VALUES
(1, 'Welkom & Introductie', 'Welkom bij Toptiermen - Jouw reis naar succes begint hier', 
'Hallo {{name}},

Welkom bij Toptiermen! We zijn verheugd dat je interesse hebt getoond in onze community van top performers.

Wat je kunt verwachten:
• Persoonlijke begeleiding naar je doelen
• Een community van gelijkgestemden
• Bewezen strategieën voor succes
• 24/7 support en motivatie

We sturen je binnenkort meer informatie over hoe we jou kunnen helpen je doelen te bereiken.

Met vriendelijke groet,
Het Toptiermen Team', 0, 'draft'),

(2, 'Waarde & Voordelen', 'Ontdek hoe Toptiermen jouw leven kan veranderen', 
'Hallo {{name}},

Hopelijk heb je onze eerste email kunnen lezen. Vandaag willen we je meer vertellen over de concrete voordelen van Toptiermen.

Wat maakt ons uniek:
• Persoonlijke coaching van ervaren professionals
• Bewezen methoden die echt werken
• Een community die je motiveert en ondersteunt
• Resultaten die je kunt meten en voelen

Veel van onze leden hebben al hun doelen bereikt. Jij kunt de volgende zijn!

Binnenkort hoor je van ons over hoe je kunt beginnen.

Met vriendelijke groet,
Het Toptiermen Team', 3, 'draft'),

(3, 'Call-to-Action', 'Beperkte tijd: Schrijf je nu in voor 1 september', 
'Hallo {{name}},

Dit is je laatste kans om je aan te melden voor de lancering van Toptiermen op 1 september!

Waarom nu actie ondernemen:
• Beperkte beschikbaarheid - slechts 50 plekken beschikbaar
• Early bird voordelen en exclusieve bonussen
• Garantie van persoonlijke aandacht
• Directe toegang tot alle features

Klik hier om je nu aan te melden: [INSCHRIJFLINK]

Deze kans komt niet meer terug. Maak vandaag nog de beslissing die je leven kan veranderen.

Met vriendelijke groet,
Het Toptiermen Team

P.S. Heb je vragen? Antwoord gewoon op deze email!', 7, 'draft')
ON CONFLICT (step_number) DO NOTHING; 