require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testVideoPreview() {
  console.log('🧪 Testen van video preview URLs...');
  
  // Haal alle oefeningen op met video URLs
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('name, video_url')
    .not('video_url', 'is', null)
    .order('name');
    
  if (exercisesError) {
    console.error('❌ Fout bij ophalen oefeningen:', exercisesError);
    return;
  }
  
  console.log(`📋 ${exercises.length} oefeningen gevonden met video URLs\n`);
  
  let workingVideos = 0;
  let brokenVideos = 0;
  
  for (const exercise of exercises) {
    console.log(`🔍 Testen: ${exercise.name}`);
    console.log(`   URL: ${exercise.video_url}`);
    
    try {
      // Test de video URL
      const response = await fetch(exercise.video_url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VideoTest/1.0)'
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        console.log(`   ✅ Video werkt (Status: ${response.status})`);
        console.log(`   📹 Content-Type: ${contentType}`);
        console.log(`   📊 Grootte: ${contentLength ? Math.round(contentLength / 1024 / 1024) + 'MB' : 'Onbekend'}`);
        
        workingVideos++;
      } else {
        console.log(`   ❌ Video werkt niet (Status: ${response.status})`);
        brokenVideos++;
      }
    } catch (error) {
      console.log(`   ❌ Fout bij testen: ${error.message}`);
      brokenVideos++;
    }
    
    console.log('');
  }
  
  console.log('📊 SAMENVATTING:');
  console.log(`✅ Werkende videos: ${workingVideos}`);
  console.log(`❌ Niet-werkende videos: ${brokenVideos}`);
  console.log(`📹 Totaal getest: ${exercises.length}`);
  
  if (workingVideos > 0) {
    console.log('\n🎉 Video preview zou nu moeten werken!');
    console.log('💡 Ga naar de oefeningen pagina en hover over de video thumbnails.');
  } else {
    console.log('\n⚠️  Geen werkende videos gevonden. Controleer de URLs.');
  }
  
  // Test CDN functionaliteit
  console.log('\n🌐 CDN Test:');
  const testUrl = exercises[0]?.video_url;
  if (testUrl) {
    console.log(`Test URL: ${testUrl}`);
    
    // Simuleer de getCDNVideoUrl functie
    const cdnUrl = testUrl; // Voor nu geen transformatie
    console.log(`CDN URL: ${cdnUrl}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(cdnUrl, { method: 'HEAD' });
      const responseTime = Date.now() - startTime;
      
      console.log(`Response time: ${responseTime}ms`);
      console.log(`Cache headers: ${response.headers.get('cache-control') || 'Geen'}`);
    } catch (error) {
      console.log(`CDN test error: ${error.message}`);
    }
  }
}

testVideoPreview().catch(console.error);
