# Design Document

## Overview

The AI Yield Predictor feature needs to be completely redesigned to use real Gemini 2.5 Flash API calls instead of mock data. The current implementation in `src/pages/YieldPredictor.tsx` uses hardcoded calculations and dummy responses, while the working `YieldPredictorAgent.ts` already has the proper Gemini integration but isn't being used correctly by the UI components.

## Architecture

### Current Problem Architecture
```
YieldPredictor.tsx (Form) 
    ↓ (onSubmit with mock calculations)
Mock Data Generation (setTimeout simulation)
    ↓
Fake Results Display
```

### New Architecture
```
YieldPredictor.tsx (Form)
    ↓ (onSubmit with real data)
YieldPredictorOracle.ts (New Service)
    ↓ (Gemini 2.5 Flash API)
Real AI Analysis
    ↓
Structured Results Display
```

## Components and Interfaces

### 1. YieldPredictorOracle Service (New)

Following the same pattern as `CropDiseaseOracle.ts`, create a new service that handles yield prediction with Gemini 2.5 Flash:

```typescript
export class YieldPredictorOracle {
  async generateYieldPrediction(
    farmData: YieldPredictionInput,
    location: GeoLocation
  ): Promise<YieldPredictionResult>
}
```

**Key Features:**
- Direct Gemini 2.5 Flash API integration
- Structured prompt engineering for yield prediction
- Economic impact calculations for African farmers
- Local supplier recommendations
- Caching mechanism similar to disease detection

### 2. Updated YieldPredictor.tsx Component

Transform the current mock-based component to use real AI:

**Changes Required:**
- Remove all mock calculation functions (`calculateEstimatedYield`, `calculateEstimatedRevenue`, etc.)
- Replace `setTimeout` simulation with actual API calls
- Integrate with `YieldPredictorOracle` service
- Add proper error handling and loading states
- Include location data gathering for context-aware predictions

### 3. Enhanced YieldPredictionPanel.tsx

The existing panel component already uses the `YieldPredictorAgent` but needs improvements:

**Enhancements:**
- Better integration with field data
- More comprehensive weather data inclusion
- Soil health data integration
- Historical yield data incorporation

## Data Models

### YieldPredictionInput (Enhanced)
```typescript
interface YieldPredictionInput {
  // Basic farm data
  fieldId: string;
  cropType: string;
  farmSize: number; // in acres/hectares
  plantingDate: Date;
  
  // Location context
  location: GeoLocation;
  
  // Environmental data
  soilData?: SoilHealthData;
  weatherData: WeatherData;
  
  // Management practices
  managementPractices: FarmManagementData;
  
  // Historical context
  historicalYield?: number;
  previousSeasonData?: PreviousSeasonData;
}
```

### YieldPredictionResult (Enhanced)
```typescript
interface YieldPredictionResult {
  // Core predictions
  predictedYieldKgPerHa: number;
  confidenceScore: number;
  harvestDateEstimate: string;
  
  // Analysis factors
  keyFactors: {
    weatherImpact: ImpactAssessment;
    soilImpact: ImpactAssessment;
    healthImpact: ImpactAssessment;
    managementImpact: ImpactAssessment;
  };
  
  // Economic projections
  economicImpact: {
    estimatedRevenue: number;
    profitMargin: number;
    marketTiming: MarketTimingAdvice;
  };
  
  // Actionable insights
  recommendations: ActionableRecommendation[];
  riskFactors: RiskAssessment[];
  optimizationOpportunities: OptimizationSuggestion[];
  
  // Metadata
  source_api: 'gemini-2.5-flash';
  timestamp: string;
  processing_time_ms: number;
}
```

## Gemini Integration Strategy

### Prompt Engineering

Create comprehensive prompts that include:

1. **Farm Context**: Location, crop type, farm size, planting date
2. **Environmental Data**: Weather patterns, soil conditions, seasonal factors
3. **Management Practices**: Irrigation, fertilization, pest control methods
4. **Historical Context**: Previous yields, regional averages, market trends
5. **Economic Factors**: Local market prices, input costs, profit optimization

### Example Prompt Structure
```
You are an expert agricultural analyst specializing in East African farming systems.

Analyze the following farm data and provide comprehensive yield predictions:

FARM DETAILS:
- Location: [GPS coordinates]
- Crop: [crop type]
- Farm Size: [size in hectares]
- Planting Date: [date]
- Soil Type: [soil characteristics]

ENVIRONMENTAL CONDITIONS:
- Current Weather: [weather data]
- Seasonal Forecast: [forecast data]
- Historical Climate: [climate patterns]

MANAGEMENT PRACTICES:
- Irrigation: [irrigation status]
- Fertilization: [fertilizer program]
- Pest Control: [pest management]

Provide analysis in JSON format with:
- Yield prediction (kg/ha)
- Confidence level (0-100)
- Key influencing factors
- Economic projections
- Actionable recommendations
- Risk assessments
- Optimization opportunities
```

## Error Handling

### API Failure Scenarios
1. **Gemini API Unavailable**: Fallback to cached predictions or basic calculations
2. **Invalid Input Data**: Validate all inputs before API calls
3. **Parsing Errors**: Robust JSON parsing with fallback responses
4. **Rate Limiting**: Implement exponential backoff and caching

### User Experience
- Clear loading states during API calls
- Informative error messages
- Graceful degradation when APIs fail
- Retry mechanisms for transient failures

## Testing Strategy

### Unit Tests
- YieldPredictorOracle service methods
- Input validation functions
- Response parsing logic
- Error handling scenarios

### Integration Tests
- End-to-end form submission to results display
- API integration with mock Gemini responses
- Error boundary behavior
- Caching mechanism validation

### User Acceptance Tests
- Real farmer data input scenarios
- Prediction accuracy validation
- Performance benchmarks
- Mobile responsiveness

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache predictions for similar farm profiles
2. **Debouncing**: Prevent multiple API calls during form changes
3. **Progressive Loading**: Show partial results while processing
4. **Background Updates**: Refresh predictions with new weather data

### Monitoring
- API response times
- Prediction accuracy metrics
- User engagement analytics
- Error rates and types

## Security Considerations

### Data Protection
- Sanitize all user inputs before API calls
- Encrypt sensitive farm data
- Implement rate limiting per user
- Audit trail for prediction requests

### API Security
- Secure Gemini API key management
- Request validation and sanitization
- Response content filtering
- CORS and CSP headers

## Migration Strategy

### Phase 1: Service Layer
1. Create `YieldPredictorOracle.ts` service
2. Implement Gemini integration
3. Add comprehensive testing
4. Deploy and validate API integration

### Phase 2: UI Integration
1. Update `YieldPredictor.tsx` to use real API
2. Remove all mock calculation functions
3. Enhance error handling and loading states
4. Update `YieldPredictionPanel.tsx` integration

### Phase 3: Enhancement
1. Add advanced features (optimization suggestions)
2. Implement caching and performance optimizations
3. Add analytics and monitoring
4. User feedback collection and iteration

## Success Metrics

### Technical Metrics
- API response time < 3 seconds
- Prediction accuracy > 85%
- Error rate < 5%
- Cache hit rate > 70%

### User Experience Metrics
- Form completion rate > 90%
- User satisfaction score > 4.5/5
- Feature usage retention > 80%
- Support ticket reduction > 50%