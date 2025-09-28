'use client';

import React, { useState, useEffect } from 'react';
import { BookOpenIcon, StarIcon } from '@heroicons/react/24/solid';

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  rating: number;
  featured: boolean;
  affiliate_link?: string;
  cover_image_url?: string;
  publication_year?: number;
  pages?: number;
  language: string;
  created_at: string;
  updated_at: string;
}

export default function BoekenkamerPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/books');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Er is een fout opgetreden bij het laden van de boeken.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  // Strict allowlist: only these titles should show a Bestellen button, with the exact URL below
  const allowedAffiliate: Record<string, string> = {
    'rich dad poor dad': 'https://amzn.to/4pELNsm',
    'cashflow quadrant': 'https://amzn.to/48tbGoQ',
    'master your mindset': 'https://amzn.to/42H99Uh',
    'think and grow rich': 'https://amzn.to/4gOLV4v',
    'psychology of money': 'https://amzn.to/46Dbl0m',
    'diary of a ceo': 'https://amzn.to/4nQDl7N',
    'i will teach you to be rich': 'https://amzn.to/3VyG7lR'
  };
  const normalizeTitle = (s: string) => s?.toLowerCase().trim().replace(/\s+/g, ' ') || '';
  const getAllowedLinkFor = (title: string) => allowedAffiliate[normalizeTitle(title)] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-white text-lg">Boeken laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchBooks}
            className="bg-[#8BAE5A] text-white px-4 py-2 rounded-lg hover:bg-[#7A9E4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  const featuredBooks = books.filter(book => book.featured);
  const regularBooks = books.filter(book => !book.featured);

  return (
    <div className="min-h-screen bg-[#181F17]">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8 mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Boekenkamer 📚
              </h1>
              <p className="text-[#8BAE5A]/70 text-lg">
                Ontdek onze collectie van waardevolle boeken en resources voor persoonlijke groei.
              </p>
            </div>
          </div>

          {/* Featured Books */}
          {featuredBooks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-400" />
                Aanbevolen Boeken
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBooks.map((book) => (
                  <div key={book.id} className="bg-[#232D1A]/80 rounded-xl shadow-lg border border-[#3A4D23]/40 p-4 hover:border-[#8BAE5A]/50 transition-all duration-300">
                    <div className="flex gap-4">
                      {/* Book Cover */}
                      {book.cover_image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title}
                            className="w-20 h-32 object-contain rounded-lg bg-gray-100"
                          />
                        </div>
                      )}
                      
                      {/* Book Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4 text-[#8BAE5A]" />
                            <h3 className="text-sm font-bold text-white">{book.title}</h3>
                          </div>
                          <div className="flex">
                            {renderStars(book.rating)}
                          </div>
                        </div>
                        
                        <p className="text-[#8BAE5A] text-xs mb-1">door {book.author}</p>
                        <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] text-xs px-2 py-1 rounded-full mb-2">
                          {book.category}
                        </span>
                        <p className="text-gray-300 text-xs mb-3 line-clamp-2">{book.description}</p>
                        
                        {getAllowedLinkFor(book.title) && (
                          <a
                            href={getAllowedLinkFor(book.title) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#7A9E4A] text-white text-xs font-semibold rounded-lg hover:from-[#7A9E4A] hover:to-[#6B8D3A] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Bestellen
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Books */}
          {regularBooks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Alle Boeken</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {regularBooks.map((book) => (
                  <div key={book.id} className="bg-[#232D1A]/60 rounded-lg shadow-md border border-[#3A4D23]/30 p-3 hover:border-[#8BAE5A]/40 transition-all duration-300">
                    <div className="flex gap-3">
                      {/* Book Cover */}
                      {book.cover_image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title}
                            className="w-16 h-24 object-contain rounded-lg bg-gray-100"
                          />
                        </div>
                      )}
                      
                      {/* Book Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="w-3 h-3 text-[#8BAE5A]" />
                            <h3 className="text-xs font-bold text-white">{book.title}</h3>
                          </div>
                          <div className="flex">
                            {renderStars(book.rating)}
                          </div>
                        </div>
                        
                        <p className="text-[#8BAE5A] text-xs mb-1">door {book.author}</p>
                        <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] text-xs px-1.5 py-0.5 rounded-full mb-1">
                          {book.category}
                        </span>
                        <p className="text-gray-300 text-xs mb-2 line-clamp-2">{book.description}</p>
                        
                        {getAllowedLinkFor(book.title) && (
                          <a
                            href={getAllowedLinkFor(book.title) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#7A9E4A] text-white text-xs font-semibold rounded-lg hover:from-[#7A9E4A] hover:to-[#6B8D3A] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Bestellen
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No books message */}
          {books.length === 0 && (
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Geen boeken gevonden</h3>
              <p className="text-gray-400">Er zijn momenteel geen boeken beschikbaar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}