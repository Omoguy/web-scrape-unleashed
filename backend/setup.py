
#!/usr/bin/env python3
"""
Setup script for the Flask scraper backend
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Python requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def install_playwright():
    """Install Playwright browsers"""
    print("Installing Playwright browsers...")
    try:
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        print("✅ Playwright browsers installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing Playwright browsers: {e}")
        return False
    return True

def main():
    print("🚀 Setting up Flask Scraper Backend")
    print("=" * 50)
    
    if not install_requirements():
        sys.exit(1)
    
    if not install_playwright():
        sys.exit(1)
    
    print("\n✅ Setup completed successfully!")
    print("\nTo start the server, run:")
    print("python app.py")

if __name__ == "__main__":
    main()
