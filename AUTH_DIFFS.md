# Authentication System Minimal Fixes

## Fix #1: Remove Redundant Auth Services

### DELETE: src/utils/authUtils.ts
**Reason**: Duplicates functionality already in useAuth.ts  
**Risk**: Competing auth state management  
**Dependencies**: Check for imports before deletion

### DELETE: src/services/EnhancedAuthService.ts  
**Reason**: Singleton pattern, unused, complex  
**Risk**: Dead code causing confusion  
**Dependencies**: No imports found

### DELETE: src/services/AuthenticationService.ts
**Reason**: Simple wrapper, redundant  
**Risk**: Minimal  
**Dependencies**: No imports found

### DELETE: src/lib/simpleAuth.ts
**Reason**: Wrong callback URL, unused  
**Risk**: Wrong redirect path `/oauth/callback`  
**Dependencies**: No imports found

## Fix #2: Supabase Client Configuration

### File: src/integrations/supabase/client.ts

**BEFORE**:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bapqlyvfwxsichlyjxpd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**AFTER**:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}
```

**Reason**: Remove hardcoded credentials, fail fast if env vars missing  
**Risk**: Low - Better security posture

## Fix #3: Add Missing Password Reset Route

### File: src/AppRoutes.tsx

**ADD** after line 56:
```typescript
<Route path="/auth/reset-password" element={<PasswordResetPage />} />
```

### File: src/pages/PasswordResetPage.tsx (NEW)
```typescript
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      toast.error('Password update failed');
    } else {
      toast.success('Password updated successfully');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Update Password
        </button>
      </form>
    </div>
  );
}
```

**Reason**: Required for password reset flow completion  
**Doc Reference**: [Supabase Password Reset](https://supabase.com/docs/guides/auth/auth-password-reset)

## Fix #4: OAuth Callback Optimization

### File: src/pages/OAuthCallback.tsx

**REPLACE** lines 35-50:
```typescript
// BEFORE: Complex timeout and subscription handling
// AFTER: Simplified PKCE-compliant approach
useEffect(() => {
  const handleCallback = async () => {
    try {
      // Let Supabase handle PKCE code exchange automatically
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed');
        navigate('/auth', { replace: true });
        return;
      }

      if (session?.user) {
        toast.success('Welcome to CropGenius! 🌾');
        navigate('/dashboard', { replace: true });
      } else {
        // Wait for auth state change
        setTimeout(() => navigate('/auth', { replace: true }), 3000);
      }
    } catch (error) {
      console.error('OAuth callback exception:', error);
      navigate('/auth', { replace: true });
    }
  };

  handleCallback();
}, [navigate]);
```

**Reason**: Simplify callback handling, reduce race conditions  
**Risk**: Low - More reliable auth flow

## Validation Script

```bash
#!/bin/bash
# validate_auth_fixes.sh

echo "🔍 Validating auth system fixes..."

# Check for deleted files
FILES_TO_DELETE=(
  "src/utils/authUtils.ts"
  "src/services/EnhancedAuthService.ts" 
  "src/services/AuthenticationService.ts"
  "src/lib/simpleAuth.ts"
)

for file in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$file" ]; then
    echo "❌ File still exists: $file"
  else
    echo "✅ File deleted: $file"
  fi
done

# Check for hardcoded credentials
if grep -q "https://bapqlyvfwxsichlyjxpd.supabase.co" src/integrations/supabase/client.ts; then
  echo "❌ Hardcoded URL still present"
else
  echo "✅ Hardcoded credentials removed"
fi

# Check for password reset route
if grep -q "/auth/reset-password" src/AppRoutes.tsx; then
  echo "✅ Password reset route added"
else
  echo "❌ Password reset route missing"
fi

echo "🔍 Validation complete"
```

## Testing Checklist

After applying fixes:

- [ ] Email signup → email verification → login
- [ ] Google OAuth → callback → dashboard access  
- [ ] Password reset → email → new password → login
- [ ] Session persistence across page refresh
- [ ] No infinite redirect loops
- [ ] No console errors during auth flows
- [ ] Auth state consistent across tabs