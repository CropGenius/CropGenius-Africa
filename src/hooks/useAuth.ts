import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppError, ErrorCode, reportError, reportWarning } from '@/lib/errors';
import { networkManager } from '@/lib/network';
import { toast } from 'sonner';
import { fa } from '@faker-js/faker';
import { authDebugger, AuthEventType, logAuthEvent, logAuthError } from '@/utils/authDebugger';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  // Core auth state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingProfile: boolean;
  isRefreshing: boolean;
  isInitialized: boolean; // NEW: Track initialization completion
  
  // Error states
  error: AppError | null;
  profileError: AppError | null;
  
  // Feature flags
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasProfile: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const PROFILE_CACHE_KEY = 'auth_profile_cache';
const SESSION_RETRY_DELAY = 1000;
const MAX_SESSION_RETRIES = 3;

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isLoadingProfile: false,
    isRefreshing: false,
    isInitialized: false, // NEW: Track initialization completion
    error: null,
    profileError: null,
    isAuthenticated: false,
    isOnboardingComplete: false,
    hasProfile: false,
  });

  // Prevent rapid state updates with debouncing
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Debounced setState to prevent infinite loops
  const setStateDebounced = useCallback((updater: (prev: AuthState) => AuthState) => {
    const now = Date.now();
    
    // If last update was less than 100ms ago, debounce it
    if (now - lastUpdateRef.current < 100) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        setState(updater);
        lastUpdateRef.current = Date.now();
      }, 100);
    } else {
      setState(updater);
      lastUpdateRef.current = now;
    }
  }, []);

  // Memoized computed values for performance - OPTIMIZED TO PREVENT LOOPS
  const derivedState = useMemo(() => ({
    isAuthenticated: !!state.user,
    isOnboardingComplete: state.profile?.onboarding_completed ?? false,
    hasProfile: !!state.profile,
  }), [state.user?.id, state.profile?.id, state.profile?.onboarding_completed]); // Only track specific values

  // Cache profile data for offline access
  const cacheProfile = useCallback((profile: UserProfile | null) => {
    try {
      if (profile) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }
    } catch (error) {
      reportWarning('Failed to cache profile data', { error });
    }
  }, []);

  // Load cached profile data
  const loadCachedProfile = useCallback((): UserProfile | null => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      reportWarning('Failed to load cached profile', { error });
      return null;
    }
  }, []);

  // Fetch user profile with retry logic
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const operation = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile does not exist, create it
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId, 
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) throw insertError;
          profileData = newProfile;
        } else if (profileError) {
          throw profileError;
        }

        return { ...profileData, email: user.email } as UserProfile;
      };

      return await networkManager.executeWithRetry(operation, {
        retries: 3,
        priority: 'high',
        offlineQueue: true,
      });
    } catch (error) {
      const appError = new AppError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to fetch user profile',
        'Unable to load your profile. Some features may be limited.',
        { userId, error },
        true
      );
      
      setState(prev => ({ ...prev, profileError: appError }));
      reportError(appError);
      
      return loadCachedProfile();
    }
  }, [loadCachedProfile]);

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;

    const initializeAuth = async () => {
      try {
        console.log('🔑 [useAuth] Initializing auth...');
        
        const cachedProfile = loadCachedProfile();
        if (cachedProfile) {
          setState(prev => ({ ...prev, profile: cachedProfile }));
        }

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.warn('🔑 [useAuth] Session error:', error);
        }

        if (mounted) {
          console.log('🔑 [useAuth] Setting session state:', !!session);
          setStateDebounced(prev => ({
            ...prev,
            session,
            user: session?.user || null,
            isLoading: false,
            isInitialized: true,
            error: null,
          }));

          if (session?.user) {
            setStateDebounced(prev => ({ ...prev, isLoadingProfile: true }));
            try {
              const profile = await fetchProfile(session.user.id);
              
              if (mounted && profile) {
                setStateDebounced(prev => ({ ...prev, profile, isLoadingProfile: false }));
                cacheProfile(profile);
              } else if (mounted) {
                setStateDebounced(prev => ({ ...prev, isLoadingProfile: false }));
              }
            } catch (profileError) {
              console.warn('🔑 [useAuth] Profile fetch failed:', profileError);
              if (mounted) {
                setStateDebounced(prev => ({ ...prev, isLoadingProfile: false }));
              }
            }
          }
        }
      } catch (error) {
        console.warn('🔑 [useAuth] Initialization error:', error);
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            isLoadingProfile: false,
            isInitialized: true,
          }));

          if (retryCount < 2) {
            retryCount++;
            setTimeout(() => {
              if (mounted) {
                console.log(`🔑 [useAuth] Retrying initialization (${retryCount}/2)...`);
                initializeAuth();
              }
            }, SESSION_RETRY_DELAY * retryCount);
          }
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        reportWarning(`Auth event: ${event}`, { userId: session?.user?.id });

        setStateDebounced(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          error: null,
        }));

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              setState(prev => ({ ...prev, isLoadingProfile: true }));
              const profile = await fetchProfile(session.user.id);
              
              if (mounted) {
                setState(prev => ({ ...prev, profile, isLoadingProfile: false }));
                cacheProfile(profile);
                toast.success(`Welcome back, ${profile?.full_name || session.user.email}!`);
              }
            }
            break;

          case 'SIGNED_OUT':
            if (mounted) {
              setState(prev => ({
                ...prev,
                profile: null,
                error: null,
                profileError: null,
              }));
              cacheProfile(null);
              if (!window.location.pathname.includes('/oauth/callback')) {
                toast.info('You have been signed out');
              }
            }
            break;

          case 'TOKEN_REFRESHED':
            break;

          case 'USER_UPDATED':
            if (session?.user && mounted) {
              const profile = await fetchProfile(session.user.id);
              if (mounted && profile) {
                setState(prev => ({ ...prev, profile }));
                cacheProfile(profile);
              }
            }
            break;
        }
      }
    );

    initializeAuth();

    let profileChannel: ReturnType<typeof supabase.channel> | null = null;
    const currentUserId = state.user?.id;
    if (mounted && currentUserId) {
      profileChannel = supabase.channel(`profile-${currentUserId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUserId}`,
        }, (payload) => {
          const newProfile = payload.new as UserProfile;
          if (newProfile && newProfile.id === currentUserId) {
            setState(prev => ({ ...prev, profile: newProfile }));
            cacheProfile(newProfile);
          }
        })
        .subscribe();
    }

    return () => {
      console.log('🔑 [useAuth] Cleaning up auth listeners...');
      mounted = false;
      subscription.unsubscribe();
      if (profileChannel) profileChannel.unsubscribe();
      
      // Clean up debounce timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [fetchProfile, cacheProfile, loadCachedProfile]);

  /**
   * One-time referral bonus processing for invitee.
   * Looks for ?ref=TOKEN in initial URL, then calls process_referral RPC.
   */
  useEffect(() => {
    const userId = state.user?.id;
    if (!userId) return;

    const flagKey = `referral_applied_${userId}`;
    if (localStorage.getItem(flagKey)) return; // already processed

    const params = new URLSearchParams(window.location.search);
    const inviterToken = params.get('ref');
    if (!inviterToken) return;

    (async () => {
      try {
        const { error } = await supabase.rpc('process_referral', {
          p_referrer: inviterToken,
          p_referred: userId,
        });
        if (error) throw error;
        localStorage.setItem(flagKey, 'true');
        toast.success('Referral bonus applied: +10 credits!');
      } catch (err) {
        console.error('process_referral failed', err);
      }
    })();
  }, [state.user?.id]);

  // Auth actions
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        let code = ErrorCode.AUTH_INVALID_CREDENTIALS;
        if (error.message.includes('not confirmed')) {
          code = ErrorCode.AUTH_USER_NOT_FOUND;
        }
        
        throw new AppError(
          code,
          error.message,
          'Failed to sign in. Please check your credentials.',
          { email: email.trim().toLowerCase() }
        );
      }

      // Success is handled by the auth state change listener
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.AUTH_INVALID_CREDENTIALS);
      
      setState(prev => ({ ...prev, error: appError, isLoading: false }));
      reportError(appError);
      throw appError;
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) {
        throw new AppError(
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          error.message,
          'Failed to create account. Please try again.',
          { email: email.trim().toLowerCase() }
        );
      }

      toast.success('Account created! Please check your email to verify your account.');
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.AUTH_INVALID_CREDENTIALS);
      
      setState(prev => ({ ...prev, error: appError, isLoading: false }));
      reportError(appError);
      throw appError;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new AppError(
          ErrorCode.AUTH_SESSION_EXPIRED,
          error.message,
          'Failed to sign out. Please try again.',
          { error }
        );
      }

      // Success is handled by the auth state change listener
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.AUTH_SESSION_EXPIRED);
      
      setState(prev => ({ ...prev, error: appError, isLoading: false }));
      reportError(appError);
      throw appError;
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true, error: null }));
      
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw new AppError(
          ErrorCode.AUTH_SESSION_EXPIRED,
          error.message,
          'Failed to refresh session. Please log in again.',
          { error }
        );
      }
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.AUTH_SESSION_EXPIRED);
      
      setState(prev => ({ ...prev, error: appError }));
      reportError(appError);
      throw appError;
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!state.user) return;

    try {
      setState(prev => ({ ...prev, isLoadingProfile: true, profileError: null }));
      
      const profile = await fetchProfile(state.user.id);
      
      setState(prev => ({ ...prev, profile, isLoadingProfile: false }));
      cacheProfile(profile);
    } catch (error) {
      setState(prev => ({ ...prev, isLoadingProfile: false }));
      // Error is already handled in fetchProfile
    }
  }, [state.user, fetchProfile, cacheProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    if (!state.user) {
      throw new AppError(
        ErrorCode.AUTH_USER_NOT_FOUND,
        'User not authenticated',
        'Please log in to update your profile.'
      );
    }

    try {
      setState(prev => ({ ...prev, isLoadingProfile: true, profileError: null }));

      const operation = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.user!.id)
          .select()
          .single();

        if (error) throw error;
        return data as UserProfile;
      };

      const updatedProfile = await networkManager.executeWithRetry(operation, {
        retries: 3,
        priority: 'high',
        offlineQueue: true,
      });

      setState(prev => ({ 
        ...prev, 
        profile: updatedProfile, 
        isLoadingProfile: false 
      }));
      cacheProfile(updatedProfile);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      const appError = new AppError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to update profile',
        'Your profile changes could not be saved. Please try again.',
        { updates, error },
        true
      );
      
      setState(prev => ({ 
        ...prev, 
        profileError: appError, 
        isLoadingProfile: false 
      }));
      reportError(appError);
      throw appError;
    }
  }, [state.user, cacheProfile]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        throw new AppError(
          ErrorCode.AUTH_INVALID_CREDENTIALS,
          error.message,
          'Failed to send reset email. Please check your email address.',
          { email: email.trim().toLowerCase() }
        );
      }

      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.AUTH_INVALID_CREDENTIALS);
      
      reportError(appError);
      throw appError;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, profileError: null }));
  }, []);

  // Debug logging for authentication state - OPTIMIZED TO PREVENT LOOPS
  useEffect(() => {
    // Only log significant state changes to prevent infinite loops
    const significantState = {
      hasUser: !!state.user,
      userEmail: state.user?.email,
      isLoading: state.isLoading,
      isAuthenticated: !!state.user,
      session: !!state.session,
      profile: !!state.profile,
      isInitialized: state.isInitialized
    };
    
    // Only log if this is a meaningful change
    if (state.isInitialized && (state.user || state.session || !state.isLoading)) {
      console.log('🔍 [AUTH DEBUG] Significant state change:', significantState);
    }
  }, [state.user?.id, state.session?.access_token, state.isLoading, state.isInitialized]); // Only track specific values

  return {
    ...state,
    ...derivedState,
    signIn,
    signUp,
    signOut,
    refreshSession,
    refreshProfile,
    updateProfile,
    resetPassword,
    clearError,
  };
};

export default useAuth;
