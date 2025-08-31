'use client';
import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  features: string[];
  benefits: string[];
  dosage?: string;
  ingredients?: string[];
}



export default function ProductenPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'omega3',
      name: 'Omega 3 Visolie Premium',
      description: 'Hoogwaardige visolie met optimale verhouding EPA/DHA voor hart, hersenen en gewrichten. Geproduceerd volgens de hoogste kwaliteitsstandaarden.',
      price: 29.95,
      originalPrice: 39.95,
      image: '/images/products/omega3.jpg',
      category: 'supplementen',
      inStock: true,
      rating: 4.8,
      reviews: 127,
      features: [
        '1000mg EPA + 500mg DHA per capsule',
        'Moleculair gedistilleerd voor zuiverheid',
        'IFOS gecertificeerd (5 sterren)',
        'Vrij van zware metalen',
        '60 capsules per verpakking'
      ],
      benefits: [
        'Ondersteunt hart- en vaatgezondheid',
        'Verbeterd cognitieve functie',
        'Vermindert ontstekingen',
        'Ondersteunt gewrichtsgezondheid',
        'Verbetert stemming en welzijn'
      ],
      dosage: '1-2 capsules per dag bij de maaltijd',
      ingredients: ['Visolie (sardines, ansjovis)', 'Gelatine', 'Glycerine', 'Vitamine E']
    },
    {
      id: 'bloedtest',
      name: 'Comprehensive Bloedtest',
      description: 'Complete bloedanalyse inclusief hormonen, vitaminen, mineralen en biomarkers. Ontvang gedetailleerde inzichten in je gezondheid en optimaliseer je prestaties.',
      price: 149.00,
      originalPrice: 199.00,
      image: '/images/products/bloedtest.jpg',
      category: 'diagnostiek',
      inStock: true,
      rating: 4.9,
      reviews: 89,
      features: [
        '50+ biomarkers geanalyseerd',
        'Hormoonprofiel (testosteron, cortisol)',
        'Vitaminen en mineralen status',
        'Hart- en vaatmarkers',
        'Lever- en nierfunctie',
        'Gedetailleerd rapport met aanbevelingen'
      ],
      benefits: [
        'Identificeer tekorten en onevenwichtigheden',
        'Optimaliseer je hormoonbalans',
        'Voorkom gezondheidsproblemen',
        'Meetbare verbeteringen in prestaties',
        'Persoonlijke aanbevelingen van experts'
      ]
    },
    {
      id: 'electrolyte',
      name: 'Electrolyte Hydration Mix',
      description: 'Premium elektrolyten mix voor optimale hydratatie en prestaties. Ideaal voor training, herstel en dagelijks gebruik. Bevat alle essentiële mineralen.',
      price: 24.95,
      originalPrice: 29.95,
      image: '/images/products/electrolyte.jpg',
      category: 'supplementen',
      inStock: true,
      rating: 4.7,
      reviews: 156,
      features: [
        'Complete elektrolyten balans',
        'Natrium, kalium, magnesium, calcium',
        'Natuurlijke smaken (citroen, sinaasappel)',
        'Vrij van kunstmatige zoetstoffen',
        '30 porties per verpakking',
        'Makkelijk oplosbaar'
      ],
      benefits: [
        'Verbeterde hydratatie tijdens training',
        'Sneller herstel na inspanning',
        'Vermindert spierkrampen',
        'Ondersteunt zenuwstelsel',
        'Optimaliseert prestaties'
      ],
      dosage: '1 scoop per 500ml water tijdens/na training',
      ingredients: ['Natriumcitraat', 'Kaliumcitraat', 'Magnesiumcitraat', 'Calciumcitraat', 'Natuurlijke aroma\'s', 'Stevia']
    }
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);



  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  return (
    <div className="p-6 bg-[#0A0F0A] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Producten</h1>
              <p className="text-[#B6C948]">Premium supplementen en diagnostiek voor optimale prestaties</p>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mb-8 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#FFD700] mb-2">
                🚧 Producten Pagina in Ontwikkeling
              </h3>
              <p className="text-[#B6C948] mb-3">
                Deze pagina is momenteel nog in ontwikkeling. De producten die je hier ziet zijn voorbeelden en de functionaliteit om door te klikken naar individuele productlandingspagina's wordt binnenkort toegevoegd.
              </p>
              <div className="bg-[#181F17]/50 rounded-lg p-4 border border-[#FFD700]/20">
                <h4 className="text-[#FFD700] font-semibold mb-2">📋 Wat wordt er toegevoegd:</h4>
                <ul className="text-[#B6C948] text-sm space-y-1">
                  <li>• Individuele productlandingspagina's met uitgebreide informatie</li>
                  <li>• Product reviews en beoordelingen</li>
                  <li>• Gerelateerde producten en aanbevelingen</li>
                  <li>• Volledige checkout en betalingsintegratie</li>
                  <li>• Product filtering en zoekfunctionaliteit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden hover:border-[#8BAE5A] hover:shadow-xl transition-all duration-300 shadow-lg">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 flex items-center justify-center">
                <div className="text-[#8BAE5A] text-4xl font-bold">
                  {product.name.split(' ')[0]}
                </div>
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold shadow-md">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-[#8BAE5A]">{product.name}</h3>
                  <button className="text-[#B6C948] hover:text-red-500 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[#B6C948] text-sm mb-4 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-[#FFD700] fill-current'
                            : 'text-[#3A4D23]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#B6C948] text-sm">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-[#8BAE5A]">€{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-[#B6C948] line-through">€{product.originalPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#8BAE5A]' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${product.inStock ? 'text-[#8BAE5A]' : 'text-red-500'}`}>
                    {product.inStock ? 'Op voorraad' : 'Niet op voorraad'}
                  </span>
                </div>

                {/* Action Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openProductModal(product)}
                    className="w-full bg-transparent border border-[#8BAE5A] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#0A0F0A] px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Bekijk Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Modal */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#8BAE5A]">{selectedProduct.name}</h2>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="text-[#B6C948] hover:text-[#8BAE5A] text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Preview Notice */}
                <div className="mb-6 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#FFD700] text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Preview Mode</span>
                  </div>
                  <p className="text-[#B6C948] text-sm mt-1">
                    Dit is een preview van de productdetailpagina. De volledige functionaliteit wordt binnenkort toegevoegd.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Image */}
                  <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 rounded-xl h-64 flex items-center justify-center">
                    <div className="text-[#8BAE5A] text-6xl font-bold">
                      {selectedProduct.name.split(' ')[0]}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div>
                    <p className="text-[#B6C948] mb-6">{selectedProduct.description}</p>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl font-bold text-[#8BAE5A]">€{selectedProduct.price.toFixed(2)}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-[#B6C948] line-through text-xl">€{selectedProduct.originalPrice.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Kenmerken</h3>
                      <ul className="space-y-2">
                        {selectedProduct.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-[#B6C948]">
                            <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Voordelen</h3>
                      <ul className="space-y-2">
                        {selectedProduct.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-[#B6C948]">
                            <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dosage & Ingredients */}
                    {selectedProduct.dosage && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">Dosering</h3>
                        <p className="text-[#B6C948]">{selectedProduct.dosage}</p>
                      </div>
                    )}

                    {selectedProduct.ingredients && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">Ingrediënten</h3>
                        <p className="text-[#B6C948]">{selectedProduct.ingredients.join(', ')}</p>
                      </div>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={() => setShowProductModal(false)}
                      className="w-full bg-transparent border border-[#8BAE5A] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#0A0F0A] py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Sluiten
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
} 