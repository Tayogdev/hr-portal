@echo off
REM HR Portal Production Deployment Script for Windows
REM This script automates the deployment process for the HR Portal application

echo 🚀 Starting HR Portal Production Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js version: %NODE_VERSION%

REM Check if .env.local exists
if not exist ".env.local" (
    echo [WARNING] .env.local not found. Please create it with your environment variables.
    echo [INFO] Required environment variables:
    echo   - DATABASE_URL
    echo   - NEXTAUTH_URL
    echo   - NEXTAUTH_SECRET
    echo   - EMAIL_SERVER_* (optional)
    echo   - GOOGLE_CLIENT_* (optional)
    exit /b 1
)

REM Install dependencies
echo [INFO] Installing dependencies...
call npm ci --production=false
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)

REM Run database migrations
echo [INFO] Running database migrations...
call npx prisma db push
if errorlevel 1 (
    echo [ERROR] Failed to run database migrations
    exit /b 1
)

REM Build the application
echo [INFO] Building the application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build the application
    exit /b 1
)

REM Run type checking
echo [INFO] Running TypeScript type checking...
call npx tsc --noEmit
if errorlevel 1 (
    echo [ERROR] TypeScript type checking failed
    exit /b 1
)

REM Run linting
echo [INFO] Running ESLint...
call npm run lint
if errorlevel 1 (
    echo [WARNING] ESLint found issues, but continuing...
)

REM Run tests (if available)
if exist "jest.config.js" (
    echo [INFO] Running tests...
    call npm test
    if errorlevel 1 (
        echo [WARNING] Tests failed, but continuing...
    )
)

REM Create production build
echo [INFO] Creating production build...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to create production build
    exit /b 1
)

echo [SUCCESS] Build completed successfully!

REM Optional: Start production server
if "%1"=="--start" (
    echo [INFO] Starting production server...
    call npm start
) else (
    echo [SUCCESS] Deployment script completed!
    echo [INFO] To start the production server, run: npm start
    echo [INFO] Or run this script with --start flag: scripts\deploy.bat --start
)

echo.
echo [SUCCESS] 🎉 HR Portal is ready for production!
echo [INFO] Make sure to:
echo   - Set up your production database
echo   - Configure environment variables
echo   - Set up a reverse proxy (nginx) if needed
echo   - Configure SSL certificates
echo   - Set up monitoring and logging 