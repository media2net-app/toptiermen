import { NextRequest, NextResponse } from 'next/server';
import { unifiedCache } from '@/lib/unified-cache-strategy';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing unified cache strategy...');
    
    const testKey = 'unified-cache-test';
    const testData = {
      message: 'Hello from unified cache!',
      timestamp: new Date().toISOString(),
      version: '1.2.0',
      user: 'test-user'
    };

    // Test 1: Set item
    console.log('📝 Setting test data...');
    await unifiedCache.setItem(testKey, testData);
    
    // Test 2: Get item
    console.log('📖 Retrieving test data...');
    const retrievedData = await unifiedCache.getItem(testKey);
    
    // Test 3: Get stats
    console.log('📊 Getting cache stats...');
    const stats = unifiedCache.getStats();
    const info = unifiedCache.getInfo();
    
    // Test 4: Test version invalidation
    console.log('🔄 Testing version invalidation...');
    await unifiedCache.invalidateByVersion('1.2.0');
    const afterInvalidation = await unifiedCache.getItem(testKey);
    
    // Test 5: Test event invalidation
    console.log('🎯 Testing event invalidation...');
    await unifiedCache.setItem(testKey, testData);
    await unifiedCache.invalidateByEvent('user-login');
    const afterEventInvalidation = await unifiedCache.getItem(testKey);

    const results = {
      success: true,
      tests: {
        setItem: true,
        getItem: retrievedData !== null,
        versionMatch: retrievedData?.version === '1.2.0',
        stats: stats.totalEntries > 0,
        versionInvalidation: afterInvalidation === null,
        eventInvalidation: afterEventInvalidation === null
      },
      stats: {
        totalEntries: stats.totalEntries,
        totalSize: `${(stats.totalSize / 1024).toFixed(2)}KB`,
        hitRate: stats.hitRate,
        missRate: stats.missRate,
        evictions: stats.evictions,
        errors: stats.errors
      },
      info: {
        entries: info.entries,
        size: `${(info.size / 1024).toFixed(2)}KB`,
        storageType: info.config.storage.type,
        ttl: info.config.storage.ttl,
        version: info.config.invalidation.version
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Unified cache test completed:', results);
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ Unified cache test failed:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, value } = body;

    switch (action) {
      case 'set':
        await unifiedCache.setItem(key, value);
        return NextResponse.json({ success: true, action: 'set', key });
        
      case 'get':
        const data = await unifiedCache.getItem(key);
        return NextResponse.json({ success: true, action: 'get', key, data });
        
      case 'remove':
        await unifiedCache.removeItem(key);
        return NextResponse.json({ success: true, action: 'remove', key });
        
      case 'clear':
        await unifiedCache.clear();
        return NextResponse.json({ success: true, action: 'clear' });
        
      case 'stats':
        const stats = unifiedCache.getStats();
        const info = unifiedCache.getInfo();
        return NextResponse.json({ success: true, stats, info });
        
      case 'invalidate-version':
        await unifiedCache.invalidateByVersion(value);
        return NextResponse.json({ success: true, action: 'invalidate-version', version: value });
        
      case 'invalidate-event':
        await unifiedCache.invalidateByEvent(value);
        return NextResponse.json({ success: true, action: 'invalidate-event', event: value });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Unified cache POST failed:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed', details: error },
      { status: 500 }
    );
  }
}
