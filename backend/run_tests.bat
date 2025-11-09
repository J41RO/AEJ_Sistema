@echo off
echo ========================================
echo Running AEJ Sistema POS Backend Tests
echo ========================================
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Install test dependencies
echo Installing test dependencies...
pip install -q -r requirements-dev.txt

echo.
echo Running tests...
echo.

REM Run pytest with coverage
pytest -v --cov=. --cov-report=term-missing --cov-report=html

echo.
echo ========================================
echo Tests completed!
echo Coverage report saved to htmlcov/index.html
echo ========================================
