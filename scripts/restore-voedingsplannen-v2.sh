#!/bin/bash

# Script om Voedingsplannen V2 te herstellen naar de werkende versie
# Gebruik: ./scripts/restore-voedingsplannen-v2.sh

echo "🔄 Herstellen van Voedingsplannen V2 naar werkende versie..."

# Controleer of backup bestaat
if [ ! -f "src/app/dashboard/voedingsplannen-v2/page.tsx.HUIDIG_WERKEND" ]; then
    echo "❌ Backup bestand niet gevonden: page.tsx.HUIDIG_WERKEND"
    exit 1
fi

# Maak backup van huidige versie
echo "📦 Maken van backup van huidige versie..."
cp src/app/dashboard/voedingsplannen-v2/page.tsx src/app/dashboard/voedingsplannen-v2/page.tsx.backup.$(date +%Y%m%d_%H%M%S)

# Herstel vanuit werkende versie
echo "🔄 Herstellen vanuit werkende versie..."
cp src/app/dashboard/voedingsplannen-v2/page.tsx.HUIDIG_WERKEND src/app/dashboard/voedingsplannen-v2/page.tsx

echo "✅ Voedingsplannen V2 hersteld naar werkende versie!"
echo "📋 Controleer of de volgende functionaliteiten werken:"
echo "   - Profiel balk is zichtbaar"
echo "   - Bewerk Profiel knop werkt"
echo "   - Cards tonen target vs personalized calories"
echo "   - Macro breakdown is zichtbaar"
echo ""
echo "🚀 Start development server om te testen:"
echo "   npm run dev"
