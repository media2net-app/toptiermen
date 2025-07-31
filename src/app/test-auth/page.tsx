'use client';
import { useState, useEffect } from 'react';
import { 
  WrenchScrewdriverIcon, 
  Cog6ToothIcon, 
  CircleStackIcon, 
  UserIcon,
  ShieldCheckIcon,
  BeakerIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function TestAuthPage() {
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('chiel@media2net.nl');
  const [password, setPassword] = useState('W4t3rk0k3r^');
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [setupStatus, setSetupStatus] = useState<{
    prelaunch: 'pending' | 'completed' | 'error';
    emailCampaign: 'pending' | 'completed' | 'error';
    bulkImport: 'pending' | 'completed' | 'error';
  }>({
    prelaunch: 'pending',
    emailCampaign: 'pending',
    bulkImport: 'pending'
  });
  const [sqlScriptStatus, setSqlScriptStatus] = useState<{
    clearVideos: 'pending' | 'completed' | 'error';
    updateDiscipline: 'pending' | 'completed' | 'error';
    setupEmailCampaign: 'pending' | 'completed' | 'error';
    checkAcademy: 'pending' | 'completed' | 'error';
    checkExercises: 'pending' | 'completed' | 'error';
    checkLessonContent: 'pending' | 'completed' | 'error';
    updateDisciplineLessons: 'pending' | 'completed' | 'error';
  }>({
    clearVideos: 'pending',
    updateDiscipline: 'pending',
    setupEmailCampaign: 'pending',
    checkAcademy: 'pending',
    checkExercises: 'pending',
    checkLessonContent: 'pending',
    updateDisciplineLessons: 'pending'
  });

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const envInfo = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    };
    
    setLoginResult({ 
      success: true, 
      message: 'Environment check',
      environment: envInfo 
    });
  };

  const getStatusIcon = (status: 'pending' | 'completed' | 'error') => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: 'pending' | 'completed' | 'error') => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'error':
        return 'Fout';
      default:
        return 'In afwachting';
    }
  };

  // SQL execution function
  const executeSql = async (query?: string, scriptName?: string) => {
    setLoading(true);
    try {
      const sqlToExecute = query || sqlQuery;
      if (!sqlToExecute.trim()) {
        setSqlResult({ success: false, error: 'No SQL query provided' });
        return;
      }

      // Use PUT method for UPDATE/INSERT queries, POST for SELECT
      const method = sqlToExecute.toLowerCase().trim().startsWith('select') ? 'POST' : 'PUT';
      
      const response = await fetch('/api/admin/execute-sql', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sqlToExecute }),
      });

      const result = await response.json();
      setSqlResult(result);

      // Update script status based on result
      if (scriptName) {
        if (result.success) {
          setSqlScriptStatus(prev => ({ ...prev, [scriptName]: 'completed' }));
        } else {
          setSqlScriptStatus(prev => ({ ...prev, [scriptName]: 'error' }));
        }
      }
    } catch (error) {
      setSqlResult({ success: false, error: `SQL execution failed: ${error}` });
      if (scriptName) {
        setSqlScriptStatus(prev => ({ ...prev, [scriptName]: 'error' }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Predefined SQL scripts
  const predefinedScripts = {
    'Clear All Videos': `-- Clear all video URLs from academy lessons and exercises
UPDATE academy_lessons 
SET video_url = NULL, updated_at = NOW()
WHERE video_url IS NOT NULL;

UPDATE exercises 
SET video_url = NULL, updated_at = NOW()
WHERE video_url IS NOT NULL;

SELECT 'Videos cleared successfully' as result;`,
    
    'Update Discipline Module': `-- Update Discipline & Identiteit Module Lessons
UPDATE academy_modules 
SET description = 'Leer de fundamenten van discipline en ontwikkel een sterke identiteit. Dit is de fundering voor alle andere modules en helpt je om consistent te zijn in je acties en beslissingen.',
short_description = 'Ontwikkel discipline en ontdek je ware identiteit',
status = 'published',
updated_at = NOW()
WHERE title = 'Discipline & Identiteit';

SELECT 'Discipline module updated' as result;`,
    
    'Setup Email Campaign': `-- Create email campaign table and insert default steps
CREATE TABLE IF NOT EXISTS public.email_campaign_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    step_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT,
    delay_days INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    sent_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email campaign steps
INSERT INTO email_campaign_steps (step_number, name, subject, content, delay_days, status) VALUES
(1, 'Welkom & Introductie', '🎯 Welkom bij Toptiermen - Jouw reis naar succes begint hier', 'Beste {{name}},\n\nWelkom bij Toptiermen! 🚀\n\nWe zijn verheugd dat je interesse hebt getoond in onze exclusieve community van top performers. Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke groei.\n\nMet vriendelijke groet,\nHet Toptiermen Team', 0, 'draft'),
(2, 'Waarde Propositie', '💎 Ontdek wat Toptiermen voor jou kan betekenen', 'Beste {{name}},\n\nVandaag wil ik je laten zien wat Toptiermen voor jou kan betekenen...\n\nMet vriendelijke groet,\nHet Toptiermen Team', 3, 'draft'),
(3, 'Call-to-Action', '⏰ LAATSTE KANS: Slechts 24 uur om je in te schrijven voor 1 september', 'Beste {{name}},\n\n**⏰ WAARSCHUWING: Dit is je laatste kans!**\n\nDe lancering van Toptiermen op 1 september nadert snel...\n\nMet vriendelijke groet,\nHet Toptiermen Team', 7, 'draft')
ON CONFLICT (step_number) DO UPDATE SET
    name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    delay_days = EXCLUDED.delay_days,
    status = EXCLUDED.status,
    updated_at = NOW();

SELECT 'Email campaign table created and populated successfully' as result;`,
    
    'Check Academy Status': `-- Check academy modules and lessons status
SELECT 
    m.title as module_title,
    m.lessons_count,
    m.status,
    COUNT(l.id) as actual_lessons
FROM academy_modules m
LEFT JOIN academy_lessons l ON m.id = l.module_id AND l.status = 'published'
GROUP BY m.id, m.title, m.lessons_count, m.status
ORDER BY m.order_index;`,
    
    'Check Exercises': `-- Check exercises database
SELECT 
    COUNT(*) as total_exercises,
    COUNT(CASE WHEN video_url IS NULL THEN 1 END) as exercises_without_video,
    COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as exercises_with_video
FROM exercises;`,
    
    'Check Lesson Content': `-- Check current lesson content in database
SELECT 
    l.title,
    l.duration,
    l.type,
    l.status,
    LENGTH(l.content) as content_length,
    CASE 
        WHEN LENGTH(l.content) > 1000 THEN 'Detailed content available'
        WHEN LENGTH(l.content) > 100 THEN 'Basic content available'
        ELSE 'Minimal content'
    END as content_status,
    LEFT(l.content, 200) as content_preview
FROM academy_lessons l
JOIN academy_modules m ON l.module_id = m.id
WHERE m.title = 'Discipline & Identiteit'
ORDER BY l.order_index;`,
    
    'Update Discipline Lessons': `-- Update Discipline & Identiteit Module Lessons with detailed content
UPDATE academy_lessons
SET
    title = 'De Basis van Discipline',
    duration = '25 minuten',
    type = 'video',
    status = 'published',
    order_index = 1,
    content = 'Discipline is de fundering van alle succes. In deze les leer je wat discipline echt betekent en hoe je het kunt ontwikkelen.

## Wat is discipline?

Discipline is niet alleen over hard werken of jezelf dwingen om dingen te doen die je niet leuk vindt. Het is over consistentie, focus en de bereidheid om korte-termijn plezier op te offeren voor lange-termijn doelen.

## De 3 pijlers van discipline:

### 1. **Consistentie**
- Doe elke dag iets, hoe klein ook
- Bouw routines op die je kunt volhouden
- Focus op progressie, niet perfectie

### 2. **Focus**
- Elimineer afleidingen
- Werk in tijdsblokken
- Leer nee zeggen tegen onnodige verplichtingen

### 3. **Doelgerichtheid**
- Ken je waarom
- Visualiseer je doelen
- Meet je voortgang

## Praktische oefeningen:

1. **De 5-minuten regel**: Begin elke dag met 5 minuten van je belangrijkste taak
2. **Habit stacking**: Koppel nieuwe gewoonten aan bestaande routines
3. **Environment design**: Maak je omgeving zo dat goede keuzes makkelijk zijn
4. **Accountability**: Vind iemand die je verantwoordelijk houdt

## Dagelijkse discipline checklist:

- [ ] Sta op tijd op (5:30 AM)
- [ ] Drink water (500ml)
- [ ] Mediteer (10 minuten)
- [ ] Lees (30 minuten)
- [ ] Train (45 minuten)
- [ ] Plan morgen (10 minuten)

## Belangrijke inzichten:

- Discipline is een spier die je kunt trainen
- Start klein en bouw geleidelijk op
- Focus op het proces, niet alleen het resultaat
- Vier kleine overwinningen

Door deze principes toe te passen, ontwikkel je een sterke basis van discipline die je helpt om alle andere doelen te bereiken.',
    updated_at = NOW()
WHERE title = 'De Basis van Discipline' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

UPDATE academy_lessons
SET
    title = 'Je Identiteit Definiëren',
    duration = '30 minuten',
    type = 'text',
    status = 'published',
    order_index = 2,
    content = 'Je identiteit is wie je bent als persoon. Het bepaalt je gedrag, je keuzes en je resultaten. In deze les leer je hoe je een sterke, authentieke identiteit kunt ontwikkelen.

## Wat is identiteit?

Je identiteit is de som van je overtuigingen, waarden, doelen en de manier waarop je jezelf ziet. Het is je innerlijke kompas dat je helpt om beslissingen te nemen en consistent te zijn in je acties.

## De 4 lagen van identiteit:

### 1. **Fysieke Identiteit**
- Hoe je eruit ziet
- Hoe je je lichaam behandelt
- Je gezondheidsgewoonten

### 2. **Mentale Identiteit**
- Je gedachten en overtuigingen
- Je kennis en vaardigheden
- Je mindset en perspectief

### 3. **Emotionele Identiteit**
- Hoe je met emoties omgaat
- Je relaties en connecties
- Je empathie en compassie

### 4. **Spirituele Identiteit**
- Je waarden en principes
- Je doel en missie
- Je verbinding met iets groters

## Stappen om je identiteit te definiëren:

### Stap 1: Reflecteer op je waarden
- Wat is echt belangrijk voor jou?
- Waar ben je bereid om voor te vechten?
- Wat zou je nooit opgeven?

### Stap 2: Identificeer je sterke punten
- Waar ben je van nature goed in?
- Wat doen anderen dat je bewondert?
- Welke vaardigheden wil je ontwikkelen?

### Stap 3: Stel je doelen vast
- Wat wil je bereiken in de komende 5 jaar?
- Welke impact wil je hebben?
- Wat is je definitie van succes?

### Stap 4: Ontwikkel je visie
- Hoe zie je je ideale toekomst?
- Wie wil je zijn over 10 jaar?
- Wat is je levensmissie?

## Praktische oefeningen:

### Oefening 1: Waarden Inventarisatie
Schrijf 20 dingen op die belangrijk voor je zijn. Rangschik ze van 1-20. De top 5 zijn je kernwaarden.

### Oefening 2: Identiteit Statement
Schrijf een korte paragraaf die beschrijft wie je bent en wat je belangrijk vindt.

### Oefening 3: Rolmodellen
Identificeer 3 mensen die je bewondert. Schrijf op welke eigenschappen je in hen bewondert.

### Oefening 4: Dagelijkse Reflectie
Stel jezelf elke avond deze vragen:
- Heb ik vandaag geleefd volgens mijn waarden?
- Wat heb ik geleerd over mezelf?
- Hoe kan ik morgen beter zijn?

## Identiteit vs. Doelen:

- **Doelen** zijn wat je wilt bereiken
- **Identiteit** is wie je bent
- Focus op het worden, niet alleen het doen
- "Ik ben iemand die..." in plaats van "Ik wil..."

## Belangrijke inzichten:

- Je identiteit bepaalt je gedrag meer dan je doelen
- Kleine dagelijkse acties versterken je identiteit
- Je kunt je identiteit bewust veranderen
- Consistentie is belangrijker dan perfectie

Door een sterke identiteit te ontwikkelen, word je consistenter in je acties en bereik je je doelen effectiever.',
    updated_at = NOW()
WHERE title = 'Je Identiteit Definiëren' AND module_id = (SELECT id FROM academy_modules WHERE title = 'Discipline & Identiteit' LIMIT 1);

SELECT 'Discipline lessons updated with detailed content' as result;`
  };

  const loadPredefinedScript = (scriptName: string) => {
    setSqlQuery(predefinedScripts[scriptName as keyof typeof predefinedScripts]);
  };

  const executePredefinedScript = (scriptName: string) => {
    const script = predefinedScripts[scriptName as keyof typeof predefinedScripts];
    if (script) {
      setSqlQuery(script);
      executeSql(script, getScriptKey(scriptName));
    }
  };

  const getScriptKey = (scriptName: string): keyof typeof sqlScriptStatus => {
    switch (scriptName) {
      case 'Clear All Videos': return 'clearVideos';
      case 'Update Discipline Module': return 'updateDiscipline';
      case 'Setup Email Campaign': return 'setupEmailCampaign';
      case 'Check Academy Status': return 'checkAcademy';
      case 'Check Exercises': return 'checkExercises';
      case 'Check Lesson Content': return 'checkLessonContent';
      case 'Update Discipline Lessons': return 'updateDisciplineLessons';
      default: return 'clearVideos';
    }
  };

  const clearSqlQuery = () => {
    setSqlQuery('');
    setSqlResult(null);
  };

  // Check setup status on page load
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        // Check prelaunch emails
        const prelaunchResponse = await fetch('/api/admin/prelaunch-emails');
        const prelaunchData = await prelaunchResponse.json();
        if (prelaunchData.success && prelaunchData.emails && prelaunchData.emails.length > 0) {
          setSetupStatus(prev => ({ ...prev, prelaunch: 'completed' }));
        }

        // Check bulk import
        const bulkResponse = await fetch('/api/admin/prelaunch-emails');
        const bulkData = await bulkResponse.json();
        if (bulkData.success && bulkData.emails && bulkData.emails.length >= 5) {
          setSetupStatus(prev => ({ ...prev, bulkImport: 'completed' }));
        }
      } catch (error) {
        console.error('Setup status check failed:', error);
      }
    };

    checkSetupStatus();
  }, []);

  const addBulkEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: [
            { email: 'test1@example.com', source: 'manual', status: 'active' },
            { email: 'test2@example.com', source: 'manual', status: 'active' },
            { email: 'test3@example.com', source: 'manual', status: 'active' },
            { email: 'test4@example.com', source: 'manual', status: 'active' },
            { email: 'test5@example.com', source: 'manual', status: 'active' }
          ]
        }),
      });

      const result = await response.json();
      setLoginResult(result);
      
      if (result.success) {
        setSetupStatus(prev => ({ ...prev, bulkImport: 'completed' }));
      } else {
        setSetupStatus(prev => ({ ...prev, bulkImport: 'error' }));
      }
    } catch (error) {
      setLoginResult({ success: false, error: `Bulk import failed: ${error}` });
      setSetupStatus(prev => ({ ...prev, bulkImport: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const checkChiel = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-chiel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'chiel@media2net.nl' }),
      });

      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181F17]">
      {/* Top Navigation Bar */}
      <div className="bg-[#232D1A] border-b border-[#3A4D23] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WrenchScrewdriverIcon className="w-8 h-8 text-[#8BAE5A]" />
            <h1 className="text-xl font-bold text-[#8BAE5A]">Admin Tools</h1>
          </div>
          <div className="flex items-center gap-4 text-[#B6C948] text-sm">
            <span>Development Tools</span>
            <span>•</span>
            <span>Database Management</span>
            <span>•</span>
            <span>SQL Execution</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#232D1A] min-h-screen p-6">
          <nav className="space-y-6">
            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">🔧 Development</h3>
              <div className="space-y-2">
                <button
                  onClick={checkEnvironment}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors"
                >
                  <CircleStackIcon className="w-4 h-4 inline mr-2" />
                  Environment Check
                </button>
                <button
                  onClick={checkChiel}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors disabled:opacity-50"
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Check Chiel Account
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3 flex items-center gap-2">
                🗄️ Database
                {setupStatus.prelaunch === 'completed' && setupStatus.emailCampaign === 'completed' && setupStatus.bulkImport === 'completed' && (
                  <span className="text-green-400 text-sm">✓ Alle tabellen klaar</span>
                )}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/admin/direct-setup-prelaunch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                      });
                      const result = await response.json();
                      console.log('Direct setup prelaunch emails result:', result);
                      setLoginResult(result);
                      
                      if (result.success) {
                        setSetupStatus(prev => ({ ...prev, prelaunch: 'completed' }));
                      } else {
                        setSetupStatus(prev => ({ ...prev, prelaunch: 'error' }));
                      }
                    } catch (error) {
                      console.error('Direct setup error:', error);
                      setLoginResult({ success: false, error: `Direct setup failed: ${error}` });
                      setSetupStatus(prev => ({ ...prev, prelaunch: 'error' }));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    setupStatus.prelaunch === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : setupStatus.prelaunch === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Setup Prelaunch Emails
                  </div>
                  <span>
                    {getStatusIcon(setupStatus.prelaunch)}
                  </span>
                </button>
                
                <button
                  onClick={addBulkEmails}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    setupStatus.bulkImport === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : setupStatus.bulkImport === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Bulk Email Import
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8BAE5A]">
                      +5 emails
                    </span>
                    {getStatusIcon(setupStatus.bulkImport)}
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">📝 SQL Scripts</h3>
              <div className="space-y-2">
                <button
                  onClick={() => executePredefinedScript('Clear All Videos')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.clearVideos === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.clearVideos === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Clear All Videos
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.clearVideos)}
                  </span>
                </button>
                <button
                  onClick={() => executePredefinedScript('Update Discipline Module')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.updateDiscipline === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.updateDiscipline === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Update Discipline Module
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.updateDiscipline)}
                  </span>
                </button>
                <button
                  onClick={() => executePredefinedScript('Setup Email Campaign')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.setupEmailCampaign === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.setupEmailCampaign === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Setup Email Campaign
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.setupEmailCampaign)}
                  </span>
                </button>
                <button
                  onClick={() => executePredefinedScript('Check Academy Status')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.checkAcademy === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.checkAcademy === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Check Academy Status
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.checkAcademy)}
                  </span>
                </button>
                <button
                  onClick={() => executePredefinedScript('Check Exercises')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.checkExercises === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.checkExercises === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Check Exercises
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.checkExercises)}
                  </span>
                </button>
                <button
                  onClick={() => executePredefinedScript('Check Lesson Content')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.checkLessonContent === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.checkLessonContent === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Check Lesson Content
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.checkLessonContent)}
                  </span>
                </button>
                <button
                  onClick={() => executePredefinedScript('Update Discipline Lessons')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-between ${
                    sqlScriptStatus.updateDisciplineLessons === 'completed' 
                      ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
                      : sqlScriptStatus.updateDisciplineLessons === 'error'
                      ? 'text-red-400 bg-red-900/20 border border-red-700/30'
                      : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Update Discipline Lessons
                  </div>
                  <span>
                    {getStatusIcon(sqlScriptStatus.updateDisciplineLessons)}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">🔐 Authentication</h3>
              <div className="space-y-2">
                <button
                  onClick={testLogin}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors disabled:opacity-50"
                >
                  <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                  Test Login
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-3">🧪 Testing</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setLoginResult({ success: true, message: 'Test function ready for implementation' })}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A] transition-colors"
                >
                  <BeakerIcon className="w-4 h-4 inline mr-2" />
                  Test Function
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Admin Development Tools</h1>
              <p className="text-[#B6C948]">Database management, SQL execution, authentication testing, and development utilities</p>
            </div>

            {/* SQL Execution Section */}
            <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] mb-6">
              <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">📝 SQL Script Execution</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#B6C948] mb-2">SQL Query:</label>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="w-full h-32 px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => executeSql()}
                  disabled={loading || !sqlQuery.trim()}
                  className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 font-semibold flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  {loading ? 'Executing...' : 'Execute SQL'}
                </button>
                <button
                  onClick={clearSqlQuery}
                  className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors font-semibold flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* SQL Results */}
              {sqlResult && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-[#8BAE5A]">📊 SQL Results:</h3>
                  <div className={`p-4 rounded-lg ${
                    sqlResult.success 
                      ? 'bg-[#1A2D17] border border-[#4A5D33]' 
                      : 'bg-[#2D1A1A] border border-[#5D3333]'
                  }`}>
                    <pre className="text-sm overflow-auto text-[#B6C948] max-h-96">
                      {JSON.stringify(sqlResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Login Test Section */}
            <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] mb-6">
              <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">🔐 Authentication Test</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#B6C948] mb-2">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#B6C948] mb-2">Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
              </div>
              
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full px-4 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 font-semibold"
              >
                {loading ? 'Testing...' : 'Test Login'}
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <CircleStackIcon className="w-8 h-8 text-[#8BAE5A] mr-3" />
                  <h3 className="text-lg font-semibold text-[#8BAE5A]">Environment</h3>
                </div>
                <p className="text-[#B6C948] text-sm mb-4">Check environment variables and configuration</p>
                <button
                  onClick={checkEnvironment}
                  className="w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
                >
                  Check Environment
                </button>
              </div>

              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <UserIcon className="w-8 h-8 text-[#8BAE5A] mr-3" />
                  <h3 className="text-lg font-semibold text-[#8BAE5A]">User Management</h3>
                </div>
                <p className="text-[#B6C948] text-sm mb-4">Check and manage user accounts</p>
                <button
                  onClick={checkChiel}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Check Chiel'}
                </button>
              </div>

              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <div className="flex items-center mb-4">
                  <Cog6ToothIcon className="w-8 h-8 text-[#8BAE5A] mr-3" />
                  <h3 className="text-lg font-semibold text-[#8BAE5A]">Database Setup</h3>
                </div>
                <p className="text-[#B6C948] text-sm mb-4">Setup and manage database tables</p>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/admin/direct-setup-prelaunch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                      });
                      const result = await response.json();
                      setLoginResult(result);
                    } catch (error) {
                      setLoginResult({ success: false, error: `Setup failed: ${error}` });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Setup Tables'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {loginResult && (
              <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
                <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">📊 Results</h2>
                <div className={`p-4 rounded-lg ${
                  loginResult.success 
                    ? 'bg-[#1A2D17] border border-[#4A5D33]' 
                    : 'bg-[#2D1A1A] border border-[#5D3333]'
                }`}>
                  {/* Bulk import results */}
                  {loginResult.details && loginResult.details.added !== undefined && (
                    <div className="text-sm mb-4 space-y-2">
                      <div className="flex gap-4 text-[#8BAE5A]">
                        <span>✅ Toegevoegd: {loginResult.details.added}</span>
                        <span>⏭️ Overgeslagen: {loginResult.details.skipped}</span>
                        <span>📊 Totaal: {loginResult.details.total}</span>
                      </div>
                      {loginResult.results && (
                        <div className="mt-3 space-y-1">
                          <h5 className="font-semibold text-[#8BAE5A]">Details:</h5>
                          {loginResult.results.map((result: string, index: number) => (
                            <div key={index} className="text-xs text-[#B6C948]">{result}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <pre className="text-sm overflow-auto text-[#B6C948]">
                    {JSON.stringify(loginResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] mt-6">
              <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">🔗 Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/login" 
                  className="block p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-center"
                >
                  → Login Page
                </a>
                <a 
                  href="/dashboard-admin" 
                  className="block p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-center"
                >
                  → Admin Dashboard
                </a>
                <a 
                  href="/dashboard" 
                  className="block p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors text-center"
                >
                  → User Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 