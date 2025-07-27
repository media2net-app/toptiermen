"use client";
import { useState } from 'react';
import { FaBookOpen, FaHeadphones, FaStar, FaBookmark, FaFilter, FaSearch, FaTimes, FaCalendarAlt, FaUser, FaGlobe } from 'react-icons/fa';
import Image from 'next/image';

interface Book {
  cover: string;
  title: string;
  author: string;
  summary: string;
  tag: string;
  category: string;
  rating: number;
  pages: number;
  year: number;
}

const categories = [
  { id: 'mindset', label: 'Mindset', icon: '🧠', description: 'Mentale groei' },
  { id: 'discipline', label: 'Discipline', icon: '⚡', description: 'Zelfbeheersing' },
  { id: 'training', label: 'Training & voeding', icon: '💪', description: 'Fysieke groei' },
  { id: 'ondernemerschap', label: 'Ondernemerschap', icon: '🚀', description: 'Business' },
  { id: 'relaties', label: 'Relaties & mannelijkheid', icon: '👑', description: 'Mannelijkheid' },
  { id: 'stoicisme', label: 'Stoïcisme', icon: '🏛️', description: 'Filosofie' },
  { id: 'audio', label: 'Audioboeken / Podcasts', icon: '🎧', description: 'Luisteren' },
  { id: 'summaries', label: 'Book Summaries', icon: '📝', description: 'Samenvattingen' },
];

const books: Book[] = [
  {
    cover: 'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg',
    title: 'Atomic Habits',
    author: 'James Clear',
    summary: 'Praktisch boek over het bouwen van goede gewoontes en het doorbreken van slechte patronen.',
    tag: 'Aanbevolen door Rick',
    category: 'discipline',
    rating: 4.8,
    pages: 320,
    year: 2018,
  },
  {
    cover: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg',
    title: 'The Obstacle is the Way',
    author: 'Ryan Holiday',
    summary: 'Stoïcijnse lessen over het omzetten van tegenslag in kracht en groei.',
    tag: 'Classic',
    category: 'stoicisme',
    rating: 4.6,
    pages: 256,
    year: 2014,
  },
  {
    cover: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg',
    title: 'Can\'t Hurt Me',
    author: 'David Goggins',
    summary: 'Het inspirerende verhaal van een Navy SEAL over mentale weerbaarheid en discipline.',
    tag: 'Nieuw toegevoegd',
    category: 'mindset',
    rating: 4.9,
    pages: 364,
    year: 2018,
  },
  {
    cover: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg',
    title: 'Start with Why',
    author: 'Simon Sinek',
    summary: 'Waarom succesvolle leiders en bedrijven altijd beginnen met hun "waarom".',
    tag: 'Aanbevolen door Rick',
    category: 'ondernemerschap',
    rating: 4.5,
    pages: 256,
    year: 2009,
  },
  {
    cover: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg',
    title: 'Man\'s Search for Meaning',
    author: 'Viktor Frankl',
    summary: 'Over de kracht van zingeving, zelfs in de zwaarste omstandigheden.',
    tag: 'Classic',
    category: 'mindset',
    rating: 4.7,
    pages: 184,
    year: 1946,
  },
  {
    cover: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg',
    title: 'The Way of the Superior Man',
    author: 'David Deida',
    summary: 'Over mannelijke energie, relaties en persoonlijke groei.',
    tag: 'Aanbevolen door Rick',
    category: 'relaties',
    rating: 4.4,
    pages: 272,
    year: 1997,
  },
];

export default function Boekenkamer() {
  const [activeCat, setActiveCat] = useState('mindset');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const filteredBooks = books.filter(book => 
    book.category === activeCat && 
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openBookModal = (book: Book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              De Boekenkamer
            </h1>
            <p className="text-base md:text-lg text-[#8BAE5A] font-medium max-w-2xl mx-auto leading-relaxed">
              Voed je geest. Verscherp je visie. Ontdek de kennis die je leven transformeert.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Zoek in boeken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A2317] border border-[#3A4D23] rounded-lg p-3 pl-10 text-white placeholder-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAE5A] w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="px-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Categorieën</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => {
                const active = activeCat === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`group relative flex flex-col items-center py-3 px-2 rounded-lg font-medium transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] text-[#1A2317] shadow-md shadow-[#8BAE5A]/20 transform scale-105"
                        : "text-[#8BAE5A]/70 hover:text-[#8BAE5A] hover:bg-[#2A3317]/50 hover:transform hover:scale-105"
                    }`}
                  >
                    <span className={`text-xl mb-1 transition-all duration-300 ${
                      active ? "text-[#1A2317]" : "text-[#8BAE5A]/70 group-hover:text-[#8BAE5A]"
                    }`}>
                      {cat.icon}
                    </span>
                    
                    <span className={`text-xs font-bold transition-all duration-300 text-center ${
                      active ? "text-[#1A2317]" : "text-[#8BAE5A]/70 group-hover:text-[#8BAE5A]"
                    }`}>
                      {cat.label}
                    </span>
                    
                    <span className={`text-xs opacity-60 transition-all duration-300 text-center mt-1 ${
                      active ? "text-[#1A2317]/80" : "text-[#8BAE5A]/40 group-hover:text-[#8BAE5A]/60"
                    }`}>
                      {cat.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                {categories.find(cat => cat.id === activeCat)?.label}
              </h2>
              <p className="text-[#8BAE5A] text-sm">
                {filteredBooks.length} boeken gevonden
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#3A4D23]/50 rounded-lg text-[#8BAE5A] hover:bg-[#3A4D23] transition-colors flex items-center gap-2 text-sm">
                <FaFilter className="w-3 h-3" />
                Filter
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#1A2317] rounded-lg font-semibold hover:from-[#A6C97B] hover:to-[#C6D958] transition-all flex items-center gap-2 text-sm">
                <FaBookmark className="w-3 h-3" />
                Mijn Boeken
              </button>
            </div>
          </div>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <div className="bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/40 p-8 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold text-white mb-2">Geen boeken gevonden</h3>
              <p className="text-[#8BAE5A] text-sm mb-4">Probeer een andere categorie of zoekterm.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#1A2317] rounded-lg font-semibold hover:from-[#A6C97B] hover:to-[#C6D958] transition-all text-sm"
              >
                Wis zoekopdracht
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map((book, i) => (
                <div key={i} className="group relative bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/40 overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#8BAE5A]/10">
                  {/* Book Cover */}
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      width={250} 
                      height={300} 
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      <span className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-xs font-bold text-[#1A2317] px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                        {book.tag === 'Aanbevolen door Rick' && <FaStar className="text-[#FFD700] w-3 h-3" />} 
                        {book.tag}
                      </span>
                      <button className="bg-[#1A2317]/80 p-1.5 rounded-full text-[#8BAE5A] hover:text-[#FFD700] shadow-md transition-colors">
                        <FaBookmark className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute bottom-2 right-2 bg-[#1A2317]/90 px-2 py-1 rounded-full text-xs text-[#8BAE5A] font-semibold shadow-md">
                      ⭐ {book.rating}
                    </div>
                  </div>
                  
                  {/* Book Info */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-[#8BAE5A] font-medium text-xs">{book.author}</p>
                    </div>
                    
                    <p className="text-xs text-[#E1CBB3] leading-relaxed line-clamp-2">{book.summary}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-[#8BAE5A]/70">
                      <span>{book.pages} pagina's</span>
                      <span>•</span>
                      <span>{book.year}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => openBookModal(book)}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#1A2317] text-xs font-semibold shadow-md hover:from-[#A6C97B] hover:to-[#C6D958] transition-all flex items-center justify-center gap-1"
                      >
                        <FaBookOpen className="w-3 h-3" />
                        Meer info
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-[#2A3317] text-[#8BAE5A] text-xs font-semibold shadow-md hover:bg-[#3A4D23] transition-colors flex items-center gap-1">
                        <FaHeadphones className="w-3 h-3" />
                        Bestellen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && selectedBook && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A2317] rounded-xl shadow-2xl border border-[#3A4D23] max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#3A4D23]">
              <h2 className="text-xl font-bold text-white">Boek Details</h2>
              <button
                onClick={closeBookModal}
                className="p-2 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Book Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <Image 
                    src={selectedBook.cover} 
                    alt={selectedBook.title} 
                    className="w-full max-w-40 h-52 object-cover rounded-lg shadow-lg" 
                    width={160} 
                    height={208} 
                  />
                </div>
                
                {/* Book Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{selectedBook.title}</h3>
                    <p className="text-base text-[#8BAE5A] font-medium">{selectedBook.author}</p>
                  </div>
                  
                  {/* Book Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-[#8BAE5A]/70">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>Publicatie: {selectedBook.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8BAE5A]/70">
                      <FaGlobe className="w-3 h-3" />
                      <span>{selectedBook.pages} pagina's</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8BAE5A]/70">
                      <FaStar className="w-3 h-3 text-[#FFD700]" />
                      <span>Rating: {selectedBook.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8BAE5A]/70">
                      <FaUser className="w-3 h-3" />
                      <span>Categorie: {categories.find(cat => cat.id === selectedBook.category)?.label}</span>
                    </div>
                  </div>
                  
                  {/* Tag */}
                  <div className="inline-block">
                    <span className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-sm font-bold text-[#1A2317] px-2 py-1 rounded-full shadow-md flex items-center gap-2">
                      {selectedBook.tag === 'Aanbevolen door Rick' && <FaStar className="text-[#FFD700] w-3 h-3" />} 
                      {selectedBook.tag}
                    </span>
                  </div>
                  
                  {/* Summary */}
                  <div>
                    <h4 className="text-base font-semibold text-white mb-2">Samenvatting</h4>
                    <p className="text-[#E1CBB3] leading-relaxed text-sm">{selectedBook.summary}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#3A4D23] bg-[#0A0F0A]">
              <div className="flex gap-3">
                <button 
                  onClick={closeBookModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#1A2317] font-semibold hover:from-[#A6C97B] hover:to-[#C6D958] transition-all flex items-center justify-center gap-2"
                >
                  <FaBookOpen className="w-4 h-4" />
                  Lees nu
                </button>
                <button 
                  onClick={closeBookModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#2A3317] text-[#8BAE5A] font-semibold hover:bg-[#3A4D23] transition-colors flex items-center justify-center gap-2"
                >
                  <FaHeadphones className="w-4 h-4" />
                  Luister
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 