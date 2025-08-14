# GOOGLE OAUTH BOOK OF LIES - CROPGENIUS PRODUCTION MANUAL

## THE ULTIMATE LIE: "OAuth Just Works"

**TRUTH**: New users get trapped in infinite loops because profile creation happens AFTER auth redirect, creating a race condition where the app thinks the user is authenticated but has no profile data.

**THE NUCLEAR FIX**: Set `onboarding_completed = TRUE` by default for new users to skip the onboarding loop trap.

## LIE #2: "Supabase Handles Everything"

**TRUTH**: Supabase triggers run AFTER the OAuth callback, causing new users to hit protected routes before their profile exists.

**THE FIX**: Create profiles synchronously during OAuth callback, not via triggers.

## THE PRODUCTION GUARANTEE

When these lies become truth, CropGenius will be 100% production ready for 100M farmers.