"""
SmartMart AI – Supermarket Sales & Inventory Copilot (TRACK_ID=PS03)
Main Application Entrypoint
Run this script to start the complete server (FastAPI backend + frontend static UI) on port 8000.
Usage: python app.py
"""

import sys
import os
import uvicorn

# Ensure project root is on Python search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"\n========================================================")
    print(f"  SmartMart AI – Supermarket Sales & Inventory Copilot")
    print(f"  Access application at: http://localhost:{port}")
    print(f"========================================================\n")
    uvicorn.run("src.app:app", host=host, port=port, reload=True)
