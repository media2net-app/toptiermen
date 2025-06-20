'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  ingredient?: Ingredient | null;
  categories: string[];
}

export default function IngredientModal({ isOpen, onClose, onSave, ingredient, categories }: IngredientModalProps) {
  const [form, setForm] = useState<Partial<Ingredient>>({
    name: '',
    category: categories[0] || '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    if (ingredient) {
      setForm(ingredient);
    } else {
      setForm({
        name: '',
        category: categories[0] || '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }
  }, [ingredient, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'name' || name === 'category' ? value : parseFloat(value) }));
  };

  const handleSave = () => {
    if (!form.name || !form.category) {
      alert('Vul alle verplichte velden in');
      return;
    }
    onSave({
      id: ingredient?.id || Date.now().toString(),
      name: form.name!,
      category: form.category!,
      calories: form.calories || 0,
      protein: form.protein || 0,
      carbs: form.carbs || 0,
      fat: form.fat || 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-xl max-w-md w-full">
        <div className="p-4 border-b border-[#3A4D23] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">{ingredient ? 'Ingrediënt Bewerken' : 'Nieuw Ingrediënt'}</h2>
          <button onClick={onClose} className="p-2 text-[#8BAE5A] hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-1">Naam *</label>
            <input
              name="name"
              type="text"
              value={form.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
              placeholder="Bijv. Kipfilet (rauw)"
            />
          </div>
          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-1">Categorie *</label>
            <select
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-1">Calorieën (per 100g)</label>
              <input
                name="calories"
                type="number"
                value={form.calories || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                min="0"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-1">Eiwitten (g)</label>
              <input
                name="protein"
                type="number"
                value={form.protein || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                min="0"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-1">Koolhydraten (g)</label>
              <input
                name="carbs"
                type="number"
                value={form.carbs || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                min="0"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-1">Vetten (g)</label>
              <input
                name="fat"
                type="number"
                value={form.fat || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                min="0"
              />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[#8BAE5A] hover:text-white transition-colors">Annuleren</button>
          <button onClick={handleSave} className="px-6 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors">{ingredient ? 'Bijwerken' : 'Opslaan'}</button>
        </div>
      </div>
    </div>
  );
} 