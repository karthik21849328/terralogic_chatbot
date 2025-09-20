"""
RAG Query Engine - Main component for processing user queries
"""
import os
import sys
from typing import Dict, List, Any, Optional
import openai
import re

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from rag.simple_vector_store import SimpleVectorStore

class RAGQueryEngine:
    def __init__(self):
        # Initialize OpenAI
        openai.api_key = settings.OPENAI_API_KEY
        
        # Initialize vector store
        self.vector_store = SimpleVectorStore()
        
        # Intent classification keywords
        self.intent_keywords = {
            "careers": [
                "job", "jobs", "career", "careers", "hiring", "position", "employment",
                "vacancy", "work", "apply", "application", "salary", "engineer", 
                "developer", "manager", "analyst", "specialist", "resume", "cv",
                "interview", "recruit", "talent", "team", "department", "role",
                "opening", "openings", "opportunity", "opportunities", "representative",
                "sales", "marketing", "executive", "associate", "consultant", "intern",
                "internship", "fresher", "experienced", "python", "backend", "frontend"
            ],
            "services": [
                "service", "services", "electrician", "plumber", "painter", "carpenter",
                "cleaning", "repair", "installation", "maintenance", "fix", "price",
                "cost", "booking", "book", "schedule", "technician", "professional",
                "home", "house", "ac", "electrical", "plumbing", "painting"
            ],
            "general": [
                "about", "company", "how", "what", "why", "where", "when", "contact",
                "support", "help", "information", "details", "process", "works"
            ]
        }
    
    def classify_intent(self, query: str) -> str:
        """Classify user query intent"""
        query_lower = query.lower()
        
        # Count keyword matches for each intent
        intent_scores = {}
        for intent, keywords in self.intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            intent_scores[intent] = score
        
        # Get the intent with highest score
        if max(intent_scores.values()) == 0:
            return "general"  # Default to general if no keywords match
        
        return max(intent_scores, key=intent_scores.get)
    
    def retrieve_relevant_docs(self, query: str, intent: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant documents from vector store"""
        return self.vector_store.search_by_intent(query, intent, n_results)
    
    def generate_response(self, query: str, context_docs: List[Dict[str, Any]], intent: str) -> str:
        """Generate response using OpenAI with retrieved context"""
        
        # Build context from retrieved documents
        context = ""
        for doc in context_docs:
            context += f"- {doc['content']}\n"
        
        # Create intent-specific prompts
        if intent == "careers":
            system_prompt = """You are a helpful career counselor for Servecure, a home services platform. 
            You help people find job opportunities and provide information about careers at the company.
            
            When discussing jobs:
            - Provide specific job details if available (title, department, location, salary, requirements)
            - If asked about specific requirements, mention relevant skills and experience
            - Suggest how users can apply or get more information
            - Be encouraging and professional
            - If you don't have specific job information, suggest they check the careers page or contact HR
            
            Context information about available jobs and company:"""
            
        elif intent == "services":
            system_prompt = """You are a helpful customer service representative for Servecure, a home services platform.
            You help customers understand services, pricing, and booking processes.
            
            When discussing services:
            - Provide clear information about available services
            - Mention pricing when available
            - Explain the booking process
            - Highlight quality and reliability
            - If specific service details aren't available, guide them to contact support or use the booking system
            
            Context information about services:"""
            
        else:  # general
            system_prompt = """You are a helpful assistant for Servecure, a home services platform.
            You provide general information about the company, how it works, and help users navigate the platform.
            
            When answering general questions:
            - Be informative and friendly
            - Explain how Servecure works
            - Highlight key features and benefits
            - Guide users to relevant sections of the website when appropriate
            - If you don't have specific information, suggest contacting customer support
            
            Context information about the company:"""
        
        # Construct the full prompt
        full_prompt = f"""{system_prompt}
        
{context}

User Question: {query}

Please provide a helpful, accurate response based on the context above. Be conversational and friendly."""

        try:
            # Always use direct API calls (skip client library)
            print(f"🤖 Generating response using direct OpenAI Chat API...")
            import requests
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": settings.LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {query}"}
                ],
                "max_tokens": settings.MAX_TOKENS,
                "temperature": settings.TEMPERATURE
            }
            response = requests.post("https://api.openai.com/v1/chat/completions", 
                                   headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                message = result["choices"][0]["message"]["content"].strip()
                print(f"✅ Successfully generated response")
                return message
            else:
                print(f"❌ OpenAI Chat API Error {response.status_code}: {response.text}")
                # Continue to fallback section below
            
            # Old fallback code (keeping for reference but shouldn't be reached)
            if False:
                import requests
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                data = {
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Context: {context}\n\nQuestion: {query}"}
                    ],
                    "max_tokens": settings.MAX_TOKENS,
                    "temperature": settings.TEMPERATURE
                }
                response = requests.post("https://api.openai.com/v1/chat/completions", 
                                       headers=headers, json=data)
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"].strip()
                else:
                    raise Exception(f"API request failed: {response.text}")
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return self._get_fallback_response(intent, query)
    
    def _get_fallback_response(self, intent: str, query: str) -> str:
        """Provide fallback responses when OpenAI is unavailable"""
        
        if intent == "careers":
            return """Thank you for your interest in careers at Servecure! We have various opportunities across Engineering, 
            Product, Design, Marketing, and other departments. Please visit our careers page to see current openings 
            and apply. For specific questions about positions, you can contact our HR team."""
            
        elif intent == "services":
            return """Servecure offers professional home services including:
            
• Electrician services (starting from ₹299)
• Plumber services (starting from ₹399) 
• Painter services (starting from ₹499)
• Carpenter services (starting from ₹349)
• House cleaning (starting from ₹199)
• AC services (starting from ₹449)

To book a service, simply browse our services, select your preferred time, and our verified professionals will assist you!"""
            
        else:  # general
            return """Welcome to Servecure! We're a trusted platform connecting you with verified home service professionals. 
            
Here's how it works:
1. Search for your desired service
2. Choose from verified professionals
3. Book your preferred time slot  
4. Get quality service at your doorstep

We ensure all our service providers are verified and offer quality assurance. For more information, 
feel free to explore our website or contact our support team."""
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Main method to process user query through RAG pipeline"""
        
        # Step 1: Classify intent
        intent = self.classify_intent(query)
        
        # Step 2: Retrieve relevant documents
        relevant_docs = self.retrieve_relevant_docs(query, intent)
        
        # Step 3: Generate response
        response = self.generate_response(query, relevant_docs, intent)
        
        # Return structured result
        result = {
            "query": query,
            "intent": intent,
            "response": response,
            "sources": [
                {
                    "content": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"],
                    "metadata": doc["metadata"],
                    "relevance_score": 1 - doc["distance"]  # Convert distance to similarity
                }
                for doc in relevant_docs
            ],
            "num_sources": len(relevant_docs)
        }
        
        return result
    
    def get_suggested_actions(self, intent: str) -> List[str]:
        """Get suggested actions based on intent"""
        
        if intent == "careers":
            return [
                "Browse all job openings",
                "Filter jobs by department",
                "View job requirements",
                "Contact HR team"
            ]
        elif intent == "services":
            return [
                "Book a service",
                "View service pricing", 
                "Check service areas",
                "Contact support"
            ]
        else:
            return [
                "Learn how it works",
                "Browse services",
                "View careers",
                "Contact support"
            ]

if __name__ == "__main__":
    # Test the query engine
    engine = RAGQueryEngine()
    
    test_queries = [
        "What services do you offer?",
        "Are there any software engineering jobs available?",
        "How much does plumbing service cost?",
        "Tell me about your company"
    ]
    
    for query in test_queries:
        print(f"\n{'='*50}")
        print(f"Query: {query}")
        print(f"{'='*50}")
        
        result = engine.process_query(query)
        
        print(f"Intent: {result['intent']}")
        print(f"Response: {result['response']}")
        print(f"Sources used: {result['num_sources']}")
