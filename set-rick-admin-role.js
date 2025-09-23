// Script om Rick's rol naar admin te zetten
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setRickAdminRole() {
  try {
    console.log('🔧 Setting Rick to admin role...');
    
    // 1. Check if Rick exists in profiles
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu')
      .single();
    
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      console.log('❌ Rick not found in profiles table');
      console.log('📝 Please create the account first via signup, then run this script again');
      console.log('🔗 Go to: http://localhost:3000/login');
      console.log('📧 Email: rick@toptiermen.eu');
      console.log('🔑 Password: Carnivoor2025!');
      return;
    }
    
    if (existingProfile) {
      console.log('✅ Rick found in profiles:', existingProfile.id);
      console.log('📧 Current email:', existingProfile.email);
      console.log('👑 Current role:', existingProfile.role);
      
      // Update profile to admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          rank: 'Elite',
          points: 1000,
          missions_completed: 50,
          bio: 'Top Tier Men Platform Administrator',
          location: 'Netherlands',
          interests: ['Leadership', 'Management', 'Technology', 'Community'],
          updated_at: new Date().toISOString()
        })
        .eq('email', 'rick@toptiermen.eu')
        .select();
      
      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        return;
      }
      
      console.log('✅ Profile updated to admin:', profileData);
      
      // Verify the update
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'rick@toptiermen.eu')
        .single();
      
      if (verifyError) {
        console.error('❌ Error verifying profile:', verifyError);
        return;
      }
      
      console.log('🎉 Rick admin account restored successfully!');
      console.log('📧 Email: rick@toptiermen.eu');
      console.log('🔑 Password: Carnivoor2025!');
      console.log('👑 Role:', verifyProfile.role);
      console.log('🆔 User ID:', verifyProfile.id);
      console.log('⭐ Rank:', verifyProfile.rank);
      console.log('📅 Updated:', verifyProfile.updated_at);
      
    }
    
  } catch (error) {
    console.error('🚨 An unexpected error occurred:', error);
  }
}

setRickAdminRole();
