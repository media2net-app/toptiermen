const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupPrismaDatabase() {
  console.log('🚀 Setting up Prisma database with initial data...\n');

  try {
    // Step 1: Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@toptiermen.com' },
      update: {},
      create: {
        email: 'admin@toptiermen.com',
        fullName: 'Platform Administrator',
        role: 'ADMIN',
        rank: 'Elite',
        points: 1000,
        missionsCompleted: 50,
        bio: 'Top Tier Men Platform Administrator',
        location: 'Netherlands',
        interests: ['Leadership', 'Management', 'Technology', 'Community'],
        forumStatus: 'admin',
        status: 'ACTIVE',
        posts: 0,
        badges: 0
      }
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Step 2: Create prelaunch emails
    console.log('\n📧 Creating prelaunch emails...');
    const prelaunchEmails = [
      {
        email: 'info@vdweide-enterprise.com',
        name: 'Van der Weide Enterprise',
        source: 'Direct Contact',
        status: 'ACTIVE',
        package: 'PREMIUM',
        notes: 'Enterprise client - interested in team packages'
      },
      {
        email: 'fvanhouten1986@gmail.com',
        name: 'Frank van Houten',
        source: 'Direct Contact',
        status: 'ACTIVE',
        package: 'BASIC',
        notes: 'Personal fitness goals - found via LinkedIn'
      },
      {
        email: 'hortulanusglobalservices@gmail.com',
        name: 'Hortulanus Global Services',
        source: 'Direct Contact',
        status: 'ACTIVE',
        package: 'ULTIMATE',
        notes: 'Business client - looking for comprehensive solution'
      },
      {
        email: 'chiel@media2net.nl',
        name: 'Chiel van der Weide',
        source: 'Website Form',
        status: 'ACTIVE',
        package: 'PREMIUM',
        notes: 'Founder - early adopter'
      },
      {
        email: 'rob@example.com',
        name: 'Rob van Dijk',
        source: 'Social Media',
        status: 'PENDING',
        package: 'BASIC',
        notes: 'Interested in basic package'
      },
      {
        email: 'sarah@fitnesspro.nl',
        name: 'Sarah Johnson',
        source: 'Email Campaign',
        status: 'ACTIVE',
        package: 'ULTIMATE',
        notes: 'Professional trainer - high value prospect'
      },
      {
        email: 'mike@startup.io',
        name: 'Mike Chen',
        source: 'Referral',
        status: 'ACTIVE',
        package: 'PREMIUM',
        notes: 'Referred by existing client'
      },
      {
        email: 'lisa@healthcoach.com',
        name: 'Lisa van der Berg',
        source: 'Website Form',
        status: 'UNSUBSCRIBED',
        package: 'BASIC',
        notes: 'Changed mind about subscription'
      },
      {
        email: 'david@corporate.nl',
        name: 'David Smith',
        source: 'Direct Contact',
        status: 'ACTIVE',
        package: 'ULTIMATE',
        notes: 'Corporate wellness program'
      },
      {
        email: 'anna@personal.nl',
        name: 'Anna de Vries',
        source: 'Social Media',
        status: 'PENDING',
        package: 'PREMIUM',
        notes: 'Influencer - potential partnership'
      }
    ];

    for (const emailData of prelaunchEmails) {
      await prisma.prelaunchEmail.upsert({
        where: { email: emailData.email },
        update: {},
        create: emailData
      });
    }
    console.log(`✅ Created ${prelaunchEmails.length} prelaunch emails`);

    // Step 3: Create book categories
    console.log('\n📚 Creating book categories...');
    const bookCategories = [
      {
        name: 'Mindset',
        description: 'Mentale groei en persoonlijke ontwikkeling',
        color: '#8BAE5A',
        icon: '🧠'
      },
      {
        name: 'Productiviteit',
        description: 'Time management en focus',
        color: '#FFD700',
        icon: '⚡'
      },
      {
        name: 'Financiën',
        description: 'Geld, investeren en business',
        color: '#f0a14f',
        icon: '💰'
      },
      {
        name: 'Psychologie',
        description: 'Gedrag en mentale modellen',
        color: '#9B59B6',
        icon: '🧠'
      },
      {
        name: 'Besluitvorming',
        description: 'Strategisch denken en keuzes maken',
        color: '#3498DB',
        icon: '🎯'
      },
      {
        name: 'Leadership',
        description: 'Leiderschap en management',
        color: '#E74C3C',
        icon: '👑'
      }
    ];

    for (const categoryData of bookCategories) {
      await prisma.bookCategory.upsert({
        where: { name: categoryData.name },
        update: {},
        create: categoryData
      });
    }
    console.log(`✅ Created ${bookCategories.length} book categories`);

    // Step 4: Create sample books
    console.log('\n📖 Creating sample books...');
    const mindsetCategory = await prisma.bookCategory.findFirst({
      where: { name: 'Mindset' }
    });

    const books = [
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        coverUrl: '/books/richdadpoordad.jpg',
        description: 'Wat de rijken hun kinderen leren over geld dat de armen en de middenklasse niet doen!',
        categories: ['Mindset', 'Financiën'],
        affiliateBol: 'https://www.bol.com/nl/nl/p/rich-dad-poor-dad/1001004001234567/',
        affiliateAmazon: 'https://www.amazon.nl/Rich-Dad-Poor-Robert-Kiyosaki/dp/1612680011/',
        status: 'PUBLISHED',
        averageRating: 4.5,
        reviewCount: 1250,
        categoryId: mindsetCategory?.id || 1
      },
      {
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        coverUrl: '/books/canthurtme.jpg',
        description: 'Master Your Mind and Defy the Odds',
        categories: ['Mindset', 'Leadership'],
        affiliateBol: 'https://www.bol.com/nl/nl/p/can-t-hurt-me/9200000093456789/',
        affiliateAmazon: 'https://www.amazon.nl/Cant-Hurt-Me-David-Goggins/dp/1544512279/',
        status: 'PUBLISHED',
        averageRating: 4.8,
        reviewCount: 890,
        categoryId: mindsetCategory?.id || 1
      }
    ];

    for (const bookData of books) {
      await prisma.book.upsert({
        where: { title: bookData.title },
        update: {},
        create: bookData
      });
    }
    console.log(`✅ Created ${books.length} sample books`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Database credentials:');
    console.log('Admin Email: admin@toptiermen.com');
    console.log('Admin Password: Admin123! (you\'ll need to set up authentication)');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupPrismaDatabase(); 