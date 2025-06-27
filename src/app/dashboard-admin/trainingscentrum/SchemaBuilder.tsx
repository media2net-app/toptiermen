'use client';
import { useState } from 'react';
import { 
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlayIcon,
  ClockIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

interface TrainingDay {
  id: number;
  name: string;
  exercises: Exercise[];
}

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  restTime: string;
  order: number;
}

interface SchemaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  schema?: any; // For editing existing schema
}

const categories = ['Gym', 'Outdoor', 'Bodyweight'];
const mockExercises = [
  { id: 1, name: 'Bench Press', muscle: 'Borst' },
  { id: 2, name: 'Squat', muscle: 'Benen' },
  { id: 3, name: 'Pull-up', muscle: 'Rug' },
  { id: 4, name: 'Deadlift', muscle: 'Rug' },
  { id: 5, name: 'Overhead Press', muscle: 'Schouders' },
  { id: 6, name: 'Bicep Curl', muscle: 'Armen' },
  { id: 7, name: 'Tricep Dip', muscle: 'Armen' },
  { id: 8, name: 'Plank', muscle: 'Core' },
];

export default function SchemaBuilder({ isOpen, onClose, schema }: SchemaBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateStep, setTemplateStep] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [schemaDetails, setSchemaDetails] = useState({
    name: schema?.name || '',
    description: schema?.description || '',
    category: schema?.category || 'Gym',
    coverImage: schema?.coverImage || ''
  });
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>(
    schema?.days || [
      { id: 1, name: 'Dag 1', exercises: [] },
      { id: 2, name: 'Dag 2', exercises: [] },
      { id: 3, name: 'Dag 3', exercises: [] }
    ]
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTrainingDay = () => {
    const newDay: TrainingDay = {
      id: Date.now(),
      name: `Dag ${trainingDays.length + 1}`,
      exercises: []
    };
    setTrainingDays([...trainingDays, newDay]);
  };

  const removeTrainingDay = (dayId: number) => {
    setTrainingDays(trainingDays.filter(day => day.id !== dayId));
  };

  const updateDayName = (dayId: number, newName: string) => {
    setTrainingDays(trainingDays.map(day => 
      day.id === dayId ? { ...day, name: newName } : day
    ));
  };

  const addExerciseToDay = (dayId: number, exercise: any) => {
    const newExercise: Exercise = {
      id: Date.now(),
      name: exercise.name,
      sets: 3,
      reps: '8-12',
      restTime: '90 sec',
      order: trainingDays.find(day => day.id === dayId)?.exercises.length || 0
    };

    setTrainingDays(trainingDays.map(day => 
      day.id === dayId 
        ? { ...day, exercises: [...day.exercises, newExercise] }
        : day
    ));
    setShowExerciseSearch(false);
    setExerciseSearchTerm('');
  };

  const removeExerciseFromDay = (dayId: number, exerciseId: number) => {
    setTrainingDays(trainingDays.map(day => 
      day.id === dayId 
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
  };

  const updateExerciseDetails = (dayId: number, exerciseId: number, field: string, value: any) => {
    setTrainingDays(trainingDays.map(day => 
      day.id === dayId 
        ? { 
            ...day, 
            exercises: day.exercises.map(ex => 
              ex.id === exerciseId 
                ? { ...ex, [field]: value }
                : ex
            )
          }
        : day
    ));
  };

  const filteredExercises = mockExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  const handleSave = () => {
    // Here you would save the schema to your backend
    console.log('Saving schema:', { schemaDetails, trainingDays });
    onClose();
  };

  // Template opties
  const templates = [
    {
      name: 'Push/Pull/Legs',
      days: [
        { id: 1, name: 'Dag 1: Push', exercises: [] },
        { id: 2, name: 'Dag 2: Pull', exercises: [] },
        { id: 3, name: 'Dag 3: Legs', exercises: [] }
      ]
    },
    {
      name: 'Upper/Lower Body',
      days: [
        { id: 1, name: 'Dag 1: Upper Body', exercises: [] },
        { id: 2, name: 'Dag 2: Lower Body', exercises: [] }
      ]
    },
    {
      name: 'Full Body',
      days: [
        { id: 1, name: 'Dag 1: Full Body', exercises: [] },
        { id: 2, name: 'Dag 2: Full Body', exercises: [] },
        { id: 3, name: 'Dag 3: Full Body', exercises: [] }
      ]
    }
  ];

  // Template keuze stap
  if (templateStep && !schema) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-lg p-8">
          <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Nieuw schema starten</h2>
          <div className="space-y-4">
            <button
              className="w-full px-6 py-4 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition"
              onClick={() => {
                setTrainingDays([
                  { id: 1, name: 'Dag 1', exercises: [] }
                ]);
                setTemplateStep(false);
              }}
            >
              Start met een leeg schema
            </button>
            <div className="text-[#B6C948] text-center font-semibold">of kies een template</div>
            {templates.map((template) => (
              <button
                key={template.name}
                className="w-full px-6 py-4 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition font-semibold"
                onClick={() => {
                  setTrainingDays(template.days);
                  setSelectedTemplate(template.name);
                  setTemplateStep(false);
                }}
              >
                {template.name}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-8 w-full px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition"
          >
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A]">
              {schema ? 'Bewerk Schema' : 'Nieuw Trainingsschema'}
            </h2>
            <p className="text-[#B6C948] mt-1">Stap {currentStep} van {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-[#B6C948]" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-[#181F17]">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep 
                    ? 'bg-[#8BAE5A] text-[#181F17]' 
                    : 'bg-[#3A4D23] text-[#B6C948]'
                }`}>
                  {step < currentStep ? <CheckIcon className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-[#8BAE5A]' : 'bg-[#3A4D23]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Schema Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Naam van het Schema</label>
                <input
                  type="text"
                  value={schemaDetails.name}
                  onChange={(e) => setSchemaDetails({...schemaDetails, name: e.target.value})}
                  placeholder="Bijv. Full Body Krachttraining"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Omschrijving</label>
                <textarea
                  value={schemaDetails.description}
                  onChange={(e) => setSchemaDetails({...schemaDetails, description: e.target.value})}
                  placeholder="Beschrijf het doel en de focus van dit trainingsschema..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Categorie</label>
                <select
                  value={schemaDetails.category}
                  onChange={(e) => setSchemaDetails({...schemaDetails, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Cover Afbeelding URL</label>
                <input
                  type="text"
                  value={schemaDetails.coverImage}
                  onChange={(e) => setSchemaDetails({...schemaDetails, coverImage: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Training Days */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#8BAE5A]">Trainingsdagen Definiëren</h3>
                <button
                  onClick={addTrainingDay}
                  className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Trainingsdag Toevoegen
                </button>
              </div>

              <div className="space-y-4">
                {trainingDays.map((day, index) => (
                  <div key={day.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={day.name}
                          onChange={(e) => updateDayName(day.id, e.target.value)}
                          className="text-lg font-semibold text-[#8BAE5A] bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] rounded px-2 py-1"
                        />
                        <span className="text-[#B6C948] text-sm">{day.exercises.length} oefeningen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-[#232D1A] transition-colors duration-200">
                          <PencilIcon className="w-4 h-4 text-[#B6C948]" />
                        </button>
                        {trainingDays.length > 1 && (
                          <button 
                            onClick={() => removeTrainingDay(day.id)}
                            className="p-2 rounded-xl hover:bg-[#232D1A] transition-colors duration-200"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {day.exercises.length === 0 ? (
                      <div className="text-center py-8 text-[#B6C948]">
                        <PlayIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nog geen oefeningen toegevoegd</p>
                        <p className="text-sm">Voeg oefeningen toe in de volgende stap</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.exercises.map((exercise, exIndex) => (
                          <div key={exercise.id} className="flex items-center gap-3 p-3 bg-[#232D1A] rounded-xl">
                            <span className="text-[#8BAE5A] font-semibold w-8">{exIndex + 1}</span>
                            <span className="text-[#B6C948] flex-1">{exercise.name}</span>
                            <span className="text-[#8BAE5A] text-sm">{exercise.sets} sets</span>
                            <span className="text-[#8BAE5A] text-sm">{exercise.reps}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Exercise Addition */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#8BAE5A]">Oefeningen Toevoegen</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[#B6C948] text-sm">Selecteer een dag om oefeningen toe te voegen:</span>
                  <select
                    value={selectedDay || ''}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="">Kies een dag</option>
                    {trainingDays.map(day => (
                      <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedDay && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-[#8BAE5A]">
                      {trainingDays.find(d => d.id === selectedDay)?.name}
                    </h4>
                    <button
                      onClick={() => setShowExerciseSearch(true)}
                      className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Oefening Toevoegen
                    </button>
                  </div>

                  <div className="space-y-3">
                    {trainingDays.find(d => d.id === selectedDay)?.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[#8BAE5A] font-semibold w-8">{index + 1}</span>
                            <span className="text-[#B6C948] font-medium">{exercise.name}</span>
                          </div>
                          <button
                            onClick={() => removeExerciseFromDay(selectedDay, exercise.id)}
                            className="p-2 rounded-xl hover:bg-[#232D1A] transition-colors duration-200"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[#B6C948] text-sm mb-1">Sets</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExerciseDetails(selectedDay, exercise.id, 'sets', Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#B6C948] text-sm mb-1">Herhalingen</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => updateExerciseDetails(selectedDay, exercise.id, 'reps', e.target.value)}
                              placeholder="8-12"
                              className="w-full px-3 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#B6C948] text-sm mb-1">Rusttijd</label>
                            <input
                              type="text"
                              value={exercise.restTime}
                              onChange={(e) => updateExerciseDetails(selectedDay, exercise.id, 'restTime', e.target.value)}
                              placeholder="90 sec"
                              className="w-full px-3 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exercise Search Modal */}
          {showExerciseSearch && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#8BAE5A]">Oefening Zoeken</h3>
                  <button
                    onClick={() => setShowExerciseSearch(false)}
                    className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
                  >
                    <XMarkIcon className="w-5 h-5 text-[#B6C948]" />
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Zoek oefeningen..."
                  value={exerciseSearchTerm}
                  onChange={(e) => setExerciseSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] mb-4"
                />
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => addExerciseToDay(selectedDay!, exercise)}
                      className="w-full p-3 text-left bg-[#181F17] rounded-xl hover:bg-[#3A4D23] transition-colors duration-200"
                    >
                      <div className="text-[#8BAE5A] font-medium">{exercise.name}</div>
                      <div className="text-[#B6C948] text-sm">{exercise.muscle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#3A4D23]">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Vorige
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-[#181F17] text-[#B6C948] border border-[#3A4D23] hover:bg-[#232D1A] transition-all duration-200"
            >
              Annuleren
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
              >
                Volgende
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Schema Opslaan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 