import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private authState: AuthState = {
    session: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  };
  private listeners: Array<(state: AuthState) => void> = [];

  static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth initialization error:', error);
        this.updateAuthState({
          ...this.authState,
          isLoading: false,
          error: error.message
        });
        return;
      }

      await this.setSession(session);
      this.updateAuthState({
        ...this.authState,
        isLoading: false
      });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        await this.setSession(session);
      });

    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.updateAuthState({
        ...this.authState,
        isLoading: false,
        error: 'Authentication service unavailable'
      });
    }
  }

  private async setSession(session: Session | null) {
    this.authState = {
      ...this.authState,
      session,
      user: session?.user || null,
      isAuthenticated: !!session?.user,
      error: null
    };
    
    this.notifyListeners();
  }

  private updateAuthState(newState: Partial<AuthState>) {
    this.authState = { ...this.authState, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(callback: (state: AuthState) => void) {
    this.listeners.push(callback);
    callback(this.authState); // Initial call
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signInWithGoogle() {
    try {
      this.updateAuthState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      this.updateAuthState({
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false
      });
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      this.updateAuthState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      await this.setSession(data.session);
      return data;
    } catch (error) {
      this.updateAuthState({
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false
      });
      throw error;
    }
  }

  async signUp(email: string, password: string, metadata?: any) {
    try {
      this.updateAuthState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      await this.setSession(data.session);
      return data;
    } catch (error) {
      this.updateAuthState({
        error: error instanceof Error ? error.message : 'Sign up failed',
        isLoading: false
      });
      throw error;
    }
  }

  async signOut() {
    try {
      this.updateAuthState({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await this.setSession(null);
    } catch (error) {
      this.updateAuthState({
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false
      });
      throw error;
    }
  }

  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        await this.signOut();
        return null;
      }

      await this.setSession(session);
      return session;
    } catch (error) {
      console.error('Session refresh failed:', error);
      await this.signOut();
      return null;
    }
  }

  async getValidSession() {
    if (this.authState.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.authState.session) {
      const refreshed = await this.refreshSession();
      return refreshed;
    }

    // Check if token is expired
    const expiresAt = this.authState.session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (expiresAt < now + 60) { // Refresh if expires within 1 minute
      console.log('Token expiring soon, refreshing...');
      const refreshed = await this.refreshSession();
      return refreshed;
    }

    return this.authState.session;
  }

  getAuthState() {
    return this.authState;
  }

  isAuthenticated() {
    return this.authState.isAuthenticated && !this.authState.isLoading;
  }

  getUser() {
    return this.authState.user;
  }

  getAccessToken() {
    return this.authState.session?.access_token;
  }

  async ensureAuthenticated() {
    const session = await this.getValidSession();
    if (!session) {
      throw new Error('Authentication required');
    }
    return session;
  }

  // Helper method to handle auth errors gracefully
  async handleAuthError(error: any): Promise<void> {
    if (error?.message?.includes('JWT') || error?.message?.includes('expired')) {
      console.log('Auth token expired, attempting refresh...');
      await this.refreshSession();
    } else if (error?.status === 401) {
      console.log('Unauthorized, signing out...');
      await this.signOut();
    } else {
      console.error('Auth error:', error);
    }
  }
}

// Export singleton instance
export const enhancedAuth = EnhancedAuthService.getInstance();

// Re-export simple functions for backward compatibility
export const signInWithGoogle = () => enhancedAuth.signInWithGoogle();
export const signOut = () => enhancedAuth.signOut();
export const getCurrentSession = () => enhancedAuth.getValidSession();