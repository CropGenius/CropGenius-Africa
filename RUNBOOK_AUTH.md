# AUTHENTICATION RUNBOOK

## Emergency Procedures

### 1. Rotate SMTP Credentials
1. Access Supabase Dashboard → Authentication → Email Templates
2. Navigate to SMTP Settings
3. Update provider credentials
4. Test with verification email
5. Update environment variables if needed

**Doc Reference**: [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

### 2. Change Redirect URLs
1. Access Supabase Dashboard → Authentication → URL Configuration
2. Update "Additional Redirect URLs" list
3. Add new production domain: `https://cropgenius.africa/auth/callback`
4. Remove old/invalid URLs
5. Verify Google OAuth redirect URIs match

**Doc Reference**: [Redirect URLs Guide](https://supabase.com/docs/guides/auth/redirect-urls)

### 3. Add OAuth Provider
1. Supabase Dashboard → Authentication → Providers
2. Enable new provider (e.g., Facebook, GitHub)
3. Configure client ID and secret
4. Add authorized domains
5. Update frontend code with new provider
6. Test OAuth flow end-to-end

**Doc Reference**: [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)

### 4. Debug Infinite Redirect Loop
1. Check browser DevTools → Network tab
2. Verify `/auth/callback` returns 200 (not 404)
3. Check for multiple `onAuthStateChange` listeners
4. Validate redirect URL allow-list matches exactly
5. Clear localStorage/sessionStorage auth data
6. Test with incognito/private browsing

### 5. Fix Session Persistence Issues
1. Verify `persistSession: true` in Supabase client config
2. Check for `localStorage` conflicts with multiple auth services
3. Validate `autoRefreshToken: true` is enabled
4. Test token refresh before expiry (default 1 hour)
5. Monitor for session race conditions

## Configuration Management

### Environment Variables
```bash
# Required
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# Optional (production)
VITE_SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### Supabase Dashboard Settings
- **Site URL**: `https://cropgenius.africa`
- **Additional Redirect URLs**:
  - `https://cropgenius.africa/auth/callback`
  - `https://localhost:3000/auth/callback`
  - `https://localhost:5173/auth/callback`

### Google OAuth Console
- **Authorized JavaScript origins**:
  - `https://cropgenius.africa`
  - `https://localhost:3000`
  - `https://localhost:5173`
- **Authorized redirect URIs**:
  - `https://[project-ref].supabase.co/auth/v1/callback`

## Monitoring & Alerts

### Key Metrics to Monitor
1. Auth success rate (target: >98%)
2. OAuth callback response time (target: <2s)
3. Session token refresh failures
4. Email delivery rates
5. Failed login attempts (security)

### Log Files to Check
- Supabase Auth logs (Dashboard → Logs → Auth)
- Browser console errors during auth flows
- Network errors on `/auth/callback` route
- SMTP delivery failures

## Recovery Procedures

### Complete Auth System Reset
1. Clear all browser storage: `localStorage.clear()`, `sessionStorage.clear()`
2. Delete auth cookies
3. Force page refresh
4. Test basic email/password login
5. Test Google OAuth flow
6. Verify session persistence after refresh

### Emergency Fallback Auth
If main auth system fails:
1. Use Supabase Dashboard → Authentication → Users
2. Create temporary user accounts manually
3. Send password reset emails directly
4. Bypass frontend auth temporarily with direct Supabase calls