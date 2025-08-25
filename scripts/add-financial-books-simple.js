require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const newBooks = [
  {
    title: "Cashflow Quadrant",
    author: "Robert Kiyosaki",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    categories: ["financiën", "ondernemerschap", "mindset"],
    description: "De vier manieren waarop mensen geld verdienen: Employee, Self-Employed, Business Owner en Investor. Leer hoe je van de linkerkant naar de rechterkant van het quadrant kunt bewegen.",
    status: "published",
    average_rating: 4.4,
    review_count: 12
  },
  {
    title: "Master Your Mindset",
    author: "Michael Hyatt",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    categories: ["mindset", "productiviteit", "persoonlijke ontwikkeling"],
    description: "Hoe je je mindset kunt veranderen om meer succes, geluk en vervulling te ervaren. Praktische strategieën voor mentale groei en persoonlijke transformatie.",
    status: "published",
    average_rating: 4.6,
    review_count: 8
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    categories: ["mindset", "financiën", "succes"],
    description: "Een klassieker over de kracht van positief denken en het ontwikkelen van een rijke mindset. Gebaseerd op interviews met de meest succesvolle mensen van die tijd.",
    status: "published",
    average_rating: 4.7,
    review_count: 25
  },
  {
    title: "Psychology of Money",
    author: "Morgan Housel",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    categories: ["financiën", "psychologie", "mindset"],
    description: "Timeless lessen over rijkdom, hebzucht en geluk. Hoe mensen denken over geld en waarom dat belangrijker is dan wat ze weten over geld.",
    status: "published",
    average_rating: 4.8,
    review_count: 18
  },
  {
    title: "Bereik je Eerste Miljoen",
    author: "Farnoosh Torabi",
    cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    categories: ["financiën", "ondernemerschap", "mindset"],
    description: "Een praktische gids voor het opbouwen van rijkdom en het bereiken van je eerste miljoen. Stap-voor-stap strategieën voor financiële onafhankelijkheid.",
    status: "published",
    average_rating: 4.3,
    review_count: 10
  },
  {
    title: "How to Get Rich",
    author: "Felix Dennis",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    categories: ["financiën", "ondernemerschap", "mindset"],
    description: "Een eerlijke en directe benadering van rijkdom verwerven. Geschreven door een self-made miljonair die de realiteit van het rijk worden niet verbloemt.",
    status: "published",
    average_rating: 4.2,
    review_count: 14
  },
  {
    title: "Cashflow",
    author: "Robert Kiyosaki",
    cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    categories: ["financiën", "ondernemerschap", "spel"],
    description: "Het bordspel dat je leert hoe je passief inkomen kunt opbouwen en uit de rat race kunt ontsnappen. Een praktische manier om financiële principes te leren.",
    status: "published",
    average_rating: 4.6,
    review_count: 20
  },
  {
    title: "Millionaire Mindset",
    author: "Brian Tracy",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    categories: ["mindset", "financiën", "succes"],
    description: "Hoe je de mindset van een miljonair kunt ontwikkelen. De mentale patronen en overtuigingen die succesvolle mensen onderscheiden van de rest.",
    status: "published",
    average_rating: 4.5,
    review_count: 16
  },
  {
    title: "Diary of a CEO",
    author: "Steven Bartlett",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    categories: ["ondernemerschap", "mindset", "leiderschap"],
    description: "De lessen van een jonge ondernemer die een miljardenbedrijf bouwde. Eerlijke inzichten over ondernemerschap, leiderschap en persoonlijke groei.",
    status: "published",
    average_rating: 4.7,
    review_count: 22
  },
  {
    title: "I Will Teach You to Be Rich",
    author: "Ramit Sethi",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    categories: ["financiën", "persoonlijke financiën", "mindset"],
    description: "Een 6-weekse persoonlijke financiën cursus die je leert hoe je rijk kunt worden door slim te sparen, te investeren en te budgetteren.",
    status: "published",
    average_rating: 4.4,
    review_count: 19
  },
  {
    title: "Beginnende Belegger",
    author: "Jeroen Horlings",
    cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    categories: ["financiën", "beleggen", "beginners"],
    description: "Een complete gids voor beginnende beleggers. Leer de basis van beleggen, risicomanagement en het opbouwen van een solide beleggingsportefeuille.",
    status: "published",
    average_rating: 4.6,
    review_count: 11
  }
];

async function addFinancialBooks() {
  try {
    console.log('📚 Adding financial and mindset books to boekenkamer...\n');

    // Check existing books first
    console.log('📋 Checking existing books...');
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('title')
      .in('title', newBooks.map(book => book.title));

    if (fetchError) {
      console.error('❌ Error fetching existing books:', fetchError);
      return;
    }

    const existingTitles = existingBooks.map(book => book.title);
    console.log(`📊 Found ${existingTitles.length} existing books:`, existingTitles);

    // Filter out books that already exist
    const booksToAdd = newBooks.filter(book => !existingTitles.includes(book.title));
    
    if (booksToAdd.length === 0) {
      console.log('✅ All books already exist in database');
      return;
    }

    console.log(`📝 Adding ${booksToAdd.length} new books...`);

    // Add books in batches
    const batchSize = 3;
    for (let i = 0; i < booksToAdd.length; i += batchSize) {
      const batch = booksToAdd.slice(i, i + batchSize);
      
      console.log(`\n📦 Adding batch ${Math.floor(i / batchSize) + 1}:`);
      batch.forEach(book => console.log(`   - ${book.title} by ${book.author}`));

      const { data: insertedBooks, error: insertError } = await supabase
        .from('books')
        .insert(batch)
        .select();

      if (insertError) {
        console.error('❌ Error inserting batch:', insertError);
        continue;
      }

      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} added successfully`);
    }

    // Verify all books were added
    console.log('\n🔍 Verifying all books...');
    const { data: allBooks, error: verifyError } = await supabase
      .from('books')
      .select('title, author, categories, average_rating')
      .in('title', newBooks.map(book => book.title))
      .order('title');

    if (verifyError) {
      console.error('❌ Error verifying books:', verifyError);
      return;
    }

    console.log('\n✅ Successfully added financial books:');
    console.log('=====================================');
    
    allBooks.forEach(book => {
      console.log(`📚 ${book.title} by ${book.author}`);
      console.log(`   Categories: ${book.categories.join(', ')}`);
      console.log(`   Rating: ${book.average_rating}/5`);
    });

    console.log(`\n🎯 Summary:`);
    console.log(`- Total books: ${allBooks.length}`);
    console.log(`- Categories: ${[...new Set(allBooks.flatMap(b => b.categories))].join(', ')}`);

    // Category breakdown
    const categoryCount = {};
    allBooks.forEach(book => {
      book.categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });
    
    console.log(`\n📂 Books per category:`);
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  • ${category}: ${count} books`);
    });

    console.log('\n💡 These books are now available in the boekenkamer!');
    console.log('   Users can now access these financial and mindset resources.');

  } catch (error) {
    console.error('❌ Error adding financial books:', error);
  }
}

addFinancialBooks();
