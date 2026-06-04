const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Manually parse .env file to extract GEMINI_API_KEY
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*["']?(.*?)["']?\s*$/);
      if (match) {
        process.env.GEMINI_API_KEY = match[1];
        console.log('🔑 Found GEMINI_API_KEY in .env file (Length:', match[1].length, 'characters)');
        break;
      }
    }
  } else {
    console.error('❌ .env file not found at:', envPath);
  }
} catch (err) {
  console.error('❌ Error parsing .env file:', err.message);
}

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not defined. Please check your .env file.');
  process.exit(1);
}

// 2. Initialize Gemini and send a test request
async function testGeminiConnection() {
  console.log('📡 Attempting to brute-force test Gemini endpoints and models...');
  
  const testConfigs = [
    { version: 'v1', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-1.5-flash' },
    { version: 'v1', model: 'gemini-1.5-pro' },
    { version: 'v1beta', model: 'gemini-1.5-pro' },
    { version: 'v1', model: 'gemini-pro' },
    { version: 'v1beta', model: 'gemini-pro' },
    { version: 'v1', model: 'gemini-1.5-flash-latest' }
  ];

  for (const config of testConfigs) {
    const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const payload = {
      contents: [{
        parts: [{
          text: 'Hello! Keep it very short: respond with SUCCESS if you receive this.'
        }]
      }]
    };

    console.log(`📡 [Testing] Version: ${config.version}, Model: ${config.model}`);
    try {
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const resData = await geminiRes.json();
      
      if (geminiRes.ok) {
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`✅ [FOUND SUCCESSFUL COMBINATION!]`);
        console.log(`   - Endpoint Version: ${config.version}`);
        console.log(`   - Model Name: ${config.model}`);
        console.log(`   - Response: ${text.trim()}\n`);
        return; // 성공했으니 중단
      } else {
        console.log(`   ❌ [Failed] Status: ${geminiRes.status}, Msg: ${resData.error?.message || 'Error'}`);
      }
    } catch (e) {
      console.log(`   ❌ [Failed] Exception: ${e.message}`);
    }
  }
  
  console.error('\n🚫 All tested combinations failed! Check if your API Key has Generative Language API enabled in the Google Cloud Console.');
}

testGeminiConnection();
