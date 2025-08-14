# Auth Loop Investigation - Implementation Tasks

## Critical Fixes to Eliminate Auth Loop

### Task 1: Fix OAuth Callback Redirect Logic
- [ ] 1.1 Update OAuthCallback to check onboarding status before redirect
  - Modify `/pages/OAuthCallback.tsx` to query user_profiles table
  - If onboarding_completed = false → redirect to `/onboarding`
  - If onboarding_completed = true → redirect to `/dashboard`
  - If no profile exists → redirect to `/onboarding`
  - _Requirements: 1.1, 2.1, 4.1_

### Task 2: Fix Auth Page Redirect Logic  
- [ ] 2.1 Update Auth page to check onboarding status for authenticated users
  - Modify `/pages/Auth.tsx` to query user_profiles table
  - If user is authenticated AND needs onboarding → redirect to `/onboarding`
  - If user is authenticated AND onboarding complete → redirect to `/dashboard`
  - _Requirements: 1.2, 2.2, 4.2_

### Task 3: Add Onboarding Check to Protected Component
- [ ] 3.1 Implement onboarding status check in Protected component
  - Add onboarding status query to Protected component
  - If user needs onboarding → redirect to `/onboarding`
  - If onboarding complete → allow access to protected routes
  - Cache onboarding status to prevent repeated queries
  - _Requirements: 1.3, 2.3, 4.3_

### Task 4: Bulletproof State Management
- [ ] 4.1 Create centralized onboarding status hook
  - Create `useOnboardingStatus` hook for consistent state management
  - Implement caching to prevent repeated database calls
  - Handle loading and error states properly
  - _Requirements: 3.1, 3.2, 3.3_

### Task 5: Comprehensive Testing
- [ ] 5.1 Test new user flow end-to-end
  - Sign up → OAuth → Onboarding → Dashboard (no loops)
  - Verify database records are created correctly
  - Test error scenarios and recovery paths
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5.2 Test existing user flow end-to-end  
  - Sign in → Dashboard (no loops, no onboarding)
  - Verify onboarding is properly bypassed
  - Test with various user profile states
  - _Requirements: 5.1, 5.2, 5.4_

### Task 6: Loop Prevention Safeguards
- [ ] 6.1 Implement maximum redirect limits
  - Add redirect counting to prevent infinite loops
  - Implement fallback routes for error states
  - Add comprehensive error logging
  - _Requirements: 4.1, 4.4_

## Success Criteria

- ✅ New users: Auth → Onboarding → Dashboard (no loops)
- ✅ Existing users: Auth → Dashboard (no loops)  
- ✅ Error recovery: Clear path forward always
- ✅ Zero infinite redirects or loops
- ✅ Bulletproof state management