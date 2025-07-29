#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

console.log('🌱 Complete Database Seeding');
console.log('============================\n');

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      email: 'chiel@media2net.nl',
      fullName: 'Chiel van der Meer',
      role: 'ADMIN',
      rank: 'Elite',
      points: 1250,
      missionsCompleted: 45,
      bio: 'Founder van Top Tier Men - Building the ultimate platform for men\'s development',
      location: 'Nederland',
      status: 'ACTIVE',
      posts: 23,
      badges: 8
    },
    {
      email: 'rick@toptiermen.com',
      fullName: 'Rick van der Berg',
      role: 'ADMIN',
      rank: 'Master',
      points: 890,
      missionsCompleted: 32,
      bio: 'Lead developer en content creator',
      location: 'Amsterdam',
      status: 'ACTIVE',
      posts: 15,
      badges: 6
    },
    {
      email: 'alex@entrepreneur.io',
      fullName: 'Alex Thompson',
      role: 'USER',
      rank: 'Advanced',
      points: 650,
      missionsCompleted: 28,
      bio: 'Serial entrepreneur building the next big thing',
      location: 'San Francisco',
      status: 'ACTIVE',
      posts: 8,
      badges: 4
    },
    {
      email: 'emma@wellness.nl',
      fullName: 'Emma Bakker',
      role: 'USER',
      rank: 'Intermediate',
      points: 420,
      missionsCompleted: 18,
      bio: 'Wellness coach helping men achieve optimal health',
      location: 'Rotterdam',
      status: 'ACTIVE',
      posts: 12,
      badges: 3
    },
    {
      email: 'thomas@techstartup.com',
      fullName: 'Thomas Müller',
      role: 'USER',
      rank: 'Beginner',
      points: 180,
      missionsCompleted: 7,
      bio: 'Tech startup founder learning from the best',
      location: 'Berlin',
      status: 'ACTIVE',
      posts: 5,
      badges: 2
    },
    {
      email: 'mike@fitnesspro.com',
      fullName: 'Mike Johnson',
      role: 'USER',
      rank: 'Advanced',
      points: 720,
      missionsCompleted: 35,
      bio: 'Personal trainer and fitness coach',
      location: 'Los Angeles',
      status: 'ACTIVE',
      posts: 18,
      badges: 5
    },
    {
      email: 'david@mindset.nl',
      fullName: 'David van der Berg',
      role: 'USER',
      rank: 'Intermediate',
      points: 380,
      missionsCompleted: 15,
      bio: 'Mindset coach helping men unlock their potential',
      location: 'Utrecht',
      status: 'ACTIVE',
      posts: 9,
      badges: 3
    },
    {
      email: 'james@business.co.uk',
      fullName: 'James Wilson',
      role: 'USER',
      rank: 'Master',
      points: 950,
      missionsCompleted: 42,
      bio: 'Business consultant and mentor',
      location: 'London',
      status: 'ACTIVE',
      posts: 22,
      badges: 7
    }
  ];

  for (const userData of users) {
    try {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: {
          ...userData,
          password: hashedPassword,
          forumStatus: 'member',
          interests: { fitness: true, business: true, mindset: true },
          recentActivity: { lastLogin: new Date(), lastPost: new Date() }
        }
      });
      
      console.log(`✅ Seeded user: ${userData.email}`);
    } catch (error) {
      console.error(`❌ Error seeding user ${userData.email}:`, error);
    }
  }
  
  console.log('✅ Users seeding completed\n');
}

async function seedPrelaunchEmails() {
  console.log('📧 Seeding prelaunch emails...');
  
  const emails = [
    {
      email: 'john@startup.io',
      name: 'John Startup',
      status: 'ACTIVE',
      package: 'PREMIUM',
      source: 'Website'
    },
    {
      email: 'sarah@fitness.nl',
      name: 'Sarah Fitness',
      status: 'ACTIVE',
      package: 'BASIC',
      source: 'Social Media'
    },
    {
      email: 'mark@business.com',
      name: 'Mark Business',
      status: 'ACTIVE',
      package: 'ULTIMATE',
      source: 'Referral'
    },
    {
      email: 'lisa@mindset.co',
      name: 'Lisa Mindset',
      status: 'PENDING',
      package: 'BASIC',
      source: 'Email Campaign'
    },
    {
      email: 'peter@entrepreneur.nl',
      name: 'Peter Entrepreneur',
      status: 'ACTIVE',
      package: 'PREMIUM',
      source: 'Website'
    },
    {
      email: 'anna@wellness.com',
      name: 'Anna Wellness',
      status: 'ACTIVE',
      package: 'BASIC',
      source: 'Social Media'
    },
    {
      email: 'kevin@tech.io',
      name: 'Kevin Tech',
      status: 'ACTIVE',
      package: 'ULTIMATE',
      source: 'Referral'
    },
    {
      email: 'maria@coaching.nl',
      name: 'Maria Coaching',
      status: 'PENDING',
      package: 'BASIC',
      source: 'Email Campaign'
    },
    {
      email: 'robert@leadership.com',
      name: 'Robert Leadership',
      status: 'ACTIVE',
      package: 'PREMIUM',
      source: 'Website'
    },
    {
      email: 'sophie@development.co',
      name: 'Sophie Development',
      status: 'ACTIVE',
      package: 'BASIC',
      source: 'Social Media'
    }
  ];

  for (const emailData of emails) {
    try {
      await prisma.prelaunchEmail.upsert({
        where: { email: emailData.email },
        update: emailData,
        create: {
          ...emailData,
          subscribedAt: new Date(),
          notes: `Auto-generated for ${emailData.source}`
        }
      });
      
      console.log(`✅ Seeded email: ${emailData.email}`);
    } catch (error) {
      console.error(`❌ Error seeding email ${emailData.email}:`, error);
    }
  }
  
  console.log('✅ Prelaunch emails seeding completed\n');
}

async function seedBookCategories() {
  console.log('📚 Seeding book categories...');
  
  const categories = [
    {
      name: 'Mindset',
      description: 'Mentale groei en persoonlijke ontwikkeling',
      color: '#8BAE5A',
      icon: '🧠'
    },
    {
      name: 'Productiviteit',
      description: 'Effectiviteit en time management',
      color: '#4F46E5',
      icon: '⚡'
    },
    {
      name: 'Financiën',
      description: 'Financiële vrijheid en investeren',
      color: '#059669',
      icon: '💰'
    },
    {
      name: 'Psychologie',
      description: 'Gedrag en menselijke natuur',
      color: '#DC2626',
      icon: '🧠'
    },
    {
      name: 'Besluitvorming',
      description: 'Strategisch denken en keuzes maken',
      color: '#7C3AED',
      icon: '🎯'
    },
    {
      name: 'Leadership',
      description: 'Leiderschap en team management',
      color: '#EA580C',
      icon: '👑'
    },
    {
      name: 'Fitness',
      description: 'Fysieke gezondheid en training',
      color: '#DB2777',
      icon: '💪'
    }
  ];

  for (const categoryData of categories) {
    try {
      await prisma.bookCategory.upsert({
        where: { name: categoryData.name },
        update: categoryData,
        create: {
          ...categoryData,
          bookCount: 0
        }
      });
      
      console.log(`✅ Seeded category: ${categoryData.name}`);
    } catch (error) {
      console.error(`❌ Error seeding category ${categoryData.name}:`, error);
    }
  }
  
  console.log('✅ Book categories seeding completed\n');
}

async function seedBooks() {
  console.log('📖 Seeding books...');
  
  const books = [
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert Kiyosaki',
      description: 'De klassieker over financiële educatie en het verschil tussen assets en liabilities.',
      categories: ['Financiën', 'Mindset'],
      status: 'PUBLISHED',
      averageRating: 4.5,
      reviewCount: 12
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'Kleine veranderingen, opmerkelijke resultaten. Hoe je goede gewoontes opbouwt en slechte doorbreekt.',
      categories: ['Productiviteit', 'Psychologie'],
      status: 'PUBLISHED',
      averageRating: 4.8,
      reviewCount: 18
    },
    {
      title: 'Can\'t Hurt Me',
      author: 'David Goggins',
      description: 'Het verhaal van David Goggins en hoe je je mentale grenzen kunt verleggen.',
      categories: ['Mindset', 'Fitness'],
      status: 'PUBLISHED',
      averageRating: 4.7,
      reviewCount: 15
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      description: 'Timeless lessons on wealth, greed, and happiness.',
      categories: ['Financiën', 'Psychologie'],
      status: 'PUBLISHED',
      averageRating: 4.6,
      reviewCount: 9
    },
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      description: 'Rules for Focused Success in a Distracted World.',
      categories: ['Productiviteit', 'Mindset'],
      status: 'PUBLISHED',
      averageRating: 4.4,
      reviewCount: 11
    }
  ];

  for (const bookData of books) {
    try {
      // Find a random category
      const categories = await prisma.bookCategory.findMany();
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      await prisma.book.upsert({
        where: { title: bookData.title },
        update: bookData,
        create: {
          ...bookData,
          categoryId: randomCategory.id,
          coverUrl: `/books/${bookData.title.toLowerCase().replace(/\s+/g, '')}.jpg`
        }
      });
      
      console.log(`✅ Seeded book: ${bookData.title}`);
    } catch (error) {
      console.error(`❌ Error seeding book ${bookData.title}:`, error);
    }
  }
  
  console.log('✅ Books seeding completed\n');
}

async function seedUserGoals() {
  console.log('🎯 Seeding user goals...');
  
  const users = await prisma.user.findMany();
  const goalCategories = ['fitness', 'finance', 'mindset', 'business', 'relationships'];
  
  for (const user of users) {
    try {
      // Create 2-3 goals per user
      const numGoals = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numGoals; i++) {
        const category = goalCategories[Math.floor(Math.random() * goalCategories.length)];
        const isPrimary = i === 0; // First goal is primary
        
        await prisma.userGoal.create({
          data: {
            userId: user.id,
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Goal ${i + 1}`,
            description: `Een ${category} doel voor ${user.fullName}`,
            category: category,
            targetValue: Math.floor(Math.random() * 100) + 10,
            currentValue: Math.floor(Math.random() * 50),
            unit: category === 'fitness' ? 'kg' : category === 'finance' ? '€' : 'days',
            progressPercentage: Math.floor(Math.random() * 100),
            isActive: true,
            isPrimary: isPrimary,
            deadline: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within 90 days
          }
        });
      }
      
      console.log(`✅ Seeded goals for user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error seeding goals for user ${user.email}:`, error);
    }
  }
  
  console.log('✅ User goals seeding completed\n');
}

async function seedUserMissions() {
  console.log('🎯 Seeding user missions...');
  
  const users = await prisma.user.findMany();
  const missionCategories = ['daily', 'weekly', 'monthly', 'challenge'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];
  const statuses = ['PENDING', 'COMPLETED', 'FAILED'];
  
  for (const user of users) {
    try {
      // Create 3-5 missions per user
      const numMissions = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numMissions; i++) {
        const category = missionCategories[Math.floor(Math.random() * missionCategories.length)];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        await prisma.userMission.create({
          data: {
            userId: user.id,
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Mission ${i + 1}`,
            description: `Een ${category} missie voor ${user.fullName}`,
            category: category,
            difficulty: difficulty,
            points: difficulty === 'EASY' ? 10 : difficulty === 'MEDIUM' ? 20 : 30,
            status: status,
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
            completedAt: status === 'COMPLETED' ? new Date() : null
          }
        });
      }
      
      console.log(`✅ Seeded missions for user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error seeding missions for user ${user.email}:`, error);
    }
  }
  
  console.log('✅ User missions seeding completed\n');
}

async function seedEvents() {
  console.log('🎉 Seeding events...');
  
  const users = await prisma.user.findMany();
  const adminUsers = users.filter(user => user.role === 'ADMIN');
  
  const events = [
    {
      title: 'Top Tier Men Meetup Amsterdam',
      description: 'Een avond vol inspiratie, netwerken en groei met gelijkgestemde mannen.',
      location: 'Amsterdam, Nederland',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      maxParticipants: 50,
      status: 'UPCOMING',
      isFeatured: true
    },
    {
      title: 'Fitness Challenge Weekend',
      description: 'Een intensief weekend vol training, voeding en mindset coaching.',
      location: 'Ardennen, België',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
      maxParticipants: 25,
      status: 'UPCOMING',
      isFeatured: true
    },
    {
      title: 'Business Mastermind Session',
      description: 'Exclusieve mastermind sessie voor ondernemers en business owners.',
      location: 'Rotterdam, Nederland',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      maxParticipants: 15,
      status: 'UPCOMING',
      isFeatured: false
    },
    {
      title: 'Mindset Workshop',
      description: 'Workshop over mentale weerbaarheid en persoonlijke groei.',
      location: 'Utrecht, Nederland',
      startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      maxParticipants: 30,
      status: 'UPCOMING',
      isFeatured: false
    }
  ];

  for (const eventData of events) {
    try {
      const organizer = adminUsers[Math.floor(Math.random() * adminUsers.length)];
      
      await prisma.event.create({
        data: {
          ...eventData,
          organizerId: organizer.id,
          currentParticipants: Math.floor(Math.random() * 10),
          registrationDeadline: new Date(eventData.startDate.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days before
        }
      });
      
      console.log(`✅ Seeded event: ${eventData.title}`);
    } catch (error) {
      console.error(`❌ Error seeding event ${eventData.title}:`, error);
    }
  }
  
  console.log('✅ Events seeding completed\n');
}

async function seedUserXp() {
  console.log('⭐ Seeding user XP...');
  
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    try {
      const totalXp = Math.floor(Math.random() * 1000) + 100; // Random XP between 100-1100
      
      await prisma.userXp.upsert({
        where: { userId: user.id },
        update: { totalXp },
        create: {
          userId: user.id,
          totalXp,
          rankAchievedAt: new Date()
        }
      });
      
      console.log(`✅ Seeded XP for user: ${user.email} (${totalXp} XP)`);
    } catch (error) {
      console.error(`❌ Error seeding XP for user ${user.email}:`, error);
    }
  }
  
  console.log('✅ User XP seeding completed\n');
}

async function runCompleteSeeding() {
  try {
    console.log('🔄 Starting complete database seeding...\n');
    
    // Run seeding in order
    await seedUsers();
    await seedPrelaunchEmails();
    await seedBookCategories();
    await seedBooks();
    await seedUserGoals();
    await seedUserMissions();
    await seedEvents();
    await seedUserXp();
    
    console.log('🎉 Complete seeding finished successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log('- Users seeded (8 users)');
    console.log('- Prelaunch emails seeded (10 emails)');
    console.log('- Book categories seeded (7 categories)');
    console.log('- Books seeded (5 books)');
    console.log('- User goals seeded (2-3 per user)');
    console.log('- User missions seeded (3-5 per user)');
    console.log('- Events seeded (4 events)');
    console.log('- User XP seeded (100-1100 XP per user)');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
runCompleteSeeding(); 