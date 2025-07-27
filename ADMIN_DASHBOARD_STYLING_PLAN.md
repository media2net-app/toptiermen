# Admin Dashboard Styling Upgrade Plan

## 🎯 **Doel**
Alle admin dashboard pagina's upgraden naar de nieuwe professionele stijl die is ontwikkeld voor de onboarding-overview pagina, met consistente kleuren, layout en componenten.

## 🎨 **Nieuwe Stijl Standaard**

### **Kleurenschema**
- **Achtergrond**: `bg-[#181F17]` (donker groen-zwart)
- **Kaarten**: `bg-[#232D1A]` met `border-[#3A4D23]`
- **Accent kleuren**: `#8BAE5A` (groen), `#FFD700` (goud), `#f0a14f` (oranje)
- **Tekst**: `text-white` (hoofdtekst), `text-gray-300` (secundair), `text-gray-400` (tertiair)

### **Component Styling**
- **Statistiek kaarten**: Gradient backgrounds met iconen
- **Tabellen**: Donkere headers met hover effecten
- **Knoppen**: Gradient backgrounds met hover states
- **Formulieren**: Donkere inputs met groene focus states

## 📋 **Stap-voor-Stap Upgrade Plan**

### **Fase 1: Layout & Basis Componenten** ⚡ **PRIORITEIT 1**

#### 1.1 Admin Layout Upgrade
**Bestand**: `src/app/dashboard-admin/layout.tsx`
- [ ] Achtergrondkleur aanpassen naar `bg-[#181F17]`
- [ ] Sidebar styling verbeteren met nieuwe kleuren
- [ ] Header styling consistent maken
- [ ] Menu items styling upgraden

#### 1.2 Gemeenschappelijke Componenten
**Bestanden**: `src/components/ui/` en nieuwe admin-specifieke componenten
- [ ] AdminCard component maken
- [ ] AdminTable component maken
- [ ] AdminButton component maken
- [ ] AdminStatsCard component maken

### **Fase 2: Hoofdpagina's** ⚡ **PRIORITEIT 2**

#### 2.1 Dashboard Hoofdpagina
**Bestand**: `src/app/dashboard-admin/page.tsx`
- [ ] Achtergrondkleur aanpassen
- [ ] Statistiek kaarten toevoegen met nieuwe styling
- [ ] Recente activiteiten sectie
- [ ] Quick actions sectie

#### 2.2 Gebruikersbeheer
**Bestand**: `src/app/dashboard-admin/gebruikersbeheer/page.tsx`
- [ ] Nieuwe tabel styling
- [ ] Zoek en filter functionaliteit
- [ ] Gebruiker acties (edit, delete, reset)
- [ ] Statistiek kaarten toevoegen

#### 2.3 Ledenbeheer
**Bestand**: `src/app/dashboard-admin/ledenbeheer/page.tsx`
- [ ] Leden overzicht met nieuwe styling
- [ ] Leden statistieken
- [ ] Leden acties en filters

### **Fase 3: Content Management** ⚡ **PRIORITEIT 3**

#### 3.1 Academy Beheer
**Bestand**: `src/app/dashboard-admin/academy/page.tsx`
- [ ] Module overzicht met nieuwe styling
- [ ] Les beheer interface
- [ ] Content statistieken

#### 3.2 Boekenkamer Beheer
**Bestand**: `src/app/dashboard-admin/boekenkamer/page.tsx`
- [ ] Boek overzicht met nieuwe styling
- [ ] Categorie beheer
- [ ] Upload interface verbeteren

#### 3.3 Trainingscentrum Beheer
**Bestand**: `src/app/dashboard-admin/trainingscentrum/page.tsx`
- [ ] Schema overzicht met nieuwe styling
- [ ] Oefening beheer
- [ ] Schema builder interface

#### 3.4 Voedingsplannen Beheer
**Bestand**: `src/app/dashboard-admin/voedingsplannen/page.tsx`
- [ ] Plan overzicht met nieuwe styling
- [ ] Ingrediënt beheer
- [ ] Plan builder interface

### **Fase 4: Community & Social** ⚡ **PRIORITEIT 4**

#### 4.1 Forum Moderatie
**Bestand**: `src/app/dashboard-admin/forum-moderatie/page.tsx`
- [ ] Forum overzicht met nieuwe styling
- [ ] Post moderatie interface
- [ ] Gebruiker moderatie acties

#### 4.2 Social Feed Beheer
**Bestand**: `src/app/dashboard-admin/social-feed/page.tsx`
- [ ] Feed overzicht met nieuwe styling
- [ ] Post beheer interface
- [ ] Content moderatie

#### 4.3 Evenementenbeheer
**Bestand**: `src/app/dashboard-admin/evenementenbeheer/page.tsx`
- [ ] Evenement overzicht met nieuwe styling
- [ ] Evenement beheer interface
- [ ] Deelname statistieken

### **Fase 5: Gamification & Analytics** ⚡ **PRIORITEIT 5**

#### 5.1 Badges & Rangen
**Bestand**: `src/app/dashboard-admin/badges-rangen/page.tsx`
- [ ] Badge overzicht met nieuwe styling
- [ ] Rang beheer interface
- [ ] Toekenning statistieken

#### 5.2 Analytics
**Bestand**: `src/app/dashboard-admin/analytics/page.tsx`
- [ ] Dashboard met nieuwe styling
- [ ] Grafieken en statistieken
- [ ] Export functionaliteit

#### 5.3 Aankondigingen
**Bestand**: `src/app/dashboard-admin/aankondigingen/page.tsx`
- [ ] Aankondiging overzicht met nieuwe styling
- [ ] Aankondiging beheer interface
- [ ] Publiceer geschiedenis

### **Fase 6: Instellingen & Logs** ⚡ **PRIORITEIT 6**

#### 6.1 Instellingen
**Bestand**: `src/app/dashboard-admin/instellingen/page.tsx`
- [ ] Instellingen interface met nieuwe styling
- [ ] Configuratie opties
- [ ] Systeem instellingen

#### 6.2 Logs
**Bestand**: `src/app/dashboard-admin/logs/page.tsx`
- [ ] Log overzicht met nieuwe styling
- [ ] Log filtering en zoeken
- [ ] Log export functionaliteit

## 🛠 **Technische Implementatie**

### **Nieuwe Componenten te Maken**

#### AdminCard Component
```typescript
// src/components/admin/AdminCard.tsx
interface AdminCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}
```

#### AdminTable Component
```typescript
// src/components/admin/AdminTable.tsx
interface AdminTableProps {
  headers: string[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
}
```

#### AdminStatsCard Component
```typescript
// src/components/admin/AdminStatsCard.tsx
interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'green' | 'orange' | 'blue' | 'purple';
}
```

### **CSS Classes te Standaardiseren**

#### Achtergrond Classes
```css
.admin-bg-primary: bg-[#181F17]
.admin-bg-secondary: bg-[#232D1A]
.admin-bg-card: bg-[#232D1A] border-[#3A4D23]
```

#### Tekst Classes
```css
.admin-text-primary: text-white
.admin-text-secondary: text-gray-300
.admin-text-muted: text-gray-400
.admin-text-accent: text-[#8BAE5A]
```

#### Button Classes
```css
.admin-btn-primary: bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A]
.admin-btn-secondary: bg-[#181F17] text-gray-400 border-[#3A4D23]
```

## 📊 **Voortgang Tracking**

### **Week 1: Fase 1 & 2**
- [x] Admin layout upgrade
- [x] Gemeenschappelijke componenten
- [x] Dashboard hoofdpagina
- [x] Gebruikersbeheer
- [x] Ledenbeheer

### **Week 2: Fase 3**
- [ ] Academy beheer
- [ ] Boekenkamer beheer
- [ ] Trainingscentrum beheer
- [ ] Voedingsplannen beheer

### **Week 3: Fase 4 & 5**
- [ ] Forum moderatie
- [ ] Social feed beheer
- [ ] Evenementenbeheer
- [ ] Badges & rangen

### **Week 4: Fase 6 & Afronding**
- [ ] Analytics
- [ ] Aankondigingen
- [ ] Instellingen
- [ ] Logs
- [ ] Finale testing en optimalisatie

## 🎯 **Succes Criteria**

### **Visuele Consistentie**
- [ ] Alle pagina's gebruiken hetzelfde kleurenschema
- [ ] Consistente component styling
- [ ] Uniforme spacing en typography

### **Functionaliteit**
- [ ] Alle bestaande functionaliteit behouden
- [ ] Verbeterde gebruikerservaring
- [ ] Responsive design op alle schermformaten

### **Performance**
- [ ] Geen performance impact door styling wijzigingen
- [ ] Optimale loading times
- [ ] Smooth animaties en transitions

## 🚀 **Volgende Stap**

**Start met Fase 1**: Admin layout upgrade en gemeenschappelijke componenten maken. Dit vormt de basis voor alle andere pagina upgrades.

**Gereed om te beginnen?** Laat me weten of je wilt dat ik start met de implementatie van Fase 1! 