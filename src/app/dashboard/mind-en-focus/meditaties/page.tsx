import ClientLayout from '../../../components/ClientLayout';
import Link from 'next/link';

export default function MeditatiesDetail() {
  return (
    <ClientLayout>
      <div className="py-8 px-4 md:px-12">
        <Link href="/dashboard/mind-en-focus" className="text-[#A3AED6] hover:underline mb-6 inline-block">← Terug naar Mind & Focus</Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Meditaties & Ademhaling</h1>
        <p className="text-[#A3AED6] text-lg mb-6">Ontdek krachtige meditaties en ademhalingstechnieken voor meer rust, focus en mentale kracht.</p>
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold text-white mb-2">Voorbeeld: 4-7-8 Ademhaling</h2>
          <p className="text-[#A3AED6] mb-4 text-sm">Deze oefening helpt je om direct meer rust te ervaren en je focus te verbeteren. Ideaal voor stressvolle momenten of als start van je dag.</p>
          <ol className="list-decimal list-inside text-[#A3AED6] text-sm mb-4 pl-2">
            <li>Adem 4 seconden rustig in door je neus.</li>
            <li>Houd je adem 7 seconden vast.</li>
            <li>Blaas in 8 seconden langzaam uit door je mond.</li>
            <li>Herhaal dit 4 tot 8 keer.</li>
          </ol>
          <div className="mt-4 text-xs text-[#A3AED6] italic">Tip: Sluit je ogen en focus op je ademhaling voor maximaal effect.</div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl">
          <div className="flex-1 bg-[#393053]/30 rounded-xl p-4 shadow border border-[#393053]/40">
            <h3 className="text-lg font-semibold text-white mb-1">Geleide Meditatie (audio)</h3>
            <div className="bg-[#232042] rounded-lg p-4 text-[#A3AED6] text-sm mb-2">[Audiofragment placeholder]</div>
            <p className="text-xs text-[#A3AED6]">Binnenkort beschikbaar: luister naar exclusieve meditaties van Rick.</p>
          </div>
          <div className="flex-1 bg-[#393053]/30 rounded-xl p-4 shadow border border-[#393053]/40">
            <h3 className="text-lg font-semibold text-white mb-1">Meer oefeningen</h3>
            <ul className="list-disc list-inside text-[#A3AED6] text-sm">
              <li>Bodyscan meditatie</li>
              <li>Box breathing</li>
              <li>Visualisatie voor focus</li>
            </ul>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 