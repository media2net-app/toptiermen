'use client';
import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';

interface Exercise {
  id: number;
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: string;
  video_url?: string;
}

interface SchemaExercise {
  id?: number;
  exercise_id?: number;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_time: number;
  order_index: number;
  exercise?: Exercise;
}

interface TrainingDay {
  id?: number;
  schema_id?: number;
  day_number: number;
  name: string;
  description?: string;
  exercises: SchemaExercise[];
}

interface TrainingSchema {
  id?: number;
  name: string;
  description: string;
  category: 'Gym' | 'Outdoor' | 'Home';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  days: TrainingDay[];
  status: 'draft' | 'published' | 'archived';
}

interface SchemaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  schema?: TrainingSchema;
  onSave: (schema: TrainingSchema) => void;
}

export default function SchemaBuilder({ isOpen, onClose, schema, onSave }: SchemaBuilderProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [formData, setFormData] = useState<TrainingSchema>({
    name: '',
    description: '',
    category: 'Gym',
    difficulty: 'Beginner',
    days: [],
    status: 'draft'
  });

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
      if (schema) {
        // Transform database schema to form data
        const transformedSchema: TrainingSchema = {
          id: schema.id,
          name: schema.name,
          description: schema.description,
          category: schema.category,
          difficulty: schema.difficulty,
          days: schema.days?.map((day: any) => ({
            id: day.id,
            schema_id: day.schema_id,
            day_number: day.day_number,
            name: day.name,
            description: day.description,
            exercises: day.exercises?.map((exercise: any) => ({
              id: exercise.id,
              exercise_id: exercise.exercise_id,
              exercise_name: exercise.exercise_name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_time: exercise.rest_time,
              order_index: exercise.order_index
            })) || []
          })) || [],
          status: schema.status
        };
        setFormData(transformedSchema);
      } else {
        setFormData({
          name: '',
          description: '',
          category: 'Gym',
          difficulty: 'Beginner',
          days: [],
          status: 'draft'
        });
      }
    }
  }, [isOpen, schema]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Fout bij het ophalen van oefeningen');
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = !selectedMuscle || exercise.primary_muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const muscleGroups = Array.from(new Set(exercises.map(e => e.primary_muscle))).sort();

  const addDay = () => {
    const newDay: TrainingDay = {
      day_number: formData.days.length + 1,
      name: `Dag ${formData.days.length + 1}`,
      description: '',
      exercises: []
    };
    setFormData(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }));
  };

  const removeDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.filter((_, index) => index !== dayIndex)
    }));
  };

  const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
    const newExercise: SchemaExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: 3,
      reps: '8-12',
      rest_time: 90,
      order_index: formData.days[dayIndex].exercises.length,
      exercise: exercise
    };

    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    }));
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? { ...day, exercises: day.exercises.filter((_, exIndex) => exIndex !== exerciseIndex) }
          : day
      )
    }));
  };

  const updateExerciseInDay = (dayIndex: number, exerciseIndex: number, field: keyof SchemaExercise, value: any) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? {
              ...day,
              exercises: day.exercises.map((exercise, exIndex) => 
                exIndex === exerciseIndex 
                  ? { ...exercise, [field]: value }
                  : exercise
              )
            }
          : day
      )
    }));
  };

  const updateDay = (dayIndex: number, field: keyof TrainingDay, value: any) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? { ...day, [field]: value }
          : day
      )
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Check if dragging from library
    if (source.droppableId === 'library') {
      const exerciseId = parseInt(result.draggableId.replace('library-', ''));
      const exercise = exercises.find(e => e.id === exerciseId);
      const destDayIndex = parseInt(destination.droppableId);
      const destExerciseIndex = destination.index;

      if (exercise) {
        const newExercise: SchemaExercise = {
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          sets: 3,
          reps: '8-12',
          rest_time: 90,
          order_index: destExerciseIndex,
          exercise: exercise
        };

        setFormData(prev => ({
          ...prev,
          days: prev.days.map((day, index) => {
            if (index === destDayIndex) {
              const newExercises = Array.from(day.exercises);
              newExercises.splice(destExerciseIndex, 0, newExercise);
              // Update order_index for all exercises
              newExercises.forEach((ex, exIndex) => {
                ex.order_index = exIndex;
              });
              return { ...day, exercises: newExercises };
            }
            return day;
          })
        }));
      }
      return;
    }

    const sourceDayIndex = parseInt(source.droppableId);
    const destDayIndex = parseInt(destination.droppableId);
    const sourceExerciseIndex = source.index;
    const destExerciseIndex = destination.index;

    // Same day, reorder within the day
    if (sourceDayIndex === destDayIndex) {
      const day = formData.days[sourceDayIndex];
      const newExercises = Array.from(day.exercises);
      const [removed] = newExercises.splice(sourceExerciseIndex, 1);
      newExercises.splice(destExerciseIndex, 0, removed);

      // Update order_index for all exercises in this day
      newExercises.forEach((exercise, index) => {
        exercise.order_index = index;
      });

      setFormData(prev => ({
        ...prev,
        days: prev.days.map((day, index) => 
          index === sourceDayIndex 
            ? { ...day, exercises: newExercises }
            : day
        )
      }));
    } else {
      // Different days, move between days
      const sourceDay = formData.days[sourceDayIndex];
      const destDay = formData.days[destDayIndex];
      
      const sourceExercises = Array.from(sourceDay.exercises);
      const destExercises = Array.from(destDay.exercises);
      
      const [movedExercise] = sourceExercises.splice(sourceExerciseIndex, 1);
      destExercises.splice(destExerciseIndex, 0, movedExercise);

      // Update order_index for both days
      sourceExercises.forEach((exercise, index) => {
        exercise.order_index = index;
      });
      destExercises.forEach((exercise, index) => {
        exercise.order_index = index;
      });

      setFormData(prev => ({
        ...prev,
        days: prev.days.map((day, index) => {
          if (index === sourceDayIndex) {
            return { ...day, exercises: sourceExercises };
          } else if (index === destDayIndex) {
            return { ...day, exercises: destExercises };
          }
          return day;
        })
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Vul een naam in voor het schema');
      return;
    }

    if (formData.days.length === 0) {
      toast.error('Voeg minimaal één dag toe aan het schema');
      return;
    }

    setLoading(true);
    try {
      // Save schema
      const { data: schemaData, error: schemaError } = await supabase
        .from('training_schemas')
        .upsert({
          id: formData.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty,
          status: formData.status
        })
        .select()
        .single();

      if (schemaError) throw schemaError;

      const schemaId = schemaData.id;

      // Save days
      for (let i = 0; i < formData.days.length; i++) {
        const day = formData.days[i];
        const { data: dayData, error: dayError } = await supabase
          .from('training_schema_days')
          .upsert({
            id: day.id,
            schema_id: schemaId,
            day_number: day.day_number,
            name: day.name,
            description: day.description
          })
          .select()
          .single();

        if (dayError) throw dayError;

        const dayId = dayData.id;

        // Save exercises for this day
        for (let j = 0; j < day.exercises.length; j++) {
          const exercise = day.exercises[j];
          await supabase
            .from('training_schema_exercises')
            .upsert({
              id: exercise.id,
              schema_day_id: dayId,
              exercise_id: exercise.exercise_id,
              exercise_name: exercise.exercise_name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_time: exercise.rest_time,
              order_index: exercise.order_index
            });
        }
      }

      toast.success('Schema succesvol opgeslagen!');
      onSave({ ...formData, id: schemaId });
      onClose();
    } catch (error) {
      console.error('Error saving schema:', error);
      toast.error('Fout bij het opslaan van het schema');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181F17] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {schema ? 'Bewerk Training Schema' : 'Nieuw Training Schema'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-[calc(90vh-120px)]">
            {/* Left side - Schema details and days */}
            <div className="w-2/3 p-6 overflow-y-auto">
              {/* Schema details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Schema Naam
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                    placeholder="Bijv. Full Body Krachttraining"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                    rows={3}
                    placeholder="Beschrijf het schema..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                    >
                      <option value="Gym">Gym</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Niveau
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Status</label>
                    <select
                      className="w-full rounded-lg border border-gray-700 bg-[#232B1A] text-white p-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'archived' }))}
                    >
                      <option value="draft">Concept</option>
                      <option value="published">Gepubliceerd</option>
                      <option value="archived">Gearchiveerd</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Days */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Training Dagen</h3>
                  <button
                    onClick={addDay}
                    className="flex items-center px-3 py-2 bg-[#8BAE5A] text-[#181F17] rounded-md hover:bg-[#B6C948]"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Dag Toevoegen
                  </button>
                </div>

                {formData.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={day.name}
                          onChange={(e) => updateDay(dayIndex, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                          placeholder="Dag naam"
                        />
                      </div>
                      <button
                        onClick={() => removeDay(dayIndex)}
                        className="ml-2 p-2 text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <textarea
                        value={day.description || ''}
                        onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                        rows={2}
                        placeholder="Dag beschrijving (optioneel)"
                      />
                    </div>

                    {/* Exercises in this day */}
                    <Droppable droppableId={dayIndex.toString()}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-2 min-h-[50px] ${snapshot.isDraggingOver ? 'bg-[#8BAE5A]/10 rounded-lg' : ''}`}
                        >
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <Draggable
                              key={`${dayIndex}-${exerciseIndex}`}
                              draggableId={`${dayIndex}-${exerciseIndex}`}
                              index={exerciseIndex}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center space-x-2 p-2 bg-gray-800 rounded ${
                                    snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="p-1 text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
                                  >
                                    <ArrowsUpDownIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{exercise.exercise_name}</div>
                                    <div className="text-xs text-gray-400">{exercise.exercise?.primary_muscle}</div>
                                  </div>
                                  <input
                                    type="number"
                                    value={exercise.sets}
                                    onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                                    placeholder="Sets"
                                  />
                                  <input
                                    type="text"
                                    value={exercise.reps}
                                    onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                                    placeholder="Reps"
                                  />
                                  <input
                                    type="number"
                                    value={exercise.rest_time}
                                    onChange={(e) => updateExerciseInDay(dayIndex, exerciseIndex, 'rest_time', parseInt(e.target.value))}
                                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                                    placeholder="Rest (s)"
                                  />
                                  <button
                                    onClick={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
                                    className="p-1 text-red-400 hover:text-red-300"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Exercise library */}
            <div className="w-1/3 border-l border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Oefeningen Bibliotheek</h3>
              
              {/* Search and filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                    placeholder="Zoek oefeningen..."
                  />
                </div>

                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-[#8BAE5A] focus:ring-2"
                >
                  <option value="">Alle spiergroepen</option>
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle}>{muscle}</option>
                  ))}
                </select>
              </div>

              {/* Exercise list */}
              <Droppable droppableId="library" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {filteredExercises.map((exercise) => (
                      <Draggable
                        key={`library-${exercise.id}`}
                        draggableId={`library-${exercise.id}`}
                        index={exercise.id}
                        isDragDisabled={formData.days.length === 0}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
                              snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''
                            } ${formData.days.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => {
                              if (formData.days.length > 0) {
                                addExerciseToDay(formData.days.length - 1, exercise);
                              }
                            }}
                          >
                            <div className="font-medium text-white">{exercise.name}</div>
                            <div className="text-sm text-gray-400">{exercise.primary_muscle}</div>
                            <div className="text-xs text-gray-500">{exercise.equipment} • {exercise.difficulty}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700 sticky bottom-0 bg-gray-900 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-md hover:bg-[#B6C948] disabled:opacity-50"
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
} 