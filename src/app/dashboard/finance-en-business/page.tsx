'use client';
import ClientLayout from '../../components/ClientLayout';
import Link from 'next/link';

const finance = [
  {
    title: "Geldmanagement & Investeren",
    description: "Leer alles over geld, investeren en financiële vrijheid. Praktische tips en strategieën.",
    cta: "Bekijk tips",
    href: "/dashboard/finance-en-business/geldmanagement"
  },
  {
    title: "Templates & Tools",
    description: "Handige templates voor begroting, sales scripts en structuur.",
    cta: "Download templates",
  },
  {
    title: "Ondernemen met Discipline",
    description: "Video's van Rick over ondernemen, discipline en succes.",
    cta: "Bekijk video's",
  },
];

export default function FinanceBusiness() {
  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Finance & Business</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Groei financieel en zakelijk met structuur en discipline</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {finance.map((item) =>
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