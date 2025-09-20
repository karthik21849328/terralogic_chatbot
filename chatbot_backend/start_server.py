"""
Simple startup script for the chatbot backend
"""
import os
import sys
import subprocess

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import fastapi
        import openai
        import numpy
        import requests
        print("✅ All dependencies installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def setup_if_needed():
    """Run setup if vector store is empty"""
    try:
        from rag.simple_vector_store import SimpleVectorStore
        vs = SimpleVectorStore()
        stats = vs.get_collection_stats()
        total_docs = sum(stats.values())
        
        if total_docs == 0:
            print("📥 Vector store is empty. Running setup...")
            from setup import main as setup_main
            setup_main()
        else:
            print(f"✅ Vector store ready with {total_docs} documents")
            
    except Exception as e:
        print(f"⚠️  Setup check failed: {e}")
        print("You may need to run: python setup.py")

def start_server():
    """Start the FastAPI server"""
    try:
        print("🚀 Starting Servecure Chatbot Backend...")
        print("API will be available at: http://localhost:8000")
        print("API docs at: http://localhost:8000/docs")
        print("Press Ctrl+C to stop")
        
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "api.main:app", 
            "--host", "localhost",
            "--port", "8000",
            "--reload"
        ])
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main startup function"""
    print("🤖 Servecure Chatbot Backend Startup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Setup if needed
    setup_if_needed()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
