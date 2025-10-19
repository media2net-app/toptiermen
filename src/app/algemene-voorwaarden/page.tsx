'use client';

import { FaFileContract, FaShieldAlt, FaCreditCard, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';

export default function AlgemeneVoorwaarden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A] py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <FaFileContract className="w-12 h-12 text-[#8BAE5A] mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Algemene Voorwaarden</h1>
          </div>
          <p className="text-xl text-[#8BAE5A]">
            TopTierMen Platform - Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#1A2313] rounded-2xl p-8 border border-[#3A4D23]/30 space-y-8">
          
          {/* Artikel 1 - Definities */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <FaShieldAlt className="w-6 h-6 text-[#8BAE5A] mr-3" />
              Artikel 1 - Definities
            </h2>
            <div className="text-[#B6C948] space-y-3">
              <p>In deze algemene voorwaarden wordt verstaan onder:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>TopTierMen:</strong> de aanbieder van het platform en de diensten</li>
                <li><strong>Gebruiker:</strong> de natuurlijke of rechtspersoon die gebruik maakt van de diensten</li>
                <li><strong>Platform:</strong> het TopTierMen online platform inclusief alle content, tools en diensten</li>
                <li><strong>Abonnement:</strong> de overeenkomst voor toegang tot het platform tegen betaling</li>
                <li><strong>Maandelijkse betaling:</strong> een abonnement waarbij periodiek (maandelijks) wordt betaald</li>
                <li><strong>Eenmalige betaling:</strong> een abonnement waarbij eenmalig wordt betaald voor een bepaalde periode</li>
              </ul>
            </div>
          </section>

          {/* Artikel 2 - Toepasselijkheid */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 2 - Toepasselijkheid</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen TopTierMen en de gebruiker betreffende het gebruik van het platform.</p>
              <p>Door het aangaan van een abonnement of het gebruik van het platform gaat de gebruiker akkoord met deze algemene voorwaarden.</p>
            </div>
          </section>

          {/* Artikel 3 - Diensten */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 3 - Diensten</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>TopTierMen biedt toegang tot:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>TTM Academy met trainings- en voedingscontent</li>
                <li>Financiële tools en gidsen</li>
                <li>TTM Brotherhood community</li>
                <li>Mind-focus tools en gidsen</li>
                <li>Challenges en boekenkamer</li>
                <li>Q&A sessies (Premium pakket)</li>
                <li>Custom voedings- en trainingsplannen (Premium pakket)</li>
              </ul>
            </div>
          </section>

          {/* Artikel 4 - Abonnementen en Betalingen */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <FaCreditCard className="w-6 h-6 text-[#8BAE5A] mr-3" />
              Artikel 4 - Abonnementen en Betalingen
            </h2>
            <div className="text-[#B6C948] space-y-4">
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/30">
                <h3 className="text-lg font-semibold text-white mb-3">4.1 Maandelijkse Betalingen</h3>
                <div className="space-y-2">
                  <p>Bij maandelijkse betalingen gaat de gebruiker een <strong>betaalverplichting</strong> aan voor de volledige abonnementsperiode.</p>
                  <p>De betaling geschiedt via <strong>SEPA incasso</strong> of andere door Mollie ondersteunde betaalmethoden.</p>
                  <p>De gebruiker stemt in met automatische incasso van het abonnementsbedrag.</p>
                </div>
              </div>
              
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/30">
                <h3 className="text-lg font-semibold text-white mb-3">4.2 Eenmalige Betalingen</h3>
                <div className="space-y-2">
                  <p>Bij eenmalige betalingen wordt het volledige bedrag voor de abonnementsperiode vooraf betaald.</p>
                  <p>Na betaling heeft de gebruiker direct toegang tot alle diensten voor de betaalde periode.</p>
                </div>
              </div>

              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/30">
                <h3 className="text-lg font-semibold text-white mb-3">4.3 Prijzen en BTW</h3>
                <div className="space-y-2">
                  <p>Alle prijzen zijn inclusief 21% BTW, tenzij anders vermeld.</p>
                  <p>TopTierMen behoudt zich het recht voor om prijzen te wijzigen met inachtneming van een opzegtermijn van 30 dagen.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Artikel 5 - Herroepingsrecht */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <FaExclamationTriangle className="w-6 h-6 text-[#8BAE5A] mr-3" />
              Artikel 5 - Herroepingsrecht
            </h2>
            <div className="text-[#B6C948] space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Belangrijk: Beperkt Herroepingsrecht</h3>
                <div className="space-y-2 text-red-300">
                  <p><strong>Bij maandelijkse betalingen is herroeping NIET mogelijk</strong> zodra de eerste betaling is verwerkt.</p>
                  <p>De gebruiker gaat een betaalverplichting aan voor de volledige abonnementsperiode.</p>
                  <p>Dit is in overeenstemming met artikel 6:230o lid 2 van het Burgerlijk Wetboek.</p>
                </div>
              </div>
              
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/30">
                <h3 className="text-lg font-semibold text-white mb-3">5.1 Eenmalige Betalingen</h3>
                <div className="space-y-2">
                  <p>Bij eenmalige betalingen heeft de gebruiker 14 dagen herroepingsrecht vanaf de dag na het sluiten van de overeenkomst.</p>
                  <p>Het herroepingsrecht vervalt zodra de gebruiker toegang heeft gekregen tot de digitale content.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Artikel 6 - Opzegging */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 6 - Opzegging</h2>
            <div className="text-[#B6C948] space-y-4">
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/30">
                <h3 className="text-lg font-semibold text-white mb-3">6.1 Maandelijkse Abonnementen</h3>
                <div className="space-y-2">
                  <p>Maandelijkse abonnementen kunnen worden opgezegd met inachtneming van een opzegtermijn van 30 dagen.</p>
                  <p>Opzegging dient schriftelijk te geschieden via het platform of per e-mail.</p>
                  <p>De gebruiker blijft verplicht tot betaling tot het einde van de opzegtermijn.</p>
                </div>
              </div>
              
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/30">
                <h3 className="text-lg font-semibold text-white mb-3">6.2 Eenmalige Abonnementen</h3>
                <div className="space-y-2">
                  <p>Eenmalige abonnementen eindigen automatisch na de betaalde periode.</p>
                  <p>Verlenging geschiedt niet automatisch.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Artikel 7 - Gebruikersverplichtingen */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <FaUserShield className="w-6 h-6 text-[#8BAE5A] mr-3" />
              Artikel 7 - Gebruikersverplichtingen
            </h2>
            <div className="text-[#B6C948] space-y-3">
              <p>De gebruiker is verplicht tot:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Het verstrekken van juiste en volledige gegevens</li>
                <li>Het tijdig betalen van de abonnementskosten</li>
                <li>Het respecteren van de community richtlijnen</li>
                <li>Het niet delen van accountgegevens met derden</li>
                <li>Het niet misbruiken van het platform</li>
                <li>Het respecteren van intellectueel eigendom</li>
              </ul>
            </div>
          </section>

          {/* Artikel 8 - Aansprakelijkheid */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 8 - Aansprakelijkheid</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>TopTierMen is niet aansprakelijk voor:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Schade als gevolg van het gebruik van de verstrekte informatie</li>
                <li>Indirecte schade, gevolgschade of gederfde winst</li>
                <li>Schade door onderbreking van de dienstverlening</li>
                <li>Schade door handelingen van andere gebruikers</li>
              </ul>
              <p>De aansprakelijkheid van TopTierMen is beperkt tot het bedrag dat de gebruiker heeft betaald voor de dienstverlening.</p>
            </div>
          </section>

          {/* Artikel 9 - Intellectueel Eigendom */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 9 - Intellectueel Eigendom</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>Alle content op het platform, inclusief teksten, afbeeldingen, video's en software, is eigendom van TopTierMen of haar licentiegevers.</p>
              <p>De gebruiker krijgt een beperkte, niet-overdraagbare licentie voor persoonlijk gebruik.</p>
              <p>Het is verboden om content te kopiëren, distribueren of commercieel te gebruiken zonder schriftelijke toestemming.</p>
            </div>
          </section>

          {/* Artikel 10 - Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 10 - Privacy</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>TopTierMen respecteert de privacy van gebruikers en handelt in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).</p>
              <p>Persoonsgegevens worden alleen gebruikt voor de uitvoering van de overeenkomst en verbetering van de dienstverlening.</p>
              <p>Voor meer informatie over de verwerking van persoonsgegevens verwijzen wij naar ons privacybeleid.</p>
            </div>
          </section>

          {/* Artikel 11 - Wijzigingen */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 11 - Wijzigingen</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>TopTierMen behoudt zich het recht voor om deze algemene voorwaarden te wijzigen.</p>
              <p>Wijzigingen worden 30 dagen van tevoren bekendgemaakt via het platform of per e-mail.</p>
              <p>Indien de gebruiker niet akkoord gaat met de wijzigingen, kan hij het abonnement opzeggen.</p>
            </div>
          </section>

          {/* Artikel 12 - Slotbepalingen */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Artikel 12 - Slotbepalingen</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen TopTierMen en de gebruiker.</p>
              <p>Indien een bepaling van deze voorwaarden nietig of vernietigbaar is, blijven de overige bepalingen van kracht.</p>
              <p>Op deze voorwaarden is Nederlands recht van toepassing.</p>
              <p>Alle geschillen worden voorgelegd aan de bevoegde rechter in Nederland.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]/30">
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <div className="text-[#B6C948] space-y-2">
              <p>Voor vragen over deze algemene voorwaarden kunt u contact opnemen met:</p>
              <p><strong>TopTierMen</strong></p>
              <p>E-mail: info@toptiermen.eu</p>
              <p>Website: https://platform.toptiermen.eu</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

