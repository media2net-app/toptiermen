# 🎬 Stap 0: Welcome Video

## 📋 **OVERZICHT**

De eerste stap van de onboarding is het bekijken van de welkomstvideo. Dit is de introductie tot het Top Tier Men platform en legt de basis voor de rest van de onboarding flow.

---

## **🎯 DOELSTELLING**

- **Welkom heten**: Gebruiker verwelkomen op het platform
- **Platform introductie**: Korte uitleg van wat Top Tier Men is
- **Verwachtingen zetten**: Wat kunnen gebruikers verwachten
- **Motivatie**: Gebruiker enthousiast maken voor de journey

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/welcome-video
Middleware: Stap 0 toegang
Component: WelcomeVideoPage
```

### **Database Updates**
```sql
-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  welcome_video_watched = true,
  step_0_completed = true,
  current_step = 1
WHERE user_id = ?;
```

### **Video Specificaties**
- **Bestand**: `/public/welkom-v2.mp4`
- **Formaat**: MP4
- **Duur**: ~2-3 minuten
- **Kwaliteit**: HD (720p+)
- **Fallback**: `/public/welkom.mp4` (oudere versie)

---

## **🎮 GEBRUIKERSERVARING**

### **Wat Gebruikers Zien**
1. **Video Player**: Grote, prominente video speler
2. **Play Button**: Duidelijke play/pause controls
3. **Progress Bar**: Visuele voortgang van video
4. **Next Button**: "Volgende stap" knop (wordt actief na video)

### **Interactie Flow**
```
1. Gebruiker komt op pagina
2. Video start automatisch (optioneel)
3. Gebruiker bekijkt volledige video
4. "Volgende stap" knop wordt actief
5. Gebruiker klikt om door te gaan naar Stap 1
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/welcome-video/page.tsx
export default function WelcomeVideoPage() {
  const { user } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  
  const handleVideoComplete = async () => {
    await completeCurrentStep();
    // Redirect naar stap 1
  };
  
  return (
    <div>
      <video 
        src="/welkom-v2.mp4"
        onEnded={handleVideoComplete}
        controls
      />
      <button onClick={handleVideoComplete}>
        Volgende stap
      </button>
    </div>
  );
}
```

### **Video Element**
```html
<video 
  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
  controls
  preload="metadata"
  onEnded={handleVideoComplete}
  onTimeUpdate={handleTimeUpdate}
>
  <source src="/welkom-v2.mp4" type="video/mp4" />
  <source src="/welkom.mp4" type="video/mp4" />
  <p>Je browser ondersteunt geen video element.</p>
</video>
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `video_started` - Video begint met afspelen
- `video_paused` - Video wordt gepauzeerd
- `video_resumed` - Video wordt hervat
- `video_completed` - Video volledig bekeken
- `step_completed` - Stap 0 voltooid

### **Metrics**
- **Completion Rate**: % gebruikers die video volledig bekijken
- **Drop-off Rate**: % gebruikers die stoppen tijdens video
- **Average Watch Time**: Gemiddelde kijktijd
- **Replay Rate**: % gebruikers die video opnieuw bekijken

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **Video Laadt Niet**
```typescript
// Check video bestand
const videoExists = await fetch('/welkom-v2.mp4', { method: 'HEAD' });
if (!videoExists.ok) {
  // Fallback naar oude video
  setVideoSrc('/welkom.mp4');
}
```

#### **Video Speelt Niet Af**
- Controleer browser ondersteuning
- Check video codec (H.264 aanbevolen)
- Verificeer bestand integriteit

#### **Progress Wordt Niet Opgeslagen**
```typescript
// Debug database update
console.log('Updating onboarding status:', {
  userId: user.id,
  step: 0,
  completed: true
});
```

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: Video speelt af, gebruiker voltooit stap
2. **Network Issues**: Video laadt langzaam of niet
3. **Browser Compatibility**: Verschillende browsers testen
4. **Mobile Experience**: Touch controls en responsive design

### **Test Data**
```typescript
// Test gebruiker voor stap 0
const testUser = {
  id: 'test-user-0',
  email: 'test-step0@toptiermen.eu',
  onboarding_status: {
    current_step: 0,
    welcome_video_watched: false,
    step_0_completed: false
  }
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ Video laadt binnen 3 seconden
- ✅ 95%+ completion rate voor video
- ✅ Smooth transition naar stap 1
- ✅ Database wordt correct bijgewerkt
- ✅ Geen JavaScript errors

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/welcome-video/page.tsx`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)
- `public/welkom-v2.mp4`
- `public/welkom.mp4` (fallback)

---

*Laatste update: $(date)*
*Versie: 3.1.0*
