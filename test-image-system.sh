#!/bin/bash

API_URL="http://localhost:5000/api"

echo "================================"
echo "Image & Testimonial System Tests"
echo "================================"

# Test 1: Admin login
echo ""
echo "→ Test 1: Admin Login"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eventforge.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."

# Test 2: Client login
echo ""
echo "→ Test 2: Client Login/Register"
CLIENT_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testclient@example.com",
    "password": "test123"
  }')

CLIENT_TOKEN=$(echo $CLIENT_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$CLIENT_TOKEN" ]; then
  echo "Creating new client..."
  CLIENT_REG=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Client",
      "email": "testclient@example.com",
      "password": "test123",
      "role": "client"
    }')
  CLIENT_TOKEN=$(echo $CLIENT_REG | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi
echo "Client Token: ${CLIENT_TOKEN:0:20}..."

# Test 3: Get web images (public)
echo ""
echo "→ Test 3: Get Web Images (Public)"
curl -s -X GET "$API_URL/public/images" | jq '.' | head -20

# Test 4: Get testimonials landing view
echo ""
echo "→ Test 4: Get Testimonials (Landing View)"
curl -s -X GET "$API_URL/public/testimonials?landing=true" | jq '.' | head -20

# Test 5: Client submit feedback
echo ""
echo "→ Test 5: Client Submit Feedback"
curl -s -X POST "$API_URL/client/feedback" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "message": "Excellent platform for event planning!"
  }' | jq '.'

# Test 6: Get pending testimonials (admin)
echo ""
echo "→ Test 6: Get Pending Testimonials (Admin)"
curl -s -X GET "$API_URL/admin/testimonials/pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

# Test 7: Get event gallery (public)
echo ""
echo "→ Test 7: Get Event Gallery (Public)"
curl -s -X GET "$API_URL/public/event-images" | jq '.' | head -20

# Test 8: Get admin event images list
echo ""
echo "→ Test 8: List Admin Event Images"
curl -s -X GET "$API_URL/admin/event-images" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.' | head -30

echo ""
echo "================================"
echo "Tests Complete!"
echo "================================"
