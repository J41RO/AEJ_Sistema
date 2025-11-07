#!/bin/bash
set -e

echo "🚀 Starting AEJ Sistema POS Backend..."

# Navigate to backend directory
cd backend

# Run seed script
echo "🌱 Seeding database..."
python seed.py

# Start uvicorn
echo "🔥 Starting Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
