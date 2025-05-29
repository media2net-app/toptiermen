'use client';
import Link from 'next/link';
import Image from 'next/image';

const schemas = [
  {
    title: 'Gym Schema',
    image: '/images/gym-schema.jpg',
    description: 'Krachttraining en spieropbouw in de sportschool. Voor maximale progressie en structuur.',
    href: '/dashboard/trainingscentrum/workoutschema/gym',
  },
  {
    title: 'Outdoor Schema',
    image: '/images/outdoor-schema.jpg',
    description: 'Workouts in de buitenlucht. Focus op uithoudingsvermogen, explosiviteit en fun.',
    href: '/dashboard/trainingscentrum/workoutschema/outdoor',
  },
  {
    title: 'Bodyweight Schema',
    image: '/images/bodyweight-schema.jpg',
    description: 'Train zonder apparatuur, altijd en overal. Ideaal voor kracht, mobiliteit en discipline.',
    href: '/dashboard/trainingscentrum/workoutschema/bodyweight',
  },
];

export default function Workoutschema() {
  return (
    <div className="p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Workoutschema&apos;s</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Kies het schema dat bij jouw doelen past en start direct</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {schemas.map((schema) => (
          <Link
            key={schema.title}
            href={schema.href}
            className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#635985] focus:outline-none focus:ring-2 focus:ring-[#635985]"
          >
            <Image
              src={schema.image}
              alt={schema.title}
              width={400}
              height={160}
              className="w-full h-40 object-cover rounded-xl mb-2 shadow-lg"
            />
            <span className="text-xl font-semibold text-white mb-1">{schema.title}</span>
            <p className="text-[#A3AED6] mb-2 text-sm">{schema.description}</p>
            <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">Bekijk schema</button>
          </Link>
        ))}
      </div>
    </div>
  );
} 