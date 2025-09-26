'use client';
import { useState, useEffect } from 'react';
import { 
  QuestionMarkCircleIcon, 
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  UserIcon,
  AcademicCapIcon,
  FireIcon,
  BookOpenIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SupportButtonProps {
  className?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SupportCategory {
  id: string;
  title: string;
  icon: any;
  faqs: FAQItem[];
}

const supportCategories: SupportCategory[] = [
  {
    id: 'technical',
    title: 'Technische Support',
    icon: WrenchScrewdriverIcon,
    faqs: [
      {
        question: 'Ik kan niet inloggen op het platform',
        answer: 'Controleer of je e-mailadres en wachtwoord correct zijn. Als je je wachtwoord bent vergeten, klik op "Wachtwoord vergeten" op de login pagina. Als het probleem aanhoudt, neem contact met ons op.'
      },
      {
        question: 'De pagina laadt niet of werkt traag',
        answer: 'Probeer je browser te verversen (F5 of Ctrl+R). Controleer je internetverbinding. Als het probleem aanhoudt, probeer een andere browser of wis je browser cache.'
      },
      {
        question: 'Ik zie geen content of afbeeldingen',
        answer: 'Controleer of JavaScript is ingeschakeld in je browser. Zorg ervoor dat je een moderne browser gebruikt (Chrome, Firefox, Safari, Edge). Probeer de pagina te verversen.'
      },
      {
        question: 'Mijn progressie wordt niet opgeslagen',
        answer: 'Zorg ervoor dat je bent ingelogd en dat je internetverbinding stabiel is. Probeer de pagina te verversen en controleer of je wijzigingen zijn opgeslagen. Als het probleem aanhoudt, neem contact met ons op.'
      }
    ]
  },
  {
    id: 'billing',
    title: 'Facturatie & Betalingen',
    icon: CreditCardIcon,
    faqs: [
      {
        question: 'Hoe kan ik mijn abonnement wijzigen?',
        answer: 'Ga naar je profiel instellingen en klik op "Abonnement beheren". Hier kun je je abonnement upgraden, downgraden of annuleren. Wijzigingen worden direct doorgevoerd.'
      },
      {
        question: 'Wanneer wordt mijn abonnement verlengd?',
        answer: 'Je abonnement wordt automatisch verlengd op dezelfde datum van de maand als je oorspronkelijke startdatum. Je ontvangt een e-mail bevestiging voor elke verlenging.'
      },
      {
        question: 'Kan ik mijn abonnement annuleren?',
        answer: 'Ja, je kunt je abonnement op elk moment annuleren via je profiel instellingen. Je behoudt toegang tot het platform tot het einde van je huidige factureringsperiode.'
      },
      {
        question: 'Ik heb een factuur nodig',
        answer: 'Je kunt je facturen downloaden via je profiel instellingen onder "Facturen". Alle facturen worden ook per e-mail verzonden naar je geregistreerde e-mailadres.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Profiel',
    icon: UserIcon,
    faqs: [
      {
        question: 'Hoe kan ik mijn profielgegevens wijzigen?',
        answer: 'Ga naar "Mijn Profiel" in het dashboard. Hier kun je je persoonlijke gegevens, voorkeuren en instellingen aanpassen. Vergeet niet om je wijzigingen op te slaan.'
      },
      {
        question: 'Hoe kan ik mijn wachtwoord wijzigen?',
        answer: 'Ga naar "Mijn Profiel" en klik op "Wachtwoord wijzigen". Voer je huidige wachtwoord in en kies een nieuw sterk wachtwoord. Zorg ervoor dat je wachtwoord minimaal 8 karakters bevat.'
      },
      {
        question: 'Kan ik mijn account verwijderen?',
        answer: 'Ja, je kunt je account verwijderen via je profiel instellingen. Let op: dit is een permanente actie en kan niet ongedaan worden gemaakt. Alle je data wordt permanent verwijderd.'
      },
      {
        question: 'Hoe kan ik mijn e-mailadres wijzigen?',
        answer: 'Ga naar "Mijn Profiel" en klik op "E-mailadres wijzigen". Je ontvangt een bevestigingsmail op je nieuwe e-mailadres. Klik op de link in de e-mail om de wijziging te bevestigen.'
      }
    ]
  },
  {
    id: 'training',
    title: 'Training & Voeding',
    icon: AcademicCapIcon,
    faqs: [
      {
        question: 'Hoe kan ik een trainingsschema aanpassen?',
        answer: 'Ga naar "Trainingsschemas" en selecteer het schema dat je wilt aanpassen. Klik op "Bewerken" om oefeningen toe te voegen, te verwijderen of aan te passen. Vergeet niet om je wijzigingen op te slaan.'
      },
      {
        question: 'Kan ik mijn eigen voedingsplan maken?',
        answer: 'Ja, ga naar "Voedingsplannen" en klik op "Nieuw Plan". Je kunt ingrediënten toevoegen, maaltijden plannen en je macro\'s aanpassen. Het systeem helpt je met suggesties en berekeningen.'
      },
      {
        question: 'Hoe werkt de progressie tracking?',
        answer: 'Het platform houdt automatisch je trainingen, voeding en challenges bij. Je kunt je progressie bekijken in het dashboard en gedetailleerde rapporten genereren.'
      },
      {
        question: 'Kan ik mijn data exporteren?',
        answer: 'Ja, ga naar "Mijn Profiel" en klik op "Data exporteren". Je kunt al je trainingsdata, voedingsplannen en progressie downloaden in CSV formaat.'
      }
    ]
  },
  {
    id: 'challenges',
    title: 'Challenges & Uitdagingen',
    icon: FireIcon,
    faqs: [
      {
        question: 'Hoe kan ik deelnemen aan een challenge?',
        answer: 'Ga naar "Challenges" en selecteer de challenge die je interessant vindt. Klik op "Start Challenge" om deel te nemen. Je ontvangt dagelijkse herinneringen en kunt je progressie bijhouden.'
      },
      {
        question: 'Wat gebeurt er als ik een challenge niet voltooi?',
        answer: 'Geen probleem! Challenges zijn bedoeld om je te motiveren, niet om je te straffen. Je kunt op elk moment stoppen en later opnieuw beginnen. Je behoudt alle punten die je hebt verdiend.'
      },
      {
        question: 'Hoe verdien ik punten?',
        answer: 'Je verdient punten door challenges te voltooien, trainingen af te ronden, en je doelen te behalen. Punten kunnen worden gebruikt voor badges en speciale beloningen.'
      },
      {
        question: 'Kan ik mijn eigen challenge maken?',
        answer: 'Momenteel kunnen alleen admins nieuwe challenges maken. Als je een idee hebt voor een challenge, neem contact met ons op via de support functie.'
      }
    ]
  },
  {
    id: 'academy',
    title: 'Academy & Content',
    icon: BookOpenIcon,
    faqs: [
      {
        question: 'Hoe kan ik toegang krijgen tot de Academy?',
        answer: 'De Academy is beschikbaar voor alle actieve leden. Ga naar "Academy" in het dashboard om alle beschikbare modules en lessen te bekijken. Sommige content is alleen beschikbaar voor premium leden.'
      },
      {
        question: 'Kan ik de lessen downloaden?',
        answer: 'Ja, de meeste lessen zijn beschikbaar als PDF download. Klik op de download knop bij elke les. Video content kan worden bekeken via het platform.'
      },
      {
        question: 'Hoe vaak wordt nieuwe content toegevoegd?',
        answer: 'We voegen regelmatig nieuwe content toe aan de Academy. Premium leden krijgen als eerste toegang tot nieuwe modules en exclusieve content.'
      },
      {
        question: 'Kan ik feedback geven op de lessen?',
        answer: 'Ja, we waarderen je feedback! Klik op de feedback knop bij elke les of neem contact met ons op via de support functie.'
      }
    ]
  }
];

export default function SupportButton({ className = '' }: SupportButtonProps) {
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowContactForm(false);
  };

  const handleContactSupport = () => {
    setShowContactForm(true);
    setSelectedCategory(null);
    setShowMyTickets(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowContactForm(false);
    setShowMyTickets(false);
  };

  const handleMyTickets = async () => {
    setShowMyTickets(true);
    setSelectedCategory(null);
    setShowContactForm(false);
    setLoadingTickets(true);
    
    try {
      // Get current user ID from auth context or localStorage
      const userId = localStorage.getItem('userId') || 'demo-user-id';
      
      const response = await fetch(`/api/tickets?userId=${userId}`);
      const data = await response.json();
      
      // Ensure we always set an array
      if (Array.isArray(data)) {
        setUserTickets(data);
      } else if (data && Array.isArray(data.tickets)) {
        setUserTickets(data.tickets);
      } else {
        console.error('Invalid tickets data:', data);
        setUserTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setUserTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    // Get user ID from auth context with proper validation
    if (!user || !user.id) {
      alert('Je moet ingelogd zijn om een support ticket aan te maken. Log eerst in en probeer het opnieuw.');
      return;
    }
    
    const ticketData = {
      userId: user.id,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      category: formData.get('category') as string
    };

    // Validate required fields
    if (!ticketData.subject || !ticketData.message || !ticketData.category) {
      alert('Alle velden zijn verplicht. Vul alle velden in en probeer het opnieuw.');
      return;
    }

    if (ticketData.message.length < 10) {
      alert('Je bericht moet minimaal 10 karakters lang zijn.');
      return;
    }

    try {
      console.log('🎫 Submitting ticket:', ticketData);
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        console.log('✅ Ticket created successfully:', responseData.data);
        alert('Je ticket is succesvol aangemaakt! We nemen zo snel mogelijk contact met je op.');
        handleBackToCategories();
      } else {
        console.error('❌ Failed to create ticket:', responseData);
        alert(`Fout bij het aanmaken van je ticket: ${responseData.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      alert('Er is een fout opgetreden bij het aanmaken van je ticket. Probeer het opnieuw.');
    }
  };

  const selectedCategoryData = supportCategories.find(cat => cat.id === selectedCategory);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 lg:bottom-6 ${className}`}
        aria-label="Support & FAQ"
      >
        <QuestionMarkCircleIcon className="w-7 h-7 text-[#181F17] mx-auto" />
      </button>

      {/* Support Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#232D1A] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-[#181F17]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {showContactForm ? 'Contact Support' : 
                     selectedCategory ? selectedCategoryData?.title : 'Waar kunnen we je mee helpen?'}
                  </h2>
                  <p className="text-[#8BAE5A] mt-1">
                    {showContactForm ? 'Stuur ons een bericht' : 
                     selectedCategory ? 'Veelgestelde vragen' : 'Kies een categorie voor hulp'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedCategory(null);
                  setShowContactForm(false);
                }}
                className="w-8 h-8 bg-[#3A4D23] rounded-lg flex items-center justify-center hover:bg-[#4A5D33] transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-[#8BAE5A]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {!selectedCategory && !showContactForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {supportCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className="flex items-center gap-4 p-4 bg-[#1A2313] rounded-lg hover:bg-[#3A4D23]/50 transition-all text-left group border border-transparent hover:border-[#8BAE5A]/30"
                      >
                        <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-lg flex items-center justify-center group-hover:bg-[#8BAE5A]/30 transition-colors">
                          <Icon className="w-6 h-6 text-[#8BAE5A] group-hover:text-[#B6C948] transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-[#B6C948] transition-colors">{category.title}</h3>
                          <p className="text-sm text-[#8BAE5A] group-hover:text-[#B6C948]/80 transition-colors">{category.faqs.length} veelgestelde vragen</p>
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* My Tickets Button */}
                  <button
                    onClick={handleMyTickets}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#8BAE5A]/20 to-[#B6C948]/20 border-2 border-[#8BAE5A]/30 rounded-lg hover:from-[#8BAE5A]/30 hover:to-[#B6C948]/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-[#8BAE5A]/30 rounded-lg flex items-center justify-center group-hover:bg-[#8BAE5A]/40 transition-colors">
                      <DocumentTextIcon className="w-6 h-6 text-[#8BAE5A] group-hover:text-[#B6C948] transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#B6C948] transition-colors">Mijn Tickets</h3>
                      <p className="text-sm text-[#8BAE5A] group-hover:text-[#B6C948]/80 transition-colors">Bekijk je support tickets</p>
                    </div>
                  </button>

                  {/* Contact Support Button */}
                  <button
                    onClick={handleContactSupport}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#8BAE5A]/20 to-[#B6C948]/20 border-2 border-[#8BAE5A]/30 rounded-lg hover:from-[#8BAE5A]/30 hover:to-[#B6C948]/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-[#8BAE5A]/30 rounded-lg flex items-center justify-center group-hover:bg-[#8BAE5A]/40 transition-colors">
                      <EnvelopeIcon className="w-6 h-6 text-[#8BAE5A] group-hover:text-[#B6C948] transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#B6C948] transition-colors">Schrijf een bericht</h3>
                      <p className="text-sm text-[#8BAE5A] group-hover:text-[#B6C948]/80 transition-colors">Direct contact met ons support team</p>
                    </div>
                  </button>
                </div>
              )}

              {/* FAQ Content */}
              {selectedCategory && selectedCategoryData && (
                <div className="space-y-4">
                  <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors mb-6 group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Terug naar categorieën
                  </button>

                  <div className="space-y-4 max-w-4xl mx-auto">
                    {selectedCategoryData.faqs.map((faq, index) => (
                      <div key={index} className="bg-[#1A2313] rounded-lg p-6 border border-[#3A4D23]/30 hover:border-[#8BAE5A]/30 transition-colors">
                        <h4 className="text-lg font-semibold text-white mb-3">{faq.question}</h4>
                        <p className="text-[#8BAE5A] leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-[#3A4D23]/20 rounded-lg border border-[#8BAE5A]/20">
                    <p className="text-[#8BAE5A] mb-3">Niet gevonden wat je zocht?</p>
                    <button
                      onClick={handleContactSupport}
                      className="flex items-center gap-2 text-[#B6C948] hover:text-[#8BAE5A] transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Schrijf een bericht aan support
                    </button>
                  </div>
                </div>
              )}

              {/* My Tickets */}
              {showMyTickets && (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors mb-6 group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Terug naar categorieën
                  </button>

                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-xl font-semibold text-white mb-6 text-center">Mijn Support Tickets</h3>
                    
                    {loadingTickets ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                        <p className="text-[#8BAE5A]">Tickets worden geladen...</p>
                      </div>
                    ) : !Array.isArray(userTickets) || userTickets.length === 0 ? (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-16 h-16 text-[#8BAE5A]/50 mx-auto mb-4" />
                        <p className="text-[#8BAE5A] text-lg mb-2">Geen tickets gevonden</p>
                        <p className="text-[#8BAE5A]/70">Je hebt nog geen support tickets aangemaakt.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userTickets.map((ticket) => (
                          <div key={ticket.id} className="bg-[#1A2313] rounded-lg p-6 border border-[#3A4D23]/30">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">{ticket.subject}</h4>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                                    ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                    ticket.status === 'resolved' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {ticket.status === 'open' ? 'Open' :
                                     ticket.status === 'in_progress' ? 'In behandeling' :
                                     ticket.status === 'resolved' ? 'Opgelost' : 'Gesloten'}
                                  </span>
                                  <span className="text-[#8BAE5A]">{new Date(ticket.created_at).toLocaleDateString('nl-NL')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-[#8BAE5A] mb-4">{ticket.message}</p>
                            
                            {ticket.admin_response && (
                              <div className="bg-[#3A4D23]/20 rounded-lg p-4 border-l-4 border-[#8BAE5A]">
                                <h5 className="text-white font-medium mb-2">Reactie van support:</h5>
                                <p className="text-[#8BAE5A]">{ticket.admin_response}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Form */}
              {showContactForm && (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors mb-6 group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Terug naar categorieën
                  </button>

                  <div className="bg-[#1A2313] rounded-lg p-6 max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold text-white mb-6 text-center">Stuur ons een bericht</h3>
                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Onderwerp
                        </label>
                        <input
                          type="text"
                          name="subject"
                          required
                          className="w-full px-4 py-3 bg-[#3A4D23] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] transition-colors"
                          placeholder="Korte beschrijving van je vraag"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Categorie
                        </label>
                        <select name="category" required className="w-full px-4 py-3 bg-[#3A4D23] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] transition-colors">
                          <option value="">Selecteer een categorie</option>
                          <option value="technical">Technische problemen</option>
                          <option value="billing">Facturatie & Betalingen</option>
                          <option value="account">Account & Profiel</option>
                          <option value="training">Training & Voeding</option>
                          <option value="challenges">Challenges & Uitdagingen</option>
                          <option value="academy">Academy & Content</option>
                          <option value="other">Anders</option>
                        </select>
                      </div>
                      
                      
                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Bericht
                        </label>
                        <textarea
                          name="message"
                          rows={6}
                          required
                          className="w-full px-4 py-3 bg-[#3A4D23] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] transition-colors resize-none"
                          placeholder="Beschrijf je vraag of probleem zo gedetailleerd mogelijk..."
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-semibold py-3 px-6 rounded-lg hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Verstuur bericht
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
