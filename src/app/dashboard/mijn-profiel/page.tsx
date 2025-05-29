import ClientLayout from '../../components/ClientLayout';

const profiel = [
  {
    title: "Voortgang per module",
    description: "Bekijk je voortgang in elke module in één overzicht.",
    cta: "Bekijk voortgang",
  },
  {
    title: "Uploads & Resultaten",
    description: "Upload foto's, houd gewichtsverlies en trainingsresultaten bij.",
    cta: "Bekijk uploads",
  },
  {
    title: "Instellingen",
    description: "Stel je doelen, beschikbaarheid en voorkeur thema in.",
    cta: "Wijzig instellingen",
  },
];

export default function MijnProfiel() {
  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Profiel</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Persoonlijke voortgang, uploads en instellingen</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {profiel.map((item) => (
          <div key={item.title} className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start">
            <span className="text-xl font-semibold text-white mb-2">{item.title}</span>
            <p className="text-[#A3AED6] mb-4 text-sm">{item.description}</p>
            <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">{item.cta}</button>
          </div>
        ))}
      </div>
    </ClientLayout>
  );
} 