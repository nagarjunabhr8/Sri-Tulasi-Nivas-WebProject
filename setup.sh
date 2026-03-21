#!/bin/bash

# Sri Tulasi Nivas - Automated Setup Script

echo "🏢 Sri Tulasi Nivas - Setup Script"
echo "===================================="

# Check Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17+."
    exit 1
fi

# Check Maven installation
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.8+."
    exit 1
fi

# Check Node installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file (update with your values)"
fi

echo "🔨 Building backend..."
mvn clean install

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file (update with your values)"
fi

echo "📦 Installing dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Update frontend/.env with your API URL"
echo "3. Create PostgreSQL database: createdb sri_tulasi_nivas"
echo "4. Start backend: cd backend && mvn spring-boot:run"
echo "5. Start frontend: cd frontend && npm start"
echo ""
echo "📖 See docs/QUICK_START.md for detailed instructions"
