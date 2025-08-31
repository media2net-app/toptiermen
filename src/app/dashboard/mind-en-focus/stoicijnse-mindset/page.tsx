import ClientLayout from '../../../components/ClientLayout';
import Link from 'next/link';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function StoicijnseMindsetDetail() {
  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        <Link href="/dashboard/mind-en-focus" className="text-[#A3AED6] hover:underline mb-6 inline-block">← Terug naar Mind & Focus</Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Stoïcijnse Mindset</h1>
        <p className="text-[#A3AED6] text-lg mb-6 max-w-2xl">Leer hoe je met stoïcijnse principes, koude training en dopamine discipline mentaal sterker wordt en meer rust ervaart.</p>
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold text-white mb-2">Wat is Stoïcisme?</h2>
          <p className="text-[#A3AED6] mb-4 text-sm">Stoïcisme is een filosofie die draait om controle over je gedachten, emoties en reacties. Je leert accepteren wat je niet kunt veranderen en focussen op je eigen acties en mindset.</p>
          <ul className="list-disc list-inside text-[#A3AED6] text-sm mb-4 pl-2">
            <li>Focus op wat je wél kunt controleren</li>
            <li>Accepteer tegenslagen als groeimomenten</li>
            <li>Blijf kalm onder druk</li>
          </ul>
        </div>
        <div className="flex flex-col md:flex-row gap-6 max-w-4xl mb-8">
          <div className="flex-1 bg-[#393053]/30 rounded-xl p-4 shadow border border-[#393053]/40 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-white mb-1">Voorbeeldvideo: Stoïcijnse Mindset</h3>
            <div className="bg-[#232042] rounded-lg p-4 text-[#A3AED6] text-sm mb-2">[Video placeholder]</div>
            <p className="text-xs text-[#A3AED6]">Binnenkort beschikbaar: inspirerende video&apos;s van Rick over stoïcisme en mentale kracht.</p>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-[#393053]/30 rounded-xl p-4 shadow border border-[#393053]/40">
              <h3 className="text-lg font-semibold text-white mb-1">Cold Exposure</h3>
              <p className="text-[#A3AED6] text-sm">Koude training (zoals koude douches of ijsbaden) helpt je om discipline te ontwikkelen, je zenuwstelsel te versterken en stress te leren beheersen.</p>
            </div>
            <div className="bg-[#393053]/30 rounded-xl p-4 shadow border border-[#393053]/40">
              <h3 className="text-lg font-semibold text-white mb-1">Dopamine Discipline</h3>
              <p className="text-[#A3AED6] text-sm">Door bewust om te gaan met prikkels (zoals social media, junkfood en entertainment) train je je brein om meer voldoening te halen uit echte groei en prestaties.</p>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 