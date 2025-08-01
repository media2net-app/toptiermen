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
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Ambitieuze mannen (25-45 jaar)',
    keyMessages: ['Become a Top Tier Man', 'Discipline', 'Mindset', 'Launch 1 September', 'Pre-register now'],
    requiredProps: ['Camera setup', 'Microfoon', 'Zonsopgang timing', 'Countdown overlay'],
    notes: 'Opname tijdens zonsopgang (6:30 AM). Rick spreekt direct in camera over Top Tier Man concept. Voice-over: "Discipline is the bridge between goals and accomplishment. Are you ready to become a Top Tier Man? Launch September 1st. Pre-register now."',
    cameraInstructions: 'CAMERA: Wide shot van Rick op klif met zonsopgang op achtergrond. Rick in center frame, klif en zee zichtbaar. Medium close-up shots voor emotie. Zorg voor golden hour belichting. STABILISATIE: Gimbal of tripod voor vloeiende bewegingen. AUDIO: Lavalier microfoon voor Rick, wind protection. BELICHTING: Natuurlijk licht, ND filter voor zonsopgang. COMPOSITIE: Rule of thirds, Rick op 1/3 lijn, zonsopgang op 2/3. DRONE: Aerial shots van klif en Rick voor opening/closing.',
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
    estimatedDuration: '3-4 minuten',
    targetAudience: 'Fitness geïnteresseerden',
    keyMessages: ['Discipline in Action', 'Physical Challenge', 'Mental Strength', 'Top Tier Performance'],
    requiredProps: ['Boxing gloves', 'Training gear', 'Camera setup', 'Gym access'],
    notes: 'Opname tijdens zaterdag boks sessie. Rick toont intense training. Voice-over: "Discipline is doing what needs to be done, even when you don\'t want to. This is what separates Top Tier Men from the rest. Are you ready to push your limits?"',
    cameraInstructions: 'CAMERA: Handheld voor dynamische beweging. Close-up shots van Rick\'s gezicht tijdens training. Wide shots van volledige training sessie. Medium shots van techniek. STABILISATIE: Gimbal voor vloeiende bewegingen, handheld voor rauwe energie. AUDIO: Lavalier microfoon onder shirt, gym geluiden op achtergrond. BELICHTING: Gym belichting + LED panels voor fill light. COMPOSITIE: Rick altijd in center frame, focus op beweging en intensiteit. SLOW MOTION: Voor impact shots en techniek demonstraties. B-ROLL: Close-ups van handschoenen, zweet, focus in ogen.',
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
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Mindfulness geïnteresseerden',
    keyMessages: ['Mindset Mastery', 'Mental Clarity', 'Inner Strength', 'Top Tier Mindset'],
    requiredProps: ['Meditation setup', 'Beach access', 'Quiet location', 'Natural sound'],
    notes: 'Vroege ochtend op rustige beach. Rick in meditatie pose, sprekend over mindset. Voice-over: "Your mindset determines your reality. Top Tier Men master their thoughts before they master their actions. Launch September 1st."',
    cameraInstructions: 'CAMERA: Wide shot van Rick op beach met zee op achtergrond. Close-up van Rick\'s gezicht in meditatie. Medium shot van volledige pose. STABILISATIE: Tripod voor stabiele shots, geen beweging. AUDIO: Lavalier microfoon, natuurlijke beach geluiden (golven, vogels). BELICHTING: Soft morning light, geen harde schaduwen. COMPOSITIE: Rick in center, zee op achtergrond. Rule of thirds. SLOW MOTION: Voor meditatie bewegingen en ademhaling. B-ROLL: Close-ups van handen, voeten in zand, golven, vogels.',
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
    estimatedDuration: '1-2 minuten',
    targetAudience: 'Alle potentiële leden',
    keyMessages: ['Countdown to Launch', 'Pre-register now', 'Exclusive Access', '1 September'],
    requiredProps: ['Countdown timer overlay', 'Sunset timing', 'Camera setup', 'Dramatic lighting'],
    notes: 'Opname tijdens zonsondergang. Rick spreekt over de countdown. Voice-over: "The countdown has begun. September 1st, 2025. Become a Top Tier Man. Pre-register now for exclusive early access. Don\'t miss your chance to join the elite."',
    cameraInstructions: 'CAMERA: Wide shot van Rick met Es Vedrà op achtergrond. Medium close-up voor countdown moment. Rick in silhouette tegen sunset. STABILISATIE: Tripod voor stabiele shots. AUDIO: Lavalier microfoon, wind protection. BELICHTING: Sunset belichting, Rick in silhouette, Es Vedrà verlicht. COMPOSITIE: Rick op 1/3 lijn, Es Vedrà op 2/3. DRAMATIC: Silhouette shots van Rick tegen sunset. B-ROLL: Time-lapse van sunset, Es Vedrà shots. OVERLAY: Countdown timer in post-productie.',
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
    estimatedDuration: '4-5 minuten',
    targetAudience: 'Lifestyle aspiranten',
    keyMessages: ['Success Mindset', 'Luxury Lifestyle', 'Top Tier Living', 'Elite Community'],
    requiredProps: ['Villa access', 'Luxury setting', 'Professional lighting', 'Lifestyle props'],
    notes: 'Rick in villa setting, sprekend over succes mindset. Voice-over: "Success is not accidental. Top Tier Men think differently, act differently, live differently. Join the elite. Launch September 1st."',
    cameraInstructions: 'CAMERA: Wide shots van villa interieur met Rick. Medium shots van Rick sprekend. Close-ups van lifestyle details. STABILISATIE: Tripod voor interviews, handheld voor lifestyle shots. AUDIO: Lavalier microfoon, villa ambiance. BELICHTING: Natural light + LED panels voor fill. COMPOSITIE: Rick in center, villa details op achtergrond. B-ROLL: Villa exterieur, pool, uitzicht, lifestyle items. MOVEMENT: Slow pan shots van villa interieur. LIGHTING: Warm, luxury feel met golden hour light.',
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
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Fitness community',
    keyMessages: ['Physical Discipline', 'Beach Training', 'Consistency', 'Top Tier Fitness'],
    requiredProps: ['Workout equipment', 'Beach access', 'Training gear', 'Camera setup'],
    notes: 'Rick doet intense beach workout. Voice-over: "Discipline is consistency in action. Every rep, every set, every day. This is how Top Tier Men build their bodies and their character. Are you ready to commit?"',
    cameraInstructions: 'CAMERA: Wide shots van Rick op beach met zee op achtergrond. Medium shots van workout bewegingen. Close-ups van spieren en focus. STABILISATIE: Gimbal voor vloeiende bewegingen, handheld voor energie. AUDIO: Lavalier microfoon, beach geluiden op achtergrond. BELICHTING: Natural sunlight, reflectors voor fill light. COMPOSITIE: Rick in center, zee op achtergrond. SLOW MOTION: Voor workout bewegingen en impact shots. B-ROLL: Close-ups van zand, golven, workout equipment. MOVEMENT: Dynamic camera movements die workout volgen.',
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
    estimatedDuration: '3-4 minuten',
    targetAudience: 'Ambitieuze professionals',
    keyMessages: ['Become Elite', 'Top Tier Community', 'Exclusive Access', 'Pre-register'],
    requiredProps: ['Rooftop access', 'City view', 'Professional audio', 'Dramatic backdrop'],
    notes: 'Rick op rooftop met Ibiza uitzicht. Voice-over: "Elite is not a title, it\'s a choice. Top Tier Men choose excellence every day. Join the most exclusive community of high performers. Launch September 1st. Pre-register now."',
    cameraInstructions: 'CAMERA: Wide shot van Rick op rooftop met Ibiza skyline. Medium close-up voor motivatie momenten. Rick in center met city view op achtergrond. STABILISATIE: Tripod voor stabiele shots. AUDIO: Lavalier microfoon, wind protection. BELICHTING: Golden hour light, city lights op achtergrond. COMPOSITIE: Rick op 1/3 lijn, city view op 2/3. DRAMATIC: Rick in silhouette tegen sunset/city lights. B-ROLL: City skyline, rooftop details, Ibiza landmarks. MOVEMENT: Slow pan van city view naar Rick.',
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
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Young professionals',
    keyMessages: ['Success Energy', 'Nightlife Balance', 'Top Tier Lifestyle', 'Work Hard, Play Hard'],
    requiredProps: ['Club access', 'Night lighting', 'Audio setup', 'Lifestyle props'],
    notes: 'Rick in club setting, sprekend over balans. Voice-over: "Top Tier Men know how to work hard and play hard. Success is not just about business, it\'s about living life to the fullest. Join the elite. Launch September 1st."',
    cameraInstructions: 'CAMERA: Wide shots van club met Rick. Medium shots van Rick sprekend. Close-ups van club energie. STABILISATIE: Handheld voor dynamische energie, gimbal voor vloeiende shots. AUDIO: Lavalier microfoon, club muziek op achtergrond. BELICHTING: Club lighting + LED panels voor Rick\'s gezicht. COMPOSITIE: Rick in center, club ambiance op achtergrond. B-ROLL: Club interieur, mensen, dansen, drinks. MOVEMENT: Dynamic camera movements die club energie volgen. LIGHTING: Neon lights, club atmosphere, Rick goed belicht.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  }
];

export default function VideoIdeeenIbizaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [selectedPriority, setSelectedPriority] = useState<string>('alle');

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
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/images/brotherhood/ardennen.png')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
                         <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">
               Video Ideeën
               <span className="block text-[#8BAE5A]">Ibiza</span>
             </h1>
             <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
               Ontdek de exclusieve video concepten die Rick in Ibiza gaat opnemen voor de Top Tier Men community
             </p>
            
                         {/* Countdown Banner */}
             <div className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8 mx-4">
               <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                 <div className="text-center">
                   <div className="text-2xl sm:text-3xl font-bold text-white">{daysUntilLaunch}</div>
                   <div className="text-xs sm:text-sm text-white/80">Dagen tot Launch</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl sm:text-3xl font-bold text-white">1</div>
                   <div className="text-xs sm:text-sm text-white/80">September</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl sm:text-3xl font-bold text-white">2025</div>
                   <div className="text-xs sm:text-sm text-white/80">Top Tier Men</div>
                 </div>
               </div>
               <div className="text-center mt-4">
                 <a 
                   href="/offerte" 
                   className="inline-flex items-center gap-2 bg-white text-[#8BAE5A] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
                 >
                   Pre-register Nu
                   <ArrowRightIcon className="w-4 h-4" />
                 </a>
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
                   <p className="text-gray-400 text-xs sm:text-sm">Totaal Video's</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">{videoIdeas.length}</p>
                 </div>
                 <VideoCameraIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#8BAE5A]" />
               </div>
             </div>
            
                         <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-xs sm:text-sm">Hoog Prioriteit</p>
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
                   <p className="text-gray-400 text-xs sm:text-sm">Ibiza Locaties</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">8</p>
                 </div>
                 <MapPinIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
               </div>
             </div>
            
                         <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-xs sm:text-sm">Rick als Autoriteit</p>
                   <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                 </div>
                 <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#B6C948]" />
               </div>
             </div>
          </div>

                     {/* Filters */}
           <div className="bg-black/50 backdrop-blur-sm border border-gray-800 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
             <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Filter Video's</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Categorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="alle">Alle Categorieën</option>
                  <option value="promotie">Promotie</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="behind-the-scenes">Behind-the-Scenes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prioriteit</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="alle">Alle Prioriteiten</option>
                  <option value="hoog">Hoog</option>
                  <option value="medium">Medium</option>
                  <option value="laag">Laag</option>
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
                
                                 <div className="mb-4">
                   <h4 className="text-sm font-medium text-white mb-2">Kernboodschappen:</h4>
                   <div className="flex flex-wrap gap-1 sm:gap-2">
                     {idea.keyMessages.map((message, index) => (
                       <span key={index} className="bg-[#8BAE5A]/20 text-[#8BAE5A] px-2 py-1 rounded text-xs border border-[#8BAE5A]/30 whitespace-nowrap">
                         {message}
                       </span>
                     ))}
                   </div>
                 </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">Doelgroep:</h4>
                  <p className="text-sm text-gray-400">{idea.targetAudience}</p>
                </div>
                
                                 {idea.notes && (
                   <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                     <h4 className="text-sm font-medium text-white mb-1">Opname Details:</h4>
                     <p className="text-sm text-gray-400">{idea.notes}</p>
                   </div>
                 )}
                 
                 {idea.cameraInstructions && (
                   <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                     <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
                       <VideoCameraIcon className="w-4 h-4" />
                       Camera Instructies
                     </h4>
                     <p className="text-sm text-blue-200 leading-relaxed">{idea.cameraInstructions}</p>
                   </div>
                 )}
                
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-800 gap-2">
                   <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-400">
                     <span>Door: {idea.assignedTo}</span>
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

                     {/* Call to Action */}
           <div className="mt-12 sm:mt-16 text-center px-4">
             <div className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] p-6 sm:p-8 rounded-2xl">
               <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                 Klaar om een Top Tier Man te worden?
               </h2>
               <p className="text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                 Deze video's zijn slechts het begin. Word lid van de meest exclusieve community van high performers en begin je reis naar succes.
               </p>
               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                 <a 
                   href="/offerte" 
                   className="inline-flex items-center justify-center gap-2 bg-white text-[#8BAE5A] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
                 >
                   Pre-register Nu
                   <ArrowRightIcon className="w-4 h-4" />
                 </a>
                 <a 
                   href="/login" 
                   className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-[#8BAE5A] transition-colors text-sm sm:text-base"
                 >
                   Login
                   <ArrowRightIcon className="w-4 h-4" />
                 </a>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
} 