"""
Vector store management using ChromaDB for RAG system
"""
import os
import sys
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional, Tuple
import json
import uuid

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from rag.embeddings import EmbeddingManager

class VectorStore:
    def __init__(self):
        # Initialize ChromaDB client
        os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
        
        try:
            # Initialize ChromaDB without default embedding function (we use OpenAI)
            self.client = chromadb.PersistentClient(
                path=settings.CHROMA_DB_PATH,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            print("✅ ChromaDB initialized successfully")
        except Exception as e:
            print(f"❌ ChromaDB initialization failed: {e}")
            print("Trying alternative configuration...")
            try:
                # Fallback configuration
                self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
                print("✅ ChromaDB initialized with fallback config")
            except Exception as e2:
                print(f"❌ Fallback also failed: {e2}")
                raise Exception(f"ChromaDB initialization failed: {e2}")
        
        # Initialize embedding manager
        self.embedding_manager = EmbeddingManager()
        
        # Create collections for different content types
        self.collections = {
            "general": self._get_or_create_collection("general_content"),
            "services": self._get_or_create_collection("services"),
            "careers": self._get_or_create_collection("careers")
        }
    
    def _get_or_create_collection(self, name: str):
        """Get existing collection or create new one"""
        try:
            collection = self.client.get_collection(name)
            print(f"Found existing collection: {name}")
            return collection
        except:
            # Create collection without embedding function (we provide embeddings manually)
            collection = self.client.create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"},
                embedding_function=None  # We use OpenAI embeddings
            )
            print(f"Created new collection: {name}")
            return collection
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to appropriate collections"""
        print(f"Adding {len(documents)} documents to vector store...")
        
        # Group documents by type
        doc_groups = {
            "general": [],
            "service": [],
            "career": []
        }
        
        for doc in documents:
            doc_type = doc["metadata"].get("type", "general")
            if doc_type == "service":
                doc_groups["service"].append(doc)
            elif doc_type == "career":
                doc_groups["career"].append(doc)
            else:
                doc_groups["general"].append(doc)
        
        # Add each group to its respective collection
        for collection_name, docs in doc_groups.items():
            if docs:
                self._add_to_collection(collection_name, docs)
        
        print("Documents added successfully!")
    
    def _add_to_collection(self, collection_name: str, documents: List[Dict[str, Any]]):
        """Add documents to a specific collection"""
        if not documents:
            return
        
        collection = self.collections[collection_name]
        
        # Prepare data for ChromaDB
        ids = []
        embeddings = []
        metadatas = []
        documents_text = []
        
        for doc in documents:
            doc_id = str(uuid.uuid4())
            ids.append(doc_id)
            embeddings.append(doc["embedding"])
            metadatas.append(doc["metadata"])
            documents_text.append(doc["content"])
        
        # Add to collection
        collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents_text
        )
        
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
            
            try:
                # Search in collection
                results = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results,
                    include=["documents", "metadatas", "distances"]
                )
                
                # Process results
                for i in range(len(results["documents"][0])):
                    result = {
                        "content": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i],
                        "collection": collection_name
                    }
                    all_results.append(result)
                    
            except Exception as e:
                print(f"Error searching in collection {collection_name}: {e}")
        
        # Sort by distance (similarity)
        all_results.sort(key=lambda x: x["distance"])
        
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
            try:
                count = collection.count()
                stats[name] = count
            except:
                stats[name] = 0
        return stats
    
    def clear_all_collections(self):
        """Clear all collections (useful for testing)"""
        for name in self.collections.keys():
            try:
                self.client.delete_collection(name)
                print(f"Deleted collection: {name}")
            except:
                pass
        
        # Recreate collections
        self.collections = {
            "general": self._get_or_create_collection("general_content"),
            "services": self._get_or_create_collection("services"),
            "careers": self._get_or_create_collection("careers")
        }
        print("All collections cleared and recreated")
    
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
    vector_store = VectorStore()
    
    # Test search
    results = vector_store.search("What services do you offer?")
    print(f"Found {len(results)} results")
    
    for result in results:
        print(f"- {result['content'][:100]}... (distance: {result['distance']:.3f})")
    
    # Show stats
    stats = vector_store.get_collection_stats()
    print(f"Collection stats: {stats}")
