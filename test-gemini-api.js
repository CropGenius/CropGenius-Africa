// 🚨 EMERGENCY GEMINI API TEST - AGRICULTURAL AI GOD DEMANDS RESULTS!
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('🚀 Testing Gemini API directly...');

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
        }
    });
    console.log('✅ Loaded .env file');
} else {
    console.log('⚠️ No .env file found');
}

// Test environment variables
console.log('Environment check:', {
    hasViteGeminiKey: !!process.env.VITE_GEMINI_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env || {}).filter(key => key.includes('GEMINI'))
});

// Direct API test - try both keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

console.log('🔑 API Key Status:', {
    hasKey: !!GEMINI_API_KEY,
    keyLength: GEMINI_API_KEY?.length || 0,
    keyPreview: GEMINI_API_KEY?.substring(0, 10) + '...' || 'NO KEY'
});

async function testGeminiAPI() {
    if (!GEMINI_API_KEY) {
        console.error('🔥 NO API KEY FOUND!');
        return;
    }

    try {
        const payload = {
            contents: [{
                parts: [{
                    text: 'Generate a simple JSON response: {"test": "success", "message": "Gemini API is working"}'
                }]
            }]
        };

        console.log('📡 Making test API call...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔥 API Error:', errorText);
            return;
        }

        const result = await response.json();
        console.log('✅ SUCCESS! Gemini API Response:', result);
        
    } catch (error) {
        console.error('🔥 Test failed:', error);
    }
}

// Run the test
testGeminiAPI();