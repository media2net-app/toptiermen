import ClientLayout from '../../components/ClientLayout';
import Link from 'next/link';

const mindFocus = [
  {
    title: "Meditaties & Ademhaling",
    description: "Geleide meditaties, ademhalingstechnieken en focusroutines voor mentale kracht.",
    cta: "Start sessie",
    href: "/dashboard/mind-en-focus/meditaties"
  },
  {
    title: "Stoïcijnse Mindset",
    description: "Video's en uitleg over stoïcisme, cold exposure en dopamine discipline.",
    cta: "Bekijk video's",
    href: "/dashboard/mind-en-focus/stoicijnse-mindset"
  },
];

export default function MindFocus() {
  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mind & Focus</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Mentale weerbaarheid, focus en discipline</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mindFocus.map((item) =>
          item.href ? (
            <Link
              key={item.title}
              href={item.href}
              className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#635985] focus:outline-none focus:ring-2 focus:ring-[#635985]"
            >
              <span className="text-xl font-semibold text-white mb-2">{item.title}</span>
              <p className="text-[#A3AED6] mb-4 text-sm">{item.description}</p>
              <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">{item.cta}</button>
            </Link>
          ) : (
            <div key={item.title} className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start">
              <span className="text-xl font-semibold text-white mb-2">{item.title}</span>
              <p className="text-[#A3AED6] mb-4 text-sm">{item.description}</p>
              <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">{item.cta}</button>
            </div>
          )
        )}
      </div>
    </ClientLayout>
  );
} 