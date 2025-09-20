# terralogic_chatbot

# 🏠 Terralogic Assignment - AI-Powered Home Services Platform

## 📖 About This Project

This is a **Terralogic assignment** demonstrating a comprehensive home services platform with an intelligent AI chatbot. The project showcases real-world application of **RAG (Retrieval-Augmented Generation)** technology for customer service automation.

### What It Does:
- **🏠 Home Services Platform**: Book services like electrician, plumber, cleaner, etc. with real-time pricing
- **🤖 Smart AI Chatbot**: Answers questions about services, job opportunities, and company information using OpenAI
- **💼 Careers Portal**: Browse and filter through 50+ job listings with detailed descriptions
- **👤 User Management**: Complete user authentication, profile management, and service provider onboarding

### Key Technologies:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + OpenAI API + ChromaDB
- **AI Features**: RAG system with semantic search and intent classification

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/8000     ┌─────────────────┐
│   React App     │◄────────────────►│   Python RAG    │
│   (Frontend)    │                  │   Backend       │
│   localhost:5173│                  │   localhost:8000│
└─────────────────┘                  └─────────────────┘
         │                                      │
         │                                      ▼
         ▼                              ┌─────────────────┐
┌─────────────────┐                     │   ChromaDB +    │
│   Careers Portal│                     │   OpenAI APIs   │
│   50+ Jobs      │                     │   Vector Store  │
└─────────────────┘                     └─────────────────┘
```

## 🚀 How to Run This Terralogic Assignment

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.8+** 
- **OpenAI API Key** (get it from https://platform.openai.com/)

### **Step 1**: Clone the Repository
```bash
git clone <repository-url>
cd terralogic-assignment
```

### **Step 2**: Navigate to Frontend Folder
```bash
cd service_hub
```

### **Step 3**: Install Packages
```bash
npm install
```

### **Step 4**: Run the Frontend
```bash
npm run dev
```
✅ **Frontend accessible at**: http://localhost:5173

### **Step 5**: Navigate to Chatbot Backend
```bash
# Open new terminal and navigate to backend
cd chatbot_backend
```

### **Step 6**: Update OpenAI Key in config.py
```python
# Edit chatbot_backend/config.py
# Replace this line:
OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

# With your actual API key:
OPENAI_API_KEY = "your-openai-api-key-here"
```

### **Step 7**: Setup and Start Backend
```bash
# Initialize the system (creates vector database)
python setup.py

# Start the backend server
python start_server.py
```
✅ **Backend running at**: http://localhost:8000

### **Step 8**: Test the Chatbot
1. Open http://localhost:5173 in your browser
2. Click the **chat button** (bottom right corner)
3. **Continue chat with chatbot** - try asking:
   - "What services do you offer?"
   - "Do you have any software engineering jobs?"
   - "How much does plumbing cost?"
   - "Tell me about your company"

### 🎯 What You'll Experience:
- **Beautiful home services website** with service categories
- **Interactive AI chatbot** that answers questions intelligently using RAG
- **Careers section** with 50+ job listings and filtering
- **Responsive design** that works on mobile and desktop

## 🔧 Configuration

### Important: OpenAI API Key Setup
1. Get your API key from https://platform.openai.com/
2. Edit `chatbot_backend/config.py` 
3. Replace `OPENAI_API_KEY = None` with `OPENAI_API_KEY = "your-actual-api-key"`

### API Endpoints (for testing)
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (interactive documentation)
- **Health Check**: http://localhost:8000/health

## 🤖 How the AI Chatbot Works

The chatbot uses **RAG (Retrieval-Augmented Generation)** technology:

1. **User asks a question** → "What services do you offer?"
2. **Intent Classification** → Determines if it's about Services, Careers, or General info
3. **Semantic Search** → Finds relevant information from the knowledge base
4. **AI Response** → OpenAI generates a contextual answer using retrieved data
5. **Smart Actions** → Suggests relevant next steps (like "Book Service" or "View Jobs")

### Example Conversations:
```
💬 User: "How much does plumbing cost?"
🤖 Bot: "Our plumbing services start from ₹299 and include pipe repair, RO repair, and leakage fixing..."

💬 User: "Do you have software engineering jobs?"
🤖 Bot: "Yes! We have several software engineering positions available including Senior Full Stack Developer, Backend Engineer..."

💬 User: "Tell me about your company"
🤖 Bot: "Servecure is a modern home services platform that connects customers with verified professionals..."
```

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Tailwind CSS, Vite  
**Backend**: Python FastAPI, OpenAI API, ChromaDB  
**AI**: RAG system with semantic search and intent classification

## 🛠️ Development

### Adding New Services
1. Update service data in `chatbot_backend/data/scraped_content/services.json`
2. Run `POST /scrape-and-update` to refresh knowledge base
3. Update React components as needed

### Customizing Chatbot
- Edit prompts in `chatbot_backend/rag/query_engine.py`
- Modify intent keywords for better classification
- Add new suggested actions

### Frontend Development
```bash
cd service_hub
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code linting
```

### Backend Development
```bash
cd chatbot_backend
python -m api.main  # Start with auto-reload
python test_backend.py  # Run tests
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd service_hub
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd chatbot_backend
# Set environment variables
# Deploy with requirements.txt
```

## 📊 Performance

- **Frontend**: React optimizations, lazy loading, responsive design
- **Backend**: FastAPI with async support, efficient vector search
- **Chatbot**: OpenAI API integration, semantic search optimization
- **Scalability**: Stateless design, horizontal scaling ready
