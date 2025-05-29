'use client';
import { useState } from 'react';
import Image from 'next/image';

const chapters = [
  {
    title: 'Introductie tot Discipline',
    completed: true,
    image: '/images/discipline-intro.jpg',
    content: 'Discipline is de basis van elke succesvolle man. In deze introductie leer je waarom discipline belangrijk is en hoe je het kunt ontwikkelen.'
  },
  {
    title: 'Identiteit Bouwen',
    completed: true,
    image: '/images/identiteit-bouwen.jpg',
    content: 'Je identiteit vormt je gedrag. Ontdek hoe je een sterke identiteit opbouwt die je helpt je doelen te bereiken.'
  },
  {
    title: 'Dagelijkse Gewoontes',
    completed: false,
    image: '/images/dagelijkse-gewoontes.jpg',
    content: 'Gewoontes bepalen je succes. Leer hoe je krachtige dagelijkse routines creëert en volhoudt.'
  },
  {
    title: 'Zelfreflectie & Groei',
    completed: false,
    image: '/images/zelfreflectie-groei.jpg',
    content: 'Zelfreflectie is essentieel voor groei. In dit hoofdstuk leer je hoe je jezelf evalueert en bijstuurt.'
  },
];

export default function DisciplineIdentiteit() {
  const [selected, setSelected] = useState(0);
  const progress = Math.round((chapters.filter(c => c.completed).length / chapters.length) * 100);

  return (
    <div className="p-6 md:p-12 bg-[#111111]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#C49C48] mb-2 drop-shadow-lg">Discipline & Identiteit</h1>
      <p className="text-[#E5C97B] text-lg mb-8">Jouw e-learning module: bouw aan een onwankelbare identiteit en discipline</p>
      {/* Algemene voortgang */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#C49C48] font-semibold">Voortgang</span>
          <span className="text-[#C49C48] font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-[#C49C48]/20 rounded-full">
          <div className="h-2 bg-gradient-to-r from-[#C49C48] to-[#B8860B] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      {/* Hoofdstukken overzicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {chapters.map((ch, i) => (
          <button
            key={ch.title}
            onClick={() => setSelected(i)}
            className={`flex items-center gap-4 p-4 rounded-2xl border border-[#C49C48]/40 shadow-xl bg-[#181818]/80 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C49C48] ${selected === i ? 'ring-2 ring-[#C49C48]' : ''}`}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${ch.completed ? 'bg-gradient-to-br from-[#C49C48] to-[#B8860B] text-black' : 'bg-[#C49C48]/20 text-[#C49C48]'}`}>
              {ch.completed ? '✓' : i + 1}
            </span>
            <span className={`text-left ${ch.completed ? 'text-[#C49C48]' : 'text-[#E5C97B]'}`}>{ch.title}</span>
          </button>
        ))}
      </div>
      {/* Content-gedeelte */}
      <div className="flex flex-col md:flex-row gap-8 items-start bg-[#181818]/80 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6">
        <Image
          src={chapters[selected].image}
          alt={chapters[selected].title}
          width={256}
          height={160}
          className="w-full md:w-64 h-40 object-cover rounded-xl mb-4 md:mb-0 shadow-lg"
        />
        <div>
          <h2 className="text-2xl font-bold text-[#C49C48] mb-2">{chapters[selected].title}</h2>
          <p className="text-[#E5C97B] text-lg">{chapters[selected].content}</p>
        </div>
      </div>
    </div>
  );
} 