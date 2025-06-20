'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  book?: Book | null;
  categories: Category[];
}

export default function BookModal({ isOpen, onClose, onSave, book, categories }: BookModalProps) {
  const [form, setForm] = useState<Partial<Book>>({
    title: '',
    author: '',
    cover: '',
    categories: [],
    description: '',
    affiliateBol: '',
    affiliateAmazon: '',
    status: 'draft',
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (book) {
      setForm(book);
      setSelectedCategories(book.categories);
    } else {
      setForm({
        title: '',
        author: '',
        cover: '',
        categories: [],
        description: '',
        affiliateBol: '',
        affiliateAmazon: '',
        status: 'draft',
      });
      setSelectedCategories([]);
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookData: Book = {
      id: book?.id || Date.now().toString(),
      title: form.title || '',
      author: form.author || '',
      cover: form.cover || '',
      categories: selectedCategories,
      description: form.description || '',
      affiliateBol: form.affiliateBol,
      affiliateAmazon: form.affiliateAmazon,
      status: form.status || 'draft',
      averageRating: book?.averageRating || 0,
      reviewCount: book?.reviewCount || 0,
    };

    onSave(bookData);
    onClose();
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm((prev) => ({ ...prev, cover: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#8BAE5A]">
              {book ? 'Boek Bewerken' : 'Nieuw Boek Toevoegen'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Auteur *
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  required
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Cover Afbeelding
              </label>
              <div className="flex items-center gap-4">
                {form.cover && (
                  <img
                    src={form.cover}
                    alt="Cover preview"
                    className="w-20 h-28 object-cover rounded border border-[#3A4D23]"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#8BAE5A] file:text-black hover:file:bg-[#A6C97B]"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Upload een afbeelding van de boekomslag (aanbevolen: 400x600px)
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Categorieën
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]"
                    />
                    <span className="text-sm text-white">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Omschrijving / Samenvatting *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] resize-vertical"
                placeholder="Leg uit waarom dit boek een aanrader is voor de Top Tier Men community..."
                required
              />
            </div>

            {/* Affiliate Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#8BAE5A]">Affiliate Links (Optioneel)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Bol.com Link
                  </label>
                  <input
                    type="url"
                    value={form.affiliateBol}
                    onChange={(e) => setForm((prev) => ({ ...prev, affiliateBol: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    placeholder="https://www.bol.com/nl/nl/p/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Amazon.nl Link
                  </label>
                  <input
                    type="url"
                    value={form.affiliateAmazon}
                    onChange={(e) => setForm((prev) => ({ ...prev, affiliateAmazon: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    placeholder="https://www.amazon.nl/..."
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Publicatiestatus
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
              >
                <option value="draft">Concept (nog niet zichtbaar voor gebruikers)</option>
                <option value="published">Gepubliceerd (zichtbaar voor gebruikers)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#3A4D23]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors"
              >
                {book ? 'Bijwerken' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 