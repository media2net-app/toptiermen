const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addTestData() {
  console.log('📦 Adding test data...\n');
  
  try {
    // Add product categories
    console.log('Adding product categories...');
    const { data: categories, error: catError } = await supabase
      .from('product_categories')
      .upsert([
        {
          id: 1,
          name: 'Supplementen',
          description: 'Voedingssupplementen voor optimale gezondheid',
          icon: '💊',
          color: '#B6C948'
        },
        {
          id: 2,
          name: 'Training',
          description: 'Training apparatuur en accessoires',
          icon: '🏋️',
          color: '#2A3A1A'
        }
      ])
      .select();
    
    if (catError) {
      console.log('❌ Categories error:', catError.message);
    } else {
      console.log('✅ Categories added:', categories?.length || 0);
    }
    
    // Add products
    console.log('Adding products...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .upsert([
        {
          id: 1,
          name: 'Testosteron Booster',
          description: 'Natuurlijke testosteron ondersteuning',
          price: 29.99,
          category_id: 1,
          featured: true,
          stock_quantity: 50,
          sku: 'TST-001',
          status: 'active'
        },
        {
          id: 2,
          name: 'Whey Protein',
          description: 'Premium whey protein voor spieropbouw',
          price: 39.99,
          category_id: 1,
          featured: true,
          stock_quantity: 30,
          sku: 'WHEY-001',
          status: 'active'
        },
        {
          id: 3,
          name: 'Resistance Bands Set',
          description: 'Complete set weerstandsbanden voor thuis training',
          price: 24.99,
          category_id: 2,
          featured: false,
          stock_quantity: 25,
          sku: 'BANDS-001',
          status: 'active'
        },
        {
          id: 4,
          name: 'Omega 3 Visolie',
          description: 'Hooggedoseerde omega-3 visolie met EPA/DHA voor hart en brein',
          short_description: 'Zuivere visolie | 1000mg | EPA/DHA',
          price: 19.95,
          original_price: 24.95,
          category_id: 1,
          featured: true,
          stock_quantity: 100,
          sku: 'OMG3-001',
          brand: 'TopTier Health',
          image_url: 'https://images.unsplash.com/photo-1611077856336-b3a8e2aa6285?q=80&w=1200&auto=format&fit=crop',
          rating: 4.7,
          review_count: 128,
          status: 'active'
        },
        {
          id: 5,
          name: 'Testosteron Kit',
          description: 'Complete kit ter ondersteuning van testosteron: zink, magnesium en vitamine D3/K2',
          short_description: 'Zink | Magnesium | D3/K2',
          price: 49.95,
          original_price: 59.95,
          category_id: 1,
          featured: true,
          stock_quantity: 60,
          sku: 'TST-KIT-001',
          brand: 'TopTier Performance',
          image_url: 'https://images.unsplash.com/photo-1600112441529-4076f94844ff?q=80&w=1200&auto=format&fit=crop',
          rating: 4.6,
          review_count: 87,
          status: 'active'
        }
      ])
      .select();
    
    if (prodError) {
      console.log('❌ Products error:', prodError.message);
    } else {
      console.log('✅ Products added:', products?.length || 0);
    }
    
    // Add affiliate links for products
    console.log('Adding product affiliate links...');
    const { data: aff, error: affError } = await supabase
      .from('product_affiliate_links')
      .upsert([
        {
          product_id: 4,
          platform: 'Bol.com',
          affiliate_url: 'https://partner.bol.com/click/cam-omega3',
          is_primary: true
        },
        {
          product_id: 4,
          platform: 'Amazon',
          affiliate_url: 'https://amzn.to/omega3-top-tier',
          is_primary: false
        },
        {
          product_id: 5,
          platform: 'Bol.com',
          affiliate_url: 'https://partner.bol.com/click/cam-testkit',
          is_primary: true
        }
      ])
      .select();

    if (affError) {
      console.log('❌ Affiliate links error:', affError.message);
    } else {
      console.log('✅ Affiliate links added:', aff?.length || 0);
    }

    // Add brotherhood events
    console.log('Adding brotherhood events...');
    const { data: events, error: eventError } = await supabase
      .from('brotherhood_events')
      .upsert([
        {
          id: '1',
          group_id: '5d61860b-5f6c-4ac4-aea0-c1003e68dc5b',
          title: 'Crypto Meetup',
          description: 'Maandelijkse crypto discussie en netwerken',
          event_type: 'meetup',
          event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          location: 'Amsterdam',
          is_online: false,
          max_attendees: 20,
          status: 'active'
        },
        {
          id: '2',
          group_id: '8e75873f-a867-4318-800c-aac974fef2c9',
          title: 'Fitness Challenge',
          description: 'Maandelijkse fitness uitdaging',
          event_type: 'challenge',
          event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          location: 'Online',
          is_online: true,
          max_attendees: 50,
          status: 'active'
        }
      ])
      .select();
    
    if (eventError) {
      console.log('❌ Events error:', eventError.message);
    } else {
      console.log('✅ Events added:', events?.length || 0);
    }
    
    console.log('\n✅ Test data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error.message);
  }
}

addTestData();
