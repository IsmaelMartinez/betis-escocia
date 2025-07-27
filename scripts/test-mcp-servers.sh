#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
  echo "Environment variables loaded from .env.local"
else
  echo "Error: .env.local not found. Please create it with CLERK_SECRET_KEY and FLAGSMITH_ENVIRONMENT_ID."
  exit 1
fi

# Ensure MCP servers are running before testing
# You should start them manually or via VSCode tasks before running this script.

echo "\n--- Testing Clerk MCP Server (getUser tool) ---"
curl -X POST -H "Content-Type: application/json" -d '{"toolName": "getUser", "params": {"userId": "user_2g000000000000000000000"}}' http://localhost:3001/mcp

echo "\n--- Testing Flagsmith MCP Server (getFlag tool) ---"
curl -X POST -H "Content-Type: application/json" -d '{"toolName": "getFlag", "params": {"flagName": "dummy-feature-flag"}}' http://localhost:3002/mcp

echo "\n"

