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
    description: "De vier manieren waarop mensen geld verdienen: Employee, Self-Employed, Business Owner en Investor. Leer hoe je van de linkerkant naar de rechterkant van het quadrant kunt bewegen.",
    status: "published"
  },
  {
    title: "Master Your Mindset",
    author: "Michael Hyatt",
    description: "Hoe je je mindset kunt veranderen om meer succes, geluk en vervulling te ervaren. Praktische strategieën voor mentale groei en persoonlijke transformatie.",
    status: "published"
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    description: "Een klassieker over de kracht van positief denken en het ontwikkelen van een rijke mindset. Gebaseerd op interviews met de meest succesvolle mensen van die tijd.",
    status: "published"
  },
  {
    title: "Psychology of Money",
    author: "Morgan Housel",
    description: "Timeless lessen over rijkdom, hebzucht en geluk. Hoe mensen denken over geld en waarom dat belangrijker is dan wat ze weten over geld.",
    status: "published"
  },
  {
    title: "Bereik je Eerste Miljoen",
    author: "Farnoosh Torabi",
    description: "Een praktische gids voor het opbouwen van rijkdom en het bereiken van je eerste miljoen. Stap-voor-stap strategieën voor financiële onafhankelijkheid.",
    status: "published"
  },
  {
    title: "How to Get Rich",
    author: "Felix Dennis",
    description: "Een eerlijke en directe benadering van rijkdom verwerven. Geschreven door een self-made miljonair die de realiteit van het rijk worden niet verbloemt.",
    status: "published"
  },
  {
    title: "Cashflow",
    author: "Robert Kiyosaki",
    description: "Het bordspel dat je leert hoe je passief inkomen kunt opbouwen en uit de rat race kunt ontsnappen. Een praktische manier om financiële principes te leren.",
    status: "published"
  },
  {
    title: "Millionaire Mindset",
    author: "Brian Tracy",
    description: "Hoe je de mindset van een miljonair kunt ontwikkelen. De mentale patronen en overtuigingen die succesvolle mensen onderscheiden van de rest.",
    status: "published"
  },
  {
    title: "Diary of a CEO",
    author: "Steven Bartlett",
    description: "De lessen van een jonge ondernemer die een miljardenbedrijf bouwde. Eerlijke inzichten over ondernemerschap, leiderschap en persoonlijke groei.",
    status: "published"
  },
  {
    title: "I Will Teach You to Be Rich",
    author: "Ramit Sethi",
    description: "Een 6-weekse persoonlijke financiën cursus die je leert hoe je rijk kunt worden door slim te sparen, te investeren en te budgetteren.",
    status: "published"
  },
  {
    title: "Beginnende Belegger",
    author: "Jeroen Horlings",
    description: "Een complete gids voor beginnende beleggers. Leer de basis van beleggen, risicomanagement en het opbouwen van een solide beleggingsportefeuille.",
    status: "published"
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
      .select('title, author')
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
    });

    console.log(`\n🎯 Summary:`);
    console.log(`- Total books: ${allBooks.length}`);
    console.log(`- Books added: ${booksToAdd.length}`);

    console.log('\n💡 These books are now available in the boekenkamer!');
    console.log('   Users can now access these financial and mindset resources.');

  } catch (error) {
    console.error('❌ Error adding financial books:', error);
  }
}

addFinancialBooks();
