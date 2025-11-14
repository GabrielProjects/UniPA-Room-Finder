#!/bin/bash

# Start development servers for both backend and frontend
# Requires two terminal windows or use with a process manager

echo "🚀 Starting UnipaTool development servers..."

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "❌ Backend dependencies not installed. Run ./setup.sh first"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not installed. Run ./setup.sh first"
    exit 1
fi

# Start backend in background
echo "📡 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT

