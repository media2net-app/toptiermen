-- Insert dummy academy modules data
-- Run this SQL in your Supabase SQL editor

INSERT INTO academy_modules (
    title,
    description,
    short_description,
    status,
    order_index,
    created_at,
    updated_at
) VALUES 
(
    'Discipline & Identiteit',
    'Leer hoe je discipline ontwikkelt en je ware identiteit ontdekt. Dit is de fundering voor alle andere modules.',
    'Ontwikkel discipline en ontdek je ware identiteit',
    'published',
    1,
    NOW(),
    NOW()
),
(
    'Fysieke Dominantie',
    'Bouw een sterk, gezond lichaam en ontwikkel fysieke kracht en uithoudingsvermogen.',
    'Bouw een sterk en gezond lichaam',
    'published',
    2,
    NOW(),
    NOW()
),
(
    'Mindset & Focus',
    'Ontwikkel een groei mindset, verbeter je focus en leer hoe je je mentale kracht kunt vergroten.',
    'Ontwikkel een groei mindset en verbeter je focus',
    'published',
    3,
    NOW(),
    NOW()
),
(
    'Finance & Business',
    'Leer over financiële basisbegrippen, investeren, ondernemerschap en het opbouwen van passief inkomen.',
    'Leer over financiën, investeren en ondernemerschap',
    'published',
    4,
    NOW(),
    NOW()
),
(
    'Brotherhood & Sociale Vaardigheden',
    'Ontwikkel sterke sociale vaardigheden, bouw waardevolle relaties op en word een natuurlijke leider.',
    'Ontwikkel sociale vaardigheden en bouw relaties op',
    'published',
    5,
    NOW(),
    NOW()
),
(
    'Voeding & Gezondheid',
    'Leer over gezonde voeding, supplementen en algemeen welzijn voor optimale gezondheid.',
    'Leer over gezonde voeding en welzijn',
    'published',
    6,
    NOW(),
    NOW()
);
