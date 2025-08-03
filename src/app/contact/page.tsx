'use client';
import { useState } from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    plan: 'elite'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('📧 Contact form submitted:', formData);
      toast.success('Bericht succesvol verzonden! We nemen binnen 24 uur contact met je op.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        plan: 'elite'
      });
    } catch (error) {
      toast.error('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] via-[#1A2F1A] to-[#0A0F0A]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8BAE5A]/20 to-[#B6C948]/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Neem <span className="text-[#8BAE5A]">Contact</span> Op
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Klaar voor het Elite plan? Laat ons weten wat je doelen zijn en we maken een plan op maat.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Stuur ons een bericht</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Naam *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A0F0A] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
                        placeholder="Jouw naam"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A0F0A] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
                        placeholder="jouw@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Bedrijf
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A0F0A] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
                        placeholder="Bedrijfsnaam"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Telefoon
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A0F0A] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
                        placeholder="+31 6 12345678"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-300 mb-2">
                    Plan van Interesse
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0F0A] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="elite">Elite Plan - €199/maand</option>
                    <option value="pro">Pro Plan - €99/maand</option>
                    <option value="starter">Starter Plan - €49/maand</option>
                    <option value="custom">Custom Plan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Bericht *
                  </label>
                  <div className="relative">
                    <ChatBubbleLeftRightIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A0F0A] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400 resize-none"
                      placeholder="Vertel ons over je doelen en wat je hoopt te bereiken met Toptiermen..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8BAE5A] hover:bg-[#B6C948] disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Versturen...
                    </>
                  ) : (
                    <>
                      Verstuur Bericht
                      <EnvelopeIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Contact Informatie</h2>
                <p className="text-gray-300 mb-8">
                  Klaar om je leven naar het volgende niveau te tillen? Neem contact met ons op voor een persoonlijk gesprek.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-300">info@toptiermen.nl</p>
                    <p className="text-gray-400 text-sm">We reageren binnen 24 uur</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Telefoon</h3>
                    <p className="text-gray-300">+31 6 12345678</p>
                    <p className="text-gray-400 text-sm">Ma-Vr 9:00-18:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Adres</h3>
                    <p className="text-gray-300">Toptiermen HQ</p>
                    <p className="text-gray-300">Amsterdam, Nederland</p>
                    <p className="text-gray-400 text-sm">Op afspraak</p>
                  </div>
                </div>
              </div>

              {/* Elite Plan Benefits */}
              <div className="bg-[#181F17] border border-[#8BAE5A] rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Elite Plan Voordelen</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                    <span className="text-gray-300">Dagelijkse coaching calls</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                    <span className="text-gray-300">Persoonlijke mentor</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                    <span className="text-gray-300">Custom voedingsplannen</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                    <span className="text-gray-300">24/7 support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                    <span className="text-gray-300">Exclusieve masterminds</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                    <span className="text-gray-300">Lifetime toegang</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 