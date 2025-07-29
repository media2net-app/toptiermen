const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize clients
const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateSupabaseToPrisma() {
  console.log('🔄 Starting Supabase to Prisma migration...');

  try {
    // 1. Migrate Users
    console.log('👤 Migrating users...');
    const { data: supabaseUsers, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Found ${supabaseUsers.length} users to migrate`);

    for (const supabaseUser of supabaseUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: supabaseUser.email }
        });

        if (existingUser) {
          console.log(`⏭️ User ${supabaseUser.email} already exists, skipping...`);
          continue;
        }

        // Create user with hashed password (default password: 'password123')
        const hashedPassword = await bcrypt.hash('password123', 12);

        const user = await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            password: hashedPassword,
            fullName: supabaseUser.full_name || 'Unknown User',
            avatarUrl: supabaseUser.avatar_url,
            coverUrl: supabaseUser.cover_url,
            rank: supabaseUser.rank || 'Beginner',
            points: supabaseUser.points || 0,
            missionsCompleted: supabaseUser.missions_completed || 0,
            lastLogin: supabaseUser.last_login ? new Date(supabaseUser.last_login) : null,
            bio: supabaseUser.bio,
            location: supabaseUser.location,
            interests: supabaseUser.interests,
            role: supabaseUser.role?.toUpperCase() || 'USER',
            username: supabaseUser.username,
            forumStatus: supabaseUser.forum_status || 'member',
            status: supabaseUser.status?.toUpperCase() || 'ACTIVE',
            mainGoal: supabaseUser.main_goal,
            adminNotes: supabaseUser.admin_notes,
            posts: supabaseUser.posts || 0,
            badges: supabaseUser.badges || 0,
            recentActivity: supabaseUser.recent_activity,
            selectedSchemaId: supabaseUser.selected_schema_id,
            selectedNutritionPlan: supabaseUser.selected_nutrition_plan,
            nutritionProfile: supabaseUser.nutrition_profile,
            createdAt: new Date(supabaseUser.created_at),
            updatedAt: new Date(supabaseUser.updated_at),
          }
        });

        console.log(`✅ Created user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error creating user ${supabaseUser.email}:`, error);
      }
    }

    // 2. Migrate Prelaunch Emails
    console.log('📧 Migrating prelaunch emails...');
    const { data: supabaseEmails, error: emailsError } = await supabase
      .from('prelaunch_emails')
      .select('*');

    if (emailsError) {
      console.error('❌ Error fetching emails:', emailsError);
    } else {
      console.log(`📊 Found ${supabaseEmails.length} emails to migrate`);

      for (const supabaseEmail of supabaseEmails) {
        try {
          const existingEmail = await prisma.prelaunchEmail.findUnique({
            where: { email: supabaseEmail.email }
          });

          if (existingEmail) {
            console.log(`⏭️ Email ${supabaseEmail.email} already exists, skipping...`);
            continue;
          }

          const email = await prisma.prelaunchEmail.create({
            data: {
              email: supabaseEmail.email,
              name: supabaseEmail.name,
              source: supabaseEmail.source || 'Manual',
              status: supabaseEmail.status?.toUpperCase() || 'ACTIVE',
              package: supabaseEmail.package?.toUpperCase(),
              notes: supabaseEmail.notes,
              subscribedAt: new Date(supabaseEmail.subscribed_at),
              createdAt: new Date(supabaseEmail.created_at),
              updatedAt: new Date(supabaseEmail.updated_at),
            }
          });

          console.log(`✅ Created email: ${email.email}`);
        } catch (error) {
          console.error(`❌ Error creating email ${supabaseEmail.email}:`, error);
        }
      }
    }

    // 3. Migrate Book Categories
    console.log('📚 Migrating book categories...');
    const { data: supabaseCategories, error: categoriesError } = await supabase
      .from('book_categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
    } else {
      console.log(`📊 Found ${supabaseCategories.length} categories to migrate`);

      for (const supabaseCategory of supabaseCategories) {
        try {
          const existingCategory = await prisma.bookCategory.findUnique({
            where: { name: supabaseCategory.name }
          });

          if (existingCategory) {
            console.log(`⏭️ Category ${supabaseCategory.name} already exists, skipping...`);
            continue;
          }

          const category = await prisma.bookCategory.create({
            data: {
              name: supabaseCategory.name,
              description: supabaseCategory.description,
              color: supabaseCategory.color || '#8BAE5A',
              icon: supabaseCategory.icon,
              bookCount: supabaseCategory.book_count || 0,
              createdAt: new Date(supabaseCategory.created_at),
              updatedAt: new Date(supabaseCategory.updated_at),
            }
          });

          console.log(`✅ Created category: ${category.name}`);
        } catch (error) {
          console.error(`❌ Error creating category ${supabaseCategory.name}:`, error);
        }
      }
    }

    // 4. Migrate Books
    console.log('📖 Migrating books...');
    const { data: supabaseBooks, error: booksError } = await supabase
      .from('books')
      .select('*');

    if (booksError) {
      console.error('❌ Error fetching books:', booksError);
    } else {
      console.log(`📊 Found ${supabaseBooks.length} books to migrate`);

      for (const supabaseBook of supabaseBooks) {
        try {
          const existingBook = await prisma.book.findUnique({
            where: { title: supabaseBook.title }
          });

          if (existingBook) {
            console.log(`⏭️ Book ${supabaseBook.title} already exists, skipping...`);
            continue;
          }

          // Find category
          const category = await prisma.bookCategory.findFirst({
            where: { name: supabaseBook.category || 'Personal Development' }
          });

          const book = await prisma.book.create({
            data: {
              title: supabaseBook.title,
              author: supabaseBook.author,
              coverUrl: supabaseBook.cover_url,
              description: supabaseBook.description,
              categories: supabaseBook.categories || [],
              affiliateBol: supabaseBook.affiliate_bol,
              affiliateAmazon: supabaseBook.affiliate_amazon,
              status: supabaseBook.status?.toUpperCase() || 'DRAFT',
              averageRating: parseFloat(supabaseBook.average_rating) || 0,
              reviewCount: supabaseBook.review_count || 0,
              categoryId: category?.id || 1, // Default to first category
              createdAt: new Date(supabaseBook.created_at),
              updatedAt: new Date(supabaseBook.updated_at),
            }
          });

          console.log(`✅ Created book: ${book.title}`);
        } catch (error) {
          console.error(`❌ Error creating book ${supabaseBook.title}:`, error);
        }
      }
    }

    // 5. Migrate User Goals
    console.log('🎯 Migrating user goals...');
    const { data: supabaseGoals, error: goalsError } = await supabase
      .from('user_goals')
      .select('*');

    if (goalsError) {
      console.error('❌ Error fetching goals:', goalsError);
    } else {
      console.log(`📊 Found ${supabaseGoals.length} goals to migrate`);

      for (const supabaseGoal of supabaseGoals) {
        try {
          const goal = await prisma.userGoal.create({
            data: {
              userId: supabaseGoal.user_id,
              title: supabaseGoal.title,
              description: supabaseGoal.description,
              category: supabaseGoal.category,
              targetValue: parseFloat(supabaseGoal.target_value) || null,
              currentValue: parseFloat(supabaseGoal.current_value) || 0,
              unit: supabaseGoal.unit,
              deadline: supabaseGoal.deadline ? new Date(supabaseGoal.deadline) : null,
              progressPercentage: supabaseGoal.progress_percentage || 0,
              isActive: supabaseGoal.is_active !== false,
              isPrimary: supabaseGoal.is_primary || false,
              createdAt: new Date(supabaseGoal.created_at),
              updatedAt: new Date(supabaseGoal.updated_at),
            }
          });

          console.log(`✅ Created goal: ${goal.title}`);
        } catch (error) {
          console.error(`❌ Error creating goal ${supabaseGoal.title}:`, error);
        }
      }
    }

    // 6. Migrate User Missions
    console.log('🚀 Migrating user missions...');
    const { data: supabaseMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*');

    if (missionsError) {
      console.error('❌ Error fetching missions:', missionsError);
    } else {
      console.log(`📊 Found ${supabaseMissions.length} missions to migrate`);

      for (const supabaseMission of supabaseMissions) {
        try {
          const mission = await prisma.userMission.create({
            data: {
              userId: supabaseMission.user_id,
              title: supabaseMission.title,
              description: supabaseMission.description,
              category: supabaseMission.category,
              difficulty: supabaseMission.difficulty?.toUpperCase() || 'EASY',
              points: supabaseMission.points || 10,
              status: supabaseMission.status?.toUpperCase() || 'PENDING',
              dueDate: supabaseMission.due_date ? new Date(supabaseMission.due_date) : null,
              completedAt: supabaseMission.completed_at ? new Date(supabaseMission.completed_at) : null,
              proof: supabaseMission.proof,
              createdAt: new Date(supabaseMission.created_at),
              updatedAt: new Date(supabaseMission.updated_at),
            }
          });

          console.log(`✅ Created mission: ${mission.title}`);
        } catch (error) {
          console.error(`❌ Error creating mission ${supabaseMission.title}:`, error);
        }
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('📋 Summary:');
    console.log(`   👤 Users: ${supabaseUsers.length}`);
    console.log(`   📧 Emails: ${supabaseEmails?.length || 0}`);
    console.log(`   📚 Categories: ${supabaseCategories?.length || 0}`);
    console.log(`   📖 Books: ${supabaseBooks?.length || 0}`);
    console.log(`   🎯 Goals: ${supabaseGoals?.length || 0}`);
    console.log(`   🚀 Missions: ${supabaseMissions?.length || 0}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateSupabaseToPrisma(); 