const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncToLiveDatabase() {
  try {
    console.log('🔄 Starting database synchronization to live Prisma database...');

    // Test connection
    console.log('📡 Testing database connection...');
    const testConnection = await prisma.prelaunchEmail.count();
    console.log(`✅ Database connection successful. Found ${testConnection} existing emails.`);

    // Sample data to sync
    const sampleEmails = [
      {
        email: 'anna@personal.nl',
        name: 'Anna de Vries',
        source: 'Social Media',
        status: 'PENDING',
        package: 'PREMIUM',
        notes: 'Interesse in premium pakket'
      },
      {
        email: 'david@corporate.nl',
        name: 'David Smith',
        source: 'Direct Contact',
        status: 'ACTIVE',
        package: 'ULTIMATE',
        notes: 'Corporate klant - hoge prioriteit'
      },
      {
        email: 'lisa@healthcoach.com',
        name: 'Lisa van der Berg',
        source: 'Website Form',
        status: 'UNSUBSCRIBED',
        package: 'BASIC',
        notes: 'Uitgeschreven na 1 week'
      },
      {
        email: 'mike@startup.io',
        name: 'Mike Chen',
        source: 'Referral',
        status: 'ACTIVE',
        package: 'PREMIUM',
        notes: 'Doorverwezen door bestaande klant'
      },
      {
        email: 'sarah@fitnesspro.nl',
        name: 'Sarah Johnson',
        source: 'Email Campaign',
        status: 'ACTIVE',
        package: 'ULTIMATE',
        notes: 'Fitness professional - veel potentieel'
      },
      {
        email: 'rob@example.com',
        name: 'Rob van Dijk',
        source: 'Social Media',
        status: 'PENDING',
        package: 'BASIC',
        notes: 'Nieuwe aanmelding'
      },
      {
        email: 'maria@consulting.nl',
        name: 'Maria Rodriguez',
        source: 'Direct Contact',
        status: 'ACTIVE',
        package: 'PREMIUM',
        notes: 'Consultant - geïnteresseerd in business features'
      },
      {
        email: 'thomas@techstartup.com',
        name: 'Thomas Müller',
        source: 'Website Form',
        status: 'ACTIVE',
        package: 'ULTIMATE',
        notes: 'Tech startup founder'
      },
      {
        email: 'emma@wellness.nl',
        name: 'Emma Bakker',
        source: 'Email Campaign',
        status: 'PENDING',
        package: 'BASIC',
        notes: 'Wellness coach'
      },
      {
        email: 'alex@entrepreneur.io',
        name: 'Alex Thompson',
        source: 'Referral',
        status: 'ACTIVE',
        package: 'PREMIUM',
        notes: 'Entrepreneur - doorverwezen door Mike'
      }
    ];

    console.log('📧 Syncing prelaunch emails...');
    
    for (const emailData of sampleEmails) {
      try {
        // Check if email already exists
        const existingEmail = await prisma.prelaunchEmail.findUnique({
          where: { email: emailData.email }
        });

        if (existingEmail) {
          console.log(`⏭️  Email ${emailData.email} already exists, skipping...`);
          continue;
        }

        // Create new email
        const newEmail = await prisma.prelaunchEmail.create({
          data: {
            email: emailData.email,
            name: emailData.name,
            source: emailData.source,
            status: emailData.status,
            package: emailData.package,
            notes: emailData.notes
          }
        });

        console.log(`✅ Created email: ${newEmail.email} (${newEmail.name})`);
      } catch (error) {
        console.error(`❌ Error creating email ${emailData.email}:`, error.message);
      }
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    try {
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@toptiermen.com' },
        update: {},
        create: {
          email: 'admin@toptiermen.com',
          fullName: 'Admin User',
          role: 'ADMIN',
          status: 'ACTIVE',
          username: 'admin',
          rank: 'Legend',
          points: 1000,
          missionsCompleted: 50
        }
      });
      console.log(`✅ Admin user created/updated: ${adminUser.email}`);
    } catch (error) {
      console.error('❌ Error creating admin user:', error.message);
    }

    // Create sample book categories
    console.log('📚 Creating book categories...');
    const bookCategories = [
      { name: 'Personal Development', description: 'Books for personal growth and self-improvement' },
      { name: 'Business & Leadership', description: 'Books about business strategy and leadership' },
      { name: 'Health & Fitness', description: 'Books about physical and mental health' },
      { name: 'Mindset & Psychology', description: 'Books about psychology and mindset' },
      { name: 'Productivity', description: 'Books about productivity and time management' },
      { name: 'Finance & Investing', description: 'Books about financial literacy and investing' }
    ];

    for (const categoryData of bookCategories) {
      try {
        const category = await prisma.bookCategory.upsert({
          where: { name: categoryData.name },
          update: {},
          create: {
            name: categoryData.name,
            description: categoryData.description
          }
        });
        console.log(`✅ Book category created: ${category.name}`);
      } catch (error) {
        console.error(`❌ Error creating book category ${categoryData.name}:`, error.message);
      }
    }

    // Create sample books
    console.log('📖 Creating sample books...');
    const sampleBooks = [
      {
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        categoryName: 'Personal Development',
        description: 'Master Your Mind and Defy the Odds',
        isbn: '978-1544512273',
        publishedYear: 2018,
        pages: 364,
        coverImage: '/books/canthurtme.jpg',
        status: 'AVAILABLE'
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        categoryName: 'Personal Development',
        description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
        isbn: '978-0735211292',
        publishedYear: 2018,
        pages: 320,
        coverImage: '/books/atomichabits.jpg',
        status: 'AVAILABLE'
      }
    ];

    for (const bookData of sampleBooks) {
      try {
        // Find category
        const category = await prisma.bookCategory.findUnique({
          where: { name: bookData.categoryName }
        });

        if (!category) {
          console.log(`⚠️  Category ${bookData.categoryName} not found, skipping book ${bookData.title}`);
          continue;
        }

        const book = await prisma.book.upsert({
          where: { isbn: bookData.isbn },
          update: {},
          create: {
            title: bookData.title,
            author: bookData.author,
            categoryId: category.id,
            description: bookData.description,
            isbn: bookData.isbn,
            publishedYear: bookData.publishedYear,
            pages: bookData.pages,
            coverImage: bookData.coverImage,
            status: bookData.status
          }
        });
        console.log(`✅ Book created: ${book.title} by ${book.author}`);
      } catch (error) {
        console.error(`❌ Error creating book ${bookData.title}:`, error.message);
      }
    }

    // Final count
    const finalEmailCount = await prisma.prelaunchEmail.count();
    const finalUserCount = await prisma.user.count();
    const finalCategoryCount = await prisma.bookCategory.count();
    const finalBookCount = await prisma.book.count();

    console.log('\n🎉 Database synchronization completed!');
    console.log('📊 Final counts:');
    console.log(`   📧 Emails: ${finalEmailCount}`);
    console.log(`   👤 Users: ${finalUserCount}`);
    console.log(`   📚 Book Categories: ${finalCategoryCount}`);
    console.log(`   📖 Books: ${finalBookCount}`);

  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the synchronization
syncToLiveDatabase(); 