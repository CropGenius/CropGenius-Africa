# 🔥 CROPGENIUS ONBOARDING FLOW - MANUAL TESTING CHECKLIST

## 🎯 CRITICAL TEST SCENARIOS

### ✅ TEST 1: NEW USER SIGNUP FLOW
**Expected:** New user → Auth → Onboarding → Dashboard

1. **Clear browser data/incognito mode**
2. **Navigate to cropgenius.africa**
3. **Should see:** Auth page with Google sign-in button
4. **Click:** "Continue with Google"
5. **Complete:** Google OAuth flow
6. **Should redirect to:** `/onboarding` (NOT dashboard)
7. **Should see:** Step 1 of 4 onboarding

### ✅ TEST 2: ONBOARDING STEP PROGRESSION
**Expected:** All buttons work, data saves, progress advances

**Step 1 - Personal Info:**
- [ ] Full name field pre-populated from Google
- [ ] Location field empty and editable
- [ ] Continue button disabled until name entered
- [ ] Continue button works and advances to Step 2

**Step 2 - Farm Details:**
- [ ] Farm size numeric input works
- [ ] Farm type dropdown works
- [ ] Continue button disabled until farm type selected
- [ ] Continue button advances to Step 3

**Step 3 - Experience:**
- [ ] Experience level dropdown works
- [ ] Primary crops checkboxes work (multiple selection)
- [ ] Continue button disabled until experience selected
- [ ] Continue button advances to Step 4

**Step 4 - Goals:**
- [ ] Goals checkboxes work (multiple selection)
- [ ] "Complete Setup" button shows loading state
- [ ] Button saves data to database
- [ ] Redirects to dashboard after completion

### ✅ TEST 3: DATABASE VERIFICATION
**Expected:** Data properly saved in both tables

After completing onboarding, verify:
- [ ] `user_profiles` table has new record with user data
- [ ] `onboarding` table has record with `completed = true`
- [ ] All form data properly stored

### ✅ TEST 4: EXISTING USER FLOW
**Expected:** Existing user bypasses onboarding

1. **Complete onboarding once (Test 1-3)**
2. **Sign out**
3. **Sign in again**
4. **Should redirect directly to:** `/dashboard` (NOT onboarding)

### ✅ TEST 5: EDGE CASES
**Expected:** Graceful handling of errors

- [ ] **Network error during onboarding:** Shows error message
- [ ] **Incomplete onboarding + refresh:** Stays on onboarding
- [ ] **Direct navigation to `/dashboard` without onboarding:** Redirects to onboarding
- [ ] **Back button during onboarding:** Stays on onboarding page

### ✅ TEST 6: UI/UX VERIFICATION
**Expected:** Professional, responsive interface

- [ ] **Progress indicator:** Shows correct step (1/4, 2/4, etc.)
- [ ] **Visual feedback:** Completed steps show checkmarks
- [ ] **Loading states:** Buttons show spinners during submission
- [ ] **Mobile responsive:** Works on phone screens
- [ ] **Form validation:** Required fields properly validated

## 🚨 CRITICAL SUCCESS CRITERIA

### ✅ ZERO FRICTION POINTS:
- [ ] No broken buttons
- [ ] No database errors
- [ ] No routing loops
- [ ] No missing data
- [ ] No UI glitches

### ✅ SMOOTH USER JOURNEY:
- [ ] New user: Auth → Onboarding → Dashboard
- [ ] Existing user: Auth → Dashboard
- [ ] All data persisted correctly
- [ ] Professional appearance

## 🔥 TESTING COMMANDS

### Database Verification:
```sql
-- Check onboarding records
SELECT * FROM onboarding ORDER BY created_at DESC LIMIT 5;

-- Check user profiles
SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 5;

-- Verify onboarding completion
SELECT 
  up.full_name,
  up.onboarding_completed,
  o.completed,
  o.step
FROM user_profiles up
LEFT JOIN onboarding o ON up.user_id = o.user_id
ORDER BY up.created_at DESC;
```

## 🎯 PASS/FAIL CRITERIA

**✅ PASS:** All checkboxes checked, smooth flow, data saved
**❌ FAIL:** Any broken button, missing data, or routing issue

**EVERY FRICTION = MILLIONS IN LOSSES!** 🔥💪