'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { BookOpenIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

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
  isbn?: string;
  publication_year?: number;
  pages?: number;
  language: string;
  created_at: string;
  updated_at: string;
}

export default function BooksAdminPage() {
  const { user, profile } = useSupabaseAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    rating: 4,
    featured: false,
    affiliate_link: '',
    cover_image_url: '',
    isbn: '',
    publication_year: new Date().getFullYear(),
    pages: 0,
    language: 'nl'
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingBook(null);
        resetForm();
        fetchBooks();
        alert('Boek succesvol toegevoegd! (Momenteel wordt data lokaal opgeslagen)');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Fout bij opslaan van boek');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      category: '',
      description: '',
      rating: 4,
      featured: false,
      affiliate_link: '',
      cover_image_url: '',
      isbn: '',
      publication_year: new Date().getFullYear(),
      pages: 0,
      language: 'nl'
    });
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      rating: book.rating,
      featured: book.featured,
      affiliate_link: book.affiliate_link || '',
      cover_image_url: book.cover_image_url || '',
      isbn: book.isbn || '',
      publication_year: book.publication_year || new Date().getFullYear(),
      pages: book.pages || 0,
      language: book.language
    });
    setShowModal(true);
  };

  const categories = ['Financieel', 'Mindset', 'Ondernemerschap', 'Beleggen', 'Productiviteit', 'Persoonlijke Ontwikkeling'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17]">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Boeken Beheer 📚
                </h1>
                <p className="text-[#8BAE5A]/70">
                  Beheer de boekenkamer collectie en affiliate links
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBook(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nieuw Boek
              </button>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-[#232D1A]/60 rounded-xl shadow-lg border border-[#3A4D23]/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#3A4D23]/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Boek</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Categorie</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Rating</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Featured</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Affiliate Link</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-t border-[#3A4D23]/30 hover:bg-[#3A4D23]/20">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-semibold">{book.title}</div>
                          <div className="text-[#8BAE5A] text-sm">door {book.author}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-[#3A4D23] text-[#8BAE5A] text-xs px-2 py-1 rounded-full">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={i < book.rating ? 'text-yellow-400' : 'text-gray-600'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {book.featured ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {book.affiliate_link ? (
                          <a
                            href={book.affiliate_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8BAE5A] hover:text-[#7A9E4A] flex items-center gap-1"
                          >
                            <span className="text-sm">🔗</span>
                            Link
                          </a>
                        ) : (
                          <span className="text-gray-500">Geen link</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(book)}
                          className="text-[#8BAE5A] hover:text-[#7A9E4A] mr-3"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#232D1A] rounded-xl shadow-xl border border-[#3A4D23]/40 p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingBook ? 'Bewerk Boek' : 'Nieuw Boek'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Titel</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Auteur</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Categorie</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                        required
                      >
                        <option value="">Selecteer categorie</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Rating</label>
                      <select
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>{rating} sterren</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Beschrijving</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Affiliate Link</label>
                    <input
                      type="url"
                      value={formData.affiliate_link}
                      onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                      placeholder="https://amzn.to/..."
                      className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Publicatiejaar</label>
                      <input
                        type="number"
                        value={formData.publication_year}
                        onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Pagina's</label>
                      <input
                        type="number"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">ISBN</label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full bg-[#3A4D23] border border-[#8BAE5A]/30 rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-[#8BAE5A] text-[#8BAE5A] focus:ring-[#8BAE5A]"
                      />
                      <span className="text-white">Featured boek</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingBook(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {editingBook ? 'Bijwerken' : 'Toevoegen'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
