#!/bin/bash
# Quick Launch Script for OCEAN-EYE (SIH 2026 Round 2)

echo "=========================================================="
echo "          LAUNCHING OCEAN-EYE MARITIME PLATFORM           "
echo "  AI Oil Spill Detection & Candidate Vessel Attribution   "
echo "=========================================================="

# Start Backend
echo "1. Starting FastAPI Backend on http://127.0.0.1:8000..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start Frontend
echo "2. Starting Vite React Frontend on http://localhost:5173..."
cd "../frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 OCEAN-EYE is running at:"
echo "   - Web Interface: http://localhost:5173"
echo "   - API Docs:      http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
