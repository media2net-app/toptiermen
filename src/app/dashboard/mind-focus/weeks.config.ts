export interface TaskOverride {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  category?: 'morning' | 'afternoon' | 'evening';
  type?: 'focus' | 'breathing' | 'assessment';
}

export interface WeekConfig {
  week: number;
  title: string;
  subtitle?: string;
  goals: string[];
  milestone?: number; // milestone week number to surface banner and badge
  badgeTitle?: string;
  tasks?: {
    low?: TaskOverride[];
    medium?: TaskOverride[];
    high?: TaskOverride[];
  };
}

export const weeksConfig: WeekConfig[] = [
  // Month 1: Foundation (Weeks 1–4)
  { week: 1, title: 'Focus Training Fundamentals', subtitle: 'Leer de basis van focus training', goals: [
    'Introductie tot focus training',
    'Ademhalingsoefeningen - dagelijks 5 min',
    'Stress assessment bijhouden' ] },
  { week: 2, title: 'Stress Release Protocols', subtitle: 'Leer stress management technieken', goals: [
    'Stress release sessies - 2x per week',
    'Focus training - 4x per week',
    'Progress tracking opzetten' ] },
  { week: 3, title: 'Sleep & Recovery', subtitle: 'Optimaliseer je slaap en herstel', goals: [
    'Sleep preparation - avondroutine opzetten',
    'Recovery sessies - 2x per week',
    'Stress management technieken toepassen' ] },
  { week: 4, title: 'Integration & Habit Building', subtitle: 'Integreer alle technieken', goals: [
    'Integratie van alle technieken',
    'Week 1-3 evaluatie uitvoeren',
    'Plan aanpassingen maken' ], milestone: 1, badgeTitle: 'Foundation Complete' },

  // Month 2: Deep Focus Foundations (Weeks 5–8)
  { week: 5, title: 'Context Switching Control', subtitle: 'Minimaliseer afleiding en wisselmomenten', goals: [
    'Maak een afleidingen-audit en verwijder 3 grootste prikkels',
    'Werkblokken plannen met duidelijke start/stop-rituelen',
    'Eerste week met 3 diepe focusblokken' ] },
  { week: 6, title: 'Aandachtsstamina', subtitle: 'Verleng je focusduur', goals: [
    'Opbouwen van 10→20→25 minuten diepe focusblokken',
    'Gebruik visuele timers en batch vergelijkbare taken',
    'Dagelijkse korte evaluatie na elk blok' ], tasks: {
      medium: [ { id: 'morning-focus', duration: 12, title: 'Ochtend Focus 12m' } ],
      high: [ { id: 'morning-focus', duration: 20, title: 'Ochtend Focus 20m' } ]
    } },
  { week: 7, title: 'Omgeving & Tools', subtitle: 'Engineer je omgeving voor focus', goals: [
    'Installeer site/app blockers en stel telefoonprotocol in',
    'Maak je fysieke werkplek focusproof',
    'Documenteer jouw persoonlijke focus stack' ] },
  { week: 8, title: 'Focus OS Review', subtitle: 'Bouw je persoonlijke Focus OS', goals: [
    'Maak een checklist voor je ideale focusdag',
    'Meet resultaten: aantal blokken en kwaliteit',
    'Plan onderhoudsritueel voor volgende maand' ], milestone: 2, badgeTitle: 'Focus Foundations' },

  // Month 3: Stress & Recovery (Weeks 9–12)
  { week: 9, title: 'Downshift Protocols', subtitle: 'NSDR en ademhaling', goals: [
    'Leer 2 downshift-protocollen (NSDR, box breathing)',
    'Implementeer 1 protocol direct na focusblok',
    'Log stressniveau voor en na oefening' ], tasks: {
      medium: [ { id: 'breathing-exercise', title: 'NSDR Light', duration: 8, category: 'evening', type: 'breathing' } ],
      high: [ { id: 'breathing-exercise', title: 'NSDR 12m', duration: 12, category: 'evening', type: 'breathing' } ]
    } },
  { week: 10, title: 'Slaap Architectuur', subtitle: 'Ankers voor diepe slaap', goals: [
    'Stel vast wind-down routine (licht, scherm, temperatuur)',
    'Gebruik consistente bedtijden en opstaantijd',
    'Meet slaapkwaliteit met simpele score' ] },
  { week: 11, title: 'Midday Reset', subtitle: 'Cortisolcurve en resets', goals: [
    'Voeg middag-reset (3–5 min) toe aan je dag',
    'Plan je koffiemomenten voor optimale focus',
    'Reflecteer: energieniveaus ochtend/middag/avond' ] },
  { week: 12, title: 'Deload & Recovery', subtitle: 'Actief herstel en onderhoud', goals: [
    'Verlaag belasting 20% en focus op techniek',
    'Plan 1 lang NSDR/adem- of natuurwandelsessie',
    'Evalueer maandresultaten en stel verbeterpunten' ], tasks: {
      low: [ { id: 'morning-focus', duration: 5, title: 'Korte Focus 5m' } ],
      medium: [ { id: 'morning-focus', duration: 8 }, { id: 'evening-reflection', title: 'Eindreflectie' } ],
    } },

  // Month 4: Cognitive Performance (Weeks 13–16)
  { week: 13, title: 'Werkgeheugen Drills', subtitle: 'Train je mentale buffercapaciteit', goals: [
    'Dagelijkse korte geheugen- of n-back-achtige oefening',
    'Koppel drill aan begin van focusblok',
    'Log effect op taken met hoge complexiteit' ] },
  { week: 14, title: 'Mentale Modellen', subtitle: 'First principles en inversie', goals: [
    'Pas 1 model toe op een belangrijk doel',
    'Schrijf je redenering en leerpunten uit',
    'Deel samenvatting met accountability partner' ] },
  { week: 15, title: 'Prioritering', subtitle: '80/20, ICE/RICE', goals: [
    'Maak een lijst met 10 taken en scoor met gekozen framework',
    'Voer top-3 taken uit in diepe focusblokken',
    'Reflecteer: output vs. inspanning' ] },
  { week: 16, title: 'Deep Work Ritueel', subtitle: 'Review en plan met ritueel', goals: [
    'Maak een vast wekelijks review- en plandocument',
    'Plan volgende week met blokken en doelen',
    'Automatiseer reminders en checklists' ], milestone: 4, badgeTitle: 'Cognitive Performance' },

  // Month 5: Mindset & Resilience (Weeks 17–20)
  { week: 17, title: 'Stoïcijnse Praktijken', subtitle: 'Amor Fati & negativiteit visualiseren', goals: [
    'Dagelijks korte stoïcijnse oefening',
    'Schrijf triggers en responsen uit',
    'Gebruik reframe bij tegenslag' ] },
  { week: 18, title: 'Identiteit & Gewoonten', subtitle: 'Word het type man dat je doelen haalt', goals: [
    'Definieer 3 identiteitsbewijzen (identity-based habits)',
    'Koppel gewoonten aan bestaande ankers',
    'Review wekelijks: wie word ik door dit te doen?' ] },
  { week: 19, title: 'Dankbaarheid met Specificiteit', subtitle: 'Bias-shift naar oplossingen', goals: [
    'Dagelijks 3 specifieke dankbaarheden met waarom',
    'Gebruik gratitude tijdens stressmoment',
    'Merk effect op humeur en productiviteit' ] },
  { week: 20, title: 'Stress Inoculation', subtitle: 'Geleidelijke blootstelling + AAR', goals: [
    'Plan 2 gecontroleerde uitdagende situaties',
    'Voer After Action Review na elke situatie',
    'Documenteer nieuwe regels/afspraken met jezelf' ], tasks: {
      medium: [ { id: 'evening-reflection', title: 'AAR Reflectie', duration: 5 } ],
      high: [ { id: 'morning-focus', title: 'Exposure Focus 15m', duration: 15 } ]
    } },

  // Month 6: Mastery & Consolidation (Weeks 21–24)
  { week: 21, title: 'Focus Playbook v1', subtitle: 'Jouw persoonlijke handleiding', goals: [
    'Schrijf je eigen playbook met beste protocollen',
    'Maak beslisbomen voor lastige situaties',
    'Koppel playbook aan dagelijkse routine' ] },
  { week: 22, title: 'Performance Metrics', subtitle: 'Input/Output KPI’s', goals: [
    'Definieer 3 input- en 3 output-metrics',
    'Maak eenvoudige weekly scorecard',
    'Evalueer en stuur bij op basis van data' ] },
  { week: 23, title: 'Relapse Preventie', subtitle: 'Voorkom terugval met plannen', goals: [
    'Identificeer top-5 terugvaltriggers',
    'Maak contingency plans per trigger',
    'Plan check-ins met accountability partner' ] },
  { week: 24, title: 'Capstone & Badge', subtitle: 'Afronding en certificering', goals: [
    'Rond capstone-challenge af',
    'Schrijf eindreflectie en leerpunten',
    'Ontvang maand 6 badge en plan onderhoud' ], milestone: 6, badgeTitle: 'Mind & Focus Mastery' },
];
