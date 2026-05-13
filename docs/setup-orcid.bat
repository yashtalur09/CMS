@echo off
REM ORCID Integration Setup Script for Windows
REM This script helps you configure ORCID authentication

echo ========================================
echo ORCID Integration Setup
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "backend" (
    echo ERROR: Please run this script from the CMS root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Step 1: Checking dependencies...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version
echo.

echo Step 2: Installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing all backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed. Installing axios...
    call npm install axios
)
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..
echo.

echo Step 3: Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing all frontend dependencies...
    call npm install
) else (
    echo [OK] Frontend dependencies already installed
)
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo Step 4: Setting up environment files...
echo.

REM Backend .env
if not exist "backend\.env" (
    echo Creating backend\.env from template...
    copy backend\.env.example backend\.env >nul
    echo [CREATED] backend\.env
) else (
    echo [EXISTS] backend\.env already exists
)

REM Frontend .env
if not exist "frontend\.env" (
    echo Creating frontend\.env from template...
    copy frontend\.env.example frontend\.env >nul
    echo [CREATED] frontend\.env
) else (
    echo [EXISTS] frontend\.env already exists
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo NEXT STEPS - IMPORTANT!
echo.
echo 1. Get ORCID Credentials:
echo    - Visit: https://orcid.org/developer-tools
echo    - Register your application
echo    - Save your Client ID and Client Secret
echo.
echo 2. Configure Backend:
echo    - Open: backend\.env
echo    - Update these values:
echo      * ORCID_CLIENT_ID=your_client_id_here
echo      * ORCID_CLIENT_SECRET=your_client_secret_here
echo      * ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
echo.
echo 3. Configure Frontend:
echo    - Open: frontend\.env
echo    - Update these values:
echo      * REACT_APP_ORCID_CLIENT_ID=your_client_id_here
echo      * REACT_APP_ORCID_REDIRECT_URI=http://localhost:3000/auth/orcid/callback
echo.
echo 4. Start the application:
echo    - Open two terminals
echo    - Terminal 1: cd backend && npm run dev
echo    - Terminal 2: cd frontend && npm start
echo.
echo 5. Test ORCID login:
echo    - Open: http://localhost:3000/login
echo    - Click "Login with ORCID"
echo.
echo ========================================
echo For detailed instructions, see:
echo - IMPLEMENTATION_SUMMARY.md
echo - ORCID_SETUP.md
echo ========================================
echo.
pause
