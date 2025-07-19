# Add Field System Deployment Guide

## Overview

This document outlines the steps to deploy the fixed Add Field system to production. The system has been completely overhauled to ensure it is fully functional, reliable, and user-friendly, especially in offline environments.

## Files to Deploy

Replace the following files with their fixed versions:

1. **Core Components**
   - `src/components/fields/wizard/AddFieldWizard.tsx` - Main wizard component
   - `src/components/fields/wizard/steps/FieldMapperStep.tsx` - Field mapping step
   - `src/components/fields/MapboxFieldMap.tsx` - Map component
   - `src/components/fields/AddFieldWizardButton.tsx` - Wizard button component
   - `src/features/fields/hooks/useCreateField.ts` - Field creation hook

2. **Documentation**
   - `AddFieldIntegrity.md` - Integrity verification document
   - `AddFieldDeployment.md` - This deployment guide

## Deployment Steps

1. **Backup Current Files**
   ```bash
   mkdir -p backup/src/components/fields/wizard/steps
   mkdir -p backup/src/features/fields/hooks
   
   cp src/components/fields/wizard/AddFieldWizard.tsx backup/src/components/fields/wizard/
   cp src/components/fields/wizard/steps/FieldMapperStep.tsx backup/src/components/fields/wizard/steps/
   cp src/components/fields/MapboxFieldMap.tsx backup/src/components/fields/
   cp src/components/fields/AddFieldWizardButton.tsx backup/src/components/fields/
   cp src/features/fields/hooks/useCreateField.ts backup/src/features/fields/hooks/
   ```

2. **Deploy Fixed Files**
   ```bash
   cp AddFieldWizard.tsx src/components/fields/wizard/
   cp FieldMapperStep.tsx src/components/fields/wizard/steps/
   cp MapboxFieldMap.tsx src/components/fields/
   cp AddFieldWizardButton.tsx src/components/fields/
   cp useCreateField.ts src/features/fields/hooks/
   ```

3. **Run Tests**
   ```bash
   npm run test
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   # Deploy to production server
   ```

## Testing Checklist

Before deploying to production, verify the following:

1. **Online Testing**
   - [ ] Field creation with valid data
   - [ ] Field creation with invalid data
   - [ ] Map integration
   - [ ] Boundary drawing
   - [ ] Location search

2. **Offline Testing**
   - [ ] Field creation while offline
   - [ ] Map functionality with cached data
   - [ ] Sync when back online

3. **Error Handling Testing**
   - [ ] Missing Mapbox token
   - [ ] Network failures
   - [ ] API failures

## Rollback Plan

If issues are encountered after deployment, follow these steps to rollback:

1. **Restore Backup Files**
   ```bash
   cp backup/src/components/fields/wizard/AddFieldWizard.tsx src/components/fields/wizard/
   cp backup/src/components/fields/wizard/steps/FieldMapperStep.tsx src/components/fields/wizard/steps/
   cp backup/src/components/fields/MapboxFieldMap.tsx src/components/fields/
   cp backup/src/components/fields/AddFieldWizardButton.tsx src/components/fields/
   cp backup/src/features/fields/hooks/useCreateField.ts src/features/fields/hooks/
   ```

2. **Rebuild and Redeploy**
   ```bash
   npm run build
   # Deploy to production server
   ```

## Monitoring

After deployment, monitor the following:

1. **Error Logs**
   - Check for any errors in the console logs
   - Monitor Supabase error logs

2. **User Feedback**
   - Collect feedback from users
   - Address any issues reported

3. **Performance Metrics**
   - Monitor field creation success rate
   - Track offline sync success rate

## Conclusion

The Add Field system has been completely overhauled to ensure it is fully functional, reliable, and user-friendly. By following this deployment guide, you can ensure a smooth transition to the new system.