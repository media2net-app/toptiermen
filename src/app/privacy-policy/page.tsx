'use client';

import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  UserIcon, 
  CogIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheckIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
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
              Inleiding
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Top Tier Men ("wij", "ons", "onze") respecteert uw privacy en is toegewijd aan het beschermen van uw persoonlijke gegevens. 
              Deze Privacy Policy legt uit hoe wij uw gegevens verzamelen, gebruiken en beschermen wanneer u ons platform gebruikt.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
              <UserIcon className="w-6 h-6 mr-2" />
              Informatie die wij verzamelen
            </h2>
            
            <h3 className="text-xl font-semibold text-blue-300 mb-3">Persoonlijke gegevens</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Naam en contactgegevens (e-mailadres, telefoonnummer)</li>
              <li>Account informatie en profielgegevens</li>
              <li>Betaling en abonnement informatie</li>
              <li>Gebruik van ons platform en diensten</li>
              <li>Communicatie met ons</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-300 mb-3">Technische gegevens</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>IP-adres en browser informatie</li>
              <li>Apparaat informatie en locatie data</li>
              <li>Cookies en vergelijkbare technologieën</li>
              <li>Gebruiksstatistieken en analytics</li>
            </ul>
          </div>

          {/* How We Use Information */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center">
              <CogIcon className="w-6 h-6 mr-2" />
              Hoe wij uw informatie gebruiken
            </h2>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Het leveren en verbeteren van onze diensten</li>
              <li>Het verwerken van betalingen en abonnementen</li>
              <li>Het verzenden van belangrijke updates en communicatie</li>
              <li>Het bieden van klantenservice en ondersteuning</li>
              <li>Het analyseren van gebruikspatronen om de ervaring te verbeteren</li>
              <li>Het voldoen aan wettelijke verplichtingen</li>
            </ul>
          </div>

          {/* Data Protection */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
              <LockClosedIcon className="w-6 h-6 mr-2" />
              Gegevensbescherming
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Wij implementeren passende technische en organisatorische maatregelen om uw persoonlijke gegevens te beschermen tegen:
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Onbevoegde toegang of gebruik</li>
              <li>Verlies, vernietiging of wijziging</li>
              <li>Onbevoegde openbaarmaking</li>
            </ul>

            <p className="text-gray-300 leading-relaxed">
              Uw gegevens worden versleuteld opgeslagen en verzonden via beveiligde verbindingen.
            </p>
          </div>

          {/* Third-Party Services */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center">
              <EyeIcon className="w-6 h-6 mr-2" />
              Derde partijen
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Wij kunnen derde partijen gebruiken voor:
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Betalingen (Mollie, Stripe)</li>
              <li>Analytics en tracking (Google Analytics)</li>
              <li>E-mail services</li>
              <li>Cloud hosting en opslag</li>
              <li>Social media integratie (Facebook, Instagram)</li>
            </ul>

            <p className="text-gray-300 leading-relaxed">
              Deze partijen hebben hun eigen privacy policies en wij raden u aan deze te lezen.
            </p>
          </div>

          {/* Your Rights */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Uw rechten
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              U heeft het recht om:
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Toegang te krijgen tot uw persoonlijke gegevens</li>
              <li>Uw gegevens te corrigeren of bij te werken</li>
              <li>Uw gegevens te laten verwijderen</li>
              <li>Bezwaar te maken tegen verwerking</li>
              <li>Uw gegevens te laten overdragen</li>
              <li>Uw toestemming in te trekken</li>
            </ul>
          </div>

          {/* Data Deletion Instructions */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Gegevens Verwijdering Instructies
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Om uw gegevens volledig te verwijderen uit ons systeem:
            </p>
            
            <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4">
              <li>Log in op uw account op https://platform.toptiermen.eu</li>
              <li>Ga naar Account Instellingen</li>
              <li>Klik op "Account Verwijderen"</li>
              <li>Bevestig uw keuze</li>
              <li>Uw gegevens worden binnen 30 dagen permanent verwijderd</li>
            </ol>
            
            <p className="text-gray-300 leading-relaxed">
              U kunt ook een verzoek tot gegevensverwijdering sturen naar contact@media2net.nl. 
              Wij zullen uw verzoek binnen 30 dagen verwerken.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Contact
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Voor vragen over deze Privacy Policy of uw gegevens kunt u contact met ons opnemen:
            </p>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300">
                <strong>E-mail:</strong> contact@media2net.nl<br/>
                <strong>Website:</strong> https://platform.toptiermen.eu<br/>
                <strong>Platform:</strong> Top Tier Men
              </p>
            </div>
          </div>

          {/* Facebook App Compliance */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              Facebook App Compliance
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Deze Privacy Policy voldoet aan de vereisten van Facebook App Platform en Meta's privacy richtlijnen.
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Wij verzamelen alleen gegevens die nodig zijn voor het functioneren van onze app</li>
              <li>Geen gegevens worden gedeeld met Facebook zonder uw toestemming</li>
              <li>U heeft volledige controle over uw gegevens en kunt deze op elk moment verwijderen</li>
              <li>Wij gebruiken Facebook's privacy tools en instellingen</li>
            </ul>
          </div>

          {/* Updates */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Wijzigingen
            </h2>
            
            <p className="text-gray-300 leading-relaxed">
              Wij kunnen deze Privacy Policy van tijd tot tijd bijwerken. Belangrijke wijzigingen worden 
              aangekondigd via e-mail of via een melding op ons platform. Het is uw verantwoordelijkheid 
              om deze policy regelmatig te controleren.
            </p>
          </div>

        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center space-x-4">
          <Link 
            href="/terms-of-service"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Terms of Service
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
