import axios from 'axios';

const BLACKBOX_API_KEY = 'sk-gsrAXDLWPGMK2i3jKlpTIw';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';

async function testPerplexityViaBlackbox() {
  console.log('🧪 Testing Perplexity via Blackbox AI\n');
  
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: 'blackboxai/perplexity/llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant de recherche qui analyse les influenceurs français.'
          },
          {
            role: 'user',
            content: 'Recherche web: Quelles sont les dernières actualités et controverses de Squeezie influenceur français en 2024?'
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
    
    console.log('✅ SUCCESS! Perplexity model works via Blackbox!\n');
    console.log('📝 Response:');
    console.log('━'.repeat(80));
    console.log(content);
    console.log('━'.repeat(80));
    console.log(`\n📊 Length: ${content.length} characters`);
    
  } catch (error: any) {
    console.log('❌ FAILED!\n');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

testPerplexityViaBlackbox();
