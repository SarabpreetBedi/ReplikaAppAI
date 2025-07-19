require('dotenv').config();
const OpenAI = require('openai');

console.log('🔍 Testing OpenAI API Configuration...\n');

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('✅ API Key found in .env file');
console.log('🔑 API Key format check:');

const apiKey = process.env.OPENAI_API_KEY;
console.log(`   Length: ${apiKey.length} characters`);
console.log(`   Starts with 'sk-': ${apiKey.startsWith('sk-')}`);
console.log(`   First 10 chars: ${apiKey.substring(0, 10)}...`);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('\n🚀 Testing OpenAI API connection...');

// Test the API
async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: "Say 'Hello! API test successful!'" }
      ],
      max_tokens: 50,
      timeout: 10000 // 10 second timeout
    });

    console.log('✅ OpenAI API test successful!');
    console.log(`🤖 Response: ${completion.choices[0].message.content}`);
    
  } catch (error) {
    console.log('❌ OpenAI API test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'invalid_api_key') {
      console.log('\n💡 This means your API key is invalid or expired.');
      console.log('   Get a new key from: https://platform.openai.com/api-keys');
    } else if (error.code === 'insufficient_quota') {
      console.log('\n💡 You have insufficient quota. Check your OpenAI account.');
    } else if (error.code === 'rate_limit_exceeded') {
      console.log('\n💡 Rate limit exceeded. Wait a moment and try again.');
    }
  }
}

testOpenAI(); 