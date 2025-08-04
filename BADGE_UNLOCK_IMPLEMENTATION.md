# BadgeUnlockModal Implementatie

## Overzicht
De `BadgeUnlockModal` component is een React component die een visuele en auditieve animatie toont wanneer een gebruiker een badge ontgrendelt. De component is geïntegreerd in de "Badges en rangen" admin pagina.

## Functionaliteiten

### 1. Visuele Animatie
- **Fade-in + Scale animatie**: De modal verschijnt met een vloeiende fade-in en scale animatie
- **Badge animatie**: De badge voert een 360° rotatie uit met scale effect (0.5x → 1.2x → 1x)
- **Flexibele badge weergave**: Ondersteunt zowel emoji icons als PNG/SVG afbeeldingen
- **Vrijstaande badges**: PNG afbeeldingen worden getoond zonder achtergrond voor een professionele look
- **Glow effect**: Een pulserende glow animatie rond de badge
- **Sparkle effects**: 6 kleine sparkles die rond de modal verschijnen
- **Text animatie**: De tekst verschijnt met een delay en fade-in effect

### 2. Auditieve Feedback
- **Geluid**: Speelt een "ding" geluid af bij het openen van de modal
- **Web Audio API**: Gebruikt ingebouwde browser audio voor betrouwbare afspeling
- **User Interaction**: Audio wordt alleen afgespeeld na gebruikersinteractie (browser vereiste)
- **Volume controle**: Geluid wordt afgespeeld op 30% volume
- **Fallback**: Data URL fallback voor browsers zonder Web Audio API
- **Debug logging**: Console logs voor troubleshooting

### 3. Gebruikersinteractie
- **Auto-close**: Modal sluit automatisch na 4 seconden
- **Manual close**: Gebruiker kan de modal sluiten via de X knop of door buiten de modal te klikken
- **State management**: Voorkomt dat de animatie opnieuw afspeelt bij page refresh

## Technische Details

### Dependencies
- **Framer Motion**: Voor alle animaties
- **Web Audio API**: Voor unlock geluid (ingebouwd in browsers)
- **Heroicons**: Voor de close button icon
- **Tailwind CSS**: Voor styling

### Audio Implementation
- **Whoosh Sound**: Cinematic whoosh sound effect (`whoosh-cinematic-sound-effect-376889.mp3`)
- **Volume**: 40% volume voor optimale ervaring
- **User Interaction**: Vereist gebruikersinteractie voor audio (browser policy)
- **Fallback**: Data URL beep als whoosh bestand niet laadt
- **Error Handling**: Graceful degradation als audio faalt

### Animaties
- **Fade-in**: Modal verschijnt met fade-in effect
- **Scale animatie**: Badge schaalt van 0.3x naar 1.5x naar 1x (grotere animatie)
- **Rotatie**: 360° rotatie tijdens scale animatie
- **Glow effect**: Gradient glow die uitbreidt (0.8x → 2x → 3x) en vervaagt
- **Sparkles**: 6 sparkle effecten die verschijnen
- **Text animatie**: Text fade-in met delay
- **Badge grootte**: Originele afbeelding grootte (max 200px) behouden

### Props Interface
```typescript
interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    icon?: string;
    image?: string;
    description?: string;
  };
  hasUnlockedBadge?: boolean;
}
```

### State Management
- `audio`: Howl instance voor geluid
- `hasPlayed`: Boolean om te voorkomen dat geluid meerdere keren afspeelt

## Integratie

### Test Knop
Een test knop is toegevoegd aan de "Badges en rangen" admin pagina:
- Locatie: In de badge management sectie
- Tekst: "🎖️ Test Badge Unlock"
- Functionaliteit: Opent de BadgeUnlockModal met een voorbeeldbadge

### Voorbeeldbadge
```typescript
{
  name: "No Excuses",
  image: "/badge-no-excuses.png",
  description: "Je hebt 10 dagen achter elkaar geen excuus gebruikt! Consistentie is de sleutel tot succes."
}
```

## Styling
- **Dark theme**: Volledig in lijn met de bestaande admin dark theme
- **Responsive**: Werkt op alle schermformaten
- **Kleuren**: Gebruikt de project kleuren (`#8BAE5A`, `#B6C948`, `#181F17`)
- **Backdrop blur**: Moderne backdrop blur effect

## Bestandsstructuur
```
src/
├── components/
│   └── BadgeUnlockModal.tsx
├── app/
│   └── dashboard-admin/
│       └── badges-rangen/
│           └── page.tsx (aangepast)
└── public/
    └── whoosh-cinematic-sound-effect-376889.mp3
```

## Gebruik
```typescript
import BadgeUnlockModal from '../components/BadgeUnlockModal';

// In je component
const [isModalOpen, setIsModalOpen] = useState(false);

// Met icon (emoji)
<BadgeUnlockModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  badge={{
    name: "Badge Naam",
    icon: "🏆",
    description: "Badge beschrijving"
  }}
  hasUnlockedBadge={false}
/>

// Met image (PNG/SVG)
<BadgeUnlockModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  badge={{
    name: "Badge Naam",
    image: "/badge3.png",
    description: "Badge beschrijving"
  }}
  hasUnlockedBadge={false}
/>
```

## Toekomstige Verbeteringen
1. **Echte geluidsbestanden**: Vervang placeholder met echte .mp3 bestanden
2. **Database integratie**: Sla `hasUnlockedBadge` state op in database
3. **Meer animatie variaties**: Verschillende animaties voor verschillende badge types
4. **Geluid opties**: Gebruiker kan geluid aan/uit zetten
5. **Performance optimalisatie**: Lazy loading van audio bestanden 