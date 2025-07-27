# Boekenkamer Database Setup - Handmatige Instructies

## 🎯 **Doel**
De Boekenkamer database tabellen aanmaken in Supabase zodat de admin dashboard en frontend echte data kunnen gebruiken.

## 📋 **Stap-voor-Stap Instructies**

### **Stap 1: Ga naar Supabase Dashboard**
1. Open je browser en ga naar [supabase.com](https://supabase.com)
2. Log in met je account
3. Selecteer je project

### **Stap 2: Open SQL Editor**
1. Klik op **"SQL Editor"** in de linker navigatie
2. Klik op **"New query"** om een nieuwe query te maken

### **Stap 3: Kopieer en Plak SQL Script**
1. Open het bestand `create_books_tables.sql` in je project
2. Kopieer de volledige inhoud
3. Plak het in de SQL Editor in Supabase

### **Stap 4: Voer SQL Script Uit**
1. Klik op **"Run"** om het script uit te voeren
2. Wacht tot alle statements zijn uitgevoerd
3. Controleer of er geen errors zijn

### **Stap 5: Verificeer Setup**
1. Ga naar **"Table Editor"** in de linker navigatie
2. Controleer of je deze tabellen ziet:
   - `book_categories`
   - `books`
   - `book_reviews`

### **Stap 6: Controleer Data**
1. Klik op elke tabel om de data te bekijken
2. Je zou moeten zien:
   - **6 boek categorieën** (Mindset, Productiviteit, etc.)
   - **5 boeken** (Rich Dad Poor Dad, Atomic Habits, etc.)
   - **3 reviews** (sample reviews)

## 🔍 **Verificatie**

### **Controleer in Admin Dashboard**
1. Ga naar `/dashboard-admin/boekenkamer`
2. Je zou nu **groene "Live" badges** moeten zien
3. De data zou uit de database moeten komen in plaats van mock data

### **Controleer API Routes**
Test de API routes in je browser:
- `http://localhost:3000/api/admin/books`
- `http://localhost:3000/api/admin/book-categories`
- `http://localhost:3000/api/admin/book-reviews`
- `http://localhost:3000/api/admin/book-stats`

## 🚨 **Troubleshooting**

### **Error: "relation does not exist"**
- **Oorzaak**: SQL script is niet correct uitgevoerd
- **Oplossing**: Voer het SQL script opnieuw uit in Supabase

### **Error: "permission denied"**
- **Oorzaak**: RLS policies blokkeren toegang
- **Oplossing**: Controleer of je admin rechten hebt in de database

### **Error: "foreign key constraint"**
- **Oorzaak**: Tabellen zijn niet in de juiste volgorde aangemaakt
- **Oplossing**: Voer het SQL script opnieuw uit (het script heeft `IF NOT EXISTS`)

### **Geen data zichtbaar**
- **Oorzaak**: RLS policies zijn te restrictief
- **Oplossing**: Controleer de RLS policies in Supabase

## 📊 **Verwachte Resultaten**

Na succesvolle setup zou je moeten zien:

### **Database Tabellen**
```sql
book_categories    ✅ 6 rijen
books             ✅ 5 rijen  
book_reviews      ✅ 3 rijen
```

### **Admin Dashboard**
- ✅ **Live** label in plaats van **Dummy**
- ✅ Echte data uit database
- ✅ CRUD operaties werken
- ✅ Statistieken tonen echte getallen

### **API Responses**
```json
// /api/admin/books
{
  "success": true,
  "books": [
    {
      "id": "...",
      "title": "Rich Dad Poor Dad",
      "author": "Robert Kiyosaki",
      // ...
    }
  ]
}
```

## 🎉 **Succes!**

Als alles werkt:
1. ✅ Database tabellen zijn aangemaakt
2. ✅ Sample data is ingevoerd
3. ✅ Admin dashboard toont "Live" data
4. ✅ API routes werken correct
5. ✅ Boekenkamer is klaar voor productie

## 🚀 **Volgende Stappen**

Nu de Boekenkamer database werkt, kunnen we:
1. **Frontend Boekenkamer** database integreren
2. **Aankondigingen** database setup
3. **Forum Moderatie** database setup
4. **Evenementenbeheer** database setup
5. **Voedingsplannen** database setup

## 📞 **Hulp Nodig?**

Als je problemen ondervindt:
1. Controleer de Supabase logs
2. Test de API routes individueel
3. Controleer de RLS policies
4. Verifieer de database connectie 