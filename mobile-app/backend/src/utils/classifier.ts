import { config } from '../config';

export interface ClassificationResult {
  label: 'drama' | 'good_action' | 'neutral';
  sentimentScore: number;
  confidence: number;
}

/**
 * Classify text content based on keywords and sentiment
 * More lenient thresholds for better classification
 */
export function classifyContent(text: string, sentimentScore: number = 0): ClassificationResult {
  const textLower = text.toLowerCase();
  
  // Count keyword matches
  const dramaMatches = config.keywords.drama.filter(keyword => 
    textLower.includes(keyword)
  ).length;
  
  const goodMatches = config.keywords.goodAction.filter(keyword => 
    textLower.includes(keyword)
  ).length;
  
  // Calculate confidence based on keyword density
  const totalMatches = dramaMatches + goodMatches;
  const confidence = Math.min(totalMatches / 5.0, 1.0); // More lenient (was 10.0)
  
  // Classification logic - MORE LENIENT THRESHOLDS
  let label: 'drama' | 'good_action' | 'neutral' = 'neutral';
  
  // Strong classification: keywords + sentiment alignment
  if (dramaMatches > 0 && sentimentScore < -0.1) { // Was -0.2
    label = 'drama';
  } else if (goodMatches > 0 && sentimentScore > 0.1) { // Was 0.2
    label = 'good_action';
  } 
  // Moderate classification: keywords dominate, slight sentiment
  else if (dramaMatches >= 2 && sentimentScore <= 0) { // Multiple drama keywords
    label = 'drama';
  } else if (goodMatches >= 2 && sentimentScore >= 0) { // Multiple good keywords
    label = 'good_action';
  }
  // Weak classification: keywords only (no sentiment requirement)
  else if (dramaMatches > goodMatches && dramaMatches >= 1) {
    label = 'drama';
  } else if (goodMatches > dramaMatches && goodMatches >= 1) {
    label = 'good_action';
  }
  
  return {
    label,
    sentimentScore,
    confidence: Math.max(confidence, 0.2), // Lower minimum confidence (was 0.3)
  };
}

/**
 * Calculate sentiment score from text using keyword-based approach
 */
export function calculateSentiment(text: string): number {
  const textLower = text.toLowerCase();
  
  const dramaCount = config.keywords.drama.filter(keyword => 
    textLower.includes(keyword)
  ).length;
  
  const goodCount = config.keywords.goodAction.filter(keyword => 
    textLower.includes(keyword)
  ).length;
  
  const total = dramaCount + goodCount;
  
  if (total === 0) {
    return 0.0;
  }
  
  // Normalize to -1 to 1 range
  return (goodCount - dramaCount) / total;
}
