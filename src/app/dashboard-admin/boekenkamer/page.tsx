'use client';
import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, BookOpenIcon, StarIcon, UserGroupIcon, ChatBubbleLeftRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '../../../components/admin';
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

interface BookStats {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
  totalCategories: number;
}

export default function AdminBoekenkamerPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'categories' | 'reviews'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookStats, setBookStats] = useState<BookStats | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from database
  const fetchBookData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📚 Fetching book data from database...');

      // Fetch all data in parallel
      const [booksResponse, categoriesResponse, reviewsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/books'),
        fetch('/api/admin/book-categories'),
        fetch('/api/admin/book-reviews'),
        fetch('/api/admin/book-stats')
      ]);

      // Parse responses
      const booksData = await booksResponse.json();
      const categoriesData = await categoriesResponse.json();
      const reviewsData = await reviewsResponse.json();
      const statsData = await statsResponse.json();

      // Check for errors
      if (!booksResponse.ok || !categoriesResponse.ok || !reviewsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch book data from database');
      }

      // Set data
      setBooks(booksData.books || []);
      setCategories(categoriesData.categories || []);
      setReviews(reviewsData.reviews || []);
      setBookStats(statsData.bookStats || null);

      console.log('✅ Book data loaded successfully:', {
        books: booksData.books?.length || 0,
        categories: categoriesData.categories?.length || 0,
        reviews: reviewsData.reviews?.length || 0
      });

    } catch (error) {
      console.error('❌ Error fetching book data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch book data');
      
      // Fallback to mock data if database is not available
      console.log('⚠️ Falling back to mock data...');
      setBooks([
        {
          id: '1',
          title: 'Rich Dad Poor Dad',
          author: 'Robert Kiyosaki',
          cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
          categories: ['Financiën', 'Mindset'],
          description: 'Een klassieker over financiële educatie en het verschil tussen activa en passiva. Robert Kiyosaki legt uit hoe de rijken denken over geld en hoe je financiële vrijheid kunt bereiken.',
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
        },
        {
          id: '3',
          title: 'Thinking, Fast and Slow',
          author: 'Daniel Kahneman',
          cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
          categories: ['Psychologie', 'Besluitvorming'],
          description: 'Een Nobelprijswinnaar legt uit hoe ons brein werkt en waarom we vaak irrationele beslissingen nemen.',
          status: 'published',
          averageRating: 4.5,
          reviewCount: 18,
        },
        {
          id: '4',
          title: 'The Psychology of Money',
          author: 'Morgan Housel',
          cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
          categories: ['Financiën', 'Psychologie'],
          description: 'Een diepgaande analyse van hoe mensen denken over geld en waarom we vaak irrationele financiële beslissingen nemen.',
          status: 'published',
          averageRating: 4.3,
          reviewCount: 15,
        },
        {
          id: '5',
          title: 'Deep Work',
          author: 'Cal Newport',
          cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
          categories: ['Productiviteit', 'Focus'],
          description: 'Een gids voor het ontwikkelen van focus en het vermijden van afleidingen in een wereld vol digitale prikkels.',
          status: 'draft',
          averageRating: 4.1,
          reviewCount: 8,
        }
      ]);

      setCategories([
        { id: '1', name: 'Mindset', bookCount: 3 },
        { id: '2', name: 'Productiviteit', bookCount: 2 },
        { id: '3', name: 'Financiën', bookCount: 2 },
        { id: '4', name: 'Psychologie', bookCount: 2 },
        { id: '5', name: 'Besluitvorming', bookCount: 1 },
        { id: '6', name: 'Focus', bookCount: 1 }
      ]);

      setReviews([
        {
          id: '1',
          bookId: '1',
          bookTitle: 'Rich Dad Poor Dad',
          userId: 'user1',
          userName: 'Rick Cuijpers',
          rating: 5,
          text: 'Fantastisch boek! Heeft mijn kijk op geld volledig veranderd.',
          status: 'approved',
          submittedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          bookId: '2',
          bookTitle: 'Atomic Habits',
          userId: 'user2',
          userName: 'Chiel van der Berg',
          rating: 4,
          text: 'Zeer praktisch en toepasbaar. Aanrader voor iedereen die gewoontes wil veranderen.',
          status: 'approved',
          submittedAt: '2024-01-14T14:20:00Z'
        },
        {
          id: '3',
          bookId: '1',
          bookTitle: 'Rich Dad Poor Dad',
          userId: 'user3',
          userName: 'Anoniem',
          rating: 3,
          text: 'Interessante concepten, maar soms wat repetitief.',
          status: 'pending',
          submittedAt: '2024-01-16T09:15:00Z'
        },
        {
          id: '4',
          bookId: '3',
          bookTitle: 'Thinking, Fast and Slow',
          userId: 'user4',
          userName: 'Lid',
          rating: 5,
          text: 'Briljant boek over hoe ons brein werkt. Echt een eye-opener!',
          status: 'pending',
          submittedAt: '2024-01-13T16:45:00Z'
        }
      ]);

      setBookStats({
        totalBooks: 5,
        publishedBooks: 4,
        draftBooks: 1,
        averageRating: 4.4,
        totalReviews: 4,
        pendingReviews: 2,
        totalCategories: 6
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, []);

  const handleAddBook = () => {
    setEditingBook(null);
    setIsBookModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  const handleSaveBook = async (book: Book) => {
    try {
      if (editingBook) {
        // Update existing book
        const response = await fetch(`/api/admin/books/${book.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book)
        });

        if (!response.ok) {
          throw new Error('Failed to update book');
        }

        // Refresh data
        await fetchBookData();
      } else {
        // Create new book
        const response = await fetch('/api/admin/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book)
        });

        if (!response.ok) {
          throw new Error('Failed to create book');
        }

        // Refresh data
        await fetchBookData();
      }

      setIsBookModalOpen(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Error saving book:', error);
      setError(error instanceof Error ? error.message : 'Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      // Refresh data
      await fetchBookData();
    } catch (error) {
      console.error('Error deleting book:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete book');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/admin/book-categories/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category)
        });

        if (!response.ok) {
          throw new Error('Failed to update category');
        }

        // Refresh data
        await fetchBookData();
      } else {
        // Create new category
        const response = await fetch('/api/admin/book-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category)
        });

        if (!response.ok) {
          throw new Error('Failed to create category');
        }

        // Refresh data
        await fetchBookData();
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/book-categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      // Refresh data
      await fetchBookData();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/book-reviews/${reviewId}/approve`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      // Refresh data
      await fetchBookData();
    } catch (error) {
      console.error('Error approving review:', error);
      setError(error instanceof Error ? error.message : 'Failed to approve review');
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/book-reviews/${reviewId}/reject`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to reject review');
      }

      // Refresh data
      await fetchBookData();
    } catch (error) {
      console.error('Error rejecting review:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject review');
    }
  };

  const filteredReviews = reviews.filter((review) => review.status === reviewFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden van boekenkamer data...</p>
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
          <AdminButton onClick={fetchBookData} variant="primary">
            Opnieuw Proberen
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#8BAE5A]">Boekenkamer Beheer</h1>
          <p className="text-[#B6C948] mt-2 text-sm sm:text-base">Beheer je gecureerde bibliotheek en gebruikersreviews</p>
        </div>
        <AdminButton 
          onClick={fetchBookData} 
          variant="secondary" 
          icon={<ArrowPathIcon className="w-4 h-4" />}
          className="text-sm"
        >
          <span className="hidden sm:inline">Vernieuwen</span>
          <span className="sm:hidden">🔄</span>
        </AdminButton>
      </div>

      {/* Book Statistics */}
      {bookStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Totaal Boeken"
            value={bookStats.totalBooks}
            icon={<BookOpenIcon className="w-8 h-8" />}
            color="green"
          />
          <AdminStatsCard
            title="Gepubliceerd"
            value={bookStats.publishedBooks}
            icon={<EyeIcon className="w-8 h-8" />}
            color="blue"
          />
          <AdminStatsCard
            title="Gemiddelde Rating"
            value={bookStats.averageRating}
            icon={<StarIcon className="w-8 h-8" />}
            color="orange"
          />
          <AdminStatsCard
            title="Pending Reviews"
            value={bookStats.pendingReviews}
            icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
            color="purple"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'books'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Boeken Beheren</span>
          <span className="sm:hidden">Boeken</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Categorieën Beheren</span>
          <span className="sm:hidden">Cats</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Reviews Beheren</span>
          <span className="sm:hidden">Reviews</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'books' && (
        <AdminCard
          title="Boeken Beheren"
          subtitle="Beheer je gecureerde bibliotheek"
          icon={<BookOpenIcon className="w-6 h-6" />}
          gradient
        >
          <div className="flex justify-between items-center mb-6">
            <AdminButton
              onClick={handleAddBook}
              variant="primary"
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Nieuw Boek Toevoegen
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
                          <button
                            onClick={() => handleEditBook(book)}
                            className="p-1 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-[#3A4D23] rounded"
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
        </AdminCard>
      )}

      {activeTab === 'categories' && (
        <AdminCard
          title="Categorieën Beheren"
          subtitle="Beheer boekcategorieën"
          icon={<UserGroupIcon className="w-6 h-6" />}
          gradient
        >
          <div className="flex justify-between items-center mb-6">
            <AdminButton
              onClick={handleAddCategory}
              variant="primary"
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Nieuwe Categorie Toevoegen
            </AdminButton>
          </div>

          <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Naam</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Aantal Boeken</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-[#232D1A]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{category.bookCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-[#3A4D23] rounded"
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
        </AdminCard>
      )}

      {activeTab === 'reviews' && (
        <AdminCard
          title="Reviews Beheren"
          subtitle="Modereer gebruikersreviews"
          icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
          gradient
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
              <button
                onClick={() => setReviewFilter('pending')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  reviewFilter === 'pending'
                    ? 'bg-[#8BAE5A] text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setReviewFilter('approved')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  reviewFilter === 'approved'
                    ? 'bg-[#8BAE5A] text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Goedgekeurd
              </button>
              <button
                onClick={() => setReviewFilter('rejected')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  reviewFilter === 'rejected'
                    ? 'bg-[#8BAE5A] text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Afgewezen
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{review.bookTitle}</h3>
                    <p className="text-sm text-gray-400">Door {review.userName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">{review.rating}/5</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      review.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : review.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status === 'approved' ? 'Goedgekeurd' : 
                       review.status === 'rejected' ? 'Afgewezen' : 'Pending'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{review.text}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{review.submittedAt}</span>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <AdminButton
                        onClick={() => handleApproveReview(review.id)}
                        variant="success"
                        size="sm"
                      >
                        Goedkeuren
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleRejectReview(review.id)}
                        variant="danger"
                        size="sm"
                      >
                        Afwijzen
                      </AdminButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      {/* Modals */}
      {isBookModalOpen && (
        <BookModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          onSave={handleSaveBook}
          book={editingBook}
          categories={categories}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
} 