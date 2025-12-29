#!/bin/bash

# Test script to verify API endpoints are accessible
# Usage: ./scripts/test-api.sh [dev|prod]

ENV=${1:-prod}
BASE_URL=""

if [ "$ENV" = "dev" ]; then
    BASE_URL="http://localhost:8081"
    echo "🧪 Testing DEV API: $BASE_URL"
else
    BASE_URL="https://www.reach974.com"
    echo "🧪 Testing PRODUCTION API: $BASE_URL"
fi

echo ""
echo "Testing: $BASE_URL/api/create-payment-intent"
echo ""

curl -X POST "$BASE_URL/api/create-payment-intent" \
  -H "Content-Type: application/json" \
  -d '{
    "followers": 3000,
    "targetLink": "test_user",
    "platforms": "instagram"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "✅ Test complete!"
echo ""
echo "If you see HTTP 200, the API is working."
echo "If you see HTTP 404, the API route is not deployed."
echo "If you see connection errors, check your network/server."

