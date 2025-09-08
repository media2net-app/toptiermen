#!/bin/bash

echo "🚀 Creating 5 test users..."

# Generate unique timestamp
TIMESTAMP=$(date +%s)

# Array of test users
declare -a users=(
    "testuser001${TIMESTAMP}@test.com:TestUser123!:Test User 001"
    "testuser002${TIMESTAMP}@test.com:TestUser123!:Test User 002"
    "testuser003${TIMESTAMP}@test.com:TestUser123!:Test User 003"
    "testuser004${TIMESTAMP}@test.com:TestUser123!:Test User 004"
    "testuser005${TIMESTAMP}@test.com:TestUser123!:Test User 005"
)

echo "📧 Test User Credentials:"
echo "========================"

for i in "${!users[@]}"; do
    IFS=':' read -r email password fullName <<< "${users[$i]}"
    
    echo "Creating user $((i+1)): $fullName"
    
    # Create user via API
    response=$(curl -s -X POST https://platform.toptiermen.eu/api/admin/create-test-user \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"fullName\": \"$fullName\"
        }")
    
    # Check if successful
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User $((i+1)) created successfully"
        echo "   Email: $email"
        echo "   Password: $password"
        echo "   Name: $fullName"
    else
        echo "❌ Failed to create user $((i+1))"
        echo "   Response: $response"
    fi
    
    echo ""
done

echo "🌐 Login URL: https://platform.toptiermen.eu/login"
echo "📱 Dashboard URL: https://platform.toptiermen.eu/dashboard"
