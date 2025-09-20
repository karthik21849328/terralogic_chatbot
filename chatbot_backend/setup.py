"""
Setup script for initializing the chatbot backend
"""
import os
import sys
import asyncio
from scraper.website_scraper import WebsiteScraper
from rag.simple_vector_store import SimpleVectorStore

def create_directories():
    """Create necessary directories"""
    directories = [
        "./data",
        "./data/scraped_content", 
        "./data/job_listings",
        "./data/vector_db"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def setup_vector_store():
    """Initialize and populate vector store"""
    print("Setting up vector store...")
    
    # Initialize scraper and scrape content
    scraper = WebsiteScraper()
    scraped_data = scraper.scrape_all()
    
    # Initialize vector store and populate it
    vector_store = SimpleVectorStore()
    vector_store.populate_from_scraped_data(scraped_data)
    
    # Show statistics
    stats = vector_store.get_collection_stats()
    print("\nVector store setup complete!")
    print("Collection statistics:")
    for name, count in stats.items():
        print(f"  {name}: {count} documents")

def main():
    """Main setup function"""
    print("🚀 Setting up Servecure Chatbot Backend...")
    print("=" * 50)
    
    # Create directories
    print("\n1. Creating directories...")
    create_directories()
    
    # Setup vector store
    print("\n2. Setting up vector store...")
    setup_vector_store()
    
    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Set your OpenAI API key in config.py")
    print("2. Run: python -m api.main")
    print("3. Test the API at http://localhost:8000")
    print("4. API docs at http://localhost:8000/docs")

if __name__ == "__main__":
    main()
