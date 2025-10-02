# V2 E-book Productiechecklist

Doel: elke V2-ebookpagina consistent en volledig volgens het V2-format opleveren, met 1:1 overname van de uitgebreide samenvattingstekst.

## 1. Basisbestand en metadata
- [ ] **Kopieer template**: start vanaf `public/ebooksv2/_template.html`.
- [ ] **Titel/lesnaam**: vervang `<!-- LESNAAM -->` in `<title>` en `<h1>`.
- [ ] **Subtitel**: vul `<!-- SUBTITLE/KORTE CLAIM -->` in.
- [ ] **Module/les labels**: vul `<!-- MODULE_LABEL -->` en `<!-- LES_LABEL -->` in zowel header als footer.
- [ ] **Terugknop URL**: zet `<!-- TERUG_LINK_NAAR_LES -->` naar de exacte les-URL (niet module-overzicht!).

## 2. Uitgebreide samenvatting (1:1 overname)
- [ ] **Bron**: open het originele ebook uit `public/ebooks/` met dezelfde titel.
- [ ] **1:1 tekst**: kopieer de volledige samenvattingstekst naar sectie `#samenvatting` en bewerk inhoud NIET.
- [ ] **Karakterteller**: tel karakters van de bron en van de geplakte tekst; ze moeten **gelijk** zijn (of verantwoord inclusief kleine HTML-tags voor structuur).
- [ ] **Disclaimers**: controleer of er disclaimers zijn (bijv. in Module 5 – investeren/financieel) en neem die volledig 1:1 op in de samenvatting-sectie of als aparte `highlight-box` binnen dezelfde sectie.

## 3. Huiswerkopdrachten
- [ ] **Aanwezig?** Als het origineel deze sectie niet heeft, **maak dan opdrachten** (minimaal 3) die direct voortkomen uit de lesinhoud.
- [ ] **Structuur**: gebruik meerdere `.exercise-box` kaarten met Doel/Actie/Reflectie/Analyse waar gepast.

## 4. Checklists (met persistentie)
- [ ] **Aanwezig?** Als het origineel geen checklists heeft, **maak dan minstens 1-2** relevante routines (bijv. Ochtend/Dagelijks/Avond/Weekly).
- [ ] **Persistentie**: check of de checkbox-IDs uniek zijn en de localStorage-script onderaan aanwezig is.

## 5. Reflectievragen
- [ ] **Aanwezig?** Als het origineel deze niet heeft, **maak 3-5 reflectievragen** die aansluiten op de lesdoelen.
- [ ] **Structuur**: per vraag een `.reflection-question` kaart met `h4` + toelichting.

## 6. Optioneel: Actieplan
- [ ] **Wanneer zinvol**: voeg `#actieplan` toe met concrete stappen (`.action-step`).

## 7. Visuele/styling consistentie
- [ ] **TTM-styling**: controleer header, kleuren (`#8BAE5A`, `#B6C948`), borders, gradients en sectiecards (`.section`).
- [ ] **Footer**: bevat TTM-branding en correcte module/lesvermelding.

## 8. Kwaliteitscontrole
- [ ] **Links**: test terugknop (moet naar de lespagina), interne anchors en externe links.
- [ ] **Responsiveness**: check weergave op mobiel (≤768px).
- [ ] **Spelling/typo’s**: alleen in door ons toegevoegde secties (NIET in samenvattingstekst).
- [ ] **HTML-validatie**: controleer op open/gesloten tags en unieke `id`’s voor checkboxes.

## 9. Oplevering
- [ ] **Bestandsnaam**: volg slug van origineel (mag ingekort, maar semantisch gelijk; noteer mapping indien afwijkt).
- [ ] **Pad**: plaats bestand in `public/ebooksv2/`.
- [ ] **Smoke-test**: open `http://localhost:3000/ebooksv2/<bestand>.html` en loop de secties door.

---
Tip: bewaar een klein logje per ebook (bronbestand, karakters bron vs. V2, aanwezigheid disclaimers, les-URL) zodat controle achteraf eenvoudig is.
