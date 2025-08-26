# CROPGENIUS DEPLOYMENT - WINDOWS POWERSHELL
# Environment-driven deployment for deterministic builds

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('local', 'staging', 'production', 'status')]
    [string]$Environment
)

# Function to write colored text
function Write-ColoredText {
    param(
        [string]$Text,
        [string]$Color = 'White'
    )
    Write-Host $Text -ForegroundColor $Color
}

Write-ColoredText 'CropGenius Deployment System' 'Cyan'
Write-ColoredText '=====================================' 'Cyan'

# Function to validate environment files
function Test-EnvironmentFile {
    param(
        [string]$EnvFile,
        [string]$EnvName
    )
    
    Write-ColoredText "Validating $EnvName environment file..." 'Yellow'
    
    if (-not (Test-Path $EnvFile)) {
        Write-ColoredText "ERROR: $EnvFile not found!" 'Red'
        exit 1
    }
    
    # Check for required Supabase variables
    $requiredVars = @('SUPABASE_URL', 'SUPABASE_ANON_KEY', 'APP_URL', 'AUTH_CALLBACK_URL')
    $content = Get-Content $EnvFile
    
    foreach ($var in $requiredVars) {
        $found = $false
        foreach ($prefix in @('', 'VITE_', 'NEXT_PUBLIC_')) {
            if ($content | Select-String -Pattern "^$prefix$var=") {
                $found = $true
                break
            }
        }
        
        if (-not $found) {
            Write-ColoredText "ERROR: Missing required variable: $var" 'Red'
            exit 1
        }
    }
    
    Write-ColoredText "SUCCESS: $EnvName environment validated" 'Green'
}

# Function to deploy to Vercel
function Deploy-ToVercel {
    param(
        [string]$EnvFile,
        [string]$EnvName,
        [string]$VercelFlags = ''
    )
    
    Write-ColoredText "Deploying to Vercel ($EnvName)..." 'Cyan'
    
    # Copy environment file to root for Vercel to pick up
    Copy-Item $EnvFile '.env.local' -Force
    
    # Deploy with Vercel
    try {
        if ($EnvName -eq 'production') {
            & vercel --prod
        } else {
            & vercel
        }
    } catch {
        Write-ColoredText "ERROR: Vercel deployment failed: $_" 'Red'
        exit 1
    }
    
    # Clean up
    if (Test-Path '.env.local') {
        Remove-Item '.env.local' -Force
    }
    
    Write-ColoredText "SUCCESS: $EnvName deployment completed" 'Green'
}

# Function to setup local development
function Set-LocalDevelopment {
    Write-ColoredText 'Setting up local development...' 'Cyan'
    
    Test-EnvironmentFile '.envs\.env.local' 'local'
    
    # Copy local env file
    Copy-Item '.envs\.env.local' '.env.local' -Force
    
    Write-ColoredText 'SUCCESS: Environment configured for local development' 'Green'
    Write-ColoredText 'Run: npm run dev' 'Yellow'
}

# Function to deploy staging
function Deploy-Staging {
    Write-ColoredText 'Deploying to staging...' 'Cyan'
    
    Test-EnvironmentFile '.envs\.env.staging' 'staging'
    Deploy-ToVercel '.envs\.env.staging' 'staging'
}

# Function to deploy production
function Deploy-Production {
    Write-ColoredText 'Deploying to production...' 'Cyan'
    
    Test-EnvironmentFile '.envs\.env.production' 'production'
    
    # Extra validation for production
    Write-ColoredText 'Running production security checks...' 'Yellow'
    
    $prodContent = Get-Content '.envs\.env.production'
    if ($prodContent | Select-String -Pattern 'ENABLE_DEBUG_LOGGING=true') {
        Write-ColoredText 'ERROR: Debug logging enabled in production!' 'Red'
        exit 1
    }
    
    Deploy-ToVercel '.envs\.env.production' 'production'
    
    Write-ColoredText 'SUCCESS: Production deployment completed!' 'Green'
    Write-ColoredText 'Visit: https://cropgenius.africa' 'Green'
}

# Function to show environment status
function Show-EnvironmentStatus {
    Write-ColoredText 'Environment Status' 'Cyan'
    Write-ColoredText '===================' 'Cyan'
    
    $environments = @('local', 'staging', 'production')
    
    foreach ($env in $environments) {
        $envFile = ".envs\.env.$env"
        if (Test-Path $envFile) {
            Write-ColoredText "SUCCESS: $env`: $envFile" 'Green'
            
            # Show key variables
            $content = Get-Content $envFile
            $appUrl = ($content | Select-String -Pattern '^(VITE_)?APP_URL=' | ForEach-Object { $_.Line.Split('=')[1].Trim('"') })
            $nodeEnv = ($content | Select-String -Pattern '^(VITE_)?NODE_ENV=' | ForEach-Object { $_.Line.Split('=')[1].Trim('"') })
            
            Write-ColoredText "   App URL: $appUrl" 'Yellow'
            Write-ColoredText "   Environment: $nodeEnv" 'Yellow'
        } else {
            Write-ColoredText "ERROR: $env`: $envFile (missing)" 'Red'
        }
    }
}

# Main script logic
switch ($Environment) {
    'local' {
        Set-LocalDevelopment
    }
    'staging' {
        Deploy-Staging
    }
    'production' {
        Deploy-Production
    }
    'status' {
        Show-EnvironmentStatus
    }
}

Write-ColoredText 'Operation completed successfully!' 'Green'