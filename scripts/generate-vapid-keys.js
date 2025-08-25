const webpush = require('web-push');

console.log('🔑 Generating VAPID keys for push notifications...\n');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated Successfully!\n');

console.log('📋 Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);

console.log('🔧 Environment Variables Setup:');
console.log('=====================================');
console.log('1. Open .env.local file');
console.log('2. Add the two lines above');
console.log('3. Save the file');
console.log('4. Restart your development server\n');

console.log('💡 VAPID Key Details:');
console.log('- Public Key: Used by the browser to encrypt push messages');
console.log('- Private Key: Used by the server to sign push messages');
console.log('- Both keys are required for push notifications to work\n');

console.log('🚀 Next Steps:');
console.log('1. Add the keys to .env.local');
console.log('2. Restart the development server');
console.log('3. Install the PWA on your phone');
console.log('4. Enable push notifications in the app');
console.log('5. Check the admin dashboard for subscriptions');
