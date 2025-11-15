#!/bin/bash

# French Influencer Monitor - Quick Start Script

echo "🔍 French Influencer Monitor"
echo "=============================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Check if database exists
if [ ! -f "influencer_monitor.db" ]; then
    echo "📊 Initializing database..."
    python -c "import database; database.init_db()"
fi

# Start Streamlit
echo "🚀 Starting Streamlit application..."
echo ""
echo "The app will open in your browser at http://localhost:8501"
echo "Press Ctrl+C to stop the server"
echo ""

streamlit run streamlit_app.py
