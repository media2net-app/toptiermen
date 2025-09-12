# 🚨 Troubleshooting Guide

## 📋 **OVERZICHT**

Deze guide helpt bij het oplossen van veelvoorkomende problemen in het Top Tier Men onboarding systeem.

---

## **🔍 ALGEMENE DEBUGGING**

### **Browser Console**
```javascript
// Check onboarding status
console.log('Current onboarding status:', window.localStorage.getItem('onboarding_status'));

// Check user session
console.log('User session:', window.localStorage.getItem('sb-wkjvstuttbeyqzyjayxj-auth-token'));

// Check API responses
fetch('/api/onboarding')
  .then(res => res.json())
  .then(data => console.log('Onboarding API:', data));
```

### **Network Tab**
- Open Developer Tools (F12)
- Ga naar Network tab
- Herlaad pagina
- Check API calls voor errors (rode status codes)
- Bekijk response bodies voor error messages

---

## **🚨 STAP-SPECIFIEKE PROBLEMEN**

### **Stap 0: Welcome Video**

#### **Video Laadt Niet**
```typescript
// Check video bestand
const checkVideo = async () => {
  try {
    const response = await fetch('/welkom-v2.mp4', { method: 'HEAD' });
    console.log('Video status:', response.status);
    
    if (!response.ok) {
      console.log('Video not found, trying fallback...');
      const fallbackResponse = await fetch('/welkom.mp4', { method: 'HEAD' });
      console.log('Fallback video status:', fallbackResponse.status);
    }
  } catch (error) {
    console.error('Video check error:', error);
  }
};
```

#### **Video Speelt Niet Af**
- **Browser Compatibility**: Test in Chrome, Firefox, Safari
- **Codec Issues**: Zorg dat video H.264 codec gebruikt
- **File Size**: Check of video bestand niet te groot is
- **Network Issues**: Test op verschillende netwerken

#### **Progress Wordt Niet Opgeslagen**
```typescript
// Debug database update
const debugVideoProgress = async () => {
  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 0 })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Video progress error:', error);
  }
};
```

### **Stap 1: Profile Setup**

#### **Formulier Slaat Niet Op**
```typescript
// Debug form submission
const debugProfileSave = async (formData) => {
  try {
    console.log('Submitting profile data:', formData);
    
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    console.log('Profile save response:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Profile save error:', errorData);
    }
  } catch (error) {
    console.error('Profile save exception:', error);
  }
};
```

#### **Validatie Errors**
- **Required Fields**: Controleer of alle verplichte velden zijn ingevuld
- **Field Lengths**: Check maximum lengtes van velden
- **URL Format**: Verificeer website URL format
- **Email Format**: Controleer email validatie

#### **Database Connection Issues**
```typescript
// Test database connection
const testDatabaseConnection = async () => {
  try {
    const response = await fetch('/api/test-db-connection');
    const data = await response.json();
    console.log('Database connection:', data);
  } catch (error) {
    console.error('Database connection error:', error);
  }
};
```

### **Stap 2: Uitdagingen**

#### **"Failed to load challenges" Error**
```typescript
// Dit was het probleem dat we hebben opgelost
// Oplossing: API endpoint van /api/challenges-simple naar /api/missions-simple

// Debug API call
const debugChallengesAPI = async () => {
  try {
    console.log('🔍 Testing missions-simple API...');
    const response = await fetch('/api/missions-simple?userId=test-user-id');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    console.log('Missions count:', data.missions?.length || 0);
  } catch (error) {
    console.error('Challenges API error:', error);
  }
};
```

#### **Challenges Niet Zichtbaar**
- **API Response**: Check of `data.missions` bestaat (niet `data.challenges`)
- **Component State**: Controleer of `setChallenges` wordt aangeroepen
- **Loading State**: Check of loading state correct wordt afgehandeld
- **Error State**: Controleer error handling

#### **Selectie Slaat Niet Op**
```typescript
// Debug challenge selection
const debugChallengeSelection = async (challengeIds) => {
  try {
    console.log('Selected challenges:', challengeIds);
    
    const response = await fetch('/api/missions-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-id',
        challengeIds: challengeIds
      })
    });
    
    console.log('Selection response:', response.status);
    const data = await response.json();
    console.log('Selection result:', data);
  } catch (error) {
    console.error('Challenge selection error:', error);
  }
};
```

### **Stap 3: Trainingsschemas**

#### **"Failed to load training schemas" Error**
```typescript
// Debug training schemas API
const debugTrainingSchemas = async () => {
  try {
    console.log('🔍 Testing training schemas API...');
    const response = await fetch('/api/training-schemas');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Training schemas:', data);
  } catch (error) {
    console.error('Training schemas API error:', error);
  }
};
```

#### **Schema Selection Issues**
- **API Response**: Check of `data.schemas` bestaat
- **Component State**: Controleer state updates
- **Database**: Verificeer training_schemas tabel

### **Stap 4: Voedingsplannen**

#### **"Failed to load nutrition plans" Error**
```typescript
// Debug nutrition plans API
const debugNutritionPlans = async () => {
  try {
    console.log('🔍 Testing nutrition plans API...');
    const response = await fetch('/api/nutrition-plans');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Nutrition plans:', data);
  } catch (error) {
    console.error('Nutrition plans API error:', error);
  }
};
```

### **Stap 5: Challenges**

#### **"Failed to load challenges" Error**
```typescript
// Debug challenges API
const debugChallenges = async () => {
  try {
    console.log('🔍 Testing challenges API...');
    const response = await fetch('/api/challenges');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Challenges:', data);
  } catch (error) {
    console.error('Challenges API error:', error);
  }
};
```

### **Stap 6: Brotherhood**

#### **"Failed to post introduction" Error**
```typescript
// Debug post creation
const debugPostCreation = async (content) => {
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

---

## **🔄 ONBOARDING RESET**

### **Complete Reset**
```typescript
// Reset onboarding voor test gebruiker
const resetOnboarding = async (userId) => {
  try {
    // Reset onboarding status
    await fetch('/api/admin/reset-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    // Clear user data
    await fetch('/api/admin/clear-user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    console.log('Onboarding reset completed');
  } catch (error) {
    console.error('Onboarding reset error:', error);
  }
};
```

### **Step-by-Step Reset**
```typescript
// Reset specifieke stap
const resetStep = async (userId, step) => {
  try {
    const response = await fetch('/api/admin/reset-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, step })
    });
    
    console.log('Step reset response:', response.status);
  } catch (error) {
    console.error('Step reset error:', error);
  }
};
```

---

## **🗄️ DATABASE TROUBLESHOOTING**

### **Check Database Connection**
```sql
-- Test database connection
SELECT NOW() as current_time;

-- Check onboarding status
SELECT * FROM onboarding_status WHERE user_id = 'USER_ID';

-- Check user profile
SELECT * FROM profiles WHERE id = 'USER_ID';

-- Check user missions
SELECT * FROM user_missions WHERE user_id = 'USER_ID';
```

### **Common Database Issues**
- **Missing Tables**: Controleer of alle tabellen bestaan
- **Permission Issues**: Check RLS policies
- **Data Types**: Verificeer data types in inserts
- **Foreign Keys**: Controleer referentie integriteit

---

## **🌐 NETWORK TROUBLESHOOTING**

### **API Endpoint Testing**
```bash
# Test API endpoints met curl
curl -X GET "http://localhost:3000/api/missions-simple?userId=test-user-id"
curl -X POST "http://localhost:3000/api/onboarding" -H "Content-Type: application/json" -d '{"step": 0}'
```

### **CORS Issues**
- Check CORS headers in API responses
- Verificeer allowed origins
- Test met verschillende browsers

### **Network Timeouts**
- Check API response times
- Implementeer timeout handling
- Test op verschillende netwerken

---

## **🔐 AUTHENTICATION ISSUES**

### **Session Problems**
```typescript
// Check user session
const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session:', session);
    console.log('Session error:', error);
  } catch (error) {
    console.error('Session check error:', error);
  }
};
```

### **Token Issues**
- Check token expiration
- Verificeer token format
- Test token refresh

---

## **📱 MOBILE ISSUES**

### **Touch Events**
- Test touch interactions
- Check button sizes
- Verificeer responsive design

### **Performance**
- Check loading times op mobile
- Test op verschillende devices
- Monitor memory usage

---

## **🧪 TESTING TOOLS**

### **Debug Scripts**
```typescript
// Complete onboarding debug
const debugOnboarding = async () => {
  console.log('🔍 Starting onboarding debug...');
  
  // Check user session
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User:', user?.email);
  
  // Check onboarding status
  const { data: onboarding } = await supabase
    .from('onboarding_status')
    .select('*')
    .eq('user_id', user?.id)
    .single();
  console.log('Onboarding status:', onboarding);
  
  // Test each API endpoint
  const endpoints = [
    '/api/missions-simple',
    '/api/training-schemas',
    '/api/nutrition-plans',
    '/api/challenges'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`${endpoint}: ${response.status}`);
    } catch (error) {
      console.error(`${endpoint}: Error`, error);
    }
  }
};
```

### **Error Monitoring**
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to error tracking service
});
```

---

## **📞 SUPPORT CONTACT**

### **Escalation Path**
1. **Level 1**: Check deze troubleshooting guide
2. **Level 2**: Check browser console en network tab
3. **Level 3**: Test met debug scripts
4. **Level 4**: Contact development team

### **Useful Information to Collect**
- Browser en versie
- Error messages (exact tekst)
- Console logs
- Network requests
- User ID en email
- Stap waar probleem optreedt
- Screenshots of video

---

*Laatste update: $(date)*
*Versie: 3.1.0*
