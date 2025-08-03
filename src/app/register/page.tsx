"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa6";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import WelcomeEmailModal from "@/components/WelcomeEmailModal";
import PaymentModal from "@/components/PaymentModal";

export default function Register() {
  const router = useRouter();
  const { signUp, user } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [step, setStep] = useState<'intro'|'intake'|'approved'|'rejected'|'register'|'package'|'registration'|'payment'|'success'>('intro');
  const [intake, setIntake] = useState({
    goal: '',
    challenge: '',
    hours: '',
    discipline: '',
    difference: '',
    ownership: false,
  });
  const [error, setError] = useState('');
  const [packageChoice, setPackageChoice] = useState('12m');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fade, setFade] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState('yearly');
  const [registration, setRegistration] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [agreeIncasso, setAgreeIncasso] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showWelcomeEmail, setShowWelcomeEmail] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
              if (user.role?.toLowerCase() === 'admin') {
        router.push('/dashboard-admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const packages = [
    {
      id: 'monthly',
      name: 'Maandelijks',
      description: 'Flexibel, opzegbaar per maand',
      price: '47',
      priceLabel: 'per maand',
      features: ['Toegang tot alle content', 'Live sessies', 'Community']
    },
    {
      id: 'yearly',
      name: 'Jaarlijks',
      description: '10% korting t.o.v. maandelijks',
      price: '508',
      priceLabel: 'per jaar',
      features: ['Toegang tot alle content', 'Live sessies', 'Community', '10% korting (€42 per maand)']
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      description: 'Eénmalige betaling, levenslang toegang',
      price: '1997',
      priceLabel: 'eenmalig',
      features: ['Toegang tot alle content', 'Live sessies', 'Community', 'Levenslang toegang']
    }
  ];

  // Typeform-stijl flow: één vraag per scherm
  const questions = [
    {
      key: 'goal',
      label: 'Wat is je belangrijkste doel?',
      type: 'radio',
      options: [
        { value: 'discipline', label: 'Meer discipline ontwikkelen', score: 3 },
        { value: 'strength', label: 'Fysieke kracht opbouwen', score: 2 },
        { value: 'mental', label: 'Mentale helderheid verbeteren', score: 2 },
        { value: 'leadership', label: 'Leiderschapsvaardigheden ontwikkelen', score: 3 }
      ]
    },
    {
      key: 'challenges',
      label: 'Wat is je grootste uitdaging?',
      type: 'radio',
      options: [
        { value: 'consistency', label: 'Consistent blijven', score: 3 },
        { value: 'motivation', label: 'Motivatie behouden', score: 2 },
        { value: 'time', label: 'Tijd vinden', score: 1 },
        { value: 'focus', label: 'Focus houden', score: 2 }
      ]
    },
    {
      key: 'hours',
      label: 'Hoeveel uur per week kun je besteden?',
      type: 'radio',
      options: [
        { value: '5-10', label: '5-10 uur', score: 1 },
        { value: '10-15', label: '10-15 uur', score: 2 },
        { value: '15-20', label: '15-20 uur', score: 3 },
        { value: '20+', label: '20+ uur', score: 4 }
      ]
    },
    {
      key: 'discipline',
      label: 'Hoe zou je je huidige discipline beoordelen?',
      type: 'radio',
      options: [
        { value: 'low', label: 'Laag', score: 1 },
        { value: 'medium', label: 'Gemiddeld', score: 2 },
        { value: 'high', label: 'Hoog', score: 3 },
        { value: 'very-high', label: 'Zeer hoog', score: 4 }
      ]
    },
    {
      key: 'difference',
      label: 'Wat maakt jou anders?',
      type: 'radio',
      options: [
        { value: 'determination', label: 'Ongekende vastberadenheid', score: 4 },
        { value: 'experience', label: 'Veel levenservaring', score: 3 },
        { value: 'potential', label: 'Onontgonnen potentieel', score: 2 },
        { value: 'learning', label: 'Leergierigheid', score: 3 }
      ]
    },
    {
      key: 'ownership',
      label: 'Neem je volledige verantwoordelijkheid voor je resultaten?',
      type: 'radio',
      options: [
        { value: 'yes', label: 'Ja, absoluut', score: 4 },
        { value: 'mostly', label: 'Meestal wel', score: 3 },
        { value: 'sometimes', label: 'Soms', score: 2 },
        { value: 'no', label: 'Nee', score: 1 }
      ]
    }
  ];
  const [questionIndex, setQuestionIndex] = useState(0);

  function handleIntakeChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setIntake(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setIntake(prev => ({ ...prev, [name]: value }));
    }
  }
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }
  function handleNextQuestion(e: React.FormEvent) {
    e.preventDefault();
    setFade(false);
    setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(prev => prev + 1);
        setFade(true);
      } else {
        // Bereken eindscore
        const totalScore = Object.entries(intake).reduce((score, [key, value]) => {
          const question = questions.find(q => q.key === key);
          if (question && question.type === 'radio') {
            const option = question.options.find(opt => opt.value === value);
            return score + (option?.score || 0);
          }
          return score;
        }, 0);
        
        // Minimale score voor toelating: 15
        if (totalScore >= 15) {
          setStep('package');
        } else {
          setStep('rejected');
        }
      }
    }, 300);
  }
  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Hier zou registratie en betaling komen
    router.push('/dashboard');
  }
  function handleRegistrationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setRegistration(prev => ({ ...prev, [name]: value }));
  }
  async function handleRegistration(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const fullName = `${registration.firstName} ${registration.lastName}`;
      const result = await signUp(registration.email, registration.password, fullName);
      
      if (result.success) {
        setRegisteredEmail(registration.email);
        setShowEmailVerification(true);
      } else {
        setError('Er is een fout opgetreden bij het registreren');
      }
    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden bij het registreren');
    } finally {
      setIsLoading(false);
    }
  }

  const handleEmailVerified = () => {
    setShowEmailVerification(false);
    setRegisteredUserName(registration.firstName);
    setShowWelcomeEmail(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcomeEmail(false);
    setStep('success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
      {/* Navigation */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/offerte')}
            className="text-[#B6C948] hover:text-white px-4 py-2 rounded-lg border border-[#B6C948] hover:bg-[#B6C948] hover:text-[#181F17] transition-all duration-200 font-medium"
          >
            Offerte
          </button>
        </div>
      </div>
      
      <div className="w-full max-w-4xl p-10 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg">
        {step === 'intro' && (
          <div className="flex flex-col items-start justify-center gap-8 text-left">
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 text-white leading-tight">
                Intake & Registratie – <span className="text-[#8BAE5A]">Top Tier Men</span>
              </h1>
              <p className="text-lg md:text-xl text-white mb-6 font-normal">Welkom bij Top Tier Men – een programma voor mannen die klaar zijn om te groeien in discipline, kracht, mentale helderheid en leiderschap.</p>
              <p className="text-base md:text-lg text-[#B6C948] mb-6 font-normal">Let op: Dit traject is niet voor iedereen. Wij selecteren deelnemers op basis van motivatie, inzet en persoonlijke toewijding. Alleen mannen die écht willen veranderen, worden toegelaten.</p>
            </div>
            <button
              onClick={() => setStep('intake')}
              className="self-start px-10 py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg shadow-lg hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] uppercase tracking-wide"
            >
              Start intake
            </button>
          </div>
        )}
        {step === 'intake' && (
          <form onSubmit={handleNextQuestion} className="flex flex-col gap-8 text-left">
            {/* Voortgangsbalk */}
            <div className="w-full h-2 bg-[#232D1A] rounded-full mb-4 overflow-hidden">
              <div
                className="h-2 bg-[#B6C948] transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}> 
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">{questions[questionIndex].label}</h2>
              {questions[questionIndex].type === 'radio' && (
                <div className="space-y-4">
                  {questions[questionIndex].options.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 text-[#B6C948] text-lg md:text-xl font-semibold">
                      <input
                        type="radio"
                        name={questions[questionIndex].key}
                        value={option.value}
                        checked={intake[questions[questionIndex].key as keyof typeof intake] === option.value}
                        onChange={handleIntakeChange}
                        className="accent-[#B6C948] w-5 h-5"
                        required
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
              {error && <div className="text-[#B6C948] text-left text-sm border border-[#B6C948] rounded-lg py-1 bg-[#181F17] mt-2">{error}</div>}
              <button type="submit" className="self-start px-10 py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg shadow-lg hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] uppercase tracking-wide mt-4">
                {questionIndex < questions.length - 1 ? 'Volgende' : 'Verstuur intake'}
              </button>
            </div>
          </form>
        )}
        {step === 'approved' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#B6C948] mb-2">✅ Intake goedgekeurd! Kies je pakket</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div
                className={`relative flex-1 rounded-2xl border-2 p-5 shadow-xl transition-all duration-200 cursor-pointer ${packageChoice==='6m' ? 'border-[#B6C948] bg-[#232D1A]/90 ring-2 ring-[#B6C948]' : 'border-[#3A4D23] bg-[#232D1A]/70'}`}
                onClick={()=>setPackageChoice('6m')}
              >
                <div className="text-2xl font-bold text-[#B6C948] mb-1">6 maanden</div>
                <div className="text-3xl font-black text-[#B6C948] mb-1">€282</div>
                <div className="text-xs text-[#8BAE5A] mb-2">€47 per maand</div>
                <ul className="text-[#B6C948] mb-3 space-y-1 text-base">
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> Volledige toegang tot het programma</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> Community & support</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> Toegang tot alle modules</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> 6 maanden updates</li>
                </ul>
                <button type="button" className={`w-full py-2 rounded-xl border border-[#B6C948] font-semibold text-lg transition-all duration-200 ${packageChoice==='6m' ? 'bg-[#B6C948] text-[#181F17]' : 'text-[#B6C948] hover:bg-[#B6C948] hover:text-[#181F17]'}`}>Kies 6 maanden</button>
              </div>
              <div
                className={`relative flex-1 rounded-2xl border-2 p-5 shadow-xl transition-all duration-200 cursor-pointer ${packageChoice==='12m' ? 'border-[#B6C948] bg-[#232D1A]/90 ring-2 ring-[#B6C948]' : 'border-[#3A4D23] bg-[#232D1A]/70'}`}
                onClick={()=>setPackageChoice('12m')}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B6C948] text-[#181F17] text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-[#3A4D23]">Meest gekozen</div>
                <div className="text-2xl font-bold text-[#B6C948] mb-1 mt-2">12 maanden</div>
                <div className="text-3xl font-black text-[#B6C948] mb-1">€508 <span className="text-xs text-[#8BAE5A] line-through ml-2">€564</span></div>
                <div className="text-xs text-[#8BAE5A] mb-2">€42 per maand (10% korting)</div>
                <ul className="text-[#B6C948] mb-3 space-y-1 text-base">
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> Alles van 6 maanden</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> Bonus masterclass</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> Extra contentmodules</li>
                  <li className="flex items-center gap-2"><FaCheck className="text-[#B6C948] w-4 h-4" /> 12 maanden updates</li>
                </ul>
                <button type="button" className={`w-full py-2 rounded-xl border border-[#B6C948] font-semibold text-lg transition-all duration-200 ${packageChoice==='12m' ? 'bg-[#B6C948] text-[#181F17]' : 'text-[#B6C948] hover:bg-[#B6C948] hover:text-[#181F17]'}`}>Kies 12 maanden</button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#B6C948] mt-4">Registratieformulier</h3>
            <input name="name" type="text" value={form.name} onChange={handleFormChange} placeholder="Volledige naam" className="w-full mt-1 p-3 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23]" required />
            <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="E-mailadres" className="w-full mt-1 p-3 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23]" required />
            <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="Wachtwoord aanmaken" className="w-full mt-1 p-3 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23]" required />
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948]">Registreer & betaal</button>
          </form>
        )}
        {step === 'rejected' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#B6C948] mb-4">❌ Intake afgewezen</h2>
            <p className="text-[#B6C948] mb-8 text-lg">Op basis van jouw antwoorden zien we op dit moment onvoldoende aansluiting bij het commitment dat dit traject vereist.<br/><br/>Wij danken je voor je eerlijkheid. We moedigen je aan om op een later moment opnieuw te solliciteren wanneer je voelt dat je er wél klaar voor bent.</p>
            <button onClick={()=>router.push('/')} className="px-8 py-3 rounded-xl border border-[#B6C948] text-[#B6C948] font-semibold text-lg hover:bg-[#B6C948] hover:text-[#181F17] transition-all duration-200">Terug naar home</button>
          </div>
        )}
        {step === 'package' && (
          <div className="flex flex-col gap-8 text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">Kies je pakket</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer min-h-[370px] flex flex-col justify-between ${
                    selectedPackage === pkg.id
                      ? 'border-[#B6C948] bg-[#232D1A]'
                      : 'border-[#3A4D23] bg-[#181F17] hover:border-[#B6C948]'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.id === 'yearly' && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B6C948] text-[#181F17] text-xs font-bold px-3 py-1 rounded shadow-lg border border-[#8BAE5A]">Meest gekozen</span>
                  )}
                  <div className="flex flex-col gap-2 mb-4">
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-[#B6C948] text-sm">{pkg.description}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">€{pkg.price}</span>
                    <span className="text-[#B6C948] ml-1">{pkg.priceLabel}</span>
                    {pkg.id === 'yearly' && (
                      <span className="block text-xs text-[#8BAE5A] mt-1">10% korting t.o.v. maandelijks<br/>(€42 per maand)</span>
                    )}
                  </div>
                  <ul className="space-y-2 mb-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#B6C948]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('registration')}
              className="self-start px-10 py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg shadow-lg hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] uppercase tracking-wide"
            >
              Doorgaan naar registratie
            </button>
          </div>
        )}
        {step === 'registration' && (
          <form onSubmit={handleRegistration} className="flex flex-col gap-8 text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">Registratie</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#B6C948] text-lg md:text-xl font-semibold mb-2">Voornaam</label>
                <input
                  type="text"
                  name="firstName"
                  value={registration.firstName}
                  onChange={handleRegistrationChange}
                  className="w-full p-4 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23] text-lg md:text-xl font-normal"
                  required
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-lg md:text-xl font-semibold mb-2">Achternaam</label>
                <input
                  type="text"
                  name="lastName"
                  value={registration.lastName}
                  onChange={handleRegistrationChange}
                  className="w-full p-4 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23] text-lg md:text-xl font-normal"
                  required
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-lg md:text-xl font-semibold mb-2">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={registration.email}
                  onChange={handleRegistrationChange}
                  className="w-full p-4 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23] text-lg md:text-xl font-normal"
                  required
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-lg md:text-xl font-semibold mb-2">Wachtwoord</label>
                <input
                  type="password"
                  name="password"
                  value={registration.password}
                  onChange={handleRegistrationChange}
                  className="w-full p-4 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23] text-lg md:text-xl font-normal"
                  required
                />
              </div>
            </div>
            <button type="submit" className="self-start px-10 py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg shadow-lg hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] uppercase tracking-wide">
              Registreren
            </button>
          </form>
        )}
        {step === 'payment' && (
          <PaymentModal
            isOpen={step === 'payment'}
            planId={packageChoice}
            onSuccess={() => {
              setStep('success');
              router.push('/dashboard');
            }}
            onClose={() => setStep('package')}
            user={{
              id: 'temp-user-id',
              email: registration.email,
              full_name: `${registration.firstName} ${registration.lastName}`
            }}
          />
        )}
        {step === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#B6C948] mb-4">✅ Registratie succesvol!</h2>
            <p className="text-[#B6C948] mb-8 text-lg">Welkom bij Top Tier Men! Je account is succesvol aangemaakt.</p>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-semibold text-lg hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200"
            >
              Ga naar Dashboard
            </button>
          </div>
        )}
        {showEmailVerification && registeredEmail && (
          <EmailVerificationModal
            isOpen={showEmailVerification}
            email={registeredEmail}
            onVerified={handleEmailVerified}
            onClose={() => setShowEmailVerification(false)}
          />
        )}
        {showWelcomeEmail && registeredUserName && (
          <WelcomeEmailModal
            isOpen={showWelcomeEmail}
            userName={registeredUserName}
            onComplete={handleWelcomeComplete}
            onClose={handleWelcomeComplete}
          />
        )}
      </div>
    </div>
  );
} 