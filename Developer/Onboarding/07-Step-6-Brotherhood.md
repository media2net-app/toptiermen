# 🤝 Stap 6: Brotherhood

## 📋 **OVERZICHT**

De laatste stap van de onboarding is de introductie tot de Brotherhood community. Gebruikers maken kennis met het forum en stellen zich voor aan de community.

---

## **🎯 DOELSTELLING**

- **Community Introductie**: Gebruiker maakt kennis met Brotherhood
- **Forum Kennismaking**: Introductie tot het forum systeem
- **Eerste Post**: Gebruiker plaatst introductie post
- **Community Engagement**: Stimuleert deelname aan community

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden
Middleware: Stap 6 toegang
Component: BrotherhoodForumPage
API: /api/social-posts
```

### **Database Updates**
```sql
-- social_posts tabel (introductie post)
INSERT INTO social_posts (
  user_id,
  content,
  post_type,
  category,
  is_introduction,
  created_at
) VALUES (?, ?, 'text', 'introduction', true, NOW());

-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  step_6_completed = true,
  onboarding_completed = true,
  current_step = 7
WHERE user_id = ?;
```

---

## **🎮 GEBRUIKERSERVARING**

### **Brotherhood Forum Introductie**

#### **Forum Categorieën**
- **Algemeen**: Algemene discussies en updates
- **Fitness & Training**: Workout tips en ervaringen
- **Voeding & Gezondheid**: Voedingsadvies en recepten
- **Mindset & Focus**: Mentale ontwikkeling
- **Business & Carrière**: Professionele groei
- **Voorstellen Nieuwe Leden**: Introductie van nieuwe leden

#### **Forum Features**
- **Posts**: Tekst, afbeeldingen, video's
- **Comments**: Reacties op posts
- **Likes**: Positieve feedback
- **Categories**: Georganiseerde discussies
- **Search**: Zoeken in posts en comments

### **Introductie Post Template**
```typescript
interface IntroductionPost {
  content: string;
  postType: 'text' | 'image' | 'video';
  category: 'introduction';
  tags: string[];
  isIntroduction: boolean;
}

const INTRODUCTION_TEMPLATE = `
Hallo Brothers! 👋

Ik ben [NAAM] en ik ben net begonnen met mijn Top Tier Men journey.

Mijn hoofddoel is: [HOOFDDOEL]
Mijn uitdagingen zijn: [UITDAGINGEN]
Mijn trainingsschema: [TRAINING]
Mijn voedingsplan: [VOEDING]
Mijn challenge: [CHALLENGE]

Ik kijk ernaar uit om van jullie te leren en samen te groeien! 💪

#nieuwelid #brotherhood #toptiermen
`;
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden/page.tsx
export default function BrotherhoodIntroPage() {
  const { user, profile } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [introductionText, setIntroductionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateIntroductionTemplate();
  }, [profile]);

  const generateIntroductionTemplate = () => {
    const template = `
Hallo Brothers! 👋

Ik ben ${profile?.full_name || 'een nieuwe Brother'} en ik ben net begonnen met mijn Top Tier Men journey.

Mijn hoofddoel is: ${profile?.main_goal || 'persoonlijke groei'}
Mijn uitdagingen zijn: [Vul hier je uitdagingen in]
Mijn trainingsschema: [Vul hier je training in]
Mijn voedingsplan: [Vul hier je voeding in]
Mijn challenge: [Vul hier je challenge in]

Ik kijk ernaar uit om van jullie te leren en samen te groeien! 💪

#nieuwelid #brotherhood #toptiermen
    `.trim();
    
    setIntroductionText(template);
  };

  const handlePostIntroduction = async () => {
    if (!introductionText.trim()) {
      setError('Schrijf een introductie post');
      return;
    }

    try {
      setLoading(true);
      
      // Post introduction to forum
      const response = await fetch('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: introductionText,
          postType: 'text',
          category: 'introduction',
          isIntroduction: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post introduction');
      }

      // Complete onboarding
      await completeCurrentStep();
      
    } catch (err) {
      setError('Kon introductie niet plaatsen');
    } finally {
      setLoading(false);
    }
  };
}
```

### **Forum UI Components**
```typescript
const IntroductionForm = ({ 
  introductionText, 
  setIntroductionText, 
  onSubmit, 
  loading 
}: IntroductionFormProps) => (
  <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-6">
    <h2 className="text-2xl font-bold text-white mb-4">
      Stel je voor aan de Brotherhood! 👋
    </h2>
    
    <p className="text-[#8BAE5A]/70 mb-6">
      Welkom bij de Top Tier Men Brotherhood! Plaats een introductie post om jezelf voor te stellen aan de community.
    </p>

    <div className="mb-6">
      <label className="block text-[#8BAE5A] font-semibold mb-2">
        Je introductie post:
      </label>
      <textarea
        value={introductionText}
        onChange={(e) => setIntroductionText(e.target.value)}
        className="w-full h-64 bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
        placeholder="Schrijf je introductie post..."
      />
    </div>

    <div className="flex gap-4">
      <button
        onClick={onSubmit}
        disabled={loading || !introductionText.trim()}
        className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
            Plaatsen...
          </div>
        ) : (
          'Plaats Introductie'
        )}
      </button>
      
      <button
        onClick={() => setIntroductionText('')}
        disabled={loading}
        className="px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
      >
        Wissen
      </button>
    </div>
  </div>
);
```

---

## **📊 BROTHERHOOD FORUM DATABASE**

### **Social Posts Structuur**
```typescript
interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'text' | 'image' | 'video';
  category: string;
  is_introduction: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface SocialComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface SocialLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
```

### **Forum Categories**
```typescript
const FORUM_CATEGORIES = [
  {
    id: 'algemeen',
    name: 'Algemeen',
    description: 'Algemene discussies en updates',
    icon: '💬',
    color: 'blue'
  },
  {
    id: 'fitness-training',
    name: 'Fitness & Training',
    description: 'Workout tips en ervaringen',
    icon: '💪',
    color: 'green'
  },
  {
    id: 'voeding-gezondheid',
    name: 'Voeding & Gezondheid',
    description: 'Voedingsadvies en recepten',
    icon: '🥗',
    color: 'orange'
  },
  {
    id: 'mindset-focus',
    name: 'Mindset & Focus',
    description: 'Mentale ontwikkeling',
    icon: '🧠',
    color: 'purple'
  },
  {
    id: 'business-carriere',
    name: 'Business & Carrière',
    description: 'Professionele groei',
    icon: '💼',
    color: 'yellow'
  },
  {
    id: 'voorstellen-nieuwe-leden',
    name: 'Voorstellen Nieuwe Leden',
    description: 'Introductie van nieuwe leden',
    icon: '👋',
    color: 'pink'
  }
];
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `brotherhood_page_loaded` - Brotherhood pagina geladen
- `introduction_template_generated` - Template gegenereerd
- `introduction_post_created` - Introductie post geplaatst
- `onboarding_completed` - Onboarding volledig voltooid
- `community_joined` - Gebruiker heeft community gejoined

### **Metrics**
- **Introduction Post Rate**: % gebruikers die introductie plaatsen
- **Community Engagement**: Actieve deelname aan forum
- **Post Quality**: Kwaliteit van introductie posts
- **Onboarding Completion**: % gebruikers die onboarding voltooien

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **"Failed to post introduction" Error**
```typescript
// Debug post creation
const debugPostCreation = async (content: string) => {
  try {
    console.log('🔍 Testing social post creation...');
    const response = await fetch('/api/social-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content,
        postType: 'text',
        category: 'introduction',
        isIntroduction: true
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Post created:', data);
  } catch (error) {
    console.error('Post creation error:', error);
  }
};
```

#### **Template Generation Issues**
- Check profile data availability
- Verify template string formatting
- Controleer user data completeness

#### **Onboarding Completion Issues**
```typescript
// Debug onboarding completion
const debugOnboardingCompletion = async () => {
  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 6,
        completed: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Onboarding completed:', result);
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
  }
};
```

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: Introductie post geplaatst, onboarding voltooid
2. **Empty Post**: Lege introductie post
3. **API Failure**: Network/server errors
4. **Template Generation**: Template wordt correct gegenereerd
5. **Onboarding Completion**: Onboarding wordt correct voltooid

### **Test Data**
```typescript
// Test introduction post
const testIntroductionPost = {
  content: 'Hallo Brothers! Ik ben een test gebruiker en ik ben blij om hier te zijn!',
  postType: 'text',
  category: 'introduction',
  isIntroduction: true,
  expectedResult: {
    success: true,
    message: 'Introduction post created successfully'
  }
};

// Verify post data
const verifyPostData = (post: SocialPost) => {
  console.log('Post ID:', post.id);
  console.log('User ID:', post.user_id);
  console.log('Content:', post.content);
  console.log('Category:', post.category);
  console.log('Is Introduction:', post.is_introduction);
  console.log('Created At:', post.created_at);
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ Template wordt correct gegenereerd
- ✅ Post wordt succesvol geplaatst
- ✅ Onboarding wordt voltooid
- ✅ Gebruiker wordt doorgestuurd naar dashboard
- ✅ Community engagement wordt gestimuleerd

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden/page.tsx`
- `src/app/api/social-posts/route.ts`
- `src/app/api/onboarding/route.ts`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)

---

## **💡 UX TIPS**

### **Introduction Post**
- **Template**: Voorgevulde template met persoonlijke data
- **Guidance**: Duidelijke instructies en voorbeelden
- **Validation**: Controleer post inhoud
- **Preview**: Toon preview van post

### **Community Engagement**
- **Welcome Message**: Persoonlijke welkomstboodschap
- **Next Steps**: Duidelijke volgende stappen
- **Community Guidelines**: Uitleg van community regels
- **Support**: Contact informatie voor hulp

---

*Laatste update: $(date)*
*Versie: 3.1.0*
