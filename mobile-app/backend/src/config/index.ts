import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/influencer_trust',
  },
  
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    apiUrl: 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-small-128k-online',
    maxConcurrent: parseInt(process.env.PERPLEXITY_MAX_CONCURRENT || '5', 10),
    rateLimitMs: parseInt(process.env.PERPLEXITY_RATE_LIMIT_MS || '1000', 10),
  },
  
  rateLimit: {
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60', 10),
  },
  
  cache: {
    ttlHours: parseInt(process.env.CACHE_TTL_HOURS || '24', 10),
  },
  
  // French keywords for classification (expanded with variations and slang)
  keywords: {
    drama: [
      'scandale', 'controverse', 'polémique', 'accusation', 'critique',
      'problème', 'clash', 'conflit', 'arnaque', 'mensonge', 'tricherie',
      'manipulation', 'fake', 'faux', 'plagiat', 'vol', 'insulte',
      'racisme', 'sexisme', 'harcèlement', 'violence', 'agression',
      // Additional variations
      'scandaleux', 'controversé', 'accusé', 'critiqué', 'problématique',
      'arnaqueur', 'menteur', 'tricheur', 'manipulateur', 'voleur',
      'insulté', 'raciste', 'sexiste', 'harceleur', 'violent', 'agressif',
      // Slang and modern terms
      'drama', 'beef', 'cancel', 'cancelé', 'toxic', 'toxique',
      'hate', 'haine', 'troll', 'fake news', 'dérapage', 'bad buzz',
      'shitstorm', 'backlash', 'boycott', 'boycotté', 'dénoncé',
      'exposé', 'révélation', 'affaire', 'procès', 'plainte',
      'condamné', 'coupable', 'victime', 'abus', 'fraude'
    ],
    goodAction: [
      'don', 'charité', 'aide', 'soutien', 'générosité', 'solidarité',
      'bénévolat', 'association', 'humanitaire', 'entraide', 'partage',
      'bienfaisance', 'philanthropie', 'engagement', 'cause', 'défense',
      'protection', 'sensibilisation', 'mobilisation', 'collecte',
      // Additional variations
      'donner', 'aider', 'soutenir', 'généreux', 'solidaire',
      'bénévole', 'humaniste', 'engagé', 'défendre', 'protéger',
      'sensibiliser', 'mobiliser', 'collecter', 'charitable',
      // Modern terms
      'fundraising', 'crowdfunding', 'cagnotte', 'levée de fonds',
      'campagne', 'initiative', 'projet', 'action', 'geste',
      'héros', 'héroïque', 'admirable', 'inspirant', 'exemplaire',
      'positif', 'bienveillant', 'altruiste', 'généreux geste',
      'bonne action', 'coup de main', 'entraide', 'solidaire'
    ]
  },
  
  // Trust score calculation parameters
  scoring: {
    baseScore: 50.0,
    dramaWeight: -15.0,
    goodActionWeight: 10.0,
    sentimentWeight: 20.0,
    recencyDecayDays: 180, // 6 months
  }
};
