"""
FastAPI main application for the chatbot backend
"""
import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
from rag.query_engine import RAGQueryEngine
from scraper.website_scraper import WebsiteScraper

# Initialize FastAPI app
app = FastAPI(
    title="Servecure Chatbot API",
    description="RAG-powered chatbot for Servecure home services platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize global components
query_engine = None

# Pydantic models for API
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    sources: List[Dict[str, Any]]
    suggested_actions: List[str]
    session_id: Optional[str] = None

class HealthCheck(BaseModel):
    status: str
    message: str
    vector_store_stats: Optional[Dict[str, int]] = None

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the RAG system on startup"""
    global query_engine
    
    try:
        print("Initializing RAG Query Engine...")
        query_engine = RAGQueryEngine()
        
        # Check if vector store is populated
        stats = query_engine.vector_store.get_collection_stats()
        total_docs = sum(stats.values())
        
        if total_docs == 0:
            print("Vector store is empty. Scraping website and populating...")
            await populate_vector_store()
        else:
            print(f"Vector store already populated with {total_docs} documents")
            
        print("RAG system initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
        # Continue without RAG for basic functionality

async def populate_vector_store():
    """Populate vector store with scraped data"""
    try:
        # Scrape website content
        scraper = WebsiteScraper()
        scraped_data = scraper.scrape_all()
        
        # Populate vector store
        query_engine.vector_store.populate_from_scraped_data(scraped_data)
        
        print("Vector store populated successfully!")
        
    except Exception as e:
        print(f"Error populating vector store: {e}")
        raise

# API Routes

@app.get("/", response_model=HealthCheck)
async def root():
    """Health check endpoint"""
    global query_engine
    
    stats = None
    if query_engine:
        try:
            stats = query_engine.vector_store.get_collection_stats()
        except:
            pass
    
    return HealthCheck(
        status="healthy",
        message="Servecure Chatbot API is running",
        vector_store_stats=stats
    )

@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Detailed health check"""
    global query_engine
    
    if not query_engine:
        return HealthCheck(
            status="unhealthy", 
            message="RAG system not initialized"
        )
    
    try:
        stats = query_engine.vector_store.get_collection_stats()
        total_docs = sum(stats.values())
        
        return HealthCheck(
            status="healthy",
            message=f"RAG system operational with {total_docs} documents",
            vector_store_stats=stats
        )
    except Exception as e:
        return HealthCheck(
            status="unhealthy",
            message=f"RAG system error: {str(e)}"
        )

@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Main chat endpoint"""
    global query_engine
    
    if not query_engine:
        raise HTTPException(
            status_code=503, 
            detail="RAG system not available. Please try again later."
        )
    
    try:
        # Process the query through RAG
        result = query_engine.process_query(message.message)
        
        # Get suggested actions
        suggested_actions = query_engine.get_suggested_actions(result["intent"])
        
        return ChatResponse(
            response=result["response"],
            intent=result["intent"],
            sources=result["sources"],
            suggested_actions=suggested_actions,
            session_id=message.session_id
        )
        
    except Exception as e:
        print(f"Error processing chat message: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing your message. Please try again."
        )

@app.post("/scrape-and-update")
async def scrape_and_update():
    """Manually trigger website scraping and vector store update"""
    global query_engine
    
    if not query_engine:
        raise HTTPException(
            status_code=503,
            detail="RAG system not available"
        )
    
    try:
        await populate_vector_store()
        
        stats = query_engine.vector_store.get_collection_stats()
        return {
            "status": "success",
            "message": "Vector store updated successfully",
            "stats": stats
        }
        
    except Exception as e:
        print(f"Error updating vector store: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating vector store: {str(e)}"
        )

@app.get("/stats")
async def get_stats():
    """Get vector store statistics"""
    global query_engine
    
    if not query_engine:
        raise HTTPException(
            status_code=503,
            detail="RAG system not available"
        )
    
    try:
        stats = query_engine.vector_store.get_collection_stats()
        return {
            "collections": stats,
            "total_documents": sum(stats.values())
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting stats: {str(e)}"
        )

@app.get("/test-intent/{query}")
async def test_intent_classification(query: str):
    """Test intent classification for a query"""
    global query_engine
    
    if not query_engine:
        raise HTTPException(
            status_code=503,
            detail="RAG system not available"
        )
    
    intent = query_engine.classify_intent(query)
    return {
        "query": query,
        "classified_intent": intent,
        "suggested_actions": query_engine.get_suggested_actions(intent)
    }

# Run the server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )

