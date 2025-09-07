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
import { toast } from 'react-hot-toast';

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
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
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
            exercises: (day.exercises || [])
              .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
              .map((exercise: any) => ({
                id: exercise.id,
                exercise_id: exercise.exercise_id,
                exercise_name: exercise.exercise_name,
                sets: exercise.sets,
                reps: exercise.reps,
                rest_time: exercise.rest_time,
                order_index: exercise.order_index ?? 0
              }))
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
      console.log('🔍 SchemaBuilder: Fetching exercises from database...');
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ SchemaBuilder: Error fetching exercises:', error);
        toast.error('Fout bij het ophalen van oefeningen');
        return;
      }
      
      console.log('✅ SchemaBuilder: Successfully fetched', data?.length || 0, 'exercises');
      console.log('📋 SchemaBuilder: First few exercises:', data?.slice(0, 3));
      setExercises(data || []);
    } catch (error) {
      console.error('❌ SchemaBuilder: Exception fetching exercises:', error);
      toast.error('Fout bij het ophalen van oefeningen');
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = !selectedMuscle || exercise.primary_muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  console.log('🔍 SchemaBuilder: Filtered exercises:', {
    totalExercises: exercises.length,
    searchTerm,
    selectedMuscle,
    filteredCount: filteredExercises.length,
    firstFewFiltered: filteredExercises.slice(0, 3)
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

  const showDaySelectorForExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowDaySelector(true);
  };

  const handleDaySelection = (dayIndex: number) => {
    if (selectedExercise) {
      addExerciseToDay(dayIndex, selectedExercise);
      toast.success(`${selectedExercise.name} toegevoegd aan Dag ${dayIndex + 1}`);
    }
    setShowDaySelector(false);
    setSelectedExercise(null);
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
    console.log('🎯 Drag end result:', result);
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    // Check if we have any days
    if (formData.days.length === 0) {
      console.log('❌ No days available for drag and drop');
      return;
    }

    console.log('📊 Source:', source);
    console.log('📍 Destination:', destination);
    console.log('📋 Form data days:', formData.days.length);

    // Check if dragging from library
    if (source.droppableId === 'library') {
      const exerciseId = parseInt(result.draggableId.replace('library-', ''));
      const exercise = exercises.find(e => e.id === exerciseId);
      const destDayIndex = parseInt(destination.droppableId.replace('day-', ''));
      const destExerciseIndex = destination.index;

      console.log('📚 Dragging from library:');
      console.log('  - Exercise ID:', exerciseId);
      console.log('  - Exercise found:', !!exercise);
      console.log('  - Dest day index:', destDayIndex);
      console.log('  - Dest exercise index:', destExerciseIndex);

      // Validate destination day index
      if (isNaN(destDayIndex) || destDayIndex < 0 || destDayIndex >= formData.days.length) {
        console.error('❌ Invalid destination day index:', destDayIndex);
        return;
      }

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

    const sourceDayIndex = parseInt(source.droppableId.replace('day-', ''));
    const destDayIndex = parseInt(destination.droppableId.replace('day-', ''));
    const sourceExerciseIndex = source.index;
    const destExerciseIndex = destination.index;

    console.log('🔄 Moving between days:');
    console.log('  - Source day index:', sourceDayIndex);
    console.log('  - Dest day index:', destDayIndex);
    console.log('  - Source exercise index:', sourceExerciseIndex);
    console.log('  - Dest exercise index:', destExerciseIndex);

    // Validate indices
    if (isNaN(sourceDayIndex) || sourceDayIndex < 0 || sourceDayIndex >= formData.days.length) {
      console.error('❌ Invalid source day index:', sourceDayIndex);
      return;
    }
    if (isNaN(destDayIndex) || destDayIndex < 0 || destDayIndex >= formData.days.length) {
      console.error('❌ Invalid dest day index:', destDayIndex);
      return;
    }

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

  const validateSchema = (schema: TrainingSchema): string | null => {
    if (!schema.name.trim()) {
      return 'Vul een naam in voor het schema';
    }

    if (schema.days.length === 0) {
      return 'Voeg minimaal één dag toe aan het schema';
    }

    for (let i = 0; i < schema.days.length; i++) {
      const day = schema.days[i];
      if (!day.name.trim()) {
        return `Dag ${i + 1} heeft geen naam`;
      }

      if (day.exercises.length === 0) {
        return `Dag ${i + 1} heeft geen oefeningen`;
      }

      for (let j = 0; j < day.exercises.length; j++) {
        const exercise = day.exercises[j];
        if (!exercise.exercise_name.trim()) {
          return `Oefening ${j + 1} in dag ${i + 1} heeft geen naam`;
        }
        if (exercise.sets <= 0) {
          return `Oefening ${j + 1} in dag ${i + 1} heeft ongeldig aantal sets`;
        }
        if (!exercise.reps.trim()) {
          return `Oefening ${j + 1} in dag ${i + 1} heeft geen reps`;
        }
        if (exercise.rest_time < 0) {
          return `Oefening ${j + 1} in dag ${i + 1} heeft ongeldige rusttijd`;
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateSchema(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      // Save schema
      console.log('Saving schema with data:', {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        status: formData.status
      });

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

      if (schemaError) {
        console.error('Schema save error:', schemaError);
        throw new Error(`Schema save failed: ${schemaError.message}`);
      }

      if (!schemaData) {
        throw new Error('No schema data returned after save');
      }

      const schemaId = schemaData.id;

      // Save days
      for (let i = 0; i < formData.days.length; i++) {
        const day = formData.days[i];
        console.log(`Saving day ${i + 1}:`, day);

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

        if (dayError) {
          console.error(`Day ${i + 1} save error:`, dayError);
          throw new Error(`Day save failed: ${dayError.message}`);
        }

        if (!dayData) {
          throw new Error(`No day data returned for day ${i + 1}`);
        }

        const dayId = dayData.id;

        // Save exercises for this day
        for (let j = 0; j < day.exercises.length; j++) {
          const exercise = day.exercises[j];
          console.log(`Saving exercise ${j + 1} for day ${i + 1}:`, exercise);

          const { error: exerciseError } = await supabase
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

          if (exerciseError) {
            console.error(`Exercise ${j + 1} save error:`, exerciseError);
            throw new Error(`Exercise save failed: ${exerciseError.message}`);
          }
        }
      }

      toast.success('Schema succesvol opgeslagen!');
      onSave({ ...formData, id: schemaId });
      onClose();
    } catch (error) {
      console.error('Error saving schema:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData
      });
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          toast.error('Schema naam bestaat al. Kies een andere naam.');
        } else if (error.message.includes('foreign key')) {
          toast.error('Ongeldige oefening geselecteerd. Controleer je schema.');
        } else if (error.message.includes('not null')) {
          toast.error('Vul alle verplichte velden in.');
        } else {
          toast.error(`Fout bij het opslaan van het schema: ${error.message}`);
        }
      } else {
        toast.error('Fout bij het opslaan van het schema');
      }
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
                  <div key={`day-${day.id || dayIndex}-${dayIndex}`} className="border border-gray-700 rounded-lg p-4">
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
                    <Droppable droppableId={`day-${dayIndex}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-2 min-h-[50px] ${snapshot.isDraggingOver ? 'bg-[#8BAE5A]/10 rounded-lg' : ''}`}
                        >
                          {/* Column headers */}
                          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded text-xs text-gray-300 font-medium">
                            <div className="w-6"></div> {/* Drag handle space */}
                            <div className="flex-1">Oefening</div>
                            <div className="w-16 text-center">Sets</div>
                            <div className="w-20 text-center">Reps</div>
                            <div className="w-20 text-center">Rust (s)</div>
                            <div className="w-6"></div> {/* Delete button space */}
                          </div>
                          
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <Draggable
                              key={`day-${dayIndex}-exercise-${exerciseIndex}`}
                              draggableId={`day-${dayIndex}-exercise-${exerciseIndex}`}
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
                    {filteredExercises.map((exercise, index) => (
                      <Draggable
                        key={`library-${exercise.id}`}
                        draggableId={`library-${exercise.id}`}
                        index={index}
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
                                showDaySelectorForExercise(exercise);
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

      {/* Day Selector Modal */}
      {showDaySelector && selectedExercise && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowDaySelector(false);
            setSelectedExercise(null);
          }}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Kies een dag voor {selectedExercise.name}
              </h3>
              <p className="text-gray-400 text-sm">
                Selecteer naar welke dag je deze oefening wilt toevoegen
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {formData.days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDaySelection(index)}
                  className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-[#8BAE5A] rounded-lg transition-colors text-left"
                >
                  <div className="font-medium text-white">Dag {index + 1}</div>
                  <div className="text-sm text-gray-400">{day.name}</div>
                  <div className="text-xs text-gray-500">
                    {day.exercises.length} oefening{day.exercises.length !== 1 ? 'en' : ''}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDaySelector(false);
                  setSelectedExercise(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 