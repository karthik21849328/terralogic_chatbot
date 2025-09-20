"""
Configuration settings for the chatbot backend
"""
import os
from typing import Optional

class Settings:
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # React App URL for scraping
    REACT_APP_URL: str = os.getenv("REACT_APP_URL", "http://localhost:5173")
    
    # ChromaDB Configuration
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "./data/vector_db")
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "localhost")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Embedding Model (OpenAI)
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    
    # LLM Configuration
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "1000"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))
    
    # Data directories
    DATA_DIR: str = "./data"
    SCRAPED_CONTENT_DIR: str = "./data/scraped_content"
    JOB_LISTINGS_DIR: str = "./data/job_listings"

settings = Settings()
