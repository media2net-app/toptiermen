"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const lessons = [
  {
    title: "Introductie & Welkom",
    slug: "introductie",
    duration: "2 min",
    video: "https://www.youtube.com/embed/26U_seo0a1g",
    description: "Welkom bij de module! In deze les maak je kennis met het programma en de doelen.",
    keyTakeaways: [
      "Discipline is de brug tussen doelen en prestaties",
      "Je identiteit bepaalt je gedrag en resultaten", 
      "Kleine dagelijkse acties leiden tot grote veranderingen"
    ],
    mission: {
      title: "Jouw Missie",
      description: "Open nu de Mijn Missies pagina en voeg voor morgen de missie '30 minuten lezen voor 9:00' toe.",
      action: "Ga naar Mijn Missies",
      href: "/dashboard/mijn-missies"
    },
    content: (
      <>
        <p className="mb-4 text-[#B6C948]">Welkom bij de module <b>Discipline & Identiteit</b>. In deze module leer je hoe je een sterke basis legt voor blijvende groei. Bekijk de introductievideo en lees de leerdoelen.</p>
        <blockquote className="border-l-4 border-[#8BAE5A] pl-4 italic text-[#8BAE5A] mb-4">"Discipline is the bridge between goals and accomplishment."</blockquote>
        <ul className="list-disc pl-6 text-[#8BAE5A] mb-4">
          <li>Wat is discipline?</li>
          <li>Hoe bouw je een sterke identiteit?</li>
          <li>Praktische opdrachten en reflectie</li>
        </ul>
      </>
    ),
  },
  {
    title: "Wat is discipline?",
    slug: "discipline",
    duration: "12 min",
    video: "https://www.youtube.com/embed/26U_seo0a1g",
    description: "Leer wat discipline écht betekent en waarom het de basis is voor succes.",
    keyTakeaways: [
      "Discipline is het vermogen om te doen wat nodig is, ook als je geen zin hebt",
      "Het is een spier die je kunt trainen door consistentie",
      "Zelfdiscipline is de sleutel tot succes op elk vlak"
    ],
    mission: {
      title: "Jouw Missie",
      description: "Identificeer vandaag nog 3 gebieden waar je meer discipline wilt ontwikkelen.",
      action: "Open Dankbaarheidsdagboek",
      href: "/dashboard/mind-en-focus/dankbaarheid"
    },
    content: (
      <>
        <h3 className="text-lg font-bold text-white mb-2">Theorie</h3>
        <p className="mb-4 text-[#B6C948]">Discipline is het vermogen om te doen wat nodig is, ook als je er geen zin in hebt. Het is een spier die je kunt trainen. <b>Zelfdiscipline</b> is de sleutel tot succes op elk vlak van je leven.</p>
        <h3 className="text-lg font-bold text-white mb-2">Opdracht</h3>
        <p className="mb-2 text-[#8BAE5A]">Schrijf op: Waarin ben jij al gedisciplineerd? Waar kun je nog groeien?</p>
      </>
    ),
  },
  {
    title: "Identiteit: wie ben jij?",
    slug: "identiteit",
    duration: "10 min",
    video: null,
    description: "Ontdek hoe je identiteit je gedrag en resultaten beïnvloedt.",
    keyTakeaways: [
      "Je identiteit bepaalt je gedrag en resultaten",
      "Identiteit is niet statisch, je kunt het vormen",
      "Nieuwe gewoontes en overtuigingen versterken je identiteit"
    ],
    mission: {
      title: "Jouw Missie",
      description: "Schrijf in je journal: 'Wie wil ik zijn?' en noteer 5 eigenschappen die daarbij horen.",
      action: "Open Journal",
      href: "/dashboard/mind-en-focus/dankbaarheid"
    },
    content: (
      <>
        <h3 className="text-lg font-bold text-white mb-2">Zelfbeeld</h3>
        <p className="mb-4 text-[#B6C948]">Je identiteit bepaalt je gedrag. Wie je denkt te zijn, bepaalt wat je doet. <b>Identiteit</b> is niet statisch, je kunt het vormen door nieuwe gewoontes en overtuigingen.</p>
        <h3 className="text-lg font-bold text-white mb-2">Reflectie</h3>
        <p className="mb-2 text-[#8BAE5A]">Beantwoord: Wie wil jij zijn? Welke eigenschappen horen daarbij?</p>
      </>
    ),
  },
  {
    title: "Gewoontes en routines",
    slug: "gewoontes",
    duration: "15 min",
    video: "https://www.youtube.com/embed/26U_seo0a1g",
    description: "Praktische tips om krachtige gewoontes en routines te bouwen.",
    keyTakeaways: [
      "Kleine dagelijkse acties leiden tot grote resultaten",
      "Focus op consistente routines in plaats van motivatie",
      "Begin met één nieuwe gewoonte en bouw geleidelijk op"
    ],
    mission: {
      title: "Jouw Missie",
      description: "Kies één nieuwe gewoonte en voeg deze toe aan je Mijn Missies voor de komende week.",
      action: "Ga naar Mijn Missies",
      href: "/dashboard/mijn-missies"
    },
    content: (
      <>
        <h3 className="text-lg font-bold text-white mb-2">Gewoontes bouwen</h3>
        <p className="mb-4 text-[#B6C948]">Kleine dagelijkse acties leiden tot grote resultaten. Focus op <b>consistente routines</b> in plaats van motivatie.</p>
        <h3 className="text-lg font-bold text-white mb-2">Opdracht</h3>
        <p className="mb-2 text-[#8BAE5A]">Kies één nieuwe gewoonte die je deze week wilt opbouwen. Noteer je plan.</p>
      </>
    ),
  },
  {
    title: "Dagelijkse opdrachten",
    slug: "opdrachten",
    duration: "8 min",
    video: null,
    description: "Aan de slag met opdrachten die je direct kunt toepassen.",
    keyTakeaways: [
      "Sta elke dag op hetzelfde tijdstip op",
      "Schrijf elke avond 3 dingen op waar je dankbaar voor bent",
      "Reflecteer dagelijks: wat ging goed, wat kan beter?"
    ],
    mission: {
      title: "Jouw Missie",
      description: "Start vandaag nog met de dagelijkse dankbaarheidsoefening in het Dankbaarheidsdagboek.",
      action: "Open Dankbaarheidsdagboek",
      href: "/dashboard/mind-en-focus/dankbaarheid"
    },
    content: (
      <>
        <h3 className="text-lg font-bold text-white mb-2">Praktijk</h3>
        <ul className="list-disc pl-6 text-[#B6C948] mb-4">
          <li>Sta elke dag op hetzelfde tijdstip op</li>
          <li>Schrijf elke avond 3 dingen op waar je dankbaar voor bent</li>
          <li>Reflecteer dagelijks: wat ging goed, wat kan beter?</li>
        </ul>
        <p className="mb-2 text-[#8BAE5A]">Voer deze opdrachten minimaal 5 dagen uit en noteer je ervaringen.</p>
      </>
    ),
  },
  {
    title: "Reflectie & afsluiting",
    slug: "reflectie",
    duration: "5 min",
    video: null,
    description: "Reflecteer op je groei en maak een plan voor de toekomst.",
    keyTakeaways: [
      "Reflectie is essentieel voor blijvende groei",
      "Evalueer je voortgang en stuur bij waar nodig",
      "Vier je successen en leer van je uitdagingen"
    ],
    mission: {
      title: "Jouw Missie",
      description: "Deel je ervaringen met de community in de Brotherhood Social Feed.",
      action: "Deel in Social Feed",
      href: "/dashboard/brotherhood/social-feed"
    },
    content: (
      <>
        <h3 className="text-lg font-bold text-white mb-2">Reflectie</h3>
        <p className="mb-4 text-[#B6C948]">Gefeliciteerd! Je hebt de module afgerond. Tijd om te reflecteren en je kennis te testen.</p>
        <p className="text-[#8BAE5A]">Scroll naar beneden om het examen te maken en de module af te ronden.</p>
      </>
    ),
  },
];

// Mock Q&A data
const qaData = [
  {
    id: 1,
    question: "Hoe lang duurt het voordat een nieuwe gewoonte automatisch wordt?",
    author: "@discipline_daniel",
    upvotes: 12,
    answers: [
      {
        id: 1,
        author: "@coach_rick",
        content: "Gemiddeld 21-66 dagen, afhankelijk van de complexiteit van de gewoonte. Begin klein en wees consistent!",
        isBestAnswer: true,
        upvotes: 8
      },
      {
        id: 2,
        author: "@younglion",
        content: "Ik merkte dat na 3 weken mijn ochtendroutine veel makkelijker ging. Het wordt echt automatisch!",
        isBestAnswer: false,
        upvotes: 5
      }
    ]
  },
  {
    id: 2,
    question: "Wat als ik een dag oversla? Moet ik opnieuw beginnen?",
    author: "@thegrindcoach",
    upvotes: 8,
    answers: [
      {
        id: 3,
        author: "@coach_rick",
        content: "Nee! Een dag overslaan is normaal. Focus op consistentie over tijd, niet op perfectie. Pak gewoon de draad weer op.",
        isBestAnswer: true,
        upvotes: 15
      }
    ]
  }
];

const quizQuestions = [
  {
    question: "Wat is de beste definitie van discipline?",
    options: [
      "Altijd doen wat je leuk vindt",
      "Het vermogen om te doen wat nodig is, ook als je geen zin hebt",
      "Nooit fouten maken",
      "Anderen vertellen wat ze moeten doen",
    ],
    answer: 1,
  },
  {
    question: "Hoe kun je je identiteit versterken?",
    options: [
      "Door nieuwe gewoontes en overtuigingen te ontwikkelen",
      "Door alles bij het oude te laten",
      "Door anderen te kopiëren",
      "Door alleen te dromen",
    ],
    answer: 0,
  },
  {
    question: "Wat is een goede dagelijkse opdracht?",
    options: [
      "Elke dag op hetzelfde tijdstip opstaan",
      "Af en toe iets nieuws proberen",
      "Wachten op motivatie",
      "Niets doen",
    ],
    answer: 0,
  },
  {
    question: "Wat doe je bij reflectie?",
    options: [
      "Jezelf evalueren en bijsturen",
      "Anderen de schuld geven",
      "Alles vergeten",
      "Niets veranderen",
    ],
    answer: 0,
  },
  {
    question: "Wat is belangrijker: motivatie of routine?",
    options: [
      "Motivatie",
      "Routine en consistentie",
      "Geluk",
      "Toeval",
    ],
    answer: 1,
  },
];

function KeyTakeaways({ takeaways }: { takeaways: string[] }) {
  return (
    <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 rounded-xl p-6 border border-[#8BAE5A]/30 mb-6">
      <h3 className="text-lg font-bold text-[#B6C948] mb-4 flex items-center">
        <span className="mr-2">🎯</span>
        De 3 Kerninzichten van deze Les
      </h3>
      <ul className="space-y-3">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start">
            <span className="text-[#8BAE5A] font-bold mr-3 mt-1">{index + 1}.</span>
            <span className="text-[#B6C948]">{takeaway}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MissionBlock({ mission }: { mission: any }) {
  return (
    <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#f0a14f]/10 rounded-xl p-6 border border-[#FFD700]/30 mb-6">
      <h3 className="text-lg font-bold text-[#FFD700] mb-3 flex items-center">
        <span className="mr-2">⚡</span>
        {mission.title}
      </h3>
      <p className="text-[#B6C948] mb-4">{mission.description}</p>
      <Link 
        href={mission.href}
        className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#f0a14f] text-[#181F17] font-bold hover:from-[#FFED4E] hover:to-[#FFD700] transition-all duration-200 shadow-lg"
      >
        <span className="mr-2">🚀</span>
        {mission.action}
      </Link>
    </div>
  );
}

function ShareInsightButton({ lessonTitle }: { lessonTitle: string }) {
  const [showModal, setShowModal] = useState(false);
  const [insight, setInsight] = useState("");

  const handleShare = () => {
    // Hier zou je de post naar de social feed sturen
    console.log("Sharing insight:", insight);
    setShowModal(false);
    setInsight("");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-200 shadow-lg flex items-center justify-center"
      >
        <span className="mr-2">💡</span>
        Deel jouw #1 inzicht
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#B6C948] mb-4">Deel je Inzicht</h3>
            <p className="text-[#8BAE5A] mb-4">
              Nieuw inzicht uit de Academy-les '{lessonTitle}':
            </p>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="Wat is jouw belangrijkste inzicht uit deze les?"
              className="w-full p-3 rounded-xl bg-[#181F17] border border-[#3A4D23] text-white placeholder-[#8BAE5A] mb-6 focus:outline-none focus:border-[#8BAE5A] h-24 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
              >
                Annuleren
              </button>
              <button
                onClick={handleShare}
                disabled={!insight.trim()}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition disabled:opacity-50"
              >
                Delen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QASection() {
  const [newQuestion, setNewQuestion] = useState("");
  const [showAskForm, setShowAskForm] = useState(false);

  return (
    <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23] mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#8BAE5A]">Vragen & Antwoorden</h2>
        <button
          onClick={() => setShowAskForm(true)}
          className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition"
        >
          Stel een vraag
        </button>
      </div>

      <div className="space-y-6">
        {qaData.map((qa) => (
          <div key={qa.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[#B6C948] font-semibold mb-1">{qa.question}</h3>
                <p className="text-[#8BAE5A] text-sm">{qa.author}</p>
              </div>
              <div className="flex items-center text-[#8BAE5A] text-sm">
                <span className="mr-1">🔼</span>
                {qa.upvotes}
              </div>
            </div>
            
            {qa.answers.map((answer) => (
              <div key={answer.id} className={`ml-4 mt-3 p-3 rounded-lg ${answer.isBestAnswer ? 'bg-[#8BAE5A]/10 border border-[#8BAE5A]' : 'bg-[#232D1A]'}`}>
                {answer.isBestAnswer && (
                  <div className="flex items-center text-[#8BAE5A] text-sm mb-2">
                    <span className="mr-1">✓</span>
                    Beste Antwoord
                  </div>
                )}
                <p className="text-[#B6C948] mb-2">{answer.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#8BAE5A] text-sm">{answer.author}</p>
                  <div className="flex items-center text-[#8BAE5A] text-sm">
                    <span className="mr-1">🔼</span>
                    {answer.upvotes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showAskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#B6C948] mb-4">Stel een Vraag</h3>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Wat wil je weten over deze les?"
              className="w-full p-3 rounded-xl bg-[#181F17] border border-[#3A4D23] text-white placeholder-[#8BAE5A] mb-6 focus:outline-none focus:border-[#8BAE5A] h-24 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAskForm(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  console.log("New question:", newQuestion);
                  setShowAskForm(false);
                  setNewQuestion("");
                }}
                disabled={!newQuestion.trim()}
                className="flex-1 px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-bold hover:bg-[#B6C948] transition disabled:opacity-50"
              >
                Vraag stellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Quiz({ onAnswersChange, onSubmittedChange }: { 
  onAnswersChange: (answers: number[]) => void; 
  onSubmittedChange: (submitted: boolean) => void; 
}) {
  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const correct = answers.filter((a, i) => a === quizQuestions[i].answer).length;
  const passed = submitted && correct / quizQuestions.length >= 0.8;
  const allAnswered = !answers.includes(null);

  // Share state with parent
  useEffect(() => {
    onAnswersChange(answers);
  }, [answers, onAnswersChange]);

  useEffect(() => {
    onSubmittedChange(submitted);
  }, [submitted, onSubmittedChange]);

  return (
    <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23] mt-6">
      <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">Examen: Test je kennis</h3>
      {quizQuestions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="text-white font-semibold mb-2">{i + 1}. {q.question}</p>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, j) => (
              <label key={j} className={`rounded px-3 py-2 cursor-pointer border transition ${answers[i] === j ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A]' : 'bg-[#232D1A] text-white border-[#3A4D23] hover:bg-[#8BAE5A]/20'}`}>
                <input
                  type="radio"
                  name={`q${i}`}
                  value={j}
                  checked={answers[i] === j}
                  onChange={() => {
                    if (!submitted) setAnswers(ans => { const copy = [...ans]; copy[i] = j; return copy; });
                  }}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
        >
          Examen afronden
        </button>
      ) : (
        <div className="mt-4">
          {passed ? (
            <div className="text-[#8BAE5A] font-bold text-lg">Gefeliciteerd! Je bent geslaagd voor deze module 🎉</div>
          ) : (
            <div className="text-red-400 font-bold text-lg">Helaas, je hebt niet voldoende vragen goed. Probeer het opnieuw!</div>
          )}
          <div className="mt-2 text-white">Juiste antwoorden: {correct} / {quizQuestions.length}</div>
          {!passed && (
            <button
              className="mt-2 px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-bold border border-[#8BAE5A] hover:bg-[#B6C948] transition"
              onClick={() => { 
                setAnswers(Array(quizQuestions.length).fill(null)); 
                setSubmitted(false); 
              }}
            >
              Opnieuw proberen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GraduationModal({ lesson, onClose }: { lesson: any; onClose: () => void }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [unlockNext, setUnlockNext] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setUnlockNext(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🏆', '⭐', '🎊', '💎'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#8BAE5A]/20 to-[#B6C948]/20 rounded-2xl"></div>
        
        <div className="relative z-10 text-center">
          {/* Badge Icon */}
          <div className="text-8xl mb-6 animate-pulse">🏆</div>
          
          {/* Congratulations Text */}
          <h2 className="text-3xl font-bold text-[#B6C948] mb-4">
            GEFELICITEERD!
          </h2>
          
          <p className="text-[#8BAE5A] text-lg mb-6 leading-relaxed">
            Je hebt zojuist <strong>Module 1: Discipline & Identiteit</strong> succesvol afgerond. 
            Je hebt de kennis verwerkt, de reflectie voltooid en een onmisbaar fundament voor je 
            verdere groei gelegd. We zijn trots op je prestatie.
          </p>
          
          {/* Badge Reward */}
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#f0a14f]/20 rounded-xl p-4 mb-6 border border-[#FFD700]/30">
            <div className="text-4xl mb-2">🏗️</div>
            <h3 className="text-[#FFD700] font-bold text-lg mb-1">Fundament Bouwer</h3>
            <p className="text-[#B6C948] text-sm">Badge ontgrendeld!</p>
          </div>
          
          {/* Next Steps */}
          <div className="space-y-3">
            <Link
              href="/dashboard/academy"
              onClick={() => {
                onClose();
                // Trigger unlock animation on academy page
                localStorage.setItem('unlockModule2', 'true');
              }}
              className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition text-center"
            >
              [&gt;] Start de Volgende Module: Fysieke Dominantie
            </Link>
            
            <Link
              href="/dashboard/academy"
              onClick={onClose}
              className="block w-full px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition text-center"
            >
              [⌂] Terug naar het Academy Overzicht
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionModal({ lesson, next, onClose }: { lesson: any; next: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-[#B6C948] mb-2">Les voltooid!</h3>
          <p className="text-[#8BAE5A]">Goed bezig! Je hebt '{lesson.title}' succesvol afgerond.</p>
        </div>
        
        <div className="space-y-4">
          {next && (
            <Link
              href={`/dashboard/academy/discipline-identiteit/${next.slug}`}
              onClick={onClose}
              className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition text-center"
            >
              [&gt;] Ga naar de volgende les: {next.title}
            </Link>
          )}
          
          {lesson.mission && (
            <Link
              href={lesson.mission.href}
              onClick={onClose}
              className="block w-full px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition text-center"
            >
              [+] Pas dit direct toe: {lesson.mission.action}
            </Link>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 rounded-xl bg-[#3A4D23] text-[#8BAE5A] font-semibold hover:bg-[#4A5D33] transition"
        >
          Sluiten
        </button>
      </div>
    </div>
  );
}

export default function LesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const idx = lessons.findIndex(l => l.slug === slug);
  const lesson = lessons[idx];
  const prev = idx > 0 ? lessons[idx-1] : null;
  const next = idx < lessons.length-1 ? lessons[idx+1] : null;
  const progress = Math.round(((idx + 1) / lessons.length) * 100);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [quizAnswers, setQuizAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Check if this is the final lesson and quiz is passed
  const isFinalLesson = idx === lessons.length - 1;
  const quizPassed = quizSubmitted && quizAnswers.filter((a, i) => a === quizQuestions[i].answer).length / quizQuestions.length >= 0.8;
  const allQuizAnswered = !quizAnswers.includes(null);
  const canGraduate = isFinalLesson && quizPassed && allQuizAnswered;

  if (!lesson) return (
    <div className="p-6 md:p-12 text-center text-white">Les niet gevonden.</div>
  );

  const handleModuleComplete = () => {
    if (!isFinalLesson) {
      setShowCompletionModal(true);
      return;
    }

    if (!allQuizAnswered) {
      setValidationMessage("Bijna klaar! Je hebt nog niet alle vragen beantwoord. Loop ze nog even na om af te ronden.");
      return;
    }

    if (!quizPassed) {
      setValidationMessage("Je moet eerst het examen succesvol afronden voordat je de module kunt voltooien.");
      return;
    }

    // All validations passed - show graduation modal
    setShowGraduationModal(true);
  };

  return (
    <div className="p-6 md:p-12">
      {/* Validation Message */}
      {validationMessage && (
        <div className="mb-6 p-4 bg-[#8BAE5A]/10 border border-[#8BAE5A] rounded-xl">
          <p className="text-[#8BAE5A] font-semibold">{validationMessage}</p>
          <button
            onClick={() => setValidationMessage("")}
            className="mt-2 text-[#8BAE5A] text-sm underline"
          >
            Sluiten
          </button>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#8BAE5A] font-semibold">Voortgang module</span>
          <span className="text-[#8BAE5A] font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full">
          <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">{lesson.title}</h1>
        <span className="text-[#8BAE5A] text-sm font-semibold">{lesson.duration}</span>
      </div>
      
      {lesson.video && (
        <div className="w-full aspect-video bg-[#181F17] rounded-xl flex items-center justify-center overflow-hidden border border-[#3A4D23] mb-6">
          <iframe
            src={lesson.video}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full rounded-xl"
          ></iframe>
        </div>
      )}
      
      {/* Key Takeaways - direct onder de video */}
      <KeyTakeaways takeaways={lesson.keyTakeaways} />
      
      {/* Share Insight Button */}
      <ShareInsightButton lessonTitle={lesson.title} />
      
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 mb-8 border border-[#3A4D23]">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">Over deze les</h2>
        <p className="text-[#B6C948] text-lg mb-4 break-words">{lesson.description}</p>
        {lesson.content}
      </div>
      
      {/* Mission Block */}
      {lesson.mission && <MissionBlock mission={lesson.mission} />}
      
      {/* Q&A Section */}
      <QASection />
      
      {/* Quiz Section - only show on final lesson */}
      {isFinalLesson && (
        <Quiz 
          onAnswersChange={setQuizAnswers}
          onSubmittedChange={setQuizSubmitted}
        />
      )}
      
      <div className="flex justify-between flex-wrap gap-3">
        {prev ? (
          <Link href={`/dashboard/academy/discipline-identiteit/${prev.slug}`} className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition">
            ← {prev.title}
          </Link>
        ) : <div />}
        
        {next ? (
          <button
            onClick={() => setShowCompletionModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
          >
            Les voltooien →
          </button>
        ) : (
          <button
            onClick={handleModuleComplete}
            disabled={!canGraduate}
            className={`px-6 py-3 rounded-xl font-bold border transition ${
              canGraduate 
                ? 'bg-gradient-to-r from-[#FFD700] to-[#f0a14f] text-[#181F17] border-[#FFD700] hover:from-[#FFED4E] hover:to-[#FFD700]' 
                : 'bg-[#3A4D23] text-[#8BAE5A]/50 border-[#3A4D23] cursor-not-allowed'
            }`}
          >
            {canGraduate ? 'Examen Inleveren & Afronden' : 'Module afronden'}
          </button>
        )}
      </div>
      
      {showCompletionModal && (
        <CompletionModal
          lesson={lesson}
          next={next}
          onClose={() => setShowCompletionModal(false)}
        />
      )}
      
      {showGraduationModal && (
        <GraduationModal
          lesson={lesson}
          onClose={() => setShowGraduationModal(false)}
        />
      )}
    </div>
  );
} 