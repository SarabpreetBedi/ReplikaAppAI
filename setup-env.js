const fs = require('fs');
const path = require('path');

console.log('🔧 Replika App Environment Setup\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env file...');
  
  const envContent = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_PATH=./replika.db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
}

console.log('\n📋 Next Steps:');
console.log('1. Edit the .env file and add your OpenAI API key');
console.log('2. Get your API key from: https://platform.openai.com/api-keys');
console.log('3. Replace "your_openai_api_key_here" with your actual API key');
console.log('4. Start the server: npm run dev');
console.log('5. The chat should work properly once the API key is set');

console.log('\n⚠️  Important:');
console.log('- You need a valid OpenAI API key for the AI chat to work');
console.log('- Without the API key, the AI will be stuck "typing" indefinitely');
console.log('- The API key is required for GPT-3.5-turbo to generate responses'); 