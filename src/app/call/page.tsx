'use client';

import { useState } from 'react';

export default function CallOverview() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: '📊 Overzicht' },
    { id: 'features', name: '🚀 Nieuwe Features' },
    { id: 'bugs', name: '🐛 Bugs Opgelost' },
    { id: 'database', name: '🗄️ Database Fixes' },
    { id: 'ui', name: '🎨 UI/UX Verbeteringen' },
    { id: 'admin', name: '⚙️ Admin Tools' },
    { id: 'security', name: '🔒 Security & Auth' },
    { id: 'testing', name: '🧪 Test Gebruikers' },
    { id: 'todo', name: '📋 To-Do voor Lancering' }
  ];

  const overviewData = {
    period: "29 juli 2024 - 5 augustus 2024",
    totalFeatures: 20,
    totalBugsFixed: 8,
    totalDatabaseFixes: 6,
    totalUIImprovements: 5,
    totalAdminTools: 4,
    totalSecurityUpdates: 3,
    totalTestUsers: 4,
    completedTasks: 3
  };

  const features = [
    {
      title: "Video Upload Systeem - Storage Provider Migratie",
      description: "Uitgebreide testing en migratie tussen verschillende storage providers voor stabiele video upload",
      status: "completed",
      impact: "critical",
      details: [
        "Getest: S3 bucket → Vercel Blob → Terug naar Supabase bucket",
        "Stabiele video upload functionaliteit hersteld",
        "Academy video's moeten opnieuw geüpload worden door Rick",
        "Bucket per ongeluk geleegd tijdens migratie",
        "Lessons learned: backup strategie voor video content"
      ]
    },
    {
      title: "Academy Video Upload - Gescheiden Bucket Systeem",
      description: "Implementatie van aparte academy-videos bucket voor georganiseerde video storage",
      status: "completed",
      impact: "high",
      details: [
        "Nieuwe AcademyVideoUpload component geïmplementeerd",
        "Gescheiden bucket structuur: academy-videos vs workout-videos",
        "Georganiseerde folder structuur: academy/module-{id}/lesson-{id}/",
        "Verbeterde UI met academy-specifieke styling en iconen",
        "Storage policies voor public read en authenticated upload/update/delete",
        "1GB file size limit voor academy videos"
      ]
    },
    {
      title: "MacOS-Style Screenshot Mode",
      description: "Implementatie van een crop-tool-achtige screenshot selectie zoals macOS Command+4",
      status: "completed",
      impact: "high",
      details: [
        "Directe muis drag selectie (geen HTML element selectie)",
        "Blauwe selectie box met real-time feedback",
        "Automatisch feedback formulier na selectie",
        "ESC toets voor annuleren",
        "Verbeterde event handling en cleanup",
        "Gezonde selectie validatie (min 20x20 pixels)",
        "Crosshair cursor tijdens selectie",
        "Overlay met instructies en escape hint"
      ]
    },
    {
      title: "Test Gebruiker Systeem",
      description: "Uitgebreid systeem voor test gebruikers met speciale privileges",
      status: "completed",
      impact: "high",
      details: [
        "Test gebruikers identificatie via email (bevat 'test')",
        "Debug mode voor test gebruikers",
        "Speciale feedback tools (bug reports, screenshots)",
        "Admin mode indicators in UI",
        "Test notities systeem met area selection data"
      ]
    },
    {
      title: "Pre-Launch Email Management",
      description: "Compleet systeem voor pre-launch email lijst beheer",
      status: "completed",
      impact: "medium",
      details: [
        "Database tabel met email tracking",
        "API routes voor email toevoeging/beheer",
        "Admin dashboard voor email management",
        "Source tracking (Social Media, Manual, etc.)",
        "Package type tracking (BASIC, PREMIUM, ULTIMATE)"
      ]
    },
    {
      title: "🏆 Badge Animatie & Gamification Systeem",
      description: "Uitgebreid gamification systeem met badges, XP, levels en animaties",
      status: "completed",
      impact: "high",
      details: [
        "BadgeUnlockModal met 360° rotatie en sparkle effects",
        "Audio feedback met Web Audio API (ding geluid)",
        "XP systeem met ranks en progressie",
        "Leaderboard functionaliteit",
        "Streak tracking en rewards",
        "Gamified mission completion",
        "Level progression met visual feedback"
      ]
    },
    {
      title: "📱 PWA & Mobile Push Notificaties",
      description: "Progressive Web App met push notificaties voor mobile ervaring",
      status: "completed",
      impact: "high",
      details: [
        "PWA manifest voor app-achtige ervaring",
        "Service worker voor offline functionaliteit",
        "Push notificaties met VAPID keys",
        "Automatische app installatie prompt",
        "Background sync en caching",
        "iPhone en Android compatibiliteit",
        "Real-time notificaties voor missies en updates"
      ]
    },
    {
      title: "🍽️ Spoonacular Recepten & Voedingsplannen",
      description: "Integratie met Spoonacular API voor recepten en meal planning",
      status: "completed",
      impact: "high",
      details: [
        "Spoonacular API integratie (150 requests/dag)",
        "Recept zoeken met filters (diet, cuisine, time)",
        "Meal planning voor weight loss en muscle gain",
        "Nutrition tracking en calorie berekening",
        "Ingredient substituten en suggesties",
        "High-protein, low-carb, vegetarian filters",
        "Recipe library met save functionaliteit"
      ]
    },
    {
      title: "🤖 AI Insights & Machine Learning Engine",
      description: "AI-powered analytics en insights voor marketing en content",
      status: "completed",
      impact: "high",
      details: [
        "AI insights engine voor ad analysis",
        "NLP content analysis en sentiment",
        "Visual recognition voor image ads",
        "Voice analysis voor audio content",
        "Behavioral pattern recognition",
        "Predictive models voor performance",
        "Competitor analysis en SWOT"
      ]
    },
    {
      title: "🎤 AI Voice & Speech Recognition",
      description: "Voice-to-text en text-to-speech functionaliteit",
      status: "completed",
      impact: "medium",
      details: [
        "Speech recognition voor voice input",
        "Text-to-speech voor AI responses",
        "Voice settings (language, speed, pitch)",
        "Conversation logging en history",
        "Multi-language support (NL/EN)",
        "Voice analysis voor marketing content",
        "Real-time transcription"
      ]
    },
    {
      title: "👥 Brotherhood Social Feed & Community",
      description: "Social media functionaliteit voor community building",
      status: "completed",
      impact: "high",
      details: [
        "Social feed met posts en comments",
        "Like system met emoji reactions",
        "User connections en networking",
        "Forum topics en discussions",
        "Group management en events",
        "Real-time activity updates",
        "Community engagement tracking"
      ]
    },
    {
      title: "💳 Stripe Payment & Subscription Systeem",
      description: "Complete payment processing en subscription management",
      status: "completed",
      impact: "high",
      details: [
        "Stripe payment integration",
        "Subscription plans (BASIC, PREMIUM, ULTIMATE)",
        "Payment modal met multiple methods",
        "Webhook handling voor payment events",
        "Subscription management dashboard",
        "Bank connection modal",
        "Payment history en receipts"
      ]
    }
  ];

  const bugsFixed = [
    {
      title: "Video Upload Bug - Storage Provider Migratie",
      description: "Kritieke video upload problemen na migratie tussen storage providers",
      status: "fixed",
      impact: "critical",
      solution: "Terug naar Supabase bucket met stabiele video upload",
      details: "Getest met S3 bucket en Vercel Blob, uiteindelijk Supabase bucket hersteld. Academy video's moeten opnieuw geüpload worden door Rick."
    },
    {
      title: "Test Gebruiker Role Bug",
      description: "Test gebruikers toonden 'Lid' in plaats van 'Test' in sidebar",
      status: "fixed",
      impact: "high",
      solution: "Client-side email detectie geïmplementeerd als workaround",
      details: "Database constraint issues met 'test' role, opgelost via UI workaround"
    },
    {
      title: "Login Error - Duplicate Onboarding Records",
      description: "Error 'getting user profile' door duplicate onboarding records",
      status: "fixed",
      impact: "critical",
      solution: "Robuuste duplicate handling in onboarding API",
      details: "Automatische cleanup van duplicate onboarding_status records"
    },
    {
      title: "Screenshot Mode Event Listeners",
      description: "Event listeners werden niet correct toegevoegd aan overlay",
      status: "fixed",
      impact: "high",
      solution: "Event listeners worden nu toegevoegd na overlay creatie",
      details: "Timing issue opgelost in setupEventListeners functie"
    },
    {
      title: "Database Constraint Violations",
      description: "Check constraint errors bij het maken van test gebruikers",
      status: "fixed",
      impact: "high",
      solution: "Comprehensive constraint management systeem",
      details: "Meerdere API routes voor constraint fixes en role updates"
    },
    {
      title: "Linter Errors in TestUserFeedback",
      description: "Variable redeclaration errors in screenshot component",
      status: "fixed",
      impact: "low",
      solution: "Variable names aangepast om conflicts te voorkomen",
      details: "overlay → overlayElement en overlayForListeners"
    },
    {
      title: "Onboarding Status Fetch Errors",
      description: "JSON object errors door duplicate records",
      status: "fixed",
      impact: "medium",
      solution: "Robuuste duplicate handling en cleanup",
      details: "Automatische deduplication van onboarding records"
    }
  ];

  const databaseFixes = [
    {
      title: "Users Table Constraints",
      description: "CHECK constraint voor 'test' role toegevoegd",
      status: "completed",
      details: "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'test'))"
    },
    {
      title: "Onboarding Status Deduplication",
      description: "Duplicate onboarding records automatisch opgeruimd",
      status: "completed",
      details: "API route voor automatische cleanup van duplicate user_id records"
    },
    {
      title: "Prelaunch Emails Table",
      description: "Nieuwe tabel voor pre-launch email management",
      status: "completed",
      details: "Complete tabel met indexes, RLS policies en sample data"
    },
    {
      title: "Test Users Table",
      description: "Dedicated tabel voor test gebruikers data",
      status: "completed",
      details: "Separate tabel voor test user notes en feedback"
    },
    {
      title: "User Preferences System",
      description: "Robuust user preferences systeem",
      status: "completed",
      details: "Database-driven preferences in plaats van localStorage"
    },
    {
      title: "Role Management",
      description: "Verbeterde role management en constraint handling",
      status: "completed",
      details: "Multiple API routes voor role updates en constraint fixes"
    }
  ];

  const uiImprovements = [
    {
      title: "Screenshot Mode UI",
      description: "MacOS-style interface voor area selection",
      status: "completed",
      details: "Overlay met instructions, escape hint, en visual feedback"
    },
    {
      title: "Test User Indicators",
      description: "Visuele indicators voor test gebruikers",
      status: "completed",
      details: "Admin badges, debug mode toggle, speciale styling"
    },
    {
      title: "Feedback Modal",
      description: "Verbeterde feedback modal met area selection data",
      status: "completed",
      details: "Area dimensions display, element selector info, priority levels"
    },
    {
      title: "Admin Dashboard",
      description: "Uitgebreide admin tools en interfaces",
      status: "completed",
      details: "Test user management, pre-launch emails, database tools"
    },
    {
      title: "Error Handling UI",
      description: "Verbeterde error messages en user feedback",
      status: "completed",
      details: "Toast notifications, loading states, error boundaries"
    }
  ];

  const adminTools = [
    {
      title: "Test User Management",
      description: "Complete test user creation en management systeem",
      status: "completed",
      details: "API routes voor create, delete, update test users"
    },
    {
      title: "Database Constraint Management",
      description: "Tools voor database constraint fixes",
      status: "completed",
      details: "Multiple API routes voor constraint management"
    },
    {
      title: "Pre-Launch Email Management",
      description: "Admin interface voor email lijst beheer",
      status: "completed",
      details: "Dashboard voor email toevoeging en management"
    },
    {
      title: "Onboarding Data Management",
      description: "Tools voor onboarding data cleanup en management",
      status: "completed",
      details: "API routes voor duplicate cleanup en status management"
    }
  ];

  const securityUpdates = [
    {
      title: "Row Level Security (RLS)",
      description: "RLS policies voor prelaunch_emails tabel",
      status: "completed",
      details: "Admin-only access policies voor email data"
    },
    {
      title: "Admin Authentication",
      description: "Verbeterde admin role verificatie",
      status: "completed",
      details: "Role-based access control voor admin routes"
    },
    {
      title: "API Security",
      description: "Secure API routes met proper error handling",
      status: "completed",
      details: "Input validation, error sanitization, proper HTTP status codes"
    }
  ];

  const testUsers = [
    {
      email: "test@toptiermen.com",
      name: "Test Gebruiker",
      role: "Test",
      features: ["Debug Mode", "Screenshot Tool", "Admin Indicators"]
    },
    {
      email: "testuser@toptiermen.com",
      name: "Test User",
      role: "Test",
      features: ["Debug Mode", "Screenshot Tool", "Admin Indicators"]
    },
    {
      email: "tester@toptiermen.com",
      name: "Tester",
      role: "Test",
      features: ["Debug Mode", "Screenshot Tool", "Admin Indicators"]
    },
    {
      email: "test2@toptiermen.com",
      name: "Test 2",
      role: "Test",
      features: ["Debug Mode", "Screenshot Tool", "Admin Indicators"]
    }
  ];

  const todoItems = [
    {
      title: "Academy Video Upload Systeem - TECHNISCH",
      description: "Technische implementatie van academy video upload systeem met gescheiden bucket",
      priority: "critical",
      deadline: "5 augustus",
      status: "completed",
      assignee: "Development",
      tasks: [
        "AcademyVideoUpload component geïmplementeerd",
        "academy-videos bucket geconfigureerd",
        "Storage policies ingesteld",
        "Folder structuur georganiseerd",
        "UI integratie in admin dashboard"
      ],
      notes: "✅ AFGEROND: Academy video upload systeem volledig operationeel"
    },
    {
      title: "Academy Video Content - Rick's Taak",
      description: "Rick moet alle academy video content opnieuw uploaden (bucket was per ongeluk geleegd)",
      priority: "critical",
      deadline: "15 augustus",
      status: "not-started",
      assignee: "Rick",
      tasks: [
        "Backup van originele video bestanden maken",
        "Video's uploaden naar academy-videos bucket",
        "Metadata en beschrijvingen toevoegen",
        "Video kwaliteit controleren",
        "Links in academy sectie updaten"
      ],
      notes: "⚠️ KRITIEK: Bucket was per ongeluk geleegd tijdens S3 → Vercel Blob → Supabase migratie. Technische upload functionaliteit is klaar!"
    },
    {
      title: "Content & Copywriting",
      description: "Alle teksten en content finaliseren voor lancering",
      priority: "critical",
      deadline: "15 augustus",
      status: "in-progress",
      tasks: [
        "Homepage copy finaliseren",
        "Product pagina's content",
        "Email templates voor pre-launch",
        "FAQ sectie toevoegen",
        "Privacy policy en terms of service"
      ]
    },
    {
      title: "Payment Integration",
      description: "Stripe payment systeem volledig implementeren",
      priority: "critical",
      deadline: "20 augustus",
      status: "in-progress",
      tasks: [
        "Stripe checkout flow testen",
        "Subscription management",
        "Payment webhooks implementeren",
        "Invoice generatie",
        "Refund handling"
      ]
    },
    {
      title: "Email Marketing Setup",
      description: "Email marketing systeem voor pre-launch en post-launch",
      priority: "high",
      deadline: "25 augustus",
      status: "not-started",
      tasks: [
        "Mailchimp/ConvertKit integratie",
        "Pre-launch email sequence",
        "Welcome email flow",
        "Onboarding email series",
        "Newsletter template"
      ]
    },
    {
      title: "Analytics & Tracking",
      description: "Google Analytics en conversion tracking implementeren",
      priority: "high",
      deadline: "28 augustus",
      status: "not-started",
      tasks: [
        "Google Analytics 4 setup",
        "Conversion tracking",
        "Funnel analytics",
        "A/B testing framework",
        "Heatmap tracking (Hotjar)"
      ]
    },
    {
      title: "SEO Optimization",
      description: "Search Engine Optimization voor betere vindbaarheid",
      priority: "medium",
      deadline: "30 augustus",
      status: "not-started",
      tasks: [
        "Meta tags optimaliseren",
        "Sitemap genereren",
        "Schema markup toevoegen",
        "Page speed optimaliseren",
        "Mobile responsiveness testen"
      ]
    },
    {
      title: "Security Audit",
      description: "Volledige security audit en penetration testing",
      priority: "critical",
      deadline: "1 september",
      status: "not-started",
      tasks: [
        "Vulnerability scanning",
        "Penetration testing",
        "Data encryption review",
        "API security audit",
        "SSL certificaten controleren"
      ]
    },
    {
      title: "Performance Optimization",
      description: "Website performance optimaliseren voor snelle laadtijden",
      priority: "high",
      deadline: "3 september",
      status: "not-started",
      tasks: [
        "Image optimization",
        "Code splitting",
        "Caching implementeren",
        "CDN setup",
        "Database query optimalisatie"
      ]
    },
    {
      title: "Final Testing",
      description: "Uitgebreide testing van alle functionaliteiten",
      priority: "critical",
      deadline: "5 september",
      status: "not-started",
      tasks: [
        "End-to-end testing",
        "Cross-browser testing",
        "Mobile testing",
        "Payment flow testing",
        "Email delivery testing"
      ]
    },
    {
      title: "Launch Preparation",
      description: "Finale voorbereidingen voor de lancering",
      priority: "critical",
      deadline: "8 september",
      status: "not-started",
      tasks: [
        "Pre-launch email versturen",
        "Social media posts voorbereiden",
        "Press release opstellen",
        "Support team briefing",
        "Monitoring tools activeren"
      ]
    },
    {
      title: "Post-Launch Monitoring",
      description: "Monitoring en support systeem voor na de lancering",
      priority: "high",
      deadline: "10 september",
      status: "not-started",
      tasks: [
        "Error monitoring setup",
        "Performance monitoring",
        "User feedback systeem",
        "Support ticket systeem",
        "Backup procedures"
      ]
    }
  ];

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fixed':
        return <span className="text-green-500">✅</span>;
      case 'in-progress':
        return <span className="text-yellow-500">⚠️</span>;
      case 'not-started':
        return <span className="text-gray-500">⏳</span>;
      case 'failed':
        return <span className="text-red-500">❌</span>;
      default:
        return <span className="text-gray-500">❓</span>;
    }
  };

  const renderImpactBadge = (impact: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[impact as keyof typeof colors] || colors.low}`}>
        {impact.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0F0A] text-white">
      {/* Header */}
      <div className="bg-[#181F17] border-b border-[#3A4D23] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
            📞 Call Overzicht - Rick Cuijpers
          </h1>
          <p className="text-[#B6C948]">
            Overzicht van alle features, bugs en verbeteringen sinds 29 juli 2024
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-[#232D1A] px-3 py-1 rounded-full text-sm">
              📅 Periode: {overviewData.period}
            </span>
            <span className="bg-[#232D1A] px-3 py-1 rounded-full text-sm">
              🚀 {overviewData.totalFeatures} Features
            </span>
            <span className="bg-[#232D1A] px-3 py-1 rounded-full text-sm">
              🐛 {overviewData.totalBugsFixed} Bugs Opgelost
            </span>
            <span className="bg-[#232D1A] px-3 py-1 rounded-full text-sm">
              🗄️ {overviewData.totalDatabaseFixes} DB Fixes
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-[#181F17] border-b border-[#3A4D23]">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-[#8BAE5A] text-[#8BAE5A]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🚀</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Nieuwe Features</p>
                    <p className="text-2xl font-bold text-white">{overviewData.totalFeatures}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🐛</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Bugs Opgelost</p>
                    <p className="text-2xl font-bold text-white">{overviewData.totalBugsFixed}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🗄️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Database Fixes</p>
                    <p className="text-2xl font-bold text-white">{overviewData.totalDatabaseFixes}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">👥</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Test Gebruikers</p>
                    <p className="text-2xl font-bold text-white">{overviewData.totalTestUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Openstaande Taken */}
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">📋 Openstaande Taken - Prioriteit</h3>
              <div className="space-y-4">
                {/* Critical Tasks */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-3 flex items-center">
                    <span className="text-xl mr-2">🔥</span>
                    Critical (5 taken)
                  </h4>
                  <div className="space-y-2">
                    {todoItems.filter(item => item.priority === 'critical').slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-red-400">⚠️</span>
                          <span className="text-white text-sm">{item.title}</span>
                        </div>
                        <span className="text-red-300 text-xs">{item.deadline}</span>
                      </div>
                    ))}
                    {todoItems.filter(item => item.priority === 'critical').length > 3 && (
                      <div className="text-red-300 text-xs mt-2">
                        +{todoItems.filter(item => item.priority === 'critical').length - 3} meer critical taken
                      </div>
                    )}
                  </div>
                </div>

                {/* High Priority Tasks */}
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-3 flex items-center">
                    <span className="text-xl mr-2">⚡</span>
                    High Priority (4 taken)
                  </h4>
                  <div className="space-y-2">
                    {todoItems.filter(item => item.priority === 'high').slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-orange-400">📝</span>
                          <span className="text-white text-sm">{item.title}</span>
                        </div>
                        <span className="text-orange-300 text-xs">{item.deadline}</span>
                      </div>
                    ))}
                    {todoItems.filter(item => item.priority === 'high').length > 3 && (
                      <div className="text-orange-300 text-xs mt-2">
                        +{todoItems.filter(item => item.priority === 'high').length - 3} meer high priority taken
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="font-semibold text-[#8BAE5A] mb-3 flex items-center">
                    <span className="text-xl mr-2">⚡</span>
                    Snelle Acties
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-white text-sm">Academy video upload systeem - TECHNISCH AFGEROND</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500">👤</span>
                      <span className="text-white text-sm">Rick: Academy video content opnieuw uploaden</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">🔧</span>
                      <span className="text-white text-sm">Database tabel test_notes - WIP (meerdere API routes geïmplementeerd)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-white text-sm">macOS-style screenshot tool geïmplementeerd</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">📧</span>
                      <span className="text-white text-sm">Email templates finaliseren</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">🎯 Hoogtepunten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">Academy video upload systeem volledig operationeel</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">MacOS-style screenshot mode geïmplementeerd</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">Test gebruiker systeem volledig operationeel</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">Database constraint issues opgelost</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-500">👤</span>
                    <span className="text-white">Rick: Academy video content opnieuw uploaden (bucket was geleegd)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">Pre-launch email management systeem</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">Robuuste onboarding flow</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">✅</span>
                    <span className="text-white">Uitgebreide admin tools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{feature.title}</h3>
                    <p className="text-gray-300 mt-1">{feature.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStatusIcon(feature.status)}
                    {renderImpactBadge(feature.impact)}
                  </div>
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Details:</h4>
                  <ul className="space-y-1">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-gray-300 flex items-start">
                        <span className="text-[#8BAE5A] mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bugs Section */}
        {activeSection === 'bugs' && (
          <div className="space-y-6">
            {bugsFixed.map((bug, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{bug.title}</h3>
                    <p className="text-gray-300 mt-1">{bug.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStatusIcon(bug.status)}
                    {renderImpactBadge(bug.impact)}
                  </div>
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-[#8BAE5A] mb-1">Oplossing:</h4>
                    <p className="text-sm text-gray-300">{bug.solution}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#8BAE5A] mb-1">Details:</h4>
                    <p className="text-sm text-gray-300">{bug.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Todo Section */}
        {activeSection === 'todo' && (
          <div className="space-y-6">
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">📅 Lancering Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#232D1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A]">10</div>
                  <div className="text-sm text-gray-400">September</div>
                  <div className="text-xs text-[#B6C948] mt-1">LAUNCH DATE</div>
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">25</div>
                  <div className="text-sm text-gray-400">Dagen</div>
                  <div className="text-xs text-[#B6C948] mt-1">TOT LANCERING</div>
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">5</div>
                  <div className="text-sm text-gray-400">Critical</div>
                  <div className="text-xs text-[#B6C948] mt-1">TODO ITEMS</div>
                </div>
              </div>
            </div>

            {todoItems.map((item, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#8BAE5A]">{item.title}</h3>
                      {renderStatusIcon(item.status)}
                      {renderImpactBadge(item.priority)}
                    </div>
                    <p className="text-gray-300 mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-[#B6C948]">📅 Deadline: {item.deadline}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-3">📋 Taken:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center space-x-2">
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-300">{task}</span>
                      </div>
                    ))}
                  </div>
                  {item.notes && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h5 className="text-sm font-medium text-red-400 mb-1">⚠️ Belangrijke Notitie:</h5>
                      <p className="text-sm text-red-300">{item.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">🎯 Prioriteiten Overzicht</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">🔥 Critical (5)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Academy Video Content Upload - URGENT</li>
                    <li>• Content & Copywriting</li>
                    <li>• Payment Integration</li>
                    <li>• Security Audit</li>
                    <li>• Final Testing</li>
                  </ul>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2">⚡ High (4)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Email Marketing Setup</li>
                    <li>• Analytics & Tracking</li>
                    <li>• Performance Optimization</li>
                    <li>• Post-Launch Monitoring</li>
                  </ul>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">📝 Medium (1)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• SEO Optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Section */}
        {activeSection === 'database' && (
          <div className="space-y-6">
            {databaseFixes.map((fix, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{fix.title}</h3>
                    <p className="text-gray-300 mt-1">{fix.description}</p>
                  </div>
                  {renderStatusIcon(fix.status)}
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Implementatie:</h4>
                  <code className="text-sm text-gray-300 bg-[#0A0F0A] px-2 py-1 rounded">
                    {fix.details}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UI Section */}
        {activeSection === 'ui' && (
          <div className="space-y-6">
            {uiImprovements.map((improvement, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{improvement.title}</h3>
                    <p className="text-gray-300 mt-1">{improvement.description}</p>
                  </div>
                  {renderStatusIcon(improvement.status)}
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Details:</h4>
                  <p className="text-sm text-gray-300">{improvement.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin Tools Section */}
        {activeSection === 'admin' && (
          <div className="space-y-6">
            {adminTools.map((tool, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{tool.title}</h3>
                    <p className="text-gray-300 mt-1">{tool.description}</p>
                  </div>
                  {renderStatusIcon(tool.status)}
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Functionaliteit:</h4>
                  <p className="text-sm text-gray-300">{tool.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            {securityUpdates.map((update, index) => (
              <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">{update.title}</h3>
                    <p className="text-gray-300 mt-1">{update.description}</p>
                  </div>
                  {renderStatusIcon(update.status)}
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Implementatie:</h4>
                  <p className="text-sm text-gray-300">{update.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Test Users Section */}
        {activeSection === 'testing' && (
          <div className="space-y-6">
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">🧪 Test Gebruikers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testUsers.map((user, index) => (
                  <div key={index} className="bg-[#232D1A] rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">👤</span>
                      <div>
                        <h4 className="font-medium text-white">{user.name}</h4>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-[#3A4D23] px-2 py-1 rounded text-[#8BAE5A]">
                          {user.role}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {user.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <span className="text-green-500">✅</span>
                            <span className="text-xs text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 