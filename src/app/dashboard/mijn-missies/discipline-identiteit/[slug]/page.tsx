"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const lessons = [
  {
    title: "Introductie & Welkom",
    slug: "introductie",
    duration: "2 min",
    video: "https://www.youtube.com/embed/26U_seo0a1g",
    description: "Welkom bij de module! In deze les maak je kennis met het programma en de doelen.",
    content: (
      <>
        <p className="mb-4 text-[#B6C948]">Welkom bij de module <b>Discipline & Identiteit</b>. In deze module leer je hoe je een sterke basis legt voor blijvende groei. Bekijk de introductievideo en lees de leerdoelen.</p>
        <blockquote className="border-l-4 border-[#8BAE5A] pl-4 italic text-[#8BAE5A] mb-4">“Discipline is the bridge between goals and accomplishment.”</blockquote>
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
    content: (
      <>
        <h3 className="text-lg font-bold text-white mb-2">Reflectie</h3>
        <p className="mb-4 text-[#B6C948]">Gefeliciteerd! Je hebt de module afgerond. Tijd om te reflecteren en je kennis te testen.</p>
        <Quiz />
      </>
    ),
  },
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

function Quiz() {
  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const correct = answers.filter((a, i) => a === quizQuestions[i].answer).length;
  const passed = submitted && correct / quizQuestions.length >= 0.8;

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
          disabled={answers.includes(null)}
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
              onClick={() => { setAnswers(Array(quizQuestions.length).fill(null)); setSubmitted(false); }}
            >
              Opnieuw proberen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const idx = lessons.findIndex(l => l.slug === slug);
  const lesson = lessons[idx];
  const prev = idx > 0 ? lessons[idx-1] : null;
  const next = idx < lessons.length-1 ? lessons[idx+1] : null;
  const progress = Math.round(((idx + 1) / lessons.length) * 100);

  if (!lesson) return (
    <div className="p-6 md:p-12 text-center text-white">Les niet gevonden.</div>
  );

  return (
    <div className="p-6 md:p-12">
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{lesson.title}</h1>
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
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 mb-8 border border-[#3A4D23]">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">Over deze les</h2>
        <p className="text-[#B6C948] text-lg mb-4">{lesson.description}</p>
        {lesson.content}
      </div>
      <div className="flex justify-between">
        {prev ? (
          <Link href={`/dashboard/mijn-missies/discipline-identiteit/${prev.slug}`} className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition">
            ← {prev.title}
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/dashboard/mijn-missies/discipline-identiteit/${next.slug}`} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition">
            Volgende les →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
} 