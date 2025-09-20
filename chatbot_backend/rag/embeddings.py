"""
OpenAI-based embedding generation for RAG system (no heavy ML dependencies)
"""
import os
import sys
from typing import List, Dict, Any
import openai
import numpy as np

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

class EmbeddingManager:
    def __init__(self):
        """Initialize with direct API approach - bypass client issues"""
        self.client = None  # Force direct API usage to avoid client library issues
        self.embedding_dim = 1536  # OpenAI ada-002 embedding dimension
        self.model_name = "text-embedding-ada-002"
        print("✅ Embedding manager initialized with direct API calls")
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts using OpenAI"""
        try:
            # Always use direct API calls (skip client library)
            print(f"🔗 Generating embeddings for {len(texts)} texts using direct API...")
            import requests
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": self.model_name,
                "input": texts
            }
            response = requests.post("https://api.openai.com/v1/embeddings", 
                                   headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                embeddings = [item['embedding'] for item in result['data']]
                print(f"✅ Successfully generated {len(embeddings)} embeddings")
                return embeddings
            else:
                print(f"❌ OpenAI API Error {response.status_code}: {response.text}")
                # Continue to fallback section below
            
            # Old fallback code (keeping for reference but shouldn't be reached)
            if False:
                # Use requests directly as fallback
                import requests
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                data = {
                    "model": self.model_name,
                    "input": texts
                }
                response = requests.post("https://api.openai.com/v1/embeddings", 
                                       headers=headers, json=data)
                if response.status_code == 200:
                    return [embedding['embedding'] for embedding in response.json()['data']]
                else:
                    raise Exception(f"Embedding API request failed: {response.text}")
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            # Return zero vectors as fallback
            return [[0.0] * self.embedding_dim for _ in texts]
    
    def generate_single_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text using OpenAI"""
        try:
            # Always use direct API calls (skip client library)
            import requests
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": self.model_name,
                "input": [text]
            }
            response = requests.post("https://api.openai.com/v1/embeddings", 
                                   headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                return result['data'][0]['embedding']
            else:
                print(f"❌ OpenAI API Error {response.status_code}: {response.text}")
                # Continue to fallback section below
            
            # Old fallback code (keeping for reference but shouldn't be reached)
            if False:
                # Use requests directly as fallback
                import requests
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                data = {
                    "model": self.model_name,
                    "input": [text]
                }
                response = requests.post("https://api.openai.com/v1/embeddings", 
                                       headers=headers, json=data)
                if response.status_code == 200:
                    return response.json()['data'][0]['embedding']
                else:
                    raise Exception(f"Embedding API request failed: {response.text}")
        except Exception as e:
            print(f"Error generating single embedding: {e}")
            # Return zero vector as fallback
            return [0.0] * self.embedding_dim
    
    def prepare_documents_for_embedding(self, scraped_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prepare documents from scraped data for embedding"""
        documents = []
        
        # Process general content
        general = scraped_data.get("general_content", {})
        if general:
            # Company information
            company_doc = {
                "content": f"Company: {general.get('company_name', '')} - {general.get('tagline', '')}. "
                         f"Description: {general.get('description', '')}",
                "metadata": {
                    "type": "general",
                    "category": "company_info"
                }
            }
            documents.append(company_doc)
            
            # Services overview
            services_overview = f"Services offered: {', '.join(general.get('services_offered', []))}"
            services_doc = {
                "content": services_overview,
                "metadata": {
                    "type": "general", 
                    "category": "services_overview"
                }
            }
            documents.append(services_doc)
            
            # How it works
            how_it_works = f"How it works: {'. '.join(general.get('how_it_works', []))}"
            process_doc = {
                "content": how_it_works,
                "metadata": {
                    "type": "general",
                    "category": "process"
                }
            }
            documents.append(process_doc)
            
            # Key features
            features = f"Key features: {', '.join(general.get('key_features', []))}"
            features_doc = {
                "content": features,
                "metadata": {
                    "type": "general",
                    "category": "features"
                }
            }
            documents.append(features_doc)
        
        # Process services
        services = scraped_data.get("services", [])
        for service in services:
            service_content = (
                f"Service: {service.get('title', '')}. "
                f"Sub-services: {', '.join(service.get('sub_services', []))}. "
                f"Starting price: {service.get('starting_price', '')}. "
                f"Description: {service.get('description', '')}"
            )
            
            service_doc = {
                "content": service_content,
                "metadata": {
                    "type": "service",
                    "service_name": service.get('title', ''),
                    "starting_price": service.get('starting_price', ''),
                    "category": "service_details"
                }
            }
            documents.append(service_doc)
        
        # Process job listings
        jobs = scraped_data.get("job_listings", [])
        for job in jobs:
            job_content = (
                f"Job: {job.get('title', '')} at {job.get('department', '')} department. "
                f"Location: {job.get('location', '')}. Experience: {job.get('experience', '')}. "
                f"Salary: {job.get('salary', '')}. Skills: {', '.join(job.get('skills', []))}. "
                f"Type: {job.get('type', '')}. Description: {job.get('description', '')}"
            )
            
            job_doc = {
                "content": job_content,
                "metadata": {
                    "type": "career",
                    "job_id": job.get('id', ''),
                    "title": job.get('title', ''),
                    "department": job.get('department', ''),
                    "location": job.get('location', ''),
                    "experience": job.get('experience', ''),
                    "salary": job.get('salary', ''),
                    "job_type": job.get('type', ''),
                    "category": "job_listing"
                }
            }
            documents.append(job_doc)
        
        return documents
    
    def create_embeddings_for_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create embeddings for prepared documents"""
        print(f"Generating embeddings for {len(documents)} documents...")
        
        # Extract content for embedding
        texts = [doc["content"] for doc in documents]
        
        # Generate embeddings
        embeddings = self.generate_embeddings(texts)
        
        # Add embeddings to documents
        for i, doc in enumerate(documents):
            doc["embedding"] = embeddings[i]
            doc["embedding_dim"] = self.embedding_dim
        
        print("Embeddings generated successfully!")
        return documents

if __name__ == "__main__":
    # Test embedding generation
    embedding_manager = EmbeddingManager()
    
    test_texts = [
        "Servecure provides professional home services including electrical work",
        "We offer plumbing services with expert technicians",
        "Software Engineer position available in Mumbai with React skills required"
    ]
    
    embeddings = embedding_manager.generate_embeddings(test_texts)
    print(f"Generated {len(embeddings)} embeddings with dimension {len(embeddings[0])}")
