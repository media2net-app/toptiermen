'use client';
import React, { useState, useEffect } from 'react';
import { StarIcon, ShoppingCartIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/solid';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  gallery_images?: string[];
  category_id: string;
  in_stock: boolean;
  stock_quantity: number;
  sku?: string;
  brand?: string;
  rating: number;
  review_count: number;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  product_categories?: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    color: string;
  };
  product_features?: Array<{
    id: string;
    feature: string;
    order_index: number;
  }>;
  product_benefits?: Array<{
    id: string;
    benefit: string;
    order_index: number;
  }>;
  product_ingredients?: Array<{
    id: string;
    ingredient: string;
    order_index: number;
  }>;
  product_dosage?: Array<{
    id: string;
    dosage_instructions: string;
  }>;
  product_affiliate_links?: Array<{
    id: string;
    platform: string;
    affiliate_url: string;
    is_primary: boolean;
  }>;
  product_reviews?: Array<{
    id: string;
    rating: number;
    title?: string;
    review_text?: string;
    verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
    user_id: string;
    profiles?: {
      id: string;
      full_name: string;
    };
  }>;
}

export default function ProductenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          category: selectedCategory,
          sortBy,
          sortOrder
        });

        const response = await fetch(`/api/products?${params}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setCategories(data.categories || []);
        } else {
          throw new Error('Failed to load products');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Er is een fout opgetreden bij het laden van de producten.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, sortBy, sortOrder]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getPrimaryAffiliateLink = (product: Product) => {
    return product.product_affiliate_links?.find(link => link.is_primary)?.affiliate_url || 
           product.product_affiliate_links?.[0]?.affiliate_url;
  };

  const getCategoryName = (categoryId?: string | number) => {
    if (!categoryId) return '';
    const found = categories.find((c) => String(c.id) === String(categoryId));
    return found?.name || '';
  };

  const fallbackProducts: Product[] = [
    {
      id: '5',
      name: 'Testosteron Kit',
      description: 'Complete kit ter ondersteuning van testosteron: zink, magnesium en vitamine D3/K2',
      short_description: 'Zink | Magnesium | D3/K2',
      price: 49.95,
      original_price: 59.95,
      image_url: '/testosteron_packshot.png',
      gallery_images: [],
      category_id: '1',
      in_stock: true,
      stock_quantity: 60,
      sku: 'TST-KIT-001',
      brand: 'TopTier Performance',
      rating: 4.6,
      review_count: 87,
      featured: true,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_categories: undefined,
      product_features: [],
      product_benefits: [],
      product_ingredients: [],
      product_dosage: [],
      product_affiliate_links: [
        {
          id: 'aff-5-1',
          platform: 'MijnLabtest',
          affiliate_url:
            'https://mijnlabtest.nl/testosteron-test.html?aw_affiliate=eyJjYW1wYWlnbl9pZCI6IjU3IiwidHJhZmZpY19zb3VyY2UiOiJub19zb3VyY2UiLCJhY2NvdW50X2lkIjo3NTF9',
          is_primary: true
        },
      ],
      product_reviews: []
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-white text-lg">Producten laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#8BAE5A] text-white px-4 py-2 rounded-lg hover:bg-[#7A9E4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#B6C948] mb-2">Producten</h1>
          <p className="text-gray-300">Ontdek onze zorgvuldig geselecteerde producten voor optimale gezondheid en prestaties</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-[#2A3A1A] border border-[#3A4A2A] rounded-lg text-white hover:bg-[#3A4A2A] transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-[#2A3A1A] border border-[#3A4A2A] rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="all">Alle categorieën</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sorteren op</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="created_at">Nieuwste eerst</option>
                    <option value="name">Naam A-Z</option>
                    <option value="price">Prijs laag-hoog</option>
                    <option value="rating">Beoordeling</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Volgorde</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="desc">Aflopend</option>
                    <option value="asc">Oplopend</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {(products.length === 0 ? fallbackProducts : products).length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Geen producten gevonden</h3>
            <p className="text-gray-500">Probeer andere zoektermen of filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(products.length === 0 ? fallbackProducts : products).map((product) => (
              <div key={product.id} className="bg-[#2A3A1A] rounded-lg overflow-hidden border border-[#3A4A2A] hover:border-[#8BAE5A] transition-colors">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-800">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <ShoppingCartIcon className="w-12 h-12" />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-[#8BAE5A] text-[#181F17] text-xs px-2 py-1 rounded-full font-semibold">
                      Aanbevolen
                    </div>
                  )}

                  {/* Stock Status */}
                  {!product.in_stock && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      Uitverkocht
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(product as any).product_categories?.name || getCategoryName(product.category_id) ? (
                      <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] text-xs px-2 py-1 rounded-full">
                        {(product as any).product_categories?.name || getCategoryName(product.category_id)}
                      </span>
                    ) : null}
                    {product.brand && (
                      <span className="inline-block bg-[#232D1A] text-[#B6C948] border border-[#3A4A2A] text-xs px-2 py-1 rounded-full">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.short_description || product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-400">
                      {product.rating.toFixed(1)} ({product.review_count})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-[#B6C948]">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Features Preview */}
                  {product.product_features && product.product_features.length > 0 && (
                    <div className="mb-4">
                      <ul className="text-xs text-gray-400 space-y-1">
                        {product.product_features.slice(0, 2).map((feature) => (
                          <li key={feature.id} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-[#8BAE5A] rounded-full"></span>
                            {feature.feature}
                          </li>
                        ))}
                        {product.product_features.length > 2 && (
                          <li className="text-[#8BAE5A]">
                            +{product.product_features.length - 2} meer...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {getPrimaryAffiliateLink(product) ? (
                      <a
                        href={getPrimaryAffiliateLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#8BAE5A] text-[#181F17] text-center py-2 px-4 rounded-lg hover:bg-[#7A9E4A] transition-colors font-medium"
                      >
                        <ShoppingCartIcon className="w-4 h-4 inline mr-2" />
                        Bestellen
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-600 text-gray-400 text-center py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        Niet beschikbaar
                      </button>
                    )}
                    
                    <button className="p-2 bg-[#3A4A2A] text-gray-400 rounded-lg hover:bg-[#4A5A3A] hover:text-white transition-colors">
                      <HeartIcon className="w-4 h-4" />
                    </button>
                    
                    <button className="p-2 bg-[#3A4A2A] text-gray-400 rounded-lg hover:bg-[#4A5A3A] hover:text-white transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}