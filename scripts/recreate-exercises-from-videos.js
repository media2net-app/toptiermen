require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Oefening data op basis van video namen
const exerciseData = {
  'Abdominal Crunch.mp4': {
    name: 'Abdominal Crunch',
    description: 'Een effectieve buikspieroefening voor het trainen van de rectus abdominis',
    muscle_group: 'Buikspieren',
    equipment: 'Geen',
    difficulty: 'Beginner',
    instructions: 'Ga op je rug liggen met je knieën gebogen. Plaats je handen achter je hoofd. Til je schouders en bovenrug van de grond door je buikspieren aan te spannen. Houd de positie kort vast en laat je langzaam zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Abductie Machine.mp4': {
    name: 'Abductie Machine',
    description: 'Train je buitenste dijspieren met de abductie machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je rug tegen de rugleuning. Plaats je benen tegen de pads. Duw je benen naar buiten tegen de weerstand van de machine. Houd de positie kort vast en laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Adductie Machine.mp4': {
    name: 'Adductie Machine',
    description: 'Train je binnenste dijspieren met de adductie machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je rug tegen de rugleuning. Plaats je benen tegen de pads. Trek je benen naar binnen tegen de weerstand van de machine. Houd de positie kort vast en laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Barbel Row Rug.mp4': {
    name: 'Barbell Row',
    description: 'Een compound oefening voor het trainen van je rugspieren',
    muscle_group: 'Rug',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Sta met je voeten op schouderbreedte en buig voorover met een rechte rug. Pak de barbell met een overhandse greep. Trek de barbell naar je buik terwijl je je schouderbladen samenknijpt. Laat de barbell gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Biceps Curl Barbell.mp4': {
    name: 'Barbell Biceps Curl',
    description: 'Train je biceps met een barbell',
    muscle_group: 'Biceps',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    instructions: 'Sta rechtop met je voeten op schouderbreedte. Houd de barbell met een onderhandse greep op schouderbreedte. Buig je ellebogen en til de barbell naar je schouders. Laat de barbell gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Biceps Curl Dumbells.mp4': {
    name: 'Dumbbell Biceps Curl',
    description: 'Train je biceps met dumbbells',
    muscle_group: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Sta rechtop met je voeten op schouderbreedte. Houd een dumbbell in elke hand met je armen gestrekt naar beneden. Buig je ellebogen en til de dumbbells naar je schouders. Laat de dumbbells gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Booty Builder.mp4': {
    name: 'Booty Builder',
    description: 'Specifieke oefening voor het trainen van je bilspieren',
    muscle_group: 'Bilspieren',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en plaats je voeten op de voetplaten. Duw je benen naar achteren tegen de weerstand van de machine. Focus op het aanspannen van je bilspieren. Laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Cabel Flye Borst.mp4': {
    name: 'Cable Flye',
    description: 'Train je borstspieren met kabels',
    muscle_group: 'Borst',
    equipment: 'Cable Machine',
    difficulty: 'Intermediate',
    instructions: 'Sta in het midden van de cable machine met je armen gestrekt naar de zijkanten. Breng je armen naar elkaar toe in een boogvormige beweging. Houd de spanning op je borstspieren. Laat je armen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Cabel Row Rug.mp4': {
    name: 'Cable Row',
    description: 'Train je rugspieren met een cable machine',
    muscle_group: 'Rug',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de handgreep. Trek de handgreep naar je buik terwijl je je schouderbladen samenknijpt. Houd je rug recht en je borst omhoog. Laat de handgreep gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Cabel pull touw voor rug.mp4': {
    name: 'Cable Pull Rope',
    description: 'Train je rugspieren met een touw aan de cable machine',
    muscle_group: 'Rug',
    equipment: 'Cable Machine',
    difficulty: 'Intermediate',
    instructions: 'Sta voor de cable machine en pak het touw met beide handen. Trek het touw naar je borst terwijl je je schouderbladen samenknijpt. Houd je rug recht en je borst omhoog. Laat het touw gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Calf Press.mp4': {
    name: 'Calf Press',
    description: 'Train je kuitspieren met de leg press machine',
    muscle_group: 'Kuiten',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de leg press machine zitten en plaats je voeten op de voetplaten. Duw je tenen naar beneden om je kuitspieren aan te spannen. Houd de positie kort vast en laat je voeten gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Calf Raises.mp4': {
    name: 'Calf Raises',
    description: 'Klassieke oefening voor het trainen van je kuitspieren',
    muscle_group: 'Kuiten',
    equipment: 'Geen',
    difficulty: 'Beginner',
    instructions: 'Sta rechtop met je voeten op schouderbreedte. Til je hielen van de grond door op je tenen te gaan staan. Houd de positie kort vast en laat je hielen gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Deadlift.mp4': {
    name: 'Deadlift',
    description: 'Een van de meest effectieve compound oefeningen',
    muscle_group: 'Rug',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Sta met je voeten op schouderbreedte voor de barbell. Buig je knieën en pak de barbell met een overhandse greep. Til de barbell op door je benen en rug te strekken. Houd je rug recht gedurende de hele beweging. Laat de barbell gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Dumbell Flyes.mp4': {
    name: 'Dumbbell Flyes',
    description: 'Train je borstspieren met dumbbells',
    muscle_group: 'Borst',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Ga op een bank liggen met je armen gestrekt naar boven. Laat je armen gecontroleerd naar de zijkanten zakken in een boogvormige beweging. Breng je armen terug naar de startpositie. Focus op het aanspannen van je borstspieren. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Dumbell Press.mp4': {
    name: 'Dumbbell Press',
    description: 'Train je borstspieren met dumbbells',
    muscle_group: 'Borst',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Ga op een bank liggen met dumbbells op schouderhoogte. Duw de dumbbells naar boven tot je armen gestrekt zijn. Laat de dumbbells gecontroleerd zakken naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Front Raises.mp4': {
    name: 'Front Raises',
    description: 'Train je voorste schouderspieren',
    muscle_group: 'Schouders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Sta rechtop met dumbbells in je handen voor je lichaam. Til de dumbbells naar voren tot schouderhoogte. Houd de positie kort vast en laat de dumbbells gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Hack Squat.mp4': {
    name: 'Hack Squat',
    description: 'Train je benen met de hack squat machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    instructions: 'Ga op de hack squat machine staan met je schouders tegen de pads. Laat je lichaam gecontroleerd zakken door je knieën te buigen. Duw jezelf terug omhoog naar de startpositie. Focus op het aanspannen van je beenspieren. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Incline Chest press.mp4': {
    name: 'Incline Chest Press',
    description: 'Train je bovenste borstspieren',
    muscle_group: 'Borst',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    instructions: 'Ga op de incline machine zitten met je rug tegen de rugleuning. Duw de handgrepen naar voren tot je armen gestrekt zijn. Laat de handgrepen gecontroleerd terugkomen. Focus op het aanspannen van je bovenste borstspieren. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Kneeling leg curl.mp4': {
    name: 'Kneeling Leg Curl',
    description: 'Train je hamstrings met de leg curl machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine liggen met je knieën op de pad. Buig je knieën om je hielen naar je billen te brengen. Houd de positie kort vast en laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Lat Pull Down.mp4': {
    name: 'Lat Pulldown',
    description: 'Train je latissimus dorsi spieren',
    muscle_group: 'Rug',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de stang met een brede greep. Trek de stang naar je borst terwijl je je schouderbladen samenknijpt. Laat de stang gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Lateral Raise.mp4': {
    name: 'Lateral Raises',
    description: 'Train je middelste schouderspieren',
    muscle_group: 'Schouders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Sta rechtop met dumbbells in je handen naast je lichaam. Til de dumbbells naar de zijkanten tot schouderhoogte. Houd de positie kort vast en laat de dumbbells gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Leg Curl.mp4': {
    name: 'Leg Curl',
    description: 'Train je hamstrings met de leg curl machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine liggen met je enkels onder de pads. Buig je knieën om je hielen naar je billen te brengen. Houd de positie kort vast en laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Leg Raises.mp4': {
    name: 'Leg Raises',
    description: 'Train je onderste buikspieren',
    muscle_group: 'Buikspieren',
    equipment: 'Geen',
    difficulty: 'Intermediate',
    instructions: 'Ga op je rug liggen met je armen naast je lichaam. Til je benen gestrekt omhoog tot ze loodrecht op de grond staan. Laat je benen gecontroleerd zakken zonder de grond aan te raken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Lower Back Extensie.mp4': {
    name: 'Lower Back Extension',
    description: 'Train je onderrugspieren',
    muscle_group: 'Rug',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine liggen met je heupen tegen de pad. Til je bovenlichaam omhoog door je onderrugspieren aan te spannen. Houd de positie kort vast en laat je lichaam gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Machine Back Extensie.mp4': {
    name: 'Machine Back Extension',
    description: 'Train je rugspieren met een machine',
    muscle_group: 'Rug',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je rug tegen de rugleuning. Duw je rug naar achteren tegen de weerstand van de machine. Houd de positie kort vast en laat je rug gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Machine Biceps Curl.mp4': {
    name: 'Machine Biceps Curl',
    description: 'Train je biceps met een machine',
    muscle_group: 'Biceps',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de handgrepen. Buig je ellebogen om de handgrepen naar je schouders te brengen. Laat de handgrepen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Machine Chest Press.mp4': {
    name: 'Machine Chest Press',
    description: 'Train je borstspieren met een machine',
    muscle_group: 'Borst',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je rug tegen de rugleuning. Duw de handgrepen naar voren tot je armen gestrekt zijn. Laat de handgrepen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Machine Pull Up.mp4': {
    name: 'Machine Pull Up',
    description: 'Train je rugspieren met een pull-up machine',
    muscle_group: 'Rug',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    instructions: 'Ga op de machine staan en pak de handgrepen. Trek je lichaam omhoog tot je kin boven de handgrepen is. Laat je lichaam gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Machine Shoulder Press.mp4': {
    name: 'Machine Shoulder Press',
    description: 'Train je schouderspieren met een machine',
    muscle_group: 'Schouders',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je rug tegen de rugleuning. Duw de handgrepen naar boven tot je armen gestrekt zijn. Laat de handgrepen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Pectoral Fly.mp4': {
    name: 'Pectoral Fly',
    description: 'Train je borstspieren met een fly machine',
    muscle_group: 'Borst',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je armen gestrekt naar de zijkanten. Breng je armen naar elkaar toe in een boogvormige beweging. Laat je armen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Push Up.mp4': {
    name: 'Push Up',
    description: 'Klassieke oefening voor het trainen van je borstspieren',
    muscle_group: 'Borst',
    equipment: 'Geen',
    difficulty: 'Beginner',
    instructions: 'Ga in een plank positie staan met je handen op schouderbreedte. Laat je lichaam zakken door je ellebogen te buigen. Duw je lichaam terug omhoog naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Seated Dip.mp4': {
    name: 'Seated Dip',
    description: 'Train je triceps met een dip machine',
    muscle_group: 'Triceps',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de handgrepen. Duw je lichaam omhoog door je armen te strekken. Laat je lichaam gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Seated Leg Curl.mp4': {
    name: 'Seated Leg Curl',
    description: 'Train je hamstrings in zittende positie',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je benen onder de pads. Buig je knieën om je hielen naar je billen te brengen. Laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Seated Row.mp4': {
    name: 'Seated Row',
    description: 'Train je rugspieren in zittende positie',
    muscle_group: 'Rug',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de handgreep. Trek de handgreep naar je buik terwijl je je schouderbladen samenknijpt. Laat de handgreep gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Shoulder Press Dumbells.mp4': {
    name: 'Dumbbell Shoulder Press',
    description: 'Train je schouderspieren met dumbbells',
    muscle_group: 'Schouders',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Sta rechtop met dumbbells op schouderhoogte. Duw de dumbbells naar boven tot je armen gestrekt zijn. Laat de dumbbells gecontroleerd zakken naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Side Raises.mp4': {
    name: 'Side Raises',
    description: 'Train je middelste schouderspieren',
    muscle_group: 'Schouders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Sta rechtop met dumbbells in je handen naast je lichaam. Til de dumbbells naar de zijkanten tot schouderhoogte. Houd de positie kort vast en laat de dumbbells gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Squatten.mp4': {
    name: 'Squat',
    description: 'De koning van alle oefeningen voor het trainen van je benen',
    muscle_group: 'Benen',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Sta met je voeten op schouderbreedte en een barbell op je schouders. Buig je knieën en laat je lichaam zakken alsof je gaat zitten. Houd je rug recht en je knieën in lijn met je tenen. Duw jezelf terug omhoog naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Stiff Deadlift.mp4': {
    name: 'Stiff Leg Deadlift',
    description: 'Train je hamstrings en onderrug',
    muscle_group: 'Benen',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Sta met je voeten op schouderbreedte en een barbell voor je. Buig voorover met gestrekte benen en pak de barbell. Til de barbell op door je rug te strekken. Houd je benen gestrekt gedurende de hele beweging. Laat de barbell gecontroleerd zakken. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Supine Press.mp4': {
    name: 'Supine Press',
    description: 'Train je borstspieren in liggende positie',
    muscle_group: 'Borst',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Ga op je rug liggen met dumbbells op schouderhoogte. Duw de dumbbells naar boven tot je armen gestrekt zijn. Laat de dumbbells gecontroleerd zakken naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'T Bar roeien machine.mp4': {
    name: 'T-Bar Row',
    description: 'Train je rugspieren met een T-bar machine',
    muscle_group: 'Rug',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    instructions: 'Ga op de machine staan en pak de handgrepen. Trek de handgrepen naar je buik terwijl je je schouderbladen samenknijpt. Houd je rug recht. Laat de handgrepen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Vaste Lat Pulldown.mp4': {
    name: 'Fixed Lat Pulldown',
    description: 'Train je latissimus dorsi met een vaste stang',
    muscle_group: 'Rug',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de vaste stang. Trek de stang naar je borst terwijl je je schouderbladen samenknijpt. Laat de stang gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'Walking Lunges.mp4': {
    name: 'Walking Lunges',
    description: 'Train je benen met lopende lunges',
    muscle_group: 'Benen',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Sta rechtop met dumbbells in je handen. Stap naar voren met één been en buig beide knieën. Duw jezelf terug omhoog en stap naar voren met het andere been. Herhaal voor het gewenste aantal herhalingen.'
  },
  'bankdrukken.mp4': {
    name: 'Bench Press',
    description: 'Klassieke oefening voor het trainen van je borstspieren',
    muscle_group: 'Borst',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Ga op een bank liggen met een barbell op schouderhoogte. Duw de barbell naar boven tot je armen gestrekt zijn. Laat de barbell gecontroleerd zakken naar je borst. Herhaal voor het gewenste aantal herhalingen.'
  },
  'biceps cabel.mp4': {
    name: 'Cable Biceps Curl',
    description: 'Train je biceps met een cable machine',
    muscle_group: 'Biceps',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Sta voor de cable machine en pak de handgreep met een onderhandse greep. Buig je elleboog om de handgreep naar je schouder te brengen. Laat de handgreep gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'leg extensie.mp4': {
    name: 'Leg Extension',
    description: 'Train je quadriceps met de leg extension machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten met je enkels onder de pads. Strek je knieën om je benen omhoog te duwen. Houd de positie kort vast en laat je benen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'legg press.mp4': {
    name: 'Leg Press',
    description: 'Train je benen met de leg press machine',
    muscle_group: 'Benen',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    instructions: 'Ga op de machine zitten met je voeten op de voetplaten. Duw de voetplaten weg door je benen te strekken. Laat de voetplaten gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'militairy press.mp4': {
    name: 'Military Press',
    description: 'Train je schouderspieren met een barbell',
    muscle_group: 'Schouders',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Sta rechtop met een barbell op schouderhoogte. Duw de barbell naar boven tot je armen gestrekt zijn. Laat de barbell gecontroleerd zakken naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'schouder press barbell.mp4': {
    name: 'Barbell Shoulder Press',
    description: 'Train je schouderspieren met een barbell',
    muscle_group: 'Schouders',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: 'Sta rechtop met een barbell op schouderhoogte. Duw de barbell naar boven tot je armen gestrekt zijn. Laat de barbell gecontroleerd zakken naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  },
  'triceps extension apparaat.mp4': {
    name: 'Triceps Extension Machine',
    description: 'Train je triceps met een machine',
    muscle_group: 'Triceps',
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: 'Ga op de machine zitten en pak de handgrepen. Strek je armen om de handgrepen naar beneden te duwen. Laat de handgrepen gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'triceps kabel rechte stang.mp4': {
    name: 'Cable Triceps Pushdown',
    description: 'Train je triceps met een rechte stang aan de cable machine',
    muscle_group: 'Triceps',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    instructions: 'Sta voor de cable machine en pak de rechte stang met een overhandse greep. Duw de stang naar beneden door je armen te strekken. Laat de stang gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'triceps rope cabel.mp4': {
    name: 'Cable Triceps Rope',
    description: 'Train je triceps met een touw aan de cable machine',
    muscle_group: 'Triceps',
    equipment: 'Cable Machine',
    difficulty: 'Intermediate',
    instructions: 'Sta voor de cable machine en pak het touw met beide handen. Duw het touw naar beneden door je armen te strekken. Laat het touw gecontroleerd terugkomen. Herhaal voor het gewenste aantal herhalingen.'
  },
  'tricpes dips_.mp4': {
    name: 'Triceps Dips',
    description: 'Train je triceps met dips',
    muscle_group: 'Triceps',
    equipment: 'Dip Bars',
    difficulty: 'Advanced',
    instructions: 'Ga op de dip bars staan met je armen gestrekt. Laat je lichaam zakken door je ellebogen te buigen. Duw je lichaam terug omhoog naar de startpositie. Herhaal voor het gewenste aantal herhalingen.'
  }
};

async function recreateExercisesFromVideos() {
  console.log('🚀 RECREATE EXERCISES FROM VIDEOS');
  console.log('==================================');
  
  try {
    // 1. Verwijder alle bestaande oefeningen
    console.log('\n🗑️  Verwijderen van alle bestaande oefeningen...');
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .gte('created_at', '1900-01-01'); // Delete all

    if (deleteError) {
      console.error('❌ Fout bij verwijderen oefeningen:', deleteError);
      return;
    }
    console.log('✅ Alle bestaande oefeningen verwijderd');

    // 2. Haal video bestanden op
    const videoDir = path.join(process.cwd(), 'public', 'video-oefeningen');
    const videoFiles = fs.readdirSync(videoDir)
      .filter(file => file.toLowerCase().endsWith('.mp4'))
      .sort();

    console.log(`\n📁 ${videoFiles.length} video bestanden gevonden`);

    // 3. Maak nieuwe oefeningen aan
    console.log('\n➕ Aanmaken van nieuwe oefeningen...');
    let createdCount = 0;
    let linkedCount = 0;

    for (const videoFile of videoFiles) {
      const exerciseInfo = exerciseData[videoFile];
      
      if (!exerciseInfo) {
        console.log(`⚠️  Geen data gevonden voor: ${videoFile}`);
        continue;
      }

      // Maak oefening aan (met primary_muscle kolom)
      const { data: exercise, error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: exerciseInfo.name,
          primary_muscle: exerciseInfo.muscle_group,
          equipment: exerciseInfo.equipment,
          difficulty: exerciseInfo.difficulty,
          instructions: exerciseInfo.instructions,
          video_url: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1]}/storage/v1/object/public/workout-videos/exercises/${videoFile}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error(`❌ Fout bij aanmaken ${exerciseInfo.name}:`, insertError);
        continue;
      }

      createdCount++;
      linkedCount++;
      console.log(`✅ ${exerciseInfo.name} aangemaakt en gekoppeld aan ${videoFile}`);
    }

    console.log('\n📊 SAMENVATTING:');
    console.log('================');
    console.log(`✅ Oefeningen aangemaakt: ${createdCount}`);
    console.log(`🔗 Videos gekoppeld: ${linkedCount}`);
    console.log(`📁 Totaal verwerkt: ${videoFiles.length}`);

    if (createdCount > 0) {
      console.log('\n🎉 Alle oefeningen succesvol aangemaakt en gekoppeld!');
      console.log('💡 Je kunt nu de oefeningen bekijken in de admin interface.');
    }

  } catch (error) {
    console.error('❌ Fout bij recreaten oefeningen:', error);
  }
}

recreateExercisesFromVideos().catch(console.error);
