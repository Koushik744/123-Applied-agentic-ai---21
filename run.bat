@echo off
echo ============================================================
echo   PROMPT CHAINING FOR SUMMARIZATION — EXPERIMENT
echo ============================================================
echo.

if not exist ".venv" (
    echo ERROR: Virtual environment not found.
    echo.
    echo Please run these commands first:
    echo   python -m venv .venv
    echo   .venv\Scripts\activate
    echo   pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    echo ERROR: .env file not found.
    echo.
    echo Please create a .env file with your API key:
    echo   copy .env.example .env
    echo Then open .env and replace the placeholder with your actual Gemini API key.
    echo.
    pause
    exit /b 1
)

echo Activating virtual environment...
call .venv\Scripts\activate

echo Running experiment...
echo.
python src/main.py

echo.
echo ============================================================
echo   Done. Press any key to close.
echo ============================================================
pause
