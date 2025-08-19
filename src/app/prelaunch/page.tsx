'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function PreLaunchPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vul je email adres in');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would normally send to your API
      console.log('Email submitted:', email);
      
      setIsSubmitted(true);
    } catch (error) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: UserGroupIcon,
      title: "Brotherhood Community",
      description: "Sluit je aan bij een exclusieve community van mannen die streven naar excellentie in alle aspecten van het leven."
    },
    {
      icon: ChartBarIcon,
      title: "Persoonlijke Groei",
      description: "Stap-voor-stap programma's voor fitness, mindset, business en persoonlijke ontwikkeling."
    },
    {
      icon: TrophyIcon,
      title: "Achievement System",
      description: "Verdien badges en rangen door je doelen te behalen en jezelf te overtreffen."
    },
    {
      icon: FireIcon,
      title: "Daily Challenges",
      description: "Dagelijkse uitdagingen die je motiveren om consistent te blijven en je grenzen te verleggen."
    }
  ];

  const benefits = [
    "Exclusieve toegang tot premium content",
    "Persoonlijke coaching en mentoring",
    "Community van gelijkgestemde mannen",
    "Stap-voor-stap actieplannen",
    "Accountability partners",
    "Lifetime toegang tot alle updates"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#232D1A] to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo_white-full.svg" 
                alt="Top Tier Men Logo" 
                className="h-12 sm:h-16 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <ClockIcon className="w-4 h-4 mr-2" />
              Lancering: 10 September 2024
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Word de Beste Versie van
              <span className="block bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] bg-clip-text text-transparent">
                Jezelf
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Sluit je aan bij de exclusieve <strong>Top Tier Men</strong> community. 
              Een platform waar mannen samen groeien, excelleren en hun volledige potentieel bereiken.
            </p>

            {/* CTA Button */}
            <div className="mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <StarIcon className="w-6 h-6 mr-2" />
                Schrijf je in voor de Wachtlijst
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#232D1A]/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Wat is Top Tier Men?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Een revolutionair platform dat mannen helpt om hun volledige potentieel te bereiken 
              door middel van community, coaching en systematische groei.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-[#8BAE5A] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Wat Kun Je Verwachten?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Een complete transformatie van je leven met bewezen methoden en een ondersteunende community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A] flex-shrink-0" />
                    <span className="text-lg text-white">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#8BAE5A]/20 to-[#3A4D23]/20 rounded-2xl p-8 border border-white/10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlayIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Platform Preview</h3>
                  <p className="text-gray-300 mb-6">
                    Bekijk een sneak peek van wat je kunt verwachten in het Top Tier Men platform.
                  </p>
                  <button className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Bekijk Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="signup" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#8BAE5A]/20 to-[#3A4D23]/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-full text-[#8BAE5A] text-sm font-medium mb-8">
              <FireIcon className="w-4 h-4 mr-2" />
              Exclusieve Wachtlijst
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Wees er Bij vanaf Dag 1
            </h2>
            
            <p className="text-xl text-gray-300 mb-8">
              Door je te registreren kom je op de wachtlijst te staan voor de lancering op 10 September 2024. 
              Je behoort dan tot de groep eerste gebruikers van het platform.
            </p>

            {!isSubmitted ? (
              <motion.form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Vul je email adres in"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                    required
                  />
                  {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verwerken...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2" />
                      Schrijf je in voor de Wachtlijst
                    </div>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#8BAE5A]/20 border border-[#8BAE5A]/30 rounded-xl p-8"
              >
                <CheckCircleIcon className="w-16 h-16 text-[#8BAE5A] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Je bent ingeschreven!</h3>
                <p className="text-gray-300">
                  Bedankt voor je interesse! Je staat nu op de wachtlijst en behoort tot de groep eerste gebruikers. 
                  Je ontvangt binnenkort meer informatie over de lancering op 10 September 2024.
                </p>
              </motion.div>
            )}

            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Veilig & Privé
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Geen Spam
              </div>
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 mr-2" />
                Eerste Gebruikers
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/logo_white-full.svg" 
              alt="Top Tier Men Logo" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <p className="text-gray-400">
            © 2024 Top Tier Men. Alle rechten voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  );
}
