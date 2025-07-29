const { PrismaClient } = require('@prisma/client');

// Set the live database URL directly
process.env.DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19DUWlrdl8xano1dTFaT1NPVHlPdFQiLCJhcGlfa2V5IjoiMDFLMUFEN0syWVg3WTRHUFpTNTNTUDNDSlYiLCJ0ZW5hbnRfaWQiOiI3OWY2ODI1YzRlMWMwMDYxY2ZiNDIzODJiZjFjMjU1MjA5ZDhhNjUwNzhjZDc0YjlkMzY5MDJiY2NlYTExOGVmIiwiaW50ZXJuYWxfc2VjcmV0IjoiMTkxNDlkMTktNzBkZi00NTgyLTkyY2EtYjM1NjM0ZTRjNmY2In0.MTbX6uugEweLry85QmbtUEdVZyjl1y2Hm3E_AW49Odo";

const prisma = new PrismaClient();

async function testLiveDatabase() {
  try {
    console.log('🧪 Testing live Prisma database connection...');
    console.log('📡 Database URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
    
    // Test basic connection
    const emailCount = await prisma.prelaunchEmail.count();
    console.log(`✅ Database connection successful! Found ${emailCount} emails.`);
    
    // Test a simple query
    const sampleEmails = await prisma.prelaunchEmail.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    console.log('📧 Sample emails:');
    sampleEmails.forEach(email => {
      console.log(`   - ${email.email} (${email.name}) - ${email.status}`);
    });

  } catch (error) {
    console.error('❌ Live database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLiveDatabase(); 