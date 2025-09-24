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
        }
      ])
      .select();
    
    if (prodError) {
      console.log('❌ Products error:', prodError.message);
    } else {
      console.log('✅ Products added:', products?.length || 0);
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
