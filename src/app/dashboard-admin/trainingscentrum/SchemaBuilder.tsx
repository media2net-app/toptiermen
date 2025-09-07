'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

// Sortable Exercise Item Component
interface SortableExerciseItemProps {
  exercise: SchemaExercise;
  dayIndex: number;
  exerciseIndex: number;
  updateExerciseInDay: (dayIndex: number, exerciseIndex: number, field: string, value: any) => void;
  removeExerciseFromDay: (dayIndex: number, exerciseIndex: number) => void;
}

function SortableExerciseItem({ 
  exercise, 
  dayIndex, 
  exerciseIndex, 
  updateExerciseInDay, 
  removeExerciseFromDay 
}: SortableExerciseItemProps) {
  const exerciseId = `exercise-${dayIndex}-${exerciseIndex}`;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exerciseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Debug logging removed for production

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 p-2 bg-gray-800 rounded ${
        isDragging ? 'shadow-lg border-2 border-[#8BAE5A]' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
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
  );
}

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

// Sortable Day Item Component for Day Order Modal
function SortableDayItem({ day, index }: { day: TrainingDay; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `day-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 bg-gray-800 rounded border ${
        isDragging ? 'bg-gray-700 shadow-lg transform rotate-1' : 'hover:bg-gray-750'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mr-3 p-1 text-gray-400 hover:text-[#8BAE5A] cursor-grab active:cursor-grabbing"
      >
        <Bars3Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-white">{day.name}</div>
        <div className="text-sm text-gray-400">
          {day.exercises.length} oefening{day.exercises.length !== 1 ? 'en' : ''}
        </div>
      </div>
    </div>
  );
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
  const [showDayOrderModal, setShowDayOrderModal] = useState(false);
  const [tempDayOrder, setTempDayOrder] = useState<TrainingDay[]>([]);
  const [showSaveProgress, setShowSaveProgress] = useState(false);
  const [saveProgress, setSaveProgress] = useState<string[]>([]);
  const progressScrollRef = useRef<HTMLDivElement>(null);

  // Function to add progress log
  const addProgressLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setSaveProgress(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (progressScrollRef.current) {
      progressScrollRef.current.scrollTop = progressScrollRef.current.scrollHeight;
    }
  }, [saveProgress]);

  // DnD Kit sensors for day order modal
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
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
          days: schema.days
            ?.sort((a: any, b: any) => (a.day_number ?? 0) - (b.day_number ?? 0))
            ?.map((day: any) => ({
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
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching exercises:', error);
        toast.error('Fout bij ophalen oefeningen');
        return;
      }

      setExercises(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fout bij ophalen oefeningen');
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

  const openDayOrderModal = () => {
    setTempDayOrder([...formData.days]);
    setShowDayOrderModal(true);
  };

  const handleDayOrderDragEnd = (event: DragEndEvent) => {
    console.log('🎯 Day order drag end:', event);
    console.log('🎯 Active ID:', event.active.id);
    console.log('🎯 Over ID:', event.over?.id);
    
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      console.log('❌ No destination or same position - drag cancelled');
      return;
    }

    // Parse the IDs to get day indices
    const activeMatch = active.id.toString().match(/day-(\d+)/);
    const overMatch = over.id.toString().match(/day-(\d+)/);

    if (!activeMatch || !overMatch) {
      console.log('❌ Invalid day IDs');
      return;
    }

    const oldIndex = parseInt(activeMatch[1]);
    const newIndex = parseInt(overMatch[1]);

    console.log(`🔄 Moving day from position ${oldIndex} to ${newIndex}`);

    const newOrder = arrayMove(tempDayOrder, oldIndex, newIndex);

    // Update day numbers
    newOrder.forEach((day, index) => {
      day.day_number = index + 1;
    });

    console.log('✅ Day order updated:', newOrder.map((d, i) => `${i + 1}: ${d.name} (day_number: ${d.day_number})`));
    setTempDayOrder(newOrder);
  };

  const saveDayOrder = () => {
    // Update day_number for each day based on new order
    const updatedDays = tempDayOrder.map((day, index) => ({
      ...day,
      day_number: index + 1
    }));
    
    console.log('💾 Saving day order:', updatedDays.map((d, i) => `${i + 1}: ${d.name} (day_number: ${d.day_number})`));
    
    setFormData(prev => ({
      ...prev,
      days: updatedDays
    }));
    setShowDayOrderModal(false);
    toast.success('Dag volgorde bijgewerkt!');
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


  // Drag end handler for exercises within a day
  const handleExerciseDragEnd = (event: DragEndEvent) => {
    console.log('🎯 Exercise drag end event:', event);
    console.log('🎯 Active ID:', event.active.id);
    console.log('🎯 Over ID:', event.over?.id);
    const { active, over } = event;

    if (!over) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse the IDs to get day index and exercise index
    const activeMatch = activeId.match(/exercise-(\d+)-(\d+)/);
    const overMatch = overId.match(/exercise-(\d+)-(\d+)/);

    if (!activeMatch || !overMatch) {
      console.log('❌ Invalid exercise IDs');
      return;
    }

    const activeDayIndex = parseInt(activeMatch[1]);
    const activeExerciseIndex = parseInt(activeMatch[2]);
    const overDayIndex = parseInt(overMatch[1]);
    const overExerciseIndex = parseInt(overMatch[2]);

    // Only allow reordering within the same day
    if (activeDayIndex !== overDayIndex) {
      console.log('❌ Cannot move exercises between different days');
      return;
    }

    // Don't do anything if dropped on the same position
    if (activeExerciseIndex === overExerciseIndex) {
      console.log('ℹ️ Exercise dropped on same position');
      return;
    }

    console.log(`🔄 Moving exercise from position ${activeExerciseIndex} to ${overExerciseIndex} in day ${activeDayIndex}`);

    // Update the exercises array with new order
    const updatedDays = [...formData.days];
    const dayExercises = [...updatedDays[activeDayIndex].exercises];
    
    // Remove the exercise from its current position
    const [movedExercise] = dayExercises.splice(activeExerciseIndex, 1);
    
    // Insert it at the new position
    dayExercises.splice(overExerciseIndex, 0, movedExercise);
    
    // Update the order_index for all exercises
    dayExercises.forEach((exercise, index) => {
      exercise.order_index = index;
    });

    // Update the day with the new exercise order
    updatedDays[activeDayIndex] = {
      ...updatedDays[activeDayIndex],
      exercises: dayExercises
    };

    // Update the form data
    setFormData({
      ...formData,
      days: updatedDays
    });

    console.log(`✅ Exercise order updated:`, dayExercises.map((ex, i) => `${i}: ${ex.exercise_name} (order: ${ex.order_index})`));

    console.log('✅ Exercise order updated successfully');
  };

  const validateSchema = (schema: TrainingSchema): string | null => {
    if (!schema.name.trim()) {
      return 'Schema naam is verplicht';
    }
    if (schema.days.length === 0) {
      return 'Minimaal één dag is verplicht';
    }
    for (const day of schema.days) {
      if (!day.name.trim()) {
        return `Dag ${day.day_number} naam is verplicht`;
      }
      if (day.exercises.length === 0) {
        return `Dag ${day.day_number} moet minimaal één oefening hebben`;
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
    setShowSaveProgress(true);
    setSaveProgress([]);
    
    try {
      addProgressLog('🚀 Starting schema save operation...');
      addProgressLog(`📋 Schema: ${formData.name}`);
      addProgressLog(`📅 Days to save: ${formData.days.length}`);

      addProgressLog('💾 Saving schema to database...');
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
        addProgressLog(`❌ Schema save error: ${schemaError.message}`);
        throw new Error(`Schema save failed: ${schemaError.message}`);
      }

      const schemaId = schemaData.id;
      addProgressLog(`✅ Schema saved with ID: ${schemaId}`);

      // First, delete all existing days for this schema to avoid constraint conflicts
      addProgressLog('🗑️ Deleting existing days to avoid conflicts...');
      const { error: deleteError } = await supabase
        .from('training_schema_days')
        .delete()
        .eq('schema_id', schemaId);

      if (deleteError) {
        addProgressLog(`❌ Delete existing days error: ${deleteError.message}`);
        throw new Error(`Delete existing days failed: ${deleteError.message}`);
      }

      addProgressLog('✅ Existing days deleted successfully');

      // Save days with correct day_number
      addProgressLog(`📅 Starting to save ${formData.days.length} days...`);
      for (let i = 0; i < formData.days.length; i++) {
        const day = formData.days[i];
        const dayNumber = day.day_number || (i + 1); // Use day.day_number if set, otherwise use array index + 1
        
        addProgressLog(`💾 Saving day ${dayNumber}: "${day.name}" (${day.exercises.length} exercises)`);

        const { data: dayData, error: dayError } = await supabase
          .from('training_schema_days')
          .insert({
            schema_id: schemaId,
            day_number: dayNumber,
            name: day.name,
            description: day.description
          })
          .select()
          .single();

        if (dayError) {
          addProgressLog(`❌ Day ${dayNumber} save error: ${dayError.message}`);
          throw new Error(`Day save failed: ${dayError.message}`);
        }

        const dayId = dayData.id;
        addProgressLog(`✅ Day ${dayNumber} saved with ID: ${dayId}`);

        // First, delete all existing exercises for this day
        if (day.exercises.length > 0) {
          addProgressLog(`🗑️ Deleting existing exercises for day ${dayNumber}...`);
          const { error: deleteError } = await supabase
            .from('training_schema_exercises')
            .delete()
            .eq('schema_day_id', dayId);

          if (deleteError) {
            addProgressLog(`❌ Delete exercises error for day ${dayNumber}: ${deleteError.message}`);
            throw new Error(`Delete exercises failed: ${deleteError.message}`);
          }

          // Then save all current exercises for this day
          addProgressLog(`💪 Saving ${day.exercises.length} exercises for day ${dayNumber}...`);
          for (let j = 0; j < day.exercises.length; j++) {
            const exercise = day.exercises[j];
            addProgressLog(`  💾 Saving exercise ${j + 1}/${day.exercises.length}: "${exercise.exercise_name}" (order: ${exercise.order_index})`);

          const { error: exerciseError } = await supabase
            .from('training_schema_exercises')
            .insert({
              schema_day_id: dayId,
              exercise_id: exercise.exercise_id,
              exercise_name: exercise.exercise_name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_time: exercise.rest_time,
              order_index: exercise.order_index || j // Use exercise.order_index if set, otherwise use array index
            });

            if (exerciseError) {
              addProgressLog(`❌ Exercise ${j + 1} save error for day ${dayNumber}: ${exerciseError.message}`);
              throw new Error(`Exercise save failed: ${exerciseError.message}`);
            }
          }
          addProgressLog(`✅ All exercises saved for day ${dayNumber}`);
        } else {
          addProgressLog(`ℹ️ No exercises to save for day ${dayNumber}`);
        }
      }

      addProgressLog('🎉 Schema save completed successfully!');
      toast.success('Schema succesvol opgeslagen!');
      onSave({ ...formData, id: schemaId });
      setShowSaveProgress(false);
      onClose();
    } catch (error) {
      addProgressLog(`❌ Save operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          toast.error('Er is een probleem met de database relaties. Probeer opnieuw.');
        } else {
          toast.error(`Fout bij opslaan: ${error.message}`);
        }
      } else {
        toast.error('Onbekende fout bij opslaan schema');
      }
    } finally {
      setLoading(false);
      setShowSaveProgress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {schema ? 'Schema Bewerken' : 'Nieuw Schema'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleExerciseDragEnd}
        >
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
              </div>

              {/* Days */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Training Dagen</h3>
                  <div className="flex space-x-2">
                    {formData.days.length > 1 && (
                      <button
                        onClick={openDayOrderModal}
                        className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                      >
                        <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                        Wijzig Volgorde
                      </button>
                    )}
                    <button
                      onClick={addDay}
                      className="flex items-center px-3 py-2 bg-[#8BAE5A] text-[#181F17] rounded-md hover:bg-[#B6C948]"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Dag Toevoegen
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.days.map((day, dayIndex) => (
                    <div
                      key={`day-${day.id || dayIndex}-${dayIndex}`}
                      className="border border-gray-700 rounded-lg p-4 bg-gray-900"
                    >
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
                      <div className="space-y-2 min-h-[50px]">
                            {/* Column headers */}
                            <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded text-xs text-gray-300 font-medium">
                              <div className="w-6"></div> {/* Drag handle space */}
                              <div className="flex-1">Oefening</div>
                              <div className="w-16 text-center">Sets</div>
                              <div className="w-20 text-center">Reps</div>
                              <div className="w-20 text-center">Rust (s)</div>
                              <div className="w-6"></div> {/* Delete button space */}
                            </div>
                            
                            <SortableContext 
                              items={day.exercises.map((_, exerciseIndex) => `exercise-${dayIndex}-${exerciseIndex}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              {day.exercises.map((exercise, exerciseIndex) => (
                                <SortableExerciseItem
                                  key={`exercise-${dayIndex}-${exerciseIndex}`}
                                  exercise={exercise}
                                  dayIndex={dayIndex}
                                  exerciseIndex={exerciseIndex}
                                  updateExerciseInDay={updateExerciseInDay}
                                  removeExerciseFromDay={removeExerciseFromDay}
                                />
                              ))}
                            </SortableContext>
                            
                            {/* Debug info removed for production */}
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="space-y-2">
                    {filteredExercises.map((exercise, index) => (
                          <div
                            key={index}
                            className={`p-3 bg-gray-800 rounded border cursor-grab active:cursor-grabbing hover:bg-gray-700 ${
                              formData.days.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => showDaySelectorForExercise(exercise)}
                          >
                            <div className="font-medium text-white">{exercise.name}</div>
                            <div className="text-sm text-gray-400">{exercise.primary_muscle}</div>
                            <div className="text-xs text-gray-500">{exercise.equipment} • {exercise.difficulty}</div>
                          </div>
                    ))}
              </div>
            </div>
          </div>
        </DndContext>

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
            className="px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-md hover:bg-[#B6C948] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Day selector modal */}
      {showDaySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-gray-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">
              Oefening toevoegen
            </h3>
            <p className="text-gray-300 mb-6">
              Selecteer naar welke dag je deze oefening wilt toevoegen
            </p>
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

      {/* Day order modal */}
      {showDayOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-gray-900 rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Wijzig Dag Volgorde
            </h3>
            <p className="text-gray-300 mb-6">
              Sleep de dagen om de volgorde te wijzigen
            </p>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDayOrderDragEnd}
            >
              <SortableContext
                items={tempDayOrder.map((day, index) => `day-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 mb-6 min-h-[200px]">
                  {tempDayOrder.map((day, index) => (
                    <SortableDayItem
                      key={`day-${index}`}
                      day={day}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDayOrderModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Annuleren
              </button>
              <button
                onClick={saveDayOrder}
                className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-md hover:bg-[#B6C948]"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Progress Modal */}
      {showSaveProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70">
          <div className="bg-gray-900 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              💾 Schema Opslaan...
            </h3>
            <div 
              ref={progressScrollRef}
              className="bg-gray-800 rounded-lg p-4 max-h-[400px] overflow-y-auto"
            >
              <div className="space-y-1 text-sm font-mono">
                {saveProgress.map((log, index) => (
                  <div key={index} className="text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2 text-[#8BAE5A]">
                <div className="w-4 h-4 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Bezig met opslaan...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
