# 🔒 CropGenius Environment Management

## 📋 Overview

This directory contains **deterministic environment configurations** for CropGenius across all deployment stages. Each environment file is **versioned, explicit, and deployment-ready**.

## 📂 Structure

```
.envs/
├── .env.local       # Local development
├── .env.staging     # Pre-production testing  
├── .env.production  # Live production
└── README.md        # This documentation
```

## 🎯 Environment Targets

### 🏠 Local Development (`.env.local`)
- **URL**: `http://localhost:5173`
- **Purpose**: Local development and testing
- **Features**: Debug logging enabled, analytics disabled
- **Payment**: Sandbox mode
- **Database**: Shared Supabase instance with dev data

### 🚧 Staging (`.env.staging`)  
- **URL**: `https://cropgenius-staging.vercel.app`
- **Purpose**: Pre-production testing and QA
- **Features**: Debug logging enabled, analytics enabled
- **Payment**: Sandbox mode
- **Database**: Shared Supabase instance with test data

### 🌍 Production (`.env.production`)
- **URL**: `https://cropgenius.africa`
- **Purpose**: Live production for 100M farmers
- **Features**: Debug logging disabled, full analytics
- **Payment**: Live PesaPal integration
- **Database**: Production Supabase instance

## 🚀 Deployment Commands

### Windows PowerShell
```powershell
# Setup local development
.\deploy.ps1 local

# Deploy to staging
.\deploy.ps1 staging

# Deploy to production  
.\deploy.ps1 production

# Check environment status
.\deploy.ps1 status
```

### Linux/macOS Bash
```bash
# Setup local development
./deploy.sh local

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production

# Check environment status
./deploy.sh status
```

## 🔧 Manual Deployment

### Vercel CLI
```bash
# Local development
cp .envs/.env.local .env.local && npm run dev

# Staging deployment
vercel --env-file .envs/.env.staging

# Production deployment  
vercel --prod --env-file .envs/.env.production
```

## 🔒 Security Features

### ✅ **Fail-Fast Validation**
The Supabase client validates all required environment variables on startup:
```typescript
// Throws descriptive error if missing:
// ❌ MISSING ENVIRONMENT VARIABLE: SUPABASE_URL
requireEnv('SUPABASE_URL')
```

### ✅ **Format Validation**
- Supabase URLs must match `https://*.supabase.co`
- API keys must be valid JWT format starting with `eyJ`
- Callback URLs must be absolute URLs

### ✅ **Environment Isolation**
- **Local**: Debug mode, development APIs
- **Staging**: Production APIs with test data
- **Production**: Live APIs with security hardening

## 🎛️ Environment Variables

### Core Authentication
```ini
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# App URLs (environment-specific)
APP_URL=https://cropgenius.africa
AUTH_CALLBACK_URL=https://cropgenius.africa/auth/callback
AUTH_RESET_URL=https://cropgenius.africa/auth/reset-password
```

### Framework Compatibility
```ini
# Vite Support (Legacy)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Next.js Support (Future)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🔄 Environment Sync

### From Development to Production
1. **Test locally**: `.\deploy.ps1 local`
2. **Deploy staging**: `.\deploy.ps1 staging`  
3. **Test staging**: Verify all flows work
4. **Deploy production**: `.\deploy.ps1 production`

### Configuration Changes
1. Update the relevant `.env.*` file
2. Commit changes to version control
3. Deploy