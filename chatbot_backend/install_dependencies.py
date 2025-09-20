#!/usr/bin/env python3
"""
Simple dependency installation for OpenAI-based RAG system
No heavy ML dependencies - uses OpenAI for embeddings
"""

import subprocess
import sys

def install_package(package):
    """Install a single package"""
    print(f"Installing {package}...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    """Install all required dependencies"""
    print("🚀 Installing OpenAI-based RAG Dependencies")
    print("=" * 50)
    
    packages = [
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "python-multipart==0.0.6",
        "python-dotenv==1.0.0",
        "beautifulsoup4==4.12.2", 
        "requests==2.31.0",
        "selenium==4.15.0",
        "lxml==4.9.3",
        "openai==1.3.7",
        "tiktoken==0.11.0",
        "chromadb==0.4.15",
        "pandas==2.1.3",
        "numpy==1.24.3",
        "python-json-logger==2.0.7",
        "fastapi-cors==0.0.6",
        "db-sqlite3==0.0.1",
        "pytest==7.4.3",
        "black==23.11.0"
    ]
    
    failed = []
    for package in packages:
        if not install_package(package):
            failed.append(package)
    
    if failed:
        print(f"\n❌ Failed to install: {', '.join(failed)}")
        return False
    
    print("\n✅ All dependencies installed successfully!")
    print("\nNext steps:")
    print("1. Run: python setup.py")
    print("2. Run: python -m api.main")
    print("3. Test at: http://localhost:8000")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n💥 Some installations failed. Please install manually.")
        sys.exit(1)

