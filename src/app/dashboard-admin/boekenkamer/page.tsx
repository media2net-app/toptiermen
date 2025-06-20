'use client';
import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import BookModal from './components/BookModal';
import CategoryModal from './components/CategoryModal';

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  categories: string[];
  description: string;
  affiliateBol?: string;
  affiliateAmazon?: string;
  status: 'published' | 'draft';
  averageRating: number;
  reviewCount: number;
}

interface Category {
  id: string;
  name: string;
  bookCount: number;
}

interface Review {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

// Mock data
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    categories: ['Mindset', 'Productiviteit'],
    description: 'Een baanbrekend boek over hoe kleine veranderingen tot opmerkelijke resultaten kunnen leiden. James Clear legt uit hoe gewoonten werken en hoe je ze kunt veranderen.',
    affiliateBol: 'https://www.bol.com/nl/nl/p/atomic-habits/9200000094141294/',
    affiliateAmazon: 'https://www.amazon.nl/Atomic-Habits-James-Clear/dp/1847941834/',
    status: 'published',
    averageRating: 4.8,
    reviewCount: 25,
  },
  {
    id: '2',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    categories: ['Psychologie', 'Besluitvorming'],
    description: 'Nobelprijswinnaar Daniel Kahneman neemt je mee in de fascinerende wereld van menselijk denken en besluitvorming.',
    status: 'published',
    averageRating: 4.6,
    reviewCount: 18,
  },
  {
    id: '3',
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    categories: ['Financiën', 'Mindset'],
    description: 'Een klassieker over financiële educatie en het verschil tussen activa en passiva.',
    status: 'draft',
    averageRating: 4.2,
    reviewCount: 12,
  },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Mindset', bookCount: 15 },
  { id: '2', name: 'Productiviteit', bookCount: 8 },
  { id: '3', name: 'Financiën', bookCount: 12 },
  { id: '4', name: 'Psychologie', bookCount: 6 },
  { id: '5', name: 'Besluitvorming', bookCount: 4 },
  { id: '6', name: 'Leadership', bookCount: 9 },
];

const mockReviews: Review[] = [
  {
    id: '1',
    bookId: '1',
    bookTitle: 'Atomic Habits',
    userId: 'user1',
    userName: 'Mark V.',
    rating: 5,
    text: 'Een absolute game-changer op het gebied van gewoonten en persoonlijke ontwikkeling. James Clear legt complexe concepten uit op een toegankelijke manier.',
    status: 'pending',
    submittedAt: '2025-01-20',
  },
  {
    id: '2',
    bookId: '2',
    bookTitle: 'Thinking, Fast and Slow',
    userId: 'user2',
    userName: 'Alex K.',
    rating: 4,
    text: 'Fascinerend boek over hoe ons brein werkt. Soms wat complex, maar zeer leerzaam.',
    status: 'pending',
    submittedAt: '2025-01-19',
  },
  {
    id: '3',
    bookId: '1',
    bookTitle: 'Atomic Habits',
    userId: 'user3',
    userName: 'Tom B.',
    rating: 5,
    text: 'Alleen al de 1% regel heeft mijn leven veranderd. Een must-read voor iedereen die wil groeien.',
    status: 'approved',
    submittedAt: '2025-01-15',
  },
];

export default function AdminBoekenkamerPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'categories' | 'reviews'>('books');
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Book management
  const handleAddBook = () => {
    setEditingBook(null);
    setBookModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookModalOpen(true);
  };

  const handleSaveBook = (book: Book) => {
    setBooks((prev) => {
      const exists = prev.find((b) => b.id === book.id);
      if (exists) {
        return prev.map((b) => (b.id === book.id ? book : b));
      } else {
        return [...prev, book];
      }
    });
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm('Weet je zeker dat je dit boek wilt verwijderen?')) {
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    }
  };

  // Category management
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (category: Category) => {
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === category.id);
      if (exists) {
        return prev.map((c) => (c.id === category.id ? category : c));
      } else {
        return [...prev, category];
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    }
  };

  // Review management
  const handleApproveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved' as const } : r))
    );
  };

  const handleRejectReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'rejected' as const } : r))
    );
  };

  const filteredReviews = reviews.filter((review) => review.status === reviewFilter);

  return (
    <div className="min-h-screen bg-[#0F1411] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Boekenkamer Beheer</h1>
          <p className="text-white/60">Beheer je gecureerde bibliotheek en gebruikersreviews</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'books'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Boeken Beheren
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Categorieën Beheren
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Reviews Beheren
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Boeken Beheren</h2>
              <button
                onClick={handleAddBook}
                className="flex items-center gap-2 bg-[#8BAE5A] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nieuw Boek Toevoegen
              </button>
            </div>

            <div className="bg-[#232D1A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#181F17]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Cover</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Titel</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Auteur</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Categorie(ën)</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Gem. Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-[#181F17]/50">
                        <td className="px-6 py-4">
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium">{book.title}</td>
                        <td className="px-6 py-4 text-white/80">{book.author}</td>
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
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">⭐</span>
                            <span>{book.averageRating}</span>
                            <span className="text-white/60">({book.reviewCount})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              book.status === 'published'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-yellow-900/30 text-yellow-400'
                            }`}
                          >
                            {book.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditBook(book)}
                              className="p-1 text-[#8BAE5A] hover:text-white transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Categorieën Beheren</h2>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 bg-[#8BAE5A] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Categorie Toevoegen
              </button>
            </div>

            <div className="bg-[#232D1A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#181F17]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Naam Categorie</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Aantal Boeken</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-[#181F17]/50">
                        <td className="px-6 py-4 font-medium">{category.name}</td>
                        <td className="px-6 py-4 text-white/80">{category.bookCount}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-1 text-[#8BAE5A] hover:text-white transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Reviews Beheren</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setReviewFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    reviewFilter === 'pending'
                      ? 'bg-[#8BAE5A] text-black'
                      : 'bg-[#181F17] text-white/60 hover:text-white'
                  }`}
                >
                  Nieuwe Reviews
                </button>
                <button
                  onClick={() => setReviewFilter('approved')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    reviewFilter === 'approved'
                      ? 'bg-[#8BAE5A] text-black'
                      : 'bg-[#181F17] text-white/60 hover:text-white'
                  }`}
                >
                  Goedgekeurd
                </button>
                <button
                  onClick={() => setReviewFilter('rejected')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    reviewFilter === 'rejected'
                      ? 'bg-[#8BAE5A] text-black'
                      : 'bg-[#181F17] text-white/60 hover:text-white'
                  }`}
                >
                  Verwijderd
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-[#232D1A] rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-[#8BAE5A]">{review.bookTitle}</h3>
                      <p className="text-white/60 text-sm">Door {review.userName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '⭐' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-white/60 text-sm">
                        {new Date(review.submittedAt).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80 mb-4">{review.text}</p>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✓ Goedkeuren
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ✗ Verwijderen
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredReviews.length === 0 && (
                <div className="text-center py-12 text-white/60">
                  Geen reviews gevonden voor deze filter.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <BookModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSave={handleSaveBook}
        book={editingBook}
        categories={categories}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
} 