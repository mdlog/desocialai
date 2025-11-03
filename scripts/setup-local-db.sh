#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 DeSocialAI - Local PostgreSQL Setup${NC}"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed!${NC}"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql@14"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql 2>/dev/null && ! brew services list 2>/dev/null | grep -q "postgresql.*started"; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting...${NC}"
    
    # Try to start PostgreSQL
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    elif command -v brew &> /dev/null; then
        brew services start postgresql@14
    fi
    
    sleep 2
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Database configuration
DB_NAME="desocialai"
DB_USER="desocialai_user"
DB_PASSWORD="desocialai_secure_2024"

echo -e "${BLUE}📊 Creating database and user...${NC}"

# Create database and user
sudo -u postgres psql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};

-- Create new database and user
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Connect to database and grant schema privileges
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};

-- Show success message
SELECT 'Database created successfully!' as status;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database and user created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Updating .env file...${NC}"

# Backup existing .env if it exists
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${YELLOW}⚠️  Backed up existing .env file${NC}"
fi

# Read existing .env or use .env.example
if [ -f .env ]; then
    ENV_SOURCE=".env"
else
    ENV_SOURCE=".env.example"
fi

# Update DATABASE_URL in .env
if [ -f .env ]; then
    # Replace DATABASE_URL line
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}|" .env
    rm .env.bak 2>/dev/null
else
    # Create new .env from .env.example
    cp .env.example .env
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}|" .env
    rm .env.bak 2>/dev/null
fi

echo -e "${GREEN}✅ .env file updated${NC}"
echo ""

echo -e "${BLUE}🔧 Initializing database schema...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Run database migrations
if npm run db:push; then
    echo -e "${GREEN}✅ Database schema initialized${NC}"
else
    echo -e "${RED}❌ Failed to initialize database schema${NC}"
    echo "You can try manually: npm run db:push"
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Database Information:${NC}"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo "  Host: localhost"
echo "  Port: 5432"
echo ""
echo -e "${BLUE}🔗 Connection String:${NC}"
echo "  postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Update other environment variables in .env file"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:5000"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "  Connect to database: psql -U ${DB_USER} -d ${DB_NAME}"
echo "  Check tables: psql -U ${DB_USER} -d ${DB_NAME} -c '\dt'"
echo "  View users: psql -U ${DB_USER} -d ${DB_NAME} -c 'SELECT * FROM users;'"
echo ""
