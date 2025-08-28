const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔍 CHECKING DNS RECORDS FOR TOPTIERMEN.EU');
console.log('==========================================\n');

async function checkDNSRecords() {
  try {
    console.log('📋 STEP 1: Checking MX Records');
    console.log('-------------------------------');
    
    try {
      const { stdout: mxOutput } = await execAsync('dig MX toptiermen.eu +short');
      console.log('📧 MX Records:');
      if (mxOutput.trim()) {
        console.log(mxOutput.trim());
      } else {
        console.log('   ❌ No MX records found');
      }
    } catch (error) {
      console.log('   ❌ Error checking MX records:', error.message);
    }
    
    console.log('\n📋 STEP 2: Checking SPF Record');
    console.log('-------------------------------');
    
    try {
      const { stdout: spfOutput } = await execAsync('dig TXT toptiermen.eu +short');
      console.log('🔒 SPF Records:');
      if (spfOutput.trim()) {
        const lines = spfOutput.trim().split('\n');
        lines.forEach(line => {
          if (line.includes('v=spf1')) {
            console.log(`   ✅ ${line}`);
          } else {
            console.log(`   📝 ${line}`);
          }
        });
      } else {
        console.log('   ❌ No SPF records found');
      }
    } catch (error) {
      console.log('   ❌ Error checking SPF records:', error.message);
    }
    
    console.log('\n📋 STEP 3: Checking DKIM Records');
    console.log('--------------------------------');
    
    try {
      const { stdout: dkimOutput } = await execAsync('dig TXT default._domainkey.toptiermen.eu +short');
      console.log('🔐 DKIM Records:');
      if (dkimOutput.trim()) {
        const lines = dkimOutput.trim().split('\n');
        lines.forEach(line => {
          if (line.includes('v=DKIM1')) {
            console.log(`   ✅ ${line.substring(0, 50)}...`);
          } else {
            console.log(`   📝 ${line}`);
          }
        });
      } else {
        console.log('   ❌ No DKIM records found');
      }
    } catch (error) {
      console.log('   ❌ Error checking DKIM records:', error.message);
    }
    
    console.log('\n📋 STEP 4: Checking DMARC Records');
    console.log('---------------------------------');
    
    try {
      const { stdout: dmarcOutput } = await execAsync('dig TXT _dmarc.toptiermen.eu +short');
      console.log('📋 DMARC Records:');
      if (dmarcOutput.trim()) {
        const lines = dmarcOutput.trim().split('\n');
        lines.forEach(line => {
          if (line.includes('v=DMARC1')) {
            console.log(`   ✅ ${line}`);
          } else {
            console.log(`   📝 ${line}`);
          }
        });
      } else {
        console.log('   ❌ No DMARC records found');
      }
    } catch (error) {
      console.log('   ❌ Error checking DMARC records:', error.message);
    }
    
    console.log('\n📋 STEP 5: Checking A Records');
    console.log('-----------------------------');
    
    try {
      const { stdout: aOutput } = await execAsync('dig A toptiermen.eu +short');
      console.log('🌐 A Records:');
      if (aOutput.trim()) {
        console.log(aOutput.trim());
      } else {
        console.log('   ❌ No A records found');
      }
    } catch (error) {
      console.log('   ❌ Error checking A records:', error.message);
    }
    
    console.log('\n📋 STEP 6: Recommended DNS Configuration');
    console.log('========================================');
    
    console.log('📧 MX Record (for receiving emails):');
    console.log('   toptiermen.eu. IN MX 10 mail.toptiermen.eu.');
    console.log('   toptiermen.eu. IN MX 20 backup-mail.toptiermen.eu.');
    
    console.log('\n🔒 SPF Record (for sending emails):');
    console.log('   toptiermen.eu. IN TXT "v=spf1 include:_spf.toptiermen.eu ~all"');
    console.log('   _spf.toptiermen.eu. IN TXT "v=spf1 ip4:YOUR_SERVER_IP ~all"');
    
    console.log('\n🔐 DKIM Record (for email authentication):');
    console.log('   default._domainkey.toptiermen.eu. IN TXT "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"');
    
    console.log('\n📋 DMARC Record (for email policy):');
    console.log('   _dmarc.toptiermen.eu. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@toptiermen.eu; ruf=mailto:dmarc@toptiermen.eu"');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('==============');
    console.log('1. Check the email headers in your inbox for the sending IP address');
    console.log('2. Add the sending IP to your SPF record');
    console.log('3. Configure DKIM with your mail server');
    console.log('4. Set up DMARC for additional protection');
    console.log('5. Test email deliverability after changes');
    
    console.log('\n🔍 To find your sending IP:');
    console.log('1. Open the test email in your email client');
    console.log('2. View the email headers (View > Headers or similar)');
    console.log('3. Look for "Received from" or "X-Originating-IP"');
    console.log('4. The IP address will be the one sending the email');
    
  } catch (error) {
    console.error('❌ Error checking DNS records:', error.message);
  }
}

// Run the check
checkDNSRecords();
