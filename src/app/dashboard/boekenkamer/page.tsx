"use client";
import { useState } from 'react';
import { FaBookOpen, FaHeadphones, FaStar, FaBookmark, FaCrown, FaFire, FaCheckCircle } from 'react-icons/fa';

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
    title: 'Can\'t Hurt Me',
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
    title: 'Man\'s Search for Meaning',
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
    <div className="min-h-screen bg-[#18122B] text-[#E1CBB3]">
      {/* Hero-sectie */}
      <div className="relative w-full h-48 md:h-64 bg-[#232042] flex flex-col justify-center items-center shadow-xl border-b-4 border-[#393053] mb-8">
        <div className="absolute left-8 top-8 flex items-center gap-2">
          <span className="text-3xl md:text-4xl font-bold text-[#E1CBB3] drop-shadow-lg">De Boekenkamer</span>
          <span className="ml-2 text-[#f0a14f] text-2xl"><FaBookOpen /></span>
        </div>
        <div className="absolute right-8 top-8">
          <span className="bg-[#232042] px-3 py-1 rounded-xl text-[#A3AED6] text-xs font-semibold border border-[#393053]">Voed je geest. Verscherp je visie.</span>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 rounded-b-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#18122B] to-transparent z-10" />
      </div>

      {/* Categorieën / Filters */}
      <div className="flex flex-wrap gap-2 md:gap-4 px-4 md:px-12 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-all ${activeCat === cat ? 'bg-gradient-to-r from-[#443C68] to-[#635985] text-white border-[#f0a14f] shadow' : 'bg-[#232042] text-[#A3AED6] border-[#393053] hover:border-[#635985]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Boekentegels */}
      <div className="px-4 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
        {books.filter(b => b.category === activeCat).length === 0 ? (
          <div className="col-span-full text-[#A3AED6] text-center py-12">Geen boeken in deze categorie.</div>
        ) : (
          books.filter(b => b.category === activeCat).map((book, i) => (
            <div key={i} className="bg-[#232042]/80 rounded-2xl shadow-xl border border-[#393053]/40 flex flex-col h-full">
              <div className="relative">
                <img src={book.cover} alt={book.title} className="w-full h-48 object-cover rounded-t-2xl" />
                <span className="absolute top-2 left-2 bg-gradient-to-r from-[#f0a14f] to-[#635985] text-xs font-bold text-[#232042] px-3 py-1 rounded shadow flex items-center gap-1">
                  {book.tag === 'Aanbevolen door Rick' && <FaStar className="text-yellow-400" />} {book.tag}
                </span>
                <button className="absolute top-2 right-2 bg-[#232042]/80 p-2 rounded-full text-[#A3AED6] hover:text-[#f0a14f] shadow"><FaBookmark /></button>
              </div>
              <div className="flex-1 flex flex-col p-4 gap-2">
                <span className="text-lg font-bold text-white">{book.title}</span>
                <span className="text-sm text-[#A3AED6]">{book.author}</span>
                <span className="text-xs text-[#E1CBB3] mb-2">{book.summary}</span>
                <div className="flex gap-2 mt-auto">
                  <button className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white text-xs font-semibold shadow flex items-center gap-1"><FaBookOpen /> Meer info</button>
                  <button className="px-3 py-1 rounded-xl bg-[#232042] text-[#f0a14f] text-xs font-semibold shadow flex items-center gap-1"><FaHeadphones /> Bestellen</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 