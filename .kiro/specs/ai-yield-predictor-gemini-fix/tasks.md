# Implementation Plan

## Core Strategy: Copy-Paste Success Pattern from CropScanner

The CropScanner works perfectly with Gemini 2.5 Flash. We'll clone that exact pattern for yield prediction.

- [x] 1. Create YieldPredictorOracle service (copy CropDiseaseOracle pattern)



  - Copy the exact Gemini API integration from CropDiseaseOracle.ts
  - Replace disease detection prompt with yield prediction prompt
  - Keep same error handling, caching, and response parsing patterns
  - _Requirements: 1.1, 2.1, 2.2_



- [ ] 2. Nuke all mock functions from YieldPredictor.tsx
  - Delete calculateEstimatedYield, calculateEstimatedRevenue, generateRisks functions
  - Remove setTimeout simulation code




  - Remove all hardcoded mock data arrays (farmYieldData, marketPriceData, etc.)
  - _Requirements: 1.1, 1.2_




- [-] 3. Wire YieldPredictor.tsx to use real Gemini API



  - Replace onSubmit mock logic with YieldPredictorOracle.generatePrediction() call
  - Add proper loading states during API calls
  - Add error handling with user-friendly messages
  - _Requirements: 1.1, 1.3, 2.1_



- [ ] 4. Enhance form data collection for better AI context
  - Add location data gathering (GPS coordinates)
  - Include weather data from existing weather services
  - Integrate with field data from Supabase if available
  - _Requirements: 3.1, 3.2, 4.1_

- [ ] 5. Create comprehensive Gemini prompt for yield prediction
  - Include farm location, crop type, soil data, weather conditions
  - Request structured JSON response with yield, confidence, recommendations
  - Add economic analysis and market timing advice
  - _Requirements: 1.4, 3.3, 5.1_

- [x] 6. Update YieldPredictionPanel.tsx to use enhanced data



  - Remove dependency on mock weather data
  - Integrate with real field data from Supabase
  - Add better error states and loading indicators
  - _Requirements: 2.3, 4.2_

- [ ] 7. Add caching layer for yield predictions
  - Implement same caching pattern as CropDiseaseOracle
  - Cache predictions by field ID, crop type, and date
  - Add cache invalidation for stale predictions
  - _Requirements: 2.3, 6.3_

- [ ] 8. Implement proper error boundaries and fallbacks
  - Add error boundary component around yield prediction features
  - Provide graceful degradation when Gemini API fails
  - Add retry mechanisms for transient failures
  - _Requirements: 1.3, 6.4_

- [ ] 9. Test real API integration end-to-end
  - Test form submission with various crop types and farm sizes
  - Verify Gemini API responses are properly parsed
  - Test error scenarios (API failures, invalid responses)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10. Clean up and optimize UI components
  - Remove unused mock data visualization components
  - Streamline results display to show real AI insights
  - Add proper TypeScript types for all new interfaces
  - _Requirements: 6.1, 6.2_