# 🔍 SYSTEMATISCH OVERZICHT VAN FALLBACK DATA IN ADMIN DASHBOARD

## 📊 **HOOFDDASHBOARD (page.tsx)**
**Status**: ✅ **OPGELOST** - Nu gebruikt project-based statistieken

### **Voor (Fallback Data):**
- Academy Completion Rate: 73% (hardcoded)
- Training Completion Rate: 68% (hardcoded)
- Forum Response Time: 1.8h (hardcoded)
- Book Rating: 4.6 (hardcoded)
- Average XP: 1247 (hardcoded)
- Total Missions: 45 (hardcoded)
- Completed Missions: 38 (hardcoded)

### **Na (Echte Data):**
- Academy Modules: 67 (uit GitHub commits)
- Training Schemas: 35 (uit GitHub commits)
- Project Hours: 199 (uit GitHub commits)
- Features: 67 (uit GitHub commits)
- Bugs: 50 (uit GitHub commits)

---

## 📋 **PLANNING & TODO (planning-todo/page.tsx)**
**Status**: ⚠️ **FALLBACK DATA GEVONDEN**

### **API Endpoints met Hardcoded Data:**
1. **`/api/admin/todo-statistics`** - Volledig hardcoded:
   ```typescript
   const statistics = {
     total_tasks: 10,
     completed_tasks: 10,
     pending_tasks: 0,
     total_estimated_hours: 192,
     total_actual_hours: 192,
     average_completion_time: 19.2
   };
   ```

2. **`/api/admin/todo-tasks`** - Hardcoded taken:
   - 10 taken met vaste waarden
   - Alle taken gemarkeerd als "completed"
   - Vaste uren en datums

3. **`/api/admin/todo-subtasks`** - Hardcoded subtaken
4. **`/api/admin/todo-milestones`** - Hardcoded milestones

### **Taken om te maken:**
- [ ] Database tabellen aanmaken voor todo systeem
- [ ] API endpoints koppelen aan echte database
- [ ] Real-time task tracking implementeren

---

## 👥 **LEDENBEHEER (ledenbeheer/page.tsx)**
**Status**: ✅ **ECHTE DATA** - Gebruikt database queries

### **Data Bronnen:**
- `users` tabel (echte data)
- `profiles` tabel (echte data)
- `onboarding_status` tabel (echte data)

### **Geen fallback data gevonden**

---

## 👤 **GEBRUIKERSBEHEER (gebruikersbeheer/page.tsx)**
**Status**: ⚠️ **FALLBACK DATA GEVONDEN**

### **Hardcoded Mock Data:**
```typescript
const mockUsers: User[] = [
  {
    id: '1',
    username: '@discipline_daniel',
    name: 'Daniel Visser',
    email: 'daniel@mail.com',
    rank: 'Alpha',
    package: 'Warrior',
    lastLogin: '27 mei 2025',
    status: 'Actief',
    onboardingCompleted: true,
    badges: 15,
    createdAt: '2024-01-15'
  },
  // ... meer mock users
];
```

### **Taken om te maken:**
- [ ] Mock data vervangen door echte database queries
- [ ] API endpoint maken voor gebruikersbeheer
- [ ] Real-time user status tracking

---

## 🛡️ **FORUM MODERATIE (forum-moderatie/page.tsx)**
**Status**: ⚠️ **FALLBACK DATA GEVONDEN**

### **API Endpoints met Fallback:**
1. **`/api/admin/forum-reports`** - Fallback naar mock data
2. **`/api/admin/forum-moderation-logs`** - Fallback naar mock data
3. **`/api/admin/forum-stats`** - ✅ **ECHTE DATA** (gebruikt database)

### **Mock Data in Frontend:**
```typescript
const mockReports: ForumReport[] = [
  {
    id: '1',
    postTitle: 'Hoe bereik ik mijn fitness doelen?',
    reporterName: 'Jan Jansen',
    reason: 'Spam',
    status: 'pending'
  }
];

const mockLogs: ModerationLog[] = [
  {
    id: '1',
    moderatorName: 'Admin Rick',
    action: 'Post verwijderd',
    targetType: 'Post'
  }
];
```

### **Taken om te maken:**
- [ ] Forum reports database tabel aanmaken
- [ ] Forum moderation logs database tabel aanmaken
- [ ] API endpoints koppelen aan echte database
- [ ] Real-time moderation tracking

---

## 📚 **BOEKENKAMER (boekenkamer/page.tsx)**
**Status**: ✅ **ECHTE DATA** - Gebruikt database queries

### **API Endpoints:**
- `/api/admin/books` - ✅ Echte data
- `/api/admin/book-categories` - ✅ Echte data
- `/api/admin/book-reviews` - ⚠️ Fallback naar mock data
- `/api/admin/book-stats` - ✅ Echte data

### **Fallback Data:**
- Book reviews gebruiken nog mock data

### **Taken om te maken:**
- [ ] Book reviews database tabel aanmaken
- [ ] Book reviews API koppelen aan database

---

## 📈 **PROJECT LOGS (project-logs/page.tsx)**
**Status**: ✅ **ECHTE DATA** - Gebruikt GitHub-based statistieken

### **Data Bronnen:**
- GitHub commit history
- Realistische project statistieken
- Geen fallback data

---

## 📊 **ONBOARDING OVERVIEW (onboarding-overview/page.tsx)**
**Status**: ✅ **ECHTE DATA** - Gebruikt database queries

### **API Endpoints:**
- `/api/admin/onboarding-status` - ✅ Echte data uit database

### **Data Bronnen:**
- `users` tabel (echte data)
- `onboarding_status` tabel (echte data)
- `profiles` tabel (echte data)

### **Geen fallback data gevonden**

---

## 🎯 **PRIORITEITEN VOOR TAKEN:**

### **🔥 HOGE PRIORITEIT:**
1. **Planning & Todo Systeem** - Volledig hardcoded, veel gebruikt
2. **Gebruikersbeheer** - Mock data, belangrijk voor admin functies
3. **Forum Moderatatie** - Mock data, belangrijk voor community management

### **🟡 MEDIUM PRIORITEIT:**
4. **Book Reviews** - Kleine fallback, maar wel belangrijk voor content

### **🟢 LAGE PRIORITEIT:**
5. **Overige pagina's** - Al grotendeels echte data

---

## 📝 **TOTALE TAKEN LIJST:**

### **Database Tabellen Aanmaken:**
- [ ] `todo_tasks`
- [ ] `todo_subtasks` 
- [ ] `todo_milestones`
- [ ] `todo_statistics`
- [ ] `forum_reports`
- [ ] `forum_moderation_logs`
- [ ] `book_reviews`
- [ ] `user_management_logs`

### **API Endpoints Updaten:**
- [ ] `/api/admin/todo-tasks` - Database koppeling
- [ ] `/api/admin/todo-subtasks` - Database koppeling
- [ ] `/api/admin/todo-milestones` - Database koppeling
- [ ] `/api/admin/todo-statistics` - Database koppeling
- [ ] `/api/admin/forum-reports` - Database koppeling
- [ ] `/api/admin/forum-moderation-logs` - Database koppeling
- [ ] `/api/admin/book-reviews` - Database koppeling
- [ ] `/api/admin/users` - Nieuwe endpoint voor gebruikersbeheer

### **Frontend Updates:**
- [ ] Gebruikersbeheer - Mock data vervangen
- [ ] Forum moderatie - Mock data vervangen
- [ ] Planning & Todo - Real-time updates
- [ ] Error handling verbeteren

---

## ✅ **SAMENVATTING:**
- **3 pagina's** met volledige fallback data
- **1 pagina** met gedeeltelijke fallback data  
- **5 pagina's** met echte data
- **Totaal: 8 database tabellen** nodig
- **Totaal: 8 API endpoints** te updaten
