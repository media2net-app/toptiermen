'use client';
import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '../../../components/admin';

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  categories: string[];
  description: string;
  status: 'published' | 'draft';
  averageRating: number;
  reviewCount: number;
}

export default function AdminBoekenkamerPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from database
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📚 Fetching books from database...');
      
      const response = await fetch('/api/admin/books');
      const data = await response.json();

      if (response.ok && data.success) {
        setBooks(data.books || []);
        console.log('✅ Books loaded successfully:', data.books?.length || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch books');
      }

    } catch (error) {
      console.error('❌ Error fetching books:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch books');
      
      // Fallback to mock data
      console.log('⚠️ Falling back to mock data...');
      setBooks([
        {
          id: '1',
          title: 'Rich Dad Poor Dad',
          author: 'Robert Kiyosaki',
          cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
          categories: ['Financiën', 'Mindset'],
          description: 'Een klassieker over financiële educatie en het verschil tussen activa en passiva.',
          status: 'published',
          averageRating: 4.2,
          reviewCount: 12,
        },
        {
          id: '2',
          title: 'Atomic Habits',
          author: 'James Clear',
          cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
          categories: ['Mindset', 'Productiviteit'],
          description: 'Een baanbrekend boek over hoe kleine veranderingen tot opmerkelijke resultaten kunnen leiden.',
          status: 'published',
          averageRating: 4.8,
          reviewCount: 25,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = () => {
    console.log('Add book functionality to be implemented');
  };

  const handleEditBook = (book: Book) => {
    console.log('Edit book functionality to be implemented');
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Weet je zeker dat je dit boek wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      await fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete book');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] mb-4">Laden van boekenkamer data...</p>
          <p className="text-[#B6C948] text-sm mb-4">Dit kan even duren</p>
          <AdminButton
            onClick={fetchBooks}
            variant="secondary"
            className="mt-4"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Opnieuw proberen
          </AdminButton>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Fout</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <AdminButton onClick={fetchBooks} variant="primary">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Opnieuw proberen
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Boekenkamer Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer je gecureerde bibliotheek</p>
        </div>
        <AdminButton
          onClick={fetchBooks}
          variant="secondary"
          icon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Vernieuwen
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard
          title="Totaal Boeken"
          value={books.length}
          icon={<BookOpenIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Gepubliceerd"
          value={books.filter(book => book.status === 'published').length}
          icon={<BookOpenIcon className="w-8 h-8" />}
          color="blue"
        />
        <AdminStatsCard
          title="Gemiddelde Rating"
          value={books.length > 0 ? (books.reduce((sum, book) => sum + book.averageRating, 0) / books.length).toFixed(1) : '0.0'}
          icon={<StarIcon className="w-8 h-8" />}
          color="orange"
        />
      </div>

      {/* Books Management */}
      <AdminCard
        title="Boeken Beheren"
        icon={<BookOpenIcon className="w-6 h-6" />}
        gradient
      >
        <div className="flex justify-between items-center mb-6">
          <AdminButton
            onClick={handleAddBook}
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Nieuw Boek
          </AdminButton>
        </div>

        <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Titel</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Auteur</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categorie(ën)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gem. Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-[#232D1A]/50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{book.author}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {book.categories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">{book.averageRating}</span>
                        <span className="text-xs text-gray-500">({book.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {book.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <AdminButton
                          onClick={() => handleEditBook(book)}
                          variant="secondary"
                          size="sm"
                          icon={<PencilIcon className="w-4 h-4" />}
                        >
                          Bewerk
                        </AdminButton>
                        <AdminButton
                          onClick={() => handleDeleteBook(book.id)}
                          variant="danger"
                          size="sm"
                          icon={<TrashIcon className="w-4 h-4" />}
                        >
                          Verwijder
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminCard>
    </div>
  );
} 