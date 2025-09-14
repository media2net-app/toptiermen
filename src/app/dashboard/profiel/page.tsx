'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'next/navigation';

interface ProfileFormData {
  full_name: string;
  display_name: string;
  main_goal: string;
  bio: string;
  location: string;
  website: string;
  interests: string[];
}

export default function ProfielPage() {
  const { user, profile } = useSupabaseAuth();
  const { completeCurrentStep } = useOnboarding();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    display_name: '',
    main_goal: '',
    bio: '',
    location: '',
    website: '',
    interests: []
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        main_goal: profile.main_goal || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        interests: profile.interests || []
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, value]
        : prev.interests.filter(interest => interest !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update profile
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Complete onboarding step
      await completeCurrentStep();
      
      // Redirect to next step
      router.push('/dashboard/mijn-challenges');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Authenticatie Vereist
          </h2>
          <p className="text-[#8BAE5A]/70">
            Je moet ingelogd zijn om deze pagina te bekijken.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Profiel Setup 👤
            </h1>
            <p className="text-[#8BAE5A]/70 text-lg">
              Vertel ons wat over jezelf zodat we je de beste ervaring kunnen bieden.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Volledige Naam *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="Je volledige naam"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Display Naam
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="Naam die anderen zien"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Hoofddoel *
              </label>
              <select
                name="main_goal"
                value={formData.main_goal}
                onChange={handleInputChange}
                required
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="">Selecteer je hoofddoel</option>
                <option value="fitness">Fitness & Kracht</option>
                <option value="weight_loss">Gewichtsverlies</option>
                <option value="muscle_gain">Spiermassa</option>
                <option value="endurance">Conditie & Uithoudingsvermogen</option>
                <option value="mental_health">Mentale Gezondheid</option>
                <option value="productivity">Productiviteit</option>
                <option value="business">Business & Carrière</option>
                <option value="relationships">Relaties & Sociale Vaardigheden</option>
                <option value="other">Anders</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                placeholder="Vertel iets over jezelf..."
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Locatie
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="Stad, Land"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="https://jouwwebsite.com"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Interesses
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Fitness', 'Voeding', 'Meditatie', 'Lezen',
                  'Business', 'Reizen', 'Muziek', 'Sport',
                  'Fotografie', 'Koken', 'Gaming', 'Kunst'
                ].map(interest => (
                  <label key={interest} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={interest.toLowerCase()}
                      checked={formData.interests.includes(interest.toLowerCase())}
                      onChange={handleInterestsChange}
                      className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]"
                    />
                    <span className="text-white text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !formData.full_name || !formData.main_goal}
                className="w-full px-6 py-4 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17]"></div>
                    Opslaan...
                  </div>
                ) : (
                  'Profiel Opslaan & Volgende Stap'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
