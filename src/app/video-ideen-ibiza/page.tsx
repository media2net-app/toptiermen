'use client';

import { useState } from 'react';
import { 
  VideoCameraIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  EyeIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Language translations
const translations = {
  nl: {
    title: 'Video Ideeën',
    subtitle: 'Ibiza',
    description: 'Ontdek de exclusieve video concepten die Rick in Ibiza gaat opnemen voor de Top Tier Men community',
    daysUntilLaunch: 'Dagen tot Launch',
    september: 'September',
    topTierMen: 'Top Tier Men',
    totalVideos: 'Totaal Video\'s',
    highPriority: 'Hoog Prioriteit',
    ibizaLocations: 'Ibiza Locaties',
    rickAsAuthority: 'Rick als Autoriteit',
    filterVideos: 'Filter Video\'s',
    allCategories: 'Alle Categorieën',
    promotion: 'Promotie',
    tutorial: 'Tutorial',
    testimonial: 'Testimonial',
    lifestyle: 'Lifestyle',
    behindTheScenes: 'Behind-the-Scenes',
    allPriorities: 'Alle Prioriteiten',
    high: 'Hoog',
    medium: 'Medium',
    low: 'Laag',
    deadlineAlert: '⚠️ Deadline Alert',
    deadlineText: 'Uiterlijke opleverdatum voor alle video\'s: 8 augustus 2025',
    campaignStart: 'Video campagnes starten op 11 augustus 2025 - 3 weken voor lancering 1 september',
    keyMessages: 'Kernboodschappen:',
    targetAudience: 'Doelgroep:',
    recordingDetails: 'Opname Details:',
    cameraInstructions: 'Camera Instructies',
    dutchVoiceover: 'Nederlandse Voice-over',
    englishVoiceover: 'English Voice-over',
    deadlineLabel: 'Uiterlijke Opleverdatum:',
    deadlineContext: 'Voor video campagne start 11-08-2025',
    by: 'Door:',
    priority: 'Prioriteit',
    status: 'Status'
  },
  en: {
    title: 'Video Ideas',
    subtitle: 'Ibiza',
    description: 'Discover the exclusive video concepts that Rick will film in Ibiza for the Top Tier Men community',
    daysUntilLaunch: 'Days until Launch',
    september: 'September',
    topTierMen: 'Top Tier Men',
    totalVideos: 'Total Videos',
    highPriority: 'High Priority',
    ibizaLocations: 'Ibiza Locations',
    rickAsAuthority: 'Rick as Authority',
    filterVideos: 'Filter Videos',
    allCategories: 'All Categories',
    promotion: 'Promotion',
    tutorial: 'Tutorial',
    testimonial: 'Testimonial',
    lifestyle: 'Lifestyle',
    behindTheScenes: 'Behind-the-Scenes',
    allPriorities: 'All Priorities',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    deadlineAlert: '⚠️ Deadline Alert',
    deadlineText: 'Final delivery deadline for all videos: August 8, 2025',
    campaignStart: 'Video campaigns start on August 11, 2025 - 3 weeks before September 1 launch',
    keyMessages: 'Key Messages:',
    targetAudience: 'Target Audience:',
    recordingDetails: 'Recording Details:',
    cameraInstructions: 'Camera Instructions',
    dutchVoiceover: 'Dutch Voice-over',
    englishVoiceover: 'English Voice-over',
    deadlineLabel: 'Final Delivery Deadline:',
    deadlineContext: 'For video campaign start 11-08-2025',
    by: 'By:',
    priority: 'Priority',
    status: 'Status'
  }
};

interface VideoIdea {
  id: string;
  title: string;
  description: string;
  category: 'promotie' | 'tutorial' | 'testimonial' | 'lifestyle' | 'behind-the-scenes';
  priority: 'hoog' | 'medium' | 'laag';
  status: 'concept' | 'in-opname' | 'bewerking' | 'klaar' | 'gepubliceerd';
  location: string;
  estimatedDuration: string;
  targetAudience: string;
  keyMessages: string[];
  requiredProps: string[];
  notes: string;
  cameraInstructions: string;
  dutchScript: string;
  englishScript: string;
  deadline: string;
  createdAt: string;
  assignedTo: string;
}

const videoIdeas: VideoIdea[] = [
  {
    id: '1',
    title: 'Become a Top Tier Man - Ibiza Sunrise Motivation',
    description: 'Rick op een Ibiza klif tijdens zonsopgang, sprekend over wat het betekent om een Top Tier Man te zijn. Motiverende voice-over over discipline en mindset.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Cala Comte Klif (Zonsopgang)',
    estimatedDuration: '30-45 seconden',
    targetAudience: 'Ambitieuze mannen (25-45 jaar)',
    keyMessages: ['Become a Top Tier Man', 'Discipline', 'Mindset', 'Launch 1 September', 'Pre-register now'],
    requiredProps: ['Camera setup', 'Microfoon', 'Zonsopgang timing', 'Countdown overlay'],
    notes: 'Opname tijdens zonsopgang (6:30 AM). Rick spreekt direct in camera over Top Tier Man concept. HOOK: Start met spectaculaire drone shot van klif en Rick silhouette.',
    cameraInstructions: 'CAMERA: Start with dramatic drone shot of cliff and Rick silhouette. Wide shot of Rick on cliff with sunrise background. Rick in center frame, cliff and sea visible. Medium close-up shots for emotion. Ensure golden hour lighting. STABILIZATION: Gimbal or tripod for smooth movements. AUDIO: Lavalier microphone for Rick, wind protection. LIGHTING: Natural light, ND filter for sunrise. COMPOSITION: Rule of thirds, Rick on 1/3 line, sunrise on 2/3. DRONE: Aerial shots of cliff and Rick for opening/closing. HOOK: First 3 seconds must be visually stunning with dramatic sunrise and Rick silhouette.',
    dutchScript: 'Discipline is de brug tussen doelen en prestaties. Ben je klaar om een Top Tier Man te worden? Lancering 1 september. Pre-registreer nu voor exclusieve vroege toegang.',
    englishScript: 'Discipline is the bridge between goals and accomplishment. Are you ready to become a Top Tier Man? Join the most exclusive community of high performers.',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '2',
    title: 'Boxing Training Session - Discipline in Action',
    description: 'Rick tijdens zijn boks PT sessie op zaterdag. Toont discipline en fysieke uitdaging. Voice-over over doorzettingsvermogen.',
    category: 'lifestyle',
    priority: 'hoog',
    status: 'concept',
    location: 'Ibiza Boxing Gym',
    estimatedDuration: '45-60 seconden',
    targetAudience: 'Fitness geïnteresseerden',
    keyMessages: ['Discipline in Action', 'Physical Challenge', 'Mental Strength', 'Top Tier Performance'],
    requiredProps: ['Boxing gloves', 'Training gear', 'Camera setup', 'Gym access'],
    notes: 'Opname tijdens zaterdag boks sessie. Rick toont intense training. HOOK: Start met slow motion punch impact.',
    cameraInstructions: 'CAMERA: Start with slow motion punch impact shot. Handheld for dynamic movement. Close-up shots of Rick\'s face during training. Wide shots of full training session. Medium shots of technique. STABILIZATION: Gimbal for smooth movements, handheld for raw energy. AUDIO: Lavalier microphone under shirt, gym sounds in background. LIGHTING: Gym lighting + LED panels for fill light. COMPOSITION: Rick always in center frame, focus on movement and intensity. SLOW MOTION: For impact shots and technique demonstrations. B-ROLL: Close-ups of gloves, sweat, focus in eyes. HOOK: First 3 seconds must show intense physical action with slow motion impact.',
    dutchScript: 'Discipline is doen wat er gedaan moet worden, ook als je er geen zin in hebt. Dit is wat Top Tier Men onderscheidt van de rest. Ben je klaar om je grenzen te verleggen? Lancering 1 september.',
    englishScript: 'Discipline is doing what needs to be done, even when you don\'t want to. This is what separates Top Tier Men from the rest. Are you ready to push your limits?',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '3',
    title: 'Ibiza Beach Meditation - Mindset Mastery',
    description: 'Rick op een rustige Ibiza beach, mediterend en sprekend over mindset en mentale kracht.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Cala Salada Beach',
    estimatedDuration: '30-45 seconden',
    targetAudience: 'Mindfulness geïnteresseerden',
    keyMessages: ['Mindset Mastery', 'Mental Clarity', 'Inner Strength', 'Top Tier Mindset'],
    requiredProps: ['Meditation setup', 'Beach access', 'Quiet location', 'Natural sound'],
    notes: 'Vroege ochtend op rustige beach. Rick in meditatie pose, sprekend over mindset. HOOK: Start met vredige beach shot met golven.',
    cameraInstructions: 'CAMERA: Start with peaceful beach shot with waves. Wide shot of Rick on beach with sea background. Close-up of Rick\'s face in meditation. Medium shot of full pose. STABILIZATION: Tripod for stable shots, no movement. AUDIO: Lavalier microphone, natural beach sounds (waves, birds). LIGHTING: Soft morning light, no harsh shadows. COMPOSITION: Rick in center, sea in background. Rule of thirds. SLOW MOTION: For meditation movements and breathing. B-ROLL: Close-ups of hands, feet in sand, waves, birds. HOOK: First 3 seconds must show peaceful beach atmosphere with gentle waves.',
    dutchScript: 'Je mindset bepaalt je realiteit. Top Tier Men beheersen hun gedachten voordat ze hun acties beheersen. Lancering 1 september.',
    englishScript: 'Your mindset determines your reality. Top Tier Men master their thoughts before they master their actions.',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '4',
    title: 'Sunset Countdown - 1 September Launch',
    description: 'Rick op Ibiza sunset point met countdown naar 1 september. Krachtige call-to-action voor pre-registratie.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Es Vedrà Sunset Point',
    estimatedDuration: '20-30 seconden',
    targetAudience: 'Alle potentiële leden',
    keyMessages: ['Countdown to Launch', 'Pre-register now', 'Exclusive Access', '1 September'],
    requiredProps: ['Countdown timer overlay', 'Sunset timing', 'Camera setup', 'Dramatic lighting'],
    notes: 'Opname tijdens zonsondergang. Rick spreekt over de countdown. HOOK: Start met spectaculaire sunset time-lapse.',
    cameraInstructions: 'CAMERA: Start with spectacular sunset time-lapse. Wide shot of Rick with Es Vedrà background. Medium close-up for countdown moment. Rick in silhouette against sunset. STABILIZATION: Tripod for stable shots. AUDIO: Lavalier microphone, wind protection. LIGHTING: Sunset lighting, Rick in silhouette, Es Vedrà illuminated. COMPOSITION: Rick on 1/3 line, Es Vedrà on 2/3. DRAMATIC: Silhouette shots of Rick against sunset. B-ROLL: Time-lapse of sunset, Es Vedrà shots. OVERLAY: Countdown timer in post-production. HOOK: First 3 seconds must show dramatic sunset time-lapse with Es Vedrà.',
    dutchScript: 'De countdown is begonnen. 1 september 2025. Word een Top Tier Man. Pre-registreer nu voor exclusieve vroege toegang. Mis je kans niet om bij de elite te horen.',
    englishScript: 'The countdown has begun. Become a Top Tier Man. Join the most exclusive community of high performers.',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '5',
    title: 'Ibiza Villa Lifestyle - Success Mindset',
    description: 'Rick in een Ibiza villa, sprekend over succes mindset en hoe Top Tier Men leven en denken.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Luxury Ibiza Villa',
    estimatedDuration: '45-60 seconden',
    targetAudience: 'Lifestyle aspiranten',
    keyMessages: ['Success Mindset', 'Luxury Lifestyle', 'Top Tier Living', 'Elite Community'],
    requiredProps: ['Villa access', 'Luxury setting', 'Professional lighting', 'Lifestyle props'],
    notes: 'Rick in villa setting, sprekend over succes mindset. HOOK: Start met luxe villa exterieur shot.',
    cameraInstructions: 'CAMERA: Start with luxury villa exterior shot. Wide shots of villa interior with Rick. Medium shots of Rick speaking. Close-ups of lifestyle details. STABILIZATION: Tripod for interviews, handheld for lifestyle shots. AUDIO: Lavalier microphone, villa ambiance. LIGHTING: Natural light + LED panels for fill. COMPOSITION: Rick in center, villa details in background. B-ROLL: Villa exterior, pool, view, lifestyle items. MOVEMENT: Slow pan shots of villa interior. LIGHTING: Warm, luxury feel with golden hour light. HOOK: First 3 seconds must show luxury villa exterior with pool and sea view.',
    dutchScript: 'Succes is niet toevallig. Top Tier Men denken anders, handelen anders, leven anders. Sluit je aan bij de elite. Lancering 1 september.',
    englishScript: 'Success is not accidental. Top Tier Men think differently, act differently, live differently. Join the elite.',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '6',
    title: 'Beach Workout - Physical Discipline',
    description: 'Rick doet een beach workout op Ibiza, toont fysieke discipline en motivatie.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Playa d\'en Bossa Beach',
    estimatedDuration: '30-45 seconden',
    targetAudience: 'Fitness community',
    keyMessages: ['Physical Discipline', 'Beach Training', 'Consistency', 'Top Tier Fitness'],
    requiredProps: ['Workout equipment', 'Beach access', 'Training gear', 'Camera setup'],
    notes: 'Rick doet intense beach workout. HOOK: Start met dynamische workout beweging.',
    cameraInstructions: 'CAMERA: Start with dynamic workout movement. Wide shots of Rick on beach with sea background. Medium shots of workout movements. Close-ups of muscles and focus. STABILIZATION: Gimbal for smooth movements, handheld for energy. AUDIO: Lavalier microphone, beach sounds in background. LIGHTING: Natural sunlight, reflectors for fill light. COMPOSITION: Rick in center, sea in background. SLOW MOTION: For workout movements and impact shots. B-ROLL: Close-ups of sand, waves, workout equipment. MOVEMENT: Dynamic camera movements following workout. HOOK: First 3 seconds must show intense beach workout with dramatic movement.',
    dutchScript: 'Discipline is consistentie in actie. Elke rep, elke set, elke dag. Zo bouwen Top Tier Men hun lichaam en karakter op. Ben je klaar om te committeren? Lancering 1 september.',
    englishScript: 'Discipline is consistency in action. Every rep, every set, every day. This is how Top Tier Men build their bodies and their character. Are you ready to commit?',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '7',
    title: 'Rooftop Motivation - Become Elite',
    description: 'Rick op een Ibiza rooftop, sprekend over wat het betekent om elite te worden en deel te zijn van Top Tier Men.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Ibiza Rooftop Terrace',
    estimatedDuration: '45-60 seconden',
    targetAudience: 'Ambitieuze professionals',
    keyMessages: ['Become Elite', 'Top Tier Community', 'Exclusive Access', 'Pre-register'],
    requiredProps: ['Rooftop access', 'City view', 'Professional audio', 'Dramatic backdrop'],
    notes: 'Rick op rooftop met Ibiza uitzicht. HOOK: Start met spectaculair city skyline shot.',
    cameraInstructions: 'CAMERA: Start with spectacular city skyline shot. Wide shot of Rick on rooftop with Ibiza skyline. Medium close-up for motivation moments. Rick in center with city view background. STABILIZATION: Tripod for stable shots. AUDIO: Lavalier microphone, wind protection. LIGHTING: Golden hour light, city lights in background. COMPOSITION: Rick on 1/3 line, city view on 2/3. DRAMATIC: Rick in silhouette against sunset/city lights. B-ROLL: City skyline, rooftop details, Ibiza landmarks. MOVEMENT: Slow pan from city view to Rick. HOOK: First 3 seconds must show dramatic city skyline with sunset colors.',
    dutchScript: 'Elite is geen titel, het is een keuze. Top Tier Men kiezen elke dag voor excellentie. Sluit je aan bij de meest exclusieve community van high performers. Lancering 1 september. Pre-registreer nu.',
    englishScript: 'Elite is not a title, it\'s a choice. Top Tier Men choose excellence every day. Join the most exclusive community of high performers.',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '8',
    title: 'Night Club Energy - Success Mindset',
    description: 'Rick in Ibiza nightclub setting, sprekend over succes mindset en de energie van Top Tier Men.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Ibiza Nightclub',
    estimatedDuration: '30-45 seconden',
    targetAudience: 'Young professionals',
    keyMessages: ['Success Energy', 'Nightlife Balance', 'Top Tier Lifestyle', 'Work Hard, Play Hard'],
    requiredProps: ['Club access', 'Night lighting', 'Audio setup', 'Lifestyle props'],
    notes: 'Rick in club setting, sprekend over balans. HOOK: Start met energieke club atmosfeer.',
    cameraInstructions: 'CAMERA: Start with energetic club atmosphere. Wide shots of club with Rick. Medium shots of Rick speaking. Close-ups of club energy. STABILIZATION: Handheld for dynamic energy, gimbal for smooth shots. AUDIO: Lavalier microphone, club music in background. LIGHTING: Club lighting + LED panels for Rick\'s face. COMPOSITION: Rick in center, club ambiance in background. B-ROLL: Club interior, people, dancing, drinks. MOVEMENT: Dynamic camera movements following club energy. LIGHTING: Neon lights, club atmosphere, Rick well lit. HOOK: First 3 seconds must show energetic club atmosphere with neon lights and people.',
    dutchScript: 'Top Tier Men weten hoe ze hard moeten werken en hard moeten spelen. Succes gaat niet alleen over business, het gaat over het leven ten volste leven. Sluit je aan bij de elite. Lancering 1 september.',
    englishScript: 'Top Tier Men know how to work hard and play hard. Success is not just about business, it\'s about living life to the fullest. Join the elite.',
    deadline: '08-08-2025',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  }
];

export default function VideoIdeeenIbizaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [selectedPriority, setSelectedPriority] = useState<string>('alle');
  const [showDeadlineWarning, setShowDeadlineWarning] = useState<boolean>(true);
  const [language, setLanguage] = useState<'nl' | 'en'>('nl');

  const t = translations[language];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept': return 'bg-gray-500 text-white';
      case 'in-opname': return 'bg-blue-500 text-white';
      case 'bewerking': return 'bg-yellow-500 text-black';
      case 'klaar': return 'bg-green-500 text-white';
      case 'gepubliceerd': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hoog': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'laag': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'promotie': return <MegaphoneIcon className="w-4 h-4" />;
      case 'tutorial': return <AcademicCapIcon className="w-4 h-4" />;
      case 'testimonial': return <UserIcon className="w-4 h-4" />;
      case 'lifestyle': return <StarIcon className="w-4 h-4" />;
      case 'behind-the-scenes': return <EyeIcon className="w-4 h-4" />;
      default: return <VideoCameraIcon className="w-4 h-4" />;
    }
  };

  const filteredIdeas = videoIdeas.filter(idea => {
    const categoryMatch = selectedCategory === 'alle' || idea.category === selectedCategory;
    const priorityMatch = selectedPriority === 'alle' || idea.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  // Calculate days until September 1st, 2025
  const calculateDaysUntilLaunch = () => {
    const launchDate = new Date('2025-09-01');
    const today = new Date();
    const diffTime = launchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilLaunch = calculateDaysUntilLaunch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1a1f2e] to-[#0F1419]">
      {/* Language Switcher */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-end px-4 py-2">
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setLanguage('nl')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === 'nl' 
                  ? 'bg-[#8BAE5A] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">🇳🇱</span>
              <span className="hidden sm:inline">Nederlands</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === 'en' 
                  ? 'bg-[#8BAE5A] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">🇬🇧</span>
              <span className="hidden sm:inline">English</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/images/brotherhood/ardennen.png')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
                         <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">
               {t.title}
               <span className="block text-[#8BAE5A]">{t.subtitle}</span>
             </h1>
             <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
               {t.description}
             </p>
            
                         {/* Countdown Banner */}
             <div className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8 mx-4">
               <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                 <div className="text-center">
                   <div className="text-2xl sm:text-3xl font-bold text-white">{daysUntilLaunch}</div>
                   <div className="text-xs sm:text-sm text-white/80">{t.daysUntilLaunch}</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl sm:text-3xl font-bold text-white">1</div>
                   <div className="text-xs sm:text-sm text-white/80">{t.september}</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl sm:text-3xl font-bold text-white">2025</div>
                   <div className="text-xs sm:text-sm text-white/80">{t.topTierMen}</div>
                 </div>
               </div>

             </div>
          </div>
        </div>
      </div>

             {/* Stats Section */}
       <div className="px-4 sm:px-6 py-8 sm:py-12">
         <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                         <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-xs sm:text-sm">{t.totalVideos}</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">{videoIdeas.length}</p>
                 </div>
                 <VideoCameraIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#8BAE5A]" />
               </div>
             </div>
            
                         <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-xs sm:text-sm">{t.highPriority}</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">
                     {videoIdeas.filter(idea => idea.priority === 'hoog').length}
                   </p>
                 </div>
                 <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
               </div>
             </div>
            
                         <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-xs sm:text-sm">{t.ibizaLocations}</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">8</p>
                 </div>
                 <MapPinIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
               </div>
             </div>
            
                         <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-xs sm:text-sm">{t.rickAsAuthority}</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                 </div>
                 <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#B6C948]" />
               </div>
             </div>
          </div>

                     {/* Deadline Warning */}
           {showDeadlineWarning && (
             <div className="bg-red-900/20 backdrop-blur-sm border border-red-700/30 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
               <div className="flex items-start justify-between">
                 <div className="flex items-center gap-3">
                   <CalendarIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                   <div>
                     <h2 className="text-lg sm:text-xl font-semibold text-red-300 mb-2">{t.deadlineAlert}</h2>
                     <p className="text-red-200 text-sm sm:text-base">
                       <strong>{t.deadlineText}</strong>
                     </p>
                     <p className="text-red-300 text-xs sm:text-sm mt-1">
                       {t.campaignStart}
                     </p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowDeadlineWarning(false)}
                   className="text-red-400 hover:text-red-300 text-sm"
                 >
                   ✕
                 </button>
               </div>
             </div>
           )}

                     {/* Filters */}
           <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
             <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">{t.filterVideos}</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Categorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="alle">{t.allCategories}</option>
                  <option value="promotie">{t.promotion}</option>
                  <option value="tutorial">{t.tutorial}</option>
                  <option value="testimonial">{t.testimonial}</option>
                  <option value="lifestyle">{t.lifestyle}</option>
                  <option value="behind-the-scenes">{t.behindTheScenes}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{t.priority}</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="alle">{t.allPriorities}</option>
                  <option value="hoog">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="laag">{t.low}</option>
                </select>
              </div>
            </div>
          </div>

                     {/* Video Ideas Grid */}
           <div className="grid grid-cols-1 gap-6 sm:gap-8">
                         {filteredIdeas.map((idea) => (
               <div key={idea.id} className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#8BAE5A]/50 transition-all duration-300">
                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                   <div className="flex items-center gap-3">
                     {getCategoryIcon(idea.category)}
                     <h3 className="text-lg sm:text-xl font-semibold text-white">{idea.title}</h3>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(idea.priority)}`}>
                       {idea.priority}
                     </span>
                   </div>
                 </div>
                
                <p className="text-gray-400 mb-4">{idea.description}</p>
                
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                     <span className="truncate">{idea.location}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-400">
                     <ClockIcon className="w-4 h-4 flex-shrink-0" />
                     <span>{idea.estimatedDuration}</span>
                   </div>
                 </div>
                 
                 <div className="mb-4 p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                   <div className="flex items-center gap-2 text-sm text-red-300">
                     <CalendarIcon className="w-4 h-4" />
                                        <span className="font-medium">{t.deadlineLabel}</span>
                   <span className="text-red-200 font-bold">{idea.deadline}</span>
                 </div>
                 <p className="text-xs text-red-300 mt-1">
                   {t.deadlineContext}
                 </p>
                 </div>
                
                                 <div className="mb-4">
                   <h4 className="text-sm font-medium text-white mb-2">{t.keyMessages}</h4>
                   <div className="flex flex-wrap gap-1 sm:gap-2">
                     {idea.keyMessages.map((message, index) => (
                       <span key={index} className="bg-[#8BAE5A]/20 text-[#8BAE5A] px-2 py-1 rounded text-xs border border-[#8BAE5A]/30 whitespace-nowrap">
                         {message}
                       </span>
                     ))}
                   </div>
                 </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">{t.targetAudience}</h4>
                  <p className="text-sm text-gray-400">{idea.targetAudience}</p>
                </div>
                
                                 {idea.notes && (
                   <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                     <h4 className="text-sm font-medium text-white mb-1">{t.recordingDetails}</h4>
                     <p className="text-sm text-gray-400">{idea.notes}</p>
                   </div>
                 )}
                 
                 {idea.cameraInstructions && (
                   <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                     <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
                       <VideoCameraIcon className="w-4 h-4" />
                       {t.cameraInstructions}
                     </h4>
                     <p className="text-sm text-blue-200 leading-relaxed">{idea.cameraInstructions}</p>
                   </div>
                 )}
                 
                 <div className="mb-4 space-y-3">
                   {idea.dutchScript && (
                     <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                       <h4 className="text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
                         <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">NL</span>
                         {t.dutchVoiceover}
                       </h4>
                       <p className="text-sm text-green-200 leading-relaxed">{idea.dutchScript}</p>
                     </div>
                   )}
                   
                   {idea.englishScript && (
                     <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                       <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                         <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">EN</span>
                         {t.englishVoiceover}
                       </h4>
                       <p className="text-sm text-purple-200 leading-relaxed">{idea.englishScript}</p>
                     </div>
                   )}
                 </div>
                
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-800 gap-2">
                   <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-400">
                     <span>{t.by}: {idea.assignedTo}</span>
                     <span className="hidden sm:inline">•</span>
                     <span>{idea.createdAt}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                       {idea.status}
                     </span>
                   </div>
                 </div>
              </div>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
} 