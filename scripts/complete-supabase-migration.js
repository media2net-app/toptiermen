#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://media2net.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

console.log('🚀 Complete Supabase to Prisma Migration');
console.log('==========================================\n');

async function migrateUsers() {
  console.log('👥 Migrating users...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`📊 Found ${users.length} users to migrate`);
    
    for (const user of users) {
      try {
        // Hash password if it exists
        let hashedPassword = null;
        if (user.password) {
          hashedPassword = await bcrypt.hash(user.password, 12);
        }
        
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            coverUrl: user.cover_url,
            rank: user.rank || 'Beginner',
            points: user.points || 0,
            missionsCompleted: user.missions_completed || 0,
            lastLogin: user.last_login ? new Date(user.last_login) : null,
            bio: user.bio,
            location: user.location,
            interests: user.interests,
            role: user.role === 'admin' ? 'ADMIN' : 'USER',
            username: user.username,
            forumStatus: user.forum_status || 'member',
            status: user.status === 'active' ? 'ACTIVE' : user.status === 'inactive' ? 'INACTIVE' : 'SUSPENDED',
            mainGoal: user.main_goal,
            adminNotes: user.admin_notes,
            posts: user.posts || 0,
            badges: user.badges || 0,
            recentActivity: user.recent_activity,
            selectedSchemaId: user.selected_schema_id,
            selectedNutritionPlan: user.selected_nutrition_plan,
            nutritionProfile: user.nutrition_profile,
            password: hashedPassword,
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
            updatedAt: user.updated_at ? new Date(user.updated_at) : new Date()
          },
          create: {
            email: user.email,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            coverUrl: user.cover_url,
            rank: user.rank || 'Beginner',
            points: user.points || 0,
            missionsCompleted: user.missions_completed || 0,
            lastLogin: user.last_login ? new Date(user.last_login) : null,
            bio: user.bio,
            location: user.location,
            interests: user.interests,
            role: user.role === 'admin' ? 'ADMIN' : 'USER',
            username: user.username,
            forumStatus: user.forum_status || 'member',
            status: user.status === 'active' ? 'ACTIVE' : user.status === 'inactive' ? 'INACTIVE' : 'SUSPENDED',
            mainGoal: user.main_goal,
            adminNotes: user.admin_notes,
            posts: user.posts || 0,
            badges: user.badges || 0,
            recentActivity: user.recent_activity,
            selectedSchemaId: user.selected_schema_id,
            selectedNutritionPlan: user.selected_nutrition_plan,
            nutritionProfile: user.nutrition_profile,
            password: hashedPassword,
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
            updatedAt: user.updated_at ? new Date(user.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error);
      }
    }
    
    console.log('✅ Users migration completed\n');
  } catch (error) {
    console.error('❌ Error in users migration:', error);
  }
}

async function migratePrelaunchEmails() {
  console.log('📧 Migrating prelaunch emails...');
  
  try {
    const { data: emails, error } = await supabase
      .from('prelaunch_emails')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching prelaunch emails:', error);
      return;
    }
    
    console.log(`📊 Found ${emails.length} prelaunch emails to migrate`);
    
    for (const email of emails) {
      try {
        await prisma.prelaunchEmail.upsert({
          where: { email: email.email },
          update: {
            name: email.name,
            source: email.source || 'Manual',
            status: email.status === 'active' ? 'ACTIVE' : email.status === 'pending' ? 'PENDING' : 'UNSUBSCRIBED',
            package: email.package === 'basic' ? 'BASIC' : email.package === 'premium' ? 'PREMIUM' : email.package === 'ultimate' ? 'ULTIMATE' : null,
            notes: email.notes,
            subscribedAt: email.subscribed_at ? new Date(email.subscribed_at) : new Date(),
            createdAt: email.created_at ? new Date(email.created_at) : new Date(),
            updatedAt: email.updated_at ? new Date(email.updated_at) : new Date()
          },
          create: {
            email: email.email,
            name: email.name,
            source: email.source || 'Manual',
            status: email.status === 'active' ? 'ACTIVE' : email.status === 'pending' ? 'PENDING' : 'UNSUBSCRIBED',
            package: email.package === 'basic' ? 'BASIC' : email.package === 'premium' ? 'PREMIUM' : email.package === 'ultimate' ? 'ULTIMATE' : null,
            notes: email.notes,
            subscribedAt: email.subscribed_at ? new Date(email.subscribed_at) : new Date(),
            createdAt: email.created_at ? new Date(email.created_at) : new Date(),
            updatedAt: email.updated_at ? new Date(email.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated email: ${email.email}`);
      } catch (error) {
        console.error(`❌ Error migrating email ${email.email}:`, error);
      }
    }
    
    console.log('✅ Prelaunch emails migration completed\n');
  } catch (error) {
    console.error('❌ Error in prelaunch emails migration:', error);
  }
}

async function migrateBookCategories() {
  console.log('📚 Migrating book categories...');
  
  try {
    const { data: categories, error } = await supabase
      .from('book_categories')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching book categories:', error);
      return;
    }
    
    console.log(`📊 Found ${categories.length} book categories to migrate`);
    
    for (const category of categories) {
      try {
        await prisma.bookCategory.upsert({
          where: { name: category.name },
          update: {
            description: category.description,
            color: category.color || '#8BAE5A',
            icon: category.icon,
            bookCount: category.book_count || 0,
            createdAt: category.created_at ? new Date(category.created_at) : new Date(),
            updatedAt: category.updated_at ? new Date(category.updated_at) : new Date()
          },
          create: {
            name: category.name,
            description: category.description,
            color: category.color || '#8BAE5A',
            icon: category.icon,
            bookCount: category.book_count || 0,
            createdAt: category.created_at ? new Date(category.created_at) : new Date(),
            updatedAt: category.updated_at ? new Date(category.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated category: ${category.name}`);
      } catch (error) {
        console.error(`❌ Error migrating category ${category.name}:`, error);
      }
    }
    
    console.log('✅ Book categories migration completed\n');
  } catch (error) {
    console.error('❌ Error in book categories migration:', error);
  }
}

async function migrateBooks() {
  console.log('📖 Migrating books...');
  
  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching books:', error);
      return;
    }
    
    console.log(`📊 Found ${books.length} books to migrate`);
    
    for (const book of books) {
      try {
        // Find category by name
        let categoryId = null;
        if (book.category_id) {
          const category = await prisma.bookCategory.findFirst({
            where: { id: book.category_id }
          });
          if (category) {
            categoryId = category.id;
          }
        }
        
        await prisma.book.upsert({
          where: { title: book.title },
          update: {
            author: book.author,
            coverUrl: book.cover_url,
            description: book.description,
            categories: book.categories || [],
            affiliateBol: book.affiliate_bol,
            affiliateAmazon: book.affiliate_amazon,
            status: book.status === 'published' ? 'PUBLISHED' : 'DRAFT',
            averageRating: book.average_rating || 0,
            reviewCount: book.review_count || 0,
            categoryId: categoryId,
            createdAt: book.created_at ? new Date(book.created_at) : new Date(),
            updatedAt: book.updated_at ? new Date(book.updated_at) : new Date()
          },
          create: {
            title: book.title,
            author: book.author,
            coverUrl: book.cover_url,
            description: book.description,
            categories: book.categories || [],
            affiliateBol: book.affiliate_bol,
            affiliateAmazon: book.affiliate_amazon,
            status: book.status === 'published' ? 'PUBLISHED' : 'DRAFT',
            averageRating: book.average_rating || 0,
            reviewCount: book.review_count || 0,
            categoryId: categoryId,
            createdAt: book.created_at ? new Date(book.created_at) : new Date(),
            updatedAt: book.updated_at ? new Date(book.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated book: ${book.title}`);
      } catch (error) {
        console.error(`❌ Error migrating book ${book.title}:`, error);
      }
    }
    
    console.log('✅ Books migration completed\n');
  } catch (error) {
    console.error('❌ Error in books migration:', error);
  }
}

async function migrateUserGoals() {
  console.log('🎯 Migrating user goals...');
  
  try {
    const { data: goals, error } = await supabase
      .from('user_goals')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching user goals:', error);
      return;
    }
    
    console.log(`📊 Found ${goals.length} user goals to migrate`);
    
    for (const goal of goals) {
      try {
        // Find user by email or ID
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: goal.user_id },
              { email: goal.user_id } // In case user_id is actually an email
            ]
          }
        });
        
        if (!user) {
          console.log(`⚠️ User not found for goal: ${goal.title}`);
          continue;
        }
        
        await prisma.userGoal.upsert({
          where: { 
            userId_isPrimary: {
              userId: user.id,
              isPrimary: goal.is_primary || false
            }
          },
          update: {
            title: goal.title,
            description: goal.description,
            category: goal.category,
            targetValue: goal.target_value,
            currentValue: goal.current_value || 0,
            unit: goal.unit,
            deadline: goal.deadline ? new Date(goal.deadline) : null,
            progressPercentage: goal.progress_percentage || 0,
            isActive: goal.is_active !== false,
            isPrimary: goal.is_primary || false,
            createdAt: goal.created_at ? new Date(goal.created_at) : new Date(),
            updatedAt: goal.updated_at ? new Date(goal.updated_at) : new Date()
          },
          create: {
            userId: user.id,
            title: goal.title,
            description: goal.description,
            category: goal.category,
            targetValue: goal.target_value,
            currentValue: goal.current_value || 0,
            unit: goal.unit,
            deadline: goal.deadline ? new Date(goal.deadline) : null,
            progressPercentage: goal.progress_percentage || 0,
            isActive: goal.is_active !== false,
            isPrimary: goal.is_primary || false,
            createdAt: goal.created_at ? new Date(goal.created_at) : new Date(),
            updatedAt: goal.updated_at ? new Date(goal.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated goal: ${goal.title}`);
      } catch (error) {
        console.error(`❌ Error migrating goal ${goal.title}:`, error);
      }
    }
    
    console.log('✅ User goals migration completed\n');
  } catch (error) {
    console.error('❌ Error in user goals migration:', error);
  }
}

async function migrateUserMissions() {
  console.log('🎯 Migrating user missions...');
  
  try {
    const { data: missions, error } = await supabase
      .from('user_missions')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching user missions:', error);
      return;
    }
    
    console.log(`📊 Found ${missions.length} user missions to migrate`);
    
    for (const mission of missions) {
      try {
        // Find user by email or ID
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: mission.user_id },
              { email: mission.user_id } // In case user_id is actually an email
            ]
          }
        });
        
        if (!user) {
          console.log(`⚠️ User not found for mission: ${mission.title}`);
          continue;
        }
        
        await prisma.userMission.upsert({
          where: { id: mission.id },
          update: {
            userId: user.id,
            title: mission.title,
            description: mission.description,
            category: mission.category,
            difficulty: mission.difficulty === 'easy' ? 'EASY' : mission.difficulty === 'medium' ? 'MEDIUM' : 'HARD',
            points: mission.points || 10,
            status: mission.status === 'completed' ? 'COMPLETED' : mission.status === 'failed' ? 'FAILED' : mission.status === 'skipped' ? 'SKIPPED' : 'PENDING',
            dueDate: mission.due_date ? new Date(mission.due_date) : null,
            completedAt: mission.completed_at ? new Date(mission.completed_at) : null,
            proof: mission.proof,
            createdAt: mission.created_at ? new Date(mission.created_at) : new Date(),
            updatedAt: mission.updated_at ? new Date(mission.updated_at) : new Date()
          },
          create: {
            id: mission.id,
            userId: user.id,
            title: mission.title,
            description: mission.description,
            category: mission.category,
            difficulty: mission.difficulty === 'easy' ? 'EASY' : mission.difficulty === 'medium' ? 'MEDIUM' : 'HARD',
            points: mission.points || 10,
            status: mission.status === 'completed' ? 'COMPLETED' : mission.status === 'failed' ? 'FAILED' : mission.status === 'skipped' ? 'SKIPPED' : 'PENDING',
            dueDate: mission.due_date ? new Date(mission.due_date) : null,
            completedAt: mission.completed_at ? new Date(mission.completed_at) : null,
            proof: mission.proof,
            createdAt: mission.created_at ? new Date(mission.created_at) : new Date(),
            updatedAt: mission.updated_at ? new Date(mission.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated mission: ${mission.title}`);
      } catch (error) {
        console.error(`❌ Error migrating mission ${mission.title}:`, error);
      }
    }
    
    console.log('✅ User missions migration completed\n');
  } catch (error) {
    console.error('❌ Error in user missions migration:', error);
  }
}

async function migrateEvents() {
  console.log('🎉 Migrating events...');
  
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }
    
    console.log(`📊 Found ${events.length} events to migrate`);
    
    for (const event of events) {
      try {
        // Find organizer user
        const organizer = await prisma.user.findFirst({
          where: {
            OR: [
              { id: event.organizer_id },
              { email: event.organizer_id }
            ]
          }
        });
        
        if (!organizer) {
          console.log(`⚠️ Organizer not found for event: ${event.title}`);
          continue;
        }
        
        await prisma.event.upsert({
          where: { id: event.id },
          update: {
            title: event.title,
            description: event.description,
            organizerId: organizer.id,
            location: event.location,
            startDate: new Date(event.start_date),
            endDate: new Date(event.end_date),
            maxParticipants: event.max_participants,
            currentParticipants: event.current_participants || 0,
            status: event.status === 'upcoming' ? 'UPCOMING' : event.status === 'ongoing' ? 'ONGOING' : event.status === 'completed' ? 'COMPLETED' : event.status === 'cancelled' ? 'CANCELLED' : 'DRAFT',
            isFeatured: event.is_featured || false,
            isPublic: event.is_public !== false,
            registrationDeadline: event.registration_deadline ? new Date(event.registration_deadline) : null,
            coverImageUrl: event.cover_image_url,
            createdAt: event.created_at ? new Date(event.created_at) : new Date(),
            updatedAt: event.updated_at ? new Date(event.updated_at) : new Date()
          },
          create: {
            id: event.id,
            title: event.title,
            description: event.description,
            organizerId: organizer.id,
            location: event.location,
            startDate: new Date(event.start_date),
            endDate: new Date(event.end_date),
            maxParticipants: event.max_participants,
            currentParticipants: event.current_participants || 0,
            status: event.status === 'upcoming' ? 'UPCOMING' : event.status === 'ongoing' ? 'ONGOING' : event.status === 'completed' ? 'COMPLETED' : event.status === 'cancelled' ? 'CANCELLED' : 'DRAFT',
            isFeatured: event.is_featured || false,
            isPublic: event.is_public !== false,
            registrationDeadline: event.registration_deadline ? new Date(event.registration_deadline) : null,
            coverImageUrl: event.cover_image_url,
            createdAt: event.created_at ? new Date(event.created_at) : new Date(),
            updatedAt: event.updated_at ? new Date(event.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated event: ${event.title}`);
      } catch (error) {
        console.error(`❌ Error migrating event ${event.title}:`, error);
      }
    }
    
    console.log('✅ Events migration completed\n');
  } catch (error) {
    console.error('❌ Error in events migration:', error);
  }
}

async function migrateUserXp() {
  console.log('⭐ Migrating user XP...');
  
  try {
    const { data: userXp, error } = await supabase
      .from('user_xp')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching user XP:', error);
      return;
    }
    
    console.log(`📊 Found ${userXp.length} user XP records to migrate`);
    
    for (const xp of userXp) {
      try {
        // Find user
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: xp.user_id },
              { email: xp.user_id }
            ]
          }
        });
        
        if (!user) {
          console.log(`⚠️ User not found for XP record: ${xp.user_id}`);
          continue;
        }
        
        await prisma.userXp.upsert({
          where: { userId: user.id },
          update: {
            totalXp: xp.total_xp || 0,
            currentRankId: xp.current_rank_id,
            rankAchievedAt: xp.rank_achieved_at ? new Date(xp.rank_achieved_at) : null,
            createdAt: xp.created_at ? new Date(xp.created_at) : new Date(),
            updatedAt: xp.updated_at ? new Date(xp.updated_at) : new Date()
          },
          create: {
            userId: user.id,
            totalXp: xp.total_xp || 0,
            currentRankId: xp.current_rank_id,
            rankAchievedAt: xp.rank_achieved_at ? new Date(xp.rank_achieved_at) : null,
            createdAt: xp.created_at ? new Date(xp.created_at) : new Date(),
            updatedAt: xp.updated_at ? new Date(xp.updated_at) : new Date()
          }
        });
        
        console.log(`✅ Migrated XP for user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error migrating XP for user ${xp.user_id}:`, error);
      }
    }
    
    console.log('✅ User XP migration completed\n');
  } catch (error) {
    console.error('❌ Error in user XP migration:', error);
  }
}

async function runCompleteMigration() {
  try {
    console.log('🔄 Starting complete Supabase to Prisma migration...\n');
    
    // Run migrations in order
    await migrateUsers();
    await migratePrelaunchEmails();
    await migrateBookCategories();
    await migrateBooks();
    await migrateUserGoals();
    await migrateUserMissions();
    await migrateEvents();
    await migrateUserXp();
    
    console.log('🎉 Complete migration finished successfully!');
    console.log('\n📊 Migration Summary:');
    console.log('- Users migrated');
    console.log('- Prelaunch emails migrated');
    console.log('- Book categories migrated');
    console.log('- Books migrated');
    console.log('- User goals migrated');
    console.log('- User missions migrated');
    console.log('- Events migrated');
    console.log('- User XP migrated');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runCompleteMigration(); 