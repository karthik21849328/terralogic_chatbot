"""
Simple in-memory vector store for RAG system
No external dependencies - just uses NumPy for similarity calculations
"""
import os
import sys
import json
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from rag.embeddings import EmbeddingManager

class SimpleVectorStore:
    def __init__(self):
        """Initialize simple vector store"""
        print("✅ Initializing Simple Vector Store (no external dependencies)")
        
        # Initialize embedding manager
        self.embedding_manager = EmbeddingManager()
        
        # In-memory storage
        self.collections = {
            "general": {"documents": [], "embeddings": [], "metadatas": [], "ids": []},
            "services": {"documents": [], "embeddings": [], "metadatas": [], "ids": []},
            "careers": {"documents": [], "embeddings": [], "metadatas": [], "ids": []}
        }
        
        # Data persistence
        self.data_file = os.path.join(settings.DATA_DIR, "vector_store.json")
        self._load_from_disk()
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def _save_to_disk(self):
        """Save vector store to disk"""
        try:
            os.makedirs(settings.DATA_DIR, exist_ok=True)
            with open(self.data_file, 'w') as f:
                json.dump(self.collections, f, indent=2)
            print(f"✅ Vector store saved to {self.data_file}")
        except Exception as e:
            print(f"⚠️ Could not save vector store: {e}")
    
    def _load_from_disk(self):
        """Load vector store from disk"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r') as f:
                    self.collections = json.load(f)
                print(f"✅ Vector store loaded from {self.data_file}")
            else:
                print("ℹ️ No existing vector store found, starting fresh")
        except Exception as e:
            print(f"⚠️ Could not load vector store: {e}")
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to appropriate collections"""
        print(f"Adding {len(documents)} documents to vector store...")
        
        # Group documents by type
        doc_groups = {
            "general": [],
            "services": [],
            "careers": []
        }
        
        for doc in documents:
            doc_type = doc["metadata"].get("type", "general")
            print(f"Processing document type: {doc_type} - {doc['metadata'].get('title', doc['content'][:50])}")
            if doc_type == "service":
                doc_groups["services"].append(doc)
            elif doc_type == "career":
                doc_groups["careers"].append(doc)
            else:
                doc_groups["general"].append(doc)
        
        # Add each group to its respective collection
        for collection_name, docs in doc_groups.items():
            if docs:
                self._add_to_collection(collection_name, docs)
        
        # Save to disk
        self._save_to_disk()
        print("Documents added successfully!")
    
    def _add_to_collection(self, collection_name: str, documents: List[Dict[str, Any]]):
        """Add documents to a specific collection"""
        if not documents:
            return
        
        collection = self.collections[collection_name]
        
        for i, doc in enumerate(documents):
            doc_id = f"{collection_name}_{len(collection['ids'])}_{i}"
            
            collection["ids"].append(doc_id)
            collection["embeddings"].append(doc["embedding"])
            collection["metadatas"].append(doc["metadata"])
            collection["documents"].append(doc["content"])
        
        print(f"Added {len(documents)} documents to {collection_name} collection")
    
    def search(self, query: str, collection_names: Optional[List[str]] = None, 
               n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant documents across collections"""
        
        if collection_names is None:
            collection_names = list(self.collections.keys())
        
        # Generate embedding for query
        query_embedding = self.embedding_manager.generate_single_embedding(query)
        
        all_results = []
        
        for collection_name in collection_names:
            if collection_name not in self.collections:
                continue
                
            collection = self.collections[collection_name]
            
            if not collection["embeddings"]:
                continue
            
            # Calculate similarities
            for i, doc_embedding in enumerate(collection["embeddings"]):
                similarity = self._cosine_similarity(query_embedding, doc_embedding)
                distance = 1 - similarity  # Convert similarity to distance
                
                result = {
                    "content": collection["documents"][i],
                    "metadata": collection["metadatas"][i],
                    "distance": distance,
                    "collection": collection_name,
                    "similarity": similarity
                }
                all_results.append(result)
        
        # Sort by similarity (highest first)
        all_results.sort(key=lambda x: x["similarity"], reverse=True)
        
        return all_results[:n_results]
    
    def search_by_intent(self, query: str, intent: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """Search for documents based on classified intent"""
        
        if intent == "careers":
            collections = ["careers"]
        elif intent == "services":
            collections = ["services"]
        else:
            collections = ["general", "services"]  # For general queries
        
        return self.search(query, collections, n_results)
    
    def get_collection_stats(self) -> Dict[str, int]:
        """Get statistics about collections"""
        stats = {}
        for name, collection in self.collections.items():
            stats[name] = len(collection["documents"])
        return stats
    
    def clear_all_collections(self):
        """Clear all collections"""
        for collection in self.collections.values():
            collection["documents"] = []
            collection["embeddings"] = []
            collection["metadatas"] = []
            collection["ids"] = []
        
        self._save_to_disk()
        print("All collections cleared")
    
    def populate_from_scraped_data(self, scraped_data: Dict[str, Any]):
        """Populate vector store from scraped data"""
        print("Populating vector store from scraped data...")
        
        # Prepare documents for embedding
        documents = self.embedding_manager.prepare_documents_for_embedding(scraped_data)
        
        # Generate embeddings
        documents_with_embeddings = self.embedding_manager.create_embeddings_for_documents(documents)
        
        # Add to vector store
        self.add_documents(documents_with_embeddings)
        
        # Print statistics
        stats = self.get_collection_stats()
        print("Vector store population complete!")
        print("Collection statistics:")
        for name, count in stats.items():
            print(f"  {name}: {count} documents")

if __name__ == "__main__":
    # Test vector store functionality
    vector_store = SimpleVectorStore()
    
    # Test search
    results = vector_store.search("What services do you offer?")
    print(f"Found {len(results)} results")
    
    for result in results:
        print(f"- {result['content'][:100]}... (similarity: {result['similarity']:.3f})")
    
    # Show stats
    stats = vector_store.get_collection_stats()
    print(f"Collection stats: {stats}")
