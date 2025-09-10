#!/bin/bash

# Manual backup script om 50% prelaunch korting te verwijderen
# Uitvoering: ./manual-discount-removal.sh

echo "🚀 Manual Prelaunch Discount Removal Script"
echo "⏰ Tijd: $(date)"
echo ""

# Controleer of we in de juiste directory zijn
if [ ! -f "remove-prelaunch-discount.js" ]; then
    echo "❌ FOUT: remove-prelaunch-discount.js niet gevonden"
    echo "   Zorg dat je in de project root directory bent"
    exit 1
fi

echo "📝 Stap 1: Verwijderen 50% korting..."
node remove-prelaunch-discount.js

if [ $? -eq 0 ]; then
    echo "✅ Korting succesvol verwijderd"
else
    echo "❌ FOUT bij verwijderen korting"
    exit 1
fi

echo ""
echo "📝 Stap 2: Git commit..."
git add .
git commit -m "MANUAL: Remove 50% prelaunch discount - implement normal pricing

- Basic Tier: €24.50 → €49 (6mnd), €22 → €44 (12mnd)  
- Premium Tier: €39.50 → €79 (6mnd), €35.50 → €71 (12mnd)
- Lifetime Tier: €997.50 → €1995
- Updated all payment APIs and Mollie links
- Removed all 50% discount references
- Set discount_percentage to 0% in database"

if [ $? -eq 0 ]; then
    echo "✅ Git commit succesvol"
else
    echo "❌ FOUT bij git commit"
    exit 1
fi

echo ""
echo "📝 Stap 3: Git push..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Git push succesvol"
    echo ""
    echo "🎉 SUCCES! Prelaunch korting handmatig verwijderd"
    echo "📊 Normale prijzen zijn nu actief op de live website"
    echo "⏰ Voltooid om: $(date)"
else
    echo "❌ FOUT bij git push"
    exit 1
fi
