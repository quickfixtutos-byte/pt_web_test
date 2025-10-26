import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export class AuthService {
  /**
   * Get current user with enhanced profile data
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return null;

      // Get user profile from students table
      const { data: profile } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      return {
        id: user.id,
        email: user.email || '',
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        isAdmin: profile.is_admin || false,
        isEmailVerified: user.email_confirmed_at !== null,
        createdAt: profile.created_at,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string, fullName: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // Validate input
      if (!email || !password || !fullName) {
        return { user: null, error: { message: 'All fields are required' } };
      }

      if (password.length < 6) {
        return { user: null, error: { message: 'Password must be at least 6 characters' } };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { user: null, error: { message: 'Please enter a valid email address' } };
      }

      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      if (data.user) {
        // Create student profile
        const { error: profileError } = await supabase.from('students').insert([
          {
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            is_admin: false,
            avatar_url: '',
            total_hours_studied: 0,
          },
        ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { user: null, error: { message: 'Failed to create user profile' } };
        }

        return { user: await this.getCurrentUser(), error: null };
      }

      return { user: null, error: { message: 'Failed to create account' } };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      if (!email || !password) {
        return { user: null, error: { message: 'Email and password are required' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      if (data.user) {
        const user = await this.getCurrentUser();
        return { user, error: null };
      }

      return { user: null, error: { message: 'Failed to sign in' } };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: { message: 'Failed to sign in with Google' } };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: 'Failed to sign out' } };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      if (!email) {
        return { error: { message: 'Email is required' } };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: { message: 'Failed to send reset email' } };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { error: { message: 'Password must be at least 6 characters' } };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: { message: 'Failed to update password' } };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<Pick<AuthUser, 'fullName' | 'avatarUrl'>>): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { user: null, error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('students')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        return { user: null, error: { message: error.message } };
      }

      const updatedUser = await this.getCurrentUser();
      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { user: null, error: { message: 'Failed to update profile' } };
    }
  }

  /**
   * Validate JWT token
   */
  static async validateToken(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.isAdmin || false;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }
}
