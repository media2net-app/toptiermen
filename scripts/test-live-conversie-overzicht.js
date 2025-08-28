require('dotenv').config({ path: '.env.local' });

console.log('🌐 TESTING LIVE CONVERSIE OVERZICHT APIs');
console.log('============================================================');

async function makeRequest(path, method = 'GET', body = null) {
  const baseUrl = 'https://platform.toptiermen.eu';
  const url = `${baseUrl}${path}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0
    };
  }
}

async function testLiveConversieOverzicht() {
  try {
    console.log('🚀 Starting live conversie overzicht tests...\n');

    // Test 1: Facebook analytics API
    console.log('📋 STEP 1: Testing Facebook analytics API on live');
    console.log('----------------------------------------');
    
    const analyticsResult = await makeRequest('/api/facebook/comprehensive-analytics?dateRange=maximum&useManualData=true');
    
    if (analyticsResult.success) {
      console.log('✅ Live Facebook analytics API successful');
      console.log(`   Status: ${analyticsResult.status}`);
      console.log('📊 Live Facebook Data:');
      if (analyticsResult.data.success && analyticsResult.data.data) {
        const data = analyticsResult.data.data;
        console.log(`   Total Spend: €${data.summary?.totalSpend?.toFixed(2) || 'N/A'}`);
        console.log(`   Total Clicks: ${data.summary?.totalClicks || 'N/A'}`);
        console.log(`   Total Impressions: ${data.summary?.totalImpressions || 'N/A'}`);
        console.log(`   Campaigns: ${data.campaigns?.length || 0}`);
      } else {
        console.log('   ❌ API returned success but no data');
        console.log('   Response:', JSON.stringify(analyticsResult.data, null, 2));
      }
    } else {
      console.error('❌ Live Facebook analytics API failed');
      console.error(`   Status: ${analyticsResult.status}`);
      console.error(`   Error: ${analyticsResult.error || 'Unknown error'}`);
      console.error('   Response:', JSON.stringify(analyticsResult.data, null, 2));
    }

    console.log('\n📋 STEP 2: Testing prelaunch leads API on live');
    console.log('----------------------------------------');
    
    const leadsResult = await makeRequest('/api/prelaunch-leads');
    
    if (leadsResult.success) {
      console.log('✅ Live prelaunch leads API successful');
      console.log(`   Status: ${leadsResult.status}`);
      if (leadsResult.data.success && leadsResult.data.leads) {
        console.log(`   Total leads: ${leadsResult.data.leads.length}`);
        const filteredLeads = leadsResult.data.leads.filter(lead => 
          !lead.email.includes('@media2net.nl') && 
          !lead.email.includes('@test.com')
        );
        console.log(`   Filtered leads (no test): ${filteredLeads.length}`);
      } else {
        console.log('   ❌ API returned success but no leads data');
        console.log('   Response:', JSON.stringify(leadsResult.data, null, 2));
      }
    } else {
      console.error('❌ Live prelaunch leads API failed');
      console.error(`   Status: ${leadsResult.status}`);
      console.error(`   Error: ${leadsResult.error || 'Unknown error'}`);
      console.error('   Response:', JSON.stringify(leadsResult.data, null, 2));
    }

    console.log('\n📋 STEP 3: Testing auto-refresh analytics API on live');
    console.log('----------------------------------------');
    
    const autoRefreshResult = await makeRequest('/api/facebook/auto-refresh-analytics');
    
    if (autoRefreshResult.success) {
      console.log('✅ Live auto-refresh analytics API successful');
      console.log(`   Status: ${autoRefreshResult.status}`);
      if (autoRefreshResult.data.success && autoRefreshResult.data.data) {
        const data = autoRefreshResult.data.data;
        console.log(`   Total Spend: €${data.summary?.totalSpend?.toFixed(2) || 'N/A'}`);
        console.log(`   Total Clicks: ${data.summary?.totalClicks || 'N/A'}`);
        console.log(`   Campaigns: ${data.campaigns?.length || 0}`);
      } else {
        console.log('   ❌ API returned success but no data');
        console.log('   Response:', JSON.stringify(autoRefreshResult.data, null, 2));
      }
    } else {
      console.error('❌ Live auto-refresh analytics API failed');
      console.error(`   Status: ${autoRefreshResult.status}`);
      console.error(`   Error: ${autoRefreshResult.error || 'Unknown error'}`);
      console.error('   Response:', JSON.stringify(autoRefreshResult.data, null, 2));
    }

    console.log('\n📋 STEP 4: Testing cache headers on live');
    console.log('----------------------------------------');
    
    const cacheTestResult = await makeRequest('/api/facebook/comprehensive-analytics');
    
    if (cacheTestResult.success) {
      console.log('✅ Live API cache headers check');
      console.log(`   Cache-Control: ${cacheTestResult.headers['cache-control'] || 'NOT SET'}`);
      console.log(`   X-Cache-Bust: ${cacheTestResult.headers['x-cache-bust'] || 'NOT SET'}`);
      console.log(`   X-TTM-Version: ${cacheTestResult.headers['x-ttm-version'] || 'NOT SET'}`);
    } else {
      console.log('❌ Could not check cache headers');
    }

    console.log('\n📋 STEP 5: Testing conversie overzicht page directly');
    console.log('----------------------------------------');
    
    const pageResult = await makeRequest('/dashboard-marketing/conversie-overzicht');
    
    if (pageResult.success) {
      console.log('✅ Live conversie overzicht page accessible');
      console.log(`   Status: ${pageResult.status}`);
      console.log(`   Content-Type: ${pageResult.headers['content-type'] || 'NOT SET'}`);
      console.log(`   Cache-Control: ${pageResult.headers['cache-control'] || 'NOT SET'}`);
    } else {
      console.error('❌ Live conversie overzicht page failed');
      console.error(`   Status: ${pageResult.status}`);
      console.error(`   Error: ${pageResult.error || 'Unknown error'}`);
    }

    console.log('\n📋 DIAGNOSIS SUMMARY');
    console.log('============================================================');
    
    console.log('🔍 Potential Issues:');
    console.log('');
    console.log('1. **API Environment Variables**:');
    console.log('   - Facebook access token might not be set on live');
    console.log('   - Supabase credentials might be different');
    console.log('   - Environment variables might not be loaded');
    console.log('');
    console.log('2. **CORS Issues**:');
    console.log('   - API calls might be blocked by CORS');
    console.log('   - Frontend might not be able to reach APIs');
    console.log('');
    console.log('3. **Cache Issues**:');
    console.log('   - Browser might be caching old responses');
    console.log('   - CDN might be serving cached content');
    console.log('');
    console.log('4. **Network Issues**:');
    console.log('   - API calls might be timing out');
    console.log('   - Facebook API might be rate limited');
    console.log('');
    console.log('💡 Recommendations:');
    console.log('1. Check environment variables on Vercel');
    console.log('2. Verify Facebook API access token is valid');
    console.log('3. Check browser developer tools for errors');
    console.log('4. Test with cache-busting parameters');
    console.log('5. Verify Supabase connection on live');

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

testLiveConversieOverzicht();
