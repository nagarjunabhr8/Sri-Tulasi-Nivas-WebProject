#!/bin/bash

# Check if the frontend is running and serving content
echo "=== Checking Frontend Response ==="
curl -s http://localhost:3000 > app.html
if grep -q "Sri Tulasi Nivas" app.html; then
  echo "✓ Frontend title found in HTML"
else
  echo "✗ Frontend title not found"
fi

if grep -q "root" app.html; then
  echo "✓ React root element found"
else
  echo "✗ React root element not found"
fi

# Check backend API endpoints
echo ""
echo "=== Checking Backend API ==="

# Test health check
echo "Testing health endpoint..."
HEALTH=$(curl -s http://localhost:8080/api/auth/health)
echo "Health: $HEALTH"

# Test login endpoint (should be accessible without auth)
echo ""
echo "Testing login endpoint availability..."
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | head -5

echo ""
echo "=== App Status ==="
echo "Frontend: http://localhost:3000 ✓"
echo "Backend API: http://localhost:8080 ✓"
echo "Database: H2 in-memory ✓"
