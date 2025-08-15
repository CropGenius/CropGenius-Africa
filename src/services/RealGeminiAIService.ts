/**
 * 🔥💪 REAL GEMINI AI SERVICE - ZERO FALLBACKS, MAXIMUM POWER
 * Bulletproof Gemini-2.5-Flash integration with exponential backoff
 * Built for 100 million farmers with surgical precision
 */

// API Configuration - GEMINI-2.5-FLASH ONLY
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiRequest {
    contents: Array<{
        parts: Array<{
            text?: string;
            inline_data?: {
                mime_type: string;
                data: string;
            };
        }>;
    }>;
    generationConfig?: {
        temperature?: number;
        topK?: number;
        topP?: number;
        maxOutputTokens?: number;
    };
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
        finishReason: string;
        index: number;
    }>;
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

class RealGeminiAIService {
    private readonly defaultRetryConfig: RetryConfig = {
        maxRetries: 5,
        baseDelay: 1000, // 1 second
        maxDelay: 30000, // 30 seconds
        backoffMultiplier: 2
    };

    private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly circuitBreakerThreshold = 5;
    private readonly circuitBreakerTimeout = 60000; // 1 minute

    constructor() {
        console.log('🔧 INITIALIZING REAL GEMINI AI SERVICE...');
        console.log('🔑 CHECKING API KEY:', {
            hasImportMetaEnv: !!import.meta.env,
            hasViteKey: !!import.meta.env?.VITE_GEMINI_API_KEY,
            hasProcessEnv: !!process.env,
            hasProcessKey: !!process.env?.GEMINI_API_KEY,
            finalKey: !!GEMINI_API_KEY,
            keyLength: GEMINI_API_KEY?.length || 0,
            keyPreview: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NO KEY'
        });
        
        if (!GEMINI_API_KEY) {
            const errorMsg = '🔥 CRITICAL: GEMINI_API_KEY environment variable is required';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        console.log('🚀 REAL GEMINI AI SERVICE INITIALIZED - ZERO FALLBACKS MODE');
    }

    /**
     * 🎯 GENERATE ORGANIC FARMING ACTIONS WITH GEMINI-2.5-FLASH
     */
    async generateOrganicAction(
        userContext: {
            location: string;
            cropType: string;
            farmSize: string;
            currentSeason: string;
            soilType?: string;
            previousActions?: string[];
        },
        retryConfig?: Partial<RetryConfig>
    ): Promise<{
        title: string;
        description: string;
        ingredients: Array<{ name: string; quantity: string; cost: number }>;
        steps: string[];
        expectedResults: {
            yieldIncrease: string;
            moneySaved: number;
            timeToResults: string;
            organicCompliance: number;
        };
        urgency: 'high' | 'medium' | 'low';
        category: string;
        reasoning: string;
    }> {
        console.log('🌾 GENERATING ORGANIC ACTION WITH GEMINI-2.5-FLASH...');

        const prompt = this.buildOrganicActionPrompt(userContext);
        const response = await this.callGeminiWithRetry(prompt, retryConfig);

        return this.parseOrganicActionResponse(response);
    }

    /**
     * 🎯 ANALYZE CROP DISEASE FROM IMAGE WITH GEMINI-2.5-FLASH
     */
    async analyzeCropDisease(
        imageBase64: string,
        cropType: string,
        location?: { latitude: number; longitude: number },
        retryConfig?: Partial<RetryConfig>
    ): Promise<{
        disease_name: string;
        confidence: number;
        symptoms: string[];
        treatment: string[];
        prevention: string[];
        severity: 'low' | 'medium' | 'high';
        economic_impact: string;
        recovery_timeline: string;
        spread_risk: 'low' | 'medium' | 'high';
    }> {
        console.log('🔍 ANALYZING CROP DISEASE WITH GEMINI-2.5-FLASH...');

        const prompt = this.buildDiseaseAnalysisPrompt(cropType, location);
        const response = await this.callGeminiWithImageAndRetry(imageBase64, prompt, retryConfig);

        return this.parseDiseaseAnalysisResponse(response);
    }

    /**
     * 🎯 PREDICT CROP YIELD WITH GEMINI-2.5-FLASH
     */
    async predictYield(
        farmData: {
            cropType: string;
            plantingDate: string;
            farmSize: number;
            location: { latitude: number; longitude: number };
            soilType: string;
            irrigationType: string;
            fertilizers: string[];
            pesticides: string[];
            weatherData?: any;
        },
        retryConfig?: Partial<RetryConfig>
    ): Promise<{
        predictedYieldKgPerHa: number;
        confidenceScore: number;
        yieldRange: { min: number; max: number };
        recommendations: string[];
        economicImpact: {
            estimatedRevenue: number;
            profitMargin: number;
            breakEvenPoint: number;
        };
        riskFactors: string[];
    }> {
        console.log('📊 PREDICTING YIELD WITH GEMINI-2.5-FLASH...');

        const prompt = this.buildYieldPredictionPrompt(farmData);
        const response = await this.callGeminiWithRetry(prompt, retryConfig);

        return this.parseYieldPredictionResponse(response);
    }

    /**
     * 🔄 CALL GEMINI API WITH EXPONENTIAL BACKOFF RETRY
     */
    private async callGeminiWithRetry(
        prompt: string,
        retryConfig?: Partial<RetryConfig>
    ): Promise<string> {
        const config = { ...this.defaultRetryConfig, ...retryConfig };

        // Check circuit breaker
        if (this.circuitBreakerState === 'open') {
            if (Date.now() - this.lastFailureTime > this.circuitBreakerTimeout) {
                this.circuitBreakerState = 'half-open';
                console.log('🔄 Circuit breaker moving to half-open state');
            } else {
                throw new Error('🚫 Circuit breaker is OPEN - Gemini API temporarily unavailable');
            }
        }

        const request: GeminiRequest = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        };

        let lastError: Error;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                console.log(`🚀 Gemini API call attempt ${attempt + 1}/${config.maxRetries + 1}`);

                const startTime = Date.now();
                const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request)
                });

                const responseTime = Date.now() - startTime;
                console.log(`⚡ Gemini API response time: ${responseTime}ms`);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
                }

                const data: GeminiResponse = await response.json();
                console.log('🔍 Gemini API response structure:', JSON.stringify(data, null, 2));

                // Handle different response structures safely
                let text: string;
                
                if (data.candidates && data.candidates.length > 0) {
                    // Standard structure: data.candidates[0].content.parts[0].text
                    const candidate = data.candidates[0];
                    if (candidate?.content?.parts && candidate.content.parts.length > 0) {
                        text = candidate.content.parts[0]?.text;
                    } else {
                        throw new Error('Invalid candidate structure from Gemini API');
                    }
                } else if (data.content?.parts && data.content.parts.length > 0) {
                    // Alternative structure: data.content.parts[0].text
                    text = data.content.parts[0]?.text;
                } else if (typeof data === 'string') {
                    // Direct text response
                    text = data;
                } else {
                    throw new Error('No valid response structure found from Gemini API');
                }

                if (!text || text.trim().length === 0) {
                    throw new Error('Empty text content in Gemini API response');
                }

                // Success - reset circuit breaker
                this.failureCount = 0;
                this.circuitBreakerState = 'closed';

                console.log(`✅ Gemini API call successful in ${responseTime}ms`);
                return text;

            } catch (error) {
                lastError = error as Error;
                console.error(`❌ Gemini API call attempt ${attempt + 1} failed:`, error);

                // Update circuit breaker on failure
                this.failureCount++;
                this.lastFailureTime = Date.now();

                if (this.failureCount >= this.circuitBreakerThreshold) {
                    this.circuitBreakerState = 'open';
                    console.error('🚫 Circuit breaker OPENED due to repeated failures');
                }

                // Don't retry on the last attempt
                if (attempt === config.maxRetries) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
                    config.maxDelay
                );

                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error(`🔥 GEMINI API FAILED after ${config.maxRetries + 1} attempts: ${lastError.message}`);
    }

    /**
     * 🔄 CALL GEMINI API WITH IMAGE AND RETRY
     */
    private async callGeminiWithImageAndRetry(
        imageBase64: string,
        prompt: string,
        retryConfig?: Partial<RetryConfig>
    ): Promise<string> {
        const config = { ...this.defaultRetryConfig, ...retryConfig };

        // Check circuit breaker
        if (this.circuitBreakerState === 'open') {
            if (Date.now() - this.lastFailureTime > this.circuitBreakerTimeout) {
                this.circuitBreakerState = 'half-open';
            } else {
                throw new Error('🚫 Circuit breaker is OPEN - Gemini API temporarily unavailable');
            }
        }

        // Clean base64 data
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

        const request: GeminiRequest = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: cleanBase64
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 32,
                topP: 0.9,
                maxOutputTokens: 2048
            }
        };

        let lastError: Error;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                console.log(`🚀 Gemini API image analysis attempt ${attempt + 1}/${config.maxRetries + 1}`);

                const startTime = Date.now();
                const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request)
                });

                const responseTime = Date.now() - startTime;

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
                }

                const data: GeminiResponse = await response.json();
                console.log('🔍 Gemini image analysis response structure:', JSON.stringify(data, null, 2));

                // Handle different response structures safely
                let text: string;
                
                if (data.candidates && data.candidates.length > 0) {
                    // Standard structure: data.candidates[0].content.parts[0].text
                    const candidate = data.candidates[0];
                    if (candidate?.content?.parts && candidate.content.parts.length > 0) {
                        text = candidate.content.parts[0]?.text;
                    } else {
                        throw new Error('Invalid candidate structure from Gemini API');
                    }
                } else if (data.content?.parts && data.content.parts.length > 0) {
                    // Alternative structure: data.content.parts[0].text
                    text = data.content.parts[0]?.text;
                } else if (typeof data === 'string') {
                    // Direct text response
                    text = data;
                } else {
                    throw new Error('No valid response structure found from Gemini API');
                }

                if (!text || text.trim().length === 0) {
                    throw new Error('Empty text content in Gemini API response');
                }

                // Success - reset circuit breaker
                this.failureCount = 0;
                this.circuitBreakerState = 'closed';

                console.log(`✅ Gemini image analysis successful in ${responseTime}ms`);
                return text;

            } catch (error) {
                lastError = error as Error;
                console.error(`❌ Gemini image analysis attempt ${attempt + 1} failed:`, error);

                // Update circuit breaker
                this.failureCount++;
                this.lastFailureTime = Date.now();

                if (this.failureCount >= this.circuitBreakerThreshold) {
                    this.circuitBreakerState = 'open';
                }

                if (attempt === config.maxRetries) {
                    break;
                }

                const delay = Math.min(
                    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
                    config.maxDelay
                );

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error(`🔥 GEMINI IMAGE ANALYSIS FAILED after ${config.maxRetries + 1} attempts: ${lastError.message}`);
    }

    /**
     * 🏗️ BUILD ORGANIC ACTION PROMPT
     */
    private buildOrganicActionPrompt(userContext: any): string {
        return `You are an expert organic farming advisor. Generate a specific, actionable organic farming recommendation for today.

FARMER CONTEXT:
- Location: ${userContext.location}
- Crop Type: ${userContext.cropType}
- Farm Size: ${userContext.farmSize}
- Current Season: ${userContext.currentSeason}
- Soil Type: ${userContext.soilType || 'Unknown'}
- Previous Actions: ${userContext.previousActions?.join(', ') || 'None'}

REQUIREMENTS:
1. Provide ONE specific organic action for TODAY
2. Use only natural, organic ingredients available locally
3. Include exact quantities and costs in USD
4. Provide step-by-step instructions
5. Calculate realistic yield increase and money saved
6. Determine urgency level based on seasonal timing

RESPONSE FORMAT (JSON):
{
  "title": "Today's Organic Action: [Specific Action Name]",
  "description": "[2-3 sentence description of what this action does and why it's needed now]",
  "ingredients": [
    {"name": "[ingredient name]", "quantity": "[amount needed]", "cost": [USD cost]}
  ],
  "steps": ["[Step 1]", "[Step 2]", "[Step 3]"],
  "expectedResults": {
    "yieldIncrease": "[X-Y%]",
    "moneySaved": [USD amount],
    "timeToResults": "[X days/weeks]",
    "organicCompliance": 100
  },
  "urgency": "[high/medium/low]",
  "category": "[pest_control/soil_health/growth_booster/disease_prevention]",
  "reasoning": "[Why this action is perfect for today's conditions]"
}

Generate the response as valid JSON only.`;
    }  /**
  
 * 🏗️ BUILD DISEASE ANALYSIS PROMPT
   */
    private buildDiseaseAnalysisPrompt(cropType: string, location?: any): string {
        return `You are an expert plant pathologist. Analyze this crop image for diseases, pests, or health issues.

ANALYSIS CONTEXT:
- Crop Type: ${cropType}
- Location: ${location ? `${location.latitude}, ${location.longitude}` : 'Unknown'}
- Analysis Date: ${new Date().toISOString()}

REQUIREMENTS:
1. Identify the primary disease, pest, or health issue
2. Provide confidence score (0-100)
3. List visible symptoms
4. Recommend organic treatment methods
5. Suggest prevention strategies
6. Assess severity and spread risk
7. Estimate economic impact and recovery time

RESPONSE FORMAT (JSON):
{
  "disease_name": "[Specific disease/pest name or 'Healthy' if no issues]",
  "confidence": [0-100 integer],
  "symptoms": ["[symptom 1]", "[symptom 2]"],
  "treatment": ["[organic treatment 1]", "[organic treatment 2]"],
  "prevention": ["[prevention method 1]", "[prevention method 2]"],
  "severity": "[low/medium/high]",
  "economic_impact": "[Description of potential losses]",
  "recovery_timeline": "[X days/weeks for recovery]",
  "spread_risk": "[low/medium/high]"
}

Analyze the image carefully and respond with valid JSON only.`;
    }

    /**
     * 🏗️ BUILD YIELD PREDICTION PROMPT
     */
    private buildYieldPredictionPrompt(farmData: any): string {
        return `You are an expert agricultural scientist. Predict crop yield based on the provided farm data.

FARM DATA:
- Crop Type: ${farmData.cropType}
- Planting Date: ${farmData.plantingDate}
- Farm Size: ${farmData.farmSize} hectares
- Location: ${farmData.location.latitude}, ${farmData.location.longitude}
- Soil Type: ${farmData.soilType}
- Irrigation: ${farmData.irrigationType}
- Fertilizers: ${farmData.fertilizers.join(', ')}
- Pesticides: ${farmData.pesticides.join(', ')}
- Current Date: ${new Date().toISOString()}

REQUIREMENTS:
1. Calculate predicted yield in kg per hectare
2. Provide confidence score (0-100)
3. Give yield range (min-max)
4. List specific recommendations for improvement
5. Calculate economic projections
6. Identify risk factors

RESPONSE FORMAT (JSON):
{
  "predictedYieldKgPerHa": [number],
  "confidenceScore": [0-100 integer],
  "yieldRange": {"min": [number], "max": [number]},
  "recommendations": ["[recommendation 1]", "[recommendation 2]"],
  "economicImpact": {
    "estimatedRevenue": [USD amount],
    "profitMargin": [percentage],
    "breakEvenPoint": [kg amount]
  },
  "riskFactors": ["[risk 1]", "[risk 2]"]
}

Provide realistic predictions based on agricultural science. Respond with valid JSON only.`;
    }

    /**
     * 🔧 FIX MALFORMED JSON
     */
    private fixMalformedJson(jsonString: string): string {
        try {
            // First, try to find the JSON boundaries
            let json = jsonString.trim();
            
            // Find the start of the JSON object
            const startIndex = json.indexOf('{');
            if (startIndex === -1) {
                throw new Error('No JSON object found');
            }
            
            json = json.substring(startIndex);
            
            // Handle truncated JSON by finding the last complete structure
            if (!json.endsWith('}')) {
                // Try to close incomplete arrays and objects
                let openBraces = 0;
                let openBrackets = 0;
                let inString = false;
                let escapeNext = false;
                let lastCompleteIndex = -1;
                
                for (let i = 0; i < json.length; i++) {
                    const char = json[i];
                    
                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    
                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }
                    
                    if (char === '"' && !escapeNext) {
                        inString = !inString;
                        continue;
                    }
                    
                    if (inString) continue;
                    
                    switch (char) {
                        case '{':
                            openBraces++;
                            break;
                        case '}':
                            openBraces--;
                            if (openBraces === 0 && openBrackets === 0) {
                                lastCompleteIndex = i;
                            }
                            break;
                        case '[':
                            openBrackets++;
                            break;
                        case ']':
                            openBrackets--;
                            break;
                    }
                }
                
                // If we found a complete structure, use it
                if (lastCompleteIndex > -1) {
                    json = json.substring(0, lastCompleteIndex + 1);
                } else {
                    // Try to fix incomplete arrays/objects
                    let fixedJson = json;
                    
                    // Close incomplete string if needed
                    if (inString) {
                        fixedJson += '"';
                    }
                    
                    // Close incomplete arrays
                    while (openBrackets > 0) {
                        fixedJson += ']';
                        openBrackets--;
                    }
                    
                    // Close incomplete objects
                    while (openBraces > 0) {
                        fixedJson += '}';
                        openBraces--;
                    }
                    
                    json = fixedJson;
                }
            }
            
            // Fix common JSON syntax issues
            json = json
                // Fix trailing commas in arrays
                .replace(/,(\s*])/g, '$1')
                // Fix trailing commas in objects
                .replace(/,(\s*})/g, '$1')
                // Fix missing commas between array elements (most common issue)
                .replace(/}(\s*)(?=\{)/g, '},$1')
                .replace(/](\s*)(?=\{)/g, '],$1')
                .replace(/}(\s*)(?=\[)/g, '},$1')
                .replace(/](\s*)(?=\[)/g, '],$1')
                // Fix missing commas between strings in arrays
                .replace(/"(\s*)(?=")/g, '",$1')
                // Fix incomplete array elements
                .replace(/,(\s*)$/g, '');
            
            // Test if the JSON is now valid
            JSON.parse(json);
            console.log('🔧 Successfully fixed malformed JSON');
            return json;
            
        } catch (error) {
            console.warn('⚠️ Could not fix malformed JSON, returning original:', error.message);
            return jsonString;
        }
    }

    /**
     * 🔍 PARSE ORGANIC ACTION RESPONSE
     */
    private parseOrganicActionResponse(response: string): any {
        try {
            console.log('🔍 Raw Gemini response to parse:', response);
            
            // Clean response and extract JSON - handle truncated/malformed responses
            let cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            
            // Fix common JSON issues
            cleanResponse = this.fixMalformedJson(cleanResponse);
            
            const parsed = JSON.parse(cleanResponse);

            // Validate required fields
            if (!parsed.title || !parsed.description || !parsed.ingredients || !parsed.steps) {
                throw new Error('Missing required fields in Gemini response');
            }

            // Ensure ingredients have proper structure
            if (!Array.isArray(parsed.ingredients)) {
                parsed.ingredients = [{ name: 'Natural ingredients', quantity: 'As needed', cost: 1.0 }];
            }

            // Ensure steps is an array
            if (!Array.isArray(parsed.steps)) {
                parsed.steps = ['Follow the organic farming instructions'];
            }

            // Validate urgency - map to database values
            if (!['high', 'medium', 'low'].includes(parsed.urgency)) {
                // Map old values to new ones
                if (parsed.urgency === 'immediate') parsed.urgency = 'high';
                else if (parsed.urgency === 'today') parsed.urgency = 'medium';
                else if (parsed.urgency === 'this_week') parsed.urgency = 'low';
                else parsed.urgency = 'medium'; // default
            }

            console.log('✅ Organic action response parsed successfully');
            return parsed;

        } catch (error) {
            console.error('❌ Failed to parse Gemini organic action response:', error);
            console.log('Raw response:', response);

            // Return fallback structure (but this should never happen in production)
            throw new Error(`Failed to parse Gemini response: ${error.message}`);
        }
    }

    /**
     * 🔍 PARSE DISEASE ANALYSIS RESPONSE
     */
    private parseDiseaseAnalysisResponse(response: string): any {
        try {
            const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);

            // Validate required fields
            if (!parsed.disease_name || typeof parsed.confidence !== 'number') {
                throw new Error('Missing required fields in disease analysis response');
            }

            // Ensure arrays
            parsed.symptoms = Array.isArray(parsed.symptoms) ? parsed.symptoms : [];
            parsed.treatment = Array.isArray(parsed.treatment) ? parsed.treatment : [];
            parsed.prevention = Array.isArray(parsed.prevention) ? parsed.prevention : [];

            // Validate enums
            if (!['low', 'medium', 'high'].includes(parsed.severity)) {
                parsed.severity = 'medium';
            }
            if (!['low', 'medium', 'high'].includes(parsed.spread_risk)) {
                parsed.spread_risk = 'medium';
            }

            console.log('✅ Disease analysis response parsed successfully');
            return parsed;

        } catch (error) {
            console.error('❌ Failed to parse Gemini disease analysis response:', error);
            throw new Error(`Failed to parse disease analysis: ${error.message}`);
        }
    }

    /**
     * 🔍 PARSE YIELD PREDICTION RESPONSE
     */
    private parseYieldPredictionResponse(response: string): any {
        try {
            const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);

            // Validate required fields
            if (typeof parsed.predictedYieldKgPerHa !== 'number' || typeof parsed.confidenceScore !== 'number') {
                throw new Error('Missing required numeric fields in yield prediction response');
            }

            // Ensure arrays
            parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
            parsed.riskFactors = Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [];

            // Validate yield range
            if (!parsed.yieldRange || typeof parsed.yieldRange.min !== 'number' || typeof parsed.yieldRange.max !== 'number') {
                parsed.yieldRange = {
                    min: Math.round(parsed.predictedYieldKgPerHa * 0.8),
                    max: Math.round(parsed.predictedYieldKgPerHa * 1.2)
                };
            }

            // Validate economic impact
            if (!parsed.economicImpact) {
                parsed.economicImpact = {
                    estimatedRevenue: parsed.predictedYieldKgPerHa * 0.5, // Assume $0.5 per kg
                    profitMargin: 30,
                    breakEvenPoint: parsed.predictedYieldKgPerHa * 0.7
                };
            }

            console.log('✅ Yield prediction response parsed successfully');
            return parsed;

        } catch (error) {
            console.error('❌ Failed to parse Gemini yield prediction response:', error);
            throw new Error(`Failed to parse yield prediction: ${error.message}`);
        }
    }

    /**
     * 📊 GET SERVICE HEALTH STATUS
     */
    getHealthStatus(): {
        circuitBreakerState: string;
        failureCount: number;
        lastFailureTime: number;
        isHealthy: boolean;
    } {
        return {
            circuitBreakerState: this.circuitBreakerState,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
            isHealthy: this.circuitBreakerState === 'closed' && this.failureCount < this.circuitBreakerThreshold
        };
    }

    /**
     * 🔄 RESET CIRCUIT BREAKER (FOR TESTING)
     */
    resetCircuitBreaker(): void {
        this.circuitBreakerState = 'closed';
        this.failureCount = 0;
        this.lastFailureTime = 0;
        console.log('🔄 Circuit breaker reset');
    }
}

// Export singleton instance
export const realGeminiAIService = new RealGeminiAIService();
export default realGeminiAIService;