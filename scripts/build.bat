@echo off

echo 🏗️ HR Portal - Building Application

echo 📦 Installing dependencies...
call npm ci --production=false

echo 🔧 Setting up database...
call npx prisma generate

echo 🏗️ Building application...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build completed successfully!
    echo 🚀 Start with: npm start
) else (
    echo ❌ Build failed. Trying alternative approach...
    echo 🔄 Cleaning and rebuilding...
    rmdir /s /q .next 2>nul
    call npm run build
) 