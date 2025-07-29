const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function simpleMigration() {
  console.log('🔄 Starting simple migration...');

  try {
    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@toptiermen.com' },
      update: {},
      create: {
        email: 'admin@toptiermen.com',
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
        rank: 'Admin',
        points: 1000,
        missionsCompleted: 50,
      }
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // 2. Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      {
        email: 'chiel@media2net.nl',
        fullName: 'Chiel',
        role: 'USER',
        rank: 'Intermediate',
        points: 500,
        missionsCompleted: 25,
      },
      {
        email: 'rob@media2net.nl',
        fullName: 'Rob',
        role: 'USER',
        rank: 'Beginner',
        points: 200,
        missionsCompleted: 10,
      }
    ];

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: hashedPassword,
          status: 'ACTIVE',
        }
      });

      console.log(`✅ User created: ${user.email}`);
    }

    // 3. Create book categories
    console.log('📚 Creating book categories...');
    const categories = [
      {
        name: 'Personal Development',
        description: 'Books about personal growth and self-improvement',
        color: '#8BAE5A',
        icon: '📈'
      },
      {
        name: 'Business & Leadership',
        description: 'Books about business strategy and leadership',
        color: '#B6C948',
        icon: '💼'
      },
      {
        name: 'Health & Fitness',
        description: 'Books about physical and mental health',
        color: '#4A90E2',
        icon: '💪'
      },
      {
        name: 'Mindset & Psychology',
        description: 'Books about psychology and mindset',
        color: '#9B59B6',
        icon: '🧠'
      },
      {
        name: 'Finance & Investing',
        description: 'Books about money management and investing',
        color: '#F39C12',
        icon: '💰'
      },
      {
        name: 'Productivity & Time Management',
        description: 'Books about getting more done',
        color: '#E74C3C',
        icon: '⏰'
      }
    ];

    for (const categoryData of categories) {
      const category = await prisma.bookCategory.upsert({
        where: { name: categoryData.name },
        update: {},
        create: categoryData
      });

      console.log(`✅ Category created: ${category.name}`);
    }

    // 4. Create sample books
    console.log('📖 Creating sample books...');
    const books = [
      {
        title: 'Can\'t Hurt Me',
        author: 'David Goggins',
        description: 'Master Your Mind and Defy the Odds',
        categories: ['Personal Development', 'Mindset & Psychology'],
        coverUrl: '/books/canthurtme.jpg',
        status: 'PUBLISHED',
        averageRating: 4.8,
        reviewCount: 15,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
        categories: ['Personal Development', 'Productivity & Time Management'],
        status: 'PUBLISHED',
        averageRating: 4.7,
        reviewCount: 12,
      },
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        description: 'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!',
        categories: ['Finance & Investing', 'Personal Development'],
        status: 'PUBLISHED',
        averageRating: 4.5,
        reviewCount: 8,
      }
    ];

    for (const bookData of books) {
      const category = await prisma.bookCategory.findFirst({
        where: { name: bookData.categories[0] }
      });

      const book = await prisma.book.upsert({
        where: { title: bookData.title },
        update: {},
        create: {
          ...bookData,
          categoryId: category?.id || 1,
        }
      });

      console.log(`✅ Book created: ${book.title}`);
    }

    // 5. Create sample prelaunch emails
    console.log('📧 Creating sample prelaunch emails...');
    const emails = [
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
      }
    ];

    for (const emailData of emails) {
      const email = await prisma.prelaunchEmail.upsert({
        where: { email: emailData.email },
        update: {},
        create: emailData
      });

      console.log(`✅ Email created: ${email.email}`);
    }

    // 6. Create sample user goals
    console.log('🎯 Creating sample user goals...');
    const goals = [
      {
        userId: adminUser.id,
        title: 'Lose 10kg',
        description: 'Get in better shape for summer',
        category: 'Health & Fitness',
        targetValue: 10,
        currentValue: 3,
        unit: 'kg',
        deadline: new Date('2024-06-01'),
        progressPercentage: 30,
        isActive: true,
        isPrimary: true,
      },
      {
        userId: adminUser.id,
        title: 'Read 20 books',
        description: 'Improve knowledge and skills',
        category: 'Personal Development',
        targetValue: 20,
        currentValue: 8,
        unit: 'books',
        deadline: new Date('2024-12-31'),
        progressPercentage: 40,
        isActive: true,
        isPrimary: false,
      }
    ];

    for (const goalData of goals) {
      const goal = await prisma.userGoal.create({
        data: goalData
      });

      console.log(`✅ Goal created: ${goal.title}`);
    }

    // 7. Create sample user missions
    console.log('🚀 Creating sample user missions...');
    const missions = [
      {
        userId: adminUser.id,
        title: 'Complete 30-day workout challenge',
        description: 'Work out every day for 30 days',
        category: 'Health & Fitness',
        difficulty: 'MEDIUM',
        points: 50,
        status: 'PENDING',
        dueDate: new Date('2024-02-01'),
      },
      {
        userId: adminUser.id,
        title: 'Read 5 books this month',
        description: 'Read 5 personal development books',
        category: 'Personal Development',
        difficulty: 'EASY',
        points: 30,
        status: 'COMPLETED',
        completedAt: new Date('2024-01-15'),
      }
    ];

    for (const missionData of missions) {
      const mission = await prisma.userMission.create({
        data: missionData
      });

      console.log(`✅ Mission created: ${mission.title}`);
    }

    console.log('🎉 Simple migration completed successfully!');
    console.log('📋 Summary:');
    console.log('   👤 Users: 3 (admin + 2 sample users)');
    console.log('   📚 Categories: 6 book categories');
    console.log('   📖 Books: 3 sample books');
    console.log('   📧 Emails: 5 prelaunch emails');
    console.log('   🎯 Goals: 2 sample goals');
    console.log('   🚀 Missions: 2 sample missions');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
simpleMigration(); 