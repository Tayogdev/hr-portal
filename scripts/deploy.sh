#!/bin/bash

echo "🚀 HR Portal - Lightweight Deployment"

# Check prerequisites
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Run from project root."
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please create it with:"
    echo "   DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET"
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔧 Setting up database..."
npx prisma generate
npx prisma db push

echo "🏗️ Building application..."
npm run build

echo "✅ Build completed!"
echo "🚀 Start with: npm start" 