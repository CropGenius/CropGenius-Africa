# 🚀 CropGenius Production Deployment Guide

## CRITICAL: Complete This Before Going Live

This guide ensures CropGenius authentication works flawlessly in production for generations to come.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Database Migration (CRITICAL - DO FIRST)

**Run the definitive migration in Supabase SQL Editor:**

```sql
-- Execute the migration file:
-- supabase/migrations/20250829000000_DEFINITIVE_AUTH_FIX.sql

-- Verify success by checking:
SELECT COUNT(*) as trigger_count FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- Should return exactly 1 trigger (the master trigger)
```

**Expected Result:** Only 1 trigger on auth.users table (not 153+!)

### 2. Google OAuth Configuration (CRITICAL)

**Current Problem:** OAuth only works on localhost

**Fix Required:** Update Google Cloud Console settings

#### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `CropGenius` 
3. Navigate to: **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID: `1066938349867-3vif0puf4f4qvr898drn9jnb0j0b9658...`

#### Update Authorized JavaScript Origins:
```
http://localhost:8080
https://yourapp.vercel.app
https://yourapp.netlify.app  
https://yourdomain.com
https://www.yourdomain.com
```

#### Update Authorized Redirect URIs:
```
http://localhost:8080/auth/callback
https://yourapp.vercel.app/auth/callback
https://yourapp.netlify.app/auth/callback
https://yourdomain.com/auth/callback
https://www.yourdomain.com/auth/callback
```

#### Set OAuth Consent Screen to **External** (not Internal)

### 3. Environment Variables Configuration

#### Production Environment Variables:
Create `.env.production` or configure in your deployment platform:

```bash
# Core Supabase (KEEP THESE)
VITE_SUPABASE_URL=https://bapqlyvfwxsichlyjxpd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (KEEP THESE)
VITE_GOOGLE_CLIENT_ID=1066938349867-3vif0puf4f4qvr898drn9jnb0j0b9658...

# CRITICAL: Update these for production
VITE_SITE_URL=https://yourdomain.com
VITE_AUTH_REDIRECT_URL=https://yourdomain.com/auth/callback
VITE_AUTH_RESET_URL=https://yourdomain.com/auth/reset-password

# Other APIs (configure as needed)
VITE_MAPBOX_ACCESS_TOKEN=your_production_mapbox_token
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENWEATHER_API_KEY=your_weather_key
VITE_WHATSAPP_ACCESS_TOKEN=your_whatsapp_token

# Environment
VITE_ENVIRONMENT=production
```

### 4. Supabase Auth Configuration

In Supabase Dashboard → Authentication → Settings:

#### Site URL:
```
https://yourdomain.com
```

#### Redirect URLs (add all production URLs):
```
https://yourdomain.com/**
https://www.yourdomain.com/**
https://yourapp.vercel.app/**
https://yourapp.netlify.app/**
```

#### Email Templates:
Update all email templates to use production URLs instead of localhost.

### 5. Test Authentication Flow

**Before going live, test these flows:**

1. **Email/Password Signup:**
   - [ ] New user can sign up
   - [ ] Profile is created automatically  
   - [ ] User gets redirected to onboarding
   - [ ] Email confirmation works (if enabled)
   - [ ] Resend confirmation email works

2. **Google OAuth:**
   - [ ] Google sign-in redirects properly
   - [ ] User returns from Google to correct callback
   - [ ] Profile is created automatically
   - [ ] User gets redirected to onboarding (new users)
   - [ ] User gets redirected to dashboard (returning users)

3. **Password Reset:**
   - [ ] "Forgot password" link works
   - [ ] Password reset email is sent
   - [ ] Reset link redirects to correct URL
   - [ ] Password can be updated successfully

4. **Session Persistence:**
   - [ ] User stays logged in after browser refresh
   - [ ] User stays logged in after closing/reopening browser
   - [ ] Session expires properly after 1 hour without activity

---

## 🔧 DEPLOYMENT PLATFORM SPECIFIC GUIDES

### Vercel Deployment

1. **Environment Variables:** Add all production env vars in Vercel Dashboard
2. **Build Command:** `npm run build`  
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`

### Netlify Deployment

1. **Environment Variables:** Add all production env vars in Netlify Dashboard
2. **Build Command:** `npm run build`
3. **Publish Directory:** `dist`
4. **Build Environment:** Node.js 18+

### Custom Domain Deployment

1. **Update OAuth:** Add your custom domain to Google OAuth settings
2. **Update Supabase:** Add your custom domain to Supabase Auth settings  
3. **Update Environment:** Set `VITE_SITE_URL` to your custom domain
4. **SSL Certificate:** Ensure HTTPS is enabled

---

## 🚨 TROUBLESHOOTING GUIDE

### Issue: Users Can't Sign Up
**Check:**
- [ ] Database migration ran successfully (only 1 trigger on auth.users)
- [ ] Supabase URL and anon key are correct
- [ ] Site URL is set correctly in Supabase

### Issue: OAuth Fails
**Check:**
- [ ] Google OAuth redirect URIs include your production domain
- [ ] JavaScript origins include your production domain  
- [ ] OAuth consent screen is set to "External"
- [ ] `VITE_GOOGLE_CLIENT_ID` is correct

### Issue: Password Reset Doesn't Work
**Check:**
- [ ] Email templates use production URLs (not localhost)
- [ ] `VITE_AUTH_RESET_URL` points to your production domain
- [ ] SMTP is configured in Supabase

### Issue: Sessions Don't Persist
**Check:**
- [ ] `detectSessionInUrl: true` in Supabase client config
- [ ] Cookies are allowed in browser
- [ ] HTTPS is enabled in production

---

## 📊 MONITORING & ANALYTICS

### Key Metrics to Track:
- **Authentication Success Rate:** Should be >95%
- **Time to Complete Auth:** Should be <5 seconds  
- **Onboarding Completion Rate:** Track how many users complete setup
- **Password Reset Usage:** Monitor forgot password flows

### Supabase Dashboard Monitoring:
- Monitor auth events in Supabase Dashboard
- Check for error patterns in logs
- Monitor database performance during auth flows

---

## 🔒 SECURITY CONSIDERATIONS

### Production Security Checklist:
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] JWT tokens expire properly (1 hour default)
- [ ] Refresh tokens work correctly  
- [ ] Rate limiting is enabled on auth endpoints
- [ ] HTTPS is enforced
- [ ] Secure cookies are used
- [ ] CORS is properly configured

### Row Level Security (RLS):
- All tables have proper RLS policies
- Users can only access their own data
- Admin functions are properly secured

---

## 📝 POST-DEPLOYMENT VERIFICATION

After deployment, verify these work:

### New User Journey:
1. Visit your production app
2. Click "Sign Up" 
3. Enter email/password → Should create account
4. Check email → Should receive confirmation (if enabled)  
5. Complete onboarding → Should redirect to dashboard
6. Sign out and sign back in → Should work seamlessly

### Google OAuth Journey:
1. Click "Continue with Google"
2. Complete Google auth → Should redirect back to your app
3. Should create profile automatically
4. Should redirect to onboarding (new) or dashboard (existing)

### Password Recovery Journey:
1. Click "Forgot password?"
2. Enter email → Should receive reset email
3. Click reset link → Should redirect to your app
4. Update password → Should work and redirect to sign in

---

## 🎉 SUCCESS CRITERIA

**Your authentication system is production-ready when:**

✅ **100% Success Rate:** New users can always sign up  
✅ **Zero Infinite Loops:** No users get stuck in redirect loops  
✅ **Fast Performance:** Auth completes in <5 seconds  
✅ **Cross-Browser:** Works on Chrome, Safari, Firefox, mobile  
✅ **Recovery Flows:** Password reset and email resend work  
✅ **Session Persistence:** Users stay logged in appropriately  
✅ **Clean Database:** Only 1 trigger on auth.users table  
✅ **Production OAuth:** Works with your live domain  

---

## 🆘 EMERGENCY SUPPORT

If authentication breaks in production:

### Immediate Actions:
1. Check Supabase Dashboard for error logs
2. Verify environment variables are set correctly
3. Confirm database migration completed successfully
4. Test auth flows in incognito mode

### Rollback Plan:
1. Revert to previous deployment
2. Check for any new migrations that might have caused issues
3. Re-run the definitive auth fix migration if needed

### Contact Support:
- **Supabase:** Check their status page and documentation
- **Google OAuth:** Verify OAuth console settings haven't changed  
- **Domain/DNS:** Confirm your domain is resolving correctly

---

**🌾 With this guide, CropGenius authentication will work flawlessly for generations of farmers! 🚀**