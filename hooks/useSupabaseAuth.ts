import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
  data: {
    full_name: fullName,
    phone_number: phoneNumber,
  },
},
      });
      
      if (error) throw error;
      
      // Create user profile with name and phone number
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              full_name: fullName,
              phone_number: phoneNumber,
            });
          
          if (profileError) {
            console.error('Failed to create user profile:', profileError);
            // Don't throw error here - auth was successful, profile creation is secondary
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const ensureAuthenticated = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    ensureAuthenticated,
  };
}