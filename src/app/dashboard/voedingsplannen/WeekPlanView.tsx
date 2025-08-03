'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Meal {
  id: string;
  name: string;
  image: string;
  ingredients: { name: string; amount: number; unit: string }[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface MealPlan {
  meals: Meal[];
}

interface WeekPlan {
  [day: string]: MealPlan;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface WeekPlanViewProps {
  weekPlan: WeekPlan;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  nutritionGoals: NutritionGoals | null;
  selectedDiet: string;
  onEditMeal: (meal: Meal) => void;
  onAddSnack: (time: string, type: 'afternoon' | 'evening') => void;
  onRemoveSnack: (mealId: string) => void;
  onStartPlan: () => void;
  onNewPlan: () => void;
  onOpenRecipeLibrary: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

const getDayName = (day: string): string => {
  const dayNames: { [key: string]: string } = {
    monday: 'Maandag',
    tuesday: 'Dinsdag', 
    wednesday: 'Woensdag',
    thursday: 'Donderdag',
    friday: 'Vrijdag',
    saturday: 'Zaterdag',
    sunday: 'Zondag'
  };
  return dayNames[day] || day;
};

export default function WeekPlanView({
  weekPlan,
  selectedDay,
  setSelectedDay,
  nutritionGoals,
  selectedDiet,
  onEditMeal,
  onAddSnack,
  onRemoveSnack,
  onStartPlan,
  onNewPlan,
  onOpenRecipeLibrary
}: WeekPlanViewProps) {
  const currentDayPlan = weekPlan[selectedDay];

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Jouw Persoonlijke {selectedDiet === 'carnivore' ? 'Carnivoor' : 'Voedings'} Weekplan op Maat
        </h2>
        <p className="text-gray-300 mb-4">
          Gebaseerd op jouw doel van {nutritionGoals?.calories} kcal en {nutritionGoals?.protein}g eiwit per dag
        </p>
        
        {/* Day Navigation */}
        <div className="flex gap-2 justify-center mb-6 overflow-x-auto">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-[#8BAE5A] text-white'
                  : 'bg-[#2A2A2A] text-gray-300 hover:text-white'
              }`}
            >
              {getDayName(day)}
            </button>
          ))}
        </div>
        
        {/* Total daily nutrition summary for selected day */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4 mb-6 inline-block">
          <div className="text-sm text-[#8BAE5A] font-semibold mb-2">
            {getDayName(selectedDay)} - Totaal Dagelijks Plan
          </div>
          <div className="flex gap-6 text-white">
            <div>
              <span className="font-bold">{currentDayPlan.meals.reduce((sum, meal) => sum + meal.calories, 0)}</span>
              <span className="text-sm text-gray-400"> kcal</span>
            </div>
            <div>
              <span className="font-bold">{currentDayPlan.meals.reduce((sum, meal) => sum + meal.protein, 0)}</span>
              <span className="text-sm text-gray-400">g eiwit</span>
            </div>
            <div>
              <span className="font-bold">{currentDayPlan.meals.reduce((sum, meal) => sum + meal.carbs, 0)}</span>
              <span className="text-sm text-gray-400">g koolhydraten</span>
            </div>
            <div>
              <span className="font-bold">{currentDayPlan.meals.reduce((sum, meal) => sum + meal.fat, 0)}</span>
              <span className="text-sm text-gray-400">g vet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top action buttons */}
      <div className="space-y-6 mb-8">
        {/* Add snack buttons */}
        {currentDayPlan.meals.length < 5 && (
          <div className="flex gap-4 justify-center">
            {!currentDayPlan.meals.some(m => m.type === 'snack' && m.time === '15:00') && (
              <button
                onClick={() => onAddSnack('15:00', 'afternoon')}
                className="bg-[#3A4D23] text-white px-4 py-2 rounded-lg hover:bg-[#4A5D33] transition-all text-sm"
              >
                + Middag Snack
              </button>
            )}
            
            {!currentDayPlan.meals.some(m => m.type === 'snack' && m.time === '21:00') && (
              <button
                onClick={() => onAddSnack('21:00', 'evening')}
                className="bg-[#3A4D23] text-white px-4 py-2 rounded-lg hover:bg-[#4A5D33] transition-all text-sm"
              >
                + Avond Snack
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={onStartPlan}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] px-8 py-4 rounded-xl font-bold hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
          >
            <CheckIcon className="w-6 h-6 mr-2" />
            Start met dit Plan
          </button>
          
          <button
            onClick={onNewPlan}
            className="bg-[#3A4D23] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4A5D33] transition-all"
          >
            Nieuw Plan Genereren
          </button>
        </div>
      </div>

      {/* Meals for selected day */}
      <div className="space-y-6">
        {currentDayPlan.meals.map((meal) => (
          <div key={meal.id} className="bg-[#1A1A1A] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">
                  {meal.type === 'breakfast' ? 'Ontbijt' : 
                   meal.type === 'lunch' ? 'Lunch' : 
                   meal.type === 'dinner' ? 'Diner' : 'Snack'} ({meal.time})
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEditMeal(meal)}
                    className="text-[#8BAE5A] hover:text-[#7A9D4B] text-sm font-medium"
                  >
                    Wijzig maaltijd
                  </button>
                  <button
                    onClick={() => onOpenRecipeLibrary(meal.type)}
                    className="text-[#FFD700] hover:text-[#FFA500] text-sm font-medium"
                  >
                    + Recept toevoegen
                  </button>
                  {meal.type === 'snack' && (
                    <button
                      onClick={() => onRemoveSnack(meal.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Verwijder
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {meal.calories} kcal | {meal.protein}g eiwit | {meal.carbs}g koolhydraten | {meal.fat}g vet
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-3">{meal.name}</h4>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-[#8BAE5A] mb-2">Porties voor jou:</h5>
                  <div className="space-y-1">
                    {meal.ingredients.map((ingredient, index) => (
                      <div key={index} className="text-gray-300 text-sm">
                        • {ingredient.name}: {ingredient.amount} {ingredient.unit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom action buttons */}
      <div className="space-y-6">
        {/* Add snack buttons */}
        {currentDayPlan.meals.length < 5 && (
          <div className="flex gap-4 justify-center">
            {!currentDayPlan.meals.some(m => m.type === 'snack' && m.time === '15:00') && (
              <button
                onClick={() => onAddSnack('15:00', 'afternoon')}
                className="bg-[#3A4D23] text-white px-4 py-2 rounded-lg hover:bg-[#4A5D33] transition-all text-sm"
              >
                + Middag Snack
              </button>
            )}
            
            {!currentDayPlan.meals.some(m => m.type === 'snack' && m.time === '21:00') && (
              <button
                onClick={() => onAddSnack('21:00', 'evening')}
                className="bg-[#3A4D23] text-white px-4 py-2 rounded-lg hover:bg-[#4A5D33] transition-all text-sm"
              >
                + Avond Snack
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={onStartPlan}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] px-8 py-4 rounded-xl font-bold hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
          >
            <CheckIcon className="w-6 h-6 mr-2" />
            Start met dit Plan
          </button>
          
          <button
            onClick={onNewPlan}
            className="bg-[#3A4D23] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4A5D33] transition-all"
          >
            Nieuw Plan Genereren
          </button>
        </div>
      </div>
    </motion.div>
  );
} 