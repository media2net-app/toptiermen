import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Analyzing missing training schema combinations...');
    
    // Get all training schemas
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .order('created_at');
    
    if (schemasError) {
      return NextResponse.json({ 
        success: false, 
        error: schemasError.message 
      }, { status: 500 });
    }
    
    // Define all possible combinations we should have
    const allPossibleCombinations = [
      // Spiermassa combinations
      { training_goal: 'spiermassa', category: 'Gym', difficulty: 'Beginner' },
      { training_goal: 'spiermassa', category: 'Gym', difficulty: 'Intermediate' },
      { training_goal: 'spiermassa', category: 'Gym', difficulty: 'Advanced' },
      { training_goal: 'spiermassa', category: 'Home', difficulty: 'Beginner' },
      { training_goal: 'spiermassa', category: 'Home', difficulty: 'Intermediate' },
      { training_goal: 'spiermassa', category: 'Home', difficulty: 'Advanced' },
      { training_goal: 'spiermassa', category: 'Outdoor', difficulty: 'Beginner' },
      { training_goal: 'spiermassa', category: 'Outdoor', difficulty: 'Intermediate' },
      { training_goal: 'spiermassa', category: 'Outdoor', difficulty: 'Advanced' },
      
      // Kracht combinations
      { training_goal: 'kracht', category: 'Gym', difficulty: 'Beginner' },
      { training_goal: 'kracht', category: 'Gym', difficulty: 'Intermediate' },
      { training_goal: 'kracht', category: 'Gym', difficulty: 'Advanced' },
      { training_goal: 'kracht', category: 'Home', difficulty: 'Beginner' },
      { training_goal: 'kracht', category: 'Home', difficulty: 'Intermediate' },
      { training_goal: 'kracht', category: 'Home', difficulty: 'Advanced' },
      { training_goal: 'kracht', category: 'Outdoor', difficulty: 'Beginner' },
      { training_goal: 'kracht', category: 'Outdoor', difficulty: 'Intermediate' },
      { training_goal: 'kracht', category: 'Outdoor', difficulty: 'Advanced' },
      
      // Uithouding combinations
      { training_goal: 'uithouding', category: 'Gym', difficulty: 'Beginner' },
      { training_goal: 'uithouding', category: 'Gym', difficulty: 'Intermediate' },
      { training_goal: 'uithouding', category: 'Gym', difficulty: 'Advanced' },
      { training_goal: 'uithouding', category: 'Home', difficulty: 'Beginner' },
      { training_goal: 'uithouding', category: 'Home', difficulty: 'Intermediate' },
      { training_goal: 'uithouding', category: 'Home', difficulty: 'Advanced' },
      { training_goal: 'uithouding', category: 'Outdoor', difficulty: 'Beginner' },
      { training_goal: 'uithouding', category: 'Outdoor', difficulty: 'Intermediate' },
      { training_goal: 'uithouding', category: 'Outdoor', difficulty: 'Advanced' }
    ];
    
    // Analyze existing combinations
    const existingCombinations = new Set();
    schemas?.forEach(schema => {
      const key = `${schema.training_goal}-${schema.category}-${schema.difficulty}`;
      existingCombinations.add(key);
    });
    
    // Find missing combinations
    const missingCombinations = allPossibleCombinations.filter(combo => {
      const key = `${combo.training_goal}-${combo.category}-${combo.difficulty}`;
      return !existingCombinations.has(key);
    });
    
    // Group missing combinations by category
    const missingByCategory = {
      'Gym': missingCombinations.filter(c => c.category === 'Gym'),
      'Home': missingCombinations.filter(c => c.category === 'Home'),
      'Outdoor': missingCombinations.filter(c => c.category === 'Outdoor')
    };
    
    // Group missing combinations by training goal
    const missingByGoal = {
      'spiermassa': missingCombinations.filter(c => c.training_goal === 'spiermassa'),
      'kracht': missingCombinations.filter(c => c.training_goal === 'kracht'),
      'uithouding': missingCombinations.filter(c => c.training_goal === 'uithouding')
    };
    
    // Group missing combinations by difficulty
    const missingByDifficulty = {
      'Beginner': missingCombinations.filter(c => c.difficulty === 'Beginner'),
      'Intermediate': missingCombinations.filter(c => c.difficulty === 'Intermediate'),
      'Advanced': missingCombinations.filter(c => c.difficulty === 'Advanced')
    };
    
    // Count existing combinations
    const existingByCategory = {
      'Gym': schemas?.filter(s => s.category === 'Gym').length || 0,
      'Home': schemas?.filter(s => s.category === 'Home').length || 0,
      'Outdoor': schemas?.filter(s => s.category === 'Outdoor').length || 0
    };
    
    const existingByGoal = {
      'spiermassa': schemas?.filter(s => s.training_goal === 'spiermassa').length || 0,
      'kracht': schemas?.filter(s => s.training_goal === 'kracht').length || 0,
      'uithouding': schemas?.filter(s => s.training_goal === 'uithouding').length || 0
    };
    
    const existingByDifficulty = {
      'Beginner': schemas?.filter(s => s.difficulty === 'Beginner').length || 0,
      'Intermediate': schemas?.filter(s => s.difficulty === 'Intermediate').length || 0,
      'Advanced': schemas?.filter(s => s.difficulty === 'Advanced').length || 0
    };
    
    return NextResponse.json({
      success: true,
      summary: {
        totalPossibleCombinations: allPossibleCombinations.length,
        totalExistingSchemas: schemas?.length || 0,
        totalMissingCombinations: missingCombinations.length,
        completionPercentage: Math.round(((schemas?.length || 0) / allPossibleCombinations.length) * 100)
      },
      existing: {
        byCategory: existingByCategory,
        byGoal: existingByGoal,
        byDifficulty: existingByDifficulty
      },
      missing: {
        total: missingCombinations.length,
        byCategory: {
          'Gym': missingByCategory.Gym.length,
          'Home': missingByCategory.Home.length,
          'Outdoor': missingByCategory.Outdoor.length
        },
        byGoal: {
          'spiermassa': missingByGoal.spiermassa.length,
          'kracht': missingByGoal.kracht.length,
          'uithouding': missingByGoal.uithouding.length
        },
        byDifficulty: {
          'Beginner': missingByDifficulty.Beginner.length,
          'Intermediate': missingByDifficulty.Intermediate.length,
          'Advanced': missingByDifficulty.Advanced.length
        },
        combinations: missingCombinations
      }
    });
    
  } catch (error) {
    console.error('❌ Error in analyze-missing-training-schemas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
