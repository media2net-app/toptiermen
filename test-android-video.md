# Android Video Fix Test Plan

## 🎯 Doel
Verifiëren dat video's op Android niet meer bevriezen tijdens playback.

## 📱 Test Setup

### Vereisten:
- Android device (fysiek of emulator)
- Chrome browser op Android
- Academy les met HLS video (.m3u8)

### Chrome Remote Debugging Setup:
1. Op Android: Schakel "Developer Options" in
2. Schakel "USB Debugging" in
3. Verbind met computer via USB
4. Op desktop Chrome: ga naar `chrome://inspect`
5. Selecteer je Android device

## 🧪 Test Scenario's

### Test 1: Normale Playback (5+ minuten)
**Stappen:**
1. Open academy les met video op Android
2. Start video (klik op play - GEEN autoplay op mobiel!)
3. Laat video 5+ minuten afspelen
4. Monitor console voor watchdog berichten

**Verwacht gedrag:**
- ✅ Video speelt smooth af
- ✅ Geen frozen frames terwijl audio doorgaat
- ✅ Console logs tonen: `[Android Fix] Frozen frames detected, restarting playback...` (ALLEEN bij detectie)

**Fail scenario:**
- ❌ Video beeldt bevriest, audio gaat door
- ❌ Geen automatic recovery

### Test 2: Seek Test (springen in video)
**Stappen:**
1. Start video op Android
2. Spring naar verschillende tijden in de video (0:30, 1:00, 2:00, etc.)
3. Laat na elke seek 30 seconden afspelen

**Verwacht gedrag:**
- ✅ Video laadt snel na seek
- ✅ Geen frozen frames na seek
- ✅ Buffering indicator verdwijnt snel

### Test 3: Netwerk Stress Test
**Stappen:**
1. Start video op Android
2. Schakel tussen WiFi en mobiele data
3. Of: throttle netwerk in Chrome DevTools (3G/4G)

**Verwacht gedrag:**
- ✅ Video past kwaliteit aan
- ✅ Geen permanente freeze bij netwerk wisseling
- ✅ Automatic recovery als buffering stopt

### Test 4: Background/Foreground Test
**Stappen:**
1. Start video op Android
2. Schakel naar andere app (background)
3. Keer terug naar browser

**Verwacht gedrag:**
- ✅ Video pauzeert in background
- ✅ Video herstart correct bij terugkeer
- ✅ Geen frozen frames na resume

## 📊 Console Monitoring

### Normale situatie (geen problemen):
```
[HLS.js] Loading video...
[HLS.js] Buffer appended
[Video] Playing started
```

### Bij freeze detectie (watchdog werkt):
```
[Android Fix] Frozen frames detected, restarting playback...
[HLS.js] Restarting load...
[Video] Playback recovered
```

### Bij probleem (watchdog werkt niet):
```
[Video] Playing started
(geen logs meer, maar video still)
```

## 🔧 Debug Commands

### In Chrome DevTools Console op Android device:

```javascript
// Check of Android optimalisaties actief zijn
document.querySelector('video').preload; // Moet "none" zijn
document.querySelector('video').hasAttribute('x5-video-player-type'); // Moet true zijn

// Check buffer status
const video = document.querySelector('video');
if (video.buffered.length > 0) {
  console.log('Buffered:', video.buffered.end(0) - video.currentTime, 'seconds');
}

// Forceer freeze test (gevaarlijk - alleen voor testing!)
video.pause();
setTimeout(() => {
  // Dit simuleert een situatie waar currentTime niet beweegt
  console.log('Testing freeze detection...');
}, 3000);
```

## ✅ Success Criteria

**De fix is succesvol als:**
1. ✅ Video speelt minimaal 5 minuten zonder freeze
2. ✅ Bij freeze: automatic recovery binnen 2-4 seconden
3. ✅ Console toont watchdog activatie bij problemen
4. ✅ Geen handmatige refresh nodig
5. ✅ Werkt op verschillende Android devices (test op 2+)

## 📝 Test Devices

Idealiter testen op:
- [ ] Android 10+ (Samsung/Pixel)
- [ ] Android 8-9 (oudere devices)
- [ ] Chrome vs Samsung Internet browser
- [ ] WiFi vs 4G/5G

## 🚨 Fallback Plan

Als de fix niet werkt:
1. Check console errors voor HLS.js
2. Test met simpele MP4 video (geen HLS)
3. Overweeg server-side transcoding naar lagere bitrate
4. Test met native `<video>` element (zonder HLS.js)

## 📞 Rapportage

Na testing, deel:
- Device model & Android versie
- Browser (Chrome/Samsung Internet/etc.)
- Netwerk conditie (WiFi/4G/5G)
- Console logs bij problemen
- Screenshots/screen recording indien mogelijk

