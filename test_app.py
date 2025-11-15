#!/usr/bin/env python3
"""
Test script to verify the French Influencer Monitor application
"""
import asyncio
from orchestrator import InfluencerOrchestrator

async def test_analysis():
    """Test the analysis pipeline"""
    print("=" * 60)
    print("French Influencer Monitor - Test Script")
    print("=" * 60)
    
    orchestrator = InfluencerOrchestrator()
    
    # Test with a well-known French influencer
    test_influencer = "Squeezie"
    
    print(f"\n🔍 Testing analysis for: {test_influencer}")
    print("-" * 60)
    
    try:
        results = await orchestrator.analyze_influencer(test_influencer)
        
        print("\n✅ Analysis Complete!")
        print("-" * 60)
        print(f"Influencer: {results['influencer_name']}")
        print(f"Trust Score: {results['score_data']['trust_score']}/100")
        print(f"Trust Level: {results['trust_level']}")
        print(f"Drama Count: {results['score_data']['drama_count']}")
        print(f"Good Actions: {results['score_data']['good_action_count']}")
        print(f"Neutral: {results['score_data']['neutral_count']}")
        print(f"Total Mentions: {len(results['mentions'])}")
        print(f"Average Sentiment: {results['score_data']['avg_sentiment']:.3f}")
        
        print("\n📝 Sample Mentions:")
        print("-" * 60)
        for i, mention in enumerate(results['mentions'][:5], 1):
            print(f"\n{i}. [{mention['source'].upper()}] {mention['label'].upper()}")
            print(f"   Sentiment: {mention['sentiment_score']:.2f}")
            print(f"   Text: {mention['text'][:150]}...")
            print(f"   URL: {mention['url']}")
        
        print("\n" + "=" * 60)
        print("✅ Test completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_analysis())
