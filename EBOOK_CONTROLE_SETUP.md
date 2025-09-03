# 📚 EBOOK CONTROLE SETUP GUIDE

## 🎯 Overzicht
De E-book Controle pagina in het admin dashboard geeft je een volledig overzicht van alle Academy ebooks met hun styling types, features en prioriteiten voor updates.

## 🛠️ Setup Instructies

### 1. Database Setup
Voer de SQL uit in je Supabase SQL Editor:

```sql
-- Kopieer en plak de inhoud van DATABASE_EBOOK_SETUP.sql
```

### 2. Toegang tot de Pagina
- Ga naar het Admin Dashboard
- Navigeer naar **CONTENT** → **E-book Controle**
- URL: `/dashboard-admin/ebook-controle`

### 3. Eerste Keer Gebruik
1. Klik op **"Opnieuw Scannen"** om de database te vullen
2. De scan vult automatisch alle bekende ebooks in met hun analysegegevens

## 📊 Features

### Styling Categorieën
- **🟢 Modern**: Inter font styling (zoals Module 1 Les 1) - DOEL STYLING
- **🔵 Enhanced**: Segoe UI met module badge en enhanced styling
- **🟡 Badge**: Basis styling met module badge
- **🔴 Basic**: Basis styling zonder moderne features - MOET WORDEN GEÜPDATET

### Functionaliteiten
- ✅ **Overzicht van alle ebooks** met status en features
- ✅ **Filtering op styling type** en module
- ✅ **Zoekfunctie** door titels en bestandsnamen
- ✅ **Prioriteitsindicatoren** voor update planning
- ✅ **Direct preview** van ebooks in nieuwe tab
- ✅ **Statistieken dashboard** met progress tracking

### Statistieken
- Totaal aantal ebooks
- Verdeling per styling type
- Aantal ebooks dat update nodig heeft
- Progress percentage naar moderne styling

## 🎨 Styling Types Uitgelegd

### Modern (Prioriteit 1) ✅
**Kenmerken:**
- Inter font via Google Fonts
- `.ebook-container` class
- Moderne gradient header
- Volledige inhoudsopgave
- Reflectie sectie
- Action items
- Beste user experience

**Voorbeeld bestanden:**
- `discipline-identiteit-wat-is-discipline-en-waarom-is-dit-essentieel-ebook.html`
- `fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.html`

### Enhanced (Prioriteit 2) ⚠️
**Kenmerken:**
- Segoe UI font
- Module badge
- Enhanced container styling
- Rounded corners
- Goede structuur maar niet consistent met moderne branding

### Badge (Prioriteit 3) ⚠️
**Kenmerken:**
- Segoe UI font
- Module badge aanwezig
- Basis container styling
- Redelijke structuur maar mist moderne features

### Basic (Prioriteit 4) ❌
**Kenmerken:**
- Alleen Segoe UI
- Geen module badge
- Minimale styling
- Mist belangrijke UX elementen
- **HOOGSTE PRIORITEIT VOOR UPDATE**

## 📈 Update Strategie

### Fase 1: Basic → Modern
Converteer alle "Basic" ebooks naar "Modern" styling:
- Voeg Inter font toe
- Implementeer `.ebook-container` structuur
- Voeg moderne header gradient toe
- Implementeer volledige inhoudsopgave
- Voeg reflectie en action items toe

### Fase 2: Badge → Modern
Update "Badge" ebooks:
- Vervang Segoe UI met Inter font
- Converteer naar `.ebook-container`
- Behoud goede structuur, update styling

### Fase 3: Enhanced → Modern
Standardiseer "Enhanced" ebooks:
- Vervang enhanced container met modern container
- Update font naar Inter
- Behoud alle goede features

## 🔧 Technische Details

### Database Schema
```sql
academy_ebooks (
  id UUID PRIMARY KEY,
  filename TEXT UNIQUE,
  path TEXT,
  title TEXT,
  module TEXT,
  style_type TEXT,
  style_description TEXT,
  has_inter_font BOOLEAN,
  has_segoe_ui BOOLEAN,
  has_ebook_container BOOLEAN,
  has_module_badge BOOLEAN,
  has_enhanced_styling BOOLEAN,
  has_table_of_contents BOOLEAN,
  has_reflection_section BOOLEAN,
  has_action_items BOOLEAN,
  needs_update BOOLEAN,
  priority INTEGER,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### API Endpoints
- `GET /academy_ebooks` - Ophalen alle ebooks
- Database triggers voor auto-update timestamps
- RLS policies voor admin-only toegang

## 🎯 Next Steps

1. **Voer database setup uit** met `DATABASE_EBOOK_SETUP.sql`
2. **Test de pagina** door naar E-book Controle te navigeren
3. **Voer eerste scan uit** om data te vullen
4. **Bekijk statistieken** om update prioriteiten te zien
5. **Start update proces** met highest priority items

## 📝 Notities
- Alle ebook paden zijn relatief naar `/public/books/`
- Preview functie opent ebooks in nieuwe tab
- Scan functie kan worden uitgevoerd om data te refreshen
- Filtering en zoeken werken real-time

---

✅ **E-book Controle is nu klaar voor gebruik!**
