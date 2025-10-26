// Script to create admin user in Supabase
// Run this with: node scripts/create-admin-user.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to your .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\n📝 Add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('   You can find it in Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  console.log('🚀 Creating admin user...');
  
  try {
    // Step 1: Create user in Supabase Auth
    console.log('📧 Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'pathtechacademy@gmail.com',
      password: 'admin',
      email_confirm: true,
      user_metadata: {
        full_name: 'PathTech Admin'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // Step 2: Create admin profile in database
    console.log('👤 Creating admin profile in database...');
    const { data: profileData, error: profileError } = await supabase
      .from('students')
      .insert([{
        user_id: authData.user.id,
        full_name: 'PathTech Admin',
        email: 'pathtechacademy@gmail.com',
        is_admin: true,
      }])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating admin profile:', profileError.message);
      return;
    }

    console.log('✅ Admin profile created successfully!');
    console.log('   Profile ID:', profileData.id);
    console.log('   Is Admin:', profileData.is_admin);

    console.log('\n🎉 Admin user setup complete!');
    console.log('📝 You can now login with:');
    console.log('   Email: pathtechacademy@gmail.com');
    console.log('   Password: admin');
    console.log('\n🌐 Go to: http://localhost:5174/admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createAdminUser();
