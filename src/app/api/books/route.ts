import { NextRequest, NextResponse } from 'next/server';

// Temporary books data until database table is created
const booksData = [
  {
    id: 1,
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    category: "Financieel",
    description: "De klassieker over financieel onderwijs en het verschil tussen arm en rijk denken.",
    rating: 5,
    featured: true,
    affiliate_link: "https://amzn.to/4pELNsm",
    cover_image_url: "/boekenkamer/richdadpoordad.jpg",
    publication_year: 1997,
    pages: 336,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Cashflow Quadrant",
    author: "Robert Kiyosaki",
    category: "Financieel",
    description: "Leer de vier kwadranten van inkomsten en hoe je van werknemer naar investeerder wordt.",
    rating: 5,
    featured: true,
    affiliate_link: "https://amzn.to/48tbGoQ",
    cover_image_url: "/boekenkamer/cashflowquadrant.jpg",
    publication_year: 2011,
    pages: 240,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Master Your Mindset",
    author: "Michael Hyatt",
    category: "Mindset",
    description: "Ontwikkel een winnende mindset voor persoonlijke en professionele groei.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/42H99Uh",
    cover_image_url: "/boekenkamer/masteryourmindset.jpg",
    publication_year: 2019,
    pages: 256,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    category: "Mindset",
    description: "De tijdloze klassieker over succes, rijkdom en persoonlijke ontwikkeling.",
    rating: 5,
    featured: true,
    affiliate_link: "https://amzn.to/4gOLV4v",
    cover_image_url: "/boekenkamer/thinkandgrowrich.jpg",
    publication_year: 1937,
    pages: 320,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    title: "Psychology of Money",
    author: "Morgan Housel",
    category: "Financieel",
    description: "Inzicht in de psychologie achter financiële beslissingen en gedrag.",
    rating: 5,
    featured: false,
    affiliate_link: "https://amzn.to/46Dbl0m",
    cover_image_url: "/boekenkamer/psychologyofmoney.jpg",
    publication_year: 2020,
    pages: 256,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    title: "Bereik je Eerste Miljoen",
    author: "Grant Cardone",
    category: "Financieel",
    description: "Praktische stappen om je eerste miljoen te bereiken door ondernemerschap.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/4pELNsm",
    cover_image_url: "/boekenkamer/bereikjeeerstemiljoen.jpg",
    publication_year: 2011,
    pages: 272,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    title: "How to Get Rich",
    author: "Felix Dennis",
    category: "Financieel",
    description: "Een eerlijke kijk op rijkdom en de realiteit van ondernemerschap.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/48tbGoQ",
    cover_image_url: "/boekenkamer/howtogetrich.jpg",
    publication_year: 2006,
    pages: 320,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    title: "Cashflow Milionaire Mindset",
    author: "Robert Kiyosaki",
    category: "Financieel",
    description: "Begrijp cashflow en hoe je passief inkomen kunt opbouwen met de mindset van een miljonair.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/4gOLV4v",
    cover_image_url: "/boekenkamer/cashflowmillinaoiremindset.jpg",
    publication_year: 2011,
    pages: 240,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9,
    title: "Millionaire Mindset",
    author: "T. Harv Eker",
    category: "Mindset",
    description: "Ontwikkel de mindset van een miljonair en verander je financiële toekomst.",
    rating: 4,
    featured: false,
    publication_year: 2005,
    pages: 256,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10,
    title: "Diary of a CEO",
    author: "Steven Bartlett",
    category: "Ondernemerschap",
    description: "Lessen uit het leven van een jonge CEO en ondernemer.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/4nQDl7N",
    cover_image_url: "/boekenkamer/dairyofceo.jpg",
    publication_year: 2021,
    pages: 320,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 11,
    title: "I Will Teach You to Be Rich",
    author: "Ramit Sethi",
    category: "Financieel",
    description: "Een praktische gids voor persoonlijke financiën en rijkdom.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/3VyG7lR",
    cover_image_url: "/boekenkamer/iwillteachyoutoberich.jpg",
    publication_year: 2009,
    pages: 304,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 12,
    title: "Beginnende Belegger",
    author: "Peter Lynch",
    category: "Beleggen",
    description: "Leer de basis van beleggen en bouw je vermogen op.",
    rating: 4,
    featured: false,
    affiliate_link: "https://amzn.to/46Dbl0m",
    cover_image_url: "/boekenkamer/beginnendebelegger.jpg",
    publication_year: 1989,
    pages: 304,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(req: NextRequest) {
  try {
    console.log('📚 Fetching books...');
    
    // For now, return the static data
    // Later this will be replaced with database queries
    console.log(`✅ Successfully fetched ${booksData.length} books`);
    return NextResponse.json({ books: booksData });
  } catch (error) {
    console.error('❌ Error in books API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, author, category, description, rating, featured, affiliate_link, cover_image_url, isbn, publication_year, pages, language } = body;

    console.log('📚 Creating new book:', title);

    // For now, just return success
    // Later this will be replaced with database insert
    const newBook = {
      id: booksData.length + 1,
      title,
      author,
      category,
      description,
      rating,
      featured: featured || false,
      affiliate_link,
      cover_image_url,
      isbn,
      publication_year,
      pages,
      language: language || 'nl',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Book created successfully:', newBook.id);
    return NextResponse.json({ book: newBook });
  } catch (error) {
    console.error('❌ Error in books POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}