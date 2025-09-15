'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  FireIcon,
  AcademicCapIcon,
  CheckIcon,
  PlayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  cover_image: string | null;
  status: string;
  estimated_duration: string;
  target_audience: string | null;
  training_goal: string;
  rep_range: string;
  rest_time_seconds: number;
  equipment_type: string;
  schema_nummer: number | null;
  training_schema_days?: {
    id: string;
    day_number: number;
    name: string;
    training_schema_exercises?: {
      id: string;
      exercise_name: string;
      sets: number;
      reps: string;
      rest_time_seconds: number;
      notes?: string;
    }[];
  }[];
}

export default function TrainingSchemaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [schema, setSchema] = useState<TrainingSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schemaId = params?.schemaId as string;

  useEffect(() => {
    fetchSchemaDetails();
  }, [schemaId]);

  const fetchSchemaDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/training-schemas');
      
      if (!response.ok) {
        throw new Error('Failed to fetch training schemas');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const foundSchema = data.schemas.find((s: TrainingSchema) => s.id === schemaId);
        
        if (foundSchema) {
          // Fetch detailed schema data including days and exercises
          const detailResponse = await fetch(`/api/training-schema-detail/${schemaId}`);
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            if (detailData.success) {
              setSchema(detailData.schema);
            } else {
              setSchema(foundSchema);
            }
          } else {
            setSchema(foundSchema);
          }
        } else {
          setError('Trainingsschema niet gevonden');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch training schemas');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schema details:', err);
      setError('Er is een fout opgetreden bij het laden van het trainingsschema.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/trainingsschemas');
  };

  const formatRestTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${schema?.name || 'Training Schema'} - Top Tier Men</title>
          <style>
            @page {
              margin: 20mm;
              size: A4;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #8BAE5A;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #8BAE5A;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .schema-title {
              font-size: 28px;
              font-weight: bold;
              color: #333;
              margin: 15px 0 10px 0;
            }
            .schema-info {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .info-item {
              text-align: center;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .day-section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .day-header {
              background-color: #8BAE5A;
              color: white;
              padding: 15px;
              border-radius: 8px 8px 0 0;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 0;
            }
            .exercises-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border-radius: 0 0 8px 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .exercises-table th {
              background-color: #3A4D23;
              color: white;
              padding: 12px 8px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
            }
            .exercises-table td {
              padding: 12px 8px;
              text-align: center;
              border-bottom: 1px solid #e9ecef;
              font-size: 14px;
            }
            .exercises-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .exercise-name {
              text-align: left !important;
              font-weight: bold;
              color: #333;
            }
            .notes {
              text-align: left !important;
              font-style: italic;
              color: #666;
              font-size: 12px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e9ecef;
              padding-top: 20px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Top Tier Men</div>
            <div class="schema-title">${schema?.name || 'Training Schema'}</div>
            <div style="font-size: 14px; color: #666;">Gegenereerd op ${currentDate}</div>
          </div>

          <div class="schema-info">
            <div class="info-item">
              <div class="info-label">Doel</div>
              <div class="info-value">${schema?.training_goal || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Duur</div>
              <div class="info-value">${schema?.estimated_duration || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Dagen</div>
              <div class="info-value">${schema?.training_schema_days?.length || 0} dagen</div>
            </div>
            <div class="info-item">
              <div class="info-label">Rep Range</div>
              <div class="info-value">${schema?.rep_range || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Equipment</div>
              <div class="info-value">${schema?.equipment_type || 'N/A'}</div>
            </div>
          </div>

          ${schema?.description ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Beschrijving</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">${schema.description}</p>
            </div>
          ` : ''}

          ${schema?.training_schema_days && schema.training_schema_days.length > 0 ? 
            schema.training_schema_days
              .sort((a, b) => a.day_number - b.day_number)
              .map(day => `
                <div class="day-section">
                  <h2 class="day-header">Dag ${day.day_number} - ${day.name}</h2>
                  <table class="exercises-table">
                    <thead>
                      <tr>
                        <th style="width: 40%;">Oefening</th>
                        <th style="width: 15%;">Sets</th>
                        <th style="width: 15%;">Reps</th>
                        <th style="width: 15%;">Rust</th>
                        <th style="width: 15%;">Gewicht</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${day.training_schema_exercises && day.training_schema_exercises.length > 0 ? 
                        day.training_schema_exercises.map(exercise => `
                          <tr>
                            <td class="exercise-name">
                              ${exercise.exercise_name}
                              ${exercise.notes ? `<br><span class="notes">${exercise.notes}</span>` : ''}
                            </td>
                            <td>${exercise.sets}</td>
                            <td>${exercise.reps}</td>
                            <td>${formatRestTime(exercise.rest_time_seconds)}</td>
                            <td>___ kg</td>
                          </tr>
                        `).join('') : 
                        '<tr><td colspan="5" style="text-align: center; color: #666; font-style: italic;">Geen oefeningen beschikbaar</td></tr>'
                      }
                    </tbody>
                  </table>
                </div>
              `).join('') : 
            '<div style="text-align: center; color: #666; font-style: italic; margin: 40px 0;">Geen trainingsdagen beschikbaar</div>'
          }

          <div class="footer">
            <p>Top Tier Men - Trainingsschema</p>
            <p>Gegenereerd op ${currentDate}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return (
      <PageLayout title="Trainingsschema" subtitle="Laden...">
        <div className="w-full">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !schema) {
    return (
      <PageLayout title="Trainingsschema" subtitle="Fout">
        <div className="w-full">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Fout</h2>
            <p className="text-red-300 mb-4">{error || 'Trainingsschema niet gevonden'}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors"
            >
              ← Terug naar overzicht
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={schema.name}
      subtitle="Gedetailleerd trainingsschema"
    >
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={createBreadcrumbs('Trainingsschemas', schema.name)} />
      </div>
      
      <div className="w-full">
        {/* Schema Header */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A] rounded-lg flex items-center justify-center mr-4">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {schema.name}
                  {schema.schema_nummer && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/30">
                      Schema {schema.schema_nummer}
                    </span>
                  )}
                </h1>
                <p className="text-[#8BAE5A] text-lg">{schema.training_goal}</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Terug
            </button>
          </div>
          
          {schema.description && (
            <p className="text-[#8BAE5A] text-lg leading-relaxed mb-4">
              {schema.description}
            </p>
          )}

          {/* Schema Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#3A4D23] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ClockIcon className="w-4 h-4 text-[#8BAE5A]" />
                <span className="text-sm text-gray-400">Duur</span>
              </div>
              <p className="text-white font-semibold">{schema.estimated_duration}</p>
            </div>
            
            <div className="bg-[#3A4D23] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FireIcon className="w-4 h-4 text-[#8BAE5A]" />
                <span className="text-sm text-gray-400">Dagen</span>
              </div>
              <p className="text-white font-semibold">{schema.training_schema_days?.length || 0} dagen</p>
            </div>
            
            <div className="bg-[#3A4D23] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AcademicCapIcon className="w-4 h-4 text-[#8BAE5A]" />
                <span className="text-sm text-gray-400">Reps</span>
              </div>
              <p className="text-white font-semibold">{schema.rep_range}</p>
            </div>
            
            <div className="bg-[#3A4D23] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckIcon className="w-4 h-4 text-[#8BAE5A]" />
                <span className="text-sm text-gray-400">Equipment</span>
              </div>
              <p className="text-white font-semibold">{schema.equipment_type}</p>
            </div>
          </div>
        </div>

        {/* Training Days */}
        {schema.training_schema_days && schema.training_schema_days.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Trainingsdagen</h2>
            
            {schema.training_schema_days
              .sort((a, b) => a.day_number - b.day_number)
              .map((day, dayIndex) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.1 }}
                  className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                      <span className="text-[#232D1A] font-bold text-sm">{day.day_number}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{day.name}</h3>
                  </div>

                  {/* Exercises */}
                  {day.training_schema_exercises && day.training_schema_exercises.length > 0 ? (
                    <div className="space-y-3">
                      {day.training_schema_exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={exercise.id}
                          className="bg-[#3A4D23] rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                              <span className="text-[#232D1A] font-bold text-xs">{exerciseIndex + 1}</span>
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{exercise.exercise_name}</h4>
                              {exercise.notes && (
                                <p className="text-gray-400 text-sm">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-gray-400">Sets</p>
                              <p className="text-white font-semibold">{exercise.sets}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Reps</p>
                              <p className="text-white font-semibold">{exercise.reps}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Rust</p>
                              <p className="text-white font-semibold">{formatRestTime(exercise.rest_time_seconds)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#3A4D23] rounded-lg p-4 text-center">
                      <p className="text-gray-400">Geen oefeningen beschikbaar voor deze dag</p>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Terug naar overzicht
          </button>
          
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center gap-2"
          >
            <PrinterIcon className="w-5 h-5" />
            Print Schema
          </button>
          
          <button
            onClick={() => {
              // Navigate back to schemas page and select this schema
              router.push(`/dashboard/trainingsschemas?select=${schemaId}`);
            }}
            className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors flex items-center gap-2"
          >
            <PlayIcon className="w-5 h-5" />
            Selecteer dit schema
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
