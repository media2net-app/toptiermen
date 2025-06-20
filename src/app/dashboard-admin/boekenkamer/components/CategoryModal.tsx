'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  bookCount: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [form, setForm] = useState<Partial<Category>>({
    name: '',
  });

  useEffect(() => {
    if (category) {
      setForm(category);
    } else {
      setForm({
        name: '',
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: Category = {
      id: category?.id || Date.now().toString(),
      name: form.name || '',
      bookCount: category?.bookCount || 0,
    };

    onSave(categoryData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#8BAE5A]">
              {category ? 'Categorie Bewerken' : 'Nieuwe Categorie'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Naam van de Categorie *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                placeholder="Bijv. Financiën, Mindset, Productiviteit..."
                required
              />
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
                className="px-6 py-2 bg-[#8BAE5A] text-black font-semibold hover:bg-[#A6C97B] transition-colors rounded-lg"
              >
                {category ? 'Bijwerken' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 