// Utility to create an admin user for development
import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  const adminEmail = 'admin@iris.sec';
  const adminPassword = 'admin123456';
  
  try {
    // First try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: 'IRIS Administrator',
          role: 'admin',
        },
      },
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('Error creating admin user:', signUpError);
      return { error: signUpError };
    }

    // If user already exists, try to sign in
    if (signUpError?.message.includes('already registered')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (signInError) {
        console.error('Error signing in admin user:', signInError);
        return { error: signInError };
      }

      // Update the user's role to admin
      if (signInData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', signInData.user.id);

        if (updateError) {
          console.error('Error updating user role:', updateError);
          return { error: updateError };
        }
      }
    }

    console.log('Admin user created/updated successfully');
    return { 
      success: true, 
      email: adminEmail, 
      password: adminPassword,
      message: 'Admin user ready. Email: admin@iris.sec, Password: admin123456'
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error };
  }
};

// Auto-create admin user on development
export const ensureAdminUser = () => {
  if (import.meta.env.DEV) {
    createAdminUser().then(result => {
      if (result.success) {
        console.log(result.message);
      } else {
        console.error('Failed to create admin user:', result.error);
      }
    });
  }
};
