'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, PhotoIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface BadgeCondition {
  id: string;
  action: string;
  operator: string;
  value: string;
  unit?: string;
  timeframe?: string;
}

interface BadgeLevel {
  id: string;
  name: string;
  color: string;
  requirements: string;
  conditions: BadgeCondition[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  levels: BadgeLevel[];
  trigger: string;
  conditions: BadgeCondition[];
  isActive: boolean;
  ruleLogic: 'AND' | 'OR';
  timeWindow?: number; // in days
  cooldown?: number; // in days
}

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (badge: Badge) => void;
  badge?: Badge | null;
  availableActions: Array<{ value: string; label: string; type: 'text' | 'number' | 'boolean' }>;
  getConditionsForAction: (action: string) => Array<{ value: string; label: string; type: 'text' | 'number' }>;
  operators: Array<{ value: string; label: string }>;
  onDelete?: (id: string) => void;
}

const categories = ['Fitness', 'Mindset', 'Academy', 'Community', 'Financiën', 'Leadership'];

const TRIGGER_TYPES = [
  { value: 'workout_completed', label: 'Workout Voltooid', description: 'Wanneer een gebruiker een workout afrondt' },
  { value: 'meditation_completed', label: 'Meditatie Voltooid', description: 'Wanneer een gebruiker een meditatiesessie afrondt' },
  { value: 'learning_completed', label: 'Learning Voltooid', description: 'Wanneer een gebruiker een academie module afrondt' },
  { value: 'community_contribution', label: 'Community Bijdrage', description: 'Wanneer een gebruiker actief is in de community' },
  { value: 'streak_achieved', label: 'Streak Behaald', description: 'Wanneer een gebruiker een bepaalde streak bereikt' },
  { value: 'goal_achieved', label: 'Doel Behaald', description: 'Wanneer een gebruiker een persoonlijk doel bereikt' },
  { value: 'custom_event', label: 'Custom Event', description: 'Voor aangepaste events die je zelf definieert' }
];

const CONDITION_TYPES = [
  { value: 'count', label: 'Aantal', description: 'Aantal keer dat de trigger moet gebeuren' },
  { value: 'duration', label: 'Duur', description: 'Minimale duur van een activiteit' },
  { value: 'value', label: 'Waarde', description: 'Specifieke waarde die bereikt moet worden' },
  { value: 'percentage', label: 'Percentage', description: 'Percentage van een doel dat bereikt moet worden' },
  { value: 'comparison', label: 'Vergelijking', description: 'Vergelijking met een andere waarde' }
];

const OPERATORS = [
  { value: 'equals', label: 'Is gelijk aan' },
  { value: 'greater_than', label: 'Is groter dan' },
  { value: 'less_than', label: 'Is kleiner dan' },
  { value: 'greater_equal', label: 'Is groter dan of gelijk aan' },
  { value: 'less_equal', label: 'Is kleiner dan of gelijk aan' },
  { value: 'contains', label: 'Bevat' },
  { value: 'not_contains', label: 'Bevat niet' }
];

// Icon mapping function (same as in main page)
const getIconDisplay = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    'FaBolt': '⚡',
    'FaFire': '🔥',
    'FaBookOpen': '📖',
    'FaRunning': '🏃',
    'FaDumbbell': '🏋️',
    'FaSnowflake': '❄️',
    'FaMedal': '🏅',
    'FaUsers': '👥',
    'FaTrophy': '🏆',
    'FaStar': '⭐',
    'FaHeart': '❤️',
    'FaBrain': '🧠',
    'FaDollarSign': '💰',
    'FaClock': '⏰',
    'FaCheck': '✅',
    'FaTarget': '🎯',
    'FaLightbulb': '💡',
    'FaShield': '🛡️',
    'FaCrown': '👑',
    'FaGem': '💎'
  };
  
  return iconMap[iconName] || '🏆'; // Default to trophy if not found
};

// Available icons for selection
const AVAILABLE_ICONS = [
  'FaBolt', 'FaFire', 'FaBookOpen', 'FaRunning', 'FaDumbbell', 
  'FaSnowflake', 'FaMedal', 'FaUsers', 'FaTrophy', 'FaStar',
  'FaHeart', 'FaBrain', 'FaDollarSign', 'FaClock', 'FaCheck',
  'FaTarget', 'FaLightbulb', 'FaShield', 'FaCrown', 'FaGem'
];

export default function BadgeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  badge, 
  availableActions, 
  getConditionsForAction, 
  operators,
  onDelete
}: BadgeModalProps) {
  const [form, setForm] = useState<Partial<Badge>>({
    name: '',
    description: '',
    icon: '',
    category: '',
    levels: [],
    trigger: '',
    conditions: [],
    isActive: true,
    ruleLogic: 'AND',
    timeWindow: 30,
    cooldown: 0
  });
  const [conditions, setConditions] = useState<BadgeCondition[]>([]);
  const [levels, setLevels] = useState<BadgeLevel[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const [ruleLogic, setRuleLogic] = useState<'AND' | 'OR'>('AND');
  const [timeWindow, setTimeWindow] = useState<number>(30);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (badge) {
      setForm(badge);
      setConditions(badge.conditions || []);
      setLevels(badge.levels || []);
      setRuleLogic(badge.ruleLogic || 'AND');
      setTimeWindow(badge.timeWindow || 30);
      setCooldown(badge.cooldown || 0);
      if (badge.icon && badge.icon.startsWith('data:')) {
        setIconPreview(badge.icon);
      }
    } else {
      setForm({
        id: '',
        name: '',
        description: '',
        icon: '',
        category: '',
        levels: [],
        trigger: '',
        conditions: [],
        isActive: true,
        ruleLogic: 'AND',
        timeWindow: 30,
        cooldown: 0
      });
      setConditions([]);
      setLevels([]);
      setRuleLogic('AND');
      setTimeWindow(30);
      setCooldown(0);
      setIconFile(null);
      setIconPreview('');
      setUploadError('');
    }
    setCurrentStep(1);
  }, [badge]);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Alleen SVG, PNG en JPEG bestanden zijn toegestaan');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Bestand is te groot. Maximum 2MB toegestaan');
      return;
    }

    setUploadError('');
    setIconFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setIconPreview(result);
      setForm(prev => ({ ...prev, icon: result }));
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview('');
    setUploadError('');
    setForm(prev => ({ ...prev, icon: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name || !form.description || !form.trigger) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    if (conditions.length === 0) {
      toast.error('Voeg minimaal één voorwaarde toe');
      return;
    }

    // Validate conditions
    const invalidConditions = conditions.filter(c => !c.action || !c.operator || !c.value);
    if (invalidConditions.length > 0) {
      toast.error('Vul alle voorwaarde velden in');
      return;
    }
    
    const badgeData: Badge = {
      id: badge?.id || Date.now().toString(),
      name: form.name || '',
      description: form.description || '',
      icon: form.icon || '🏆',
      category: form.category || '',
      levels: levels || [],
      trigger: form.trigger || '',
      conditions: conditions || [],
      isActive: form.isActive || true,
      ruleLogic: ruleLogic || 'AND',
      timeWindow: timeWindow || 30,
      cooldown: cooldown || 0
    };

    onSave(badgeData);
    onClose();
  };

  const addCondition = () => {
    const newCondition: BadgeCondition = {
      id: `condition-${Date.now()}`,
      action: '',
      operator: '',
      value: '',
      unit: '',
      timeframe: ''
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (index: number, field: keyof BadgeCondition, value: string) => {
    const updatedConditions = conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    );
    setConditions(updatedConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const getAvailableOperators = (action: string) => {
    const actionConfig = availableActions.find(a => a.value === action);
    if (!actionConfig) return [];
    
    switch (actionConfig.type) {
      case 'number':
        return [
          { value: 'equals', label: 'Gelijk aan' },
          { value: 'greater_than', label: 'Groter dan' },
          { value: 'less_than', label: 'Kleiner dan' },
          { value: 'between', label: 'Tussen' },
          { value: 'at_least', label: 'Minstens' }
        ];
      case 'boolean':
        return [
          { value: 'is_true', label: 'Is waar' },
          { value: 'is_false', label: 'Is onwaar' }
        ];
      case 'text':
        return [
          { value: 'contains', label: 'Bevat' },
          { value: 'equals', label: 'Gelijk aan' },
          { value: 'starts_with', label: 'Begint met' },
          { value: 'ends_with', label: 'Eindigt met' }
        ];
      default:
        return [];
    }
  };

  const getUnitsForAction = (action: string) => {
    const actionConfig = availableActions.find(a => a.value === action);
    if (!actionConfig) return [];
    
    switch (actionConfig.value) {
      case 'workout_completed':
        return [
          { value: 'workouts', label: 'Workouts' },
          { value: 'minutes', label: 'Minuten' },
          { value: 'calories', label: 'Calorieën' }
        ];
      case 'streak_reached':
        return [
          { value: 'days', label: 'Dagen' },
          { value: 'weeks', label: 'Weken' },
          { value: 'months', label: 'Maanden' }
        ];
      case 'goal_achieved':
        return [
          { value: 'goals', label: 'Doelen' },
          { value: 'percentage', label: 'Percentage' }
        ];
      default:
        return [];
    }
  };

  const getTimeframes = () => [
    { value: '1_day', label: '1 dag' },
    { value: '7_days', label: '7 dagen' },
    { value: '30_days', label: '30 dagen' },
    { value: '90_days', label: '90 dagen' },
    { value: '1_year', label: '1 jaar' },
    { value: 'all_time', label: 'Aller tijden' }
  ];

  const addLevel = () => {
    const newLevel: BadgeLevel = {
      id: `level-${Date.now()}`,
      name: '',
      color: '#3B82F6',
      requirements: '',
      conditions: []
    };
    setLevels([...levels, newLevel]);
  };

  const updateLevel = (index: number, field: keyof BadgeLevel, value: string) => {
    setLevels(levels.map((level, i) => 
      i === index ? { ...level, [field]: value } : level
    ));
  };

  const removeLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#8BAE5A]">
              {badge ? 'Badge Bewerken' : 'Nieuwe Badge Ontwerpen'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex mb-6">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-[#8BAE5A] text-black'
                  : 'bg-[#181F17] text-white/60 hover:text-white'
              }`}
            >
              Stap 1: Visuele Details
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 2
                  ? 'bg-[#8BAE5A] text-black'
                  : 'bg-[#181F17] text-white/60 hover:text-white'
              }`}
            >
              Stap 2: Ontgrendel-Regel
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 3
                  ? 'bg-[#8BAE5A] text-black'
                  : 'bg-[#181F17] text-white/60 hover:text-white'
              }`}
            >
              Stap 3: Badge Niveaus
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Visual Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#8BAE5A]">Visuele Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Naam Badge *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Categorie
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    >
                      <option value="">Selecteer categorie</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Omschrijving *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] resize-vertical"
                    placeholder="Deze tekst zien gebruikers als ze de badge ontgrendelen..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Icoon
                  </label>
                  <div className="space-y-4">
                    {/* Icon Selector */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                        Selecteer Icoon
                      </label>
                      <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
                        {AVAILABLE_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, icon: iconName }))}
                            className={`p-2 rounded-lg text-2xl hover:bg-[#3A4D23] transition-colors ${
                              form.icon === iconName 
                                ? 'bg-[#8BAE5A] text-black' 
                                : 'bg-[#232D1A] text-white'
                            }`}
                            title={iconName}
                          >
                            {getIconDisplay(iconName)}
                          </button>
                        ))}
                      </div>
                      {form.icon && (
                        <div className="mt-2 text-sm text-gray-400">
                          Geselecteerd: {form.icon} {getIconDisplay(form.icon)}
                        </div>
                      )}
                    </div>

                    {/* Icon Upload (existing code) */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {iconPreview ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <div className="w-16 h-16 flex items-center justify-center">
                              {iconPreview.startsWith('data:image/svg') ? (
                                <img src={iconPreview} alt="Badge icon" className="w-full h-full object-contain" />
                              ) : (
                                <img src={iconPreview} alt="Badge icon" className="w-full h-full object-contain" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById('icon-upload')?.click()}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Vervangen
                            </button>
                            <button
                              type="button"
                              onClick={removeIcon}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => document.getElementById('icon-upload')?.click()}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Custom Icoon Uploaden
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            SVG, PNG of JPEG (max 2MB) - Optioneel
                          </p>
                        </div>
                      )}
                      <input
                        id="icon-upload"
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg"
                        onChange={handleIconUpload}
                        className="hidden"
                      />
                    </div>
                    
                    {uploadError && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors"
                  >
                    Volgende: Ontgrendel-Regel
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Unlock Rules */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#8BAE5A]">Ontgrendelingsregels</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Trigger Type
                    </label>
                    <select
                      value={form.trigger}
                      onChange={(e) => setForm((prev) => ({ ...prev, trigger: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      required
                    >
                      <option value="">Selecteer trigger</option>
                      {TRIGGER_TYPES.map(trigger => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Regel Logica
                    </label>
                    <select
                      value={ruleLogic}
                      onChange={(e) => setRuleLogic(e.target.value as 'AND' | 'OR')}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    >
                      <option value="AND">Alle voorwaarden (AND)</option>
                      <option value="OR">Minstens één voorwaarde (OR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Tijdsvenster (dagen)
                    </label>
                    <input
                      type="number"
                      value={timeWindow}
                      onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Cooldown Periode (dagen)
                    </label>
                    <input
                      type="number"
                      value={cooldown}
                      onChange={(e) => setCooldown(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      min="0"
                      max="365"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      Tijd die moet verstrijken voordat de badge opnieuw kan worden verdiend
                    </p>
                  </div>

                  <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                    <h4 className="font-semibold text-[#8BAE5A] mb-2">Regel Samenvatting</h4>
                    <p className="text-white/80 text-sm">
                      Badge wordt ontgrendeld wanneer {ruleLogic === 'AND' ? 'alle' : 'minstens één'} van de volgende voorwaarden waar is binnen {timeWindow} dagen.
                      {cooldown > 0 && ` Cooldown: ${cooldown} dagen.`}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-[#8BAE5A]">
                      Voorwaarden
                    </label>
                    <button
                      type="button"
                      onClick={addCondition}
                      className="px-4 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Voorwaarde Toevoegen
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {conditions.map((condition, index) => (
                      <div key={condition.id} className="border border-[#3A4D23] rounded-lg p-4 bg-[#181F17]">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-[#8BAE5A]">Voorwaarde {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                              Actie
                            </label>
                            <select
                              value={condition.action}
                              onChange={(e) => updateCondition(index, 'action', e.target.value)}
                              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                              required
                            >
                              <option value="">Selecteer actie</option>
                              {availableActions.map(action => (
                                <option key={action.value} value={action.value}>
                                  {action.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                              Operator
                            </label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                              required
                              disabled={!condition.action}
                            >
                              <option value="">Selecteer operator</option>
                              {getAvailableOperators(condition.action).map(op => (
                                <option key={op.value} value={op.value}>
                                  {op.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                              Waarde
                            </label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                              placeholder="Voer waarde in"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                              Eenheid
                            </label>
                            <select
                              value={condition.unit || ''}
                              onChange={(e) => updateCondition(index, 'unit', e.target.value)}
                              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                            >
                              <option value="">Geen eenheid</option>
                              {getUnitsForAction(condition.action).map(unit => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                            Tijdsperiode
                          </label>
                          <select
                            value={condition.timeframe || ''}
                            onChange={(e) => updateCondition(index, 'timeframe', e.target.value)}
                            className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                          >
                            <option value="">Gebruik algemene tijdsvenster</option>
                            {getTimeframes().map(timeframe => (
                              <option key={timeframe.value} value={timeframe.value}>
                                {timeframe.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    
                    {conditions.length === 0 && (
                      <div className="text-center py-8 text-white/60">
                        <p>Nog geen voorwaarden toegevoegd</p>
                        <p className="text-sm">Klik op "Voorwaarde Toevoegen" om te beginnen</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Badge Levels */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#8BAE5A]">Badge Niveaus (Optioneel)</h3>
                
                <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                  <p className="text-white/80 text-sm">
                    Voeg niveaus toe voor progressieve badges (bijv. Brons, Zilver, Goud). 
                    Laat leeg voor een enkele badge.
                  </p>
                </div>

                <div className="space-y-4">
                  {levels.map((level, index) => (
                    <div key={level.id} className="border border-[#3A4D23] rounded-lg p-4 bg-[#181F17]">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-[#8BAE5A]">Niveau {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                            Naam
                          </label>
                          <input
                            type="text"
                            value={level.name}
                            onChange={(e) => updateLevel(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                            placeholder="Bijv. Brons, Zilver, Goud"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                            Kleur
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={level.color}
                              onChange={(e) => updateLevel(index, 'color', e.target.value)}
                              className="w-12 h-10 border border-[#3A4D23] rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={level.color}
                              onChange={(e) => updateLevel(index, 'color', e.target.value)}
                              className="flex-1 px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                            Vereisten
                          </label>
                          <input
                            type="text"
                            value={level.requirements}
                            onChange={(e) => updateLevel(index, 'requirements', e.target.value)}
                            className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                            placeholder="Bijv. 50 workouts"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addLevel}
                    className="px-4 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors"
                  >
                    Niveau Toevoegen
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 