#!/bin/bash

# Smoke test using curl commands
# Usage: npm run smoke:curl

set -e  # Exit on any error

BASE_URL="${SMOKE_TEST_URL:-http://localhost:5000}"
TEST_EMAIL="${SMOKE_TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${SMOKE_TEST_PASSWORD:-password123}"
COOKIE_FILE="/tmp/smoke_test_cookies.txt"

echo "🚀 Starting API Smoke Tests with curl"
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo "---"

# Clean up cookie file
rm -f "$COOKIE_FILE"

# Test 1: Health Check
echo "🧪 Test 1: Health Check"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Health check passed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

# Test 2: Unauthenticated /me (should return 401)
echo -e "\n🧪 Test 2: Unauthenticated /me"
ME_UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/auth/me")
ME_UNAUTH_CODE=$(echo "$ME_UNAUTH_RESPONSE" | tail -n1)

if [ "$ME_UNAUTH_CODE" -eq 401 ]; then
    echo "✅ Unauthenticated /me correctly returned 401"
else
    echo "❌ Unauthenticated /me should return 401, got $ME_UNAUTH_CODE"
    exit 1
fi

# Test 3: Login
echo -e "\n🧪 Test 3: Login"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c "$COOKIE_FILE")

LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$LOGIN_CODE" -eq 200 ]; then
    echo "✅ Login successful (HTTP $LOGIN_CODE)"
    echo "Response: $LOGIN_BODY"
    
    # Check if cookie was set
    if [ -f "$COOKIE_FILE" ] && [ -s "$COOKIE_FILE" ]; then
        echo "✅ Cookie file created and contains data"
    else
        echo "❌ No cookie file or empty cookie file"
        exit 1
    fi
else
    echo "❌ Login failed (HTTP $LOGIN_CODE)"
    echo "Response: $LOGIN_BODY"
    echo "Attempting to create test user..."
    
    # Try to create test user
    SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST "$BASE_URL/api/auth/signup" \
        -H "Content-Type: application/json" \
        -d "{\"firstName\":\"Smoke\",\"lastName\":\"Test\",\"email\":\"$TEST_EMAIL\",\"phone\":\"1234567890\",\"password\":\"$TEST_PASSWORD\",\"aadharNumber\":\"123456789012\"}")
    
    SIGNUP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
    if [ "$SIGNUP_CODE" -eq 201 ]; then
        echo "✅ Test user created, retrying login..."
        
        # Retry login
        LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST "$BASE_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
            -c "$COOKIE_FILE")
        
        LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
        if [ "$LOGIN_CODE" -eq 200 ]; then
            echo "✅ Login successful after user creation"
        else
            echo "❌ Login still failed after user creation"
            exit 1
        fi
    else
        echo "❌ Failed to create test user"
        exit 1
    fi
fi

# Test 4: Authenticated /me
echo -e "\n🧪 Test 4: Authenticated /me"
ME_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X GET "$BASE_URL/api/auth/me" \
    -b "$COOKIE_FILE")

ME_AUTH_CODE=$(echo "$ME_AUTH_RESPONSE" | tail -n1)
ME_AUTH_BODY=$(echo "$ME_AUTH_RESPONSE" | head -n -1)

if [ "$ME_AUTH_CODE" -eq 200 ]; then
    echo "✅ Authenticated /me successful (HTTP $ME_AUTH_CODE)"
    echo "Response: $ME_AUTH_BODY"
else
    echo "❌ Authenticated /me failed (HTTP $ME_AUTH_CODE)"
    echo "Response: $ME_AUTH_BODY"
    exit 1
fi

# Test 5: Protected Endpoint
echo -e "\n🧪 Test 5: Protected Endpoint (/api/user/dashboard)"
DASHBOARD_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X GET "$BASE_URL/api/user/dashboard" \
    -b "$COOKIE_FILE")

DASHBOARD_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n1)
DASHBOARD_BODY=$(echo "$DASHBOARD_RESPONSE" | head -n -1)

if [ "$DASHBOARD_CODE" -eq 200 ]; then
    echo "✅ Protected endpoint access successful (HTTP $DASHBOARD_CODE)"
    echo "Response: $DASHBOARD_BODY"
else
    echo "❌ Protected endpoint access failed (HTTP $DASHBOARD_CODE)"
    echo "Response: $DASHBOARD_BODY"
    exit 1
fi

# Test 6: Logout
echo -e "\n🧪 Test 6: Logout"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/api/auth/logout" \
    -b "$COOKIE_FILE")

LOGOUT_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
LOGOUT_BODY=$(echo "$LOGOUT_RESPONSE" | head -n -1)

if [ "$LOGOUT_CODE" -eq 200 ]; then
    echo "✅ Logout successful (HTTP $LOGOUT_CODE)"
    echo "Response: $LOGOUT_BODY"
else
    echo "❌ Logout failed (HTTP $LOGOUT_CODE)"
    echo "Response: $LOGOUT_BODY"
    exit 1
fi

# Clean up
rm -f "$COOKIE_FILE"

echo -e "\n🎉 All smoke tests passed!"
echo "✅ Health Check"
echo "✅ Unauthenticated /me (401)"
echo "✅ Login Flow"
echo "✅ Authenticated /me"
echo "✅ Protected Endpoint"
echo "✅ Logout"
