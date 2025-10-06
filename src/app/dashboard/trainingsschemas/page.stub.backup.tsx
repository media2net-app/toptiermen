"use client";
import PageLayout from '@/components/PageLayout';
import { Suspense } from 'react';

function TrainingschemasContentSimple() {
  return (
    <div className="w-full p-6">
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Trainingsschemas</h1>
        <p className="text-gray-300">
          Deze pagina wordt momenteel vereenvoudigd opnieuw opgebouwd. Alle schema-detailpagina's en workouts blijven beschikbaar.
        </p>
      </div>
    </div>
  );
}

export default function TrainingschemasPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white">Laden…</div>}>
      <PageLayout title="Trainingsschemas">
        <TrainingschemasContentSimple />
      </PageLayout>
    </Suspense>
  );
}
