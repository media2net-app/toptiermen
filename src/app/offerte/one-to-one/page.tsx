'use client';

import React from 'react';
import Link from 'next/link';

function Currency({ value }: { value: number }) {
  return <span>€ {value.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>;
}

export default function OneToOneOfferPage() {
  const rate = 85; // uurtarief in EUR

  // Schattingen (uren) - Totaal 12 uur, max 1.5 uur per taak
  const estimates = {
    intakeForm: 1.5,
    notesBasic: 1,
    notesAdvanced: 1,
    sessionsPlanning: 1,
    sessionsHistory: 1,
    goalsBasic: 1,
    goalsTracking: 1,
    coachOverview: 1.5,
    nutritionBasic: 1,
    nutritionAdvanced: 1,
    trainingBasic: 0.5,
    challengesBasic: 0.5,
  } as const;

  const lineItems = [
    { title: 'Intake formulier - Cliënt vult persoonlijke gegevens in', hours: estimates.intakeForm },
    { title: 'Notities basis - Eenvoudige berichten uitwisselen', hours: estimates.notesBasic },
    { title: 'Notities geavanceerd - Rich text en bestanden delen', hours: estimates.notesAdvanced },
    { title: 'Afspraken plannen - Sessies inplannen en beheren', hours: estimates.sessionsPlanning },
    { title: 'Afspraken geschiedenis - Overzicht van eerdere sessies', hours: estimates.sessionsHistory },
    { title: 'Doelen basis - Doelen stellen en beschrijven', hours: estimates.goalsBasic },
    { title: 'Doelen tracking - Voortgang bijhouden en updates', hours: estimates.goalsTracking },
    { title: 'Coach overzicht - Dashboard met alle cliënten', hours: estimates.coachOverview },
    { title: 'Voedingsplannen basis - Eenvoudige plannen maken', hours: estimates.nutritionBasic },
    { title: 'Voedingsplannen geavanceerd - Gedetailleerde macro\'s en recepten', hours: estimates.nutritionAdvanced },
    { title: 'Trainingsplannen - Persoonlijke trainingsschema\'s maken', hours: estimates.trainingBasic },
    { title: 'Uitdagingen - Persoonlijke challenges instellen', hours: estimates.challengesBasic },
  ].map((i) => ({ ...i, subtotal: i.hours * rate }));

  const subtotal = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const vat = Math.round(subtotal * 0.21);
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print\:block { display: block !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto p-6 sm:p-10">
        <header className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#8BAE5A]">Digitale Offerte — 1:1 Coaching Omgeving</h1>
            <p className="text-gray-300 mt-2">Top Tier Men — maatwerk functionaliteiten voor 1:1 cliënten en coaches</p>
          </div>
          <div className="text-sm text-gray-400 text-right">
            <div>Datum: {new Date().toLocaleDateString('nl-NL')}</div>
            <div>Geldig tot: 30 dagen</div>
          </div>
        </header>

        <section className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Wat is dit precies?</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            We bouwen een persoonlijke coaching omgeving binnen je bestaande website. Cliënten vullen eerst een 
            intake formulier in, waarna ze een eigen ruimte krijgen waar ze kunnen chatten met hun coach, 
            afspraken plannen, doelen stellen en hun voortgang bijhouden. Coaches krijgen een overzicht van al 
            hun cliënten en kunnen alles beheren. Dit is een complete 1:1 coaching oplossing in 12 uur werk.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Wat wordt er gebouwd (12 uur totaal)</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Intake formulier: 1.5 uur (Cliënt vult persoonlijke gegevens in)</li>
              <li>- Notities systeem: 2 uur (Basis + geavanceerde berichten uitwisselen)</li>
              <li>- Afspraken systeem: 2 uur (Plannen + geschiedenis bekijken)</li>
              <li>- Doelen systeem: 2 uur (Doelen stellen + voortgang bijhouden)</li>
              <li>- Coach overzicht: 1.5 uur (Dashboard met alle cliënten)</li>
              <li>- Voedingsplannen: 2 uur (Basis + geavanceerde plannen maken)</li>
              <li>- Trainingsplannen: 0.5 uur (Persoonlijke trainingsschema's maken)</li>
              <li>- Uitdagingen: 0.5 uur (Persoonlijke challenges instellen)</li>
            </ul>
          </div>
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Techniek</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Next.js 14 (App Router), TypeScript, Tailwind</li>
              <li>- Supabase (Postgres, RLS)</li>
              <li>- Tabellen: `one_to_one_notes`, `one_to_one_sessions`, `one_to_one_goals`, `one_to_one_attachments`</li>
              <li>- RLS: cliënt ziet eigen data, coach alleen toegewezen cliënten</li>
            </ul>
          </div>
        </section>


        <section className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-[#3A4D23] flex items-center justify-between">
            <h3 className="text-lg font-semibold">Investering</h3>
            <div className="text-sm text-gray-400">Uurtarief: <Currency value={rate} /> / uur</div>
          </div>
          <div className="divide-y divide-[#3A4D23]">
            {lineItems.map((item) => (
              <div key={item.title} className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 text-sm items-center">
                <div className="text-gray-200">{item.title}</div>
                <div className="text-gray-400">{item.hours} uur</div>
                <div className="text-white font-medium"><Currency value={item.subtotal} /></div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-[#3A4D23]">
            <div className="grid grid-cols-[1fr_auto] gap-4 text-sm">
              <div className="text-right text-gray-400">Subtotaal</div>
              <div className="text-right text-white"><Currency value={subtotal} /></div>
              <div className="text-right text-gray-400">BTW (21%)</div>
              <div className="text-right text-white"><Currency value={vat} /></div>
              <div className="text-right font-semibold">Totaal</div>
              <div className="text-right font-semibold text-[#8BAE5A]"><Currency value={total} /></div>
            </div>
          </div>
        </section>

        <section className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2">Planning</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>- Doorlooptijd: 2 dagen (12 uur totaal)</li>
            <li>- Oplevering in iteraties, demo per onderdeel</li>
            <li>- Acceptatie & livegang na akkoord</li>
          </ul>
        </section>

        <footer className="flex items-center justify-between gap-4">
          <Link href="/dashboard-admin" className="no-print px-4 py-2 rounded-lg bg-[#232D1A] border border-[#3A4D23] text-[#8BAE5A] hover:bg-[#2B3820]">
            Terug naar Admin
          </Link>
          <button
            className="no-print px-4 py-2 rounded-lg bg-[#8BAE5A] text-black font-semibold hover:bg-[#A6C97B]"
            onClick={() => window.print()}
          >
            Print / Exporteer PDF
          </button>
        </footer>
      </div>
    </div>
  );
}
