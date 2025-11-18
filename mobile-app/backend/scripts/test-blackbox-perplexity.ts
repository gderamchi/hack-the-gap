import axios from 'axios';

const BLACKBOX_API_KEY = 'sk-8OyzCHGCmjs5uft_9NNl1w';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';

// Test different Perplexity models available through Blackbox
const PERPLEXITY_MODELS = [
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-huge-128k-online',
];

async function testPerplexityModel(model: string) {
  console.log(`\n🧪 Testing model: ${model}`);
  console.log('━'.repeat(60));
  
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant de recherche qui analyse les influenceurs français.'
          },
          {
            role: 'user',
            content: 'Recherche web: Quelles sont les dernières controverses de Squeezie influenceur français en 2024?'
          }
        ],
        stream: false,
        webSearch: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    console.log(`✅ Success!`);
    console.log(`📝 Response length: ${content.length} characters`);
    console.log(`📄 Preview:\n${content.substring(0, 300)}...`);
    
    return { success: true, model, content };
    
  } catch (error: any) {
    console.log(`❌ Failed!`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    return { success: false, model, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Perplexity Models via Blackbox AI');
  console.log('━'.repeat(60));
  console.log(`API Key: ${BLACKBOX_API_KEY.substring(0, 10)}...`);
  console.log(`API URL: ${BLACKBOX_API_URL}`);
  
  const results = [];
  
  for (const model of PERPLEXITY_MODELS) {
    const result = await testPerplexityModel(model);
    results.push(result);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📊 Summary:');
  console.log('━'.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Working models:');
    successful.forEach(r => console.log(`   - ${r.model}`));
    
    console.log('\n🎉 Recommended model for production:');
    console.log(`   ${successful[0].model}`);
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed models:');
    failed.forEach(r => console.log(`   - ${r.model}`));
  }
}

main().catch(console.error);
