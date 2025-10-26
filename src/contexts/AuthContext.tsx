import { createContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, categoryId?: number) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('is_admin')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(data.is_admin || false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, categoryId?: number) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('students').insert([
          {
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            is_admin: false,
            category_id: categoryId || null,
            subscription_status: 'free',
          },
        ]);

        if (profileError) throw profileError;

        toast.success('Account created successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully!');
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
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
        // Handle specific Google OAuth errors
        if (error.message.includes('provider is not enabled')) {
          toast.error('Google login is not configured. Please contact support.');
          return;
        }
        if (error.message.includes('validation_failed')) {
          toast.error('Google OAuth configuration error. Please try again later.');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      toast.error(`Google Sign-In Error: ${errorMessage}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      toast.error(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

