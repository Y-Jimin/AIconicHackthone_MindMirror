/**
 * Gemini API에서 사용 가능한 모델 목록 확인 스크립트
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  try {
    console.log('🔍 Testing Gemini API models...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');
    
    const modelsToTest = [
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-pro-vision',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
    ];
    
    for (const modelName of modelsToTest) {
      console.log(`\n🧪 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
        console.log(`   ✅ This model is available and working!`);
        break; // 첫 번째 작동하는 모델을 찾으면 중단
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testModels();

