"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentArrowDownIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  difficulty: string;
  training_goal: string;
  rep_range: string;
  rest_time_seconds: number;
  equipment_type: string;
  created_at: string;
  updated_at: string;
  training_schema_days?: TrainingDay[];
}

interface TrainingDay {
  id: string;
  schema_id: string;
  day_number: number;
  name: string;
  description?: string;
  training_schema_exercises?: TrainingExercise[];
}

interface TrainingExercise {
  id: string;
  schema_day_id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_time: number;
  order_index: number;
  notes?: string;
}

interface BackupStatistics {
  totalSchemas: number;
  publishedSchemas: number;
  draftSchemas: number;
  totalDays: number;
  totalExercises: number;
  backupDate: string;
}

export default function TrainingschemasBackupPage() {
  const [schemas, setSchemas] = useState<TrainingSchema[]>([]);
  const [statistics, setStatistics] = useState<BackupStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<TrainingSchema | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllSchemas();
  }, []);

  const fetchAllSchemas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/training-schemas-backup');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch schemas');
      }

      setSchemas(result.data.schemas);
      setStatistics(result.data.statistics);
    } catch (err) {
      console.error('Error fetching schemas:', err);
      setError('Fout bij ophalen van trainingsschemas');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const exportAllSchemas = () => {
    const dataStr = JSON.stringify({ schemas, statistics }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `trainingschemas-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-400/20';
      case 'draft': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] text-lg">Laden van trainingsschemas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchAllSchemas}
            className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#A6C97B] transition font-semibold"
          >
            🔄 Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
            🏋️ Trainingsschemas Backup
          </h1>
          <p className="text-[#B6C948] text-lg">
            Volledige backup van alle trainingsschemas en hun data
          </p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={exportAllSchemas}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#A6C97B] transition font-semibold flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              📥 Export Alle Schemas
            </button>
            <button
              onClick={fetchAllSchemas}
              className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition font-semibold flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]"
            >
              <div className="flex items-center gap-3 mb-2">
                <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Totaal Schemas</h3>
              </div>
              <p className="text-3xl font-bold text-[#8BAE5A]">{statistics.totalSchemas}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-[#181F17] text-xs font-bold">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Gepubliceerd</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{statistics.publishedSchemas}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-[#181F17] text-xs font-bold">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Concept</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{statistics.draftSchemas}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]"
            >
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Totaal Dagen</h3>
              </div>
              <p className="text-3xl font-bold text-[#8BAE5A]">{statistics.totalDays}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]"
            >
              <div className="flex items-center gap-3 mb-2">
                <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Totaal Oefeningen</h3>
              </div>
              <p className="text-3xl font-bold text-[#8BAE5A]">{statistics.totalExercises}</p>
            </motion.div>
          </div>
        )}

        {/* Backup Info */}
        {statistics && (
          <div className="bg-[#232D1A] rounded-xl p-4 border border-[#3A4D23] mb-8">
            <div className="flex items-center gap-2 text-[#8BAE5A]">
              <ClockIcon className="w-5 h-5" />
              <span className="font-semibold">Backup gemaakt op:</span>
              <span>{new Date(statistics.backupDate).toLocaleString('nl-NL')}</span>
            </div>
          </div>
        )}

        {/* Schemas List */}
        <div className="space-y-4">
          {schemas.map((schema, index) => (
            <motion.div
              key={schema.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#232D1A] rounded-xl border border-[#3A4D23] overflow-hidden"
            >
              {/* Schema Header */}
              <div className="p-6 border-b border-[#3A4D23]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{schema.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(schema.status)}`}>
                        {schema.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(schema.difficulty)}`}>
                        {schema.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{schema.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span><strong>Categorie:</strong> {schema.category}</span>
                      <span><strong>Doel:</strong> {schema.training_goal}</span>
                      <span><strong>Reps:</strong> {schema.rep_range}</span>
                      <span><strong>Rust:</strong> {schema.rest_time_seconds}s</span>
                      <span><strong>Equipment:</strong> {schema.equipment_type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSchema(selectedSchema?.id === schema.id ? null : schema)}
                    className="ml-4 p-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Schema Details */}
              {selectedSchema?.id === schema.id && (
                <div className="p-6 bg-[#1A1F17]">
                  <h4 className="text-lg font-semibold text-white mb-4">Training Dagen ({schema.training_schema_days?.length || 0})</h4>
                  
                  {schema.training_schema_days && schema.training_schema_days.length > 0 ? (
                    <div className="space-y-3">
                      {schema.training_schema_days.map((day) => (
                        <div key={day.id} className="bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                          <button
                            onClick={() => toggleDay(day.id)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-[#2A3520] transition"
                          >
                            <div>
                              <h5 className="font-semibold text-white">Dag {day.day_number}: {day.name}</h5>
                              {day.description && (
                                <p className="text-sm text-gray-400 mt-1">{day.description}</p>
                              )}
                              <p className="text-sm text-[#8BAE5A] mt-1">
                                {day.training_schema_exercises?.length || 0} oefeningen
                              </p>
                            </div>
                            {expandedDays.has(day.id) ? (
                              <ChevronDownIcon className="w-5 h-5 text-[#8BAE5A]" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-[#8BAE5A]" />
                            )}
                          </button>
                          
                          {expandedDays.has(day.id) && day.training_schema_exercises && (
                            <div className="px-4 pb-4">
                              <div className="space-y-2">
                                {day.training_schema_exercises.map((exercise, exIndex) => (
                                  <div key={exercise.id} className="bg-[#1A1F17] rounded-lg p-3 border border-[#3A4D23]">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h6 className="font-medium text-white">{exercise.exercise_name}</h6>
                                        <p className="text-sm text-gray-400">
                                          {exercise.sets} sets × {exercise.reps} reps, {exercise.rest_time}s rust
                                        </p>
                                        {exercise.notes && (
                                          <p className="text-sm text-[#8BAE5A] mt-1">{exercise.notes}</p>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">#{exercise.order_index}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Geen training dagen gevonden voor dit schema.</p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
