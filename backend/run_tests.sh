#!/bin/bash

echo "========================================"
echo "Running AEJ Sistema POS Backend Tests"
echo "========================================"
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install test dependencies
echo "Installing test dependencies..."
pip install -q -r requirements-dev.txt

echo ""
echo "Running tests..."
echo ""

# Run pytest with coverage
pytest -v --cov=. --cov-report=term-missing --cov-report=html

echo ""
echo "========================================"
echo "Tests completed!"
echo "Coverage report saved to htmlcov/index.html"
echo "========================================"
