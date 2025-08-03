'use client';
import { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

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

interface CartItem {
  product: Product;
  quantity: number;
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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
    
    toast.success(`${quantity}x ${product.name} toegevoegd aan winkelwagen`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    toast('Product verwijderd uit winkelwagen');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => prevCart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    // Hier zou je de checkout logica implementeren
    toast.success('Checkout functionaliteit wordt binnenkort toegevoegd!');
    setShowCart(false);
  };

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
            
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:from-[#A6C97B] hover:to-[#FFE55C]"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              Winkelwagen
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {getCartItemCount()}
                </span>
              )}
            </button>
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openProductModal(product)}
                    className="flex-1 bg-transparent border border-[#8BAE5A] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#0A0F0A] px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Details
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:bg-[#3A4D23] text-[#0A0F0A] px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Toevoegen
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

                    {/* Add to Cart */}
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setShowProductModal(false);
                      }}
                      disabled={!selectedProduct.inStock}
                      className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:bg-[#3A4D23] text-[#0A0F0A] py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      Toevoegen aan winkelwagen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#8BAE5A]">Winkelwagen</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-[#B6C948] hover:text-[#8BAE5A] text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCartIcon className="w-16 h-16 text-[#B6C948] mx-auto mb-4" />
                    <p className="text-[#B6C948]">Je winkelwagen is leeg</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-4 p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 rounded-lg flex items-center justify-center">
                            <span className="text-[#8BAE5A] font-bold text-sm">
                              {item.product.name.split(' ')[0]}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#8BAE5A]">{item.product.name}</h3>
                            <p className="text-[#B6C948] text-sm">€{item.product.price.toFixed(2)} per stuk</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 bg-[#3A4D23] hover:bg-[#8BAE5A] hover:text-[#0A0F0A] text-[#B6C948] rounded-lg flex items-center justify-center transition-colors"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-[#8BAE5A] font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 bg-[#3A4D23] hover:bg-[#8BAE5A] hover:text-[#0A0F0A] text-[#B6C948] rounded-lg flex items-center justify-center transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-[#8BAE5A]">€{(item.product.price * item.quantity).toFixed(2)}</p>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Total */}
                    <div className="border-t border-[#3A4D23] pt-4 mb-6">
                      <div className="flex justify-between items-center text-xl font-bold text-[#8BAE5A]">
                        <span>Totaal</span>
                        <span>€{getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#A6C97B] hover:to-[#FFE55C] text-[#0A0F0A] py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CreditCardIcon className="w-5 h-5" />
                      Afrekenen
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 