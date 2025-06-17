"use client";
import { useState } from "react";
import Link from "next/link";

const tabs = ["Overzicht", "Inhoud", "Reviews"];

const lessons = [
  { title: "Introductie & Welkom", slug: "introductie", duration: "2 min" },
  { title: "Wat is discipline?", slug: "discipline", duration: "12 min" },
  { title: "Identiteit: wie ben jij?", slug: "identiteit", duration: "10 min" },
  { title: "Gewoontes en routines", slug: "gewoontes", duration: "15 min" },
  { title: "Dagelijkse opdrachten", slug: "opdrachten", duration: "8 min" },
  { title: "Reflectie & afsluiting", slug: "reflectie", duration: "5 min" },
];

export default function DisciplineIdentiteit() {
  const [activeTab, setActiveTab] = useState("Overzicht");
  return (
    <div className="p-6 md:p-12">
      {/* Voortgangsbalk */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#8BAE5A] font-semibold">Voortgang module</span>
          <span className="text-[#8BAE5A] font-bold">80%</span>
        </div>
        <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full">
          <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `80%` }}></div>
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Discipline & Identiteit</h1>
          <p className="text-[#8BAE5A] font-semibold mb-1">Module 1 van 6</p>
          <p className="text-[#B6C948] text-lg max-w-xl">Ontdek de kracht van discipline en bouw aan een onwankelbare identiteit. Start hier jouw transformatie!</p>
          <Link href="/dashboard/mijn-missies/discipline-identiteit/introductie">
            <button className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-200 border border-[#8BAE5A]">
              Start module
            </button>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-64 h-36 bg-[#181F17] rounded-xl flex items-center justify-center overflow-hidden border border-[#3A4D23]">
            <iframe
              src="https://www.youtube.com/embed/26U_seo0a1g"
              title="Introductievideo Discipline & Identiteit"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full rounded-xl"
            ></iframe>
          </div>
          <span className="text-xs text-[#8BAE5A] mt-1">Introductievideo</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#3A4D23] mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-all duration-150 ${activeTab === tab ? 'bg-[#232D1A] text-[#8BAE5A] border-b-2 border-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 mb-8 border border-[#3A4D23] min-h-[300px]">
        {activeTab === "Overzicht" && (
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A] mb-2">Wat ga je leren?</h2>
            <ul className="list-disc pl-6 text-[#B6C948] mb-4">
              <li>De fundamenten van discipline en identiteit</li>
              <li>Praktische tools om je gewoontes te veranderen</li>
              <li>Hoe je een onwankelbare mindset bouwt</li>
              <li>Zelfreflectie en dagelijkse routines</li>
            </ul>
            <h3 className="text-xl font-semibold text-white mb-1">Beschrijving</h3>
            <p className="text-[#B6C948]">Deze module helpt je om de basis te leggen voor blijvende groei. Je leert niet alleen wát discipline is, maar vooral hóe je het toepast in je dagelijks leven.</p>
          </div>
        )}
        {activeTab === "Inhoud" && (
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Inhoudsopgave</h2>
            <ol className="list-decimal pl-6 text-[#B6C948] space-y-2">
              {lessons.map((lesson, idx) => (
                <li key={lesson.slug} className="flex items-center justify-between group">
                  <Link href={`/dashboard/mijn-missies/discipline-identiteit/${lesson.slug}`} className="flex-1 font-semibold hover:text-[#8BAE5A] transition">
                    {lesson.title}
                  </Link>
                  <span className="ml-4 text-xs text-[#8BAE5A] group-hover:text-white transition">{lesson.duration}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {activeTab === "Reviews" && (
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Reviews</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">5.0</span>
              <span className="ml-2 text-[#8BAE5A]">★ ★ ★ ★ ★</span>
              <span className="ml-4 text-[#B6C948]">(12 reviews)</span>
            </div>
            <div className="space-y-4">
              <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-white font-semibold mb-1">“Super waardevol, direct toepasbaar!”</p>
                <span className="text-[#8BAE5A] text-sm">- Rick</span>
              </div>
              <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-white font-semibold mb-1">“Ik voel me veel sterker in mijn routines.”</p>
                <span className="text-[#8BAE5A] text-sm">- Sven</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Requirements & Docent */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <h3 className="text-xl font-bold text-[#8BAE5A] mb-2">Vereisten</h3>
          <ul className="list-disc pl-6 text-[#B6C948]">
            <li>Open mindset</li>
            <li>Dagelijks 15 min. tijd</li>
            <li>Pen & notitieboek</li>
          </ul>
        </div>
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] flex items-center gap-4">
          <img src="/profielfoto.png" alt="Docent" className="w-16 h-16 rounded-full border-2 border-[#8BAE5A] object-cover" />
          <div>
            <h4 className="text-lg font-bold text-white">Rick Culpers</h4>
            <p className="text-[#B6C948]">Coach & Mentor</p>
            <p className="text-[#8BAE5A] text-sm">“Samen bouwen aan jouw beste versie!”</p>
          </div>
        </div>
      </div>
      {/* Gerelateerde modules */}
      <div>
        <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">Andere modules</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#232D1A] rounded-2xl p-4 border border-[#3A4D23] flex flex-col items-center">
            <span className="text-2xl">🔥</span>
            <span className="font-semibold text-white mt-2">Fysieke Missies</span>
          </div>
          <div className="bg-[#232D1A] rounded-2xl p-4 border border-[#3A4D23] flex flex-col items-center">
            <span className="text-2xl">🧠</span>
            <span className="font-semibold text-white mt-2">Mindset & Focus</span>
          </div>
          <div className="bg-[#232D1A] rounded-2xl p-4 border border-[#3A4D23] flex flex-col items-center">
            <span className="text-2xl">💰</span>
            <span className="font-semibold text-white mt-2">Finance & Business</span>
          </div>
        </div>
      </div>
    </div>
  );
} 