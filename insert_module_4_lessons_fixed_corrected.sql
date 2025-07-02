-- Insert lessons for module 4: Finance & Business (Fixed and Corrected version)
-- Run this SQL in your Supabase SQL editor
-- This script tries multiple possible module titles

-- First, let's check what the actual module title is
SELECT id, title FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%';

-- Insert lessons using the correct module ID
-- Replace 'Finance & Business' with the actual title from your database

INSERT INTO academy_lessons (
    module_id,
    title,
    duration,
    type,
    status,
    order_index,
    views,
    completion_rate,
    video_url,
    content,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%' LIMIT 1),
    'Financiële Basis Begrippen',
    '30m',
    'video',
    'published',
    1,
    0,
    0,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%' LIMIT 1),
    'Budgetteren en Geld Management',
    '25m',
    'text',
    'published',
    2,
    0,
    0,
    '',
    '<h2>Budgetteren en Geld Management: De Fundering van Financiële Vrijheid</h2>

<p>Budgetteren is niet saai - het is je roadmap naar financiële vrijheid. Leer hoe je controle krijgt over je geld en bewuste keuzes maakt.</p>

<h3>Waarom Budgetteren Zo Belangrijk Is:</h3>
<ul>
<li>Geeft je controle over je financiën</li>
<li>Helpt je doelen te bereiken</li>
<li>Vermindert financiële stress</li>
<li>Maakt je bewust van uitgavenpatronen</li>
<li>Bereidt je voor op onverwachte uitgaven</li>
</ul>

<h3>De 50/30/20 Regel:</h3>
<p>Een eenvoudige maar effectieve budgetmethode:</p>
<ul>
<li><strong>50% - Essentiële Uitgaven:</strong> Huur, boodschappen, transport, verzekeringen</li>
<li><strong>30% - Lifestyle:</strong> Entertainment, uitgaan, hobbies, kleding</li>
<li><strong>20% - Financiële Doelen:</strong> Sparen, investeren, schulden aflossen</li>
</ul>

<h3>Praktische Budgettering:</h3>

<h4>1. Zero-Based Budget</h4>
<p>Geef elke euro een doel voordat de maand begint:</p>
<ol>
<li>Tel al je inkomsten op</li>
<li>Plan alle uitgaven</li>
<li>Zorg dat inkomen - uitgaven = 0</li>
<li>Track elke uitgave</li>
<li>Pas aan waar nodig</li>
</ol>

<h4>2. Envelope Systeem</h4>
<p>Voor cash-gebruikers:</p>
<ul>
<li>Maak enveloppen voor elke uitgavencategorie</li>
<li>Stop het budgetteerde bedrag in elke envelop</li>
<li>Gebruik alleen het geld uit de juiste envelop</li>
<li>Als een envelop leeg is, wacht tot volgende maand</li>
</ul>

<h4>3. Digitale Budget Apps</h4>
<p>Populaire opties:</p>
<ul>
<li>YNAB (You Need A Budget)</li>
<li>Mint</li>
<li>Personal Capital</li>
<li>Excel/Google Sheets</li>
</ul>

<h3>Uitgaven Categoriseren:</h3>

<h4>Vaste Uitgaven (Essentieel):</h4>
<ul>
<li>Huur/hypotheek</li>
<li>Verzekeringen</li>
<li>Basis boodschappen</li>
<li>Transport (OV of benzine)</li>
<li>Basis utilities</li>
</ul>

<h4>Variabele Uitgaven (Essentieel):</h4>
<ul>
<li>Extra boodschappen</li>
<li>Kleding (basis)</li>
<li>Medische kosten</li>
<li>Onderhoud huis/auto</li>
</ul>

<h4>Discretionaire Uitgaven (Lifestyle):</h4>
<ul>
<li>Entertainment</li>
<li>Uit eten</li>
<li>Hobbies</li>
<li>Luxe items</li>
<li>Vakanties</li>
</ul>

<h3>Geld Management Strategieën:</h3>

<h4>1. Emergency Fund</h4>
<p>Bouw een noodfonds op van 3-6 maanden uitgaven:</p>
<ul>
<li>Begin met €1000</li>
<li>Bouw op naar 3 maanden uitgaven</li>
<li>Uiteindelijk 6 maanden voor volledige veiligheid</li>
<li>Houd in een aparte spaarrekening</li>
</ul>

<h4>2. Automatiseren</h4>
<p>Maak geld management automatisch:</p>
<ul>
<li>Automatische overboekingen naar spaarrekening</li>
<li>Automatische betalingen voor vaste lasten</li>
<li>Automatische investeringen</li>
<li>Automatische budget tracking</li>
</ul>

<h4>3. Cash Flow Management</h4>
<p>Zorg dat je altijd geld hebt:</p>
<ul>
<li>Plan voor onregelmatige inkomsten</li>
<li>Houd rekening met seizoensuitgaven</li>
<li>Plan voor grote uitgaven (belastingen, verzekeringen)</li>
<li>Gebruik sinking funds voor grote aankopen</li>
</ul>

<h3>Veelgemaakte Budgettering Fouten:</h3>
<ul>
<li>Te complexe systemen</li>
<li>Niet realistisch zijn</li>
<li>Geen buffer inbouwen</li>
<li>Niet regelmatig reviewen</li>
<li>Geen doelen stellen</li>
<li>Te streng zijn met jezelf</li>
</ul>

<h3>Budgettering Tips:</h3>

<h4>1. Begin Klein</h4>
<p>Begin met één categorie en breid uit.</p>

<h4>2. Wees Realistisch</h4>
<p>Stel doelen die je kunt halen.</p>

<h4>3. Review Regelmatig</h4>
<p>Check je budget wekelijks/maandelijks.</p>

<h4>4. Vier Successen</h4>
<p>Beloon jezelf voor het halen van doelen.</p>

<h4>5. Blijf Flexibel</h4>
<p>Pas je budget aan wanneer nodig.</p>

<h3>Tools en Hulpmiddelen:</h3>

<h4>Gratis Opties:</h4>
<ul>
<li>Excel/Google Sheets templates</li>
<li>Mint (gratis versie)</li>
<li>Bank apps met categorisering</li>
<li>Pen en papier</li>
</ul>

<h4>Betaalde Opties:</h4>
<ul>
<li>YNAB (€12/maand)</li>
<li>Personal Capital (gratis + premium)</li>
<li>Quicken</li>
<li>Custom software</li>
</ul>

<h3>Volgende Stappen:</h3>
<ol>
<li>Begin met het tracken van je huidige uitgaven</li>
<li>Maak een basis budget</li>
<li>Implementeer één nieuwe strategie</li>
<li>Bouw je emergency fund op</li>
<li>Stel financiële doelen</li>
</ol>

<p><strong>Onthoud:</strong> Budgetteren is een vaardigheid die je ontwikkelt. Begin vandaag en wees geduldig met jezelf.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%' LIMIT 1),
    'Investeren voor Beginners',
    '35m',
    'text',
    'published',
    3,
    0,
    0,
    '',
    '<h2>Investeren voor Beginners: Bouw Je Vermogen Op</h2>

<p>Investeren is de sleutel tot financiële vrijheid. Leer hoe je veilig en slim kunt beginnen met beleggen.</p>

<h3>Waarom Investeren Belangrijk Is:</h3>
<ul>
<li>Verslaat inflatie</li>
<li>Bouwt vermogen op</li>
<li>Creëert passief inkomen</li>
<li>Zorgt voor financiële vrijheid</li>
<li>Bereidt je voor op pensioen</li>
</ul>

<h3>De Kracht van Samengestelde Interest:</h3>
<p>"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who does not, pays it." - Albert Einstein</p>

<p><strong>Voorbeeld:</strong> €1000 investeren met 7% rendement per jaar:</p>
<ul>
<li>Na 10 jaar: €1967</li>
<li>Na 20 jaar: €3869</li>
<li>Na 30 jaar: €7612</li>
<li>Na 40 jaar: €14,974</li>
</ul>

<h3>Investeringsprincipes voor Beginners:</h3>

<h4>1. Diversificatie</h4>
<p>Verspreid je risico over verschillende investeringen:</p>
<ul>
<li>Verschillende sectoren</li>
<li>Verschillende landen</li>
<li>Verschillende asset classes</li>
<li>Verschillende bedrijven</li>
</ul>

<h4>2. Dollar-Cost Averaging</h4>
<p>Investeer regelmatig kleine bedragen:</p>
<ul>
<li>Vermindert timing risico</li>
<li>Automatiseert je investeringen</li>
<li>Maakt gebruik van marktvolatiliteit</li>
<li>Bouwt discipline op</li>
</ul>

<h4>3. Long-term Mindset</h4>
<p>Denk in jaren, niet in dagen:</p>
<ul>
<li>Markten fluctueren op korte termijn</li>
<li>Historisch gezien stijgen markten</li>
<li>Time in the market > timing the market</li>
<li>Blijf geïnvesteerd tijdens downturns</li>
</ul>

<h3>Investeringsopties voor Beginners:</h3>

<h4>1. Index Funds/ETFs</h4>
<p>De beste optie voor beginners:</p>
<ul>
<li>Lage kosten</li>
<li>Automatische diversificatie</li>
<li>Volgt de markt</li>
<li>Minimale kennis vereist</li>
<li>Liquide (makkelijk te verkopen)</li>
</ul>

<h4>2. Robo-Advisors</h4>
<p>Automatische portfoliobeheer:</p>
<ul>
<li>Nederlandse opties: Peaks, Brand New Day</li>
<li>Lage kosten</li>
<li>Automatische rebalancing</li>
<li>Belastingoptimalisatie</li>
<li>Gebruiksvriendelijk</li>
</ul>

<h4>3. Pensioenproducten</h4>
<p>Fiscaal voordelige opties:</p>
<ul>
<li>Pensioensparen</li>
<li>Lijfrente</li>
<li>Fiscale voordelen</li>
<li>Langetermijn focus</li>
</ul>

<h4>4. Crowdfunding</h4>
<p>Investeren in startups/onroerend goed:</p>
<ul>
<li>Hoger risico</li>
<li>Potentieel hoger rendement</li>
<li>Diversificatie mogelijk</li>
<li>Platforms: Collin Crowdfund, Fundwise</li>
</ul>

<h3>Risico en Rendement:</h3>

<h4>Risicoprofielen:</h4>
<ul>
<li><strong>Conservatief:</strong> 20% aandelen, 80% obligaties</li>
<li><strong>Gematigd:</strong> 60% aandelen, 40% obligaties</li>
<li><strong>Agressief:</strong> 80% aandelen, 20% obligaties</li>
</ul>

<h4>Asset Allocation per Leeftijd:</h4>
<p>Regel van 110: 110 - je leeftijd = % in aandelen</p>
<ul>
<li>25 jaar: 85% aandelen</li>
<li>35 jaar: 75% aandelen</li>
<li>45 jaar: 65% aandelen</li>
<li>55 jaar: 55% aandelen</li>
</ul>

<h3>Praktische Investeringsstrategie:</h3>

<h4>Stap 1: Emergency Fund</h4>
<p>Bouw eerst een noodfonds op van 3-6 maanden uitgaven.</p>

<h4>Stap 2: Schulden Aflossen</h4>
<p>Los eerst hoge-rente schulden af (creditcards, persoonlijke leningen).</p>

<h4>Stap 3: Begin met Index Funds</h4>
<p>Investeer in breed gespreide index funds:</p>
<ul>
<li>Vanguard FTSE All-World UCITS ETF</li>
<li>iShares MSCI World UCITS ETF</li>
<li>SPDR MSCI World UCITS ETF</li>
</ul>

<h4>Stap 4: Automatiseer</h4>
<p>Zet automatische overboekingen op voor regelmatige investeringen.</p>

<h4>Stap 5: Herbalanceer</h4>
<p>Controleer en pas je portefeuille jaarlijks aan.</p>

<h3>Veelgemaakte Investeringsfouten:</h3>
<ul>
<li>Te veel in één investering</li>
<li>Emotioneel handelen</li>
<li>Proberen de markt te timen</li>
<li>Te hoge kosten</li>
<li>Niet diversificeren</li>
<li>Te veel aandacht voor nieuws</li>
<li>Niet regelmatig investeren</li>
</ul>

<h3>Investeringsplatforms in Nederland:</h3>

<h4>Brokers:</h4>
<ul>
<li>DeGiro (lage kosten)</li>
<li>BinckBank</li>
<li>Lynx</li>
<li>Interactive Brokers</li>
</ul>

<h4>Robo-Advisors:</h4>
<ul>
<li>Peaks</li>
<li>Brand New Day</li>
<li>Wealthify</li>
<li>Moneyou</li>
</ul>

<h3>Belastingen en Investeren:</h3>
<ul>
<li>Vermogensrendementsheffing vanaf €50,000</li>
<li>Box 3 belasting op vermogen</li>
<li>Fiscaal voordelige opties gebruiken</li>
<li>Pensioenproducten voor belastingvoordelen</li>
</ul>

<h3>Monitoring en Review:</h3>
<ul>
<li>Check je portefeuille maandelijks</li>
<li>Herbalanceer jaarlijks</li>
<li>Pas je strategie aan bij levensveranderingen</li>
<li>Blijf leren over investeren</li>
</ul>

<p><strong>Onthoud:</strong> Investeren is een marathon, geen sprint. Begin vroeg, investeer regelmatig en blijf geduldig.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%' LIMIT 1),
    'Ondernemerschap en Business',
    '40m',
    'video',
    'published',
    4,
    0,
    0,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%' LIMIT 1),
    'Passief Inkomen Opbouwen',
    '30m',
    'text',
    'published',
    5,
    0,
    0,
    '',
    '<h2>Passief Inkomen Opbouwen: De Weg naar Financiële Vrijheid</h2>

<p>Passief inkomen is geld dat je verdient zonder actief te werken. Het is de sleutel tot financiële vrijheid en tijd voor wat echt belangrijk is.</p>

<h3>Wat is Passief Inkomen?</h3>
<p>Inkomen dat je verdient zonder directe, continue inspanning:</p>
<ul>
<li>Werkt voor je terwijl je slaapt</li>
<li>Schalbaar en duurzaam</li>
<li>Vereist initiële investering (tijd/geld)</li>
<li>Kan meerdere inkomstenstromen creëren</li>
</ul>

<h3>Voordelen van Passief Inkomen:</h3>
<ul>
<li>Financiële vrijheid</li>
<li>Meer tijd voor familie en hobbies</li>
<li>Diversificatie van inkomsten</li>
<li>Bescherming tegen baanverlies</li>
<li>Mogelijkheid om te doen wat je leuk vindt</li>
<li>Geografische vrijheid</li>
</ul>

<h3>Passief Inkomen Strategieën:</h3>

<h4>1. Dividend Investeren</h4>
<p>Investeren in bedrijven die dividend uitkeren:</p>
<ul>
<li>Regelmatige inkomsten</li>
<li>Potentiële groei van dividend</li>
<li>Belastingvoordelen mogelijk</li>
<li>Voorbeelden: Shell, Unilever, Philips</li>
</ul>

<h4>2. Onroerend Goed</h4>
<p>Verhuren van vastgoed:</p>
<ul>
<li>Maandelijkse huurinkomsten</li>
<li>Waardestijging van vastgoed</li>
<li>Leverage met hypotheken</li>
<li>Belastingvoordelen</li>
<li>Risicos: onderhoud, leegstand</li>
</ul>

<h4>3. Digitale Producten</h4>
<p>Online cursussen, e-books, software:</p>
<ul>
<li>Eenmalige creatie, continue verkoop</li>
<li>Wereldwijde markt</li>
<li>Lage marginale kosten</li>
<li>Platforms: Udemy, Amazon, Gumroad</li>
</ul>

<h4>4. Affiliate Marketing</h4>
<p>Commissie verdienen op verkopen:</p>
<ul>
<li>Promoot producten van anderen</li>
<li>Commissie per verkoop</li>
<li>Kan gecombineerd worden met content</li>
<li>Platforms: Amazon Associates, Bol.com</li>
</ul>

<h4>5. YouTube/Content Creatie</h4>
<p>Advertentie-inkomsten van videos:</p>
<ul>
<li>Monetarisatie via ads</li>
<li>Sponsorships en partnerships</li>
<li>Merchandise verkoop</li>
<li>Lidmaatschappen</li>
</ul>

<h4>6. Peer-to-Peer Leningen</h4>
<p>Lenen aan particulieren/bedrijven:</p>
<ul>
<li>Hogere rente dan spaarrekening</li>
<li>Diversificatie mogelijk</li>
<li>Platforms: Mintos, Bondora</li>
<li>Risico van wanbetaling</li>
</ul>

<h4>7. Print-on-Demand</h4>
<p>T-shirts, mokken, posters verkopen:</p>
<ul>
<li>Geen voorraad nodig</li>
<li>Wereldwijde verkoop</li>
<li>Platforms: Printful, Teespring</li>
<li>Design skills vereist</li>
</ul>

<h4>8. Stock Photography/Videography</h4>
<p>Fotos en videos verkopen:</p>
<ul>
<li>Eenmalige upload, continue verkoop</li>
<li>Platforms: Shutterstock, Adobe Stock</li>
<li>Hoge concurrentie</li>
<li>Kwaliteit is belangrijk</li>
</ul>

<h3>Stappenplan voor Passief Inkomen:</h3>

<h4>Fase 1: Voorbereiding (Maanden 1-3)</h4>
<ul>
<li>Kies je niche/strategie</li>
<li>Leer de basis</li>
<li>Bepaal je investering (tijd/geld)</li>
<li>Stel doelen</li>
</ul>

<h4>Fase 2: Opbouw (Maanden 4-12)</h4>
<ul>
<li>Begin met één strategie</li>
<li>Investeer tijd in leren</li>
<li>Bouw je eerste inkomstenstroom</li>
<li>Test en optimaliseer</li>
</ul>

<h4>Fase 3: Schaal (Maanden 13-24)</h4>
<ul>
<li>Breid uit naar meerdere stromen</li>
<li>Automatiseer processen</li>
<li>Verhoog je inkomsten</li>
<li>Diversificeer</li>
</ul>

<h4>Fase 4: Optimalisatie (Maanden 25+)</h4>
<ul>
<li>Focus op beste presterende stromen</li>
<li>Verhoog efficiency</li>
<li>Nieuwe kansen identificeren</li>
<li>Financiële vrijheid bereiken</li>
</ul>

<h3>Praktische Tips:</h3>

<h4>1. Begin Klein</h4>
<p>Start met één strategie en meester die eerst.</p>

<h4>2. Investeer in Kennis</h4>
<p>Leer van experts en blijf ontwikkelen.</p>

<h4>3. Wees Geduldig</h4>
<p>Passief inkomen kost tijd om op te bouwen.</p>

<h4>4. Automatiseer</h4>
<p>Gebruik tools om processen te automatiseren.</p>

<h4>5. Diversificeer</h4>
<p>Verspreid je risico over meerdere stromen.</p>

<h4>6. Track je Resultaten</h4>
<p>Meet wat werkt en optimaliseer.</p>

<h3>Veelgemaakte Fouten:</h3>
<ul>
<li>Te veel tegelijk willen doen</li>
<li>Onrealistische verwachtingen</li>
<li>Niet genoeg onderzoek doen</li>
<li>Te snel opgeven</li>
<li>Niet investeren in kwaliteit</li>
<li>Vergeten te automatiseren</li>
</ul>

<h3>Tools en Platforms:</h3>

<h4>Content Creatie:</h4>
<ul>
<li>YouTube Studio</li>
<li>Canva (designs)</li>
<li>Audacity (audio)</li>
<li>OBS (screen recording)</li>
</ul>

<h4>E-commerce:</h4>
<ul>
<li>Shopify</li>
<li>WooCommerce</li>
<li>Etsy</li>
<li>Amazon FBA</li>
</ul>

<h4>Investeren:</h4>
<ul>
<li>DeGiro (dividend)</li>
<li>Mintos (P2P lending)</li>
<li>Funda (vastgoed)</li>
<li>Peaks (robo-advisor)</li>
</ul>

<h3>Success Stories:</h3>
<p>Voorbeelden van mensen die passief inkomen hebben opgebouwd:</p>
<ul>
<li>Bloggers die €5000+/maand verdienen</li>
<li>YouTubers met €10,000+/maand</li>
<li>Investeerders met €2000+/maand dividend</li>
<li>Vastgoedeigenaren met €3000+/maand huur</li>
</ul>

<h3>Volgende Stappen:</h3>
<ol>
<li>Kies één strategie die bij je past</li>
<li>Stel een concreet doel</li>
<li>Maak een actieplan</li>
<li>Begin vandaag nog</li>
<li>Blijf leren en aanpassen</li>
</ol>

<p><strong>Onthoud:</strong> Passief inkomen is geen get-rich-quick scheme. Het vereist tijd, moeite en consistentie, maar de beloning is financiële vrijheid.</p>',
    NOW(),
    NOW()
),
(
    (SELECT id FROM academy_modules WHERE title ILIKE '%finance%' OR title ILIKE '%business%' OR title ILIKE '%geld%' OR title ILIKE '%financi%' LIMIT 1),
    'Reflectie & Integratie',
    '15m',
    'exam',
    'published',
    6,
    0,
    0,
    '',
    '<h2>Reflectie & Integratie: Je Financiële Reis</h2>

<p>Neem de tijd om te reflecteren op wat je hebt geleerd over financiën en hoe je dit kunt toepassen in je leven.</p>

<h3>Reflectie Vragen:</h3>

<h4>Over Budgetteren:</h4>
<ul>
<li>Welke uitgavencategorieën zijn het grootst?</li>
<li>Waar kun je besparen?</li>
<li>Hoe ga je je budget implementeren?</li>
<li>Welke tools ga je gebruiken?</li>
</ul>

<h4>Over Investeren:</h4>
<ul>
<li>Wat is je risicoprofiel?</li>
<li>Welke investeringsstrategie past bij je?</li>
<li>Hoe ga je beginnen met investeren?</li>
<li>Wat zijn je investeringsdoelen?</li>
</ul>

<h4>Over Passief Inkomen:</h4>
<ul>
<li>Welke passief inkomen strategieën interesseren je?</li>
<li>Hoeveel tijd kun je investeren?</li>
<li>Wat zijn je vaardigheden en interesses?</li>
<li>Hoe ga je je eerste inkomstenstroom opbouwen?</li>
</ul>

<h3>Financiële Doelen:</h3>
<p>Stel concrete, meetbare doelen:</p>

<ol>
<li><strong>Korte termijn (3-12 maanden):</strong></li>
<ul>
<li>Emergency fund opbouwen</li>
<li>Budget systeem implementeren</li>
<li>Beginnen met investeren</li>
<li>Schulden aflossen</li>
</ul>

<li><strong>Middellange termijn (1-5 jaar):</strong></li>
<ul>
<li>Investeringsportefeuille opbouwen</li>
<li>Passief inkomen ontwikkelen</li>
<li>Vastgoed investeringen</li>
<li>Pensioen opbouwen</li>
</ul>

<li><strong>Lange termijn (5+ jaar):</strong></li>
<ul>
<li>Financiële onafhankelijkheid</li>
<li>Vroeg pensioen</li>
<li>Vermogen doorgeven</li>
<li>Droomleven leiden</li>
</ul>
</ol>

<h3>Actie Plan:</h3>
<p>Maak een concreet plan voor de komende 90 dagen:</p>

<h4>Week 1-4:</h4>
<ul>
<li>Budget systeem opzetten</li>
<li>Uitgaven tracken</li>
<li>Emergency fund beginnen</li>
<li>Investeringskennis vergroten</li>
</ul>

<h4>Week 5-8:</h4>
<ul>
<li>Eerste investeringen doen</li>
<li>Passief inkomen strategie kiezen</li>
<li>Financiële doelen verfijnen</li>
<li>Automatisering implementeren</li>
</ul>

<h4>Week 9-12:</h4>
<ul>
<li>Portefeuille uitbreiden</li>
<li>Passief inkomen project starten</li>
<li>Resultaten evalueren</li>
<li>Strategie aanpassen</li>
</ul>

<h3>Meting van Succes:</h3>
<p>Hoe ga je je voortgang meten?</p>
<ul>
<li>Netto vermogen tracking</li>
<li>Maandelijkse besparingen</li>
<li>Investeringsrendement</li>
<li>Passief inkomen groei</li>
<li>Financiële stress niveau</li>
</ul>

<h3>Hulpbronnen:</h3>
<ul>
<li>Boeken: "Rich Dad Poor Dad", "The Millionaire Next Door"</li>
<li>Podcasts: "ChooseFI", "The Dave Ramsey Show"</li>
<li>YouTube: Graham Stephan, Andrei Jikh</li>
<li>Forums: Reddit r/personalfinance, r/financialindependence</li>
</ul>

<h3>Blijven Leren:</h3>
<p>Financiële educatie is een levenslang proces:</p>
<ul>
<li>Lees regelmatig over financiën</li>
<li>Volg financiële nieuws</li>
<li>Netwerk met gelijkgestemden</li>
<li>Blijf je strategieën aanpassen</li>
</ul>

<p><strong>Onthoud:</strong> Financiële vrijheid is een reis, geen bestemming. Begin vandaag en blijf consistent.</p>',
    NOW(),
    NOW()
);

-- Verify the insertions
SELECT 
    l.title,
    l.type,
    l.duration,
    m.title as module_title
FROM academy_lessons l
JOIN academy_modules m ON l.module_id = m.id
WHERE m.title ILIKE '%finance%' OR m.title ILIKE '%business%' OR m.title ILIKE '%geld%' OR m.title ILIKE '%financi%'
ORDER BY l.order_index; 