// Client-side ebook scanning logic
import { supabase } from '@/lib/supabase';

export interface EbookAnalysis {
  filename: string;
  path: string;
  title: string;
  module: string;
  styleType: string;
  description: string;
  hasInterFont: boolean;
  hasSegoeUI: boolean;
  hasEbookContainer: boolean;
  hasModuleBadge: boolean;
  hasEnhancedStyling: boolean;
  hasTableOfContents: boolean;
  hasReflectionSection: boolean;
  hasActionItems: boolean;
  needsUpdate: boolean;
  priority: number;
}

// Static lijst van alle bekende ebooks (handmatig samengesteld)
const KNOWN_EBOOKS = [
  // MODERNE STYLING (Inter font) - GOED
  {
    filename: 'discipline-identiteit-wat-is-discipline-en-waarom-is-dit-essentieel-ebook.html',
    title: 'Wat is Discipline en waarom is dit Essentieel',
    module: 'Discipline & Identiteit',
    styleType: 'modern',
    priority: 1
  },
  {
    filename: 'fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.html',
    title: 'Waarom is fysieke dominantie zo belangrijk?',
    module: 'Fysieke Dominantie',
    styleType: 'modern',
    priority: 1
  },
  {
    filename: 'brotherhood-waarom-een-brotherhood-ebook.html',
    title: 'Waarom een Brotherhood',
    module: 'Brotherhood',
    styleType: 'modern',
    priority: 1
  },
  {
    filename: 'business-and-finance--de-financi-le-mindset--ebook.html',
    title: 'De Financiële Mindset',
    module: 'Business & Finance',
    styleType: 'modern',
    priority: 1
  },
  {
    filename: 'mentale-kracht-weerbaarheid-wat-is-mentale-kracht-ebook.html',
    title: 'Wat is mentale kracht',
    module: 'Mentale Kracht & Weerbaarheid',
    styleType: 'modern',
    priority: 1
  },
  {
    filename: 'discipline-basis-ebook.html',
    title: 'De Basis van Discipline',
    module: 'Discipline & Identiteit',
    styleType: 'modern',
    priority: 1
  },
  {
    filename: 'testosteron-basis-ebook.html',
    title: 'Wat is Testosteron - Basis',
    module: 'Testosteron',
    styleType: 'modern',
    priority: 1
  },

  // ENHANCED STYLING (Segoe UI met module badge) - REDELIJK GOED
  {
    filename: 'cut-the-weak-enhanced-ebook.html',
    title: 'Cut The Weak - Brotherhood',
    module: 'Brotherhood',
    styleType: 'enhanced',
    priority: 2
  },
  {
    filename: 'de-basisprincipes-van-voeding-enhanced-ebook.html',
    title: 'De Basisprincipes van Voeding',
    module: 'Voeding & Gezondheid',
    styleType: 'enhanced',
    priority: 2
  },
  {
    filename: 'testosteron-doping-enhanced-ebook.html',
    title: 'De Waarheid over Testosteron Doping',
    module: 'Testosteron',
    styleType: 'enhanced',
    priority: 2
  },
  {
    filename: 'slaap-de-vergeten-superkracht-enhanced-ebook.html',
    title: 'Slaap - De Vergeten Superkracht',
    module: 'Voeding & Gezondheid',
    styleType: 'enhanced',
    priority: 2
  },
  {
    filename: 'hydratatie-en-water-inname-enhanced-ebook.html',
    title: 'Hydratatie en Water Inname',
    module: 'Voeding & Gezondheid',
    styleType: 'enhanced',
    priority: 2
  },

  // BASIC STYLING MET MODULE BADGE - MOET WORDEN GEÜPDATET
  {
    filename: 'wat-is-testosteron-ebook.html',
    title: 'Wat is Testosteron',
    module: 'Testosteron',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'embrace-the-suck-ebook.html',
    title: 'Embrace the Suck',
    module: 'Fysieke Dominantie',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'de-waarheid-over-testosteron-doping-ebook.html',
    title: 'De Waarheid over Testosteron Doping',
    module: 'Testosteron',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'cut-the-weak-ebook.html',
    title: 'Cut The Weak',
    module: 'Brotherhood',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'eer-en-loyaliteit-ebook.html',
    title: 'Eer en Loyaliteit',
    module: 'Brotherhood',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'hoe-je-je-broeders-versterkt-en-samen-groeit-ebook.html',
    title: 'Hoe je je broeders versterkt en samen groeit',
    module: 'Brotherhood',
    styleType: 'badge',
    priority: 3
  },

  // BASIC STYLING ZONDER MODULE BADGE - HOOGSTE PRIORITEIT OM TE UPDATEN
  {
    filename: 'kernwaarden-top-tier-ebook.html',
    title: 'Kernwaarden Top Tier',
    module: 'Discipline & Identiteit',
    styleType: 'basic',
    priority: 4
  },
  {
    filename: 'identiteit-definieren-ebook.html',
    title: 'Identiteit Definiëren',
    module: 'Discipline & Identiteit',
    styleType: 'basic',
    priority: 4
  },
  {
    filename: 'discipline-levensstijl-ebook.html',
    title: 'Discipline Levensstijl',
    module: 'Discipline & Identiteit',
    styleType: 'basic',
    priority: 4
  },
  {
    filename: 'testosteron-kracht-ebook.html',
    title: 'Testosteron Kracht',
    module: 'Testosteron',
    styleType: 'basic',
    priority: 4
  },
  {
    filename: 'testosteron-killers-ebook.html',
    title: 'Testosteron Killers',
    module: 'Testosteron',
    styleType: 'basic',
    priority: 4
  },
  
  // Voeding & Gezondheid modules
  {
    filename: 'de-basisprincipes-van-voeding-ebook.html',
    title: 'De Basisprincipes van Voeding',
    module: 'Voeding & Gezondheid',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'slaap-de-vergeten-superkracht-ebook.html',
    title: 'Slaap - De Vergeten Superkracht',
    module: 'Voeding & Gezondheid',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'energie-en-focus-ebook.html',
    title: 'Energie en Focus',
    module: 'Voeding & Gezondheid',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'gezondheid-als-fundament-ebook.html',
    title: 'Gezondheid als Fundament',
    module: 'Voeding & Gezondheid',
    styleType: 'badge',
    priority: 3
  },
  
  // Business & Finance modules
  {
    filename: 'grip-op-je-geld-ebook.html',
    title: 'Grip op je Geld',
    module: 'Business & Finance',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'vermogen-opbouwen-begin-met-investeren-ebook.html',
    title: 'Vermogen Opbouwen - Begin met Investeren',
    module: 'Business & Finance',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'van-werknemer-naar-eigen-verdienmodellen-ebook.html',
    title: 'Van Werknemer naar Eigen Verdienmodellen',
    module: 'Business & Finance',
    styleType: 'modern',
    priority: 1
  },
  
  // Mentale Kracht modules
  {
    filename: 'een-onbreekbare-mindset-ebook.html',
    title: 'Een Onbreekbare Mindset',
    module: 'Mentale Kracht & Weerbaarheid',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'mentale-weerbaarheid-in-de-praktijk-ebook.html',
    title: 'Mentale Weerbaarheid in de Praktijk',
    module: 'Mentale Kracht & Weerbaarheid',
    styleType: 'badge',
    priority: 3
  },
  
  // Fysieke Dominantie modules
  {
    filename: 'het-belang-van-kracht-spiermassa-en-conditie-ebook.html',
    title: 'Het Belang van Kracht, Spiermassa en Conditie',
    module: 'Fysieke Dominantie',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: 'vitaliteit-en-levensduur-ebook.html',
    title: 'Vitaliteit en Levensduur',
    module: 'Fysieke Dominantie',
    styleType: 'badge',
    priority: 3
  },
  {
    filename: '-status-zelfrespect-en-aantrekkingskracht-ebook.html',
    title: 'Status, Zelfrespect en Aantrekkingskracht',
    module: 'Fysieke Dominantie',
    styleType: 'badge',
    priority: 3
  }
];

export function analyzeStyleType(styleType: string): { description: string, features: any } {
  switch (styleType) {
    case 'modern':
      return {
        description: 'Moderne Inter styling (zoals Module 1 Les 1)',
        features: {
          hasInterFont: true,
          hasSegoeUI: false,
          hasEbookContainer: true,
          hasModuleBadge: false,
          hasEnhancedStyling: false,
          hasTableOfContents: true,
          hasReflectionSection: true,
          hasActionItems: true,
          needsUpdate: false
        }
      };
    case 'enhanced':
      return {
        description: 'Enhanced styling met module badge',
        features: {
          hasInterFont: false,
          hasSegoeUI: true,
          hasEbookContainer: false,
          hasModuleBadge: true,
          hasEnhancedStyling: true,
          hasTableOfContents: true,
          hasReflectionSection: true,
          hasActionItems: true,
          needsUpdate: true
        }
      };
    case 'badge':
      return {
        description: 'Basis styling met module badge',
        features: {
          hasInterFont: false,
          hasSegoeUI: true,
          hasEbookContainer: false,
          hasModuleBadge: true,
          hasEnhancedStyling: false,
          hasTableOfContents: true,
          hasReflectionSection: false,
          hasActionItems: true,
          needsUpdate: true
        }
      };
    case 'basic':
      return {
        description: 'Basis styling zonder module badge',
        features: {
          hasInterFont: false,
          hasSegoeUI: true,
          hasEbookContainer: false,
          hasModuleBadge: false,
          hasEnhancedStyling: false,
          hasTableOfContents: false,
          hasReflectionSection: false,
          hasActionItems: false,
          needsUpdate: true
        }
      };
    default:
      return {
        description: 'Onbekende styling',
        features: {
          hasInterFont: false,
          hasSegoeUI: false,
          hasEbookContainer: false,
          hasModuleBadge: false,
          hasEnhancedStyling: false,
          hasTableOfContents: false,
          hasReflectionSection: false,
          hasActionItems: false,
          needsUpdate: true
        }
      };
  }
}

export async function populateEbooksDatabase(): Promise<{ success: boolean, count: number, error?: string }> {
  try {
    console.log('🔄 Populeren van ebook database...');
    
    // Eerst alle bestaande data verwijderen
    const { error: deleteError } = await supabase
      .from('academy_ebook_files')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      throw new Error(`Fout bij verwijderen oude data: ${deleteError.message}`);
    }

    // Bereid data voor
    const ebooksData = KNOWN_EBOOKS.map(ebook => {
      const analysis = analyzeStyleType(ebook.styleType);
      
      return {
        filename: ebook.filename,
        path: `/books/${ebook.filename}`,
        title: ebook.title,
        module: ebook.module,
        style_type: ebook.styleType,
        style_description: analysis.description,
        ...analysis.features,
        priority: ebook.priority,
        status: 'active'
      };
    });

    // Insert data in batches
    const batchSize = 20;
    let totalInserted = 0;
    
    for (let i = 0; i < ebooksData.length; i += batchSize) {
      const batch = ebooksData.slice(i, i + batchSize);
      
      const { error: insertError, data } = await supabase
        .from('academy_ebook_files')
        .insert(batch)
        .select('id');
      
      if (insertError) {
        throw new Error(`Fout bij inserting batch ${i}: ${insertError.message}`);
      }
      
      totalInserted += data?.length || batch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} van ${Math.ceil(ebooksData.length/batchSize)} voltooid`);
    }

    console.log(`✅ ${totalInserted} ebooks succesvol toegevoegd aan database`);
    
    return { success: true, count: totalInserted };
  } catch (error: any) {
    console.error('❌ Fout bij populeren database:', error);
    return { success: false, count: 0, error: error.message };
  }
}

export async function getEbookStats() {
  try {
    const { data, error } = await supabase
      .from('academy_ebook_files')
      .select('style_type, needs_update')
      .eq('status', 'active');
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      modern: data.filter(e => e.style_type === 'modern').length,
      enhanced: data.filter(e => e.style_type === 'enhanced').length,
      badge: data.filter(e => e.style_type === 'badge').length,
      basic: data.filter(e => e.style_type === 'basic').length,
      needsUpdate: data.filter(e => e.needs_update).length
    };
    
    return { success: true, stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
