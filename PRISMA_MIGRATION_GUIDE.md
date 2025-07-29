# 🚀 Database Migratie: Supabase → PostgreSQL + Prisma

## 📋 Overzicht

Deze gids helpt je bij het migreren van Supabase naar een eigen PostgreSQL database met Prisma ORM. Dit geeft je meer controle, betere performance en minder afhankelijkheid van externe services.

## 🎯 Voordelen van de Migratie

- **Meer controle**: Volledige controle over je database
- **Betere performance**: Directe database connecties
- **Kostenbesparing**: Geen maandelijkse Supabase kosten
- **Flexibiliteit**: Makkelijker aanpassen en uitbreiden
- **Betere developer experience**: Prisma's type-safe queries

## 📦 Benodigde Packages

```bash
npm install prisma @prisma/client
```

## 🔧 Stap 1: PostgreSQL Database Setup

### Optie A: Lokale PostgreSQL (Development)
```bash
# macOS met Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Optie B: Cloud PostgreSQL (Production)
- **Neon** (PostgreSQL-as-a-Service): https://neon.tech
- **Supabase** (PostgreSQL hosting): https://supabase.com
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

## 🔧 Stap 2: Environment Variables

Voeg deze variabelen toe aan je `.env.local`:

```env
# Database URL (vervang met jouw PostgreSQL connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/toptiermen"

# Oude Supabase variabelen (voor migratie)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## 🔧 Stap 3: Database Schema Genereren

```bash
# Genereer Prisma client
npx prisma generate

# Maak eerste migratie
npx prisma migrate dev --name init

# Push schema naar database (als je geen migraties wilt)
npx prisma db push
```

## 🔧 Stap 4: Data Migreren

### Optie A: Automatische Migratie (Aanbevolen)
```bash
# Voer het migratie script uit
node scripts/migrate-to-prisma.js
```

### Optie B: Handmatige Setup
```bash
# Voer het setup script uit
node scripts/setup-prisma-database.js
```

## 🔧 Stap 5: API Routes Updaten

### Voorbeeld: Prelaunch Emails API

**Oud (Supabase):**
```typescript
// src/app/api/admin/prelaunch-emails/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('prelaunch_emails')
    .select('*');
  // ...
}
```

**Nieuw (Prisma):**
```typescript
// src/app/api/admin/prelaunch-emails-prisma/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const emails = await prisma.prelaunchEmail.findMany({
    orderBy: { subscribedAt: 'desc' }
  });
  // ...
}
```

## 🔧 Stap 6: Authentication Setup

### Optie A: NextAuth.js (Aanbevolen)
```bash
npm install next-auth @auth/prisma-adapter
```

### Optie B: Custom Authentication
Maak je eigen auth systeem met Prisma en JWT.

## 🔧 Stap 7: Frontend Updaten

Update je frontend componenten om de nieuwe API endpoints te gebruiken:

```typescript
// Oud
const response = await fetch('/api/admin/prelaunch-emails');

// Nieuw
const response = await fetch('/api/admin/prelaunch-emails-prisma');
```

## 📊 Database Schema Overzicht

Het Prisma schema bevat alle tabellen uit je huidige Supabase setup:

### Core Tables
- `User` - Gebruikers en profielen
- `PrelaunchEmail` - Pre-launch email abonnementen
- `UserGoal` - Gebruikersdoelen
- `UserMission` - Gebruikersmissies
- `UserHabit` - Gebruikersgewoontes

### Content Tables
- `Book` - Boeken in de boekenkamer
- `BookCategory` - Boekcategorieën
- `BookReview` - Boekrecensies
- `Event` - Evenementen
- `EventCategory` - Evenementcategorieën

### Tracking Tables
- `WorkoutSession` - Workout sessies
- `WorkoutExercise` - Workout oefeningen
- `UserNutritionPlan` - Voedingsplannen
- `UserAcademyProgress` - Academy voortgang
- `UserTrainingProgress` - Training voortgang

### Social Tables
- `ForumPost` - Forum posts
- `ForumComment` - Forum comments
- `UserXp` - XP systeem
- `UserBadge` - Badges
- `UserStreak` - Streaks

## 🧪 Testing

### Database Connectie Testen
```bash
# Test database connectie
npx prisma studio
```

### API Endpoints Testen
```bash
# Test prelaunch emails API
curl http://localhost:3000/api/admin/prelaunch-emails-prisma
```

## 🚀 Deployment

### Vercel
1. Voeg `DATABASE_URL` toe aan je Vercel environment variables
2. Deploy je applicatie
3. Voer migraties uit: `npx prisma migrate deploy`

### Andere Platforms
- **Railway**: Automatische PostgreSQL provisioning
- **Netlify**: Voeg PostgreSQL add-on toe
- **Heroku**: PostgreSQL add-on

## 🔄 Rollback Plan

Als je terug wilt naar Supabase:

1. Exporteer data uit PostgreSQL:
```bash
pg_dump your_database > backup.sql
```

2. Importeer in Supabase:
```bash
psql -h your_supabase_host -U postgres -d postgres < backup.sql
```

3. Update environment variables terug naar Supabase

## 📈 Performance Monitoring

### Database Performance
```bash
# Prisma query logging
DEBUG="prisma:query" npm run dev
```

### Monitoring Tools
- **Prisma Studio**: `npx prisma studio`
- **pgAdmin**: PostgreSQL admin interface
- **Grafana**: Metrics en monitoring

## 🛠 Troubleshooting

### Veelvoorkomende Problemen

**1. Database connectie fout**
```bash
# Controleer DATABASE_URL
echo $DATABASE_URL

# Test connectie
npx prisma db pull
```

**2. Schema sync problemen**
```bash
# Reset database
npx prisma migrate reset

# Push schema
npx prisma db push
```

**3. Type errors**
```bash
# Regenerate Prisma client
npx prisma generate
```

## 📞 Support

Voor vragen over de migratie:
1. Check de Prisma documentatie: https://pris.ly/docs
2. Bekijk de Prisma schema in `prisma/schema.prisma`
3. Test de migratie scripts in `scripts/`

## 🎉 Volgende Stappen

Na succesvolle migratie:

1. **Update alle API routes** om Prisma te gebruiken
2. **Implementeer authentication** met NextAuth.js
3. **Test alle functionaliteit** grondig
4. **Monitor performance** en optimaliseer queries
5. **Backup strategie** opzetten
6. **CI/CD pipeline** updaten

---

**Succes met de migratie! 🚀** 