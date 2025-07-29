const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const prisma = new PrismaClient();

async function migrateToPrisma() {
  console.log('🚀 Starting migration from Supabase to PostgreSQL with Prisma...\n');

  try {
    // Step 1: Migrate Users
    console.log('👥 Migrating users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      console.log(`Found ${users.length} users to migrate`);
      
      for (const user of users) {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              fullName: user.full_name,
              avatarUrl: user.avatar_url,
              coverUrl: user.cover_url,
              rank: user.rank,
              points: user.points,
              missionsCompleted: user.missions_completed,
              lastLogin: user.last_login,
              bio: user.bio,
              location: user.location,
              interests: user.interests,
              role: user.role?.toUpperCase() || 'USER',
              username: user.username,
              forumStatus: user.forum_status,
              status: user.status?.toUpperCase() || 'ACTIVE',
              mainGoal: user.main_goal,
              adminNotes: user.admin_notes,
              posts: user.posts,
              badges: user.badges,
              recentActivity: user.recent_activity,
              selectedSchemaId: user.selected_schema_id,
              selectedNutritionPlan: user.selected_nutrition_plan,
              nutritionProfile: user.nutrition_profile,
              createdAt: user.created_at,
              updatedAt: user.updated_at
            },
            create: {
              id: user.id,
              email: user.email,
              fullName: user.full_name,
              avatarUrl: user.avatar_url,
              coverUrl: user.cover_url,
              rank: user.rank,
              points: user.points,
              missionsCompleted: user.missions_completed,
              lastLogin: user.last_login,
              bio: user.bio,
              location: user.location,
              interests: user.interests,
              role: user.role?.toUpperCase() || 'USER',
              username: user.username,
              forumStatus: user.forum_status,
              status: user.status?.toUpperCase() || 'ACTIVE',
              mainGoal: user.main_goal,
              adminNotes: user.admin_notes,
              posts: user.posts,
              badges: user.badges,
              recentActivity: user.recent_activity,
              selectedSchemaId: user.selected_schema_id,
              selectedNutritionPlan: user.selected_nutrition_plan,
              nutritionProfile: user.nutrition_profile,
              createdAt: user.created_at,
              updatedAt: user.updated_at
            }
          });
        } catch (error) {
          console.error(`Error migrating user ${user.email}:`, error);
        }
      }
      console.log('✅ Users migrated successfully');
    }

    // Step 2: Migrate Prelaunch Emails
    console.log('\n📧 Migrating prelaunch emails...');
    const { data: emails, error: emailsError } = await supabase
      .from('prelaunch_emails')
      .select('*');

    if (emailsError) {
      console.error('Error fetching prelaunch emails:', emailsError);
    } else {
      console.log(`Found ${emails.length} prelaunch emails to migrate`);
      
      for (const email of emails) {
        try {
          await prisma.prelaunchEmail.upsert({
            where: { email: email.email },
            update: {
              name: email.name,
              source: email.source,
              status: email.status?.toUpperCase() || 'ACTIVE',
              package: email.package?.toUpperCase(),
              notes: email.notes,
              subscribedAt: email.subscribed_at,
              updatedAt: email.updated_at
            },
            create: {
              email: email.email,
              name: email.name,
              source: email.source,
              status: email.status?.toUpperCase() || 'ACTIVE',
              package: email.package?.toUpperCase(),
              notes: email.notes,
              subscribedAt: email.subscribed_at,
              createdAt: email.created_at,
              updatedAt: email.updated_at
            }
          });
        } catch (error) {
          console.error(`Error migrating email ${email.email}:`, error);
        }
      }
      console.log('✅ Prelaunch emails migrated successfully');
    }

    // Step 3: Migrate Book Categories
    console.log('\n📚 Migrating book categories...');
    const { data: bookCategories, error: bookCategoriesError } = await supabase
      .from('book_categories')
      .select('*');

    if (bookCategoriesError) {
      console.error('Error fetching book categories:', bookCategoriesError);
    } else {
      console.log(`Found ${bookCategories.length} book categories to migrate`);
      
      for (const category of bookCategories) {
        try {
          await prisma.bookCategory.upsert({
            where: { name: category.name },
            update: {
              description: category.description,
              color: category.color,
              icon: category.icon,
              bookCount: category.book_count,
              updatedAt: category.updated_at
            },
            create: {
              name: category.name,
              description: category.description,
              color: category.color,
              icon: category.icon,
              bookCount: category.book_count,
              createdAt: category.created_at,
              updatedAt: category.updated_at
            }
          });
        } catch (error) {
          console.error(`Error migrating book category ${category.name}:`, error);
        }
      }
      console.log('✅ Book categories migrated successfully');
    }

    // Step 4: Migrate Books
    console.log('\n📖 Migrating books...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*');

    if (booksError) {
      console.error('Error fetching books:', booksError);
    } else {
      console.log(`Found ${books.length} books to migrate`);
      
      for (const book of books) {
        try {
          // Get or create a default category
          const defaultCategory = await prisma.bookCategory.findFirst({
            where: { name: 'Mindset' }
          });

          await prisma.book.upsert({
            where: { title: book.title },
            update: {
              author: book.author,
              coverUrl: book.cover_url,
              description: book.description,
              categories: book.categories || [],
              affiliateBol: book.affiliate_bol,
              affiliateAmazon: book.affiliate_amazon,
              status: book.status?.toUpperCase() || 'DRAFT',
              averageRating: book.average_rating,
              reviewCount: book.review_count,
              categoryId: defaultCategory?.id || 1,
              updatedAt: book.updated_at
            },
            create: {
              title: book.title,
              author: book.author,
              coverUrl: book.cover_url,
              description: book.description,
              categories: book.categories || [],
              affiliateBol: book.affiliate_bol,
              affiliateAmazon: book.affiliate_amazon,
              status: book.status?.toUpperCase() || 'DRAFT',
              averageRating: book.average_rating,
              reviewCount: book.review_count,
              categoryId: defaultCategory?.id || 1,
              createdAt: book.created_at,
              updatedAt: book.updated_at
            }
          });
        } catch (error) {
          console.error(`Error migrating book ${book.title}:`, error);
        }
      }
      console.log('✅ Books migrated successfully');
    }

    // Step 5: Migrate User Goals
    console.log('\n🎯 Migrating user goals...');
    const { data: goals, error: goalsError } = await supabase
      .from('user_goals')
      .select('*');

    if (goalsError) {
      console.error('Error fetching user goals:', goalsError);
    } else {
      console.log(`Found ${goals.length} user goals to migrate`);
      
      for (const goal of goals) {
        try {
          await prisma.userGoal.upsert({
            where: { id: goal.id },
            update: {
              title: goal.title,
              description: goal.description,
              category: goal.category,
              targetValue: goal.target_value,
              currentValue: goal.current_value,
              unit: goal.unit,
              deadline: goal.deadline,
              progressPercentage: goal.progress_percentage,
              isActive: goal.is_active,
              isPrimary: goal.is_primary,
              updatedAt: goal.updated_at
            },
            create: {
              id: goal.id,
              userId: goal.user_id,
              title: goal.title,
              description: goal.description,
              category: goal.category,
              targetValue: goal.target_value,
              currentValue: goal.current_value,
              unit: goal.unit,
              deadline: goal.deadline,
              progressPercentage: goal.progress_percentage,
              isActive: goal.is_active,
              isPrimary: goal.is_primary,
              createdAt: goal.created_at,
              updatedAt: goal.updated_at
            }
          });
        } catch (error) {
          console.error(`Error migrating goal ${goal.id}:`, error);
        }
      }
      console.log('✅ User goals migrated successfully');
    }

    // Step 6: Migrate User Missions
    console.log('\n🚀 Migrating user missions...');
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*');

    if (missionsError) {
      console.error('Error fetching user missions:', missionsError);
    } else {
      console.log(`Found ${missions.length} user missions to migrate`);
      
      for (const mission of missions) {
        try {
          await prisma.userMission.upsert({
            where: { id: mission.id },
            update: {
              title: mission.title,
              description: mission.description,
              category: mission.category,
              difficulty: mission.difficulty?.toUpperCase() || 'EASY',
              points: mission.points,
              status: mission.status?.toUpperCase() || 'PENDING',
              dueDate: mission.due_date,
              completedAt: mission.completed_at,
              proof: mission.proof,
              updatedAt: mission.updated_at
            },
            create: {
              id: mission.id,
              userId: mission.user_id,
              title: mission.title,
              description: mission.description,
              category: mission.category,
              difficulty: mission.difficulty?.toUpperCase() || 'EASY',
              points: mission.points,
              status: mission.status?.toUpperCase() || 'PENDING',
              dueDate: mission.due_date,
              completedAt: mission.completed_at,
              proof: mission.proof,
              createdAt: mission.created_at,
              updatedAt: mission.updated_at
            }
          });
        } catch (error) {
          console.error(`Error migrating mission ${mission.id}:`, error);
        }
      }
      console.log('✅ User missions migrated successfully');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your environment variables to use the new PostgreSQL database');
    console.log('2. Update your API routes to use Prisma instead of Supabase');
    console.log('3. Test the application to ensure everything works correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToPrisma(); 