# Servecure Chatbot Backend

A RAG-powered chatbot backend for the Servecure home services platform, built with Python, FastAPI, ChromaDB, and OpenAI.

## Features

- **RAG (Retrieval-Augmented Generation)**: Intelligent responses based on website content
- **Intent Classification**: Automatically categorizes queries as general, services, or careers
- **Web Scraping**: Extracts content from React webapp for knowledge base
- **Vector Store**: ChromaDB for efficient semantic search
- **FastAPI**: Modern, fast web API with automatic documentation
- **Multi-collection Support**: Separate vector stores for different content types

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   Scraper        │───▶│  Vector Store   │
│   (Frontend)    │    │   (Extract Data) │    │   (ChromaDB)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         │                                               ▼
         │              ┌──────────────────┐    ┌─────────────────┐
         └─────────────▶│   FastAPI        │───▶│  RAG Engine     │
                        │   (Chat API)     │    │  (OpenAI + RAG) │
                        └──────────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd chatbot_backend
pip install -r requirements.txt
```

### 2. Configure API Keys

Edit `config.py` and add your OpenAI API key:

```python
OPENAI_API_KEY = "your-openai-api-key-here"
```

### 3. Initialize the System

Run the setup script to create directories and populate the vector store:

```bash
python setup.py
```

### 4. Start the Server

```bash
python -m api.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Chat Endpoint
```http
POST /chat
Content-Type: application/json

{
  "message": "What services do you offer?",
  "user_id": "optional",
  "session_id": "optional"
}
```

**Response:**
```json
{
  "response": "Servecure offers professional home services including...",
  "intent": "services",
  "sources": [...],
  "suggested_actions": [...]
}
```

### Health Check
```http
GET /health
```

### Statistics
```http
GET /stats
```

### Update Vector Store
```http
POST /scrape-and-update
```

## Intent Classification

The system automatically classifies user queries into three categories:

### 1. **Careers** Intent
Triggers for job-related queries:
- Keywords: job, career, hiring, position, salary, engineer, developer, etc.
- Example: "Are there any software engineering jobs available?"

### 2. **Services** Intent  
Triggers for service-related queries:
- Keywords: service, electrician, plumber, price, booking, repair, etc.
- Example: "How much does plumbing service cost?"

### 3. **General** Intent
Triggers for company/general information:
- Keywords: about, company, how, what, contact, etc.
- Example: "Tell me about your company"

## RAG Pipeline

1. **Query Classification**: Determine user intent
2. **Document Retrieval**: Find relevant documents using semantic search
3. **Context Assembly**: Combine retrieved documents
4. **Response Generation**: Use OpenAI with context to generate response

## Vector Store Collections

- **General**: Company information, how it works, features
- **Services**: Service details, pricing, descriptions
- **Careers**: Job listings, requirements, benefits

## Testing

### Test Intent Classification
```bash
curl http://localhost:8000/test-intent/What%20jobs%20do%20you%20have
```

### Test Chat
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What services do you offer?"}'
```

## Development

### Project Structure
```
chatbot_backend/
├── api/
│   ├── __init__.py
│   └── main.py              # FastAPI application
├── rag/
│   ├── __init__.py
│   ├── embeddings.py        # Embedding generation
│   ├── vector_store.py      # ChromaDB management
│   └── query_engine.py      # Main RAG logic
├── scraper/
│   ├── __init__.py
│   └── website_scraper.py   # Web scraping
├── data/                    # Generated data directory
├── config.py               # Configuration
├── setup.py               # Setup script
├── requirements.txt       # Dependencies
└── README.md             # This file
```

### Adding New Content Types

1. Update scraper to extract new content
2. Modify embedding manager to process new documents
3. Add new collection in vector store
4. Update intent classification if needed

### Debugging

- Check logs for scraping issues
- Verify vector store population: `GET /stats`
- Test intent classification: `GET /test-intent/{query}`
- Monitor API health: `GET /health`

## Troubleshooting

### Common Issues

1. **ChromeDriver Error**: Install ChromeDriver or use static scraping fallback
2. **OpenAI API Error**: Check API key and rate limits
3. **Empty Vector Store**: Run `python setup.py` again
4. **CORS Issues**: Ensure React dev server URL is in CORS origins

### Manual Vector Store Reset

```python
from rag.vector_store import VectorStore
vs = VectorStore()
vs.clear_all_collections()
```

## Performance

- **Response Time**: ~1-3 seconds per query
- **Vector Search**: ~100ms for semantic search
- **Concurrent Users**: Supports multiple simultaneous users
- **Memory Usage**: ~500MB with full vector store

## Future Enhancements

- [ ] Chat history persistence
- [ ] User session management
- [ ] Advanced job matching algorithms
- [ ] Multi-language support
- [ ] Analytics and metrics
- [ ] Caching layer for common queries

