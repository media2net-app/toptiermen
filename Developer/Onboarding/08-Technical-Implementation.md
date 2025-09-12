# 🔧 Technical Implementation

## 📋 **OVERZICHT**

Deze documentatie beschrijft de technische implementatie van het Top Tier Men onboarding systeem, inclusief database schema, API endpoints, en component architectuur.

---

## **🗄️ DATABASE SCHEMA**

### **Onboarding Status Tabel**
```sql
CREATE TABLE onboarding_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_video_watched BOOLEAN NOT NULL DEFAULT FALSE,
  step_0_completed BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_completed BOOLEAN NOT NULL DEFAULT FALSE,
  step_2_completed BOOLEAN NOT NULL DEFAULT FALSE,
  step_3_completed BOOLEAN NOT NULL DEFAULT FALSE,
  step_4_completed BOOLEAN NOT NULL DEFAULT FALSE,
  step_5_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Profiles Tabel**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  package_type TEXT DEFAULT 'Basic Tier',
  subscription_tier TEXT DEFAULT 'basic',
  main_goal TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  interests TEXT[],
  points INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  badges JSONB,
  posts INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  monthly_earnings DECIMAL(10,2) DEFAULT 0,
  last_referral TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **User Missions Tabel**
```sql
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  frequency_type TEXT NOT NULL DEFAULT 'daily',
  points INTEGER DEFAULT 15,
  current_progress INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  last_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **User Training Progress Tabel**
```sql
CREATE TABLE user_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  training_schema_id TEXT NOT NULL,
  selected_schema TEXT NOT NULL,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **User Nutrition Plans Tabel**
```sql
CREATE TABLE user_nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  selected_plan TEXT NOT NULL,
  customizations JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **User Challenges Tabel**
```sql
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  selected_challenge TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Social Posts Tabel**
```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'text',
  category TEXT NOT NULL,
  is_introduction BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## **🔌 API ENDPOINTS**

### **Onboarding API**
```typescript
// POST /api/onboarding
export async function POST(request: NextRequest) {
  try {
    const { step, selectedMissions, selectedTrainingSchema, selectedNutritionPlan, selectedChallenge, forumIntroduction } = await request.json();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update onboarding status
    const { error: updateError } = await supabase
      .from('onboarding_status')
      .update({
        current_step: step + 1,
        [`step_${step}_completed`]: true,
        onboarding_completed: step === 6
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Handle step-specific data
    if (step === 2 && selectedMissions) {
      // Create user missions
      const missionData = selectedMissions.map((missionId: string) => ({
        user_id: user.id,
        mission_id: missionId,
        is_active: true
      }));
      
      await supabase.from('user_missions').insert(missionData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update onboarding' }, { status: 500 });
  }
}
```

### **Missions Simple API**
```typescript
// GET /api/missions-simple
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user missions from database
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);

    if (missionsError) {
      throw missionsError;
    }

    // Process missions data
    const missions = userMissions?.map(mission => ({
      id: mission.id,
      title: mission.title,
      type: mission.frequency_type === 'daily' ? 'Dagelijks' : 'Wekelijks',
      done: isMissionCompletedToday(mission.last_completion_date),
      category: mission.category_slug,
      icon: mission.icon || '🎯',
      badge: mission.badge_name || 'Mission Badge',
      progress: mission.current_progress,
      shared: mission.is_shared || false,
      accountabilityPartner: null,
      xp_reward: mission.points || 15,
      last_completion_date: mission.last_completion_date
    })) || [];

    // Calculate summary
    const completedToday = missions.filter(m => m.done).length;
    const totalToday = missions.filter(m => m.type === 'Dagelijks').length;
    const dailyStreak = 0; // Calculate from user_daily_streaks table

    return NextResponse.json({
      missions,
      summary: {
        completedToday,
        totalToday,
        dailyStreak
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}
```

### **Training Schemas API**
```typescript
// GET /api/training-schemas
export async function GET(request: NextRequest) {
  try {
    const { data: schemas, error } = await supabase
      .from('training_schemas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ schemas: schemas || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training schemas' }, { status: 500 });
  }
}
```

### **Nutrition Plans API**
```typescript
// GET /api/nutrition-plans
export async function GET(request: NextRequest) {
  try {
    const { data: plans, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch nutrition plans' }, { status: 500 });
  }
}
```

### **Challenges API**
```typescript
// GET /api/challenges
export async function GET(request: NextRequest) {
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ challenges: challenges || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
```

### **Social Posts API**
```typescript
// POST /api/social-posts
export async function POST(request: NextRequest) {
  try {
    const { content, postType, category, isIntroduction } = await request.json();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        content,
        post_type: postType,
        category,
        is_introduction: isIntroduction
      })
      .select()
      .single();

    if (postError) {
      throw postError;
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
```

---

## **⚛️ REACT COMPONENTS**

### **OnboardingContext**
```typescript
// src/contexts/OnboardingContext.tsx
interface OnboardingContextType {
  currentStep: number;
  isOnboarding: boolean;
  isTransitioning: boolean;
  completeCurrentStep: () => Promise<void>;
  skipStep: (step: number) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const completeCurrentStep = async () => {
    setIsTransitioning(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: currentStep })
      });

      if (!response.ok) {
        throw new Error('Failed to complete step');
      }

      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      isOnboarding,
      isTransitioning,
      completeCurrentStep,
      skipStep,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
```

### **OnboardingModal**
```typescript
// src/app/components/OnboardingModal.tsx
export default function OnboardingModal() {
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string>('');
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string>('');
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [forumIntroduction, setForumIntroduction] = useState('');

  const handleStepComplete = async () => {
    const stepData = {
      step: currentStep,
      selectedMissions: currentStep === 2 ? selectedMissions : undefined,
      selectedTrainingSchema: currentStep === 3 ? selectedTrainingSchema : undefined,
      selectedNutritionPlan: currentStep === 4 ? selectedNutritionPlan : undefined,
      selectedChallenge: currentStep === 5 ? selectedChallenge : undefined,
      forumIntroduction: currentStep === 6 ? forumIntroduction : undefined
    };

    await completeCurrentStep(stepData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#232D1A] rounded-xl p-6 max-w-2xl w-full mx-4">
        {/* Step content based on currentStep */}
        <button onClick={handleStepComplete}>
          Volgende stap
        </button>
      </div>
    </div>
  );
}
```

---

## **🛡️ MIDDLEWARE**

### **Onboarding Redirects**
```typescript
// src/middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user && req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const { data: onboardingData, error } = await supabase
        .from('onboarding_status')
        .select('current_step, onboarding_completed')
        .eq('user_id', session.user.id)
        .single();

      if (!error && onboardingData && !onboardingData.onboarding_completed) {
        const currentStep = onboardingData.current_step;
        const currentPath = req.nextUrl.pathname;

        // Define allowed paths for each step
        const allowedPaths = {
          0: ['/dashboard/welcome-video'],
          1: ['/dashboard/welcome-video', '/dashboard/profiel'],
          2: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen'],
          3: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas'],
          4: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen'],
          5: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/challenges'],
          6: ['/dashboard/welcome-video', '/dashboard/profiel', '/dashboard/mijn-uitdagingen', '/dashboard/trainingsschemas', '/dashboard/voedingsplannen', '/dashboard/challenges', '/dashboard/brotherhood/forum', '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden']
        };

        // Check if current path is allowed
        const isAllowedPath = allowedPaths[currentStep]?.some(allowedPath =>
          currentPath === allowedPath || currentPath.startsWith(allowedPath + '/')
        );

        if (!isAllowedPath) {
          // Redirect to correct step
          let redirectPath = '/dashboard/welcome-video';
          if (currentStep === 1) redirectPath = '/dashboard/profiel';
          else if (currentStep === 2) redirectPath = '/dashboard/mijn-uitdagingen';
          else if (currentStep === 3) redirectPath = '/dashboard/trainingsschemas';
          else if (currentStep === 4) redirectPath = '/dashboard/voedingsplannen';
          else if (currentStep === 5) redirectPath = '/dashboard/challenges';
          else if (currentStep === 6) redirectPath = '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';

          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
    } catch (error) {
      console.error('Onboarding middleware error:', error);
    }
  }

  return res;
}
```

---

## **🔐 AUTHENTICATION & AUTHORIZATION**

### **User Authentication**
```typescript
// src/contexts/SupabaseAuthContext.tsx
export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
      } else if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user,
      isAdmin: profile?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## **📊 ERROR HANDLING**

### **API Error Handling**
```typescript
// src/lib/api-error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    return new APIError(error.message, 500);
  }

  return new APIError('An unknown error occurred', 500);
};

export const withErrorHandling = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      const apiError = handleAPIError(error);
      return NextResponse.json(
        { error: apiError.message, code: apiError.code },
        { status: apiError.status }
      );
    }
  };
};
```

### **Component Error Boundaries**
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Er is iets misgegaan
            </h2>
            <p className="text-[#8BAE5A]/70 mb-4">
              Probeer de pagina te vernieuwen of neem contact op met support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg"
            >
              Pagina vernieuwen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## **🧪 TESTING**

### **Unit Tests**
```typescript
// __tests__/onboarding.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingModal from '@/app/components/OnboardingModal';

describe('OnboardingModal', () => {
  it('should render step 0 (welcome video)', () => {
    render(
      <OnboardingProvider>
        <OnboardingModal />
      </OnboardingProvider>
    );

    expect(screen.getByText('Welkom bij Top Tier Men')).toBeInTheDocument();
  });

  it('should complete step and move to next', async () => {
    render(
      <OnboardingProvider>
        <OnboardingModal />
      </OnboardingProvider>
    );

    const nextButton = screen.getByText('Volgende stap');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Profiel Setup')).toBeInTheDocument();
    });
  });
});
```

### **Integration Tests**
```typescript
// __tests__/api/onboarding.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/onboarding/route';

describe('/api/onboarding', () => {
  it('should update onboarding status', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { step: 0 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});
```

---

*Laatste update: $(date)*
*Versie: 3.1.0*
