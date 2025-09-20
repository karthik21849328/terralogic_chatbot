"""
Test script for the chatbot backend
"""
import os
import sys
import requests
import json

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_local_components():
    """Test local components without API server"""
    print("🧪 Testing Local Components")
    print("=" * 40)
    
    try:
        # Test scraper
        print("1. Testing Website Scraper...")
        from scraper.website_scraper import WebsiteScraper
        scraper = WebsiteScraper()
        data = scraper.scrape_static()  # Use static scraping for testing
        print(f"   ✅ Scraped {len(data.get('services', []))} services")
        
        # Test embedding manager
        print("2. Testing Embedding Manager...")
        from rag.embeddings import EmbeddingManager
        em = EmbeddingManager()
        test_texts = ["Test service description", "Test job posting"]
        embeddings = em.generate_embeddings(test_texts)
        print(f"   ✅ Generated embeddings: {len(embeddings)} x {len(embeddings[0])}")
        
        # Test vector store
        print("3. Testing Vector Store...")
        from rag.vector_store import VectorStore
        vs = VectorStore()
        stats = vs.get_collection_stats()
        print(f"   ✅ Vector store collections: {stats}")
        
        # Test query engine
        print("4. Testing Query Engine...")
        from rag.query_engine import RAGQueryEngine
        engine = RAGQueryEngine()
        intent = engine.classify_intent("What jobs do you have?")
        print(f"   ✅ Intent classification working: '{intent}'")
        
        print("\n✅ All local components working!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing local components: {e}")
        return False

def test_api_server(base_url="http://localhost:8000"):
    """Test API server endpoints"""
    print("\n🌐 Testing API Server")
    print("=" * 40)
    
    try:
        # Test health endpoint
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✅ Server healthy: {health_data['status']}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
        
        # Test stats endpoint
        print("2. Testing stats endpoint...")
        response = requests.get(f"{base_url}/stats", timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print(f"   ✅ Stats: {stats['total_documents']} total documents")
        else:
            print(f"   ❌ Stats failed: {response.status_code}")
        
        # Test intent classification
        print("3. Testing intent classification...")
        test_query = "What services do you offer?"
        response = requests.get(f"{base_url}/test-intent/{test_query}", timeout=5)
        if response.status_code == 200:
            intent_data = response.json()
            print(f"   ✅ Intent: '{intent_data['classified_intent']}'")
        else:
            print(f"   ❌ Intent test failed: {response.status_code}")
        
        # Test chat endpoint
        print("4. Testing chat endpoint...")
        chat_data = {
            "message": "Tell me about your company",
            "user_id": "test_user"
        }
        response = requests.post(
            f"{base_url}/chat", 
            json=chat_data,
            timeout=10
        )
        if response.status_code == 200:
            chat_response = response.json()
            print(f"   ✅ Chat response: {len(chat_response['response'])} chars")
            print(f"   Intent: {chat_response['intent']}")
            print(f"   Sources: {len(chat_response['sources'])}")
        else:
            print(f"   ❌ Chat test failed: {response.status_code}")
            
        print("\n✅ API server working!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
        print("   Make sure to run: python -m api.main")
        return False
    except Exception as e:
        print(f"❌ Error testing API server: {e}")
        return False

def run_sample_queries():
    """Run sample queries to test different intents"""
    print("\n💬 Testing Sample Queries")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    test_queries = [
        ("What services do you offer?", "services"),
        ("Are there any software engineering jobs?", "careers"),
        ("How does your platform work?", "general"),
        ("What's the cost of plumbing service?", "services"),
        ("Do you have remote work opportunities?", "careers")
    ]
    
    try:
        for query, expected_intent in test_queries:
            print(f"\nQuery: '{query}'")
            
            chat_data = {"message": query}
            response = requests.post(f"{base_url}/chat", json=chat_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                actual_intent = result['intent']
                
                intent_match = "✅" if actual_intent == expected_intent else "❌"
                print(f"  Intent: {actual_intent} {intent_match}")
                print(f"  Response: {result['response'][:100]}...")
                print(f"  Sources: {len(result['sources'])}")
            else:
                print(f"  ❌ Failed: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error running sample queries: {e}")

def main():
    """Main test function"""
    print("🚀 Servecure Chatbot Backend Test Suite")
    print("=" * 50)
    
    # Test local components
    local_success = test_local_components()
    
    if local_success:
        # Test API server
        api_success = test_api_server()
        
        if api_success:
            # Run sample queries
            run_sample_queries()
        else:
            print("\n💡 To test the API server:")
            print("1. Open a new terminal")
            print("2. cd chatbot_backend")
            print("3. python -m api.main")
            print("4. Run this test script again")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()
