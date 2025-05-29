"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#18122B] text-[#E1CBB3] flex flex-col">
      {/* Hero / Intro */}
      <section className="w-full bg-[#232042] py-16 px-4 md:px-0 flex flex-col items-center shadow-xl border-b-4 border-[#393053]">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">Wat is <span className="text-[#f0a14f]">Top Tier Men EU</span> – en waarom jij erbij hoort</h1>
          <p className="text-lg md:text-xl text-[#A3AED6] mb-8">Top Tier Men EU is méér dan een platform. Het is een broederschap voor mannen die weigeren gemiddeld te zijn. Voor gasten die klaar zijn met uitstelgedrag, excuses en eindeloos scrollen – en in plaats daarvan kiezen voor richting, discipline en persoonlijke groei.</p>
          <p className="text-[#E1CBB3] mb-8">Of je nu 17 bent en op zoek bent naar houvast… of 35 en klaar bent om een leider te worden in je gezin, business of lichaam – dit platform is gebouwd voor jou.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-bold text-lg shadow hover:from-[#443C68] hover:to-[#635985] transition-all">Start nu – Log in</Link>
            <Link href="/register" className="px-8 py-4 rounded-xl bg-[#232042] text-[#f0a14f] font-bold text-lg shadow border border-[#393053] hover:bg-[#393053] transition-all">Registreer gratis</Link>
          </div>
        </div>
      </section>

      {/* Wat je krijgt */}
      <section className="w-full bg-[#18122B] py-16 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Wat je krijgt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-2">
              <span className="text-xl font-semibold text-[#f0a14f] mb-1">Mentale en fysieke structuur</span>
              <p className="text-[#A3AED6]">Dagelijkse routines, challenges en begeleiding om je hoofd en lijf te trainen. Geen zweverig gedoe – gewoon doen wat werkt.</p>
            </div>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-2">
              <span className="text-xl font-semibold text-[#f0a14f] mb-1">Een Brotherhood die je accountable houdt</span>
              <p className="text-[#A3AED6]">Sluit je aan bij mannen met dezelfde mindset. Motiveer elkaar. Daag elkaar uit. Groei samen. Hier ben je niet alleen.</p>
            </div>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-2">
              <span className="text-xl font-semibold text-[#f0a14f] mb-1">Coaching & mentorship op jouw niveau</span>
              <p className="text-[#A3AED6]">Van AI-ondersteuning tot echte mentoren: je krijgt de tools en support om te bouwen aan een sterke, zelfverzekerde en gedisciplineerde versie van jezelf.</p>
            </div>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-2">
              <span className="text-xl font-semibold text-[#f0a14f] mb-1">Badges. Rangen. Progressie.</span>
              <p className="text-[#A3AED6]">Alles wat je doet wordt zichtbaar. Je progressie wordt beloond, je doelen worden meetbaar, je discipline wordt een levensstijl.</p>
            </div>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-2 md:col-span-2">
              <span className="text-xl font-semibold text-[#f0a14f] mb-1">Toegang tot kennis die het verschil maakt</span>
              <p className="text-[#A3AED6]">In de Boekenkamer vind je de juiste boeken, podcasts en inzichten om jezelf mentaal te wapenen voor deze tijd.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Voor wie is dit platform? */}
      <section className="w-full bg-[#232042] py-16 px-4 flex flex-col items-center border-t-4 border-[#393053]">
        <div className="max-w-3xl w-full text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Voor wie is dit platform?</h2>
          <p className="text-[#A3AED6] mb-4">Voor jonge mannen die hun pad zoeken. Voor ondernemers die structuur willen. Voor vaders die een voorbeeld willen zijn. Voor elke man die niet tevreden is met &quot;goed genoeg&quot;.</p>
          <p className="text-[#E1CBB3] mb-8">Top Tier Men EU is jouw digitale strijdveld, jouw mentor, jouw team.<br />Geen excuses meer. Word de man die je diep van binnen weet dat je kunt zijn.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-bold text-lg shadow hover:from-[#443C68] hover:to-[#635985] transition-all">Start nu – Log in</Link>
            <Link href="/register" className="px-8 py-4 rounded-xl bg-[#232042] text-[#f0a14f] font-bold text-lg shadow border border-[#393053] hover:bg-[#393053] transition-all">Registreer gratis</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
