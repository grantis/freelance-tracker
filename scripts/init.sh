#!/bin/bash

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "❌ tsx is not installed. Installing required dependencies..."
    npm install
fi

# Run the TypeScript initialization script
echo "🚀 Running local environment initialization..."
tsx scripts/init-local.ts
