# 🚀 CROPGENIUS DEPLOYMENT GUIDE

## ⚡ Quick Commands

### Windows (PowerShell)
```powershell
# Check environment status
.\deploy.ps1 status

# Setup local development
.\deploy.ps1 local

# Deploy to staging
.\deploy.ps1 staging

# Deploy to production
.\deploy.ps1 production
```

### Linux/macOS (Bash)
```bash
# Check environment status
./deploy.sh status

# Setup local development
./deploy.sh local

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production
```

## 🎯 Environment Overview

| Environment | URL | Purpose | Payment | Debug |
|-------------|-----|---------|---------|-------|
| **Local** | `localhost:5173` | Development | Sandbox | ✅ |
| **Staging** | `cropgenius-staging.vercel.app` | Testing | Sandbox | ✅ |
| **Production** | `cropgenius.africa` | Live | Production | ❌ |

## 📂 Environment Files

```
.envs/
├── .env.local       # 🏠 Local development
├── .env.staging     # 🚧 Pre-production
├── .env.production  # 🌍 Live production
└── README.md        # 📚 Documentation
```

## 🔒 Security Features

### ✅ **Fail-Fast Validation**
```
❌ MISSING ENVIRONMENT VARIABLE: SUPABASE_URL

Expected one of:
- SUPABASE_URL
- VITE_SUPABASE_URL  
- NEXT_PUBLIC_SUPABASE_URL

Check your .envs/ directory configuration!
```

### ✅ **Format Validation**
- Supabase URLs: `https://*.supabase.co`
- API keys: JWT format `eyJ...`
- Callback URLs: Absolute URLs

### ✅ **Production Checks**
- Debug logging disabled
- Analytics enabled
- Security monitoring active

## 🚀 Standard Deployment Flow

### 1. Local Development
```powershell
.\deploy.ps1 local
npm run dev
```

### 2. Deploy to Staging
```powershell
.\deploy.ps1 staging
# Test: https://cropgenius-staging.vercel.app
```

### 3. Deploy to Production
```powershell
.\deploy.ps1 production
# Live: https://cropgenius.africa
```

## 🔧 Manual Override (Advanced)

### Vercel CLI Direct
```bash
# Local
cp .envs/.env.local .env.local && npm run dev

# Staging
vercel --env-file .envs/.env.staging

# Production
vercel --prod --env-file .envs/.env.production
```

## ⚠️ Troubleshooting

### Missing Environment Variables
```
Error: Missing required Supabase environment variables
```
**Solution**: Check `.envs/` files contain all required variables

### Invalid Supabase URL
```
Error: INVALID SUPABASE URL: http://localhost
Expected format: https://your-project.supabase.co  
```
**Solution**: Update URL format in environment file

### Debug Logging in Production
```
Error: Debug logging enabled in production!
```
**Solution**: Set `ENABLE_DEBUG_LOGGING=false` in `.env.production`

## 🎉 Success Indicators

### Local Setup
```
✅ local environment validated
✅ Environment configured for local development
Run: npm run dev
```

### Staging Deployment
```
✅ staging environment validated
✅ staging deployment completed
```

### Production Deployment  
```
✅ production environment validated
🔒 Running production security checks...
✅ production deployment completed
🎉 Production deployment completed!
Visit: https://cropgenius.africa
```

---

## 💯 **BULLETPROOF DEPLOYMENT**

**Every environment is:**
- ✅ **Deterministic** - Same config = Same result
- ✅ **Versioned** - All configs in git history
- ✅ **Validated** - Fail-fast on missing vars
- ✅ **Secure** - Production hardening enforced

**CropGenius is now ready to serve 100M farmers! 🌾**