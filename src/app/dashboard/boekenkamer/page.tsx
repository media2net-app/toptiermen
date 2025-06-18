"use client";
import { useState } from 'react';
import { FaBookOpen, FaHeadphones, FaStar, FaBookmark } from 'react-icons/fa';
import Image from 'next/image';

const categories = [
  'Mindset',
  'Discipline',
  'Training & voeding',
  'Ondernemerschap',
  'Relaties & mannelijkheid',
  'Stoïcisme',
  'Audioboeken / Podcasts',
  'Book Summaries',
];

const books = [
  {
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    title: 'Atomic Habits',
    author: 'James Clear',
    summary: 'Praktisch boek over het bouwen van goede gewoontes en het doorbreken van slechte patronen.',
    tag: 'Aanbevolen door Rick',
    category: 'Discipline',
  },
  {
    cover: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=400&q=80',
    title: 'The Obstacle is the Way',
    author: 'Ryan Holiday',
    summary: 'Stoïcijnse lessen over het omzetten van tegenslag in kracht en groei.',
    tag: 'Classic',
    category: 'Stoïcisme',
  },
  {
    cover: '/books/canthurtme.jpg',
    title: 'Can&apos;t Hurt Me',
    author: 'David Goggins',
    summary: 'Het inspirerende verhaal van een Navy SEAL over mentale weerbaarheid en discipline.',
    tag: 'Nieuw toegevoegd',
    category: 'Mindset',
  },
  {
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    title: 'Start with Why',
    author: 'Simon Sinek',
    summary: 'Waarom succesvolle leiders en bedrijven altijd beginnen met hun "waarom".',
    tag: 'Aanbevolen door Rick',
    category: 'Ondernemerschap',
  },
  {
    cover: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
    title: 'Man&apos;s Search for Meaning',
    author: 'Viktor Frankl',
    summary: 'Over de kracht van zingeving, zelfs in de zwaarste omstandigheden.',
    tag: 'Classic',
    category: 'Mindset',
  },
  {
    cover: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'The Way of the Superior Man',
    author: 'David Deida',
    summary: 'Over mannelijke energie, relaties en persoonlijke groei.',
    tag: 'Aanbevolen door Rick',
    category: 'Relaties & mannelijkheid',
  },
];

export default function Boekenkamer() {
  const [activeCat, setActiveCat] = useState('Mindset');

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      {/* Hero-sectie */}
      <div className="relative w-full h-48 md:h-64 bg-[#232D1A] flex flex-col justify-center items-center shadow-xl border-b-4 border-[#3A4D23] mb-8">
        <div className="absolute left-8 top-8 flex items-center gap-2">
          <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">De Boekenkamer</span>
          <span className="ml-2 text-[#FFD700] text-2xl"><FaBookOpen /></span>
        </div>
        <div className="absolute right-8 top-8">
          <span className="bg-[#232D1A] px-3 py-1 rounded-xl text-[#8BAE5A] text-xs font-semibold border border-[#3A4D23]">Voed je geest. Verscherp je visie.</span>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 rounded-b-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#181F17] to-transparent z-10" />
      </div>

      {/* Categorieën / Filters */}
      <div className="flex flex-wrap gap-2 md:gap-4 px-4 md:px-12 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-all ${activeCat === cat ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] border-[#FFD700] shadow' : 'bg-[#232D1A] text-[#8BAE5A] border-[#3A4D23] hover:border-[#8BAE5A]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Boekentegels */}
      <div className="px-4 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
        {books.filter(b => b.category === activeCat).length === 0 ? (
          <div className="col-span-full text-[#8BAE5A] text-center py-12">Geen boeken in deze categorie.</div>
        ) : (
          books.filter(b => b.category === activeCat).map((book, i) => (
            <div key={i} className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 flex flex-col h-full">
              <div className="relative">
                <Image src={book.cover} alt={book.title} className="w-full h-48 object-cover rounded-t-2xl" width={192} height={256} />
                <span className="absolute top-2 left-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-xs font-bold text-[#181F17] px-3 py-1 rounded shadow flex items-center gap-1">
                  {book.tag === 'Aanbevolen door Rick' && <FaStar className="text-[#FFD700]" />} {book.tag}
                </span>
                <button className="absolute top-2 right-2 bg-[#232D1A]/80 p-2 rounded-full text-[#8BAE5A] hover:text-[#FFD700] shadow"><FaBookmark /></button>
              </div>
              <div className="flex-1 flex flex-col p-4 gap-2">
                <span className="text-lg font-bold text-white">{book.title}</span>
                <span className="text-sm text-[#8BAE5A]">{book.author}</span>
                <span className="text-xs text-[#E1CBB3] mb-2">{book.summary}</span>
                <div className="flex gap-2 mt-auto">
                  <button className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xs font-semibold shadow flex items-center gap-1"><FaBookOpen /> Meer info</button>
                  <button className="px-3 py-1 rounded-xl bg-[#232D1A] text-[#8BAE5A] text-xs font-semibold shadow flex items-center gap-1"><FaHeadphones /> Bestellen</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 