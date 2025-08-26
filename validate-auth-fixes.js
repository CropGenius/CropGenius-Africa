console.log('🔍 Validating CropGenius Auth Fixes...\n');

import fs from 'fs';
import path from 'path';

// Files that should be deleted
const FILES_TO_DELETE = [
  'src/utils/authUtils.ts',
  'src/services/EnhancedAuthService.ts', 
  'src/services/AuthenticationService.ts',
  'src/lib/simpleAuth.ts'
];

// Required files that should exist
const REQUIRED_FILES = [
  'src/hooks/useAuth.ts',
  'src/providers/AuthProvider.tsx',
  'src/pages/AuthResurrected.tsx',
  'src/pages/OAuthCallback.tsx',
  'src/pages/PasswordResetPage.tsx',
  'src/integrations/supabase/client.ts',
  'src/AppRoutes.tsx'
];

let validationErrors = 0;

console.log('1. Checking deleted files...');
FILES_TO_DELETE.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ File still exists: ${file}`);
    validationErrors++;
  } else {
    console.log(`✅ File deleted: ${file}`);
  }
});

console.log('\n2. Checking required files...');
REQUIRED_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ File exists: ${file}`);
  } else {
    console.log(`❌ Missing file: ${file}`);
    validationErrors++;
  }
});

console.log('\n3. Checking hardcoded credentials removal...');
const clientFile = 'src/integrations/supabase/client.ts';
if (fs.existsSync(clientFile)) {
  const content = fs.readFileSync(clientFile, 'utf8');
  if (content.includes('https://bapqlyvfwxsichlyjxpd.supabase.co')) {
    console.log('❌ Hardcoded URL still present');
    validationErrors++;
  } else {
    console.log('✅ Hardcoded credentials removed');
  }
}

console.log('\n4. Checking password reset route...');
const routesFile = 'src/AppRoutes.tsx';
if (fs.existsSync(routesFile)) {
  const content = fs.readFileSync(routesFile, 'utf8');
  if (content.includes('/auth/reset-password')) {
    console.log('✅ Password reset route added');
  } else {
    console.log('❌ Password reset route missing');
    validationErrors++;
  }
}

console.log('\n5. Checking for import cleanup...');
const filesToCheck = [
  'src/pages/AuthResurrected.tsx',
  'src/hooks/useAuth.ts',
  'src/providers/AuthProvider.tsx'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasDeletedImports = FILES_TO_DELETE.some(deletedFile => {
      const importPath = deletedFile.replace('src/', '@/').replace('.ts', '');
      return content.includes(importPath);
    });
    
    if (hasDeletedImports) {
      console.log(`❌ ${file} still imports deleted files`);
      validationErrors++;
    } else {
      console.log(`✅ ${file} imports cleaned`);
    }
  }
});

console.log('\n🔍 Validation Summary:');
if (validationErrors === 0) {
  console.log('✅ ALL VALIDATIONS PASSED');
  console.log('\nNext steps:');
  console.log('1. Run Playwright tests: npx playwright test AUTH_TESTS/');
  console.log('2. Check Supabase dashboard redirect URLs');
  console.log('3. Configure custom SMTP provider');
} else {
  console.log(`❌ ${validationErrors} validation errors found`);
  console.log('Please fix these issues before proceeding.');
  process.exit(1);
}