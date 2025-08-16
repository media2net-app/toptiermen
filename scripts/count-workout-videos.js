const fs = require('fs');
const path = require('path');

function countWorkoutVideos() {
  console.log('📊 WORKOUT VIDEOS TELLING');
  console.log('=========================');
  
  const videoDir = path.join(process.cwd(), 'public', 'video-oefeningen');
  
  // Controleer of de directory bestaat
  if (!fs.existsSync(videoDir)) {
    console.error('❌ Video directory niet gevonden:', videoDir);
    return;
  }

  // Lees alle video bestanden
  const allFiles = fs.readdirSync(videoDir);
  const videoFiles = allFiles.filter(file => file.toLowerCase().endsWith('.mp4'));
  
  // Filter op workout videos (geen cijfer reeks bestanden)
  const workoutVideos = videoFiles.filter(file => {
    // Exclude files that start with date patterns like "2025-08-03-dpxguneujul.mov"
    const isDateFile = /^\d{4}-\d{2}-\d{2}-/.test(file);
    const isWorkoutVideo = !isDateFile && file.includes('.mp4');
    return isWorkoutVideo;
  });

  console.log(`\n📁 Totaal bestanden in map: ${allFiles.length}`);
  console.log(`🎥 Totaal video bestanden: ${videoFiles.length}`);
  console.log(`💪 Workout videos (geen cijfer reeks): ${workoutVideos.length}`);
  
  console.log('\n📋 WORKOUT VIDEOS:');
  console.log('==================');
  workoutVideos.sort().forEach((video, index) => {
    const filePath = path.join(videoDir, video);
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`${index + 1}. ${video} (${fileSizeMB} MB)`);
  });

  console.log('\n📊 SAMENVATTING:');
  console.log('================');
  console.log(`✅ Workout videos gevonden: ${workoutVideos.length}`);
  console.log(`📁 Map: public/video-oefeningen/`);
  console.log(`🎯 Status: Klaar voor upload naar Supabase storage`);
  
  if (workoutVideos.length > 0) {
    console.log('\n💡 VOLGENDE STAPPEN:');
    console.log('====================');
    console.log('1. Run: node scripts/upload-local-videos.js');
    console.log('2. Controleer mapping in het script');
    console.log('3. Koppel videos aan oefeningen in database');
  }
}

countWorkoutVideos();
