// Simple auth error mapping - replaces deleted complex services
export const mapSupabaseAuthError = (error: any): string => {
  if (!error?.message) return 'An unexpected error occurred';
  
  const message = error.message.toLowerCase();
  
  if (message.includes('user already registered')) {
    return 'This email is already registered. Please try logging in instead.';
  }
  
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Please check your email and click the confirmation link.';
  }
  
  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Please choose a stronger password.';
  }
  
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  
  // Return the original error message for other cases
  return error.message;
};