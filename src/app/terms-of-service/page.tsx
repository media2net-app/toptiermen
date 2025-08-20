'use client';

import Link from 'next/link';
import { 
  DocumentTextIcon, 
  UserIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <DocumentTextIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-white/90">
              Top Tier Men Platform
            </p>
            <p className="text-sm text-white/80 mt-2">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          
          {/* Introduction */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2" />
              Algemene Voorwaarden
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Welkom bij Top Tier Men. Door het gebruik van ons platform gaat u akkoord met deze Terms of Service. 
              Deze voorwaarden regelen uw gebruik van onze diensten en vormen een bindende overeenkomst tussen u en Top Tier Men.
            </p>
          </div>

          {/* Definitions */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
              <ScaleIcon className="w-6 h-6 mr-2" />
              Definities
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-blue-300">"Platform"</strong> - Het Top Tier Men platform inclusief website, app en alle gerelateerde diensten
              </div>
              <div>
                <strong className="text-blue-300">"Gebruiker"</strong> - Iedereen die het platform gebruikt of registreert
              </div>
              <div>
                <strong className="text-blue-300">"Diensten"</strong> - Alle functionaliteiten, content en features van het platform
              </div>
              <div>
                <strong className="text-blue-300">"Content"</strong> - Alle tekst, afbeeldingen, video's en andere materialen op het platform
              </div>
            </div>
          </div>

          {/* Account Registration */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center">
              <UserIcon className="w-6 h-6 mr-2" />
              Account Registratie
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>Om gebruik te maken van onze diensten moet u:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Minimaal 18 jaar oud zijn</li>
                <li>Accurate en volledige informatie verstrekken</li>
                <li>Uw account gegevens veilig houden</li>
                <li>Verantwoordelijk zijn voor alle activiteiten onder uw account</li>
                <li>Onmiddellijk melden bij ongeautoriseerd gebruik</li>
              </ul>
            </div>
          </div>

          {/* Acceptable Use */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 mr-2" />
              Aanvaardbaar Gebruik
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              U gaat akkoord om het platform alleen te gebruiken voor legitieme doeleinden en in overeenstemming met deze voorwaarden.
            </p>
            
            <h3 className="text-xl font-semibold text-orange-300 mb-3">Verboden activiteiten:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Het platform gebruiken voor illegale doeleinden</li>
              <li>Content uploaden die inbreuk maakt op intellectuele eigendomsrechten</li>
              <li>Spam, malware of schadelijke content verspreiden</li>
              <li>Andere gebruikers lastigvallen of bedreigen</li>
              <li>Het platform proberen te hacken of te verstoren</li>
              <li>Onze servers overbelasten of de dienst verstoren</li>
            </ul>
          </div>

          {/* Subscription and Payments */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
              <CogIcon className="w-6 h-6 mr-2" />
              Abonnementen en Betalingen
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p><strong>Abonnementen:</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Abonnementen worden automatisch verlengd tenzij opgezegd</li>
                <li>Prijzen kunnen worden gewijzigd met 30 dagen voorafgaande kennisgeving</li>
                <li>Geen terugbetaling voor gedeeltelijk gebruikte periodes</li>
                <li>Opzegging kan via uw account instellingen</li>
              </ul>
              
              <p><strong>Betalingen:</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>Betalingen worden verwerkt via Mollie</li>
                <li>U geeft toestemming voor automatische incasso</li>
                <li>Gebrek aan betaling kan leiden tot schorsing van uw account</li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Intellectuele Eigendom
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>
                Alle content op het platform, inclusief maar niet beperkt tot tekst, afbeeldingen, video's, 
                logo's en software, is eigendom van Top Tier Men of onze licentiegevers.
              </p>
              
              <p>
                U krijgt een beperkte, niet-exclusieve licentie om de content te bekijken en te gebruiken 
                voor persoonlijke, niet-commerciële doeleinden.
              </p>
              
              <p>
                Het is verboden om content te kopiëren, te distribueren, te wijzigen of te verkopen zonder 
                onze uitdrukkelijke toestemming.
              </p>
            </div>
          </div>

          {/* Privacy and Data */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              Privacy en Gegevens
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>
                Uw privacy is belangrijk voor ons. Onze Privacy Policy is onderdeel van deze Terms of Service 
                en beschrijft hoe wij uw gegevens verzamelen, gebruiken en beschermen.
              </p>
              
              <p>
                Door het platform te gebruiken gaat u akkoord met de verzameling en het gebruik van uw gegevens 
                zoals beschreven in onze Privacy Policy.
              </p>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
              Vrijwaringen
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Het platform wordt "zoals het is" geleverd zonder enige garantie.</strong>
              </p>
              
              <p>
                Top Tier Men is niet aansprakelijk voor:
              </p>
              
              <ul className="list-disc list-inside space-y-2">
                <li>Directe, indirecte, incidentele of gevolgschade</li>
                <li>Verlies van gegevens of inkomsten</li>
                <li>Onderbrekingen van de dienst</li>
                <li>Schade door derden of externe factoren</li>
                <li>Gebruik van content door andere gebruikers</li>
              </ul>
            </div>
          </div>

          {/* Termination */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Beëindiging
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>
                Wij kunnen uw account en toegang tot het platform op elk moment beëindigen als u:
              </p>
              
              <ul className="list-disc list-inside space-y-2">
                <li>Deze voorwaarden schendt</li>
                <li>Frauduleuze activiteiten verricht</li>
                <li>Andere gebruikers schaadt</li>
                <li>De dienst verstoort</li>
              </ul>
              
              <p>
                U kunt uw account op elk moment opzeggen via uw account instellingen. 
                Na beëindiging verliezen wij geen toegang tot uw gegevens zoals beschreven in onze Privacy Policy.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Toepasselijk Recht
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <p>
                Deze voorwaarden worden beheerst door het Nederlandse recht. 
                Eventuele geschillen worden beslecht door de bevoegde Nederlandse rechtbanken.
              </p>
              
              <p>
                Als een bepaling van deze voorwaarden ongeldig wordt geacht, 
                blijven de overige bepalingen volledig van kracht.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Contact
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Voor vragen over deze Terms of Service kunt u contact met ons opnemen:
            </p>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300">
                <strong>E-mail:</strong> legal@toptiermen.com<br/>
                <strong>Adres:</strong> [Bedrijfsadres]<br/>
                <strong>Telefoon:</strong> [Telefoonnummer]
              </p>
            </div>
          </div>

        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center space-x-4">
          <Link 
            href="/privacy-policy"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/"
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Terug naar Home
          </Link>
        </div>
      </div>
    </div>
  );
}
